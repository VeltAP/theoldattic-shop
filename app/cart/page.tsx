'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import {
  calculateShipping,
  getZoneForCountry,
  ShippingRate,
  ShippingZone,
} from '@/lib/shipping';
import Image from 'next/image';

// A small, fixed list is enough for a homework project —
// you can expand this later or pull it from a real country list package.
const COUNTRIES = [
  { code: 'SI', name: 'Slovenia' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'FR', name: 'France' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  // ...add whichever countries you want to offer
];

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
    return <p>Your cart is empty.</p>;
  }

  return (
    <div>
      <h1>Your Cart</h1>

      {items.map((item) => (
        <div key={item.productId}>
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={80}
            height={80}
          />
          <span>{item.name}</span>
          <span>€{item.price.toFixed(2)}</span>

          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(item.productId, Number(e.target.value))
            }
          />

          <button onClick={() => removeItem(item.productId)}>Remove</button>
        </div>
      ))}

      <div>
        <label htmlFor="country">Shipping to: </label>
        <select
          id="country"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        {matchedZone && <span> ({matchedZone.name} zone)</span>}
      </div>

      {loading ? (
        <p>Loading shipping rates…</p>
      ) : (
        <div>
          <p>Subtotal: €{subtotal.toFixed(2)}</p>
          <p>Shipping: €{shippingTotal.toFixed(2)}</p>
          <p>
            <strong>Total: €{grandTotal.toFixed(2)}</strong>
          </p>
          <button onClick={handleCheckout}>Checkout</button>
        </div>
      )}
    </div>
  );
}