// features/home-feed/HomeFeedSkeleton.tsx
// Loading state for HomeFeed — same page width and vertical rhythm as the real feed
// (category pills, profile card, CTA banner, a run of requirement cards), just filled with
// pulsing blocks instead of content.

import { View, StyleSheet } from 'react-native';
import { radius, space, layout } from '../../components/ui/tokens';
import { SkeletonBlock } from '../../components/ui/Skeleton';

function CardSkeleton({ height }: { height: number }) {
  return <SkeletonBlock width="100%" height={height} radius={radius.xl} />;
}

export function HomeFeedSkeleton() {
  return (
    <View style={styles.page}>
      <View style={styles.pillsRow}>
        <SkeletonBlock width={64} height={32} radius={radius.pill} />
        <SkeletonBlock width={90} height={32} radius={radius.pill} />
        <SkeletonBlock width={76} height={32} radius={radius.pill} />
      </View>
      <CardSkeleton height={120} />
      <CardSkeleton height={80} />
      <CardSkeleton height={64} />
      <View style={{ gap: space.md }}>
        <CardSkeleton height={160} />
        <CardSkeleton height={160} />
        <CardSkeleton height={160} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: layout.maxWidthDashboard,
    marginHorizontal: 'auto',
    paddingHorizontal: layout.screenPadding,
    paddingTop: space.lg,
    gap: space.lg,
  },
  pillsRow: { flexDirection: 'row', gap: space.sm },
});
