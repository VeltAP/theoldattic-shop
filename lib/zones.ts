export const SLOVENIA_ZONE_ID = 1;
export const EU_ZONE_ID = 2;
export const WORLDWIDE_ZONE_ID = 3;

export const EU_COUNTRY_CODES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
  'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
  'NL', 'PL', 'PT', 'RO', 'SE', 'SK',
] as const;

export const OTHER_SHIPPING_COUNTRY_CODES = [
  'GB', // United Kingdom
  'CH', // Switzerland
  'NO', // Norway
  'IS', // Iceland

  // North America
  'US', // United States
  'CA', // Canada

  'JP', // Japan
  'KR', // South Korea
  'SG', // Singapore
  'HK', // Hong Kong
  'TW', // Taiwan

  // Oceania
  'AU', // Australia
  'NZ', // New Zealand

  // Gulf states
  'AE', // United Arab Emirates
  'QA', // Qatar
  'SA', // Saudi Arabia
  'KW', // Kuwait
  'BH', // Bahrain
] as const;

export const countryNames: Record<string, string> = {
  SI: 'Slovenia',

  AT: 'Austria',
  BE: 'Belgium',
  BG: 'Bulgaria',
  CY: 'Cyprus',
  CZ: 'Czechia',
  DE: 'Germany',
  DK: 'Denmark',
  EE: 'Estonia',
  ES: 'Spain',
  FI: 'Finland',
  FR: 'France',
  GR: 'Greece',
  HR: 'Croatia',
  HU: 'Hungary',
  IE: 'Ireland',
  IT: 'Italy',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  LV: 'Latvia',
  MT: 'Malta',
  NL: 'Netherlands',
  PL: 'Poland',
  PT: 'Portugal',
  RO: 'Romania',
  SE: 'Sweden',
  SK: 'Slovakia',

  GB: 'United Kingdom',
  CH: 'Switzerland',
  NO: 'Norway',
  IS: 'Iceland',

  US: 'United States',
  CA: 'Canada',
  MX: 'Mexico',

  JP: 'Japan',
  KR: 'South Korea',
  SG: 'Singapore',
  HK: 'Hong Kong',
  TW: 'Taiwan',

  AU: 'Australia',
  NZ: 'New Zealand',

  AE: 'United Arab Emirates',
  QA: 'Qatar',
  SA: 'Saudi Arabia',
  KW: 'Kuwait',
  BH: 'Bahrain',
};

export const countryToZone: Record<string, number> = {
  SI: SLOVENIA_ZONE_ID,
  ...Object.fromEntries(EU_COUNTRY_CODES.map((code) => [code, EU_ZONE_ID])),
  ...Object.fromEntries(OTHER_SHIPPING_COUNTRY_CODES.map((code) => [code, WORLDWIDE_ZONE_ID])),
};

export function getZoneForCountry(countryCode: string): number | null {
  return countryToZone[countryCode] ?? null;
}

export const ALL_SHIPPING_COUNTRY_CODES = ['SI', ...EU_COUNTRY_CODES, ...OTHER_SHIPPING_COUNTRY_CODES];

export const SHIPPING_COUNTRY_OPTIONS = ALL_SHIPPING_COUNTRY_CODES.map((code) => ({
  code,
  name: countryNames[code],
})).sort((a, b) => a.name.localeCompare(b.name));