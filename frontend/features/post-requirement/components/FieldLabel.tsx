import { Text, StyleSheet } from 'react-native';
import { color, font, fontSize } from '../../../components/ui/tokens';

export function FieldLabel({ children, optional }: { children: string; optional?: boolean }) {
  return (
    <Text style={styles.fieldLabel}>
      {children}
      {optional && <Text style={styles.fieldLabelOptional}> — optional</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  fieldLabelOptional: { fontFamily: font.body, color: color.inkFaint },
});
