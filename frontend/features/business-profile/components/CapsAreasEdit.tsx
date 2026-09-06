// features/business-profile/components/CapsAreasEdit.tsx
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, lineHeight, radius, space } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';
import { FieldLabel } from './FieldLabel';
import { ActionButton } from './ActionButton';
import { RemovableChip } from './Chips';

export function CapsAreasEdit({
  capsDraft,
  areasDraft,
  newCap,
  newArea,
  onChangeNewCap,
  onChangeNewArea,
  onAddCap,
  onAddArea,
  onRemoveCap,
  onRemoveArea,
  onSave,
  onCancel,
}: {
  capsDraft: string[];
  areasDraft: string[];
  newCap: string;
  newArea: string;
  onChangeNewCap: (v: string) => void;
  onChangeNewArea: (v: string) => void;
  onAddCap: () => void;
  onAddArea: () => void;
  onRemoveCap: (index: number) => void;
  onRemoveArea: (index: number) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={sharedStyles.block}>
      <Text style={styles.editHint}>
        Capabilities and service areas decide which requirements Trustlink matches and recommends to you.
      </Text>

      <FieldLabel>Capabilities</FieldLabel>
      <View style={sharedStyles.chipsWrap}>
        {capsDraft.map((c, i) => <RemovableChip key={`${c}-${i}`} label={c} onRemove={() => onRemoveCap(i)} />)}
      </View>
      <View style={styles.addRow}>
        <TextInput
          value={newCap}
          onChangeText={onChangeNewCap}
          placeholder="Add a capability"
          placeholderTextColor={color.inkFaint}
          style={[sharedStyles.input, styles.addInput]}
        />
        <ActionButton label="Add" variant="outline" onPress={onAddCap} />
      </View>

      <FieldLabel>Service areas</FieldLabel>
      <View style={sharedStyles.chipsWrap}>
        {areasDraft.map((a, i) => <RemovableChip key={`${a}-${i}`} label={a} onRemove={() => onRemoveArea(i)} />)}
      </View>
      <View style={styles.addRow}>
        <TextInput
          value={newArea}
          onChangeText={onChangeNewArea}
          placeholder="Add a city or province"
          placeholderTextColor={color.inkFaint}
          style={[sharedStyles.input, styles.addInput]}
        />
        <ActionButton label="Add" variant="outline" onPress={onAddArea} />
      </View>

      <View style={sharedStyles.editActionsRow}>
        <ActionButton label="Save changes" variant="primary" onPress={onSave} />
        <ActionButton label="Cancel" variant="text" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editHint: { fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted, backgroundColor: color.primaryFaint, borderRadius: radius.md, padding: space.md },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  addInput: { flex: 1, minWidth: 160, marginTop: 0 },
});
