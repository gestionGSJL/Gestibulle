// Organic design system — tokens ported from
// project/_ds/organic-b4fa7872-b9a2-4890-a104-cf2810020e25/styles.css
// and the 4 in-app palettes defined in the Gestion Familiale prototype
// (COLOR_PALETTES in Gestion Familiale.dc.html).

export type PaletteKey = 'printanier' | 'sauge' | 'lavande' | 'ocean';

export interface Ramp {
  100: string; 200: string; 300: string; 400: string; 500: string;
  600: string; 700: string; 800: string; 900: string;
}

export interface Palette {
  bg: string;
  surface: string;
  text: string;
  accent: Ramp;
  accent2: Ramp;
}

export const PALETTES: Record<PaletteKey, Palette> = {
  printanier: {
    bg: '#f9efe9', surface: '#f0e0d8', text: '#232c47',
    accent: { 100: '#fdeeea', 200: '#f8d6cd', 300: '#f0b3a8', 400: '#dd8f7f', 500: '#cf7669', 600: '#b35d51', 700: '#8f4a41', 800: '#6c3831', 900: '#472521' },
    accent2: { 100: '#eef6f5', 200: '#d9ebe7', 300: '#c7ddd3', 400: '#7db9bd', 500: '#4d95a8', 600: '#3c7a8c', 700: '#2d5f6e', 800: '#1f4550', 900: '#142e35' },
  },
  sauge: {
    bg: '#fdf6ea', surface: '#faead3', text: '#3a4a34',
    accent: { 100: '#fdeeea', 200: '#fad3c8', 300: '#f5b09d', 400: '#ef9c81', 500: '#e8836b', 600: '#c96852', 700: '#a1533f', 800: '#763c2d', 900: '#4c261c' },
    accent2: { 100: '#f0f2ea', 200: '#dde3cd', 300: '#c5d0ac', 400: '#a3b58a', 500: '#8a9e78', 600: '#6f8060', 700: '#57644b', 800: '#3f4936', 900: '#282f22' },
  },
  lavande: {
    bg: '#f5eef9', surface: '#ece0f2', text: '#232c47',
    accent: { 100: '#f4eef9', 200: '#e3d2ef', 300: '#cbaddf', 400: '#ac84c9', 500: '#8b6bb0', 600: '#705490', 700: '#584270', 800: '#403050', 900: '#292033' },
    accent2: { 100: '#fdf6e3', 200: '#f8e7b8', 300: '#f0d183', 400: '#e3b654', 500: '#d29a2e', 600: '#b17f22', 700: '#8c631b', 800: '#684a14', 900: '#43300d' },
  },
  ocean: {
    bg: '#eaf4f6', surface: '#d9ecef', text: '#232c47',
    accent: { 100: '#eef6f5', 200: '#d9ebe7', 300: '#c7ddd3', 400: '#7db9bd', 500: '#4d95a8', 600: '#3c7a8c', 700: '#2d5f6e', 800: '#1f4550', 900: '#142e35' },
    accent2: { 100: '#fdeeea', 200: '#f8d6cd', 300: '#f0b3a8', 400: '#dd8f7f', 500: '#cf7669', 600: '#b35d51', 700: '#8f4a41', 800: '#6c3831', 900: '#472521' },
  },
};

export const PALETTE_LABELS: Record<PaletteKey, string> = {
  printanier: 'Printanier', sauge: 'Sauge', lavande: 'Lavande', ocean: 'Océan',
};

// Constant across every palette — the prototype never re-themes the neutral ramp.
export const NEUTRAL: Ramp = {
  100: '#f6f0ec', 200: '#ece2db', 300: '#d8cac0', 400: '#b8a89b', 500: '#98867a',
  600: '#786a60', 700: '#5a4f47', 800: '#3d3530', 900: '#262019',
};

export const RADIUS = { sm: 8, md: 16, lg: 28, pill: 999 };

// styles.css space scale (px)
export const SPACE = { 1: 4.4, 2: 8.8, 3: 13.2, 4: 17.6, 6: 26.4, 8: 35.2 };

export const FONTS = {
  heading: 'Caprasimo_400Regular',
  body: 'Figtree_400Regular',
  bodySemiBold: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
};

// Ink-tinted shadows tuned per styles.css --shadow-sm/md/lg (React Native shadow props).
export const SHADOW = {
  sm: { shadowColor: '#2e2b25', shadowOpacity: 0.14, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  md: { shadowColor: '#2e2b25', shadowOpacity: 0.16, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  lg: { shadowColor: '#2e2b25', shadowOpacity: 0.22, shadowRadius: 32, shadowOffset: { width: 0, height: 12 }, elevation: 12 },
};

export interface Theme {
  paletteKey: PaletteKey;
  bg: string;
  surface: string;
  text: string;
  accent: Ramp;
  accent2: Ramp;
  neutral: Ramp;
  radius: typeof RADIUS;
  space: typeof SPACE;
  font: typeof FONTS;
  shadow: typeof SHADOW;
}

export function buildTheme(paletteKey: PaletteKey): Theme {
  const p = PALETTES[paletteKey];
  return {
    paletteKey,
    bg: p.bg,
    surface: p.surface,
    text: p.text,
    accent: p.accent,
    accent2: p.accent2,
    neutral: NEUTRAL,
    radius: RADIUS,
    space: SPACE,
    font: FONTS,
    shadow: SHADOW,
  };
}
