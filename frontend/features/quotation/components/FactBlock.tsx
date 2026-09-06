// features/quotation/components/FactBlock.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, space } from '../../../components/ui/tokens';
import { SectionLabel } from './SectionLabel';

export function FactBlock({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <SectionLabel>{label}</SectionLabel>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  factValue: { marginTop: space.xs, fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },
});
