// features/home-feed/components/ClosedRequirementRow.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, letterSpacing, radius, space } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { formatBudget, timeAgoWords } from '../format';

export function ClosedRequirementRow({ requirement, buyerName, now }: { requirement: Requirement; buyerName: string; now: number }) {
  const outcome =
    requirement.status === 'AWARDED'
      ? { label: `Awarded · ${requirement.quotationCount} quotation${requirement.quotationCount === 1 ? '' : 's'}`, color: color.primary, border: color.primaryBorder }
      : { label: 'Closed · no quotations received', color: color.inkFaint, border: color.border };
  const meta = `${buyerName} · ${requirement.deliverySite.address} · ${formatBudget(requirement.budgetMin, requirement.budgetMax)}`;

  return (
    <View style={styles.closedRow}>
      <View style={{ flex: 1, minWidth: 220, gap: space.xs }}>
        <View style={styles.myReqStatusRow}>
          <View style={styles.categoryBadgeMuted}>
            <Text style={styles.categoryBadgeMutedLabel}>{requirement.category}</Text>
          </View>
          <Text style={styles.cardRef}>{requirement.ref} · closed {requirement.publishedAt ? timeAgoWords(requirement.closingAt, now) : ''}</Text>
        </View>
        <Text style={styles.closedTitle}>{requirement.title}</Text>
        <Text style={styles.mutedSmall}>{meta}</Text>
      </View>
      <View style={[styles.outcomeTag, { borderColor: outcome.border }]}>
        <View style={[styles.dot, { backgroundColor: outcome.color }]} />
        <Text style={[styles.outcomeLabel, { color: outcome.color }]}>{outcome.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  closedRow: { borderWidth: 1, borderColor: color.borderFaint, borderRadius: radius.xl, backgroundColor: color.surfaceSunken, padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.lg, flexWrap: 'wrap' },
  myReqStatusRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  categoryBadgeMuted: { borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.sm, paddingVertical: 2 },
  categoryBadgeMutedLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkMuted },
  cardRef: { fontFamily: font.mono, fontSize: fontSize.micro, color: color.inkFaint },
  closedTitle: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  mutedSmall: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  outcomeTag: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.sm },
  dot: { width: 7, height: 7, borderRadius: radius.pill },
  outcomeLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm },
});
