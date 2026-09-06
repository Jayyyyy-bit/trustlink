// features/quotation/components/AckCheckbox.tsx
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, lineHeight, radius, space } from '../../../components/ui/tokens';
import { CheckGlyph } from './Glyphs';

export function AckCheckbox({ checked, onToggle, children }: { checked: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <Pressable onPress={onToggle} style={styles.ackRow}>
      <View style={[styles.checkbox, checked ? styles.checkboxOn : null]}>{checked && <CheckGlyph />}</View>
      <Text style={styles.ackText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ackRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  checkbox: { width: 18, height: 18, marginTop: 2, borderWidth: 1.4, borderColor: color.border, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: color.primary, borderColor: color.primary },
  ackText: { flex: 1, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
});
