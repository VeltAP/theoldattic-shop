import type { Metadata } from 'next';
import { supabase } from '../../../lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AddToCartButton from '../../../components/AddToCartButton';
import ProductGallery from '../../../components/ProductGallery';
import ShippingEstimator from '../../../components/ShippingEstimator';
import { ShareButtons } from '../../../components/ShareButtons';
import { FavoriteButton } from '../../../components/FavoriteButton';
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

  if (!product || !product.is_active) {
    notFound();
  }

  if (product) {
    await supabaseAdmin.rpc('increment_view_count', { target_id: product.id });
  }

  if (product.category_id == null) return null;

  const images = [...(product.product_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  const price = Number(product.price);
  const inStock = product.stock_quantity > 0;

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

          <ShippingEstimator categoryId={product.category_id} rates={rates} />

          <div className="mt-6">
            <ShareButtons
              url={`${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`}
              title={product.name}
              image={images[0]?.url}
            />
          </div>
        </div>
      </div>
    </div>
  );
}