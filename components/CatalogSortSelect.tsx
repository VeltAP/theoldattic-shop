'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SORT_OPTIONS, SortKey } from '@/lib/sorting';

export default function CatalogSortSelect({
  currentSort,
  basePath = '/catalog',
}: {
  currentSort: SortKey;
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.delete('page');
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="px-3 py-2 text-sm bg-transparent focus:outline-none cursor-pointer"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.key} value={opt.key}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}