'use client';
import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '../../../lib/supabase';
import Image from 'next/image';
import type { Database } from '../../../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type ProductImage = Database['public']['Tables']['product_images']['Row'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      (product.description ?? '').toLowerCase().includes(term)
    );
  });

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
    };

    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const { product } = await response.json();

    const fileInput = form.elements.namedItem('images') as HTMLInputElement;
    const files = fileInput.files ? Array.from(fileInput.files) : [];
    await uploadImages(product.id, files);

    form.reset();
    setAdding(false);
    loadProducts();
  }

  async function uploadImages(productId: number, files: File[]) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `${productId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file);

      if (uploadError) {
        console.error('upload failed:', uploadError);
        continue;
      }

      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(path);

      const { error: insertError } = await supabase.from('product_images').insert({
        product_id: productId,
        url: publicUrlData.publicUrl,
        sort_order: i,
      });

      if (insertError) console.error('product_images insert failed:', insertError);
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm('Delete this listing permanently? This cannot be undone.')) return;

    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    setEditingProduct(null);
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
        <input name="price" type="number" step="0.01" placeholder="Price" required className="border p-2 rounded" />
        <select name="category_id" required className="border p-2 rounded">
          <option value="">Select category…</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input name="stock_quantity" type="number" placeholder="Stock quantity" required className="border p-2 rounded" />
        <textarea name="description" placeholder="Description" className="border p-2 rounded" />
        <input name="images" type="file" accept="image/*" multiple className="border p-2 rounded" />
        <button type="submit" disabled={adding} className="bg-shop-accent text-white p-2 rounded">
          {adding ? 'Adding…' : 'Add Product'}
        </button>
      </form>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products"
        className="border p-2 rounded w-full max-w-md mb-4"
      />

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Name</th>
            <th className="p-2">Price</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Active</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
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
                  onBlur={(e) => updateProduct(product.id, { stock_quantity: parseInt(e.target.value) })}
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
              <td className="p-2">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="text-shop-accent underline text-sm"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSaved={loadProducts}
          onDelete={deleteProduct}
          uploadImages={uploadImages}
        />
      )}
    </div>
  );
}

function EditProductModal({
  product,
  categories,
  onClose,
  onSaved,
  onDelete,
  uploadImages,
}: {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
  onDelete: (id: number) => void;
  uploadImages: (productId: number, files: File[]) => Promise<void>;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? '');
  const [categoryId, setCategoryId] = useState(product.category_id);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchImages() {
      const { data } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('sort_order');

      if (!ignore) {
        setImages(data ?? []);
      }
    }

    fetchImages();

    return () => {
      ignore = true;
    };
  }, [product.id]);

  async function loadImages() {
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order');
    setImages(data ?? []);
  }

  async function handleSave() {
    setSaving(true);

    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: product.id,
        updates: { name, description, category_id: categoryId },
      }),
    });

    if (newFiles && newFiles.length > 0) {
      await uploadImages(product.id, Array.from(newFiles));
    }

    setSaving(false);
    setNewFiles(null);
    await loadImages();
    onSaved();
  }

  async function handleDeleteImage(image: ProductImage) {
    if (!confirm('Remove this photo?')) return;

    const marker = '/product-images/';
    const index = image.url.indexOf(marker);
    const path = image.url.slice(index + marker.length);

    await supabase.storage.from('product-images').remove([path]);
    await supabase.from('product_images').delete().eq('id', image.id);

    loadImages();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-xl text-shop-text mb-4">Edit Listing</h2>

        <label className="block text-sm mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded w-full mb-3"
        />

        <label className="block text-sm mb-1">Category</label>
        <select
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          className="border p-2 rounded w-full mb-3"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <label className="block text-sm mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="border p-2 rounded w-full mb-4"
        />

        <label className="block text-sm mb-1">Photos</label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {images.map((image) => (
            <div key={image.id} className="relative">
              <Image
                src={image.url}
                alt=""
                width={160}
                height={80}
                className="w-full h-20 object-cover rounded"
                unoptimized
              />
              <button
                onClick={() => handleDeleteImage(image)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5"
              >
                ×
              </button>
            </div>
          ))}
          {images.length === 0 && <p className="text-sm text-gray-500 col-span-3">No photos yet.</p>}
        </div>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setNewFiles(e.target.files)}
          className="border p-2 rounded w-full mb-4 text-sm"
        />

        <div className="flex justify-between items-center">
          <button
            onClick={() => onDelete(product.id)}
            className="text-red-600 underline text-sm"
          >
            Delete listing
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="border px-4 py-2 rounded">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-shop-accent text-white px-4 py-2 rounded"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}