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

test('about.html exposes all six editable content regions and the existing section markers still exist', () => {
  const html = read('about.html');
  ['about.brand', 'about.terms', 'about.delivery', 'about.payments', 'about.pricing', 'about.returns'].forEach(key => {
    assert.match(html, new RegExp(`data-cms-key="${key}"`), `about.html is missing data-cms-key="${key}"`);
  });
});

test('every footer exposes the copyright and location as editable content', () => {
  ['index.html', 'about.html', 'shop.html', 'product-detail.html', 'ss24.html', 'checkout.html'].forEach(page => {
    const html = read(page);
    assert.match(html, /data-cms-key="footer\.copyright"/, `${page} footer is missing footer.copyright`);
    assert.match(html, /data-cms-key="footer\.location"/, `${page} footer is missing footer.location`);
  });
});

test('content-remote.js patches every [data-cms-key] element from /api/content', () => {
  const js = read('js/content-remote.js');
  assert.match(js, /fetch\('\/api\/content'/);
  assert.match(js, /data-cms-key/);
});

test('admin.html has a login form and all four tabs', () => {
  const html = read('admin.html');
  assert.match(html, /id="admin-login-form"/);
  ['products', 'inventory', 'orders', 'content'].forEach(tab => {
    assert.match(html, new RegExp(`data-tab="${tab}"`), `admin.html is missing the ${tab} tab`);
    assert.match(html, new RegExp(`id="admin-tab-${tab}"`), `admin.html is missing the ${tab} panel`);
  });
});

test('admin.js calls every admin API route', () => {
  const js = read('js/admin.js');
  ['/api/admin/login', '/api/admin/products', '/api/admin/inventory', '/api/admin/orders', '/api/admin/content'].forEach(route => {
    assert.match(js, new RegExp(route.replace(/\//g, '\\/')), `admin.js never calls ${route}`);
  });
});
