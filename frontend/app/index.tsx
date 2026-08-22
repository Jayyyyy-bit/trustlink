import { View, Text } from 'react-native';
import { color, font, fontSize, letterSpacing, space } from '../components/ui/tokens';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.canvas,
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.md,
      }}
    >
      <Text style={{ fontFamily: font.display, fontSize: fontSize.display, color: color.ink }}>
        TrustLink
      </Text>
      <Text style={{ fontFamily: font.body, fontSize: fontSize.base, color: color.inkMuted }}>
        Fonts and tokens are wired up.
      </Text>
      <Text
        style={{
          fontFamily: font.mono,
          fontSize: fontSize.micro,
          letterSpacing: letterSpacing.label,
          color: color.primary,
        }}
      >
        SEALED
      </Text>
    </View>
  );
}