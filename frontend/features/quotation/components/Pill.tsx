// features/quotation/components/Pill.tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import { color, font, fontSize, radius, space } from '../../../components/ui/tokens';

export function Pill({
  label,
  active,
  onPress,
  variant = 'chip',
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  /** 'segment' reads as one grouped mode choice (e.g. Line items / Total price only)
   *  rather than a freestanding filter chip. */
  variant?: 'chip' | 'segment';
}) {
  const segment = variant === 'segment';
  return (
    <Pressable
      onPress={onPress}
      style={[segment ? styles.segment : styles.pill, active ? (segment ? styles.segmentActive : styles.pillActive) : null]}
    >
      <Text style={[segment ? styles.segmentLabel : styles.pillLabel, active ? (segment ? styles.segmentLabelActive : styles.pillLabelActive) : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: { borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.sm },
  pillActive: { backgroundColor: color.primaryFaint, borderColor: color.primary },
  pillLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },
  pillLabelActive: { color: color.primary },

  /* segmented mode choice (e.g. Line items / Total price only) — one grouped control,
   *  visually distinct from the freestanding filter chips above */
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.md, paddingVertical: space.xs, borderRadius: radius.pill },
  segmentActive: { backgroundColor: color.primary },
  segmentLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },
  segmentLabelActive: { fontFamily: font.bodySemi, fontSize: fontSize.sm, color: color.onPrimary },
});
