import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type TagVariant = 'tag-accent' | 'tag-accent-2' | 'tag-neutral' | 'tag-outline';

export function Tag({ label, variant = 'tag-neutral', small }: { label: string; variant?: TagVariant; small?: boolean }) {
  const t = useTheme();
  const styles: Record<TagVariant, { bg?: string; color: string; border?: string }> = {
    'tag-accent': { bg: t.accent[100], color: t.accent[800] },
    'tag-accent-2': { bg: t.accent2[100], color: t.accent2[800] },
    'tag-neutral': { bg: t.neutral[100], color: t.neutral[800] },
    'tag-outline': { color: t.accent[500], border: t.accent[500] },
  };
  const s = styles[variant];
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: t.radius.md * 0.75,
        backgroundColor: s.bg,
        borderWidth: s.border ? 1 : 0,
        borderColor: s.border,
      }}
    >
      <Text style={{ fontSize: small ? 10.5 : 11, letterSpacing: 0.2, color: s.color, fontFamily: t.font.bodySemiBold }}>
        {label}
      </Text>
    </View>
  );
}
