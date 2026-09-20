// src/db/backfill-embeddings.ts
// Embeds every business and OPEN requirement that has no embedding yet (created before
// semantic matching shipped, or while the embedding provider was failing).
// Run with `npm run backfill-embeddings`; safe to re-run.

import { pool } from './pool';
import { embedTexts, refreshBusinessEmbeddings, requirementEmbeddingText, toVectorLiteral } from '../lib/embeddings';
import type { SpecRow } from '../types';

async function run(): Promise<void> {
  const { rows: businesses } = await pool.query<{ id: string }>(
    'SELECT id FROM businesses WHERE capabilities_embedding IS NULL',
  );
  let businessesDone = 0;
  for (const { id } of businesses) {
    if (await refreshBusinessEmbeddings(id)) businessesDone += 1;
  }
  console.log(`businesses embedded: ${businessesDone}/${businesses.length}`);

  const { rows: requirements } = await pool.query<{ id: string; title: string; scope: string; specifications: SpecRow[] }>(
    "SELECT id, title, scope, specifications FROM requirements WHERE scope_embedding IS NULL AND status = 'OPEN'",
  );
  let requirementsDone = 0;
  for (const r of requirements) {
    try {
      const [vector] = await embedTexts([requirementEmbeddingText(r.title, r.scope, r.specifications)]);
      await pool.query('UPDATE requirements SET scope_embedding = $2::vector WHERE id = $1', [
        r.id,
        toVectorLiteral(vector as number[]),
      ]);
      requirementsDone += 1;
    } catch (err) {
      console.error(`requirement ${r.id} failed`, err);
    }
  }
  console.log(`requirements embedded: ${requirementsDone}/${requirements.length}`);
}

run()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end();
  });
