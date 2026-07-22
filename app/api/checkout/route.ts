import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';
import type Stripe from 'stripe';
import { ALL_SHIPPING_COUNTRY_CODES } from '../../../lib/zones';

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
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

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
        allowed_countries: ALL_SHIPPING_COUNTRY_CODES as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
      phone_number_collection: { enabled: true },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
      metadata: {
        cart: JSON.stringify(items.map((i) => ({ id: Number(i.productId), name: i.name, qty: i.quantity, price: i.price }))),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}