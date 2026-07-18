'use client';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';

export function FavoriteButton({ productId }: { productId: number }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-white/90 shadow-sm hover:bg-white hover:scale-110 transition-all duration-200"
    >
      <Heart
        className={`w-5 h-5 ${active ? 'text-red-500' : 'text-gray-500'}`}
        fill={active ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
    </button>
  );
}