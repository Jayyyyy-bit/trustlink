// features/requirement-detail/components/ActionButton.tsx

import { Pressable, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, space, radius, layout } from '../../../components/ui/tokens';

export type ActionButtonVariant = 'primary' | 'outline' | 'danger' | 'text' | 'tinted' | 'ink';

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  variant?: ActionButtonVariant;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor:
            variant === 'primary' ? (pressed ? color.primaryPressed : color.primary)
            : variant === 'ink' ? color.ink
            : variant === 'tinted' ? color.primaryFaint
            : variant === 'text' ? 'transparent'
            : color.surface,
          borderColor:
            variant === 'danger' ? color.dangerBorder
            : variant === 'outline' ? color.border
            : variant === 'text' ? 'transparent'
            : variant === 'tinted' ? color.primaryBorder
            : variant === 'ink' ? color.ink
            : color.primary,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.actionButtonLabel,
          {
            color:
              variant === 'primary' ? color.onPrimary
              : variant === 'ink' ? color.canvas
              : variant === 'danger' ? color.danger
              : variant === 'text' ? color.inkMuted
              : variant === 'tinted' ? color.primary
              : color.ink,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    minHeight: layout.minTouchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  actionButtonLabel: {
    fontFamily: font.bodySemi,
    fontSize: fontSize.base,
  },
});
