import { stripe } from '../../../lib/stripe';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return <p>No session found.</p>;
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['customer_details'],
  });

  const address = session.customer_details?.address;
  const cartItems: { id: string; qty: number; price: number }[] = JSON.parse(
    session.metadata?.cart ?? '[]'
  );

  // Save the order
  const { data: order } = await supabaseAdmin
    .from('orders')
    .insert({
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

  // Save each item that was purchased
  if (order) {
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.qty,
      price: item.price,
    }));
    await supabaseAdmin.from('order_items').insert(orderItems);
  }

  return (
    <div>
      <h1>Thank you for your order!</h1>
      <p>A confirmation has been sent to {session.customer_details?.email}.</p>
    </div>
  );
}