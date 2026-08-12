import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  children: React.ReactNode;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  radius?: number;
}

export function Card({ children, elevated, style, radius }: Props) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderRadius: radius ?? t.radius.lg,
          overflow: 'hidden',
        },
        elevated && t.shadow.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
}
