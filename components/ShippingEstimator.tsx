'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateShipping, getZoneForCountry, ShippingRate, ShippingZone } from '@/lib/shipping';

const COUNTRIES = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'NO', name: 'Norway' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'AE', name: 'United Arab Emirates' },
];

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
        {COUNTRIES.map((country) => (
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