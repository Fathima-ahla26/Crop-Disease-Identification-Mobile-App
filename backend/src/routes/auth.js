import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../config/database.js';
import { guard, tokenFor } from '../middleware/auth.js';
import { wrap } from '../middleware/async-handler.js';
const obj = z.object;

const router = Router();

// REGISTER FARMER

router.post(
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

router.post(
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

router.get(
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
router.patch(
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

export default router;
