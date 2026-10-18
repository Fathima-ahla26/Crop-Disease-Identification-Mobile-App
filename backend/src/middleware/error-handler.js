import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
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
      error: "Database not initialized. Run npm run db:init from the backend folder.",
    });
  }

  res.status(500).json({
    error: "Server request failed",
  });
}
