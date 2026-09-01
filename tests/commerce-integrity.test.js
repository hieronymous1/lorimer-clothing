const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('checkout binds one validated shipping region to its allowed countries and price', () => {
  const api = read('api/checkout.js');
  const client = read('js/checkout.js');
  const html = read('checkout.html');
  assert.match(api, /getShippingRegion\(shipping_region\)/);
  assert.match(api, /allowed_countries:\s*shippingRegion\.allowed_countries/);
  assert.match(api, /buildStripeShippingOptions\(shipping_region\)/);
  assert.match(client, /shipping_region:/);
  assert.match(html, /id="checkout-shipping-region"/);
});

test('checkout consolidates duplicate product-size rows before checking stock', () => {
  const api = read('api/checkout.js');
  assert.match(api, /lineKey/);
  assert.match(api, /existing\.quantity \+= quantity/);
});

test('webhook only claims an event atomically with inventory fulfillment', () => {
  const webhook = read('api/stripe-webhook.js');
  assert.match(webhook, /jsonb_to_recordset/);
  assert.match(webhook, /from lines, claimed/);
  assert.doesNotMatch(webhook, /const claimed = await sql`[\s\S]*?if \(claimed\.length/);
});

test('checkout uses Stripe integration tracking and dynamic payment methods', () => {
  const api = read('api/checkout.js');
  assert.match(api, /integration_identifier:/);
  assert.doesNotMatch(api, /payment_method_types/);
});

test('admin restores an existing session and supports product image uploads', () => {
  const login = read('api/admin/login.js');
  const admin = read('js/admin.js');
  assert.match(login, /req\.method === 'GET'/);
  assert.match(admin, /API\.session\(\)/);
  assert.match(admin, /API\.upload/);
  assert.match(admin, /type="file"/);
});

test('admin image uploads are restricted by type and size', () => {
  const upload = read('api/admin/upload.js');
  assert.match(upload, /MAX_UPLOAD_BYTES/);
  assert.match(upload, /image\//);
  assert.match(upload, /413/);
  assert.match(upload, /415/);
});

test('public products expose size stock and the storefront disables sold-out sizes', () => {
  const productsApi = read('api/products.js');
  const remote = read('js/products-remote.js');
  const productPage = read('js/product.js');
  const cart = read('js/cart.js');
  assert.match(productsApi, /stock_by_size/);
  assert.match(remote, /stockBySize/);
  assert.match(productPage, /product\.stockBySize\?\.\[size\]/);
  assert.match(cart, /product\.stockBySize/);
});
