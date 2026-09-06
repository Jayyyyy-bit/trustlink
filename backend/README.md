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

## No routes yet

This scaffold is schema, connection, migration runner, and the ledger module only.
No HTTP routes are mounted in `src/app.ts` yet.
