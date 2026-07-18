import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  // same admin-session check as your other /api/admin/* routes

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
    // Base the discount off original_price if one already exists, so applying
    // a second discount later doesn't stack on top of an already-discounted price.
    const basePrice = p.original_price ?? p.price;
    const newPrice = Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100;

    await supabaseAdmin
      .from('products')
      .update({ price: newPrice, original_price: basePrice })
      .eq('id', p.id);
  }

  return NextResponse.json({ success: true, updated: products.length });
}