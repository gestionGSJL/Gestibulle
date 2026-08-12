import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Sheet } from '../components/ui';
import { RecipeThumb } from '../components/RecipeThumb';
import { Recipe } from '../types/models';

export function RecipePickerSheet({
  visible,
  recipes,
  onClose,
  onSelect,
}: {
  visible: boolean;
  recipes: Recipe[];
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
}) {
  const t = useTheme();
  return (
    <Sheet visible={visible} onClose={onClose} title="Choisir une recette" maxHeightPct={72}>
      {recipes.map((r, i) => (
        <Pressable
          key={r.id}
          onPress={() => onSelect(r)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: i === recipes.length - 1 ? 0 : 1, borderBottomColor: t.neutral[200] }}
        >
          <RecipeThumb size={48} radius={10} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14.5, fontWeight: '600', color: t.text }}>{r.name}</Text>
            <Text style={{ fontSize: 12, color: t.neutral[600] }}>{r.prep_time} · {r.tag}</Text>
          </View>
        </Pressable>
      ))}
    </Sheet>
  );
}
