import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', borderRadius: t.radius.pill, overflow: 'hidden', borderWidth: 1, borderColor: t.neutral[300] }}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={{ paddingVertical: 7, paddingHorizontal: 14, backgroundColor: active ? t.accent[300] : 'transparent' }}
          >
            <Text style={{ fontSize: 13, fontFamily: t.font.bodySemiBold, color: active ? t.accent[800] : t.text }}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
