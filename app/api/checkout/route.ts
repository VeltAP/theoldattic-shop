import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';

type CheckoutCartItem = {
  name: string;
  price: number;
  quantity: number;
  productId: string;
};

type CheckoutRequestBody = {
  items: CheckoutCartItem[];
  shippingTotal: number;
};

export async function POST(request: Request) {
  try {
    const { items, shippingTotal }: CheckoutRequestBody = await request.json();

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100), // Stripe wants cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as its own line item, since Stripe's Checkout Session
    // wants a flat shipping_options rate rather than a per-item one
    line_items.push({
      price_data: {
        currency: 'eur',
        product_data: { name: 'Shipping' },
        unit_amount: Math.round(shippingTotal * 100),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      shipping_address_collection: {
        allowed_countries: ['SI', 'DE', 'AT', 'IT', 'FR', 'US', 'GB'],
      },
      phone_number_collection: { enabled: true },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
      metadata: {
        // stash productIds+quantities so success page can rebuild order_items
        cart: JSON.stringify(items.map((i) => ({ id: i.productId, qty: i.quantity, price: i.price }))),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}