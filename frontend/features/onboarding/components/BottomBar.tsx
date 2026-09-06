// features/onboarding/components/BottomBar.tsx
// Back (from step two onward) on the left, the segmented step indicator centred, Continue
// on the right — three equal-flex columns so the centre stays centred regardless of
// whether Back is present.

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { font, fontSize, space, layout, color } from '../../../components/ui/tokens';
import { ActionButton } from './ActionButton';
import { SegmentedSteps } from './SegmentedSteps';
import type { FormStep } from '../types';

export function BottomBar({
  step,
  onBack,
  onContinue,
  continueLabel,
}: {
  step: FormStep;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel: string;
}) {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.bottomBarInner}>
        <View style={styles.bottomBarSide}>
          {onBack && (
            <Pressable onPress={onBack} hitSlop={6}>
              <Text style={styles.backLink}>Back</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.bottomBarCenter}>
          <SegmentedSteps step={step} />
        </View>
        <View style={[styles.bottomBarSide, styles.bottomBarSideRight]}>
          <ActionButton label={continueLabel} variant="primary" onPress={onContinue} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: { width: '100%', alignItems: 'center', backgroundColor: color.canvas, borderTopWidth: 1, borderTopColor: color.border },
  bottomBarInner: {
    width: '100%',
    maxWidth: layout.maxWidthWide,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  bottomBarSide: { flex: 1, minWidth: 0, justifyContent: 'center' },
  bottomBarSideRight: { alignItems: 'flex-end' },
  bottomBarCenter: { flex: 1, alignItems: 'center', minWidth: 0 },
  backLink: { fontFamily: font.bodyMedium, fontSize: fontSize.base, color: color.inkMuted },
});
