import Link from 'next/link';
import Image from 'next/image';
import type { Database } from '../lib/database.types';
import { FavoriteButton } from './FavoriteButton';

type Product = Database['public']['Tables']['products']['Row'];

type ProductCardProps = {
  product: Product;
  imageUrl?: string;
};

export default function ProductCard({ product, imageUrl }: ProductCardProps) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            No image
          </div>
        )}

        <div className="absolute top-3 right-3">
          <FavoriteButton productId={product.id} />
        </div>

        {/* hanging price tag */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-shop-bg/95 border border-shop-text/15 rounded-full pl-2 pr-3 py-1 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full border border-shop-text/40" />
          <span className="font-body text-sm font-semibold text-shop-text">
            €{product.price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-base text-shop-text leading-snug line-clamp-2 min-h-[2.5em]">
          {product.name}
        </h3>
      </div>
    </Link>
  );
}