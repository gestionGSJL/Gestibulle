import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export function LoadingScreen() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={t.accent[600]} size="large" />
    </View>
  );
}
