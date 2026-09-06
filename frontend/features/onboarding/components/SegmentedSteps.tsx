// features/onboarding/components/SegmentedSteps.tsx
// Three segmented progress bars, label above each. Completed segments are filled, the
// current one is filled and stronger, future ones are muted tracks — no numbers, no circles.

import { View, Text, StyleSheet } from 'react-native';
import { font, fontSize, letterSpacing, space, radius, color } from '../../../components/ui/tokens';
import { STEP_ORDER, STEP_INDICATOR_LABELS } from '../format';
import type { FormStep } from '../types';

export function SegmentedSteps({ step }: { step: FormStep }) {
  const current = STEP_ORDER.indexOf(step);
  return (
    <View style={styles.segmentedSteps}>
      {STEP_ORDER.map((s, i) => {
        const now = i === current;
        const done = i < current;
        return (
          <View key={s} style={styles.segmentedStepItem}>
            <Text
              style={[styles.segmentedStepLabel, now ? styles.segmentedStepLabelNow : done ? styles.segmentedStepLabelDone : null]}
              numberOfLines={1}
            >
              {STEP_INDICATOR_LABELS[s].toUpperCase()}
            </Text>
            <View style={styles.segmentedStepTrack}>
              {(now || done) && <View style={[styles.segmentedStepFill, now ? styles.segmentedStepFillNow : null]} />}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentedSteps: { flexDirection: 'row', alignItems: 'flex-start', gap: space.lg, width: '100%', maxWidth: 440 },
  segmentedStepItem: { flex: 1, minWidth: 84, gap: space.xs },
  segmentedStepLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, color: color.inkFaint },
  segmentedStepLabelNow: { fontFamily: font.monoMedium, color: color.ink },
  segmentedStepLabelDone: { color: color.inkMuted },
  segmentedStepTrack: { height: 4, borderRadius: radius.pill, backgroundColor: color.border, overflow: 'hidden' },
  segmentedStepFill: { height: '100%', width: '100%', borderRadius: radius.pill, backgroundColor: color.primaryBorder },
  segmentedStepFillNow: { backgroundColor: color.primary },
});
