// features/requirement-detail/components/SealedRecordPanel.tsx

import { View, Text, StyleSheet } from 'react-native';
import { color, radius, space, elevation } from '../../../components/ui/tokens';
import type { Quotation, LedgerEntry } from '../../../lib/types';
import { formatDateTime, quotationStatusLabel } from '../format';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { LabelValueRow } from './LabelValueRow';
import { ActionButton } from './ActionButton';

export function SealedRecordPanel({
  quotation,
  ledgerEntry,
  onWithdraw,
}: {
  quotation: Quotation;
  ledgerEntry: LedgerEntry;
  onWithdraw?: () => void;
}) {
  const canWithdraw = quotation.status === 'SUBMITTED';
  return (
    <View style={styles.sealedCard}>
      <SectionLabel>Your quotation</SectionLabel>
      <View style={{ gap: space.xs }}>
        <LabelValueRow label="Reference" value={quotation.ref} mono />
        <LabelValueRow label="Submitted" value={formatDateTime(quotation.submittedAt)} />
        <LabelValueRow label="Ledger entry" value={`#${ledgerEntry.sequence}`} mono />
        {!canWithdraw && <LabelValueRow label="Status" value={quotationStatusLabel(quotation.status)} />}
      </View>
      {canWithdraw ? (
        <ActionButton label="Withdraw quotation" variant="danger" onPress={onWithdraw} />
      ) : (
        <Text style={sharedStyles.mutedSmall}>
          Withdrawal is only possible while a quotation is submitted and unreleased.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sealedCard: {
    ...elevation.cardRaised,
    borderRadius: radius.lg,
    padding: space.lg,
    backgroundColor: color.surface,
    gap: space.md,
  },
});
