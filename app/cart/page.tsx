'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import {calculateShipping, getZoneForCountry, ShippingRate, ShippingZone, } from '@/lib/shipping';
import { SHIPPING_COUNTRY_OPTIONS } from '@/lib/zones';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [countryCode, setCountryCode] = useState('SI');
  const [loading, setLoading] = useState(true);

  // Fetch zones and rates once, when the page loads
  useEffect(() => {
    async function loadShippingData() {
      const { data: zoneData } = await supabase
        .from('shipping_zones')
        .select('id, name, country_codes');

      const { data: rateData } = await supabase
        .from('shipping_rates')
        .select('category_id, zone_id, rate');

      if (zoneData) {
        setZones(
          zoneData.map((z) => ({
            id: z.id,
            name: z.name,
            countryCodes: z.country_codes
              .split(',')
              .map((code) => code.trim())
              .filter(Boolean),
          }))
        );
      }
      if (rateData) {
        setRates(
          rateData
            .filter(
              (r): r is { category_id: number; zone_id: number; rate: number } =>
                r.category_id !== null && r.zone_id !== null
            )
            .map((r) => ({
              categoryId: r.category_id,
              zoneId: r.zone_id,
              rate: r.rate,
            }))
        );
      }
      setLoading(false);
    }
    loadShippingData();
  }, []);

  const matchedZone = getZoneForCountry(countryCode, zones);

  const shippingTotal = matchedZone
    ? calculateShipping(
        items.map((i) => ({
          productId: i.productId,
          categoryId: i.categoryId,
          quantity: i.quantity,
        })),
        matchedZone.id,
        rates
      )
    : 0;

  const grandTotal = subtotal + shippingTotal;

  const handleCheckout = async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(({ productId, name, price, quantity }) => ({
          productId,
          name,
          price,
          quantity,
        })),
        shippingTotal,
      }),
    });

    const { url } = await response.json();

    if (url) {
      window.location.assign(url);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-display mb-6">Shopping Cart</h1>
        <p className="text-lg text-gray-700 mb-8">
          Your cart is empty. Add items to see them here and get ready to checkout.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-900 shadow-sm transition hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }



  
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl text-center font-display mb-10">Shopping Cart</h1>

      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.productId} className="border border-gray-300 rounded p-4 flex gap-5">
            <div className="w-32 h-32 relative flex-shrink-0">
              <Image src={item.imageUrl} alt={item.name} fill className="object-cover rounded" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-medium">{item.name}</h2>

              <p className="mt-2">€{item.price.toFixed(2)}</p>

              <div className="mt-4">
                <label className="block mb-2">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-2 w-24"
                />
              </div>

              <button
                onClick={() => removeItem(item.productId)}
                className="mt-4 text-shop-accent hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-gray-300 rounded p-6 mt-10">
        <h2 className="text-2xl font-display mb-6">Shipping</h2>

        <label className="block mb-2">Destination Country</label>

        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          {SHIPPING_COUNTRY_OPTIONS.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>

        {matchedZone && <p className="mt-3 text-gray-600">Shipping Zone: {matchedZone.name}</p>}
      </div>

      <div className="border border-gray-300 rounded p-6 mt-8">
        {loading ? (
          <p>Loading shipping costs...</p>
        ) : (
          <>
            <div className="flex justify-between mb-3">
              <span>Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between mb-3">
              <span>Shipping</span>
              <span>€{shippingTotal.toFixed(2)}</span>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between text-xl font-semibold">
              <span>Total</span>
              <span>€{grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-8 bg-shop-accent text-white rounded py-3 hover:opacity-90"
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}