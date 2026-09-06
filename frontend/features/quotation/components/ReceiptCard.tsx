// features/quotation/components/ReceiptCard.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing, space, radius } from '../../../components/ui/tokens';
import type { LedgerEntry, Quotation, Requirement } from '../../../lib/types';
import { formatDateTime, formatDateTimeExact, formatPHP, withCommas } from '../format';
import { useCountdown } from '../useCountdown';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';

export function ReceiptCard({
  requirement,
  quotation,
  ledgerEntry,
}: {
  requirement: Requirement;
  quotation: Quotation;
  ledgerEntry: LedgerEntry;
}) {
  const { label: opensIn } = useCountdown(requirement.closingAt);
  const attachmentCount = quotation.attachments.length;
  const summary = `${Math.round(quotation.leadTimeDays / 7)} week${Math.round(quotation.leadTimeDays / 7) === 1 ? '' : 's'} lead time · ${quotation.paymentTerms} payment terms · valid ${quotation.validityDays} days · ${attachmentCount} attachment${attachmentCount === 1 ? '' : 's'}`;

  return (
    <View style={sharedStyles.card}>
      <SectionLabel>Your receipt</SectionLabel>

      <View style={styles.receiptGrid}>
        <View style={styles.receiptGridItem}>
          <SectionLabel>Quotation reference</SectionLabel>
          <Text style={styles.receiptMonoValue}>{quotation.ref}</Text>
          <Text style={styles.fieldNote}>Quote this in any conversation with the buyer.</Text>
        </View>
        <View style={styles.receiptGridItem}>
          <SectionLabel>Submitted</SectionLabel>
          <Text style={styles.receiptMonoValue}>{formatDateTimeExact(quotation.submittedAt)}</Text>
          <Text style={styles.fieldNote}>The exact second your quotation was recorded.</Text>
        </View>
        <View style={styles.receiptGridItem}>
          <SectionLabel>Sealed until</SectionLabel>
          <Text style={styles.receiptMonoValue}>{formatDateTime(requirement.closingAt)}</Text>
          <Text style={styles.fieldNote}>Opens in {opensIn}.</Text>
        </View>
      </View>

      <View style={[styles.receiptGrid, sharedStyles.dividedTop]}>
        <View style={styles.receiptGridItem}>
          <SectionLabel>Record number</SectionLabel>
          <Text style={styles.receiptMonoValueSmall}>#{withCommas(ledgerEntry.sequence)}</Text>
        </View>
        <View style={[styles.receiptGridItem, { flexGrow: 2 }]}>
          <SectionLabel>Fingerprint</SectionLabel>
          <Text style={styles.receiptMonoValueSmall}>{quotation.hashTruncated}</Text>
        </View>
      </View>

      <View style={[styles.grandTotalRow, sharedStyles.dividedTop]}>
        <SectionLabel>What you submitted</SectionLabel>
        <Text style={styles.grandTotalValue}>{formatPHP(quotation.totalPrice)}</Text>
      </View>
      <Text style={styles.mutedSmall}>{summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldNote: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  mutedSmall: { fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },

  receiptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xl },
  receiptGridItem: { flexGrow: 1, flexBasis: 200, minWidth: 200 },
  receiptMonoValue: { marginTop: space.xs, fontFamily: font.monoMedium, fontSize: fontSize.md, color: color.ink },
  receiptMonoValueSmall: { marginTop: space.xs, fontFamily: font.monoMedium, fontSize: fontSize.base, color: color.ink },

  grandTotalRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.md, marginTop: space.xs, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.lg, backgroundColor: color.primaryFaint },
  grandTotalValue: { fontFamily: font.display, fontSize: fontSize.display, lineHeight: lineHeight.display, letterSpacing: letterSpacing.tight, color: color.ink },
});
