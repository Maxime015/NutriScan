const MONTHS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
];

/** "12 Mai 2024 • 14:30" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} • ${time}`;
}

/** "12 Mai 2024" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatConfidence(v: number): string {
  const pct = v <= 1 ? Math.round(v * 100) : Math.round(v);
  return `${pct}%`;
}
