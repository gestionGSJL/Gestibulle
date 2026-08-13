import React from 'react';
import { ScrollView, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

/**
 * Shared tab-screen wrapper: reserves the device's status bar / notch height
 * (insets.top) above each screen's own header padding, so content never
 * renders underneath it. The bottom tab bar handles its own inset — see
 * TabNavigator — so this only pads a fixed minimum at the bottom.
 */
export function Screen({
  children,
  contentContainerStyle,
}: {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[{ paddingTop: insets.top, paddingBottom: 24 }, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  );
}
