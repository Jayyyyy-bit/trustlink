// features/business-profile/components/VerifiedPanel.tsx
import { View, Text, StyleSheet } from 'react-native';
import { font, fontSize, color, space } from '../../../components/ui/tokens';
import type { CredibilityBlock } from '../../../lib/types';
import { formatDate, statusTone, businessStatusLabel, tierLabel } from '../format';
import { sharedStyles } from '../sharedStyles';
import { Pill } from './Pill';
import { LabelValueRow } from './LabelValueRow';

export function VerifiedPanel({ credibility, isOwner }: { credibility: CredibilityBlock; isOwner: boolean }) {
  return (
    <View style={sharedStyles.sideBlock}>
      <View style={styles.verifiedHeaderRow}>
        <Pill label={businessStatusLabel(credibility.status)} tone={statusTone(credibility.status)} />
        <Text style={styles.sideTitle}>Verified business</Text>
      </View>
      <View style={{ gap: space.xs, marginTop: space.md }}>
        <LabelValueRow label="Trust tier" value={tierLabel(credibility.tier)} />
        <LabelValueRow label="Verified" value={credibility.verifiedAt ? formatDate(credibility.verifiedAt) : '—'} />
        <LabelValueRow label="Next re-check" value={credibility.recheckDueAt ? formatDate(credibility.recheckDueAt) : '—'} />
      </View>
      <Text style={sharedStyles.sideBody}>
        {isOwner
          ? 'Trustlink checked these records against the issuing agencies. To correct any of them, submit a re-verification.'
          : 'Trustlink checks registration, tax, and permit records against the issuing agencies. It verifies documents, not performance.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sideTitle: { fontFamily: font.display, fontSize: fontSize.md, color: color.ink },
  verifiedHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
