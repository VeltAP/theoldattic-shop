import { supabase } from '../../../lib/supabase';
import ProductCard from '../../../components/ProductCard';
import { notFound } from 'next/navigation';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const { data: categoryRow } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', category)
    .single();

  if (!categoryRow) {
    notFound();
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('*, product_images(url, sort_order)')
    .eq('is_active', true)
    .eq('category_id', categoryRow.id);

  if (error) console.error(error);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl mb-6">{categoryRow.name}</h1>

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