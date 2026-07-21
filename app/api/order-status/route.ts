import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  const { allowed } = await checkRateLimit(`order-status:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in a few minutes.' },
      { status: 429 }
    );
  }

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
    return NextResponse.json(
      { error: "We couldn't find an order with that number and email." },
      { status: 404 }
    );
  }

  return NextResponse.json({ order });
}