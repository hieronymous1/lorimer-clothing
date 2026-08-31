const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function loadCart(storedValue) {
  const writes = [];
  const context = vm.createContext({
    PRODUCTS: [
      { id: 'jacket', name: 'Jacket', price: 320, sizes: ['M'], images: ['./assets/photos/jacket.jpg'], available: true },
      { id: 'a', name: 'a', price: 2_000_000, sizes: ['M'], images: ['javascript:alert(1)'], available: true },
      { id: 'b', name: 'b', price: 2_000_000, sizes: ['M'], images: ['https://example.invalid/a.jpg'], available: true },
      { id: 'c', name: 'c', price: 2_000_000, sizes: ['M'], images: ['./assets/../private.jpg'], available: true },
      { id: 'd', name: 'd', price: 2_000_000, sizes: ['M'], images: ['./assets/%2e%2e/private.jpg'], available: true },
    ],
    localStorage: {
      getItem: () => storedValue,
      setItem: (key, value) => writes.push([key, value]),
      removeItem: () => {},
    },
  });
  vm.runInContext(read('js/cart.js'), context);
  return {
    getCart: () => vm.runInContext('getCart()', context),
    getTotal: () => vm.runInContext('getTotal()', context),
    writes,
  };
}

test('checkout page collects no card or personal data directly — payment happens on Stripe', () => {
  const html = read('checkout.html');
  // Card/address entry happens on Stripe's own hosted Checkout page, never here.
  assert.doesNotMatch(html, /<(?:form|input|select|textarea)\b/i);
  assert.doesNotMatch(html, /(?:card number|cvc|customer information)/i);
});

test('checkout.js only redirects to a server-issued Stripe URL, never fabricates success itself', () => {
  const source = read('js/checkout.js');
  // A real click handler, not a <form> submit — Stripe never sees a same-origin form post.
  assert.doesNotMatch(source, /addEventListener\s*\(\s*['"]submit['"]/);
  // The redirect target comes from the /api/checkout response, not a hardcoded success URL.
  assert.match(source, /window\.location\.href\s*=\s*data\.url/);
  assert.doesNotMatch(source, /window\.location\.href\s*=\s*['"]/);
});

test('stored cart rows are not rendered through innerHTML', () => {
  for (const file of ['js/main.js', 'js/checkout.js']) {
    const source = read(file);
    assert.doesNotMatch(source, /innerHTML\s*=\s*cart\.map/, `${file} renders stored data as HTML`);
  }
});

test('current project notes contain no non-empty credential query parameter', () => {
  const credentialName = ['sec', 'ret'].join('');
  const assignment = new RegExp(`${credentialName}\\s*=\\s*[^\\s&]+`, 'i');
  assert.equal(assignment.test(read('project.md')), false, 'project.md still contains a credential');
});

test('repository ignores operating-system metadata and the delivery folder', () => {
  const ignore = read('.gitignore').split(/\r?\n/);
  assert.ok(ignore.includes('.DS_Store'));
  assert.ok(ignore.includes('swisstransfer_c69bec8a-ddee-4a91-9611-ddab39e78eb7 (1)/'));
  assert.ok(fs.statSync(path.join(ROOT, 'assets')).isDirectory());
});

test('every page declares a favicon without making an extra request', () => {
  for (const file of ['index.html', 'shop.html', 'product-detail.html', 'checkout.html', 'ss24.html']) {
    assert.match(read(file), /<link rel="icon" href="data:,">/, `${file} has no inline favicon`);
  }
});

test('mobile navigation hides the centered logo to prevent control overlap', () => {
  const css = read('css/styles.css');
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.navbar__logo\s*\{\s*display:\s*none;\s*\}/);
});

test('malformed cart roots become empty without writing localStorage', () => {
  const cart = loadCart(JSON.stringify({ id: 'not-an-array' }));
  assert.deepEqual(Array.from(cart.getCart()), []);
  assert.equal(cart.writes.length, 0);
});

test('cart data is bounded, deduplicated, and replaced by canonical product data', () => {
  const stored = JSON.stringify([
    {
      id: ' jacket ',
      name: '<img src=x onerror=alert(1)>',
      size: ' M ',
      price: 320,
      quantity: 2.8,
      image: './assets/photos/jacket.jpg',
      admin: true,
    },
    {
      id: 'jacket',
      name: 'Duplicate',
      size: 'M',
      price: 320,
      quantity: 500,
      image: 'https://example.invalid/tracker.jpg',
    },
    { id: '', name: 'Invalid', size: 'S', price: 10, quantity: 1, image: '' },
  ]);
  const cart = loadCart(stored);
  const items = JSON.parse(JSON.stringify(cart.getCart()));

  assert.deepEqual(items, [{
    id: 'jacket',
    name: 'Jacket',
    size: 'M',
    price: 320,
    quantity: 99,
    image: './assets/photos/jacket.jpg',
  }]);
  assert.equal(cart.writes.length, 0);
});

test('cart rejects unsafe image paths and caps finite totals', () => {
  const entries = [
    ['javascript:alert(1)', 'a'],
    ['https://example.invalid/a.jpg', 'b'],
    ['./assets/../private.jpg', 'c'],
    ['./assets/%2e%2e/private.jpg', 'd'],
  ].map(([image, id]) => ({ id, name: id, size: 'M', price: 2_000_000, quantity: 1000, image }));
  const cart = loadCart(JSON.stringify(entries));
  const items = JSON.parse(JSON.stringify(cart.getCart()));

  assert.equal(items.length, 4);
  assert.ok(items.every(item => item.image === ''));
  assert.ok(items.every(item => item.price === 1_000_000 && item.quantity === 99));
  assert.equal(cart.getTotal(), 10_000_000);
});
