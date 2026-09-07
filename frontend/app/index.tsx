import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { color, font, fontSize, letterSpacing, space } from '../components/ui/tokens';
import AuthModal from '../features/auth/AuthModal';
import type { AuthMode } from '../lib/types';

/** The landing site's Log in / Get your credential buttons point at these query params, so
 *  the modal can be opened directly from a link rather than only from in-app state. */
function parseAuthMode(raw: string | string[] | undefined): AuthMode | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'login') return 'LOGIN';
  if (value === 'signup') return 'SIGNUP';
  return null;
}

export default function Index() {
  const router = useRouter();
  const { auth } = useLocalSearchParams<{ auth?: string | string[] }>();
  const authMode = parseAuthMode(auth);

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

      <AuthModal visible={authMode !== null} initialMode={authMode ?? 'LOGIN'} onClose={() => router.replace('/')} />
    </View>
  );
}