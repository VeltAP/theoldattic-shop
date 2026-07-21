'use client';
import { useState, FormEvent } from 'react';
import type { Database } from '@/lib/database.types';
import { uploadProductImages } from './uploadProductImages';

type Category = Database['public']['Tables']['categories']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

export function AddProductForm({
  categories,
  allTags,
  onAdded,
}: {
  categories: Category[];
  allTags: Tag[];
  onAdded: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdding(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
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
      tagIds,
    };

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const { product } = await response.json();

      const fileInput = form.elements.namedItem('images') as HTMLInputElement;
      const files = fileInput.files ? Array.from(fileInput.files) : [];

      if (files.length > 0) {
        const { failed } = await uploadProductImages(product.id, files);
        if (failed > 0) {
          setError(`Product was added, but ${failed} photo(s) failed to upload — add them from Edit.`);
        }
      }

      form.reset();
      setTagIds([]);
      onAdded();
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Could not add the product. Check the fields and try again.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded p-4 mb-8 flex flex-col gap-3 max-w-md">
      <h2 className="font-display text-lg text-shop-text">Add New Product</h2>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded p-2">{error}</div>
      )}

      <input
        name="name"
        placeholder="Product name"
        required
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shop-accent"
      />
      <input
        name="price"
        type="number"
        step="0.01"
        placeholder="Price"
        required
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shop-accent"
      />
      <select
        name="category_id"
        required
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shop-accent"
      >
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
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shop-accent"
      />
      <textarea
        name="description"
        placeholder="Description"
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shop-accent"
      />

      <div>
        <label className="block text-xs text-shop-text/60 mb-1">Style / era tags</label>
        <div className="flex flex-wrap gap-3">
          {allTags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={tagIds.includes(tag.id)}
                onChange={() =>
                  setTagIds((prev) =>
                    prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                  )
                }
              />
              {tag.name}
            </label>
          ))}
        </div>
      </div>

      <input name="images" type="file" accept="image/*" multiple className="text-sm" />

      <button
        type="submit"
        disabled={adding}
        className="bg-shop-accent text-white px-4 py-2 rounded text-sm disabled:bg-gray-200 disabled:text-gray-400"
      >
        {adding ? 'Adding…' : 'Add Product'}
      </button>
    </form>
  );
}