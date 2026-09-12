// src/app.ts
// The Express app itself.

import cors from 'cors';
import express, { type Express } from 'express';
import { authRouter } from './routes/auth';
import { businessesRouter } from './routes/businesses';
import { requirementsRouter } from './routes/requirements';
import { quotationsRouter } from './routes/quotations';

export function createApp(): Express {
  const app = express();
  // The frontend (Expo web) runs on its own origin in dev and calls this API directly —
  // no cookies are involved (auth is a Bearer token), so a permissive origin is safe here.
  app.use(cors());
  app.use(express.json());
  app.use('/auth', authRouter);
  // Every route mounted below applies `authenticate` (and, where noted, `requireVerifiedBusiness`)
  // itself, per-route, in src/routes/*.ts.
  app.use('/businesses', businessesRouter);
  app.use('/requirements', requirementsRouter);
  app.use('/quotations', quotationsRouter);
  return app;
}
