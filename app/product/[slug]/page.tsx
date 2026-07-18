import type { Metadata } from 'next';
import { supabase } from '../../../lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AddToCartButton from '../../../components/AddToCartButton';
import ProductGallery from '../../../components/ProductGallery';
import ProductCard from '../../../components/ProductCard';
import ShippingEstimator from '../../../components/ShippingEstimator';
import { ShareButtons } from '../../../components/ShareButtons';
import { FavoriteButton } from '../../../components/FavoriteButton';
import { TrackRecentlyViewed } from '../../../components/TrackRecentlyViewed';
import { RecentlyViewedStrip } from '../../../components/RecentlyViewedStrip';
import { getProduct } from '@/lib/getProduct';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Product not found | The Old Attic' };
  }

  const mainImage = [...(product.product_images ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`;
  const description =
    product.description?.slice(0, 160) ??
    `${product.name} — vintage find from The Old Attic.`;

  return {
    title: `${product.name} | The Old Attic`,
    description,
    openGraph: {
      title: product.name,
      description,
      url,
      siteName: 'The Old Attic',
      images: mainImage
        ? [{ url: mainImage, width: 1200, height: 630, alt: product.name }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: mainImage ? [mainImage] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound(); // wrong slug entirely — this is a real 404
  }

  await supabaseAdmin.rpc('increment_view_count', { target_id: product.id });

  if (product.category_id == null) return null;

  const images = [...(product.product_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  const price = Number(product.price);
  const inStock = product.is_active && product.stock_quantity > 0;

  const { data: rateData } = await supabase
    .from('shipping_rates')
    .select('category_id, zone_id, rate')
    .eq('category_id', product.category_id);

  const rates = (rateData ?? [])
    .filter(
      (r): r is { category_id: number; zone_id: number; rate: number } =>
        r.category_id !== null && r.zone_id !== null
    )
    .map((r) => ({
      categoryId: r.category_id,
      zoneId: r.zone_id,
      rate: r.rate,
    }));

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 md:py-12 overflow-x-hidden">
      <TrackRecentlyViewed productId={product.id} />

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
          <div className="flex items-start justify-between gap-3 mb-1">
            <h1 className="font-display text-2xl md:text-4xl text-shop-text break-words">
              {product.name}
            </h1>
            <div className="flex-shrink-0 mt-1">
              <FavoriteButton productId={product.id} />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            {product.original_price && (
              <span className="font-body text-lg md:text-xl text-shop-text/40 line-through">
                €{product.original_price.toFixed(2)}
              </span>
            )}
            <p className="font-body text-xl md:text-2xl text-shop-accent font-semibold">
              €{price.toFixed(2)}
            </p>
          </div>

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

          {product.is_active ? (
            <>
              <AddToCartButton
                productId={product.id}
                name={product.name}
                price={price}
                categoryId={product.category_id}
                imageUrl={images[0]?.url ?? ''}
                disabled={!inStock}
              />

              <ShippingEstimator categoryId={product.category_id} rates={rates} />
            </>
          ) : (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
              <p className="font-semibold text-shop-text">This piece has been sold.</p>
              <p className="text-sm text-shop-text/60 mt-1">
                Every item here is one of a kind, so this exact piece won&apos;t be restocked,
                but take a look at similar finds below.
              </p>
            </div>
          )}

          <div className="mt-6">
            <ShareButtons
              url={`${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`}
              title={product.name}
              image={images[0]?.url}
            />
          </div>
        </div>
      </div>

      {!product.is_active && (
        <SimilarProducts categoryId={product.category_id} excludeId={product.id} />
      )}

      <RecentlyViewedStrip excludeId={product.id} />
    </div>
  );
}

async function SimilarProducts({
  categoryId,
  excludeId,
}: {
  categoryId: number;
  excludeId: number;
}) {
  const { data: similar } = await supabase
    .from('products')
    .select('*, product_images(url, sort_order)')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', excludeId)
    .limit(4);

  if (!similar || similar.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="font-display text-xl text-shop-text mb-4">You might also like</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {similar.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            imageUrl={p.product_images?.[0]?.url}
          />
        ))}
      </div>
    </div>
  );
}