export type SortKey = 'newest' | 'az' | 'price-asc' | 'price-desc' | 'views';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'az', label: 'A - Z' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'views', label: 'Most Viewed' },
];

const SORT_COLUMNS: Record<SortKey, { column: string; ascending: boolean }> = {
  newest: { column: 'created_at', ascending: false },
  az: { column: 'name', ascending: true },
  'price-asc': { column: 'price', ascending: true },
  'price-desc': { column: 'price', ascending: false },
  views: { column: 'view_count', ascending: false },
};

export function isValidSortKey(value: string | undefined): value is SortKey {
  return !!value && value in SORT_COLUMNS;
}

export function getSortConfig(sort: string | undefined) {
  const key = isValidSortKey(sort) ? sort : 'newest';
  return SORT_COLUMNS[key];
}