'use client';
import { useEffect } from 'react';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';

export function TrackRecentlyViewed({ productId }: { productId: number }) {
  const { addView } = useRecentlyViewed();

  useEffect(() => {
    addView(productId);
  }, [productId, addView]);

  return null;
}