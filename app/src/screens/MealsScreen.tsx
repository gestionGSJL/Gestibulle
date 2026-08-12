import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useFamilyData } from '../state/FamilyDataContext';
import { Card, Button } from '../components/ui';
import { RecipeThumb } from '../components/RecipeThumb';
import { addDays, startOfWeek, toISO, MONTH_NAMES, WEEKDAY_LETTERS } from '../lib/dates';
import { useSwipe } from '../lib/useSwipe';
import { RecipePickerSheet } from '../sheets/RecipePickerSheet';
import { AiSuggestSheet } from '../sheets/AiSuggestSheet';
import { RecipeDetailSheet } from '../sheets/RecipeDetailSheet';
import { Recipe } from '../types/models';

export function MealsScreen() {
  const t = useTheme();
  const { recipes, mealPlan, setMeal, swapMeals } = useFamilyData();
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [pickerDate, setPickerDate] = useState<string | null>(null);
  const [aiDate, setAiDate] = useState<string | null>(null);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [reorderFromDate, setReorderFromDate] = useState<string | null>(null);

  const swipeHandlers = useSwipe(
    () => setWeekAnchor((a) => addDays(a, 7)),
    () => setWeekAnchor((a) => addDays(a, -7))
  );

  const weekStart = startOfWeek(weekAnchor);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekAnchor]);
  const weekLabel = `${weekStart.getDate()} – ${addDays(weekStart, 6).getDate()} ${MONTH_NAMES[addDays(weekStart, 6).getMonth()]}`;

  const recipeFor = (iso: string) => {
    const rid = mealPlan.find((m) => m.date === iso)?.recipe_id;
    return rid ? recipes.find((r) => r.id === rid) ?? null : null;
  };

  const handleDayPress = (iso: string, hasRecipe: boolean) => {
    if (reorderFromDate) {
      if (reorderFromDate !== iso) swapMeals(reorderFromDate, iso);
      setReorderFromDate(null);
      return;
    }
    if (hasRecipe) setDetailRecipe(recipeFor(iso));
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={{ padding: 22, paddingBottom: 4, fontFamily: t.font.heading, fontSize: 28, color: t.text }}>Repas de la semaine</Text>
      <Text style={{ paddingHorizontal: 22, paddingBottom: 12, fontSize: 13, color: t.neutral[700] }}>
        Planifiez, ou laissez l'IA vous proposer des idées. Appui long sur une recette pour la déplacer.
      </Text>
      <Text style={{ textAlign: 'center', paddingHorizontal: 22, paddingBottom: 16, fontSize: 14, fontWeight: '600', color: t.text }}>{weekLabel}</Text>

      <View style={{ gap: 10, paddingHorizontal: 22, paddingBottom: 22 }} {...swipeHandlers}>
        {days.map((d) => {
          const iso = toISO(d);
          const recipe = recipeFor(iso);
          const reordering = reorderFromDate === iso;
          return (
            <Card
              key={iso}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12,
                borderWidth: reordering ? 2 : 0, borderColor: t.accent[500], borderStyle: reordering ? 'dashed' : 'solid',
              }}
            >
              <View style={{ width: 38, alignItems: 'center' }}>
                <Text style={{ fontSize: 10.5, color: t.neutral[600], textTransform: 'uppercase' }}>{WEEKDAY_LETTERS[d.getDay()]}</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: t.text }}>{d.getDate()}</Text>
              </View>
              {recipe ? (
                <>
                  <Pressable onPress={() => handleDayPress(iso, true)} onLongPress={() => setReorderFromDate(iso)}>
                    <RecipeThumb size={52} radius={12} />
                  </Pressable>
                  <Pressable style={{ flex: 1 }} onPress={() => handleDayPress(iso, true)} onLongPress={() => setReorderFromDate(iso)}>
                    <Text style={{ fontSize: 14.5, fontWeight: '600', color: t.text }} numberOfLines={1}>{recipe.name}</Text>
                    <Text style={{ fontSize: 12, color: t.neutral[600] }}>{recipe.prep_time}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setMeal(iso, null)}
                    style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: t.neutral[200], alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={14} color={t.neutral[700]} />
                  </Pressable>
                </>
              ) : (
                <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                  <Button label="Choisir" variant="ghost" onPress={() => setPickerDate(iso)} style={{ flex: 1 }} />
                  <Button label="IA suggère" variant="secondary" onPress={() => setAiDate(iso)} style={{ flex: 1 }} />
                </View>
              )}
            </Card>
          );
        })}
      </View>

      <Text style={{ paddingHorizontal: 22, paddingBottom: 10, fontFamily: t.font.heading, fontSize: 18, color: t.text }}>Nos recettes favorites</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 22, gap: 12 }}>
        {recipes.map((r) => (
          <Pressable key={r.id} onPress={() => setDetailRecipe(r)} style={{ width: '47%' }}>
            <Card elevated>
              <View style={{ aspectRatio: 4 / 3, alignItems: 'center', justifyContent: 'center', backgroundColor: t.accent2[100] }}>
                <RecipeThumb size={40} radius={0} />
              </View>
              <View style={{ padding: 10 }}>
                <Text style={{ fontSize: 13.5, fontWeight: '600', color: t.text }} numberOfLines={1}>{r.name}</Text>
                <Text style={{ fontSize: 11.5, color: t.neutral[600], marginTop: 2 }}>{r.prep_time} · {r.tag}</Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>

      <RecipePickerSheet
        visible={!!pickerDate}
        recipes={recipes}
        onClose={() => setPickerDate(null)}
        onSelect={(r) => { if (pickerDate) setMeal(pickerDate, r.id); setPickerDate(null); }}
      />
      <AiSuggestSheet
        visible={!!aiDate}
        recipes={recipes}
        dateIso={aiDate}
        onClose={() => setAiDate(null)}
        onSelect={(r) => { if (aiDate) setMeal(aiDate, r.id); setAiDate(null); }}
      />
      <RecipeDetailSheet visible={!!detailRecipe} recipe={detailRecipe} onClose={() => setDetailRecipe(null)} />
    </ScrollView>
  );
}
