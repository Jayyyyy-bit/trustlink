// features/business-profile/components/CapabilitiesRead.tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { font, fontSize, color, radius, space } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { StaticChip } from './Chips';

export function CapabilitiesRead({
  label,
  capabilities,
  expanded,
  onToggleExpand,
  isOwner,
  onEdit,
}: {
  label: string;
  capabilities: string[];
  expanded: boolean;
  onToggleExpand: () => void;
  isOwner: boolean;
  onEdit: () => void;
}) {
  const shown = expanded ? capabilities : capabilities.slice(0, 3);
  const hasMore = capabilities.length > 3;
  return (
    <View style={sharedStyles.block}>
      <View style={sharedStyles.blockHeaderRow}>
        <SectionLabel>{label}</SectionLabel>
        <View style={{ flex: 1 }} />
        {isOwner && (
          <Pressable onPress={onEdit}>
            <Text style={sharedStyles.linkText}>Edit capabilities and areas</Text>
          </Pressable>
        )}
      </View>
      <View style={sharedStyles.chipsWrap}>
        {shown.map((c) => <StaticChip key={c} label={c} />)}
        {hasMore && (
          <Pressable onPress={onToggleExpand} style={styles.moreChip}>
            <Text style={styles.moreChipLabel}>{expanded ? 'Show less' : `+${capabilities.length - 3} more`}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  moreChip: { borderWidth: 1, borderStyle: 'dashed', borderColor: color.borderStrong, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
  moreChipLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },
});
