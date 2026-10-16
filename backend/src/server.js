import "dotenv/config";

import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import { z, ZodError } from "zod";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "9mb" }));

app.use(
  "/api",
  rateLimit({
    windowMs: 60000,
    limit: 90,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);

// MYSQL DATABASE

const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cropcare",
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
});

const secret = process.env.JWT_SECRET;

function tokenFor(u) {
  if (!secret || secret.length < 32) {
    throw Error("Configure JWT_SECRET with at least 32 characters");
  }

  return jwt.sign({ sub: String(u.id), role: u.role }, secret, {
    expiresIn: "3d",
  });
}

function guard(req, res, next) {
  try {
    const raw = req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!raw || !secret) throw Error();

    const p = jwt.verify(raw, secret);

    req.auth = {
      id: Number(p.sub),
      role: p.role,
    };

    next();
  } catch {
    res.status(401).json({ error: "Login required" });
  }
}

const wrap = (f) => (req, res, next) =>
  Promise.resolve(f(req, res, next)).catch(next);

const obj = z.object;

// DATABASE HEALTH CHECK

app.get(
  "/api/health",
  wrap(async (req, res) => {
    await db.query("SELECT 1");

    res.json({
      ok: true,
      database: "connected",
    });
  }),
);

// REGISTER FARMER

app.post(
  "/api/auth/register",
  wrap(async (req, res) => {
    const a = obj({
      name: z.string().trim().min(2).max(120),
      email: z.string().email().max(190),
      password: z.string().min(8).max(120),
      district: z.string().max(100).optional(),
    }).parse(req.body);

    const hash = await bcrypt.hash(a.password, 12);

    try {
      const [r] = await db.execute(
        `INSERT INTO users
         (full_name,email,password_hash,role,district)
         VALUES (?,?,?,'farmer',?)`,
        [a.name, a.email.toLowerCase(), hash, a.district || null],
      );

      const u = {
        id: r.insertId,
        name: a.name,
        email: a.email.toLowerCase(),
        role: "farmer",
      };

      res.status(201).json({
        user: u,
        token: tokenFor(u),
      });
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          error: "Email already registered",
        });
      }

      throw e;
    }
  }),
);

// LOGIN

app.post(
  "/api/auth/login",
  wrap(async (req, res) => {
    const a = obj({
      email: z.string().email(),
      password: z.string(),
    }).parse(req.body);

    const [[u]] = await db.execute(
      `SELECT id,full_name,email,password_hash,role
       FROM users WHERE email=?`,
      [a.email.toLowerCase()],
    );

    if (!u || !(await bcrypt.compare(a.password, u.password_hash))) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = {
      id: u.id,
      name: u.full_name,
      email: u.email,
      role: u.role,
    };

    res.json({
      user,
      token: tokenFor(user),
    });
  }),
);

// USER PROFILE

app.get(
  "/api/me",
  guard,
  wrap(async (req, res) => {
    const [[u]] = await db.execute(
      `SELECT id,full_name AS name,email,role,district,preferred_language
       FROM users WHERE id=?`,
      [req.auth.id],
    );

    if (!u) {
      return res.status(404).json({
        error: "Account not found",
      });
    }

    res.json(u);
  }),
);

// Persist language preferences in MySQL, not just a visual toggle.
app.patch(
  "/api/me/language",
  guard,
  wrap(async (req, res) => {
    const { language } = z
      .object({ language: z.enum(["en", "si", "ta"]) })
      .parse(req.body);
    await db.execute("UPDATE users SET preferred_language=? WHERE id=?", [
      language,
      req.auth.id,
    ]);
    res.json({ ok: true, preferred_language: language });
  }),
);

// PLANT IMAGE VALIDATION

const imageSchema = obj({
  crop: z.string().trim().min(2).max(70).optional().default("Unspecified"),
  imageBase64: z.string().min(100).max(8500000),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

// GROQ ERROR HANDLING

function upstreamError(message, status, detail) {
  const error = new Error(message);

  error.code = "GROQ_UPSTREAM_ERROR";
  error.upstreamStatus = status;

  console.error("[Groq]", {
    status,
    detail: String(detail || "").slice(0, 1000),
  });

  return error;
}

// GROQ VISION PLANT DISEASE SCREENING

async function assessLeaf(a) {
  const key = process.env.GROQ_API_KEY?.trim();

  const model = process.env.GROQ_MODEL?.trim() || "qwen/qwen3.6-27b";

  if (!key) {
    const err = new Error(
      "AI is not configured. Set GROQ_API_KEY in backend/.env and restart the API.",
    );
    err.status = 503;
    throw err;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    let response;

    try {
      response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          signal: controller.signal,

          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            model,
            max_completion_tokens: 900,
            temperature: 0.2,
            response_format: { type: "json_object" },

            messages: [
              {
                role: "system",

                content:
                  "You are an agricultural photo-screening assistant, not a certified diagnostician. Return ONLY JSON with keys disease, confidence, symptoms, recommendations. disease is a possible disease name or Uncertain; confidence is a number from 0 to 1 or null and is only an uncalibrated AI estimate; symptoms and recommendations are arrays of short strings. Do not invent what is not visible. If unsure use Uncertain and null. Never prescribe pesticide dosages.",
              },

              {
                role: "user",

                content: [
                  {
                    type: "text",

                    text: `Examine this plant or leaf photo. Identify the likely crop if possible. The optional crop hint is: ${a.crop}. Inspect only visible symptoms, provide a possible disease name (or Uncertain) and cautious, practical steps. Respond strictly as JSON.`,
                  },

                  {
                    type: "image_url",

                    image_url: {
                      url: `data:${a.mimeType};base64,${a.imageBase64}`,
                    },
                  },
                ],
              },
            ],
          }),
        },
      );
    } catch (e) {
      if (e?.name === "AbortError") {
        throw upstreamError(
          "Groq request timed out",
          504,
          "Timeout after 45 seconds",
        );
      }

      throw upstreamError("Groq network request failed", 502, e?.message);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "Unable to read response");

      throw upstreamError("Groq returned an error", response.status, body);
    }

    const data = await response.json();

    const raw = data?.choices?.[0]?.message?.content;

    const content =
      typeof raw === "string"
        ? raw
        : Array.isArray(raw)
          ? raw
              .filter((x) => x?.type === "text")
              .map((x) => x.text)
              .join("\n")
          : "";

    const matched = content.match(/\{[\s\S]*\}/);

    if (!matched) {
      throw upstreamError(
        "Groq did not return JSON",
        502,
        "Missing JSON object in response",
      );
    }

    let result;

    try {
      result = JSON.parse(matched[0]);

      result = z
        .object({
          disease: z.string().min(1).max(160),
          confidence: z.number().min(0).max(1).nullable(),
          symptoms: z.array(z.string()).max(8),
          recommendations: z.array(z.string()).max(8),
        })
        .parse(result);
    } catch (e) {
      throw upstreamError(
        "Groq returned an invalid analysis format",
        502,
        e?.message,
      );
    }

    return {
      ...result,
      model,
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ANALYZE AND SAVE DIAGNOSIS

app.post(
  "/api/diagnoses/analyze",
  guard,
  wrap(async (req, res) => {
    const a = imageSchema.parse(req.body);

    const r = await assessLeaf(a);

    const [dbResult] = await db.execute(
      `INSERT INTO diagnoses
       (user_id,crop,disease,confidence,symptoms,
        recommendations,image_data,model_name)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        req.auth.id,
        a.crop,
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
      crop: a.crop,
      ...r,
      status: "pending",
    });
  }),
);

// Translate an existing diagnosis without creating a duplicate diagnosis record.
app.post(
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

app.get(
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

app.get(
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

app.patch(
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

app.delete(
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

// SUBMIT EXPERT CASE

app.post(
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
      notes: z.string().max(3000).default(""),
      location: z.string().min(2).max(190),
      office: z.string().max(190).default(""),
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

app.get(
  "/api/cases",
  guard,
  wrap(async (req, res) => {
    if (req.auth.role === "researcher")
      return res
        .status(403)
        .json({ error: "Research accounts access aggregate analytics only" });
    const officer = ["officer", "admin"].includes(req.auth.role);

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
       ${officer ? "WHERE c.archived=0" : "WHERE c.farmer_id=? AND c.archived=0"}
       ORDER BY
       FIELD(c.status,'submitted','reviewing','reviewed'),
       c.id DESC LIMIT 100`,
      officer ? [] : [req.auth.id],
    );

    res.json(rows);
  }),
);

// OFFICER REVIEWS

app.patch(
  "/api/cases/:id/review",
  guard,
  wrap(async (req, res) => {
    if (!["officer", "admin"].includes(req.auth.role)) {
      return res.status(403).json({
        error: "Officer access required",
      });
    }

    const a = obj({
      confirmedDisease: z.string().min(2).max(160),
      treatment: z.string().min(5).max(4000),
      instructions: z.string().min(5).max(4000),
    }).parse(req.body);

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const [[c]] = await conn.execute(
        `SELECT id FROM expert_cases
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

// Officer case archive is reversible and keeps records for auditing.
app.patch(
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

// AGRICULTURAL ANALYTICS

app.get(
  "/api/analytics",
  guard,
  wrap(async (req, res) => {
    if (!["officer", "admin", "researcher"].includes(req.auth.role)) {
      return res.status(403).json({ error: "Analytics access required" });
    }

    const [[totals]] = await db.query(
      `SELECT
       (SELECT COUNT(*) FROM diagnoses) total_scans,
       (SELECT COUNT(*) FROM expert_cases) cases,
       (SELECT COUNT(*) FROM expert_cases
        WHERE urgency='high') high_risk`,
    );

    const [diseases] = await db.query(
      `SELECT disease,COUNT(*) count
       FROM diagnoses
       GROUP BY disease
       ORDER BY count DESC LIMIT 5`,
    );

    res.json({
      ...totals,
      diseases,
    });
  }),
);

// GLOBAL ERROR HANDLER

app.use((err, req, res, next) => {
  if (err.status === 503) return res.status(503).json({ error: err.message });
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Invalid input",
      details: err.flatten(),
    });
  }

  if (err.code === "GROQ_UPSTREAM_ERROR") {
    return res.status(502).json({
      error:
        "Groq analysis failed. Check the backend terminal and verify GROQ_API_KEY, GROQ_MODEL, model access and image size.",
      upstreamStatus: err.upstreamStatus,
    });
  }

  console.error("[API]", err.code || "UNHANDLED", err.message);

  if (["ER_NO_SUCH_TABLE", "ER_BAD_DB_ERROR"].includes(err.code)) {
    return res.status(503).json({
      error: "Database not initialized. Run sql/schema.sql",
    });
  }

  res.status(500).json({
    error: "Server request failed",
  });
});

// START SERVER

const port = Number(process.env.PORT || 4000);

if (process.env.NODE_ENV !== "test") {
  app.listen("0.0.0.0" === "" ? port : port, "0.0.0.0", () => {
    console.log(`CropCare API http://localhost:${port}`);
  });
}

export { app };
