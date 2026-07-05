import { supabase } from '../../lib/supabase';
import ProductCard from '../../components/ProductCard';
import Link from 'next/link';

const categories = [
  { name: 'Lighting', slug: 'lighting' },
  { name: 'Seating', slug: 'seating' },
  { name: 'Cabinets & Storage', slug: 'cabinets-storage' },
  { name: 'Tables & Trolleys', slug: 'tables-trolleys' },
  { name: 'Mirrors', slug: 'mirrors' },
  { name: 'Decorative', slug: 'decorative' },
];

type SearchParams = {
  q?: string;
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q } = await searchParams;

  let query = supabase
    .from('products')
    .select('*, product_images(url, sort_order)')
    .eq('is_active', true);

  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  const { data: products, error } = await query;

  if (error) console.error(error);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl mb-6">Catalog</h1>

      <nav className="flex flex-wrap gap-3 mb-6">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/catalog/${cat.slug}`}
            className="text-sm px-3 py-1 border border-gray-300 rounded-full hover:bg-shop-accent hover:text-white"
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      <form className="mb-8">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search products…"
          className="border border-gray-300 rounded px-3 py-2 w-full max-w-sm"
        />
      </form>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              imageUrl={product.product_images?.[0]?.url}
            />
          ))}
        </div>
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
}