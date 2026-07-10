import { supabase } from '../../../lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AddToCartButton from '../../../components/AddToCartButton';
import ProductGallery from '../../../components/ProductGallery';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(url, sort_order), categories(name, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!product) {
    notFound();
  }

  if (product.category_id == null) return null;

  const images = [...(product.product_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  const price = Number(product.price);
  const inStock = product.stock_quantity > 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 md:py-12 overflow-x-hidden">
      {/* Breadcrumb — hidden on mobile */}
      <nav className="hidden sm:block font-body text-sm text-shop-text/60 mb-6 break-words">
        <Link href="/catalog" className="hover:text-shop-accent transition-colors">
          Catalog
        </Link>
        {product.categories && (
          <>
            {' / '}
            <Link
              href={`/catalog/${product.categories.slug}`}
              className="hover:text-shop-accent transition-colors"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        {' / '}
        <span className="text-shop-text">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 w-full min-w-0">
        <div className="w-full min-w-0">
          <ProductGallery images={images} alt={product.name} />
        </div>

        <div className="flex flex-col w-full min-w-0">
          <h1 className="font-display text-2xl md:text-4xl text-shop-text mb-1 break-words">
            {product.name}
          </h1>
          <p className="font-body text-xl md:text-2xl text-shop-accent font-semibold mb-3">
            €{price.toFixed(2)}
          </p>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-4 ${
              inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                inStock ? 'bg-green-600' : 'bg-red-600'
              }`}
            />
            {inStock ? 'In stock' : 'Sold out'}
          </span>

          <p className="font-body text-sm md:text-base text-shop-text/90 leading-normal whitespace-pre-line break-words mb-6">
            {product.description}
          </p>

          <AddToCartButton
            productId={product.id}
            name={product.name}
            price={price}
            categoryId={product.category_id}
            imageUrl={images[0]?.url ?? ''}
            disabled={!inStock}
          />
        </div>
      </div>
    </div>
  );
}