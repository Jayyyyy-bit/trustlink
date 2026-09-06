// features/onboarding/components/StepTransition.tsx
// Wraps only the step's content (title + fields) inside shellInner — the header and the
// fixed bottom bar are rendered once by the root component, outside this wrapper, so they
// never move during the transition.
//
// Forward (higher STEP_ORDER index): outgoing exits left, incoming enters from the right.
// Back: reversed. Both layers also cross-fade opacity alongside the slide (outgoing 1→0,
// incoming 0→1) on the same ease-in-out timing, so the swap reads as one continuous motion
// rather than a hard cut. Only the just-left step's most recent render is kept as a static,
// non-interactive "outgoing" layer while it animates out — IdentityScreen, OperationsScreen,
// and DocumentsScreen all re-seed their local field state from the `initial`/route-held
// draft, so a remounted outgoing snapshot still shows the just-submitted values, never a
// blank form.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { STEP_ORDER } from '../format';
import type { FormStep } from '../types';

const STEP_TRANSITION_MS = 320;
const STEP_TRANSITION_EASING = Easing.inOut(Easing.cubic);

export function StepTransition({ step, children }: { step: FormStep; children: ReactNode }) {
  const orderRef = useRef(STEP_ORDER.indexOf(step));
  const lastRenderRef = useRef<ReactNode>(children);
  const [outgoing, setOutgoing] = useState<ReactNode>(null);
  const [width, setWidth] = useState(0);

  const incomingX = useSharedValue(0);
  const outgoingX = useSharedValue(0);
  const incomingOpacity = useSharedValue(1);
  const outgoingOpacity = useSharedValue(1);

  useEffect(() => {
    const newOrder = STEP_ORDER.indexOf(step);
    const prevOrder = orderRef.current;
    if (newOrder !== prevOrder) {
      const dir = newOrder > prevOrder ? 1 : -1; // 1 = forward, -1 = back
      orderRef.current = newOrder;
      const distance = width || 480;
      const timing = { duration: STEP_TRANSITION_MS, easing: STEP_TRANSITION_EASING };

      setOutgoing(lastRenderRef.current);
      outgoingX.value = 0;
      outgoingOpacity.value = 1;
      outgoingX.value = withTiming(-dir * distance, timing, (finished) => {
        if (finished) runOnJS(setOutgoing)(null);
      });
      outgoingOpacity.value = withTiming(0, timing);

      incomingX.value = dir * distance;
      incomingOpacity.value = 0;
      incomingX.value = withTiming(0, timing);
      incomingOpacity.value = withTiming(1, timing);
    }
    lastRenderRef.current = children;
  });

  const incomingStyle = useAnimatedStyle(() => ({ transform: [{ translateX: incomingX.value }], opacity: incomingOpacity.value }));
  const outgoingStyle = useAnimatedStyle(() => ({ transform: [{ translateX: outgoingX.value }], opacity: outgoingOpacity.value }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.stepTransitionWrap} onLayout={onLayout}>
      <Animated.View style={[styles.stepTransitionLayer, incomingStyle]}>{children}</Animated.View>
      {outgoing !== null && (
        <Animated.View style={[styles.stepTransitionLayer, styles.stepTransitionGhost, outgoingStyle]} pointerEvents="none">
          {outgoing}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Sized by the in-flow incoming layer's own content (no flex:1 — this sits inside a
  // ScrollView now, not a fixed-height screen), with the outgoing layer absolutely
  // positioned over it so it doesn't affect that height while it slides away.
  stepTransitionWrap: { width: '100%', position: 'relative', overflow: 'hidden' },
  stepTransitionLayer: { width: '100%' },
  stepTransitionGhost: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
