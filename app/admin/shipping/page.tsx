'use client';
import { useEffect, useState } from 'react';

type ShippingRateRow = {
  id: number;
  rate: number;
  category_id: number;
  zone_id: number;
  categories: { name: string } | null;
  shipping_zones: { name: string } | null;
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function AdminShippingPage() {
  const [rates, setRates] = useState<ShippingRateRow[]>([]);
  const [savedValues, setSavedValues] = useState<Record<number, number>>({});
  const [saveStatus, setSaveStatus] = useState<Record<number, SaveStatus>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/shipping')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const rows: ShippingRateRow[] = data.rates ?? [];
        setRates(rows);
        setSavedValues(Object.fromEntries(rows.map((r) => [r.id, r.rate])));
      })
      .catch((err) => {
        console.error('Error loading shipping rates:', err);
        setLoadError('Could not load shipping rates. Try refreshing the page.');
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(id: number, newRate: string) {
    setRates((prev) => prev.map((r) => (r.id === id ? { ...r, rate: Number(newRate) } : r)));
    setSaveStatus((prev) => ({ ...prev, [id]: 'idle' }));
  }

  async function handleSave(id: number, rate: number) {
    setSaveStatus((prev) => ({ ...prev, [id]: 'saving' }));

    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, rate }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      setSavedValues((prev) => ({ ...prev, [id]: rate }));
      setSaveStatus((prev) => ({ ...prev, [id]: 'saved' }));
      setTimeout(() => {
        setSaveStatus((prev) => (prev[id] === 'saved' ? { ...prev, [id]: 'idle' } : prev));
      }, 2000);
    } catch (err) {
      console.error('Error saving shipping rate:', err);
      setRates((prev) => prev.map((r) => (r.id === id ? { ...r, rate: savedValues[id] } : r)));
      setSaveStatus((prev) => ({ ...prev, [id]: 'error' }));
    }
  }

  const categoryOrder: string[] = [];
  const groupedByCategory = rates.reduce<Record<string, ShippingRateRow[]>>((acc, r) => {
    const name = r.categories?.name ?? 'Uncategorized';
    if (!acc[name]) {
      acc[name] = [];
      categoryOrder.push(name);
    }
    acc[name].push(r);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-12">
        <h1 className="font-display text-2xl text-shop-text mb-6">Shipping Rates</h1>
        <p className="text-sm text-shop-text/60">Loading rates…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 pb-20">
      <h1 className="font-display text-2xl text-shop-text mb-2">Shipping Rates</h1>
      <p className="text-sm text-shop-text/60 mb-8">
        The price charged for one item in a category, per destination zone.
      </p>

      {loadError && (
        <div className="mb-6 border border-red-200 bg-red-50 text-red-700 text-sm rounded p-3">
          {loadError}
        </div>
      )}

      {!loadError && rates.length === 0 && (
        <p className="text-sm text-shop-text/50">No shipping rates found.</p>
      )}

      <div className="space-y-8">
        {categoryOrder.map((categoryName) => (
          <div key={categoryName}>
            <h2 className="font-display text-lg text-shop-text mb-3">{categoryName}</h2>
            <div className="border rounded divide-y">
              {groupedByCategory[categoryName].map((r) => {
                const isDirty = r.rate !== savedValues[r.id];
                const status = saveStatus[r.id] ?? 'idle';

                return (
                  <div key={r.id} className="flex items-center gap-4 px-4 py-3">
                    <span className="flex-1 text-sm text-shop-text/80">
                      {r.shipping_zones?.name ?? 'Unknown zone'}
                    </span>

                    <div className="flex items-center gap-1">
                      <span className="text-sm text-shop-text/50">€</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={r.rate}
                        onChange={(e) => handleChange(r.id, e.target.value)}
                        className="w-24 border rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-shop-accent"
                      />
                    </div>

                    <button
                      onClick={() => handleSave(r.id, r.rate)}
                      disabled={!isDirty || status === 'saving'}
                      className="text-sm px-3 py-1 rounded bg-shop-accent text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {status === 'saving' ? 'Saving…' : 'Save'}
                    </button>

                    <span className="w-14 text-xs">
                      {status === 'saved' && <span className="text-green-600">Saved</span>}
                      {status === 'error' && <span className="text-red-600">Failed</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}