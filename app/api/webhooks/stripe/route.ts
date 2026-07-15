import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendOrderConfirmationEmail } from '@/lib/email/orderConfirmation';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const { data: existing } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (!existing) {
      const address = session.customer_details?.address;
      const cartItems: { id: number; qty: number; price: number }[] = JSON.parse(
        session.metadata?.cart ?? '[]'
      );

      const { data: order } = await supabaseAdmin
        .from('orders')
        .insert({
          stripe_session_id: session.id,
          customer_email: session.customer_details?.email ?? '',
          customer_phone: session.customer_details?.phone ?? '',
          shipping_country: address?.country ?? '',
          shipping_address_line1: address?.line1 ?? '',
          shipping_address_line2: address?.line2 ?? '',
          shipping_city: address?.city ?? '',
          shipping_postal_code: address?.postal_code ?? '',
          subtotal: (session.amount_subtotal ?? 0) / 100,
          total: (session.amount_total ?? 0) / 100,
          status: 'paid',
        })
        .select()
        .single();

      if (order) {
        const orderItems = cartItems.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.qty,
          price: item.price,
        }));
        await supabaseAdmin.from('order_items').insert(orderItems);

        for (const item of cartItems) {
          await supabaseAdmin
            .from('products')
            .update({ is_active: false, sold_at: new Date().toISOString() })
            .eq('id', item.id);
        }
      }

      if (order) {
        const orderItems = cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.qty,
            price: item.price,
        }));
        await supabaseAdmin.from('order_items').insert(orderItems);

        for (const item of cartItems) {
            await supabaseAdmin
            .from('products')
            .update({ is_active: false, sold_at: new Date().toISOString() })
            .eq('id', item.id);
        }

        await sendOrderConfirmationEmail(order, orderItems);
        }
    }
  }

  return new Response('OK', { status: 200 });
}