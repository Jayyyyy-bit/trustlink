// features/home-feed/types.ts
import type { Business } from '../../lib/types';

/** Everything a feed card shows about the business that posted it — nothing more. */
export type FeedBuyer = Pick<
  Business,
  'id' | 'registeredName' | 'displayName' | 'category' | 'city' | 'province' | 'capabilities' | 'credibility'
>;
