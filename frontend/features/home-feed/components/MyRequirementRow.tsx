// features/home-feed/components/MyRequirementRow.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, letterSpacing, radius, space } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { formatBudget, formatCompactCountdown, requirementStatusLabel, timeAgoWords } from '../format';
import { FeedButton } from './FeedButton';

export function MyRequirementRow({ requirement, now }: { requirement: Requirement; now: number }) {
  const { hoursLeft, closed } = formatCompactCountdown(requirement.closingAt, now);
  let statusLabel: string;
  let statusColor: string;
  if (requirement.status === 'OPEN' && !closed && hoursLeft < 24) {
    statusLabel = `Closing in ${Math.max(1, Math.ceil(hoursLeft))}h`;
    statusColor = color.danger;
  } else if (requirement.status === 'OPEN') {
    statusLabel = 'Open';
    statusColor = color.primary;
  } else {
    statusLabel = requirementStatusLabel(requirement.status);
    statusColor = color.inkFaint;
  }
  const posted = requirement.publishedAt ? `Posted ${timeAgoWords(requirement.publishedAt, now)}` : 'Not yet published';
  const meta = `${posted} · ${requirement.category} · ${requirement.deliverySite.address} · ${formatBudget(requirement.budgetMin, requirement.budgetMax)}`;

  return (
    <View style={styles.myReqRow}>
      <View style={{ flex: 1, minWidth: 200, gap: space.xs }}>
        <View style={styles.myReqStatusRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.myReqStatusLabel, { color: statusColor }]}>{statusLabel}</Text>
          <Text style={styles.cardRef}>{requirement.ref}</Text>
        </View>
        <Text style={styles.myReqTitle}>{requirement.title}</Text>
        <Text style={styles.mutedSmall}>{meta}</Text>
      </View>
      <View style={styles.myReqRight}>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.myReqCount}>{requirement.quotationCount}</Text>
          <Text style={styles.microLabel}>Quotations</Text>
        </View>
        <FeedButton
          label={requirement.status === 'AWARDED' ? 'View award' : 'Review quotations'}
          variant="outline"
          onPress={() => {}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  myReqRow: { borderWidth: 1, borderColor: color.border, borderRadius: radius.xl, padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.lg, flexWrap: 'wrap' },
  myReqStatusRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 7, height: 7, borderRadius: radius.pill },
  myReqStatusLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase' },
  cardRef: { fontFamily: font.mono, fontSize: fontSize.micro, color: color.inkFaint },
  myReqTitle: { fontFamily: font.display, fontSize: fontSize.base, color: color.ink },
  mutedSmall: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  myReqRight: { flexDirection: 'row', alignItems: 'center', gap: space.xl },
  myReqCount: { fontFamily: font.display, fontSize: fontSize.xl, color: color.ink },
  microLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
});
