import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import ProductCard from '../../../components/ProductCard';
import { notFound } from 'next/navigation';
import { getSortConfig, isValidSortKey } from '../../../lib/sorting';
import CatalogSortSelect from '../../../components/CatalogSortSelect';
import CatalogStatusFilter, { StatusKey } from '../../../components/CatalogStatusFilter';

const PRODUCTS_PER_PAGE = 18;

function isValidStatus(value: string | undefined): value is StatusKey {
  return value === 'available' || value === 'sold' || value === 'all';
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string; q?: string; page?: string; status?: string }>;
}) {
  const { category } = await params;
  const { sort, q, page, status } = await searchParams;
  const currentPage = Number(page) || 1;
  const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;
  const sortKey = isValidSortKey(sort) ? sort : 'newest';
  const { column, ascending } = getSortConfig(sortKey);
  const statusKey = isValidStatus(status) ? status : 'available';

  const sortParam = sortKey !== 'newest' ? `&sort=${encodeURIComponent(sortKey)}` : '';
  const statusParam = statusKey !== 'available' ? `&status=${encodeURIComponent(statusKey)}` : '';

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
    .select('*, product_images(url, sort_order)', { count: 'exact' })
    .eq('category_id', categoryRow.id);

  if (statusKey === 'available') {
    query = query.eq('is_active', true);
  } else if (statusKey === 'sold') {
    query = query.eq('is_active', false);
  }
  // 'all' — no filter

  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  const {
    data: products,
    error,
    count,
  } = await query
    .order(column, { ascending })
    .order('id', { ascending: true })
    .range(from, to);

  if (error) console.error(error);

  const totalPages = Math.ceil((count ?? 0) / PRODUCTS_PER_PAGE);

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
        <CatalogStatusFilter currentStatus={statusKey} basePath={`/catalog/${category}`} />
        <CatalogSortSelect currentSort={sortKey} basePath={`/catalog/${category}`} />
      </div>

      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                imageUrl={product.product_images?.[0]?.url}
              />
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-10">
            {currentPage > 1 && (
              <Link
                href={`/catalog/${category}?page=${currentPage - 1}${
                  q ? `&q=${encodeURIComponent(q)}` : ''
                }${sortParam}${statusParam}`}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
              >
                &lt;
              </Link>
            )}

            <span>
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages && (
              <Link
                href={`/catalog/${category}?page=${currentPage + 1}${
                  q ? `&q=${encodeURIComponent(q)}` : ''
                }${sortParam}${statusParam}`}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
              >
                &gt;
              </Link>
            )}
          </div>
        </>
      ) : (
        <p>No products found in this category.</p>
      )}
    </div>
  );
}