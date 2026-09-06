// features/business-profile/components/NameReadRow.tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font, fontSize, radius, space } from '../../../components/ui/tokens';
import type { Business } from '../../../lib/types';
import { businessStatusLabel, statusTone, tierLabel } from '../format';
import { Pill } from './Pill';

export function NameReadRow({
  business,
  isOwner,
  onEdit,
}: {
  business: Business;
  isOwner: boolean;
  onEdit: () => void;
}) {
  const name = business.displayName ?? business.registeredName;
  const c = business.credibility;
  return (
    <View style={{ gap: space.sm }}>
      <View style={styles.nameRow}>
        <Text style={styles.displayName}>{name}</Text>
        {isOwner && (
          <Pressable style={styles.editChip} onPress={onEdit}>
            <Text style={styles.editChipLabel}>Edit</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.badgeRow}>
        <Pill label={businessStatusLabel(c.status)} tone={statusTone(c.status)} />
        {c.tier !== null && <Pill label={tierLabel(c.tier)} tone="neutral" mono />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.md },
  displayName: { fontFamily: font.display, fontSize: fontSize.xl, color: color.ink },
  editChip: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  editChipLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.sm },
});
