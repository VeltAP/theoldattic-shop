'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateShipping, getZoneForCountry, ShippingRate, ShippingZone } from '@/lib/shipping';
import { SHIPPING_COUNTRY_OPTIONS } from '@/lib/zones';

type ShippingEstimatorProps = {
  categoryId: number;
  rates: ShippingRate[];
};

export default function ShippingEstimator({ categoryId, rates }: ShippingEstimatorProps) {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [countryCode, setCountryCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadZones() {
      const { data: zoneData } = await supabase
        .from('shipping_zones')
        .select('id, name, country_codes');

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
      setLoading(false);
    }
    loadZones();
  }, []);

  const matchedZone = countryCode ? getZoneForCountry(countryCode, zones) : undefined;

  const estimate = matchedZone
    ? calculateShipping(
        [{ productId: '', categoryId, quantity: 1 }],
        matchedZone.id,
        rates
      )
    : null;

  return (
    <div className="border border-gray-300 rounded p-4 mt-4">
      <label className="block mb-2 text-sm font-medium">
        Estimate shipping
      </label>

      <select
        value={countryCode}
        onChange={(e) => setCountryCode(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2"
        disabled={loading}
        suppressHydrationWarning
      >
        <option value="">Select your country</option>
        {SHIPPING_COUNTRY_OPTIONS.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>

      {estimate !== null && (
        <p className="mt-3 text-sm text-shop-text/80">
          Estimated shipping to {matchedZone?.name}: <strong>€{estimate.toFixed(2)}</strong>
        </p>
      )}
    </div>
  );
}