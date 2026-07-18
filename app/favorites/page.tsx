'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import type { Database } from '@/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'] & {
  product_images: { url: string; sort_order: number | null }[];
};

export default function FavoritesPage() {
  const { favoriteIds } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (favoriteIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('products')
        .select('*, product_images(url, sort_order)')
        .in('id', favoriteIds);
      setProducts(data ?? []);
      setLoading(false);
    }
    loadFavorites();
  }, [favoriteIds]);

  if (loading) {
    return <p className="max-w-6xl mx-auto px-4 py-24 text-center text-shop-text/60">Loading your favorites…</p>;
  }

  if (products.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full border border-shop-text/20 flex items-center justify-center">
          <Heart className="w-8 h-8 text-shop-text/40" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-2xl text-shop-text mb-2">No favorites yet</h1>
        <p className="text-shop-text/60 mb-8">
          Tap the heart on any item you love — we&apos;ll keep it here for you.
        </p>
        <Link
          href="/catalog"
          className="inline-block bg-shop-accent text-white px-6 py-3 rounded hover:opacity-90"
        >
          Browse the catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl mb-8 text-center">Favorites</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            imageUrl={product.product_images?.[0]?.url}
          />
        ))}
      </div>
    </div>
  );
}