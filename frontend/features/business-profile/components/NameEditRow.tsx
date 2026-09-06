// features/business-profile/components/NameEditRow.tsx
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { font, color, space } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';
import { FieldLabel } from './FieldLabel';
import { ActionButton } from './ActionButton';

export function NameEditRow({
  registeredName,
  draft,
  onChange,
  onSave,
  onCancel,
}: {
  registeredName: string;
  draft: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={{ maxWidth: 480, gap: space.sm }}>
      <FieldLabel>Display name</FieldLabel>
      <TextInput value={draft} onChangeText={onChange} style={sharedStyles.input} />
      <Text style={sharedStyles.mutedSmall}>
        Registered name stays <Text style={styles.mutedSmallStrong}>{registeredName}</Text>.
      </Text>
      <View style={sharedStyles.editActionsRow}>
        <ActionButton label="Save" variant="primary" onPress={onSave} />
        <ActionButton label="Cancel" variant="text" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mutedSmallStrong: { fontFamily: font.bodyMedium, color: color.ink },
});
