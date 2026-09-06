import { Pressable, Text, StyleSheet } from 'react-native';
import { font, fontSize, color, radius, space } from '../../../components/ui/tokens';

export function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active ? styles.pillActive : null]}>
      <Text style={[styles.pillLabel, active ? styles.pillLabelActive : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: { borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs + 2 },
  pillActive: { backgroundColor: color.primaryFaint, borderColor: color.primary },
  pillLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },
  pillLabelActive: { color: color.primary },
});
