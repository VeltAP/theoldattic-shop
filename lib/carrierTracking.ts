export const CARRIER_TRACKING_URLS: Record<string, (tracking: string) => string> = {
    'FedEx': (t) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(t)}`,
    'DHL': (t) => `https://www.dhl.com/track?tracking-id=${encodeURIComponent(t)}`,
    'UPS': (t) => `https://www.ups.com/track?tracknum=${encodeURIComponent(t)}`,
    'GLS': (t) => `https://gls-group.com/track?match=${encodeURIComponent(t)}`,
    'Pošta Slovenije': (t) => `https://sledenje.posta.si/${encodeURIComponent(t)}`,
    'DPD': (t) => `https://www.dpd.com/tracking?parcelNumber=${encodeURIComponent(t)}`,
    'TNT': (t) => `https://www.tnt.com/express/en_gb/site/shipping-tools/tracking.html?cons=${encodeURIComponent(t)}`,
};

export function getCarrierTrackingUrl(carrier: string | null, trackingNumber: string): string | null {
  if (!carrier) return null;
  const builder = CARRIER_TRACKING_URLS[carrier];
  return builder ? builder(trackingNumber) : null;
}