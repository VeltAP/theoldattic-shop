import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import ProductCard from '../../../components/ProductCard';
import { notFound } from 'next/navigation';
import { getSortConfig, isValidSortKey } from '../../../lib/sorting';
import CatalogSortSelect from '../../../components/CatalogSortSelect';

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const { category } = await params;
  const { sort, q } = await searchParams;
  const sortKey = isValidSortKey(sort) ? sort : 'newest';
  const { column, ascending } = getSortConfig(sortKey);

  const { data: categoryRow } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', category)
    .single();

  if (!categoryRow) {
    notFound();
  }

  let query = supabase
    .from('products')
    .select('*, product_images(url, sort_order)')
    .eq('is_active', true)
    .eq('category_id', categoryRow.id);

  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  const { data: products, error } = await query
    .order(column, { ascending })
    .order('id', { ascending: true });

  if (error) console.error(error);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <nav className="font-body text-sm text-shop-text/60 mb-4">
        <Link href="/catalog" className="hover:text-shop-accent transition-colors">
          ← Catalog
        </Link>
        {' / '}
        <span className="text-shop-text">{categoryRow.name}</span>
      </nav>

      <h1 className="font-display text-3xl mb-6">{categoryRow.name}</h1>

      <div className="flex flex-wrap justify-center items-center gap-3 mb-10">
        <form className="flex-1 max-w-md">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search in this category..."
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </form>
        <CatalogSortSelect currentSort={sortKey} basePath={`/catalog/${category}`} />
      </div>

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
        <p>No products found in this category.</p>
      )}
    </div>
  );
}