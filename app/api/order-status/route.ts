import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  const { orderId, email } = await request.json();

  if (!orderId || !email) {
    return NextResponse.json({ error: 'Order number and email are required.' }, { status: 400 });
  }

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, status, created_at, total, tracking_number, carrier, shipped_at, order_items(quantity, price, products(name))')
    .eq('id', orderId)
    .eq('customer_email', email.toLowerCase().trim())
    .maybeSingle();

  if (!order) {
    // Same error whether the order ID doesn't exist or the email doesn't match it —
    // being specific about which one was wrong would let someone brute-force
    // order IDs against a guessed email, one bit of information at a time.
    return NextResponse.json(
      { error: "We couldn't find an order with that number and email." },
      { status: 404 }
    );
  }

  return NextResponse.json({ order });
}