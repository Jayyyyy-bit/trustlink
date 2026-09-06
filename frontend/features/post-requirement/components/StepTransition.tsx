import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { PostRequirementState } from '../../../lib/types';
import { STEP_ORDER } from '../constants';

/* Step transition: horizontal slide + cross-fade. Identical technique to Onboarding.tsx's
 * StepTransition, over all four PostRequirementState members. */

const STEP_TRANSITION_MS = 320;
const STEP_TRANSITION_EASING = Easing.inOut(Easing.cubic);

export function StepTransition({ step, children }: { step: PostRequirementState; children: ReactNode }) {
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
      const dir = newOrder > prevOrder ? 1 : -1;
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
  stepTransitionWrap: { width: '100%', position: 'relative', overflow: 'hidden' },
  stepTransitionLayer: { width: '100%' },
  stepTransitionGhost: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
