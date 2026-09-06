-- 001_init.sql
-- Enables pgvector and creates the four core tables: businesses, requirements,
-- quotations, ledger_entries. Run via `npm run migrate` — see backend/README.md.

CREATE EXTENSION IF NOT EXISTS vector;

-- ─── businesses ────────────────────────────────────────────────────────────
-- Mirrors Business + CredibilityBlock from frontend/lib/types/index.ts.
CREATE TABLE businesses (
  id                                TEXT PRIMARY KEY,
  registered_name                   TEXT NOT NULL,
  display_name                      TEXT,
  business_type                     TEXT NOT NULL
                                       CHECK (business_type IN ('SOLE_PROP', 'PARTNERSHIP', 'CORPORATION', 'COOPERATIVE')),
  category                          TEXT NOT NULL,
  city                              TEXT NOT NULL,
  province                          TEXT NOT NULL,
  contact_person                    TEXT NOT NULL,
  contact_mobile                    TEXT NOT NULL,
  capabilities                      TEXT[] NOT NULL DEFAULT '{}',
  service_areas                     TEXT[] NOT NULL DEFAULT '{}',

  -- CredibilityBlock — seven observed facts. No ratings, no reviews.
  credibility_status                TEXT NOT NULL DEFAULT 'UNVERIFIED'
                                       CHECK (credibility_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED')),
  credibility_verified_at           TIMESTAMPTZ,
  credibility_recheck_due_at        TIMESTAMPTZ,
  credibility_tier                  SMALLINT CHECK (credibility_tier IN (1, 2, 3)),
  credibility_requirements_posted   INTEGER NOT NULL DEFAULT 0,
  credibility_requirements_awarded  INTEGER NOT NULL DEFAULT 0,
  credibility_quotations_submitted  INTEGER NOT NULL DEFAULT 0,
  credibility_quotations_awarded    INTEGER NOT NULL DEFAULT 0,

  profile_completion_pct            INTEGER NOT NULL DEFAULT 0 CHECK (profile_completion_pct BETWEEN 0 AND 100),
  member_since_year                 INTEGER NOT NULL,

  -- Embeds `capabilities` for feed-matching similarity search. 1536 matches
  -- OpenAI text-embedding-3-small; bump this in a follow-up migration if a
  -- different embedding model is chosen later.
  capabilities_embedding            vector(1536)
);

-- ─── requirements ──────────────────────────────────────────────────────────
-- Mirrors Requirement from frontend/lib/types/index.ts.
CREATE TABLE requirements (
  id                    TEXT PRIMARY KEY,
  ref                   TEXT NOT NULL UNIQUE,
  buyer_id              TEXT NOT NULL REFERENCES businesses(id),
  status                TEXT NOT NULL
                          CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED', 'AWARDED', 'CLOSED_NO_AWARD', 'CANCELLED')),
  category              TEXT NOT NULL,
  title                 TEXT NOT NULL,
  scope                 TEXT NOT NULL,
  specifications        JSONB NOT NULL DEFAULT '[]',  -- SpecRow[]
  quantity              TEXT NOT NULL,
  budget_min            NUMERIC,
  budget_max            NUMERIC,
  delivery_site         JSONB NOT NULL,               -- DeliverySite
  delivery_window       TEXT NOT NULL,
  attachments           JSONB NOT NULL DEFAULT '[]',  -- Attachment[]
  closing_at            TIMESTAMPTZ NOT NULL,          -- the only field that fires a platform event
  published_at          TIMESTAMPTZ,
  quotation_count       INTEGER NOT NULL DEFAULT 0,
  last_quotation_at     TIMESTAMPTZ,
  awarded_quotation_id  TEXT  -- FK added below, once quotations exists (circular reference)
);

-- ─── quotations ──────────────────────────────────────────────────────────
-- Mirrors Quotation from frontend/lib/types/index.ts.
CREATE TABLE quotations (
  id                        TEXT PRIMARY KEY,
  ref                       TEXT NOT NULL UNIQUE,
  requirement_id            TEXT NOT NULL REFERENCES requirements(id),
  respondent_id             TEXT NOT NULL REFERENCES businesses(id),
  status                    TEXT NOT NULL
                              CHECK (status IN ('SUBMITTED', 'RELEASED', 'SHORTLISTED', 'AWARDED', 'NOT_SELECTED', 'WITHDRAWN')),
  total_price               NUMERIC NOT NULL,
  lead_time_days            INTEGER NOT NULL,
  payment_terms             TEXT NOT NULL,
  validity_days             INTEGER NOT NULL,
  notes_to_buyer            TEXT NOT NULL DEFAULT '',
  attachments               JSONB NOT NULL DEFAULT '[]',  -- Attachment[]
  submitted_at              TIMESTAMPTZ NOT NULL,
  hash_truncated            TEXT NOT NULL,                -- server-computed (lib/ledger.ts), display only
  ledger_entry_id           TEXT NOT NULL,                -- FK added below, once ledger_entries exists
  integrity                 TEXT CHECK (integrity IN ('VALID', 'FLAGGED')),  -- null until RELEASED
  withdrawn_at              TIMESTAMPTZ,
  replaced_by_quotation_id  TEXT REFERENCES quotations(id)
);

ALTER TABLE requirements
  ADD CONSTRAINT requirements_awarded_quotation_id_fkey
  FOREIGN KEY (awarded_quotation_id) REFERENCES quotations(id);

-- ─── ledger_entries ────────────────────────────────────────────────────────
-- Append-only audit trail — no UPDATE or DELETE path exists anywhere in the
-- codebase; src/lib/ledger.ts exposes only an append operation. `sequence` is a
-- DB-generated monotonic counter. `previous_hash` referencing this table's own
-- `hash` column chains every entry to the one before it and lets Postgres itself
-- reject an entry that doesn't chain to something that already exists.
CREATE TABLE ledger_entries (
  id             TEXT PRIMARY KEY,
  sequence       SERIAL UNIQUE,
  type           TEXT NOT NULL
                   CHECK (type IN ('REQUIREMENT_PUBLISHED', 'QUOTATION_SUBMITTED', 'QUOTATION_WITHDRAWN', 'REQUIREMENT_CLOSED', 'AWARD_RECORDED')),
  subject_id     TEXT NOT NULL,
  hash           TEXT NOT NULL UNIQUE,
  previous_hash  TEXT REFERENCES ledger_entries(hash),  -- null only for the very first entry
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE quotations
  ADD CONSTRAINT quotations_ledger_entry_id_fkey
  FOREIGN KEY (ledger_entry_id) REFERENCES ledger_entries(id);
