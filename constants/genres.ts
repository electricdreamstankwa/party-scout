export interface Genre {
  label: string;
  value: string;
  color: string;
  emoji: string;
}

export const GENRES: Genre[] = [
  { label: 'Psytrance', value: 'psytrance', color: '#8B5CF6', emoji: '🌀' },
  { label: 'Techno',    value: 'techno',    color: '#374151', emoji: '⚙️' },
  { label: 'House',     value: 'house',     color: '#F59E0B', emoji: '🏠' },
  { label: 'D&B',       value: 'dnb',       color: '#EF4444', emoji: '🥁' },
  { label: 'Jungle',    value: 'jungle',    color: '#10B981', emoji: '🌿' },
  { label: 'Ambient',   value: 'ambient',   color: '#06B6D4', emoji: '🌊' },
  { label: 'Hardcore',  value: 'hardcore',  color: '#DC2626', emoji: '💥' },
  { label: 'Festival',  value: 'festival',  color: '#F97316', emoji: '🏕️' },
];

export function genreColor(value: string): string {
  return GENRES.find(g => g.value === value)?.color ?? '#6B7280';
}

export function genreLabel(value: string): string {
  return GENRES.find(g => g.value === value)?.label ?? value;
}

export const RADIUS_OPTIONS = [
  { label: '25 km',      value: 25 },
  { label: '50 km',      value: 50 },
  { label: '100 km',     value: 100 },
  { label: '200 km',     value: 200 },
  { label: 'Worldwide',  value: 0 },
];

export const DATE_RANGE_OPTIONS = [
  { label: 'This weekend', value: 'weekend' },
  { label: 'This month',   value: 'month' },
  { label: 'All upcoming', value: 'all' },
] as const;
