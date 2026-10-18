import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { guard } from '../middleware/auth.js';
import { wrap } from '../middleware/async-handler.js';
import { assessLeaf } from '../services/plant-analysis.js';
import { imageSchema } from '../validation/image.js';
const obj = z.object;

const router = Router();

// SUBMIT EXPERT CASE

router.post(
  "/api/cases",
  guard,
  wrap(async (req, res) => {
    if (req.auth.role !== "farmer") {
      return res.status(403).json({
        error: "Farmers only",
      });
    }

    const a = obj({
      diagnosisId: z.number().int().positive(),
      notes: z.string().trim().max(3000).refine(value => !value || /\p{L}/u.test(value), "Describe the symptoms using words").default(""),
      location: z.string().trim().min(2).max(190).regex(/\p{L}/u, "Include a village or location name"),
      office: z.string().trim().max(190).refine(value => !value || (value.length >= 2 && /\p{L}/u.test(value)), "Enter a valid office name").default(""),
      urgency: z.enum(["low", "moderate", "high"]).default("moderate"),
    }).parse(req.body);

    const [[d]] = await db.execute(
      `SELECT id FROM diagnoses
       WHERE id=? AND user_id=?`,
      [a.diagnosisId, req.auth.id],
    );

    if (!d) {
      return res.status(404).json({
        error: "Diagnosis not found",
      });
    }

    const [r] = await db.execute(
      `INSERT INTO expert_cases
       (diagnosis_id,farmer_id,notes,location,office,urgency)
       VALUES (?,?,?,?,?,?)`,
      [a.diagnosisId, req.auth.id, a.notes, a.location, a.office, a.urgency],
    );

    res.status(201).json({
      id: r.insertId,
      status: "submitted",
    });
  }),
);

// GET EXPERT CASES

router.get(
  "/api/cases",
  guard,
  wrap(async (req, res) => {
    if (req.auth.role === "researcher")
      return res
        .status(403)
        .json({ error: "Research accounts access aggregate analytics only" });
    const officer = ["officer", "admin"].includes(req.auth.role);
    const history = req.query.view === "reviewed";

    const [rows] = await db.execute(
      `SELECT
       c.*,
       d.crop,
       d.disease,
       d.confidence,
       u.full_name farmer_name,
       r.confirmed_disease,
       r.treatment,
       r.instructions
       FROM expert_cases c
       JOIN diagnoses d ON d.id=c.diagnosis_id
       JOIN users u ON u.id=c.farmer_id
       LEFT JOIN expert_reviews r ON r.case_id=c.id
       WHERE ${officer ? "1=1" : "c.farmer_id=?"}
       AND ${history ? "r.id IS NOT NULL" : "c.archived=0"}
       ORDER BY
       ${history ? "r.created_at DESC," : "FIELD(c.status,'submitted','reviewing','reviewed'),"}
       c.id DESC ${history ? "" : "LIMIT 100"}`,
      officer ? [] : [req.auth.id],
    );

    res.json(rows);
  }),
);

// Load the complete evidence for one case without downloading every case photo.
router.get("/api/cases/:id", guard, wrap(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const officer = ["officer", "admin"].includes(req.auth.role);
  if (!officer && req.auth.role !== "farmer")
    return res.status(403).json({ error: "Case access required" });
  const [[record]] = await db.execute(
    `SELECT c.*, d.crop, d.disease, d.confidence, d.image_data,
      d.symptoms, d.recommendations, u.full_name farmer_name,
      r.confirmed_disease, r.treatment, r.instructions,
      reviewer.full_name officer_name
     FROM expert_cases c
     JOIN diagnoses d ON d.id=c.diagnosis_id
     JOIN users u ON u.id=c.farmer_id
     LEFT JOIN expert_reviews r ON r.case_id=c.id
     LEFT JOIN users reviewer ON reviewer.id=r.officer_id
     WHERE c.id=? ${officer ? "" : "AND c.farmer_id=?"}`,
    officer ? [id] : [id, req.auth.id],
  );
  if (!record) return res.status(404).json({ error: "Case not found" });
  if (officer) {
    const [[assessment]] = await db.execute('SELECT result FROM case_assessments WHERE case_id=?', [id]);
    record.assessment = assessment ? (typeof assessment.result === 'string' ? JSON.parse(assessment.result) : assessment.result) : null;
  }
  res.json(record);
}));

// An officer can obtain a second AI assessment of the saved photo.
// This does not alter the original diagnosis or the officer's review.
router.post("/api/cases/:id/reanalyze", guard, wrap(async (req, res) => {
  if (!["officer", "admin"].includes(req.auth.role))
    return res.status(403).json({ error: "Officer access required" });
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const hints = z.object({crop:z.string().trim().min(2).max(70).optional()}).parse(req.body || {});
  const [[record]] = await db.execute(
    `SELECT d.crop, d.image_data FROM expert_cases c
     JOIN diagnoses d ON d.id=c.diagnosis_id WHERE c.id=?`, [id],
  );
  if (!record) return res.status(404).json({ error: "Case not found" });
  const photo = record.image_data?.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/);
  if (!photo) return res.status(422).json({ error: "This case has no supported saved photo to analyze." });
  const input = imageSchema.parse({crop:hints.crop || record.crop, mimeType:photo[1], imageBase64:photo[2].replace(/\s/g, "")});
  const result = await assessLeaf(input);
  const assessment = {...result, analyzed_at:new Date().toISOString()};
  await db.execute(`INSERT INTO case_assessments (case_id,result) VALUES (?,?)
    ON DUPLICATE KEY UPDATE result=VALUES(result)`, [id, JSON.stringify(assessment)]);
  res.json(assessment);
}));

// OFFICER REVIEWS

router.patch(
  "/api/cases/:id/review",
  guard,
  wrap(async (req, res) => {
    if (!["officer", "admin"].includes(req.auth.role)) {
      return res.status(403).json({
        error: "Officer access required",
      });
    }

    const a = obj({
      confirmedDisease: z.string().trim().min(2).max(160),
      crop: z.string().trim().min(2).max(70).optional(),
      treatment: z.string().trim().min(5).max(4000),
      instructions: z.string().trim().min(5).max(4000),
    }).parse(req.body);

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const [[c]] = await conn.execute(
        `SELECT id, diagnosis_id FROM expert_cases
         WHERE id=? FOR UPDATE`,
        [req.params.id],
      );

      if (!c) {
        await conn.rollback();

        return res.status(404).json({
          error: "Case not found",
        });
      }

      await conn.execute(
        `INSERT INTO expert_reviews
         (case_id,officer_id,confirmed_disease,treatment,instructions)
         VALUES (?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
         officer_id=VALUES(officer_id),
         confirmed_disease=VALUES(confirmed_disease),
         treatment=VALUES(treatment),
         instructions=VALUES(instructions)`,
        [c.id, req.auth.id, a.confirmedDisease, a.treatment, a.instructions],
      );

      await conn.execute(
        `UPDATE expert_cases
         SET status='reviewed',officer_id=?
         WHERE id=?`,
        [req.auth.id, c.id],
      );

      if (a.crop) {
        await conn.execute('UPDATE diagnoses SET crop=? WHERE id=?', [a.crop, c.diagnosis_id]);
      }

      await conn.commit();

      res.json({ ok: true });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }),
);

// Remove only feedback; preserve the farmer's submitted case and scan.
router.delete("/api/cases/:id/review", guard, wrap(async (req, res) => {
  if (!["officer", "admin"].includes(req.auth.role))
    return res.status(403).json({ error: "Officer access required" });
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[record]] = await conn.execute("SELECT id FROM expert_cases WHERE id=? FOR UPDATE", [id]);
    if (!record) {
      await conn.rollback();
      return res.status(404).json({ error: "Case not found" });
    }
    const [deleted] = await conn.execute("DELETE FROM expert_reviews WHERE case_id=?", [id]);
    if (!deleted.affectedRows) {
      await conn.rollback();
      return res.status(404).json({ error: "Feedback already removed. Reopen the case to refresh." });
    }
    await conn.execute("UPDATE expert_cases SET status='submitted',officer_id=NULL WHERE id=?", [id]);
    await conn.commit();
    res.json({ ok: true, status: "submitted" });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

// Farmers can manage their own case details. Changed details need a fresh review.
router.patch('/api/cases/:id', guard, wrap(async (req, res) => {
  if (req.auth.role !== 'farmer') return res.status(403).json({error:'Farmers only'});
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const a = obj({
    notes: z.string().trim().max(3000).refine(value => !value || /\p{L}/u.test(value), 'Describe the symptoms using words'),
    location: z.string().trim().min(2).max(190).regex(/\p{L}/u, 'Include a village or location name'),
    office: z.string().trim().max(190).refine(value => !value || (value.length >= 2 && /\p{L}/u.test(value)), 'Enter a valid office name'),
    urgency: z.enum(['low','moderate','high']),
  }).parse(req.body);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[record]] = await conn.execute('SELECT id,notes,location,office,urgency FROM expert_cases WHERE id=? AND farmer_id=? FOR UPDATE',[id,req.auth.id]);
    if (!record) { await conn.rollback(); return res.status(404).json({error:'Case not found'}); }
    const changed = ['notes','location','office','urgency'].some(key => (record[key] || '') !== a[key]);
    if (changed) {
      await conn.execute('DELETE FROM expert_reviews WHERE case_id=?',[id]);
      await conn.execute("UPDATE expert_cases SET notes=?,location=?,office=?,urgency=?,status='submitted',officer_id=NULL,archived=0 WHERE id=? AND farmer_id=?",[a.notes,a.location,a.office,a.urgency,id,req.auth.id]);
    }
    await conn.commit();
    res.json({ok:true});
  } catch (error) { await conn.rollback(); throw error; }
  finally { conn.release(); }
}));

router.delete('/api/cases/:id', guard, wrap(async (req,res) => {
  if (req.auth.role !== 'farmer') return res.status(403).json({error:'Farmers only'});
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const [result] = await db.execute('DELETE FROM expert_cases WHERE id=? AND farmer_id=?',[id,req.auth.id]);
  if (!result.affectedRows) return res.status(404).json({error:'Case not found'});
  res.json({ok:true});
}));

// Officer case archive is reversible and keeps records for auditing.
router.patch(
  "/api/cases/:id/archive",
  guard,
  wrap(async (req, res) => {
    if (!["officer", "admin"].includes(req.auth.role))
      return res.status(403).json({ error: "Officer access required" });
    const [result] = await db.execute(
      "UPDATE expert_cases SET archived=1 WHERE id=?",
      [req.params.id],
    );
    if (!result.affectedRows)
      return res.status(404).json({ error: "Case not found" });
    res.json({ ok: true });
  }),
);

export default router;
