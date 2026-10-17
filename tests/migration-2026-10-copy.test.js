const test = require('node:test');
const assert = require('node:assert/strict');
const { migrate, PREVIOUS_COPY, CONTENT_REPLACEMENTS } = require('../scripts/migrate-2026-10-copy.js');
const PRODUCTS = require('../js/products-data.js');

test('copy migration only updates approved descriptions and preserves commerce fields', async () => {
  const calls = [];
  const sql = async (strings, ...values) => {
    calls.push({ text: strings.join('?').replace(/\s+/g, ' ').trim(), values });
    return [{ id: values[1] }];
  };
  await migrate(sql);
  const productCalls = calls.filter(c => c.text.startsWith("update products"));
  assert.deepEqual(productCalls.map(c => c.values[1]), Object.keys(PREVIOUS_COPY));
  productCalls.forEach(({ text, values }) => {
    assert.match(text, /^update products set description = \?, updated_at = now\(\) where id = \? and description in \(\?, \?\) returning id$/);
    assert.equal(values[0], PRODUCTS.find(p => p.id === values[1]).description);
    assert.equal(values[2], PREVIOUS_COPY[values[1]]);
    assert.equal(values[3], values[0]);
  });
  const contentCalls = calls.filter(c => c.text.startsWith('update content'));
  assert.equal(contentCalls.length, CONTENT_REPLACEMENTS.length);
  contentCalls.forEach(({ text, values }, index) => {
    const replacement = CONTENT_REPLACEMENTS[index];
    assert.match(text, /where key = \? and position\(\? in value\) > 0$/);
    assert.deepEqual(values, [replacement.previous, replacement.next, replacement.key, replacement.previous]);
  });
});

test('copy migration reports conflicting admin copy rather than silently claiming success', async () => {
  await assert.rejects(migrate(async () => []), /missing product or newer admin copy/);
});
