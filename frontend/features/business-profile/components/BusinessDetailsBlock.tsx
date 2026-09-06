// features/business-profile/components/BusinessDetailsBlock.tsx
import { View, Text, TextInput, Pressable } from 'react-native';
import { space } from '../../../components/ui/tokens';
import type { Business } from '../../../lib/types';
import { businessTypeLabel } from '../format';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { FieldLabel } from './FieldLabel';
import { LabelValueRow } from './LabelValueRow';
import { ActionButton } from './ActionButton';

export function BusinessDetailsBlock({
  business,
  isOwner,
  editing,
  cityDraft,
  provinceDraft,
  onEdit,
  onChangeCity,
  onChangeProvince,
  onSave,
  onCancel,
}: {
  business: Business;
  isOwner: boolean;
  editing: boolean;
  cityDraft: string;
  provinceDraft: string;
  onEdit: () => void;
  onChangeCity: (v: string) => void;
  onChangeProvince: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={sharedStyles.sideBlock}>
      <View style={sharedStyles.blockHeaderRow}>
        <SectionLabel>Business details</SectionLabel>
        <View style={{ flex: 1 }} />
        {isOwner && !editing && (
          <Pressable onPress={onEdit}>
            <Text style={sharedStyles.linkText}>Edit</Text>
          </Pressable>
        )}
      </View>
      {!editing ? (
        <View style={{ gap: space.sm, marginTop: space.md }}>
          <LabelValueRow label="Registered name" value={business.registeredName} />
          <LabelValueRow label="Business type" value={businessTypeLabel(business.businessType)} />
          <LabelValueRow label="Industry" value={business.category} />
          <LabelValueRow label="Registered location" value={`${business.city}, ${business.province}`} />
        </View>
      ) : (
        <View style={{ marginTop: space.md, gap: space.sm }}>
          <FieldLabel>City</FieldLabel>
          <TextInput value={cityDraft} onChangeText={onChangeCity} style={sharedStyles.input} />
          <FieldLabel>Province</FieldLabel>
          <TextInput value={provinceDraft} onChangeText={onChangeProvince} style={sharedStyles.input} />
          <Text style={sharedStyles.mutedSmall}>
            Registered name, business type, and industry come from your verified record.
          </Text>
          <View style={sharedStyles.editActionsRow}>
            <ActionButton label="Save" variant="primary" onPress={onSave} />
            <ActionButton label="Cancel" variant="text" onPress={onCancel} />
          </View>
        </View>
      )}
    </View>
  );
}
