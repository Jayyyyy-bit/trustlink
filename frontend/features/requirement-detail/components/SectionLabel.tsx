// features/requirement-detail/components/SectionLabel.tsx

import { Text, StyleSheet } from 'react-native';
import { font, fontSize, lineHeight, letterSpacing, color, space } from '../../../components/ui/tokens';

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
    color: color.inkMuted,
    marginBottom: space.sm,
  },
});
