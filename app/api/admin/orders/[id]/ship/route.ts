import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendShipmentEmail } from '@/lib/email/shipmentNotification';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  const { trackingNumber, carrier } = await request.json();

  if (!trackingNumber) {
    return NextResponse.json({ error: 'Tracking number is required.' }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single();
  const wasAlreadyShipped = existing?.status === 'shipped';

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'shipped',
      tracking_number: trackingNumber,
      carrier: carrier || null,
      shipped_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('id, customer_email, tracking_number, carrier, order_items(quantity, products(name))')
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  if (!wasAlreadyShipped) {
    await sendShipmentEmail({
      id: order.id,
      customer_email: order.customer_email,
      tracking_number: order.tracking_number ?? trackingNumber,
      carrier: order.carrier,
      order_items: order.order_items
        .filter((item): item is typeof item & { products: { name: string } } => item.products !== null)
        .map((item) => ({
          quantity: item.quantity ?? 0,
          products: { name: item.products.name },
        })),
    });
  }

  return NextResponse.json({ success: true, order });
}