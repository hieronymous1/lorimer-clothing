const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveLinePrice } = require('../../api/_lib/pricing');

const phyllite = {
  id: 'phyllite-jacket',
  price: 70,
  finishes: [
    { id: 'wax', label: 'WAX', price: 70 },
    { id: 'fabric-paint', label: 'FABRIC PAINT', price: 80 },
  ],
};
const denim = { id: 'lorimer-selvedge-denim', price: 80 };

test('finish price comes from the database row', () => {
  const row = { price_cents: 7000, finish_prices: { wax: 7100, 'fabric-paint': 8200 } };
  assert.deepEqual(resolveLinePrice(phyllite, row, 'fabric-paint'), {
    ok: true, unitAmount: 8200, finishId: 'fabric-paint', finishLabel: 'FABRIC PAINT',
  });
});

test('null finish_prices falls back to structural finish price, never zero', () => {
  const row = { price_cents: 7000, finish_prices: null };
  assert.equal(resolveLinePrice(phyllite, row, 'fabric-paint').unitAmount, 8000);
  assert.equal(resolveLinePrice(phyllite, row, 'wax').unitAmount, 7000);
});

test('unknown or missing finish is rejected for a finished product', () => {
  const row = { price_cents: 7000, finish_prices: null };
  assert.deepEqual(resolveLinePrice(phyllite, row, 'gold'), { ok: false, error: 'invalid finish' });
  assert.deepEqual(resolveLinePrice(phyllite, row, ''), { ok: false, error: 'invalid finish' });
  assert.deepEqual(resolveLinePrice(phyllite, row, undefined), { ok: false, error: 'invalid finish' });
});

test('non-positive database finish price is rejected', () => {
  const row = { price_cents: 7000, finish_prices: { wax: 0 } };
  assert.deepEqual(resolveLinePrice(phyllite, row, 'wax'), { ok: false, error: 'invalid price' });
});

test('products without finishes use price_cents and refuse a finish', () => {
  const row = { price_cents: 8000, finish_prices: null };
  assert.deepEqual(resolveLinePrice(denim, row, ''), { ok: true, unitAmount: 8000, finishId: '', finishLabel: '' });
  assert.deepEqual(resolveLinePrice(denim, row, 'wax'), { ok: false, error: 'invalid finish' });
});
