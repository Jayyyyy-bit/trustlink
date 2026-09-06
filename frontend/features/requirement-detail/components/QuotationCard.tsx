// features/requirement-detail/components/QuotationCard.tsx

import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, space, radius, elevation } from '../../../components/ui/tokens';
import type { Quotation } from '../../../lib/types';
import type { Respondent } from '../useOwnerReleased';
import {
  formatDate,
  formatDateTime,
  formatPHP,
  integrityLabel,
  tierLabel,
} from '../format';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { LabelValueRow } from './LabelValueRow';
import { Badge } from './Badge';
import { ActionButton } from './ActionButton';
import { AttachmentList } from './AttachmentList';

export function QuotationCard({
  quotation,
  respondent,
  awardLocked,
  predecessor,
  onToggleShortlist,
  onRequestAward,
}: {
  quotation: Quotation;
  respondent: Respondent;
  awardLocked: boolean;
  predecessor: Quotation | null;
  onToggleShortlist: () => void;
  onRequestAward: () => void;
}) {
  const isAwarded = quotation.status === 'AWARDED';
  const isNotSelected = quotation.status === 'NOT_SELECTED';
  const isShortlisted = quotation.status === 'SHORTLISTED';
  const isFlagged = quotation.integrity === 'FLAGGED';
  const name = respondent.registeredName;

  return (
    <View style={[styles.quotationCard, isAwarded ? styles.quotationCardAwarded : null, isFlagged ? styles.quotationCardFlagged : null]}>
      <View style={styles.quotationCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.respondentName}>{name}</Text>
          <Text style={sharedStyles.mutedSmall}>{quotation.ref}</Text>
        </View>
        <View style={{ gap: space.xs, alignItems: 'flex-end' }}>
          {isAwarded && <Badge label="Awarded" tone="primary" />}
          {isNotSelected && <Badge label="Not selected" tone="neutral" />}
          {isShortlisted && <Badge label="Shortlisted" tone="primary" />}
          {isFlagged && <Badge label="Flagged" tone="danger" />}
        </View>
      </View>

      <View style={styles.quotationFactRow}>
        <LabelValueRow label="Verified" value={respondent.credibility.verifiedAt ? formatDate(respondent.credibility.verifiedAt) : '—'} />
        <LabelValueRow label="Tier" value={tierLabel(respondent.credibility.tier)} />
      </View>
      <View style={styles.quotationFactRow}>
        <LabelValueRow label="Requirements posted" value={String(respondent.credibility.requirementsPosted)} />
        <LabelValueRow label="Quotations awarded" value={String(respondent.credibility.quotationsAwarded)} />
      </View>

      <View style={styles.quotationPriceRow}>
        <Text style={styles.priceText}>{formatPHP(quotation.totalPrice)}</Text>
        <Text style={sharedStyles.mutedSmall}>{quotation.leadTimeDays} days lead time</Text>
      </View>

      <View style={styles.quotationFactRow}>
        <LabelValueRow label="Payment terms" value={quotation.paymentTerms} />
        <LabelValueRow label="Validity" value={`${quotation.validityDays} days`} />
      </View>

      {quotation.notesToBuyer.length > 0 && (
        <View style={sharedStyles.block}>
          <SectionLabel>Notes</SectionLabel>
          <Text style={sharedStyles.bodyText}>{quotation.notesToBuyer}</Text>
        </View>
      )}

      {quotation.attachments.length > 0 && (
        <View style={sharedStyles.block}>
          <SectionLabel>Attachments</SectionLabel>
          <AttachmentList attachments={quotation.attachments} />
        </View>
      )}

      <View style={styles.quotationFactRow}>
        <LabelValueRow label="Submitted" value={formatDateTime(quotation.submittedAt)} />
        <LabelValueRow label="Integrity" value={integrityLabel(quotation.integrity)} />
      </View>

      {predecessor && (
        <Text style={sharedStyles.mutedSmall}>
          Replaces withdrawn {predecessor.ref}
          {predecessor.withdrawnAt ? ` (${formatDateTime(predecessor.withdrawnAt)})` : ''}
        </Text>
      )}

      {!isAwarded && !isNotSelected && (
        <View style={styles.quotationActions}>
          <ActionButton
            label={isShortlisted ? 'Unshortlist' : 'Shortlist'}
            variant="outline"
            onPress={onToggleShortlist}
            disabled={awardLocked}
          />
          <ActionButton label="Award" variant="primary" onPress={onRequestAward} disabled={awardLocked} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  quotationCard: {
    ...elevation.card,
    borderRadius: radius.lg,
    padding: space.lg,
    backgroundColor: color.surface,
    gap: space.md,
  },
  quotationCardAwarded: {
    borderColor: color.primary,
    backgroundColor: color.primaryFaint,
  },
  quotationCardFlagged: {
    borderColor: color.dangerBorder,
  },
  quotationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: space.md,
  },
  respondentName: {
    fontFamily: font.bodySemi,
    fontSize: fontSize.md,
    color: color.ink,
  },
  quotationFactRow: {
    flexDirection: 'row',
    gap: space.lg,
  },
  quotationPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  priceText: {
    fontFamily: font.display,
    fontSize: fontSize.lg,
    color: color.ink,
  },
  quotationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.xs,
  },
});
