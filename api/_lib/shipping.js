const SHIPPING_REGIONS = require('../../js/shipping-data.js');

const FINLAND = 'FI';

const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
];

const REST_OF_WORLD_COUNTRIES = [
  'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE',
  'GB', 'CH', 'NO', 'IS', 'AL', 'RS', 'ME', 'MK', 'BA', 'MD', 'UA',
  'AU', 'NZ', 'JP', 'KR', 'CN', 'HK', 'TW', 'SG', 'MY', 'TH', 'VN', 'PH', 'ID', 'IN',
  'AE', 'SA', 'IL', 'TR', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB',
  'ZA', 'EG', 'MA', 'NG', 'KE', 'GH',
];

const UNITED_KINGDOM = 'GB';
const WORLDWIDE_COUNTRIES = REST_OF_WORLD_COUNTRIES.filter(code => code !== UNITED_KINGDOM);

const COUNTRIES_BY_REGION = {
  FI: [FINLAND],
  EU: EU_COUNTRIES,
  UK: [UNITED_KINGDOM],
  WW: WORLDWIDE_COUNTRIES,
};

const ALLOWED_COUNTRIES = [FINLAND, ...EU_COUNTRIES, UNITED_KINGDOM, ...WORLDWIDE_COUNTRIES];

const SHIPPING_OPTIONS = SHIPPING_REGIONS.map(entry => ({
  ...entry,
  allowed_countries: COUNTRIES_BY_REGION[entry.region],
}));

function getShippingRegion(region) {
  return SHIPPING_OPTIONS.find(option => option.region === region) || null;
}

function buildStripeShippingOptions(region) {
  const selected = getShippingRegion(region);
  if (!selected) return [];
  return [selected].map(option => ({
    shipping_rate_data: {
      type: 'fixed_amount',
      fixed_amount: { amount: option.amount_cents, currency: 'eur' },
      display_name: option.label,
    },
  }));
}

module.exports = { FINLAND, EU_COUNTRIES, REST_OF_WORLD_COUNTRIES, WORLDWIDE_COUNTRIES, ALLOWED_COUNTRIES, SHIPPING_OPTIONS, getShippingRegion, buildStripeShippingOptions };
