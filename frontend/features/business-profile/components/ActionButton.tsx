// features/business-profile/components/ActionButton.tsx
import { Pressable, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, radius, space } from '../../../components/ui/tokens';

type ActionButtonVariant = 'primary' | 'outline' | 'text' | 'danger';

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
      style={[
        styles.actionButton,
        {
          backgroundColor: variant === 'primary' ? color.primary : variant === 'text' ? 'transparent' : color.surface,
          borderColor:
            variant === 'danger' ? color.dangerBorder : variant === 'text' ? 'transparent' : color.primaryBorder,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.actionButtonLabel,
          { color: variant === 'primary' ? color.onPrimary : variant === 'danger' ? color.danger : color.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm, alignItems: 'center', justifyContent: 'center' },
  actionButtonLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm },
});
