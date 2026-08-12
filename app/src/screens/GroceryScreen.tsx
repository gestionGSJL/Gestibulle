import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useFamilyData } from '../state/FamilyDataContext';
import { Card, Input, Button, Checkbox, Tag } from '../components/ui';

export function GroceryScreen() {
  const t = useTheme();
  const { groceryItems, addGroceryItem, toggleGroceryItem, removeGroceryItem, clearCheckedGroceryItems } = useFamilyData();
  const [input, setInput] = useState('');

  const submit = () => {
    if (input.trim()) { addGroceryItem(input); setInput(''); }
  };

  const remaining = groceryItems.filter((g) => !g.checked).length;
  const hasChecked = groceryItems.some((g) => g.checked);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={{ padding: 22, paddingBottom: 4, fontFamily: t.font.heading, fontSize: 28, color: t.text }}>Liste d'épicerie</Text>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 22, paddingVertical: 14 }}>
        <Input value={input} onChangeText={setInput} onSubmitEditing={submit} placeholder="Ajouter un article…" style={{ flex: 1 }} />
        <Button label="Ajouter" onPress={submit} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingBottom: 8 }}>
        <Text style={{ fontSize: 12.5, fontFamily: t.font.bodyBold, color: t.neutral[700], textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {remaining} article{remaining === 1 ? '' : 's'} restant{remaining === 1 ? '' : 's'}
        </Text>
        {hasChecked ? (
          <Pressable onPress={clearCheckedGroceryItems}>
            <Text style={{ fontSize: 12.5, fontWeight: '600', color: t.accent[700] }}>Effacer les articles cochés</Text>
          </Pressable>
        ) : null}
      </View>

      <Card style={{ marginHorizontal: 22 }}>
        {groceryItems.length === 0 ? (
          <Text style={{ padding: 22, textAlign: 'center', color: t.neutral[600], fontSize: 14 }}>Votre liste est vide.</Text>
        ) : null}
        {groceryItems.map((item, i) => (
          <View
            key={item.id}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12,
              borderBottomWidth: i === groceryItems.length - 1 ? 0 : 1, borderBottomColor: t.neutral[200],
            }}
          >
            <Checkbox checked={item.checked} onPress={() => toggleGroceryItem(item.id)} />
            <Text
              style={{
                flex: 1, fontSize: 15, color: item.checked ? t.neutral[600] : t.text,
                textDecorationLine: item.checked ? 'line-through' : 'none',
              }}
            >
              {item.name}
            </Text>
            {item.from_recipe ? <Tag label="Recette" variant="tag-accent-2" small /> : null}
            <Pressable
              onPress={() => removeGroceryItem(item.id)}
              style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: t.neutral[200], alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={14} color={t.neutral[700]} />
            </Pressable>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}
