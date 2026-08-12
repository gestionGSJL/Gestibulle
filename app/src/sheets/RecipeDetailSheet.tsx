import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Sheet, Card } from '../components/ui';
import { RecipeThumb } from '../components/RecipeThumb';
import { useFamilyData } from '../state/FamilyDataContext';
import { Recipe } from '../types/models';
import { Pressable } from 'react-native';

export function RecipeDetailSheet({ visible, recipe, onClose }: { visible: boolean; recipe: Recipe | null; onClose: () => void }) {
  const t = useTheme();
  const { groceryItems, addIngredientToGrocery } = useFamilyData();

  if (!recipe) return null;

  return (
    <Sheet visible={visible} onClose={onClose} maxHeightPct={84}>
      <View style={{ marginHorizontal: -20, marginTop: -18, aspectRatio: 16 / 9, backgroundColor: t.accent2[100], alignItems: 'center', justifyContent: 'center' }}>
        <RecipeThumb size={64} radius={0} />
      </View>
      <Text style={{ fontFamily: t.font.heading, fontSize: 22, color: t.text, marginTop: 18 }}>{recipe.name}</Text>
      <Text style={{ fontSize: 13, color: t.neutral[700], marginTop: 4 }}>{recipe.prep_time} · {recipe.tag}</Text>
      <Text style={{ fontFamily: t.font.heading, fontSize: 16, color: t.text, marginVertical: 12 }}>Ingrédients</Text>
      <Card>
        {recipe.ingredients.map((name, i) => {
          const added = groceryItems.some((g) => g.name.toLowerCase() === name.toLowerCase());
          return (
            <View
              key={i}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12,
                borderBottomWidth: i === recipe.ingredients.length - 1 ? 0 : 1, borderBottomColor: t.neutral[200],
              }}
            >
              <Text style={{ flex: 1, fontSize: 14.5, color: t.text }}>{name}</Text>
              <Pressable
                disabled={added}
                onPress={() => addIngredientToGrocery(name)}
                style={{
                  paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999,
                  backgroundColor: added ? t.accent2[100] : t.accent[500],
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: added ? t.accent2[800] : '#fff' }}>
                  {added ? 'Ajouté ✓' : '+ Ajouter'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </Card>
    </Sheet>
  );
}
