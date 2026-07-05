import Link from 'next/link';
import Image from 'next/image';
import type { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];

type ProductCardProps = {
  product: Product;
  imageUrl?: string;
};

export default function ProductCard({ product, imageUrl }: ProductCardProps) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="block border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-square bg-gray-200">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={product.name} 
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            No image
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-display text-lg text-shop-text truncate">{product.name}</h3>
        <p className="font-body text-shop-accent font-semibold">€{product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}