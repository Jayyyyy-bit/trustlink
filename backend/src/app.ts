// src/app.ts
// The Express app itself. No routes are mounted yet — schema, connection, migration
// runner, and the ledger module come first; routes get added once the API surface
// is designed.

import express, { type Express } from 'express';

export function createApp(): Express {
  const app = express();
  app.use(express.json());
  return app;
}
