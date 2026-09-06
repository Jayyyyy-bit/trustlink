// src/db/pool.ts
// Single shared pg Pool, built from DATABASE_URL. No ORM — every query in this codebase
// goes through this pool (or a client checked out from it) and is written by hand.

import 'dotenv/config';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Copy backend/.env.example to backend/.env and fill it in.');
}

export const pool = new Pool({ connectionString });
