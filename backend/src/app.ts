// src/app.ts
// The Express app itself.

import express, { type Express } from 'express';
import { authRouter } from './routes/auth';

export function createApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRouter);
  return app;
}
