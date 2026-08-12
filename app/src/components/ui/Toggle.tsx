import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export function Toggle({ value, onChange, disabled }: { value: boolean; onChange: () => void; disabled?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={disabled ? undefined : onChange} hitSlop={6} style={{ opacity: disabled ? 0.45 : 1 }}>
      <View
        style={{
          width: 44,
          height: 26,
          borderRadius: t.radius.pill,
          padding: 2,
          justifyContent: 'center',
          alignItems: value ? 'flex-end' : 'flex-start',
          backgroundColor: value ? t.accent[500] : t.neutral[300],
        }}
      >
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' }} />
      </View>
    </Pressable>
  );
}
