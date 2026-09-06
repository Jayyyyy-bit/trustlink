// features/business-profile/components/Pill.tsx
import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, letterSpacing, radius, space } from '../../../components/ui/tokens';

type PillTone = 'primary' | 'neutral' | 'danger';

export function Pill({ label, tone, mono = false }: { label: string; tone: PillTone; mono?: boolean }) {
  const bg = tone === 'primary' ? color.primaryFaint : tone === 'danger' ? color.dangerFaint : color.surfaceSunken;
  const borderColor = tone === 'primary' ? color.primaryBorder : tone === 'danger' ? color.dangerBorder : color.border;
  const textColor = tone === 'primary' ? color.primary : tone === 'danger' ? color.danger : color.inkMuted;
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor }]}>
      <Text style={[mono ? styles.pillLabelMono : styles.pillLabel, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
  pillLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm },
  pillLabelMono: { fontFamily: font.monoMedium, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase' },
});
