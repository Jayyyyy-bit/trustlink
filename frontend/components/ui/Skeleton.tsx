// components/ui/Skeleton.tsx
// One pulsing block, shared by every screen's loading state. Callers compose it into
// whatever shape their real content has (a card, a row, a heading) — this component only
// ever draws a single rectangle, never a whole skeleton screen.

import { useEffect, useRef } from 'react';
import { Animated, type DimensionValue } from 'react-native';
import { color, radius } from './tokens';

export function SkeletonBlock({
  width,
  height,
  radius: cornerRadius = radius.md,
  style,
}: {
  width: DimensionValue;
  height: number;
  radius?: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: cornerRadius, backgroundColor: color.surfaceSunken, opacity },
        style,
      ]}
    />
  );
}
