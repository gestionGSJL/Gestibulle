import React from 'react';
import { Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

export function Checkbox({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          borderWidth: 2,
          borderColor: checked ? t.accent[400] : t.neutral[400],
          backgroundColor: checked ? t.accent[400] : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? <Check size={13} color="#fff" strokeWidth={3.5} /> : null}
      </View>
    </Pressable>
  );
}
