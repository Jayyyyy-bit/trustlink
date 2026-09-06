// features/requirement-detail/components/SortBar.tsx

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font, fontSize, space, radius, layout } from '../../../components/ui/tokens';
import { SORT_OPTIONS, type SortDir, type SortKey } from '../useOwnerReleased';

export function SortBar({
  activeKey,
  activeDir,
  onPress,
}: {
  activeKey: SortKey;
  activeDir: SortDir;
  onPress: (key: SortKey) => void;
}) {
  return (
    <View style={styles.sortBar}>
      {SORT_OPTIONS.map((option) => {
        const active = option.key === activeKey;
        return (
          <Pressable
            key={option.key}
            onPress={() => onPress(option.key)}
            style={[styles.sortChip, active ? styles.sortChipActive : null]}
          >
            <Text style={[styles.sortChipLabel, active ? styles.sortChipLabelActive : null]}>
              {option.label}{active ? (activeDir === 'asc' ? ' ↑' : ' ↓') : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sortBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  sortChip: {
    minHeight: layout.minTouchTarget,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    justifyContent: 'center',
    backgroundColor: color.surface,
  },
  sortChipActive: {
    backgroundColor: color.primaryFaint,
    borderColor: color.primary,
  },
  sortChipLabel: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.sm,
    color: color.inkMuted,
  },
  sortChipLabelActive: {
    color: color.primary,
  },
});
