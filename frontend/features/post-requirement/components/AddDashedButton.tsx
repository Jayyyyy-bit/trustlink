import { Pressable, Text, StyleSheet } from 'react-native';
import { font, fontSize, color, radius, space } from '../../../components/ui/tokens';

export function AddDashedButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.addDashed}>
      <Text style={styles.addDashedLabel}>+ {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  addDashed: { alignSelf: 'flex-start', borderWidth: 1, borderStyle: 'dashed', borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm },
  addDashedLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },
});
