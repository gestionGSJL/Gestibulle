import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 7,
        paddingHorizontal: 16,
        borderRadius: t.radius.pill,
        backgroundColor: active ? t.accent[300] : t.neutral[100],
      }}
    >
      <Text style={{ fontSize: 13.5, fontFamily: t.font.bodySemiBold, color: active ? t.accent[800] : t.text }}>{label}</Text>
    </Pressable>
  );
}
