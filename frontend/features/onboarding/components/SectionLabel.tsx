// features/onboarding/components/SectionLabel.tsx

import { Text, StyleSheet } from 'react-native';
import { font, fontSize, letterSpacing, color } from '../../../components/ui/tokens';

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  sectionLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
});
