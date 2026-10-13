import { useColorScheme } from 'react-native';

/**
 * "Mezzanotte" palette from 04-cento-palettes.html. Roles: primary carries the brand, surface is the
 * app background, flame is the only warm accent, today is a separate semantic colour for the
 * highlighted row. In dark mode primary becomes the surface and on-primary the text.
 */
export const palette = {
  primary: '#10213f',
  onPrimary: '#f6e7b8',
  surface: '#f7f4ec',
  ink: '#141c33',
  muted: '#6b7085',
  flame: '#f0a93b',
  today: '#c8246a',
  todaySoft: '#fbe3ec',
} as const;

export interface Theme {
  dark: boolean;
  bg: string;
  card: string;
  text: string;
  muted: string;
  line: string;
  primary: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  flame: string;
  today: string;
  todaySoft: string;
  danger: string;
}

export const lightTheme: Theme = {
  dark: false,
  bg: palette.surface,
  card: '#ffffff',
  text: palette.ink,
  muted: palette.muted,
  line: '#e3dfd3',
  primary: palette.primary,
  onPrimary: palette.onPrimary,
  accent: palette.primary,
  accentSoft: '#e6e9f3',
  flame: palette.flame,
  today: palette.today,
  todaySoft: palette.todaySoft,
  danger: '#b3261e',
};

export const darkTheme: Theme = {
  dark: true,
  bg: palette.primary,
  card: '#1a2b4c',
  text: palette.onPrimary,
  muted: '#a9b0c6',
  line: '#2b3b5c',
  primary: palette.onPrimary,
  onPrimary: palette.primary,
  accent: palette.onPrimary,
  accentSoft: '#243556',
  flame: palette.flame,
  today: '#ff5f98',
  todaySoft: '#3a1a2a',
  danger: '#ff8a80',
};

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}

export const radius = { sm: 10, md: 14, lg: 20, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** Avatar colour from a name, stable across launches. */
export function avatarColor(name: string): string {
  const colors = ['#5f6a93', '#b9174f', '#1f3d2b', '#b5451f', '#1f3fd6', '#7d5868', '#66705f'];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return colors[h % colors.length]!;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}
