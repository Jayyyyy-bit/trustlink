// src/lib/embeddings.ts
// Text -> vector via the OpenAI embeddings API (plain fetch, no SDK). Retrieval only:
// nothing in this module, or anywhere in the product, asks a model to write text.
// Every caller treats an embedding failure as "no embedding yet" — the feed falls back
// to category/service-area matching — so a provider outage never blocks onboarding or
// publishing.

import 'dotenv/config';
import { pool } from '../db/pool';
import type { SpecRow } from '../types';

const EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings';
// Must produce 1536 dimensions to match the vector(1536) columns.
const MODEL = process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small';
const MAX_INPUT_CHARS = 20_000;

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const response = await fetch(EMBEDDINGS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, input: texts.map((t) => t.slice(0, MAX_INPUT_CHARS)) }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(`Embeddings API returned ${response.status}: ${await response.text()}`);
  }

  const body = (await response.json()) as { data: { index: number; embedding: number[] }[] };
  const vectors = [...body.data].sort((a, b) => a.index - b.index).map((d) => d.embedding);
  if (vectors.length !== texts.length || vectors.some((v) => v.length !== 1536)) {
    throw new Error(`Embeddings API returned unexpected shape (model ${MODEL} must give 1536 dimensions)`);
  }
  return vectors;
}

/** pgvector text input format; bind it as a parameter and cast with ::vector. */
export function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(',')}]`;
}

export function businessEmbeddingText(capabilities: string[], serviceAreas: string[]): string {
  return `Capabilities: ${capabilities.join('; ')}. Service areas: ${serviceAreas.join('; ')}.`;
}

export function requirementEmbeddingText(title: string, scope: string, specifications: SpecRow[]): string {
  const specs = specifications.map((s) => `${s.label}: ${s.value}`).join('\n');
  return `${title}\n\n${scope}\n\n${specs}`.trim();
}

/** Embeds a requirement's title/scope/specs; null if the provider call fails. */
export async function tryEmbedRequirement(
  title: string,
  scope: string,
  specifications: SpecRow[],
): Promise<string | null> {
  try {
    const [vector] = await embedTexts([requirementEmbeddingText(title, scope, specifications)]);
    return vector ? toVectorLiteral(vector) : null;
  } catch (err) {
    console.error('requirement embedding failed; publishing without one', err);
    return null;
  }
}

/**
 * (Re)builds a business's embeddings from its current capabilities and service areas:
 * the combined-text vector on businesses, plus one vector per capability. Best effort —
 * on failure the business is left with no embedding (never a stale one) and the feed
 * falls back to category/service-area matching until `npm run backfill-embeddings`.
 */
export async function refreshBusinessEmbeddings(businessId: string): Promise<boolean> {
  const { rows } = await pool.query<{ capabilities: string[]; service_areas: string[] }>(
    'SELECT capabilities, service_areas FROM businesses WHERE id = $1',
    [businessId],
  );
  const business = rows[0];
  if (!business) return false;

  const capabilities = [...new Set(business.capabilities.map((c) => c.trim()).filter(Boolean))];

  let vectors: number[][];
  try {
    vectors = await embedTexts([businessEmbeddingText(business.capabilities, business.service_areas), ...capabilities]);
  } catch (err) {
    console.error(`business ${businessId} embedding failed; feed will use fallback matching`, err);
    return false;
  }
  const [combined, ...perCapability] = vectors as [number[], ...number[][]];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE businesses SET capabilities_embedding = $2::vector WHERE id = $1', [
      businessId,
      toVectorLiteral(combined),
    ]);
    await client.query('DELETE FROM business_capability_embeddings WHERE business_id = $1', [businessId]);
    for (const [i, capability] of capabilities.entries()) {
      await client.query(
        'INSERT INTO business_capability_embeddings (business_id, capability, embedding) VALUES ($1, $2, $3::vector)',
        [businessId, capability, toVectorLiteral(perCapability[i] as number[])],
      );
    }
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`business ${businessId} embedding write failed`, err);
    return false;
  } finally {
    client.release();
  }
}
