import React from 'react';
import { TextInput, TextInputProps, View, Text, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export function Field({ label, children, style }: { label?: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={style}>
      {label ? (
        <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700], marginBottom: 5 }}>{label}</Text>
      ) : null}
      {children}
    </View>
  );
}

export function Input(props: TextInputProps) {
  const t = useTheme();
  return (
    <TextInput
      placeholderTextColor={t.neutral[500]}
      style={[
        {
          width: '100%',
          minHeight: 44,
          paddingHorizontal: 14,
          paddingVertical: 8,
          fontSize: 14,
          color: t.text,
          backgroundColor: t.bg,
          borderWidth: 1,
          borderColor: t.neutral[300],
          borderRadius: t.radius.pill,
          fontFamily: t.font.body,
        },
        props.style,
      ]}
      {...props}
    />
  );
}
