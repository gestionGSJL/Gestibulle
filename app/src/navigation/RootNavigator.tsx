import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../state/AuthContext';
import { FamilyDataProvider } from '../state/FamilyDataContext';
import { LoadingScreen } from '../screens/auth/LoadingScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { TabNavigator } from './TabNavigator';
import { ThemeSync } from '../theme/ThemeSync';

export function RootNavigator() {
  const { loading, session, member } = useAuth();
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');

  if (loading) return <LoadingScreen />;

  if (!session) {
    return authMode === 'signIn' ? (
      <SignInScreen onSwitchToSignUp={() => setAuthMode('signUp')} />
    ) : (
      <SignUpScreen onSwitchToSignIn={() => setAuthMode('signIn')} />
    );
  }

  if (!member) return <OnboardingScreen />;

  return (
    <FamilyDataProvider>
      <ThemeSync />
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </FamilyDataProvider>
  );
}
