import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import AppHeader from '../components/ui/AppHeader';
import { mockViewer, mockAlerts } from '../features/home-feed/mock';

SplashScreen.preventAutoHideAsync();

/** Pre-login screens carry no chrome: the landing page (`/`, wherever it ends up living)
 *  and anything under onboarding. */
function isPreLoginRoute(pathname: string): boolean {
  return pathname === '/' || pathname.startsWith('/onboarding');
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    BricolageGrotesque_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMMono_400Regular,
    DMMono_500Medium,
  });
  const pathname = usePathname();

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <View style={{ flex: 1 }}>
      {!isPreLoginRoute(pathname) && (
        <AppHeader viewer={mockViewer} alertCount={mockAlerts.filter((a) => !a.read).length} />
      )}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}