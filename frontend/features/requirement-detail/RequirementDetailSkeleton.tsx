// features/requirement-detail/RequirementDetailSkeleton.tsx
// Loading state for RequirementDetail — header, overview block, and a side panel, at the
// same width as the real (phone) page.

import { View, StyleSheet } from 'react-native';
import { radius, space, layout } from '../../components/ui/tokens';
import { SkeletonBlock } from '../../components/ui/Skeleton';

export function RequirementDetailSkeleton() {
  return (
    <View style={styles.page}>
      <SkeletonBlock width="60%" height={14} />
      <SkeletonBlock width="90%" height={28} />
      <SkeletonBlock width="100%" height={140} radius={radius.xl} />
      <SkeletonBlock width="100%" height={200} radius={radius.xl} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: layout.maxWidth,
    marginHorizontal: 'auto',
    paddingHorizontal: layout.screenPadding,
    paddingTop: space.xxl,
    gap: space.lg,
  },
});
