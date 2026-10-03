const test = require('node:test');
const assert = require('node:assert/strict');
const SHIPPING_REGIONS = require('../../js/shipping-data.js');
const { ALLOWED_COUNTRIES, SHIPPING_OPTIONS, buildStripeShippingOptions, getShippingRegion } = require('../../api/_lib/shipping');

test('four regions with the client-approved rates in cents', () => {
  assert.deepEqual(
    SHIPPING_REGIONS.map(r => [r.region, r.label, r.amount_cents]),
    [
      ['FI', 'Finland', 790],
      ['EU', 'European Union', 1490],
      ['UK', 'United Kingdom', 1990],
      ['WW', 'Worldwide', 2490],
    ],
  );
  SHIPPING_REGIONS.forEach(r => assert.match(r.delivery, /^\d+–\d+ business days$/));
});

test('server options are built from the shared table', () => {
  assert.deepEqual(SHIPPING_OPTIONS.map(o => o.amount_cents), SHIPPING_REGIONS.map(r => r.amount_cents));
  assert.deepEqual(SHIPPING_OPTIONS.map(o => o.region), ['FI', 'EU', 'UK', 'WW']);
});

test('GB is only reachable through the UK region', () => {
  assert.deepEqual(getShippingRegion('UK').allowed_countries, ['GB']);
  ['FI', 'EU', 'WW'].forEach(code => assert.ok(!getShippingRegion(code).allowed_countries.includes('GB'), code));
  assert.ok(ALLOWED_COUNTRIES.includes('GB'));
});

test('regions constrain countries', () => {
  assert.deepEqual(getShippingRegion('FI').allowed_countries, ['FI']);
  assert.ok(getShippingRegion('EU').allowed_countries.includes('ES'));
  assert.ok(!getShippingRegion('EU').allowed_countries.includes('FI'));
  assert.ok(getShippingRegion('WW').allowed_countries.includes('US'));
  assert.equal(getShippingRegion('ROW'), null);
  assert.equal(getShippingRegion('unknown'), null);
});

test('Stripe options are fixed EUR amounts for the selected region only', () => {
  const [option] = buildStripeShippingOptions('UK');
  assert.equal(option.shipping_rate_data.type, 'fixed_amount');
  assert.equal(option.shipping_rate_data.fixed_amount.currency, 'eur');
  assert.equal(option.shipping_rate_data.fixed_amount.amount, 1990);
  assert.equal(option.shipping_rate_data.display_name, 'United Kingdom');
  assert.deepEqual(buildStripeShippingOptions('nope'), []);
});
