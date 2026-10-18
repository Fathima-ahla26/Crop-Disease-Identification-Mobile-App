import 'dotenv/config';
import jwt from 'jsonwebtoken';

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

export { guard, tokenFor };
