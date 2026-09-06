// features/business-profile/components/FieldLabel.tsx
import { Text, StyleSheet } from 'react-native';
import { color, font, fontSize } from '../../../components/ui/tokens';

export function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  fieldLabel: { fontFamily: font.bodySemi, fontSize: fontSize.sm, color: color.ink },
});
