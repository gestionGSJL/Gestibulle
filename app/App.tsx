import 'react-native-url-polyfill/auto';
import React, { useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import { Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import * as Notifications from 'expo-notifications';

import { ThemeProvider } from './src/theme/ThemeContext';
import { AuthProvider } from './src/state/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    Caprasimo_400Regular,
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  useEffect(() => {
    // Foreground taps on a notification just bring the app forward — no deep-link routing yet.
    const sub = Notifications.addNotificationResponseReceivedListener(() => {});
    return () => sub.remove();
  }, []);

  const onLayout = useCallback(() => {}, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider onLayout={onLayout}>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
