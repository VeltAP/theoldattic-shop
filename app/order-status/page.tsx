'use client';
import { useState } from 'react';
import { getCarrierTrackingUrl } from '@/lib/carrierTracking';

type OrderResult = {
  id: number;
  status: string | null;
  created_at: string | null;
  total: number | null;
  tracking_number?: string | null;
  carrier?: string | null;
  order_items: {
    quantity: number | null;
    price: number | null;
    products: { name: string } | null;
  }[];
};

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const res = await fetch('/api/order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }
    setResult(data.order);
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-xl font-semibold mb-4">Check your order status</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          placeholder="Order number"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email used at checkout"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
        <button type="submit" disabled={loading} className="w-full bg-shop-accent text-white rounded px-3 py-2">
          {loading ? 'Checking…' : 'Check status'}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {result && (
        <div className="mt-6 border rounded-lg p-4">
          <p>
            Status: <strong>{result.status}</strong>
          </p>
          <p>Placed on: {result.created_at ? new Date(result.created_at).toLocaleDateString() : '—'}</p>
          <p>Total: €{(result.total ?? 0).toFixed(2)}</p>
          <ul className="mt-2 list-disc pl-5">
            {result.order_items.map((item, i) => (
              <li key={i}>
                {item.quantity} × {item.products?.name ?? 'Unknown item'}
              </li>
            ))}
          </ul>

          {result.status === 'shipped' && result.tracking_number && (
            <div className="mt-3 pt-3 border-t">
              {(() => {
                const trackingUrl = getCarrierTrackingUrl(result.carrier ?? null, result.tracking_number!);
                return trackingUrl ? (
                  <p>
                    Tracking number:{' '}
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-shop-accent underline"
                    >
                      {result.tracking_number}
                    </a>
                  </p>
                ) : (
                  <p>
                    Tracking number: <strong>{result.tracking_number}</strong>
                  </p>
                );
              })()}
              {result.carrier && <p>Carrier: {result.carrier}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}