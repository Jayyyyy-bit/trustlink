// features/business-profile/BusinessProfileSkeleton.tsx
// Loading state for BusinessProfile — cover band, avatar, name, and a sidebar block, at
// the same width as the real (phone) page.

import { View, StyleSheet } from 'react-native';
import { color, radius, space, layout } from '../../components/ui/tokens';
import { SkeletonBlock } from '../../components/ui/Skeleton';

export function BusinessProfileSkeleton() {
  return (
    <View style={styles.page}>
      <View style={styles.mainCard}>
        <View style={styles.coverBand} />
        <View style={styles.headerBody}>
          <SkeletonBlock width={92} height={92} radius={radius.lg} />
          <SkeletonBlock width="60%" height={24} />
          <SkeletonBlock width="40%" height={14} />
          <SkeletonBlock width="100%" height={80} radius={radius.lg} />
        </View>
      </View>
      <View style={styles.sidebar}>
        <SkeletonBlock width="100%" height={120} radius={radius.lg} />
        <SkeletonBlock width="100%" height={120} radius={radius.lg} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: layout.maxWidth,
    marginHorizontal: 'auto',
    paddingHorizontal: layout.screenPadding,
    paddingTop: space.lg,
    gap: space.lg,
  },
  mainCard: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    overflow: 'hidden',
  },
  coverBand: { height: 96, backgroundColor: color.surfaceSunken },
  headerBody: { padding: space.xl, gap: space.lg, marginTop: -46 },
  sidebar: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    padding: space.xl,
    gap: space.lg,
  },
});
