// features/onboarding/components/CategoryChips.tsx
// Compact industry-category grid with a "see all" expansion — the grid stays even via
// optionGrid/optionGridItem instead of natural tag-wrap; "see all" sits outside the grid so
// it never disrupts the column widths.

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { font, fontSize, space, radius, color } from '../../../components/ui/tokens';
import { CATEGORIES, CATEGORY_VISIBLE_COUNT } from '../format';

export function CategoryChips({ category, onSelect }: { category: string; onSelect: (c: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const selectedOutsideVisible = !!category && CATEGORIES.indexOf(category) >= CATEGORY_VISIBLE_COUNT;
  const showAll = expanded || selectedOutsideVisible;
  const shown = showAll ? CATEGORIES : CATEGORIES.slice(0, CATEGORY_VISIBLE_COUNT);
  const hiddenCount = CATEGORIES.length - CATEGORY_VISIBLE_COUNT;

  return (
    <View>
      <View style={styles.optionGrid}>
        {shown.map((c) => {
          const active = category === c;
          return (
            <View key={c} style={styles.optionGridItem}>
              <Pressable onPress={() => onSelect(c)} style={[styles.chip, active ? styles.chipActive : null]}>
                <Text style={[styles.chipLabel, active ? styles.chipLabelActive : null]}>{c}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      {!showAll && hiddenCount > 0 && (
        <Pressable onPress={() => setExpanded(true)} style={styles.chipSeeAll}>
          <Text style={styles.chipSeeAllLabel}>See all ({hiddenCount} more)</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* even grid — lines chips up in fixed-width columns rather than fragmenting unevenly */
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm },
  optionGridItem: { flexBasis: '48%', flexGrow: 0, flexShrink: 0 },

  chip: { borderWidth: 1, borderColor: color.border, borderRadius: radius.md, paddingHorizontal: space.sm, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: color.primaryFaint, borderColor: color.primary },
  chipLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted, textAlign: 'center' },
  chipLabelActive: { color: color.primary },
  chipSeeAll: { alignSelf: 'flex-start', marginTop: space.sm, justifyContent: 'center', paddingHorizontal: space.sm, paddingVertical: 6 },
  chipSeeAllLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.primary, textDecorationLine: 'underline' },
});
