'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import type { Database } from '@/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'] & {
  product_images: { url: string; sort_order: number | null }[];
};

export function RecentlyViewedStrip({ excludeId }: { excludeId?: number }) {
  const { recentIds } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const idsToShow = useMemo(
    () => recentIds.filter((id) => id !== excludeId).slice(0, 8),
    [recentIds, excludeId]
  );

  useEffect(() => {
    async function load() {
      if (idsToShow.length === 0) {
        setProducts([]);
        return;
      }
      const { data } = await supabase
        .from('products')
        .select('*, product_images(url, sort_order)')
        .in('id', idsToShow)
        .eq('is_active', true);

      const ordered = idsToShow
        .map((id) => data?.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p));
      setProducts(ordered);
    }
    load();
  }, [idsToShow]);

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 176 + 16; // w-44 (176px) + gap-4 (16px)
    el.scrollBy({ left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2, behavior: 'smooth' });
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl text-shop-text">Recently viewed</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <div key={p.id} className="w-44 flex-shrink-0">
            <ProductCard product={p} imageUrl={p.product_images?.[0]?.url} />
          </div>
        ))}
      </div>
    </div>
  );
}