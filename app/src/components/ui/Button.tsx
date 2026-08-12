import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, StyleProp, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', block, disabled, loading, style }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { borderRadius: t.radius.pill, paddingHorizontal: t.space[4] },
        block && { width: '100%' },
        variant === 'primary' && { backgroundColor: pressed ? t.accent[700] : t.accent[500] },
        variant === 'secondary' && {
          borderWidth: 1,
          borderColor: t.neutral[300],
          backgroundColor: pressed ? t.neutral[200] : 'transparent',
        },
        variant === 'ghost' && { backgroundColor: pressed ? `${t.accent[500]}22` : 'transparent' },
        (disabled || loading) && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? t.bg : t.accent[600]} />
      ) : (
        <Text
          style={[
            styles.label,
            { fontFamily: t.font.heading },
            variant === 'primary' && { color: t.bg },
            variant === 'secondary' && { color: t.text },
            variant === 'ghost' && { color: t.accent[700] },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    fontSize: 14.5,
  },
});
