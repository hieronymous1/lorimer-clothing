const test = require('node:test');
const assert = require('node:assert/strict');
const { ALLOWED_COUNTRIES, SHIPPING_OPTIONS, buildStripeShippingOptions, getShippingRegion } = require('../../api/_lib/shipping');

test('includes Finland and covers all three regions', () => {
  assert.ok(ALLOWED_COUNTRIES.includes('FI'));
  assert.equal(SHIPPING_OPTIONS.length, 3);
});

test('flat rates match the approved figures (in cents)', () => {
  const byRegion = Object.fromEntries(SHIPPING_OPTIONS.map(o => [o.region, o.amount_cents]));
  assert.equal(byRegion.FI, 500);
  assert.equal(byRegion.EU, 1200);
  assert.equal(byRegion.ROW, 2500);
});

test('buildStripeShippingOptions returns Stripe-shaped fixed_amount rates in EUR', () => {
  const options = buildStripeShippingOptions('EU');
  assert.equal(options.length, 1);
  options.forEach(option => {
    assert.equal(option.shipping_rate_data.type, 'fixed_amount');
    assert.equal(option.shipping_rate_data.fixed_amount.currency, 'eur');
    assert.equal(typeof option.shipping_rate_data.fixed_amount.amount, 'number');
    assert.equal(typeof option.shipping_rate_data.display_name, 'string');
  });
  assert.equal(options[0].shipping_rate_data.fixed_amount.amount, 1200);
});

test('shipping regions constrain the address countries and rate together', () => {
  assert.equal(getShippingRegion('FI').amount_cents, 500);
  assert.ok(getShippingRegion('EU').allowed_countries.includes('ES'));
  assert.ok(!getShippingRegion('EU').allowed_countries.includes('FI'));
  assert.ok(getShippingRegion('ROW').allowed_countries.includes('US'));
  assert.equal(getShippingRegion('unknown'), null);
});
