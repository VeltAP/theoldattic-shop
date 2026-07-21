'use client';
import { useState } from 'react';
import type { Database } from '@/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type RowStatus = 'idle' | 'saving' | 'error';

export function ProductsTable({
  products,
  searchTerm,
  onSearchChange,
  onUpdate,
  onEdit,
}: {
  products: Product[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onUpdate: (id: number, updates: Partial<Product>) => Promise<boolean>;
  onEdit: (product: Product) => void;
}) {
  const [rowStatus, setRowStatus] = useState<Record<number, RowStatus>>({});

  const filtered = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) || (product.description ?? '').toLowerCase().includes(term)
    );
  });

  async function handleUpdate(id: number, updates: Partial<Product>) {
    setRowStatus((prev) => ({ ...prev, [id]: 'saving' }));
    const success = await onUpdate(id, updates);
    setRowStatus((prev) => ({ ...prev, [id]: success ? 'idle' : 'error' }));
  }

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products"
        className="border rounded px-3 py-2 text-sm w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-shop-accent"
      />

      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Active</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const status = rowStatus[product.id] ?? 'idle';
              return (
                <tr key={product.id} className="border-b last:border-b-0">
                  <td className="p-3 text-shop-text">{product.name}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <span className="text-shop-text/50">€</span>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={product.price}
                        onBlur={(e) => handleUpdate(product.id, { price: parseFloat(e.target.value) })}
                        className="border rounded w-20 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-shop-accent"
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      defaultValue={product.stock_quantity}
                      onBlur={(e) => handleUpdate(product.id, { stock_quantity: parseInt(e.target.value) })}
                      className="border rounded w-16 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-shop-accent"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={product.is_active}
                      onChange={(e) => handleUpdate(product.id, { is_active: e.target.checked })}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3 justify-end">
                      {status === 'saving' && <span className="text-xs text-shop-text/40">Saving…</span>}
                      {status === 'error' && <span className="text-xs text-red-600">Failed</span>}
                      <button onClick={() => onEdit(product)} className="text-shop-accent underline text-sm">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-shop-text/50 py-10">
            {products.length === 0 ? 'No products yet.' : 'No products match your search.'}
          </p>
        )}
      </div>
    </div>
  );
}