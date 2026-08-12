import { useEffect } from 'react';
import { useThemeControls } from './ThemeContext';
import { useFamilyData } from '../state/FamilyDataContext';

/**
 * Keeps the app's live palette in sync with the family's shared `app_prefs.color_theme`
 * (set from Préférences → Couleurs de l'application) so a palette change made by
 * either family member applies for everyone in real time.
 */
export function ThemeSync() {
  const { paletteKey, setPaletteKey } = useThemeControls();
  const { appPrefs } = useFamilyData();

  useEffect(() => {
    if (appPrefs?.color_theme && appPrefs.color_theme !== paletteKey) {
      setPaletteKey(appPrefs.color_theme);
    }
  }, [appPrefs?.color_theme]);

  return null;
}
