-- 002_auth.sql
-- Adds accounts and refresh_tokens. An account starts with no business attached
-- (business_id NULL) — the account's effective status is then UNVERIFIED. A business
-- is created separately when onboarding is submitted (moving it to PENDING), and the
-- account's business_id is set to point at it. VERIFIED is set manually in the
-- database for now — see backend/README.md.

CREATE TABLE accounts (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  business_id    TEXT REFERENCES businesses(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Refresh tokens are stored as a SHA-256 hash of the raw token, never the token
-- itself, so a leaked database dump doesn't hand out valid tokens. revoked_at is
-- set on logout so a token can be invalidated before it naturally expires.
CREATE TABLE refresh_tokens (
  id          TEXT PRIMARY KEY,
  account_id  TEXT NOT NULL REFERENCES accounts(id),
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX refresh_tokens_account_id_idx ON refresh_tokens(account_id);
