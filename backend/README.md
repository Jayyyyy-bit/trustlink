# TrustLink backend

Express + TypeScript (strict). Postgres via the `pg` driver directly — no ORM. Requires
[pgvector](https://github.com/pgvector/pgvector) on the database, which the first
migration enables.

## Setup

```
npm install
cp .env.example .env   # then fill in DATABASE_URL
```

`DATABASE_URL` must point at a database where the connecting user can run
`CREATE EXTENSION`.

## Running the migration

```
npm run migrate
```

This runs `src/db/migrate.ts`, which applies every `.sql` file in
`src/db/migrations/` — in filename order — that isn't already recorded in the
`schema_migrations` table it creates on first run. Each file runs inside its own
transaction, so a failed migration doesn't leave the schema half-applied.

To add a new migration, add a new `NNN_description.sql` file to
`src/db/migrations/` (numbered after the last one) and run `npm run migrate` again;
already-applied files are skipped.

`001_init.sql` enables the `vector` extension and creates the four core tables:
`businesses`, `requirements`, `quotations`, `ledger_entries`.

`002_auth.sql` adds `accounts` and `refresh_tokens`.

## Other scripts

```
npm run dev         # start the server with auto-reload (tsx watch)
npm run build        # compile to dist/
npm start            # run the compiled server
npm run typecheck     # tsc --noEmit
```

## The ledger

`src/lib/ledger.ts` is the only code path that writes to `ledger_entries`, and the
only place a hash is ever computed — nothing on the device computes a hash.
`appendLedgerEntry({ type, subjectId, payload })` canonicalises the payload
(recursively sorts object keys so identical data always serialises the same way),
hashes it together with the previous entry's hash via SHA-256, and inserts the new
row. Appends are serialized with a Postgres advisory lock so concurrent writers
can't fork the hash chain, and `previous_hash` is itself a foreign key back onto
`ledger_entries.hash`, so the database rejects an entry that doesn't chain to
something that already exists.

`ledger_entries` is append-only: there is no update or delete function in this
module, and none should be added anywhere else in the codebase.

## Auth

`src/routes/auth.ts`, mounted at `/auth`:

- `POST /auth/signup` — `{ email, password }`. Creates a bare account with no
  business attached (effectively `UNVERIFIED`). Does not log in.
- `POST /auth/login` — `{ email, password }`. Returns `{ accessToken, refreshToken,
  expiresIn }`.
- `POST /auth/refresh` — `{ refreshToken }`. Returns a new `{ accessToken,
  expiresIn }`.
- `POST /auth/logout` — `{ refreshToken }`. Revokes that refresh token.

Passwords are hashed with bcrypt (`src/lib/passwords.ts`) — the plain password is
never stored. Access tokens are JWTs valid for 15 minutes. Refresh tokens are
random opaque strings valid for 7 days; only their SHA-256 hash is stored, in
`refresh_tokens`, so a token can be revoked (logout) or checked without ever
persisting it in plain text.

`src/middleware/auth.ts` exports two middlewares:

- `authenticate` — reads the `Authorization: Bearer <token>` header, verifies it,
  and attaches `req.accountId`, `req.businessId`, and `req.businessStatus` (looked
  up fresh from the database on every request, since verification can happen at
  any time).
- `requireVerifiedBusiness` — rejects with 403 unless `req.businessStatus ===
  'VERIFIED'`. Use after `authenticate` on routes that require it, such as posting
  a requirement or submitting a quotation.

### Business status lifecycle

An account is created with no business attached (`UNVERIFIED`). `POST /businesses`
creates the business from onboarding, links it to the calling account, and sets
`credibility_status` to `PENDING`. **Moving a business from `PENDING` to
`VERIFIED` is manual for now: there is no route for it.** Verify a business by
updating it directly in the database, e.g.:

```sql
UPDATE businesses SET credibility_status = 'VERIFIED', credibility_verified_at = now()
WHERE id = '<business id>';
```

## Core routes

All of the below sit behind `authenticate`; routes marked (verified) also require
`requireVerifiedBusiness`.

- `POST /businesses` — creates the business from onboarding and links it to the
  calling account (`PENDING`). 409 if the account already has one. Writes no
  ledger entry — the ledger only records marketplace activity, not account
  administration.
- `POST /requirements` (verified) — creates and publishes a requirement in one
  step: sets `status = OPEN`, stamps `published_at`, and appends a
  `REQUIREMENT_PUBLISHED` ledger entry.
- `GET /requirements` — the feed: open requirements only, ordered by closing
  time, excluding the caller's own.
- `GET /requirements/:ref` — one requirement. Quotation contents are included
  only when the caller owns it and its closing time has passed; otherwise the
  response carries `quotationCount` only — enforced by never constructing the
  quotations query outside that branch, not by filtering the response.
- `POST /quotations` (verified) — submits a sealed quotation against an `OPEN`,
  not-yet-closed requirement. Canonicalises the payload, appends a
  `QUOTATION_SUBMITTED` ledger entry, and returns `{ ref, submittedAt,
  hashTruncated, sequence }`.
- `POST /quotations/:ref/withdraw` — only while `SUBMITTED`, and only by the
  submitting business. Appends a `QUOTATION_WITHDRAWN` entry and updates the row
  in place; the original row is never deleted.
- `GET /quotations/mine` — the caller's own quotations, in full.
