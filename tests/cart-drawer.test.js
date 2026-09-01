const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function loadCartService(initialValue = null, { failWrites = false } = {}) {
  let storedValue = initialValue;
  const writes = [];
  const context = vm.createContext({
    localStorage: {
      getItem: () => storedValue,
      setItem: (key, value) => {
        if (failWrites) throw new Error('Storage unavailable');
        storedValue = value;
        writes.push([key, value]);
      },
      removeItem: () => { storedValue = null; },
    },
    Intl,
    PRODUCTS: [
      { id: 'jacket', name: 'Jacket', price: 185, images: ['./assets/photos/jacket.jpg'], sizes: ['M'], available: true },
      ...Array.from({ length: 51 }, (_, index) => ({ id: `item-${index}`, name: `Item ${index}`, price: 10, images: [], sizes: ['M'], available: true })),
      { id: 'sold-out', name: 'Sold Out', price: 20, images: [], sizes: ['M'], available: false },
    ],
  });
  vm.runInContext(read('js/cart.js'), context);
  return {
    run: expression => vm.runInContext(expression, context),
    writes,
    stored: () => storedValue,
  };
}

test('cart rejects sold-out, unknown, and forged availability inputs', async () => {
  const service = loadCartService();
  for (const productId of ['sold-out', 'unknown']) {
    const result = await service.run(`cartService.addLine({
      productId: '${productId}', name: 'Forged', size: 'M', available: true,
      unitPrice: { amountMinor: 1, currencyCode: 'USD' }
    })`);
    assert.equal(result.ok, false);
    assert.equal(result.error, 'product-unavailable');
  }
});

test('cart normalizes stale sold-out lines and canonicalizes available data', async () => {
  const service = loadCartService(JSON.stringify([
    { id: 'sold-out', name: 'Sold Out', size: 'M', price: 20, quantity: 1, image: '' },
    { id: 'jacket', name: 'Forged Name', size: 'M', price: 1, quantity: 1, image: '' },
  ]));
  const value = JSON.parse(JSON.stringify(await service.run('cartService.getCart()')));
  assert.equal(value.lines.length, 1);
  assert.equal(value.lines[0].productId, 'jacket');
  assert.equal(value.lines[0].name, 'Jacket');
  assert.equal(value.lines[0].unitPrice.amountMinor, 18500);
});

test('preview cart service exposes promise-based normalized state', async () => {
  const service = loadCartService();
  const result = await service.run(`cartService.addLine({
    productId: 'jacket', merchandiseId: '', name: 'Jacket', size: 'M',
    image: './assets/photos/jacket.jpg',
    unitPrice: { amountMinor: 18500, currencyCode: 'EUR' }
  })`);
  const value = JSON.parse(JSON.stringify(result));

  assert.equal(value.ok, true);
  assert.equal(value.cart.totalQuantity, 1);
  assert.deepEqual(value.cart.subtotal, { amountMinor: 18500, currencyCode: 'EUR' });
  assert.equal(value.cart.lines[0].lineKey, 'jacket|M');
  assert.deepEqual(value.cart.lines[0].lineTotal, { amountMinor: 18500, currencyCode: 'EUR' });
});

test('quantity mutation uses lineKey and returns the confirmed subtotal', async () => {
  const service = loadCartService(JSON.stringify([
    { id: 'jacket', name: 'Jacket', size: 'M', price: 185, quantity: 1, image: '' },
  ]));
  const result = await service.run(`cartService.updateLineQuantity('jacket|M', 3)`);
  const value = JSON.parse(JSON.stringify(result));

  assert.equal(value.ok, true);
  assert.equal(value.cart.lines[0].quantity, 3);
  assert.equal(value.cart.totalQuantity, 3);
  assert.equal(value.cart.subtotal.amountMinor, 55500);
});

test('a failed storage write returns the last confirmed cart', async () => {
  const stored = JSON.stringify([
    { id: 'jacket', name: 'Jacket', size: 'M', price: 185, quantity: 1, image: '' },
  ]);
  const service = loadCartService(stored, { failWrites: true });
  const result = await service.run(`cartService.updateLineQuantity('jacket|M', 2)`);
  const value = JSON.parse(JSON.stringify(result));

  assert.equal(value.ok, false);
  assert.equal(value.error, 'storage-unavailable');
  assert.equal(value.cart.lines[0].quantity, 1);
  assert.equal(service.stored(), stored);
});

test('a distinct fifty-first line is rejected without writing', async () => {
  const existing = Array.from({ length: 50 }, (_, index) => ({
    id: `item-${index}`,
    name: `Item ${index}`,
    size: 'M',
    price: 10,
    quantity: 1,
    image: '',
  }));
  const service = loadCartService(JSON.stringify(existing));
  const result = await service.run(`cartService.addLine({
    productId: 'item-50', merchandiseId: '', name: 'Item 50', size: 'M', image: '',
    unitPrice: { amountMinor: 1000, currencyCode: 'USD' }
  })`);
  const value = JSON.parse(JSON.stringify(result));

  assert.equal(value.ok, false);
  assert.equal(value.error, 'line-limit');
  assert.equal(value.cart.lines.length, 50);
  assert.equal(service.writes.length, 0);
});

test('drawer source contains modal, quantity, status, and live checkout controls', () => {
  const source = read('js/main.js');

  assert.match(source, /aria-modal="true"/);
  assert.match(source, /class="cart-status"[^>]*aria-live="polite"/);
  assert.match(source, /cart-item__quantity-decrement/);
  assert.match(source, /cart-item__quantity-increment/);
  assert.match(source, /class="btn-checkout" href="checkout\.html">Checkout/);
  assert.match(source, /\.inert\s*=/);
  assert.match(source, /trapCartFocus/);
});

test('drawer styles implement compact desktop, full-width mobile, focus, and reduced motion', () => {
  const css = read('css/styles.css');

  assert.match(css, /\.cart-drawer\s*\{[\s\S]*?width:\s*380px/);
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.cart-drawer\s*\{\s*width:\s*100%;/);
  assert.match(css, /\.cart-drawer\s+[^{}]*:focus-visible|\.cart-drawer[^{}]*:focus-visible/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.cart-drawer/);
});

test('storefront pages version the coupled cart scripts together', () => {
  for (const page of ['index.html', 'shop.html', 'ss24.html', 'about.html', 'checkout.html', 'product-detail.html']) {
    const html = read(page);
    assert.match(html, /js\/cart\.js\?v=6/);
    assert.match(html, /js\/main\.js\?v=7/);
    assert.match(html, /js\/products-data\.js/);
  }
  assert.match(read('product-detail.html'), /js\/product\.js\?v=8/);
});
