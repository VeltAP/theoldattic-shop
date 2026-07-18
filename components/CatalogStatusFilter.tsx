'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export type StatusKey = 'available' | 'sold' | 'all';

const STATUS_OPTIONS: { key: StatusKey; label: string }[] = [
  { key: 'available', label: 'Available' },
  { key: 'sold', label: 'Sold' },
  { key: 'all', label: 'All items' },
];

export default function CatalogStatusFilter({
  currentStatus,
  basePath = '/catalog',
}: {
  currentStatus: StatusKey;
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', e.target.value);
    params.delete('page'); // reset to page 1 when filter changes
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      className="px-3 py-2 text-sm bg-transparent focus:outline-none cursor-pointer"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.key} value={opt.key}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}