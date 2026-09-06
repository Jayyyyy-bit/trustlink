// features/home-feed/components/ClosingSoonItem.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, radius, space } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { formatBudget, formatCompactCountdown, shortCountdown } from '../format';

export function ClosingSoonItem({ requirement, buyerName, now, onSelect }: { requirement: Requirement; buyerName: string; now: number; onSelect: () => void }) {
  const { hoursLeft, closed } = formatCompactCountdown(requirement.closingAt, now);
  return (
    <Pressable style={styles.closingSoonRow} onPress={onSelect}>
      <Text style={styles.closingSoonTitle} numberOfLines={2}>{requirement.title}</Text>
      <Text style={styles.mutedSmall}>{buyerName} · {formatBudget(requirement.budgetMin, requirement.budgetMax)}</Text>
      <View style={styles.myReqStatusRow}>
        <View style={[styles.dot, { backgroundColor: color.danger }]} />
        <Text style={[styles.closingSoonCountdown]}>{shortCountdown(hoursLeft, closed)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  closingSoonRow: { gap: space.xs, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: color.borderFaint },
  closingSoonTitle: { fontFamily: font.bodySemi, fontSize: fontSize.sm, color: color.ink },
  mutedSmall: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  myReqStatusRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 7, height: 7, borderRadius: radius.pill },
  closingSoonCountdown: { fontFamily: font.mono, fontSize: fontSize.sm, color: color.danger },
});
