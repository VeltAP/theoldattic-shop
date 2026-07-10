import { supabase } from "../../lib/supabase";
import ProductCard from "../../components/ProductCard";
import Link from "next/link";

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
};

const PRODUCTS_PER_PAGE = 20;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, page } = await searchParams;

  const currentPage = Number(page) || 1;
  const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  let query = supabase
    .from("products")
    .select("*, product_images(url, sort_order)", { count: "exact" })
    .eq("is_active", true);

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const {
    data: products,
    error,
    count,
  } = await query.range(from, to);

  if (error) console.error(error);

  const totalPages = Math.ceil((count ?? 0) / PRODUCTS_PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* Title */}
      <h1 className="text-4xl text-center mb-8 font-display">
        Catalog
      </h1>

      {/* Categories */}
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

      {/* Search */}
      <form className="flex justify-center mb-10">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search products..."
          className="w-full max-w-md border border-gray-300 rounded px-4 py-2"
        />
      </form>

      {/* Products */}
      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                imageUrl={product.product_images?.[0]?.url}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-10">

            {currentPage > 1 && (
              <Link
                href={`/catalog?page=${currentPage - 1}${
                  q ? `&q=${encodeURIComponent(q)}` : ""
                }`}
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
                }`}
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