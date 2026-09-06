// features/home-feed/components/CategoryPills.tsx
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { color, font, fontSize, radius, space } from '../../../components/ui/tokens';

export function CategoryPills({
  categories,
  active,
  onSelect,
}: {
  categories: { name: string; count: number }[];
  active: string;
  onSelect: (name: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
      {categories.map((c) => {
        const on = c.name === active;
        return (
          <Pressable
            key={c.name}
            onPress={() => onSelect(c.name)}
            style={[styles.categoryPill, on ? styles.categoryPillActive : null]}
          >
            <Text style={[styles.categoryPillLabel, on ? styles.categoryPillLabelActive : null]}>{c.name}</Text>
            <Text style={[styles.categoryPillCount, on ? styles.categoryPillCountActive : null]}>{c.count}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoryRow: { flexDirection: 'row', gap: space.sm, paddingVertical: space.md },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm },
  categoryPillActive: { backgroundColor: color.ink, borderColor: color.ink },
  categoryPillLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },
  categoryPillLabelActive: { color: color.canvas },
  categoryPillCount: { fontFamily: font.mono, fontSize: fontSize.micro, color: color.inkFaint },
  categoryPillCountActive: { color: color.canvas },
});
