// features/business-profile/components/SectionLabel.tsx
import { Text, StyleSheet } from 'react-native';
import { color, font, fontSize, letterSpacing } from '../../../components/ui/tokens';

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  sectionLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkMuted },
});
