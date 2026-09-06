// features/requirement-detail/useOwnerReleased.ts
// State + business logic for OWNER_RELEASED, shared by the phone stack's OwnerReleasedPanel
// and the wide layout's WideOwnerReleasedScreen so both render the same underlying decisions.

import { useState } from 'react';
import type { Business, BusinessId, Quotation, Requirement } from '../../lib/types';

/** Everything a released quotation card shows about its respondent — nothing more. */
export type Respondent = Pick<Business, 'id' | 'registeredName' | 'city' | 'province' | 'credibility'>;

export type SortKey = 'price' | 'leadTime' | 'tier' | 'submittedAt';
export type SortDir = 'asc' | 'desc';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'price', label: 'Price' },
  { key: 'leadTime', label: 'Lead time' },
  { key: 'tier', label: 'Tier' },
  { key: 'submittedAt', label: 'Submitted' },
];

const SORT_DEFAULT_DIR: Record<SortKey, SortDir> = {
  price: 'asc',
  leadTime: 'asc',
  tier: 'desc',
  submittedAt: 'desc',
};

function compareQuotations(
  a: Quotation,
  b: Quotation,
  key: SortKey,
  dir: SortDir,
  respondents: Record<BusinessId, Respondent>,
): number {
  let result: number;
  switch (key) {
    case 'price':
      result = a.totalPrice - b.totalPrice;
      break;
    case 'leadTime':
      result = a.leadTimeDays - b.leadTimeDays;
      break;
    case 'submittedAt':
      result = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      break;
    case 'tier': {
      const ta = respondents[a.respondentId]?.credibility.tier ?? 0;
      const tb = respondents[b.respondentId]?.credibility.tier ?? 0;
      result = ta - tb;
      break;
    }
  }
  return dir === 'asc' ? result : -result;
}

interface UseOwnerReleasedArgs {
  requirement: Requirement;
  quotations: Quotation[];
  respondents: Record<BusinessId, Respondent>;
  onShortlistToggle?: (quotationId: string) => void;
  onAward?: (quotationId: string) => void;
}

export function useOwnerReleased({
  requirement,
  quotations: initialQuotations,
  respondents,
  onShortlistToggle,
  onAward,
}: UseOwnerReleasedArgs) {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [awardedId, setAwardedId] = useState<string | null>(requirement.awardedQuotationId);
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [awardTargetId, setAwardTargetId] = useState<string | null>(null);

  const handleSortPress = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(SORT_DEFAULT_DIR[key]);
    }
  };

  const handleToggleShortlist = (id: string) => {
    if (awardedId) return;
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, status: q.status === 'SHORTLISTED' ? 'RELEASED' : 'SHORTLISTED' } : q,
      ),
    );
    onShortlistToggle?.(id);
  };

  const handleConfirmAward = (id: string) => {
    setAwardedId(id);
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.status === 'WITHDRAWN') return q;
        return { ...q, status: q.id === id ? 'AWARDED' : 'NOT_SELECTED' };
      }),
    );
    setAwardTargetId(null);
    onAward?.(id);
  };

  const visible = quotations.filter((q) => q.status !== 'WITHDRAWN');
  const withdrawn = quotations.filter((q) => q.status === 'WITHDRAWN');
  const sorted = [...visible].sort((a, b) => compareQuotations(a, b, sortKey, sortDir, respondents));
  const orphanWithdrawn = withdrawn.filter((w) => !visible.some((v) => v.id === w.replacedByQuotationId));

  const awardTarget = quotations.find((q) => q.id === awardTargetId) ?? null;
  const awardTargetName = awardTarget ? respondents[awardTarget.respondentId].registeredName : null;

  const shortlistedCount = quotations.filter((q) => q.status === 'SHORTLISTED').length;
  const flaggedCount = visible.filter((q) => q.integrity === 'FLAGGED').length;

  return {
    respondents,
    visible,
    withdrawn,
    sorted,
    orphanWithdrawn,
    sortKey,
    sortDir,
    awardedId,
    awardTargetId,
    awardTargetName,
    shortlistedCount,
    flaggedCount,
    handleSortPress,
    handleToggleShortlist,
    handleConfirmAward,
    setAwardTargetId,
  };
}
