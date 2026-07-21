'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { uploadProductImages } from './uploadProductImages';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type ProductImage = Database['public']['Tables']['product_images']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

export function EditProductModal({
  product,
  categories,
  onClose,
  onSaved,
  onDelete,
}: {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
  onDelete: (id: number) => void;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? '');
  const [categoryId, setCategoryId] = useState(product.category_id);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchImages() {
      const { data } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('sort_order');
      if (!ignore) setImages(data ?? []);
    }

    async function fetchTags() {
      const [{ data: tags }, { data: productTags }] = await Promise.all([
        supabase.from('tags').select('*').order('name'),
        supabase.from('product_tags').select('tag_id').eq('product_id', product.id),
      ]);
      if (!ignore) {
        setAllTags(tags ?? []);
        setSelectedTagIds((productTags ?? []).map((row) => row.tag_id));
      }
    }

    fetchImages();
    fetchTags();

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
    setError(null);

    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          updates: { name, description, category_id: categoryId },
          tagIds: selectedTagIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      if (newFiles && newFiles.length > 0) {
        const { failed } = await uploadProductImages(product.id, Array.from(newFiles));
        if (failed > 0) {
          setError(`Saved, but ${failed} photo(s) failed to upload — try adding them again.`);
        }
      }

      setNewFiles(null);
      await loadImages();
      onSaved();
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Could not save changes. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteImage(image: ProductImage) {
    if (!confirm('Remove this photo?')) return;

    setDeletingImageId(image.id);
    setError(null);

    const marker = '/product-images/';
    const index = image.url.indexOf(marker);
    const path = image.url.slice(index + marker.length);

    const { error: storageError } = await supabase.storage.from('product-images').remove([path]);
    const { error: dbError } = await supabase.from('product_images').delete().eq('id', image.id);

    if (storageError || dbError) {
      console.error('Error deleting image:', storageError ?? dbError);
      setError('Could not remove that photo. Try again.');
      setDeletingImageId(null);
      return;
    }

    await loadImages();
    setDeletingImageId(null);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-xl text-shop-text mb-4">Edit Listing</h2>

        {error && (
          <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded p-2 mb-3">{error}</div>
        )}

        <label className="block text-sm mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-shop-accent"
        />

        <label className="block text-sm mb-1">Category</label>
        <select
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          className="border rounded px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-shop-accent"
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
          className="border rounded px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-shop-accent"
        />

        <label className="block text-sm mb-1">Style / era tags</label>
        <div className="flex flex-wrap gap-3 mb-4">
          {allTags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedTagIds.includes(tag.id)}
                onChange={() =>
                  setSelectedTagIds((prev) =>
                    prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                  )
                }
              />
              {tag.name}
            </label>
          ))}
        </div>

        <label className="block text-sm mb-1">Photos</label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {images.map((image) => (
            <div key={image.id} className="relative">
              <Image
                src={image.url}
                alt=""
                width={160}
                height={80}
                className={`w-full h-20 object-cover rounded ${
                  deletingImageId === image.id ? 'opacity-40' : ''
                }`}
                unoptimized
              />
              <button
                onClick={() => handleDeleteImage(image)}
                disabled={deletingImageId === image.id}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 disabled:opacity-50"
              >
                x
              </button>
            </div>
          ))}
          {images.length === 0 && <p className="text-sm text-shop-text/50 col-span-3">No photos yet.</p>}
        </div>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setNewFiles(e.target.files)}
          className="border rounded w-full mb-4 text-sm p-2"
        />

        <div className="flex justify-between items-center">
          <button onClick={() => onDelete(product.id)} className="text-red-600 underline text-sm">
            Delete listing
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="border px-4 py-2 rounded text-sm">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-shop-accent text-white px-4 py-2 rounded text-sm disabled:bg-gray-200 disabled:text-gray-400"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}