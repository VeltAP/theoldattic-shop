'use client';
import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('id');
    setProducts(data ?? []);
    setLoading(false);
  }

  async function loadCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data ?? []);
  }

  async function updateProduct(id: number, updates: Partial<Product>) {
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    });
    loadProducts();
  }

  async function handleAddProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdding(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const body = {
      name,
      slug,
      price: parseFloat(formData.get('price') as string),
      category_id: parseInt(formData.get('category_id') as string),
      stock_quantity: parseInt(formData.get('stock_quantity') as string),
      description: formData.get('description') as string,
    };

    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    event.currentTarget.reset();
    setAdding(false);
    loadProducts();
  }

  if (loading) return <p>Loading products…</p>;

  return (
    <div className="max-w-5xl mx-auto mt-12">
      <h1 className="font-display text-2xl text-shop-text mb-6">Manage Products</h1>

      <form
        onSubmit={handleAddProduct}
        className="border rounded p-4 mb-8 flex flex-col gap-2 max-w-md"
      >
        <h2 className="font-display text-lg text-shop-text">Add New Product</h2>
        <input name="name" placeholder="Product name" required className="border p-2 rounded" />
        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Price"
          required
          className="border p-2 rounded"
        />
        <select name="category_id" required className="border p-2 rounded">
          <option value="">Select category…</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          name="stock_quantity"
          type="number"
          placeholder="Stock quantity"
          required
          className="border p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          className="border p-2 rounded"
        />
        <button
          type="submit"
          disabled={adding}
          className="bg-shop-accent text-white p-2 rounded"
        >
          {adding ? 'Adding…' : 'Add Product'}
        </button>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Name</th>
            <th className="p-2">Price</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Active</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="p-2">{product.name}</td>
              <td className="p-2">
                <input
                  type="number"
                  defaultValue={product.price}
                  onBlur={(e) => updateProduct(product.id, { price: parseFloat(e.target.value) })}
                  className="border w-20 p-1 rounded"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  defaultValue={product.stock_quantity}
                  onBlur={(e) =>
                    updateProduct(product.id, { stock_quantity: parseInt(e.target.value) })
                  }
                  className="border w-16 p-1 rounded"
                />
              </td>
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={product.is_active}
                  onChange={(e) => updateProduct(product.id, { is_active: e.target.checked })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}