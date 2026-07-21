'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Database } from '../../../lib/database.types';
import { ShipOrderButton } from '../../../components/ShipOrderButton';

type Order = Database['public']['Tables']['orders']['Row'];

async function fetchOrders(): Promise<Order[]> {
  const response = await fetch('/api/admin/orders');
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
  const result = await response.json();
  return result.orders ?? [];
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}

function formatAddress(order: Order): string {
  const parts = [
    order.shipping_address_line1,
    order.shipping_address_line2,
    order.shipping_postal_code,
    order.shipping_city,
    order.shipping_country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshOrders = useCallback(async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
      setLoadError(null);
    } catch (err) {
      console.error('Error refreshing orders:', err);
      setLoadError('Could not refresh orders. Try reloading the page.');
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await fetchOrders();
        if (!ignore) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Error loading orders:', err);
        if (!ignore) {
          setLoadError('Could not load orders. Try reloading the page.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const sortedOrders = [...orders].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-12">
        <h1 className="font-display text-2xl text-shop-text mb-6">Orders</h1>
        <p className="text-sm text-shop-text/60">Loading orders…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-12 pb-20">
      <h1 className="font-display text-2xl text-shop-text mb-6">Orders</h1>

      {loadError && (
        <div className="mb-6 border border-red-200 bg-red-50 text-red-700 text-sm rounded p-3">
          {loadError}
        </div>
      )}

      {!loadError && sortedOrders.length === 0 && (
        <p className="text-sm text-shop-text/50">No orders yet.</p>
      )}

      {sortedOrders.length > 0 && (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3 whitespace-nowrap">Date</th>
                <th className="p-3">Email</th>
                <th className="p-3 whitespace-nowrap">Order #</th>
                <th className="p-3">Address</th>
                <th className="p-3 text-right whitespace-nowrap">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Shipping</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-b-0 align-top">
                  <td className="p-3 whitespace-nowrap text-shop-text/70">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-3 text-shop-text/70">{order.customer_email}</td>
                  <td className="p-3 whitespace-nowrap text-shop-text/50">#{order.id}</td>
                  <td className="p-3 text-shop-text/70 max-w-xs">{formatAddress(order)}</td>
                  <td className="p-3 text-right font-medium whitespace-nowrap">
                    €{Number(order.total ?? 0).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={order.status ?? 'pending'} />
                  </td>
                  <td className="p-3">
                    <ShipOrderButton
                      orderId={order.id}
                      currentStatus={order.status ?? 'pending'}
                      onShipped={refreshOrders}
                    />
                    {order.status === 'shipped' && order.tracking_number && (
                      <p className="mt-1 text-xs text-shop-text/50">
                        Tracking: {order.tracking_number}
                        {order.carrier ? ` (${order.carrier})` : ''}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}