import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font, fontSize, layout, space } from '../../../components/ui/tokens';
import type { PostRequirementState } from '../../../lib/types';
import { SegmentedSteps } from './SegmentedSteps';
import { ActionButton } from './ActionButton';

/* Fixed bottom bar: Back (from step two onward) on the left, the segmented step indicator
 * centred, the primary action on the right — same three-column layout as Onboarding.tsx's
 * BottomBar, so the centre stays centred whether or not Back is present. */

export function BottomBar({
  step,
  onLeft,
  leftLabel,
  onPrimary,
  primaryLabel,
}: {
  step: PostRequirementState;
  onLeft?: () => void;
  leftLabel: string;
  onPrimary: () => void;
  primaryLabel: string;
}) {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.bottomBarInner}>
        <View style={styles.bottomBarSide}>
          {onLeft && (
            <Pressable onPress={onLeft} hitSlop={6}>
              <Text style={styles.backLink}>{leftLabel}</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.bottomBarCenter}>
          <SegmentedSteps step={step} />
        </View>
        <View style={[styles.bottomBarSide, styles.bottomBarSideRight]}>
          <ActionButton label={primaryLabel} variant="primary" onPress={onPrimary} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: { width: '100%', alignItems: 'center', backgroundColor: color.canvas, borderTopWidth: 1, borderTopColor: color.border },
  bottomBarInner: { width: '100%', maxWidth: layout.maxWidthWide, paddingHorizontal: layout.screenPadding, paddingVertical: space.md, flexDirection: 'row', alignItems: 'center', gap: space.md },
  bottomBarSide: { flex: 1, minWidth: 0, justifyContent: 'center' },
  bottomBarSideRight: { alignItems: 'flex-end' },
  bottomBarCenter: { flex: 1, alignItems: 'center', minWidth: 0 },
  backLink: { fontFamily: font.bodyMedium, fontSize: fontSize.base, color: color.inkMuted },
});
