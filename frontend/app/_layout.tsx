import '../global.css';

import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useAuthStore } from '@/store/authStore';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    const root = segments[0];
    const inDashboard = root === 'dashboard';
    const inPublicRoute = !root || root === 'register' || root === 'login';

    if (!isAuthenticated && inDashboard) {
      router.replace('/');
    } else if (isAuthenticated && inPublicRoute) {
      router.replace('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, segments, router]);

  if (!hasHydrated) {
    return null;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="login" />
        <Stack.Screen name="dashboard" />
      </Stack>
    </AuthGuard>
  );
}
