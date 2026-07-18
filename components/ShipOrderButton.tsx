'use client';
import { useState } from 'react';

export function ShipOrderButton({
  orderId,
  currentStatus,
  onShipped,
}: {
  orderId: number;
  currentStatus: string | null;
  onShipped: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [loading, setLoading] = useState(false);

  if (currentStatus === 'shipped') {
    return <span className="text-green-600 text-sm">Shipped</span>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingNumber, carrier }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      onShipped(); // ask the parent page to refetch orders
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm underline">
        Mark as shipped
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        placeholder="Tracking number"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        required
        className="border rounded px-2 py-1 text-sm"
      />
      <select
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="">No carrier / other</option>
        <option value="FedEx">FedEx</option>
        <option value="DHL">DHL</option>
        <option value="UPS">UPS</option>
        <option value="GLS">GLS</option>
        <option value="Pošta Slovenije">Pošta Slovenije</option>
        <option value="DPD">DPD</option>
        <option value="TNT">TNT</option>
      </select>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="text-sm bg-shop-accent text-white px-3 py-1 rounded">
          {loading ? 'Saving…' : 'Confirm'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}