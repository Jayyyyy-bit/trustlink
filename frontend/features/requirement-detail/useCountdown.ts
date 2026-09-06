// features/requirement-detail/useCountdown.ts
// Countdown-to-closing hook shared by CountdownBadge and the wide info band/hero.

import { useEffect, useState } from 'react';
import type { ISODateTime } from '../../lib/types';

function pluralUnit(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** "113 days, 17 hours" — drops to the next pair of units as each one empties out. */
function formatCountdownWords(days: number, hours: number, minutes: number): string {
  if (days > 0) return `${pluralUnit(days, 'day')}, ${pluralUnit(hours, 'hour')}`;
  if (hours > 0) return `${pluralUnit(hours, 'hour')}, ${pluralUnit(minutes, 'minute')}`;
  return pluralUnit(minutes, 'minute');
}

export function useCountdown(closingAt: ISODateTime): { label: string; closed: boolean; urgent: boolean } {
  const target = new Date(closingAt).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = target - now;
  if (remainingMs <= 0) return { label: 'Closed', closed: true, urgent: false };

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return { label: formatCountdownWords(days, hours, minutes), closed: false, urgent: remainingMs < 24 * 3600_000 };
}
