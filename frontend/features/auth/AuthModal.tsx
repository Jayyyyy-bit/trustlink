// features/auth/AuthModal.tsx
// One component, two states from an AuthMode prop — LOGIN and SIGNUP share the same shell
// (overlay, card, entrance animation) and swap only the title, copy, and submit action.
// Toggling between them (the "Create one" / "Log in" link) is local state, seeded from
// `initialMode` whenever the modal opens — it never asks the caller to re-render with a new
// mode mid-session.
//
// Rebuilt from docs/design/Trustlink Landing.dc.html's login/signup card: same fade+scale
// entrance and per-field fade-up, condensed to the two fields the backend actually accepts
// (email + password) — the design's business-name/mobile signup fields and social/"help me
// sign up" buttons have no backing endpoint, so they're cut rather than left as dead ends.
//
// Login calls POST /auth/login, stores the returned tokens, and routes to /home. Signup
// calls POST /auth/signup (no tokens back — signup only ever creates a bare UNVERIFIED
// account, see backend/src/routes/auth.ts) and routes to /onboarding.

import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withDelay, withTiming } from 'react-native-reanimated';
import { color, font, fontSize, lineHeight, letterSpacing, radius, space, layout } from '../../components/ui/tokens';
import { apiFetch, ApiError, storeTokens } from '../../lib/api/client';
import type { AuthMode } from '../../lib/types';

const CARD_MAX_WIDTH = 440;
const ENTRANCE_EASING = Easing.bezier(0.32, 0.72, 0, 1);

export interface AuthModalProps {
  visible: boolean;
  initialMode: AuthMode;
  onClose: () => void;
}

export default function AuthModal({ visible, initialMode, onClose }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overlayOpacity = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.94);
  const fieldsOpacity = useSharedValue(0);
  const fieldsY = useSharedValue(10);

  // Reset to a clean form and replay the entrance every time the modal opens.
  useEffect(() => {
    if (!visible) return;
    setMode(initialMode);
    setEmail('');
    setPassword('');
    setError(null);
    setLoading(false);

    overlayOpacity.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.ease) });
    cardOpacity.value = withDelay(90, withTiming(1, { duration: 420, easing: Easing.out(Easing.ease) }));
    cardScale.value = withDelay(90, withTiming(1, { duration: 560, easing: ENTRANCE_EASING }));
    fieldsOpacity.value = withDelay(160, withTiming(1, { duration: 420, easing: Easing.out(Easing.ease) }));
    fieldsY.value = withDelay(160, withTiming(0, { duration: 420, easing: ENTRANCE_EASING }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialMode]);

  // Replay only the fields' fade-up when the mode toggles inside an already-open modal —
  // matches the design's per-block tl-fade-up on the sc-if swap between login/signup.
  useEffect(() => {
    if (!visible) return;
    fieldsOpacity.value = 0;
    fieldsY.value = 10;
    fieldsOpacity.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.ease) });
    fieldsY.value = withTiming(0, { duration: 380, easing: ENTRANCE_EASING });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value, transform: [{ scale: cardScale.value }] }));
  const fieldsStyle = useAnimatedStyle(() => ({ opacity: fieldsOpacity.value, transform: [{ translateY: fieldsY.value }] }));

  const isLogin = mode === 'LOGIN';

  const handleSwitchMode = () => {
    if (loading) return;
    setMode(isLogin ? 'SIGNUP' : 'LOGIN');
    setError(null);
  };

  const handleSubmit = async () => {
    if (loading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Enter your email and password.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        const data = await apiFetch<{ accessToken: string; refreshToken: string; expiresIn: number }>('/auth/login', {
          method: 'POST',
          body: { email: trimmedEmail, password },
          skipAuth: true,
        });
        await storeTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        onClose();
        router.replace('/home');
      } else {
        await apiFetch('/auth/signup', {
          method: 'POST',
          body: { email: trimmedEmail, password },
          skipAuth: true,
        });
        onClose();
        router.replace('/onboarding');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} disabled={loading} />

        <Pressable style={styles.backButton} onPress={onClose} disabled={loading} hitSlop={space.sm}>
          <Text style={styles.backButtonLabel}>Back to site</Text>
        </Pressable>

        <ScrollView
          style={StyleSheet.absoluteFill}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          pointerEvents="box-none"
        >
          <Animated.View style={[styles.card, cardStyle]}>
            <View style={styles.headingBlock}>
              <Text style={styles.title}>{isLogin ? 'Welcome back.' : 'Get your credential.'}</Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? 'Log in to see your credential and who has been checking it.'
                  : 'Free to start. All we need is your email and a password.'}
              </Text>
            </View>

            <Animated.View style={fieldsStyle}>
              {error && (
                <View style={styles.errorBanner}>
                  <View style={styles.errorDot} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.fields}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@business.ph"
                    placeholderTextColor={color.inkFaint}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    editable={!loading}
                    style={styles.input}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={color.inkFaint}
                    secureTextEntry
                    editable={!loading}
                    style={styles.input}
                  />
                </View>
              </View>

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={({ pressed }) => [styles.submit, pressed && !loading && styles.submitPressed, loading && styles.submitDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color={color.canvas} />
                ) : (
                  <Text style={styles.submitLabel}>{isLogin ? 'Log in' : 'Create my account'}</Text>
                )}
              </Pressable>

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <Text onPress={handleSwitchMode} style={styles.switchLink}>
                    {isLogin ? 'Create one' : 'Log in'}
                  </Text>
                </Text>
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'transparent' },

  backButton: {
    position: 'absolute',
    top: space.xxl,
    right: layout.screenPadding,
    zIndex: 3,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
  },
  backButtonLabel: { fontFamily: font.body, fontSize: fontSize.sm, color: color.ink },

  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 96,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: space.section,
  },

  card: {
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.xl,
    padding: space.xxxl,
    gap: space.xxl,
  },

  headingBlock: { gap: space.sm },
  title: { fontFamily: font.display, fontSize: fontSize.display, lineHeight: lineHeight.display, letterSpacing: letterSpacing.tight, color: color.ink },
  subtitle: { fontFamily: font.body, fontSize: fontSize.base, lineHeight: lineHeight.base, color: color.inkMuted },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    borderWidth: 1,
    borderColor: color.dangerBorder,
    backgroundColor: color.dangerFaint,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.lg,
  },
  errorDot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: color.danger, marginTop: 5 },
  errorText: { flex: 1, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.ink },

  fields: { gap: space.lg, marginBottom: space.xl },
  field: { gap: space.sm },
  fieldLabel: {
    fontFamily: font.mono,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.inkFaint,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    fontFamily: font.body,
    fontSize: fontSize.base,
    color: color.ink,
    backgroundColor: color.surface,
  },

  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTouchTarget,
    backgroundColor: color.ink,
    borderRadius: radius.pill,
    paddingVertical: space.lg,
    paddingHorizontal: space.xxl,
  },
  submitPressed: { opacity: 0.85 },
  submitDisabled: { opacity: 0.7 },
  submitLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.base, color: color.canvas },

  switchRow: { alignItems: 'center', marginTop: space.xl },
  switchText: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted, textAlign: 'center' },
  switchLink: { fontFamily: font.bodyMedium, color: color.ink },
});
