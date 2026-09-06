// features/quotation/components/StepLabel.tsx
import { StyleSheet, Text } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing } from '../../../components/ui/tokens';

export function StepLabel({ n, label, primary = false }: { n: string; label: string; primary?: boolean }) {
  return (
    <Text style={[styles.stepLabel, primary ? styles.stepLabelPrimary : null]}>
      {n} — {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  stepLabel: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.ink,
  },
  stepLabelPrimary: { color: color.primary },
});
