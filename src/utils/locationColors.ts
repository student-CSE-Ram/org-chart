export interface LocationColorTheme {
  name: string;
  hex: string;
  bgHex: string;
  borderHex: string;
  textHex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  accentBgClass: string;
  dotClass: string;
}

const PALETTES: LocationColorTheme[] = [
  {
    name: 'Blue',
    hex: '#1d4ed8',
    bgHex: '#dbeafe',
    borderHex: '#93c5fd',
    textHex: '#1e3a8a',
    bgClass: 'bg-blue-100/90 dark:bg-blue-900/50',
    borderClass: 'border-blue-300 dark:border-blue-700',
    textClass: 'text-blue-900 dark:text-blue-100 font-bold',
    accentBgClass: 'bg-blue-600',
    dotClass: 'bg-blue-600'
  },
  {
    name: 'Emerald',
    hex: '#047857',
    bgHex: '#d1fae5',
    borderHex: '#6ee7b7',
    textHex: '#064e3b',
    bgClass: 'bg-emerald-100/90 dark:bg-emerald-900/50',
    borderClass: 'border-emerald-300 dark:border-emerald-700',
    textClass: 'text-emerald-900 dark:text-emerald-100 font-bold',
    accentBgClass: 'bg-emerald-600',
    dotClass: 'bg-emerald-600'
  },
  {
    name: 'Purple',
    hex: '#6d28d9',
    bgHex: '#ede9fe',
    borderHex: '#c4b5fd',
    textHex: '#4c1d95',
    bgClass: 'bg-purple-100/90 dark:bg-purple-900/50',
    borderClass: 'border-purple-300 dark:border-purple-700',
    textClass: 'text-purple-900 dark:text-purple-100 font-bold',
    accentBgClass: 'bg-purple-600',
    dotClass: 'bg-purple-600'
  },
  {
    name: 'Amber',
    hex: '#b45309',
    bgHex: '#fef3c7',
    borderHex: '#fcd34d',
    textHex: '#78350f',
    bgClass: 'bg-amber-100/90 dark:bg-amber-900/50',
    borderClass: 'border-amber-300 dark:border-amber-700',
    textClass: 'text-amber-950 dark:text-amber-100 font-bold',
    accentBgClass: 'bg-amber-600',
    dotClass: 'bg-amber-600'
  },
  {
    name: 'Rose',
    hex: '#be123c',
    bgHex: '#ffe4e6',
    borderHex: '#fda4af',
    textHex: '#881337',
    bgClass: 'bg-rose-100/90 dark:bg-rose-900/50',
    borderClass: 'border-rose-300 dark:border-rose-700',
    textClass: 'text-rose-900 dark:text-rose-100 font-bold',
    accentBgClass: 'bg-rose-600',
    dotClass: 'bg-rose-600'
  },
  {
    name: 'Cyan',
    hex: '#0e7490',
    bgHex: '#cffaff',
    borderHex: '#67e8f9',
    textHex: '#164e63',
    bgClass: 'bg-cyan-100/90 dark:bg-cyan-900/50',
    borderClass: 'border-cyan-300 dark:border-cyan-700',
    textClass: 'text-cyan-950 dark:text-cyan-100 font-bold',
    accentBgClass: 'bg-cyan-600',
    dotClass: 'bg-cyan-600'
  },
  {
    name: 'Indigo',
    hex: '#4338ca',
    bgHex: '#e0e7ff',
    borderHex: '#a5b4fc',
    textHex: '#312e81',
    bgClass: 'bg-indigo-100/90 dark:bg-indigo-900/50',
    borderClass: 'border-indigo-300 dark:border-indigo-700',
    textClass: 'text-indigo-900 dark:text-indigo-100 font-bold',
    accentBgClass: 'bg-indigo-600',
    dotClass: 'bg-indigo-600'
  },
  {
    name: 'Fuchsia',
    hex: '#a21caf',
    bgHex: '#fae8ff',
    borderHex: '#f0abfc',
    textHex: '#701a75',
    bgClass: 'bg-fuchsia-100/90 dark:bg-fuchsia-900/50',
    borderClass: 'border-fuchsia-300 dark:border-fuchsia-700',
    textClass: 'text-fuchsia-950 dark:text-fuchsia-100 font-bold',
    accentBgClass: 'bg-fuchsia-600',
    dotClass: 'bg-fuchsia-600'
  }
];

const DEFAULT_THEME: LocationColorTheme = {
  name: 'Slate',
  hex: '#475569',
  bgHex: '#f1f5f9',
  borderHex: '#cbd5e1',
  textHex: '#1e293b',
  bgClass: 'bg-slate-200/90 dark:bg-slate-800',
  borderClass: 'border-slate-300 dark:border-slate-600',
  textClass: 'text-slate-900 dark:text-slate-100 font-bold',
  accentBgClass: 'bg-slate-600',
  dotClass: 'bg-slate-600'
};

// Cache deterministic location mapping
const locationThemeMap = new Map<string, LocationColorTheme>();

export const getLocationColorTheme = (locationName?: string): LocationColorTheme => {
  if (!locationName || !locationName.trim()) {
    return DEFAULT_THEME;
  }

  const normalized = locationName.trim();
  if (locationThemeMap.has(normalized)) {
    return locationThemeMap.get(normalized)!;
  }

  // Hash the string to choose a palette deterministically
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % PALETTES.length;
  const theme = PALETTES[index];
  locationThemeMap.set(normalized, theme);

  return theme;
};
