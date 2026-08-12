import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildTheme, PaletteKey, Theme } from './tokens';

const STORAGE_KEY = 'gestion-familiale.colorTheme';

interface ThemeContextValue {
  theme: Theme;
  paletteKey: PaletteKey;
  setPaletteKey: (key: PaletteKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [paletteKey, setPaletteKeyState] = useState<PaletteKey>('printanier');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'printanier' || v === 'sauge' || v === 'lavande' || v === 'ocean') {
        setPaletteKeyState(v);
      }
    });
  }, []);

  const setPaletteKey = useCallback((key: PaletteKey) => {
    setPaletteKeyState(key);
    AsyncStorage.setItem(STORAGE_KEY, key).catch(() => {});
  }, []);

  const theme = useMemo(() => buildTheme(paletteKey), [paletteKey]);

  const value = useMemo(() => ({ theme, paletteKey, setPaletteKey }), [theme, paletteKey, setPaletteKey]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx.theme;
}

export function useThemeControls() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeControls must be used within ThemeProvider');
  return ctx;
}
