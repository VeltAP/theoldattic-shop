import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { SalesManager } from '@/components/admin/SalesManager';

export default async function AdminSalesPage() {
  const [productsRes, categoriesRes, tagsRes] = await Promise.all([
    supabaseAdmin
      .from('products')
      .select('id, name, price, original_price, created_at, category_id, categories(name), product_tags(tag_id)')
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
    supabaseAdmin.from('categories').select('id, name'),
    supabaseAdmin.from('tags').select('id, name'),
  ]);
  
  const loadError = Boolean(productsRes.error || categoriesRes.error || tagsRes.error);

  return (
    <div className="max-w-5xl mx-auto mt-12 pb-20">
      <h1 className="font-display text-2xl text-shop-text mb-2">Sales &amp; Discounts</h1>
      <p className="text-sm text-shop-text/60 mb-8">
        Apply or remove a discount on one item, a group you pick by hand, a whole category, or a whole style tag.
      </p>

      {loadError ? (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded p-3">
          Could not load products, categories, or tags. Try reloading the page.
        </div>
      ) : (
        <SalesManager
          products={productsRes.data ?? []}
          categories={categoriesRes.data ?? []}
          tags={tagsRes.data ?? []}
        />
      )}
    </div>
  );
}