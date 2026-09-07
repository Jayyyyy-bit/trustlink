// src/app.ts
// The Express app itself.

import cors from 'cors';
import express, { type Express } from 'express';
import { authRouter } from './routes/auth';

export function createApp(): Express {
  const app = express();
  // The frontend (Expo web) runs on its own origin in dev and calls this API directly —
  // no cookies are involved (auth is a Bearer token), so a permissive origin is safe here.
  app.use(cors());
  app.use(express.json());
  app.use('/auth', authRouter);
  return app;
}
