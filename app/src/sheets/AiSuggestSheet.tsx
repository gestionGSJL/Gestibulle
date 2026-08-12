import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Sheet, Input, Button, Tag } from '../components/ui';
import { RecipeThumb } from '../components/RecipeThumb';
import { Recipe } from '../types/models';
import { WEEKDAY_NAMES } from '../lib/dates';

export function AiSuggestSheet({
  visible,
  recipes,
  dateIso,
  onClose,
  onSelect,
}: {
  visible: boolean;
  recipes: Recipe[];
  dateIso: string | null;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
}) {
  const t = useTheme();
  const [query, setQuery] = useState('');

  const dayLabel = dateIso ? WEEKDAY_NAMES[new Date(dateIso + 'T00:00:00').getDay()] : '';

  const suggestions = useMemo(() => {
    if (!dateIso || !recipes.length) return [];
    const q = query.trim().toLowerCase();
    if (q) {
      const matched = recipes.filter((r) => (r.name + ' ' + r.tag).toLowerCase().includes(q));
      return (matched.length ? matched : recipes).slice(0, 3);
    }
    const seed = new Date(dateIso + 'T00:00:00').getDate() % recipes.length;
    const idxs = Array.from(new Set([seed, (seed + 2) % recipes.length, (seed + 4) % recipes.length]));
    return idxs.map((i) => recipes[i]);
  }, [query, recipes, dateIso]);

  return (
    <Sheet visible={visible} onClose={onClose} title="Suggestions de l'IA" maxHeightPct={72}>
      <Text style={{ fontSize: 13, color: t.neutral[700], marginBottom: 12 }}>Basé sur vos recettes favorites, pour {dayLabel}</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        <Input value={query} onChangeText={setQuery} placeholder="Ex. quelque chose de rapide, végé…" style={{ flex: 1 }} />
        <Button label="Suggérer" variant="secondary" onPress={() => setQuery((q) => q.trim())} />
      </View>
      {suggestions.map((r, i) => (
        <Pressable
          key={r.id}
          onPress={() => onSelect(r)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: i === suggestions.length - 1 ? 0 : 1, borderBottomColor: t.neutral[200] }}
        >
          <RecipeThumb size={48} radius={10} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14.5, fontWeight: '600', color: t.text }}>{r.name}</Text>
            <Text style={{ fontSize: 12, color: t.neutral[600] }}>{r.prep_time} · {r.tag}</Text>
          </View>
          <Tag label="Choisir" variant="tag-accent-2" small />
        </Pressable>
      ))}
    </Sheet>
  );
}
