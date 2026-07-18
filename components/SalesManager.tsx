'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

type Product = {
  id: number;
  name: string;
  price: number;
  original_price: number | null;
  created_at: string | null;
  category_id: number | null;
  categories: { name: string } | null;
  product_tags: { tag_id: number }[];
};

const STALE_DAYS = 60;

export function SalesManager({
  products,
  categories,
  tags,
}: {
  products: Product[];
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<number | 'all'>('all');
  const [staleOnly, setStaleOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [now] = useState(() => Date.now());
  const staleCutoff = now - STALE_DAYS * 24 * 60 * 60 * 1000;

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (categoryFilter !== 'all' && p.category_id !== categoryFilter) return false;
        if (tagFilter !== 'all' && !p.product_tags.some((pt) => pt.tag_id === tagFilter)) return false;
        if (staleOnly && (!p.created_at || new Date(p.created_at).getTime() > staleCutoff)) return false;
        return true;
      }),
    [products, search, categoryFilter, tagFilter, staleOnly, staleCutoff]
  );

  const toggle = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  function selectAllFiltered() {
    const ids = filtered.map((p) => p.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]))
    );
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selectedIds.includes(p.id));

  async function applyDiscount() {
    if (selectedIds.length === 0) return;
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/admin/products/bulk-discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: selectedIds, discountPercent }),
    });
    setLoading(false);
    setMessage(res.ok ? `Applied ${discountPercent}% off to ${selectedIds.length} item(s).` : 'Something went wrong.');
    if (res.ok) {
      setSelectedIds([]);
      router.refresh();
    }
  }

  async function removeDiscount() {
    if (selectedIds.length === 0) return;
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/admin/products/remove-discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: selectedIds }),
    });
    setLoading(false);
    setMessage(res.ok ? `Removed discount from ${selectedIds.length} item(s).` : 'Something went wrong.');
    if (res.ok) {
      setSelectedIds([]);
      router.refresh();
    }
  }

  const daysListed = (createdAt: string | null) =>
    createdAt ? Math.floor((now - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl text-shop-text mb-6">Sales & Discounts</h1>

      {/* Filters card */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
        <h2 className="text-sm font-semibold text-shop-text/70 uppercase tracking-wide mb-4">
          Find items
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-shop-text/60 mb-1">Search by name</label>
            <input
              placeholder="e.g. brass lamp"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-shop-text/60 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-shop-text/60 mb-1">Style / era tag</label>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="all">All tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-shop-text/80 pb-2">
              <input type="checkbox" checked={staleOnly} onChange={(e) => setStaleOnly(e.target.checked)} />
              60+ days listed only
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-shop-text/60">
            {filtered.length} item{filtered.length === 1 ? '' : 's'} match{filtered.length === 1 ? 'es' : ''}
          </span>
          <button
            onClick={selectAllFiltered}
            disabled={filtered.length === 0}
            className="text-sm text-shop-accent underline disabled:text-shop-text/30 disabled:no-underline"
          >
            {allFilteredSelected ? 'Deselect all shown' : 'Select all shown'}
          </button>
        </div>
      </div>

      {/* Action bar */}
      <div className="sticky top-0 z-10 bg-white border border-gray-200 rounded-lg p-4 mb-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-shop-text">
            {selectedIds.length} selected
          </span>

          <label className="flex items-center gap-2 text-sm text-shop-text/80">
            Discount
            <input
              type="number"
              min={1}
              max={99}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
            %
          </label>

          <button
            onClick={applyDiscount}
            disabled={selectedIds.length === 0 || loading}
            className="bg-shop-accent text-white px-4 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          >
            {loading ? 'Applying…' : 'Apply discount'}
          </button>

          <button
            onClick={removeDiscount}
            disabled={selectedIds.length === 0 || loading}
            className="border border-gray-300 px-4 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          >
            Remove discount
          </button>

          {message && (
            <span className="text-sm text-green-700 ml-auto">{message}</span>
          )}
        </div>
      </div>

      {/* Results table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-shop-text/60">
              <th className="p-3 w-10"></th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-right">Listed for</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const days = daysListed(p.created_at);
              const isSelected = selectedIds.includes(p.id);
              return (
                <tr
                  key={p.id}
                  className={`border-b border-gray-100 last:border-0 ${isSelected ? 'bg-shop-accent/5' : ''}`}
                >
                  <td className="p-3">
                    <input type="checkbox" checked={isSelected} onChange={() => toggle(p.id)} />
                  </td>
                  <td className="p-3 text-shop-text">{p.name}</td>
                  <td className="p-3 text-shop-text/70">{p.categories?.name ?? '—'}</td>
                  <td className="p-3 text-right">
                    {p.original_price ? (
                      <>
                        <span className="line-through text-shop-text/40 mr-1.5">
                          €{p.original_price.toFixed(2)}
                        </span>
                        <span className="font-semibold text-shop-accent">€{p.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span>€{p.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="p-3 text-right text-shop-text/60">
                    {days !== null ? `${days} days` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-shop-text/50 py-10">No items match these filters.</p>
        )}
      </div>
    </div>
  );
}