// features/requirement-detail/components/CredibilityBlockView.tsx

import { View, Text } from 'react-native';
import { space } from '../../../components/ui/tokens';
import type { Business } from '../../../lib/types';
import { businessStatusLabel, formatDate, tierLabel } from '../format';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { LabelValueRow } from './LabelValueRow';

export function CredibilityBlockView({ label, business }: { label: string; business: Business }) {
  const c = business.credibility;
  const name = business.displayName ?? business.registeredName;
  return (
    <View style={sharedStyles.block}>
      <SectionLabel>{label}</SectionLabel>
      <Text style={sharedStyles.bodyTextSemi}>{name}</Text>
      <View style={{ gap: space.xs, marginTop: space.xs }}>
        <LabelValueRow label="Status" value={businessStatusLabel(c.status)} />
        <LabelValueRow label="Tier" value={tierLabel(c.tier)} />
        <LabelValueRow label="Verified" value={c.verifiedAt ? formatDate(c.verifiedAt) : '—'} />
        <LabelValueRow label="Recheck due" value={c.recheckDueAt ? formatDate(c.recheckDueAt) : '—'} />
        <LabelValueRow label="Requirements posted" value={String(c.requirementsPosted)} />
        <LabelValueRow label="Requirements awarded" value={String(c.requirementsAwarded)} />
        <LabelValueRow label="Quotations submitted" value={String(c.quotationsSubmitted)} />
        <LabelValueRow label="Quotations awarded" value={String(c.quotationsAwarded)} />
      </View>
    </View>
  );
}
