import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { guard } from '../middleware/auth.js';
import { wrap } from '../middleware/async-handler.js';

const router = Router();

// AGRICULTURAL ANALYTICS

router.get('/api/analytics/records', guard, wrap(async (req, res) => {
  if (!['officer', 'admin'].includes(req.auth.role))
    return res.status(403).json({ error: 'Officer access required' });
  const kind = z.enum(['scans', 'cases', 'high', 'reviewed', 'pending']).parse(req.query.kind);
  const days = z.coerce.number().refine(n => [0, 7, 30, 90].includes(n)).parse(req.query.days ?? 0);
  const since = days ? new Date(Date.now() - days * 86400000) : new Date(0);
  if (kind === 'scans') {
    const [rows] = await db.query(`SELECT d.id, d.crop, d.disease, d.status,
      d.created_at, u.full_name farmer_name FROM diagnoses d
      JOIN users u ON u.id=d.user_id WHERE d.created_at >= ? ORDER BY d.created_at DESC, d.id DESC`, [since]);
    return res.json(rows);
  }
  const [rows] = await db.query(`SELECT c.id, d.crop, d.disease, c.status,
    c.urgency, c.location, c.archived, c.created_at, u.full_name farmer_name,
    r.confirmed_disease FROM expert_cases c
    JOIN diagnoses d ON d.id=c.diagnosis_id JOIN users u ON u.id=c.farmer_id
    LEFT JOIN expert_reviews r ON r.case_id=c.id
    WHERE c.created_at >= ?
    ${kind === 'high' ? "AND c.urgency='high'" : kind === 'reviewed' ? "AND c.status='reviewed'" : kind === 'pending' ? "AND c.status<>'reviewed'" : ''}
    ORDER BY c.created_at DESC, c.id DESC`, [since]);
  res.json(rows);
}));

router.get(
  "/api/analytics",
  guard,
  wrap(async (req, res) => {
    if (!["officer", "admin", "researcher"].includes(req.auth.role)) {
      return res.status(403).json({ error: "Analytics access required" });
    }

    const days = req.query.days === undefined ? 0 : Number(req.query.days);
    if (![0, 7, 30, 90].includes(days)) {
      return res.status(400).json({ error: "Choose 7, 30, 90 days or all time" });
    }
    const since = days ? new Date(Date.now() - days * 86400000) : new Date(0);
    const [[totals]] = await db.query(
      `SELECT
       (SELECT COUNT(*) FROM diagnoses WHERE created_at >= ?) total_scans,
       (SELECT COUNT(*) FROM expert_cases WHERE created_at >= ?) cases,
       (SELECT COUNT(*) FROM expert_cases
        WHERE urgency='high' AND created_at >= ?) high_risk`,
      [since, since, since],
    );

    const [diseases] = await db.query(
      `SELECT disease,COUNT(*) count
       FROM diagnoses
       WHERE created_at >= ?
       GROUP BY disease
       ORDER BY count DESC, disease`,
      [since],
    );

    const [crops] = await db.query(
      `SELECT crop, COUNT(*) count FROM diagnoses WHERE created_at >= ?
       GROUP BY crop ORDER BY count DESC, crop`, [since],
    );
    const [districts] = await db.query(
      `SELECT COALESCE(NULLIF(TRIM(u.district), ''), 'Not recorded') district,
       COUNT(*) count FROM diagnoses d JOIN users u ON u.id=d.user_id
       WHERE d.created_at >= ? GROUP BY district ORDER BY count DESC, district`, [since],
    );
    const [statuses] = await db.query(
      `SELECT status, COUNT(*) count FROM expert_cases WHERE created_at >= ?
       GROUP BY status`, [since],
    );

    res.json({
      ...totals,
      diseases,
      crops,
      districts,
      statuses,
      generated_at: new Date().toISOString(),
    });
  }),
);

export default router;
