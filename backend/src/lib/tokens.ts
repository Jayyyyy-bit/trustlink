// src/lib/tokens.ts
// Access tokens are short-lived JWTs (signature-verified, never persisted). Refresh
// tokens are opaque random strings — only their SHA-256 hash is ever persisted, in
// refresh_tokens, so they can be looked up and revoked without storing them in plain
// text.

import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Copy backend/.env.example to backend/.env and fill it in.');
  }
  return secret;
}

const jwtSecret = requireJwtSecret();

export interface AccessTokenPayload {
  accountId: string;
}

export function signAccessToken(accountId: string): { token: string; expiresIn: number } {
  const token = jwt.sign({} satisfies Record<string, never>, jwtSecret, {
    subject: accountId,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
  return { token, expiresIn: ACCESS_TOKEN_TTL_SECONDS };
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
      return null;
    }
    return { accountId: decoded.sub };
  } catch {
    return null;
  }
}

export function generateRefreshToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(32).toString('hex');
  return {
    token,
    tokenHash: hashRefreshToken(token),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  };
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
