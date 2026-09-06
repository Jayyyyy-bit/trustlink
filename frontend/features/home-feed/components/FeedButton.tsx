// features/home-feed/components/FeedButton.tsx
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, radius, space } from '../../../components/ui/tokens';

export type ButtonVariant = 'primary' | 'outline' | 'text' | 'tinted';

export function FeedButton({
  label,
  onPress,
  variant = 'outline',
  disabled = false,
  icon,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.feedButton,
        {
          backgroundColor:
            variant === 'primary' ? (pressed ? color.primaryPressed : color.primary)
            : variant === 'tinted' ? color.primaryFaint
            : variant === 'text' ? 'transparent'
            : 'transparent',
          borderColor: variant === 'primary' ? color.primary : variant === 'tinted' ? color.primaryBorder : variant === 'text' ? 'transparent' : color.border,
          opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.feedButtonContent}>
        {icon}
        <Text
          style={[
            styles.feedButtonLabel,
            { color: variant === 'primary' ? color.onPrimary : variant === 'tinted' || variant === 'text' ? color.primary : color.inkMuted },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  feedButton: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm },
  feedButtonContent: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  feedButtonLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm },
});
