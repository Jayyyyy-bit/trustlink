-- 004_semantic_matching.sql
-- Feed matching. requirements.scope_embedding embeds title + scope + specifications
-- (vector(1536), same model/dimension as businesses.capabilities_embedding).
-- business_capability_embeddings holds one embedding per capability so the feed can
-- say *which* capability matched a requirement — pure retrieval, no generated text.
-- No vector index: the feed ranks a filtered set (OPEN requirements) with a combined
-- score, not a top-k nearest-neighbour lookup, so an ANN index wouldn't be used.

ALTER TABLE requirements ADD COLUMN scope_embedding vector(1536);

CREATE TABLE business_capability_embeddings (
  business_id  TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  capability   TEXT NOT NULL,
  embedding    vector(1536) NOT NULL,
  PRIMARY KEY (business_id, capability)
);
