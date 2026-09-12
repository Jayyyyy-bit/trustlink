// features/my-quotations/MyQuotationsSkeleton.tsx
// Loading state for MyQuotations — page heading plus a run of row-shaped blocks, at the
// same width as the real (phone) page.

import { View, StyleSheet } from 'react-native';
import { radius, space, layout } from '../../components/ui/tokens';
import { SkeletonBlock } from '../../components/ui/Skeleton';

export function MyQuotationsSkeleton() {
  return (
    <View style={styles.page}>
      <SkeletonBlock width="50%" height={28} />
      <SkeletonBlock width="70%" height={14} />
      <View style={{ gap: space.md, marginTop: space.lg }}>
        <SkeletonBlock width="100%" height={140} radius={radius.xl} />
        <SkeletonBlock width="100%" height={140} radius={radius.xl} />
        <SkeletonBlock width="100%" height={140} radius={radius.xl} />
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
  },
});
