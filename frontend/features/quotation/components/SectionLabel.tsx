// features/quotation/components/SectionLabel.tsx
import { StyleSheet, Text } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing } from '../../../components/ui/tokens';

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: font.mono,
    fontSize: fontSize.micro,
    lineHeight: lineHeight.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.inkFaint,
  },
});
