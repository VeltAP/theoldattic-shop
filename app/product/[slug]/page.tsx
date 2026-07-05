import { supabase } from '../../../lib/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import AddToCartButton from '../../../components/AddToCartButton';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(url, sort_order)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!product) {
    notFound();
  }

  const images = [...(product.product_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  if (product.category_id == null) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8">
      <div>
        <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden mb-3">
          {images[0] && (
            <Image src={images[0].url} alt={product.name} fill className="object-cover" />
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {images.slice(1).map((img, i) => (
            <div key={i} className="relative aspect-square bg-gray-200 rounded overflow-hidden">
              <Image src={img.url} alt={product.name} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h1 className="font-display text-3xl mb-2">{product.name}</h1>
        <p className="font-body text-2xl text-shop-accent font-semibold mb-4">
          €{product.price.toFixed(2)}
        </p>
        <p className="font-body mb-6 whitespace-pre-line">{product.description}</p>
        <p className="mb-6">
          {product.stock_quantity > 0 ? (
            <span className="text-green-700">In stock</span>
          ) : (
            <span className="text-red-700">Sold out</span>
          )}
        </p>

        <AddToCartButton
          productId={product.id}
          name={product.name}
          price={product.price}
          categoryId={product.category_id}
          imageUrl={images[0]?.url ?? ''}
          disabled={product.stock_quantity <= 0}
        />
      </div>
    </div>
  );
}