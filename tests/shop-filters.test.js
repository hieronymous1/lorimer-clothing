const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

const plain = value => JSON.parse(JSON.stringify(value));

function load() {
  const context = vm.createContext({ module: { exports: {} } });
  vm.runInContext(read('js/products-data.js'), context);
  vm.runInContext(read('js/shop.js'), context);
  // Top-level const bindings are not context properties; expose PRODUCTS for the tests.
  context.PRODUCTS = vm.runInContext('PRODUCTS', context);
  return context;
}

test('Bottoms and Denim lead with both denim colourways', () => {
  const ctx = load();
  ['Bottoms', 'Denim'].forEach(filter => {
    const layout = ctx.buildFilterLayout(ctx.PRODUCTS, filter);
    assert.deepEqual(plain(layout.featured.map(f => f.product.id)), ['lorimer-selvedge-denim', 'lorimer-selvedge-denim-black'], filter);
    assert.ok(!layout.rest.some(p => p.id.startsWith('lorimer-selvedge-denim')), filter);
    assert.ok(layout.rest.length > 0, filter);
  });
});

test('Tops and Jackets lead with the two Phyllite finishes', () => {
  const ctx = load();
  ['Tops', 'Jackets'].forEach(filter => {
    const layout = ctx.buildFilterLayout(ctx.PRODUCTS, filter);
    assert.deepEqual(plain(layout.featured.map(f => [f.product.id, f.finishId])), [['phyllite-jacket', 'wax'], ['phyllite-jacket', 'fabric-paint']], filter);
    assert.ok(!layout.rest.some(p => p.id === 'phyllite-jacket'), filter);
  });
});

test('other filters have no featured row and keep catalogue order', () => {
  const ctx = load();
  assert.deepEqual(plain(ctx.buildFilterLayout(ctx.PRODUCTS, 'Accessories').rest.map(p => p.id)), ['distressed-lorimer-cap']);
  assert.deepEqual(plain(ctx.buildFilterLayout(ctx.PRODUCTS, 'Shirts').featured), []);
  assert.equal(ctx.buildFilterLayout(ctx.PRODUCTS, 'Shirts').rest.length, 3);
  assert.deepEqual(plain(ctx.buildFilterLayout(ctx.PRODUCTS, 'Dresses').rest.map(p => p.id)).sort(), ['ss24-dress', 'trigall-dress']);
});

test('an empty filter returns nothing to render', () => {
  const ctx = load();
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.buildFilterLayout(ctx.PRODUCTS, 'Nothing'))), { featured: [], rest: [] });
});

test('shop chrome: mirrored centring grid, black prices, inset sidebar', () => {
  const css = read('css/styles.css');
  assert.match(css, /--shop-side:\s*clamp\(/);
  assert.match(css, /\.shop-layout\s*\{[^}]*grid-template-columns:\s*var\(--shop-side\) minmax\(0, 1fr\) var\(--shop-side\)/);
  assert.match(css, /\.product-card__price\s*\{[^}]*color:\s*var\(--black\)[^}]*font-size:\s*11px/);
  assert.match(css, /\.shop-filtered__track\s*\{[^}]*justify-content:\s*center/);
});
