// features/quotation/components/AddDashedButton.tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import { color, font, fontSize, radius, space } from '../../../components/ui/tokens';

export function AddDashedButton({ label, onPress, prominent = false }: { label: string; onPress: () => void; prominent?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.addDashed, prominent ? styles.addDashedProminent : null]}>
      <Text style={[styles.addDashedLabel, prominent ? styles.addDashedLabelProminent : null]}>+ {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  addDashed: { alignSelf: 'flex-start', borderWidth: 1, borderStyle: 'dashed', borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm },
  addDashedLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },
  addDashedProminent: { borderStyle: 'solid', borderColor: color.primary, backgroundColor: color.primaryFaint },
  addDashedLabelProminent: { fontFamily: font.bodySemi, color: color.primary },
});
