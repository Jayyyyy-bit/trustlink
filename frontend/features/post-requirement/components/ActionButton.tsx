import { Pressable, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, radius, space, layout } from '../../../components/ui/tokens';

type ActionVariant = 'primary' | 'outline' | 'text';

export function ActionButton({
  label,
  onPress,
  variant = 'outline',
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  variant?: ActionVariant;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: variant === 'primary' ? (pressed ? color.primaryPressed : color.primary) : variant === 'text' ? 'transparent' : color.surface,
          borderColor: variant === 'outline' ? color.border : variant === 'text' ? 'transparent' : color.primary,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text style={[styles.actionButtonLabel, { color: variant === 'primary' ? color.onPrimary : variant === 'text' ? color.inkMuted : color.ink }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: { minHeight: layout.minTouchTarget, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  actionButtonLabel: { fontFamily: font.bodySemi, fontSize: fontSize.sm },
});
