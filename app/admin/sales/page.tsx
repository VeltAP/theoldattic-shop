import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { SalesManager } from '@/components/SalesManager';

export default async function AdminSalesPage() {
  const [{ data: products }, { data: categories }, { data: tags }] = await Promise.all([
    supabaseAdmin
      .from('products')
      .select('id, name, price, original_price, created_at, category_id, categories(name), product_tags(tag_id)')
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
    supabaseAdmin.from('categories').select('id, name'),
    supabaseAdmin.from('tags').select('id, name'),
  ]);

  return <SalesManager products={products ?? []} categories={categories ?? []} tags={tags ?? []} />;
}