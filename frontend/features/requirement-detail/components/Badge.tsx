// features/requirement-detail/components/Badge.tsx

import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, letterSpacing, space, radius } from '../../../components/ui/tokens';

export type BadgeTone = 'primary' | 'danger' | 'neutral' | 'ink';

export function Badge({ label, tone, dot = false }: { label: string; tone: BadgeTone; dot?: boolean }) {
  const bg = tone === 'primary' ? color.primaryFaint : tone === 'danger' ? color.dangerFaint : tone === 'ink' ? color.ink : color.surfaceSunken;
  const borderColor = tone === 'primary' ? color.primary : tone === 'danger' ? color.dangerBorder : tone === 'ink' ? color.ink : color.border;
  const textColor = tone === 'primary' ? color.primary : tone === 'danger' ? color.danger : tone === 'ink' ? color.canvas : color.inkMuted;
  return (
    <View style={[styles.badge, styles.badgeRow, { backgroundColor: bg, borderColor }]}>
      {dot && <View style={[styles.badgeDot, { backgroundColor: textColor }]} />}
      <Text style={[styles.badgeLabel, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
  badgeLabel: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
  },
});
