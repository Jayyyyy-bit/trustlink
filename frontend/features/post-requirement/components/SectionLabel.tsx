import { Text, StyleSheet } from 'react-native';
import { font, fontSize, letterSpacing, color } from '../../../components/ui/tokens';

export function SectionLabel({ children, tone }: { children: string; tone?: string }) {
  return <Text style={[styles.sectionLabel, tone ? { color: tone } : null]}>{children}</Text>;
}

const styles = StyleSheet.create({
  sectionLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
});
