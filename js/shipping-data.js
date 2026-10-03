/* shipping-data.js — single source of shipping rates for storefront and API */
const SHIPPING_REGIONS = [
  { region: 'FI', label: 'Finland', amount_cents: 790, delivery: '1–3 business days' },
  { region: 'EU', label: 'European Union', amount_cents: 1490, delivery: '3–7 business days' },
  { region: 'UK', label: 'United Kingdom', amount_cents: 1990, delivery: '4–8 business days' },
  { region: 'WW', label: 'Worldwide', amount_cents: 2490, delivery: '5–14 business days' },
];

if (typeof module !== 'undefined') module.exports = SHIPPING_REGIONS;
