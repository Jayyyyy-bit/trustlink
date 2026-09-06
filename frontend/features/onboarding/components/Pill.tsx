// features/onboarding/components/Pill.tsx
// Generic label/active/onPress pill — used directly for business type. OperationsScreen
// renders the same visual (plus a check glyph and a blocked state) inline rather than
// through this component, so its pill/pillActive/pillLabel/pillLabelActive styles are
// duplicated there rather than shared from here.

import { Pressable, Text, StyleSheet } from 'react-native';
import { font, fontSize, space, radius, color } from '../../../components/ui/tokens';

export function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active ? styles.pillActive : null]}>
      <Text style={[styles.pillLabel, active ? styles.pillLabelActive : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: { borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs + 2, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: color.primaryFaint, borderColor: color.primary },
  pillLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted, textAlign: 'center' },
  pillLabelActive: { color: color.primary },
});
