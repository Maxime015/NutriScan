/** Contenu éditorial des Conseils (curé, en français). */

export interface TipCategory {
  key: string;
  label: string;
  color: string;
  icon: 'leaf' | 'heart' | 'weight' | 'shield';
}

export interface Tip {
  id: string;
  category: string;
  categoryLabel: string;
  categoryColor: string;
  title: string;
  summary: string;
  body: string;
}

export const TIP_CATEGORIES: TipCategory[] = [
  { key: 'nutrition', label: 'Nutrition générale', color: '#22C55E', icon: 'leaf' },
  { key: 'heart', label: 'Santé cardiaque', color: '#EF4444', icon: 'heart' },
  { key: 'weight', label: 'Gestion du poids', color: '#3B82F6', icon: 'weight' },
  { key: 'immunity', label: 'Immunité', color: '#F59E0B', icon: 'shield' },
];

export const TIPS: Tip[] = [
  {
    id: 't1',
    category: 'nutrition',
    categoryLabel: 'Nutrition',
    categoryColor: '#22C55E',
    title: 'Privilégiez les aliments naturels et non transformés',
    summary: 'Les aliments frais sont plus riches en nutriments et bons pour la santé.',
    body: "Les aliments naturels — fruits, légumes, légumineuses, céréales complètes — conservent leurs fibres, vitamines et minéraux. Les produits ultra-transformés contiennent souvent des sucres ajoutés, du sel et des additifs. Visez le moins d'ingrédients possible et des noms que vous reconnaissez sur les étiquettes.",
  },
  {
    id: 't2',
    category: 'heart',
    categoryLabel: 'Santé cardiaque',
    categoryColor: '#EF4444',
    title: 'Réduisez votre consommation de sel',
    summary: 'Trop de sel peut augmenter la pression artérielle et les risques cardiovasculaires.',
    body: "L'OMS recommande moins de 5 g de sel par jour. Méfiez-vous du sodium caché dans le pain, les charcuteries, les plats préparés et les sauces. Assaisonnez avec des herbes, des épices et du citron plutôt qu'avec du sel.",
  },
  {
    id: 't3',
    category: 'weight',
    categoryLabel: 'Gestion du poids',
    categoryColor: '#3B82F6',
    title: 'Limitez les sucres ajoutés',
    summary: 'Les sucres ajoutés sont liés à la prise de poids et à de nombreux problèmes de santé.',
    body: "Les boissons sucrées, pâtisseries et céréales du petit-déjeuner concentrent beaucoup de sucres ajoutés. Préférez les fruits entiers pour la douceur naturelle et lisez les étiquettes : le sucre se cache derrière de nombreux noms (sirop de glucose, dextrose, maltose…).",
  },
  {
    id: 't4',
    category: 'immunity',
    categoryLabel: 'Immunité',
    categoryColor: '#F59E0B',
    title: 'Mangez coloré pour renforcer vos défenses',
    summary: 'Un maximum de couleurs dans l’assiette apporte une diversité d’antioxydants.',
    body: "Chaque couleur de fruit ou légume correspond à des antioxydants et vitamines différents. Les agrumes (vitamine C), les légumes verts (folates) et les aliments fermentés (probiotiques) soutiennent votre système immunitaire au quotidien.",
  },
  {
    id: 't5',
    category: 'nutrition',
    categoryLabel: 'Nutrition',
    categoryColor: '#22C55E',
    title: 'Buvez suffisamment d’eau',
    summary: 'Une bonne hydratation soutient la digestion, la concentration et l’énergie.',
    body: "Visez environ 1,5 à 2 litres d'eau par jour, davantage en cas de chaleur ou d'activité physique. Remplacez progressivement les boissons sucrées par de l'eau, des infusions ou de l'eau aromatisée maison.",
  },
  {
    id: 't6',
    category: 'heart',
    categoryLabel: 'Santé cardiaque',
    categoryColor: '#EF4444',
    title: 'Choisissez les bonnes graisses',
    summary: 'Les graisses insaturées protègent le cœur, contrairement aux graisses saturées.',
    body: "Privilégiez l'huile d'olive, les avocats, les noix et les poissons gras (oméga-3). Réduisez les graisses saturées (huile de palme, viandes grasses, produits frits) et évitez les graisses trans des produits industriels.",
  },
];
