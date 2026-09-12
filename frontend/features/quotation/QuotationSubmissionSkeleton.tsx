// features/quotation/QuotationSubmissionSkeleton.tsx
// Loading state for QuotationSubmission's FORM — breadcrumb, title, scope card, and the
// pricing sections — at the same width as the real (phone) page.

import { View, StyleSheet } from 'react-native';
import { radius, space, layout } from '../../components/ui/tokens';
import { SkeletonBlock } from '../../components/ui/Skeleton';

export function QuotationSubmissionSkeleton() {
  return (
    <View style={styles.page}>
      <SkeletonBlock width="40%" height={14} />
      <SkeletonBlock width="80%" height={26} />
      <SkeletonBlock width="100%" height={100} radius={radius.xl} />
      <SkeletonBlock width="100%" height={180} radius={radius.xl} />
      <SkeletonBlock width="100%" height={140} radius={radius.xl} />
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
