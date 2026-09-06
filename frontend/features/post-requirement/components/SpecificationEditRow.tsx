import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { color, radius, space } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';
import { XGlyph } from './XGlyph';

export interface SpecRowDraft {
  id: string;
  label: string;
  value: string;
}

export function SpecificationEditRow({
  row,
  onChangeLabel,
  onChangeValue,
  onRemove,
}: {
  row: SpecRowDraft;
  onChangeLabel: (v: string) => void;
  onChangeValue: (v: string) => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.specEditRow}>
      <TextInput
        value={row.label}
        onChangeText={onChangeLabel}
        placeholder="e.g. Platform area"
        placeholderTextColor={color.inkFaint}
        style={[sharedStyles.input, styles.specEditLabelInput]}
      />
      <TextInput
        value={row.value}
        onChangeText={onChangeValue}
        placeholder="e.g. 240 sqm (20.0 m × 12.0 m)"
        placeholderTextColor={color.inkFaint}
        style={[sharedStyles.input, styles.specEditValueInput]}
      />
      <Pressable onPress={onRemove} style={styles.specEditRemove} hitSlop={8}>
        <XGlyph tone={color.inkFaint} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  specEditRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  specEditLabelInput: { flex: 1, minWidth: 120, marginTop: 0 },
  specEditValueInput: { flex: 2, minWidth: 160, marginTop: 0 },
  specEditRemove: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
