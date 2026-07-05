export type CartShippingItem = {
  productId: string;
  categoryId: number;
  quantity: number;
};

export type ShippingRate = {
  categoryId: number;
  zoneId: number;
  rate: number;
};

export type ShippingZone = {
  id: number;
  name: string;
  countryCodes: string[];
};

// Step A: figure out which zone a country belongs to
export function getZoneForCountry(
  countryCode: string,
  zones: ShippingZone[]
): ShippingZone | undefined {
  return zones.find((zone) => zone.countryCodes.includes(countryCode));
}

// Step B: calculate the total shipping cost for the whole cart
export function calculateShipping(
  items: CartShippingItem[],
  zoneId: number,
  rates: ShippingRate[]
): number {
  return items.reduce((total, item) => {
    const matchingRate = rates.find(
      (rate) => rate.categoryId === item.categoryId && rate.zoneId === zoneId
    );
    const ratePerItem = matchingRate ? matchingRate.rate : 0;
    return total + ratePerItem * item.quantity;
  }, 0);
}