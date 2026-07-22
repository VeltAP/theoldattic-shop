import Link from "next/link";
import ProductCard from "../../components/ProductCard";
import { supabase } from "../../lib/supabase";
import { getSortConfig, isValidSortKey } from "@/lib/sorting";
import CatalogSortSelect from "../../components/CatalogSortSelect";
import CatalogStatusFilter, { StatusKey } from "../../components/CatalogStatusFilter";

const categories = [
  { name: "Lighting", slug: "lighting" },
  { name: "Seating", slug: "seating" },
  { name: "Cabinets & Storage", slug: "cabinets-storage" },
  { name: "Tables & Trolleys", slug: "tables-trolleys" },
  { name: "Mirrors", slug: "mirrors" },
  { name: "Decorative", slug: "decorative" },
];

type SearchParams = {
  q?: string;
  page?: string;
  sort?: string;
  status?: string;
};

const PRODUCTS_PER_PAGE = 18;

function isValidStatus(value: string | undefined): value is StatusKey {
  return value === 'available' || value === 'sold' || value === 'all';
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, page, sort, status } = await searchParams;

  const currentPage = Number(page) || 1;
  const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;
  const sortKey = isValidSortKey(sort) ? sort : "newest";
  const { column, ascending } = getSortConfig(sortKey);
  const statusKey = isValidStatus(status) ? status : "available";

  const sortParam = sortKey !== "newest" ? `&sort=${encodeURIComponent(sortKey)}` : "";
  const statusParam = statusKey !== "available" ? `&status=${encodeURIComponent(statusKey)}` : "";

  let query = supabase
    .from("products")
    .select("*, product_images(url, sort_order)", { count: "exact" });

  if (statusKey === 'available') {
    query = query.eq('is_active', true);
  } else if (statusKey === 'sold') {
    query = query.eq('is_active', false);
  }

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const {
    data: products,
    error,
    count,
  } = await query
    .order(column, { ascending })
    .order("id", { ascending: true })
    .range(from, to);

  if (error) console.error(error);

  const totalPages = Math.ceil((count ?? 0) / PRODUCTS_PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      <h1 className="text-4xl text-center mb-8 font-display">
        Catalog
      </h1>

      <nav className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/catalog/${cat.slug}`}
            className="border border-gray-300 rounded-full px-4 py-2 hover:bg-shop-accent hover:text-white"
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      <div className="flex flex-wrap justify-center items-center gap-3 mb-10">
        <form className="flex-1 max-w-md">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search products..."
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </form>
        <CatalogStatusFilter currentStatus={statusKey} />
        <CatalogSortSelect currentSort={sortKey} />
      </div>

      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                href={`/catalog?page=${currentPage - 1}${
                  q ? `&q=${encodeURIComponent(q)}` : ""
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
                href={`/catalog?page=${currentPage + 1}${
                  q ? `&q=${encodeURIComponent(q)}` : ""
                }${sortParam}${statusParam}`}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
              >
                &gt;
              </Link>
            )}

          </div>
        </>
      ) : (
        <p className="text-center">No products found.</p>
      )}
    </div>
  );
}