import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productIds, discountPercent } = await request.json();

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: 'No products selected.' }, { status: 400 });
  }
  if (typeof discountPercent !== 'number' || discountPercent <= 0 || discountPercent >= 100) {
    return NextResponse.json({ error: 'Discount must be between 1 and 99 percent.' }, { status: 400 });
  }

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, price, original_price')
    .in('id', productIds);

  if (!products) {
    return NextResponse.json({ error: 'Products not found.' }, { status: 404 });
  }

  for (const p of products) {
    const basePrice = p.original_price ?? p.price;
    const newPrice = Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100;

    await supabaseAdmin
      .from('products')
      .update({ price: newPrice, original_price: basePrice })
      .eq('id', p.id);
  }

  return NextResponse.json({ success: true, updated: products.length });
}