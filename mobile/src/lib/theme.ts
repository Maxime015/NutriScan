/**
 * Design tokens partagés (couleurs utilisées côté JS : SVG, dégradés, jauges).
 * Miroir de tailwind.config.js pour les contextes où les classes NativeWind
 * ne s'appliquent pas (props de react-native-svg, LinearGradient, etc.).
 *
 * Deux palettes (clair/sombre) + un hook `useColors()` qui renvoie la palette
 * active selon le colorScheme NativeWind.
 */
import { useColorScheme } from 'react-native';

export type ThemeColors = {
  canvas: string;
  background: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  borderSoft: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  ink: string;
  muted: string;
  subtle: string;
  danger: string;
  warning: string;
  info: string;
  purple: string;
  pink: string;
  screenGradient: [string, string, string];
  /** Dégradé de la carte hero « Analysez. Comprenez. Mangez mieux. ». */
  heroGradient: [string, string];
};

export const darkColors: ThemeColors = {
  canvas: '#080B14',
  background: '#0A0E1A',
  surface: '#111827',
  surface2: '#161F31',
  surface3: '#1E293B',
  border: '#1F2A3D',
  borderSoft: '#26324A',

  primary: '#22C55E',
  primaryDark: '#16A34A',
  primarySoft: '#134E3A',

  ink: '#F8FAFC',
  muted: '#94A3B8',
  subtle: '#64748B',

  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',

  // Dégradés dépendants du thème.
  screenGradient: ['#0A0E1A', '#0B1220', '#080B14'],
  heroGradient: ['#0F2A1E', '#123227'],
};

export const lightColors: ThemeColors = {
  canvas: '#FFFFFF',
  background: '#F6F7F9',
  surface: '#FFFFFF',
  surface2: '#F1F3F6',
  surface3: '#E8EBF0',
  border: '#E2E7EE',
  borderSoft: '#EEF1F5',

  primary: '#16A34A',
  primaryDark: '#15803D',
  primarySoft: '#DCFCE7',

  ink: '#0F172A',
  muted: '#64748B',
  subtle: '#94A3B8',

  danger: '#DC2626',
  warning: '#D97706',
  info: '#2563EB',
  purple: '#7C3AED',
  pink: '#DB2777',

  screenGradient: ['#FFFFFF', '#F6F7F9', '#EEF1F6'],
  heroGradient: ['#ECFDF5', '#D1FAE5'],
};

/** Palette par défaut (sombre) — pour les contextes hors composant. */
export const colors = darkColors;

/** Hook : palette de couleurs JS pour le thème actif (suit l'apparence système). */
export function useColors(): ThemeColors {
  return useColorScheme() === 'light' ? lightColors : darkColors;
}

/** Indique si le thème actif est sombre (défaut sombre si indéterminé). */
export function useIsDark(): boolean {
  return useColorScheme() !== 'light';
}

/**
 * Ombre douce et élégante pour les cartes (élévation discrète, surtout visible
 * en thème clair ; quasi invisible en sombre, ce qui est le comportement voulu).
 */
export const cardShadow = {
  shadowColor: '#0B1220',
  shadowOpacity: 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
} as const;

export type Grade = 'A' | 'B' | 'C' | 'D' | 'E';

/** Couleur associée à un grade nutritionnel. */
export function gradeColor(grade?: string | null): string {
  switch ((grade ?? '').toUpperCase()) {
    case 'A':
      return '#22C55E';
    case 'B':
      return '#4ADE80';
    case 'C':
      return '#F59E0B';
    case 'D':
      return '#EF4444';
    case 'E':
      return '#B91C1C';
    default:
      return colors.subtle;
  }
}

/** Libellé d'impact (français) + couleur, dérivé du champ `impact` renvoyé par l'API. */
export function impactMeta(impact?: string | null): { label: string; color: string } {
  const v = (impact ?? '').toLowerCase();
  if (v === 'low') return { label: 'Faible', color: '#22C55E' };
  if (v === 'mild') return { label: 'Léger', color: '#4ADE80' };
  if (v === 'moderate') return { label: 'Modéré', color: '#F59E0B' };
  if (v === 'high') return { label: 'Élevé', color: '#EF4444' };
  if (v === 'very high') return { label: 'Très élevé', color: '#B91C1C' };
  return { label: '—', color: colors.subtle };
}

/** Traduction du niveau de consommation (usage.level) renvoyé par l'API. */
export function levelLabel(level?: string | null): string {
  const map: Record<string, string> = {
    Safe: 'Sûr',
    Moderate: 'Modéré',
    Limit: 'Limité',
    Rare: 'Rare',
    Avoid: 'À éviter',
  };
  return map[level ?? ''] ?? level ?? '—';
}

/** Position 0..1 du curseur "niveau de recommandation" selon le grade. */
export function recommendationPosition(grade?: string | null): number {
  switch ((grade ?? '').toUpperCase()) {
    case 'A':
      return 0.92;
    case 'B':
      return 0.72;
    case 'C':
      return 0.5;
    case 'D':
      return 0.28;
    case 'E':
      return 0.08;
    default:
      return 0.5;
  }
}

export const CONDITION_OPTIONS = [
  { key: 'diabetes', label: 'Diabète' },
  { key: 'blood_pressure', label: 'Hypertension' },
  { key: 'heart', label: 'Santé cardiaque' },
  { key: 'lactose_intolerance', label: 'Intolérance au lactose' },
  { key: 'cholesterol', label: 'Cholestérol' },
  { key: 'obesity', label: 'Surpoids' },
] as const;

export function conditionLabel(key: string): string {
  return CONDITION_OPTIONS.find((c) => c.key === key)?.label ?? key;
}
