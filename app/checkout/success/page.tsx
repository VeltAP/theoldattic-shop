import Link from 'next/link';
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
  <div className="max-w-3xl mx-auto px-4 py-20 text-center">

    <h1 className="text-4xl font-display mb-6">
      Thank You for Your Order!
    </h1>

    <p className="text-gray-600 leading-7 mb-10">
      We have successfully received your order and payment.
      A confirmation email has been sent to:
    </p>

    <p className="text-xl font-semibold mb-10">
      {session.customer_details?.email}
    </p>

    <div className="border border-gray-300 rounded p-6 text-left mb-10">

      <h2 className="text-2xl font-display mb-5">
        Order Summary
      </h2>

      <div className="flex justify-between mb-3">
        <span>Subtotal</span>
        <span>€{((session.amount_subtotal ?? 0) / 100).toFixed(2)}</span>
      </div>

      <div className="flex justify-between mb-3">
        <span>Total Paid</span>
        <strong>€{((session.amount_total ?? 0) / 100).toFixed(2)}</strong>
      </div>

      <div className="flex justify-between">
        <span>Shipping Country</span>
        <span>{address?.country}</span>
      </div>

    </div>

    <p className="text-gray-700 leading-7 mb-10">
      We will carefully prepare your order and send you another email with
      tracking information once your package has been shipped.
    </p>

    <div className="flex justify-center gap-4">

      <Link
        href="/catalog"
        className="bg-shop-accent text-white px-6 py-3 rounded hover:opacity-90"
      >
        Continue Shopping
      </Link>

      <a
        href="/contact"
        className="border border-gray-300 px-6 py-3 rounded hover:bg-gray-100"
      >
        Contact Us
      </a>

    </div>

  </div>
);
}