// features/business-profile/components/Chips.tsx
// The chip family — a static display chip and its removable, editable-field variant —
// kept together as one cohesive unit since the removable chip is just the static chip
// plus its own remove glyph.
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { color, font, fontSize, iconSize, radius, space } from '../../../components/ui/tokens';

function XGlyph() {
  return <X size={iconSize.xs} color={color.inkMuted} strokeWidth={2} />;
}

export function StaticChip({ label, outline = false }: { label: string; outline?: boolean }) {
  return (
    <View style={[styles.staticChip, outline ? styles.staticChipOutline : null]}>
      <Text style={styles.staticChipLabel}>{label}</Text>
    </View>
  );
}

export function RemovableChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <View style={styles.removableChip}>
      <Text style={styles.staticChipLabel}>{label}</Text>
      <Pressable onPress={onRemove} hitSlop={8} style={styles.removableChipButton}>
        <XGlyph />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  staticChip: { borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs, backgroundColor: color.surfaceSunken },
  staticChipOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: color.border },
  staticChipLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },
  removableChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    borderRadius: radius.pill,
    paddingLeft: space.md,
    paddingRight: space.xs,
    paddingVertical: space.xs,
    backgroundColor: color.surfaceSunken,
  },
  removableChipButton: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: color.border },
});
