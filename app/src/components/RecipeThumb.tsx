import React from 'react';
import { View, Image } from 'react-native';
import { UtensilsCrossed } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export function RecipeThumb({ size = 52, radius = 12, imageUrl }: { size?: number; radius?: number; imageUrl?: string | null }) {
  const t = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden', backgroundColor: t.accent2[100], alignItems: 'center', justifyContent: 'center' }}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <UtensilsCrossed size={size * 0.4} color={t.accent2[500]} strokeWidth={2} />
      )}
    </View>
  );
}
