import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { guard } from '../middleware/auth.js';
import { wrap } from '../middleware/async-handler.js';
import { assessLeaf } from '../services/plant-analysis.js';
import { imageSchema } from '../validation/image.js';
const obj = z.object;

const router = Router();

// ANALYZE AND SAVE DIAGNOSIS

router.post(
  "/api/diagnoses/analyze",
  guard,
  wrap(async (req, res) => {
    const a = imageSchema.parse(req.body);

    const r = await assessLeaf(a);
    const identifiedCrop = r.crop !== 'Unspecified' ? r.crop : a.crop;

    const [dbResult] = await db.execute(
      `INSERT INTO diagnoses
       (user_id,crop,disease,confidence,symptoms,
        recommendations,image_data,model_name)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        req.auth.id,
        identifiedCrop,
        r.disease,
        r.confidence,
        JSON.stringify(r.symptoms),
        JSON.stringify(r.recommendations),
        `data:${a.mimeType};base64,${a.imageBase64}`,
        r.model,
      ],
    );

    res.status(201).json({
      id: dbResult.insertId,
      ...r,
      crop: identifiedCrop,
      status: "pending",
    });
  }),
);

// Translate an existing diagnosis without creating a duplicate diagnosis record.
router.post(
  "/api/diagnoses/:id/translate",
  guard,
  wrap(async (req, res) => {
    const { language } = z
      .object({ language: z.enum(["en", "si"]) })
      .parse(req.body);
    const [[record]] = await db.execute(
      "SELECT crop,disease,symptoms,recommendations FROM diagnoses WHERE id=? AND user_id=?",
      [req.params.id, req.auth.id],
    );
    if (!record) return res.status(404).json({ error: "Diagnosis not found" });
    const list = (v) =>
      Array.isArray(v) ? v : typeof v === "string" ? JSON.parse(v) : [];
    const original = {
      disease: record.disease,
      symptoms: list(record.symptoms),
      recommendations: list(record.recommendations),
    };
    if (language === "en") return res.json(original);
    const key = process.env.GROQ_API_KEY?.trim();
    if (!key)
      return res.status(503).json({ error: "GROQ_API_KEY is not configured" });
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL?.trim() || "qwen/qwen3.8-27b",
          temperature: 0,
          max_completion_tokens: 1200,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "Translate this crop disease screening information into clear Sinhala. Preserve meaning, uncertainty, and all safety warnings. Do not invent treatments or diagnoses. Return ONLY JSON with disease (string), symptoms (array of strings), recommendations (array of strings).",
            },
            { role: "user", content: JSON.stringify(original) },
          ],
        }),
      },
    );
    if (!response.ok) {
      console.error(
        "[Groq translate]",
        response.status,
        (await response.text()).slice(0, 500),
      );
      return res
        .status(502)
        .json({ error: "Translation unavailable. Please try again." });
    }
    const body = await response.json();
    const content = body.choices?.[0]?.message?.content || "{}";
    let translated;
    try {
      translated = JSON.parse(content);
    } catch {
      return res.status(502).json({ error: "Unexpected translation response" });
    }
    const validated = z
      .object({
        disease: z.string(),
        symptoms: z.array(z.string()),
        recommendations: z.array(z.string()),
      })
      .safeParse(translated);
    if (!validated.success)
      return res.status(502).json({ error: "Invalid translation response" });
    res.json(validated.data);
  }),
);

// GET SAVED DIAGNOSES

router.get(
  "/api/diagnoses",
  guard,
  wrap(async (req, res) => {
    const [rows] = await db.execute(
      `SELECT id,crop,disease,confidence,status,created_at
       FROM diagnoses
       WHERE user_id=?
       ORDER BY id DESC LIMIT 100`,
      [req.auth.id],
    );

    res.json(rows);
  }),
);

// GET SINGLE DIAGNOSIS

router.get(
  "/api/diagnoses/:id",
  guard,
  wrap(async (req, res) => {
    const [[r]] = await db.execute(
      `SELECT * FROM diagnoses
       WHERE id=? AND user_id=?`,
      [req.params.id, req.auth.id],
    );

    if (!r) {
      return res.status(404).json({
        error: "Not found",
      });
    }

    res.json(r);
  }),
);

// UPDATE DIAGNOSIS STATUS

router.patch(
  "/api/diagnoses/:id",
  guard,
  wrap(async (req, res) => {
    const a = obj({
      status: z.enum(["pending", "resolved"]),
    }).parse(req.body);

    const [r] = await db.execute(
      `UPDATE diagnoses SET status=?
       WHERE id=? AND user_id=?`,
      [a.status, req.params.id, req.auth.id],
    );

    if (!r.affectedRows) {
      return res.status(404).json({
        error: "Not found",
      });
    }

    res.json({ ok: true });
  }),
);

// DELETE DIAGNOSIS

router.delete(
  "/api/diagnoses/:id",
  guard,
  wrap(async (req, res) => {
    const [r] = await db.execute(
      `DELETE FROM diagnoses
       WHERE id=? AND user_id=?`,
      [req.params.id, req.auth.id],
    );

    if (!r.affectedRows) {
      return res.status(404).json({
        error: "Not found",
      });
    }

    res.json({ ok: true });
  }),
);

export default router;
