import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

export default async function HomePage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, product_images(url, sort_order)')
    .eq('is_active', true)
    .limit(8);

  if (error) {
    console.error(error);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <h1 className="font-display text-4xl mb-2">Vintage Shop</h1>
        <p className="font-body text-lg">One-of-a-kind furniture and décor, carefully chosen.</p>
      </section>

      <h2 className="font-display text-2xl mb-4">New In</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products?.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            imageUrl={product.product_images?.[0]?.url}
          />
        ))}
      </div>
    </div>
  );
}