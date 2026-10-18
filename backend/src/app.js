import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import diagnosesRoutes from './routes/diagnoses.js';
import casesRoutes from './routes/cases.js';
import analyticsRoutes from './routes/analytics.js';
import { errorHandler } from './middleware/error-handler.js';

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

app.use(healthRoutes);
app.use(authRoutes);
app.use(diagnosesRoutes);
app.use(casesRoutes);
app.use(analyticsRoutes);
app.use(errorHandler);

export { app };
