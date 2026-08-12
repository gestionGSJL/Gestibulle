import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useFamilyData } from '../../state/FamilyDataContext';
import { Sheet, Chip, Toggle } from '../../components/ui';
import { PALETTES, PALETTE_LABELS, PaletteKey } from '../../theme/tokens';

export function PreferencesSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { appPrefs, updateAppPrefs } = useFamilyData();
  if (!appPrefs) return null;

  return (
    <Sheet visible={visible} onClose={onClose} title="Préférences de l'application">
      <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700], marginBottom: 8 }}>Langue</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
        <Chip label="Français" active={appPrefs.language === 'fr'} onPress={() => updateAppPrefs({ language: 'fr' })} />
        <Chip label="English" active={appPrefs.language === 'en'} onPress={() => updateAppPrefs({ language: 'en' })} />
      </View>

      <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700], marginBottom: 8 }}>Format d'heure</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
        <Chip label="24 h" active={appPrefs.time_format === '24h'} onPress={() => updateAppPrefs({ time_format: '24h' })} />
        <Chip label="12 h (AM/PM)" active={appPrefs.time_format === '12h'} onPress={() => updateAppPrefs({ time_format: '12h' })} />
      </View>

      <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700], marginBottom: 8 }}>Premier jour de la semaine</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
        <Chip label="Dimanche" active={appPrefs.week_start === 'dimanche'} onPress={() => updateAppPrefs({ week_start: 'dimanche' })} />
        <Chip label="Lundi" active={appPrefs.week_start === 'lundi'} onPress={() => updateAppPrefs({ week_start: 'lundi' })} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <Text style={{ fontSize: 13.5, color: t.text }}>Sons de l'application</Text>
        <Toggle value={appPrefs.sounds} onChange={() => updateAppPrefs({ sounds: !appPrefs.sounds })} />
      </View>

      <Text style={{ fontSize: 12.5, fontFamily: t.font.bodySemiBold, color: t.neutral[700], marginBottom: 8 }}>Couleurs de l'application</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {(Object.keys(PALETTES) as PaletteKey[]).map((key) => {
          const p = PALETTES[key];
          const active = appPrefs.color_theme === key;
          return (
            <Pressable key={key} onPress={() => updateAppPrefs({ color_theme: key })} style={{ alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 40, height: 40, borderRadius: 20, overflow: 'hidden',
                  borderWidth: active ? 3 : 1, borderColor: active ? p.accent[700] : t.neutral[300],
                }}
              >
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <View style={{ flex: 1, backgroundColor: p.accent[500] }} />
                  <View style={{ flex: 1, backgroundColor: p.accent2[500] }} />
                </View>
              </View>
              <Text style={{ fontSize: 11.5, color: active ? p.accent[700] : t.neutral[600] }}>{PALETTE_LABELS[key]}</Text>
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
