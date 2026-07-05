import { vars } from 'nativewind';

/**
 * Variables CSS de thème appliquées via un View racine (`style={themeVars[scheme]}`).
 * C'est le mécanisme fiable de NativeWind pour un thème dynamique sur natif :
 * les classes `bg-background`, `text-ink`… lisent ces variables dans le sous-arbre.
 * Valeurs = canaux RGB « R G B » (opacité via `rgb(var(--x) / <alpha-value>)`).
 */
export const lightVars = vars({
  '--canvas': '255 255 255',
  '--background': '246 247 249',
  '--surface': '255 255 255',
  '--surface-2': '241 243 246',
  '--surface-3': '232 235 240',
  '--border': '226 231 238',
  '--border-soft': '238 241 245',
  '--primary': '22 163 74',
  '--primary-dark': '21 128 61',
  '--primary-soft': '220 252 231',
  '--ink': '15 23 42',
  '--muted': '100 116 139',
  '--subtle': '148 163 184',
  '--danger': '220 38 38',
  '--warning': '217 119 6',
  '--info': '37 99 235',
  '--purple': '124 58 237',
  '--pink': '219 39 119',
});

export const darkVars = vars({
  '--canvas': '8 11 20',
  '--background': '10 14 26',
  '--surface': '17 24 39',
  '--surface-2': '22 31 49',
  '--surface-3': '30 41 59',
  '--border': '31 42 61',
  '--border-soft': '38 50 74',
  '--primary': '34 197 94',
  '--primary-dark': '22 163 74',
  '--primary-soft': '19 78 58',
  '--ink': '248 250 252',
  '--muted': '148 163 184',
  '--subtle': '100 116 139',
  '--danger': '239 68 68',
  '--warning': '245 158 11',
  '--info': '59 130 246',
  '--purple': '139 92 246',
  '--pink': '236 72 153',
});
