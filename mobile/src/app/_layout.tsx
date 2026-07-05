import '../global.css';
import '../lib/nativewind-interop';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '../lib/auth';
import { useColors } from '../lib/theme';
import { darkVars, lightVars } from '../lib/theme-vars';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Barre de statut adaptée au thème (texte clair sur sombre, foncé sur clair). */
function ThemedStatusBar() {
  const scheme = useColorScheme();
  return <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

function AuthGate() {
  const { session, profile, loading } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();
  const c = useColors();

  useEffect(() => {
    if (loading) return;
    SplashScreen.hideAsync().catch(() => {});

    const inAuth = segments[0] === '(auth)';
    const onboarded = profile?.onboarded ?? false;

    if (!session) {
      if (!inAuth) router.replace('/(auth)/login');
      return;
    }

    // Connecté mais profil non complété → onboarding.
    if (session && !onboarded) {
      if (segments[1] !== 'onboarding') router.replace('/(auth)/onboarding');
      return;
    }

    // Connecté et onboardé mais encore sur les écrans d'auth → app.
    if (session && onboarded && inAuth) {
      router.replace('/(tabs)');
    }
  }, [session, profile, loading, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="analysis" />
      <Stack.Screen name="tips" />
    </Stack>
  );
}

export default function RootLayout() {
  // Suit l'apparence du système (clair/sombre du téléphone), en direct.
  const scheme = useColorScheme();
  const themeVars = scheme === 'light' ? lightVars : darkVars;

  useEffect(() => {
    // Sécurité : masque le splash même si le gate tarde.
    const t = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {/* Le View racine porte les variables de thème pour tout le sous-arbre. */}
            <View style={themeVars} className="flex-1 bg-background">
              <ThemedStatusBar />
              <AuthGate />
            </View>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
