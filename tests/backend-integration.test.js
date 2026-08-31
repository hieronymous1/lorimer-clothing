const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('checkout page no longer shows the "coming soon" placeholder', () => {
  const html = read('checkout.html');
  assert.doesNotMatch(html, /Online checkout is currently unavailable/);
  assert.match(html, /id="checkout-pay-btn"/);
  assert.match(html, /id="checkout-success"/);
  assert.match(html, /id="checkout-canceled"/);
});

test('checkout.js posts to /api/checkout and clears the cart on success', () => {
  const js = read('js/checkout.js');
  assert.match(js, /fetch\('\/api\/checkout'/);
  assert.match(js, /clearCart\(\)/);
});
