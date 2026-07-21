import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productIds } = await request.json();
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: 'No products selected.' }, { status: 400 });
  }

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, original_price')
    .in('id', productIds);

  if (!products) {
    return NextResponse.json({ error: 'Products not found.' }, { status: 404 });
  }

  for (const p of products) {
    if (p.original_price) {
      await supabaseAdmin.from('products').update({ price: p.original_price, original_price: null }).eq('id', p.id);
    }
  }

  return NextResponse.json({ success: true, updated: products.length });
}