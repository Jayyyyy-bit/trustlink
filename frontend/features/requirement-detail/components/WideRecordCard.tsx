// features/requirement-detail/components/WideRecordCard.tsx

import { View } from 'react-native';
import type { Requirement } from '../../../lib/types';
import { formatDateTime } from '../format';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { LabelValueRow } from './LabelValueRow';

export function WideRecordCard({ requirement }: { requirement: Requirement }) {
  return (
    <View style={sharedStyles.wideCard}>
      <SectionLabel>Record</SectionLabel>
      <View style={sharedStyles.sideKeyValueList}>
        <LabelValueRow label="Reference" value={requirement.ref} mono />
        <LabelValueRow label="Published" value={requirement.publishedAt ? formatDateTime(requirement.publishedAt) : '—'} mono />
        <LabelValueRow label="Closing" value={formatDateTime(requirement.closingAt)} mono />
      </View>
    </View>
  );
}
