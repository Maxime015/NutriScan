/** Traductions FR des noms de risques / allergènes renvoyés par l'API (en anglais). */

const RISK_LABELS: Record<string, string> = {
  sugar: 'Sucre',
  'palm oil': 'Huile de palme',
  'refined oil': 'Huile raffinée',
  sodium: 'Sodium',
  salt: 'Sel',
  msg: 'Glutamate (MSG)',
  preservatives: 'Conservateurs',
};

const ALLERGEN_LABELS: Record<string, string> = {
  milk: 'Lait',
  gluten: 'Gluten',
  nuts: 'Fruits à coque',
  soy: 'Soja',
  egg: 'Œuf',
};

const FREQUENCY_LABELS: Record<string, string> = {
  Daily: 'Quotidien',
  'Daily (limited)': 'Quotidien (limité)',
  '2-3/week': '2-3 / semaine',
  '1-2/week': '1-2 / semaine',
  Avoid: 'À éviter',
};

const QUANTITY_LABELS: Record<string, string> = {
  '1-2 servings/day': '1-2 portions/jour',
  '1 serving/day': '1 portion/jour',
  'Small portions': 'Petites portions',
  'Very small': 'Très petites',
  None: 'Aucune',
};

export function frequencyLabel(v?: string | null): string {
  return FREQUENCY_LABELS[v ?? ''] ?? v ?? '—';
}

export function quantityLabel(v?: string | null): string {
  return QUANTITY_LABELS[v ?? ''] ?? v ?? '—';
}

export function riskLabel(name: string): string {
  return RISK_LABELS[name?.toLowerCase()] ?? name;
}

export function allergenLabel(name: string): string {
  return ALLERGEN_LABELS[name?.toLowerCase()] ?? name;
}

/** Traduction FR des descriptions renvoyées par l'API (fallback = texte original). */
export function riskDescriptionFr(name: string, fallback: string): string {
  const map: Record<string, string> = {
    sugar: 'Une consommation élevée de sucre peut entraîner le diabète et une prise de poids.',
    sodium: 'Un excès de sel peut augmenter la pression artérielle.',
    salt: 'Un excès de sel peut affecter la santé cardiovasculaire.',
    'palm oil': 'Les graisses saturées élevées peuvent affecter la santé cardiaque.',
    'refined oil': 'Les huiles transformées peuvent augmenter le cholestérol.',
    msg: 'Peut provoquer des maux de tête chez les personnes sensibles.',
    preservatives: 'Une consommation fréquente peut affecter le métabolisme.',
  };
  return map[name?.toLowerCase()] ?? fallback;
}
