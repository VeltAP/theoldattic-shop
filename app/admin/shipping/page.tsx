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

export default function AdminShippingPage() {
  const [rates, setRates] = useState<ShippingRateRow[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/admin/shipping')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setRates(data.rates ?? []))
      .catch((err) => console.error('Error loading shipping rates:', err));
  }, []);

  function handleChange(id: number, newRate: string) {
    setRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, rate: Number(newRate) } : r))
    );
  }

  async function handleSave(id: number, rate: number) {
    setSavingId(id);
    await fetch('/api/admin/shipping', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, rate }),
    });
    setSavingId(null);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-shop-text mb-4">Shipping Rates</h1>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Zone</th>
            <th>Rate (€)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rates.map((r) => (
            <tr key={r.id}>
              <td>{r.categories?.name}</td>
              <td>{r.shipping_zones?.name}</td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  value={r.rate}
                  onChange={(e) => handleChange(r.id, e.target.value)}
                />
              </td>
              <td>
                <button
                  onClick={() => handleSave(r.id, r.rate)}
                  disabled={savingId === r.id}
                >
                  {savingId === r.id ? 'Saving…' : 'Save'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}