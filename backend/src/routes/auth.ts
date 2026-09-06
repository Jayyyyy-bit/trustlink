// src/routes/auth.ts
// signup / login / refresh / logout. Signup only ever creates a bare account (no
// business, effectively UNVERIFIED) — a business is attached later, out of band,
// when onboarding is submitted.

import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { pool } from '../db/pool';
import { hashPassword, verifyPassword } from '../lib/passwords';
import { generateRefreshToken, hashRefreshToken, signAccessToken } from '../lib/tokens';

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface AccountRow {
  id: string;
  email: string;
  password_hash: string;
}

interface RefreshTokenRow {
  id: string;
  account_id: string;
  expires_at: Date;
  revoked_at: Date | null;
}

authRouter.post('/signup', async (req, res) => {
  const { email, password } = req.body as { email?: unknown; password?: unknown };

  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'A valid email is required' });
    return;
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { rows: existing } = await pool.query<{ id: string }>('SELECT id FROM accounts WHERE email = $1', [
    normalizedEmail,
  ]);
  if (existing.length > 0) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const id = randomUUID();

  await pool.query('INSERT INTO accounts (id, email, password_hash) VALUES ($1, $2, $3)', [
    id,
    normalizedEmail,
    passwordHash,
  ]);

  res.status(201).json({ id, email: normalizedEmail, businessStatus: 'UNVERIFIED' });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: unknown; password?: unknown };

  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { rows } = await pool.query<AccountRow>(
    'SELECT id, email, password_hash FROM accounts WHERE email = $1',
    [normalizedEmail],
  );
  const account = rows[0];

  if (!account) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const passwordMatches = await verifyPassword(password, account.password_hash);
  if (!passwordMatches) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const { token: accessToken, expiresIn } = signAccessToken(account.id);
  const { token: refreshToken, tokenHash, expiresAt } = generateRefreshToken();

  await pool.query(
    'INSERT INTO refresh_tokens (id, account_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
    [randomUUID(), account.id, tokenHash, expiresAt],
  );

  res.json({ accessToken, refreshToken, expiresIn });
});

authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: unknown };

  if (typeof refreshToken !== 'string' || !refreshToken) {
    res.status(400).json({ error: 'refreshToken is required' });
    return;
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const { rows } = await pool.query<RefreshTokenRow>(
    'SELECT id, account_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = $1',
    [tokenHash],
  );
  const row = rows[0];

  if (!row || row.revoked_at !== null || row.expires_at.getTime() <= Date.now()) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
    return;
  }

  const { token: accessToken, expiresIn } = signAccessToken(row.account_id);
  res.json({ accessToken, expiresIn });
});

authRouter.post('/logout', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: unknown };

  if (typeof refreshToken !== 'string' || !refreshToken) {
    res.status(400).json({ error: 'refreshToken is required' });
    return;
  }

  const tokenHash = hashRefreshToken(refreshToken);
  await pool.query(
    'UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL',
    [tokenHash],
  );

  res.status(204).send();
});
