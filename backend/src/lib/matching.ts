// src/lib/matching.ts
// Feed ranking and the "Why this matches" text. Retrieval only: the reason is a
// template filled with facts already on the two profiles (a capability the business
// listed, a service area it listed) — no model writes it.
//
// Score = MATCH_WEIGHT * match + URGENCY_WEIGHT * urgency, higher first.
//   match   — cosine similarity (1 - distance) when both sides have embeddings;
//             otherwise a category / service-area proxy on a comparable scale.
//   urgency — 1 / (1 + hoursToClose / 24): 0.5 at a day out, ~1 at closing, ~0 far out.

import type { DeliverySite, SpecRow } from '../types';

const MATCH_WEIGHT = 0.7;
const URGENCY_WEIGHT = 0.3;
const FALLBACK_CATEGORY_MATCH = 0.3;
const FALLBACK_AREA_MATCH = 0.2;
// Below this similarity the closest capability isn't close enough to name as the reason.
const MIN_CAPABILITY_SIMILARITY = 0.25;

export interface ViewerProfile {
  category: string;
  capabilities: string[];
  serviceAreas: string[];
}

export interface MatchInput {
  category: string;
  title: string;
  scope: string;
  specifications: SpecRow[];
  deliverySite: DeliverySite;
  buyerCity: string;
  buyerProvince: string;
  closingAt: Date;
  /** Cosine distance between viewer and requirement embeddings; null if either is missing. */
  distance: number | null;
  /** Viewer capability whose own embedding is closest to the scope, and that distance. */
  nearestCapability: string | null;
  nearestCapabilityDistance: number | null;
}

export interface MatchResult {
  score: number;
  matchReason: string | null;
}

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

function findServiceArea(viewer: ViewerProfile, text: string): string | null {
  const haystack = normalize(text);
  return viewer.serviceAreas.find((a) => normalize(a) && haystack.includes(normalize(a))) ?? null;
}

/** Fallback capability pick: a listed capability sharing a 4+ letter word with the requirement text. */
function findCapabilityByWords(viewer: ViewerProfile, input: MatchInput): string | null {
  const text = normalize(
    [input.title, input.scope, ...input.specifications.map((s) => `${s.label} ${s.value}`)].join(' '),
  );
  const words = new Set(text.match(/[a-z0-9]{4,}/g) ?? []);
  return viewer.capabilities.find((c) => (normalize(c).match(/[a-z0-9]{4,}/g) ?? []).some((w) => words.has(w))) ?? null;
}

export function scoreRequirement(viewer: ViewerProfile | null, input: MatchInput, now = Date.now()): MatchResult {
  const hoursLeft = Math.max(0, (input.closingAt.getTime() - now) / 3_600_000);
  const urgency = 1 / (1 + hoursLeft / 24);

  if (!viewer) {
    return { score: URGENCY_WEIGHT * urgency, matchReason: null };
  }

  const siteArea = findServiceArea(viewer, `${input.deliverySite.name} ${input.deliverySite.address}`);
  const buyerArea = siteArea ? null : findServiceArea(viewer, `${input.buyerCity} ${input.buyerProvince}`);
  const area = siteArea ?? buyerArea;
  const categoryMatch = normalize(viewer.category) === normalize(input.category);

  let match: number;
  let capability: string | null;
  let capabilityPhrase: string;
  if (input.distance !== null) {
    match = Math.min(1, Math.max(0, 1 - input.distance));
    const nearSimilarity = input.nearestCapabilityDistance === null ? 0 : 1 - input.nearestCapabilityDistance;
    capability = nearSimilarity >= MIN_CAPABILITY_SIMILARITY ? input.nearestCapability : null;
    capabilityPhrase = 'is the closest fit to this requirement’s scope';
  } else {
    match = (categoryMatch ? FALLBACK_CATEGORY_MATCH : 0) + (area ? FALLBACK_AREA_MATCH : 0);
    capability = findCapabilityByWords(viewer, input);
    capabilityPhrase = 'is named in this requirement';
  }

  const parts: string[] = [];
  if (capability) parts.push(`Your capability “${capability}” ${capabilityPhrase}.`);
  if (siteArea) parts.push(`The site (${input.deliverySite.name}) is in your service area “${siteArea}”.`);
  else if (buyerArea) parts.push(`The buyer is based in your service area “${buyerArea}”.`);
  if (categoryMatch) parts.push(`Same category as your business (${input.category}).`);

  return {
    score: MATCH_WEIGHT * match + URGENCY_WEIGHT * urgency,
    matchReason: parts.length ? parts.join(' ') : null,
  };
}
