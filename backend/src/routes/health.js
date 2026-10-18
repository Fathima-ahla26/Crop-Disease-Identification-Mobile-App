import { Router } from 'express';
import { db } from '../config/database.js';
import { wrap } from '../middleware/async-handler.js';

const router = Router();

// DATABASE HEALTH CHECK

router.get(
  "/api/health",
  wrap(async (req, res) => {
    await db.query("SELECT 1");

    res.json({
      ok: true,
      database: "connected",
    });
  }),
);

export default router;
