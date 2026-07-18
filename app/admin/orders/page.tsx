'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Database } from '../../../lib/database.types';
import { ShipOrderButton } from '../../../components/ShipOrderButton';

type Order = Database['public']['Tables']['orders']['Row'];

async function fetchOrders(): Promise<Order[]> {
  const response = await fetch('/api/admin/orders');
  const result = await response.json();
  return result.orders ?? [];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOrders = useCallback(async () => {
    const data = await fetchOrders();
    setOrders(data);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const data = await fetchOrders();
      if (!ignore) {
        setOrders(data);
        setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <p>Loading orders…</p>;

  return (
    <div className="max-w-5xl mx-auto mt-12">
      <h1 className="font-display text-2xl text-shop-text mb-6">Orders</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Date</th>
            <th className="p-2">Email</th>
            <th className="p-2">ID</th>
            <th className="p-2">Address</th>
            <th className="p-2">Total</th>
            <th className="p-2">Status</th>
            <th className="p-2">Shipping</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b">
              <td className="p-2">{order.created_at
                  ? new Date(order.created_at).toLocaleDateString()
                  : 'N/A'}
              </td>
              <td className="p-2">{order.customer_email}</td>
              <td className="p-2">{order.id}</td>
              <td className="p-2">{order.shipping_address_line1} {order.shipping_address_line2} {order.shipping_postal_code} {order.shipping_city} {order.shipping_country}</td>
              <td className="p-2">€{order.total}</td>
              <td className="p-2">{order.status}</td>
              <td className="p-2">
                <ShipOrderButton
                  orderId={order.id}
                  currentStatus={order.status}
                  onShipped={refreshOrders}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}