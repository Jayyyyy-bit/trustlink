// features/requirement-detail/components/WideReleasedHeaderCard.tsx

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font, fontSize, letterSpacing, space, radius, layout } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { formatDateTime } from '../format';
import { SORT_OPTIONS, useOwnerReleased } from '../useOwnerReleased';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';

export function WideReleasedHeaderCard({
  st,
  requirement,
}: {
  st: ReturnType<typeof useOwnerReleased>;
  requirement: Requirement;
}) {
  return (
    <View style={sharedStyles.wideCard}>
      <View style={styles.wideReleasedHeaderRow}>
        <View style={{ minWidth: 0 }}>
          <Text style={styles.wideSectionTitle}>
            {st.visible.length} quotation{st.visible.length === 1 ? '' : 's'} released
          </Text>
          <Text style={sharedStyles.mutedSmall}>
            Opened {formatDateTime(requirement.closingAt)}
            {st.withdrawn.length > 0
              ? ` · ${st.withdrawn.length} withdrawal${st.withdrawn.length === 1 ? '' : 's'} in the record`
              : ''}
            {st.flaggedCount > 0 && (
              <Text style={{ color: color.danger }}>
                {' · '}{st.flaggedCount} integrity flag{st.flaggedCount === 1 ? '' : 's'}
              </Text>
            )}
          </Text>
        </View>
        <View style={sharedStyles.wideMetaSpacer} />
        <View style={styles.wideSortRow}>
          <SectionLabel>Sort</SectionLabel>
          {SORT_OPTIONS.map((option) => {
            const active = option.key === st.sortKey;
            return (
              <Pressable
                key={option.key}
                onPress={() => st.handleSortPress(option.key)}
                style={[styles.wideSortChip, active ? styles.wideSortChipActive : null]}
              >
                <Text style={[styles.wideSortChipLabel, active ? styles.wideSortChipLabelActive : null]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wideReleasedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flexWrap: 'wrap',
  },
  wideSectionTitle: {
    fontFamily: font.display,
    fontSize: fontSize.lg,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
  },
  wideSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexWrap: 'wrap',
  },
  wideSortChip: {
    minHeight: layout.minTouchTarget,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    justifyContent: 'center',
    backgroundColor: color.surface,
  },
  wideSortChipActive: {
    backgroundColor: color.primaryFaint,
    borderColor: color.primaryBorder,
  },
  wideSortChipLabel: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.sm,
    color: color.inkMuted,
  },
  wideSortChipLabelActive: {
    color: color.primary,
  },
});
