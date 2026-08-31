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

const ALLOWED_COUNTRIES = [FINLAND, ...EU_COUNTRIES, ...REST_OF_WORLD_COUNTRIES];

const SHIPPING_OPTIONS = [
  { region: 'FI', label: 'Finland', amount_cents: 500 },
  { region: 'EU', label: 'European Union', amount_cents: 1200 },
  { region: 'ROW', label: 'Rest of world', amount_cents: 2500 },
];

function buildStripeShippingOptions() {
  return SHIPPING_OPTIONS.map(option => ({
    shipping_rate_data: {
      type: 'fixed_amount',
      fixed_amount: { amount: option.amount_cents, currency: 'eur' },
      display_name: option.label,
    },
  }));
}

module.exports = { FINLAND, EU_COUNTRIES, REST_OF_WORLD_COUNTRIES, ALLOWED_COUNTRIES, SHIPPING_OPTIONS, buildStripeShippingOptions };
