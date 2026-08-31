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

test('every storefront page defers to products-remote.js before its page script', () => {
  const pages = [
    ['index.html', 'js/home.js'],
    ['about.html', 'js/main.js?v=7'],
    ['shop.html', 'js/shop.js?v=10'],
    ['product-detail.html', 'js/product.js?v=8'],
    ['ss24.html', 'js/ss24.js?v=9'],
    ['checkout.html', 'js/checkout.js'],
  ];

  pages.forEach(([page, pageScript]) => {
    const html = read(page);
    assert.match(html, /window\.__LORIMER_SCRIPTS_AFTER__ = \[/, `${page} is missing the deferred script list`);
    assert.match(html, new RegExp(pageScript.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${page} is missing ${pageScript} in its deferred list`);
    assert.match(html, /<script src="js\/products-remote\.js"><\/script>/, `${page} is missing products-remote.js`);
  });
});
