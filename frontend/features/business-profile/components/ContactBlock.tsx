// features/business-profile/components/ContactBlock.tsx
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { color, font, fontSize, space } from '../../../components/ui/tokens';
import type { Business } from '../../../lib/types';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { FieldLabel } from './FieldLabel';
import { ActionButton } from './ActionButton';

export function ContactBlock({
  business,
  editing,
  contactDraft,
  mobileDraft,
  onEdit,
  onChangeContact,
  onChangeMobile,
  onSave,
  onCancel,
}: {
  business: Business;
  editing: boolean;
  contactDraft: string;
  mobileDraft: string;
  onEdit: () => void;
  onChangeContact: (v: string) => void;
  onChangeMobile: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={sharedStyles.sideBlock}>
      <View style={sharedStyles.blockHeaderRow}>
        <SectionLabel>Contact person</SectionLabel>
        <View style={{ flex: 1 }} />
        {!editing && (
          <Pressable onPress={onEdit}>
            <Text style={sharedStyles.linkText}>Edit</Text>
          </Pressable>
        )}
      </View>
      {!editing ? (
        <View style={{ marginTop: space.md }}>
          <Text style={styles.bodyTextSemi}>{business.contactPerson}</Text>
          <Text style={styles.mono}>{business.contactMobile}</Text>
          <Text style={sharedStyles.mutedSmall}>Shown to another business only after an award between you.</Text>
        </View>
      ) : (
        <View style={{ marginTop: space.md, gap: space.sm }}>
          <FieldLabel>Contact person</FieldLabel>
          <TextInput value={contactDraft} onChangeText={onChangeContact} style={sharedStyles.input} />
          <FieldLabel>Mobile number</FieldLabel>
          <TextInput value={mobileDraft} onChangeText={onChangeMobile} style={[sharedStyles.input, styles.mono]} />
          <View style={sharedStyles.editActionsRow}>
            <ActionButton label="Save" variant="primary" onPress={onSave} />
            <ActionButton label="Cancel" variant="text" onPress={onCancel} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bodyTextSemi: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  mono: { fontFamily: font.monoMedium, fontSize: fontSize.base, color: color.inkMuted },
});
