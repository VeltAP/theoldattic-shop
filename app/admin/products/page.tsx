'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { AddProductForm } from '@/components/admin/AddProductForm';
import { EditProductModal } from '@/components/admin/EditProductModal';
import { ProductsTable } from '@/components/admin/ProductsTable';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadInitial() {
      try {
        await Promise.all([loadProducts(), loadCategories(), loadTags()]);
      } catch (err) {
        console.error('Error loading admin products data:', err);
        setLoadError('Could not load products. Try reloading the page.');
      } finally {
        setInitialLoading(false);
      }
    }
    loadInitial();
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase.from('products').select('*').order('id');
    if (error) throw error;
    setProducts(data ?? []);
  }

  async function loadCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    setCategories(data ?? []);
  }

  async function loadTags() {
    const { data, error } = await supabase.from('tags').select('*').order('name');
    if (error) throw error;
    setAllTags(data ?? []);
  }

  async function updateProduct(id: number, updates: Partial<Product>): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      await loadProducts();
      return true;
    } catch (err) {
      console.error('Error updating product:', err);
      return false;
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm('Delete this listing permanently? This cannot be undone.')) return;

    try {
      const response = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Could not delete this listing. Try again.');
    }
  }

  if (initialLoading) {
    return (
      <div className="max-w-5xl mx-auto mt-12">
        <h1 className="font-display text-2xl text-shop-text mb-6">Manage Products</h1>
        <p className="text-sm text-shop-text/60">Loading products…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-12 pb-20">
      <h1 className="font-display text-2xl text-shop-text mb-6">Manage Products</h1>

      {loadError && (
        <div className="mb-6 border border-red-200 bg-red-50 text-red-700 text-sm rounded p-3">
          {loadError}
        </div>
      )}

      <AddProductForm categories={categories} allTags={allTags} onAdded={loadProducts} />

      <ProductsTable
        products={products}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onUpdate={updateProduct}
        onEdit={setEditingProduct}
      />

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSaved={loadProducts}
          onDelete={deleteProduct}
        />
      )}
    </div>
  );
}