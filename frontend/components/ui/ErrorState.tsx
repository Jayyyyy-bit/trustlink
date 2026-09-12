// components/ui/ErrorState.tsx
// One readable error card with a retry action, shared by every screen that loads from the
// backend. ApiError messages (lib/api/client.ts) come from the server and are already
// human-readable; anything else falls back to a generic line.

import { Pressable, Text, View, StyleSheet } from 'react-native';
import { color, font, fontSize, lineHeight, radius, space, layout } from './tokens';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
        >
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: color.dangerBorder,
    backgroundColor: color.dangerFaint,
    borderRadius: radius.xl,
    padding: space.xl,
    gap: space.sm,
    alignItems: 'flex-start',
  },
  title: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  message: { fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
  retry: {
    marginTop: space.sm,
    minHeight: layout.minTouchTarget,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    backgroundColor: color.surface,
  },
  retryPressed: { opacity: 0.7 },
  retryLabel: { fontFamily: font.bodySemi, fontSize: fontSize.sm, color: color.ink },
});
