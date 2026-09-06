// features/requirement-detail/components/WideMyRecordCard.tsx

import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, letterSpacing, space, radius } from '../../../components/ui/tokens';
import type { Quotation, LedgerEntry } from '../../../lib/types';
import { formatDateTime, quotationStatusLabel } from '../format';
import { sharedStyles } from '../sharedStyles';
import { LabelValueRow } from './LabelValueRow';
import { ActionButton } from './ActionButton';

export function WideMyRecordCard({
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
    <View style={styles.wideMyRecordCard}>
      <View style={styles.submittedTag}>
        <Text style={styles.submittedTagLabel}>Submitted · sealed</Text>
      </View>
      <Text style={sharedStyles.mutedSmall}>
        Your quotation is recorded and cannot be read by the buyer or any other respondent until closing.
      </Text>
      <View style={[sharedStyles.sideKeyValueList, sharedStyles.wideDividedSectionTop]}>
        <LabelValueRow label="Reference" value={quotation.ref} mono />
        <LabelValueRow label="Submitted" value={formatDateTime(quotation.submittedAt)} mono />
      </View>
      <Text style={styles.wideLedgerNote}>
        Recorded and tamper-evident · #{ledgerEntry.sequence}
      </Text>
      {canWithdraw ? (
        <>
          <ActionButton label="Withdraw quotation" variant="danger" onPress={onWithdraw} />
          <Text style={sharedStyles.mutedSmall}>
            Withdrawal is recorded in the ledger. The original entry is kept and shown to the buyer at release.
            You may resubmit until closing.
          </Text>
        </>
      ) : (
        <Text style={sharedStyles.mutedSmall}>Status: {quotationStatusLabel(quotation.status)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wideMyRecordCard: {
    borderWidth: 1,
    borderColor: color.primaryBorder,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    paddingVertical: space.xl,
    paddingHorizontal: space.xxl,
    gap: space.lg,
  },
  submittedTag: {
    alignSelf: 'flex-start',
    backgroundColor: color.primary,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  submittedTagLabel: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.canvas,
  },
  wideLedgerNote: {
    fontFamily: font.body,
    fontSize: fontSize.sm,
    color: color.inkFaint,
  },
});
