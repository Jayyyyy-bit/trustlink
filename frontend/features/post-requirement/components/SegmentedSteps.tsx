import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, letterSpacing, radius, space } from '../../../components/ui/tokens';
import type { PostRequirementState } from '../../../lib/types';
import { STEP_ORDER, STEP_LABELS } from '../constants';

/* Same shape as Onboarding.tsx's SegmentedSteps — completed segments filled, the current
 * one filled and stronger, future ones a muted track. */

export function SegmentedSteps({ step }: { step: PostRequirementState }) {
  const current = STEP_ORDER.indexOf(step);
  return (
    <View style={styles.segmentedSteps}>
      {STEP_ORDER.map((s, i) => {
        const now = i === current;
        const done = i < current;
        return (
          <View key={s} style={styles.segmentedStepItem}>
            <Text style={[styles.segmentedStepLabel, now ? styles.segmentedStepLabelNow : done ? styles.segmentedStepLabelDone : null]} numberOfLines={1}>
              {STEP_LABELS[s].toUpperCase()}
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
  segmentedSteps: { flexDirection: 'row', alignItems: 'flex-start', gap: space.lg, width: '100%', maxWidth: 480 },
  segmentedStepItem: { flex: 1, minWidth: 76, gap: space.xs },
  segmentedStepLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, color: color.inkFaint },
  segmentedStepLabelNow: { fontFamily: font.monoMedium, color: color.ink },
  segmentedStepLabelDone: { color: color.inkMuted },
  segmentedStepTrack: { height: 4, borderRadius: radius.pill, backgroundColor: color.border, overflow: 'hidden' },
  segmentedStepFill: { height: '100%', width: '100%', borderRadius: radius.pill, backgroundColor: color.primaryBorder },
  segmentedStepFillNow: { backgroundColor: color.primary },
});
