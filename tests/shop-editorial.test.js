const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function loadProducts() {
  const context = vm.createContext({ module: { exports: {} } });
  vm.runInContext(read('js/products-data.js'), context);
  return JSON.parse(JSON.stringify(context.module.exports));
}

const expectedRows = [
  ['products', 'phyllite-jacket', 'lorimer-selvedge-denim'],
  ['divider'],
  ['products', 'deconstructed-bomber', 'zip-up-utility-vest', 'westworld-button-up'],
  ['products', 'layered-denim-shorts', 'layered-denim-jeans', 'westworld-straight-jeans'],
  ['products', 'reconstructed-button-up-1', 'reconstructed-button-up-2', 'reinforced-pinstripe-trousers'],
  ['products', 'upcycled-two-piece', 'trigall-dress', 'overlapped-fray-skirt'],
  ['divider'],
  ['products', 'dual-texture-knit-vest', 'adjustable-button-trousers'],
  ['products', 'university-striped-sweatshirt', 'mens-straight-trousers'],
  ['products', '3d-panel-bomber', 'denim-leather-trousers'],
  ['products', 'asymmetrical-white-top', 'white-layered-skirt', 'ss24-dress'],
  ['products', 'zip-up-top', 'womens-wide-trousers'],
];

test('catalog has exact 26 garments and only the denim launch pieces are available', () => {
  const products = loadProducts();
  assert.equal(products.length, 26);
  assert.deepEqual(products.filter(product => product.available).map(product => product.id), ['phyllite-jacket', 'lorimer-selvedge-denim', 'lorimer-selvedge-denim-black']);
  assert.equal(new Set(products.map(product => product.id)).size, 26);
  assert.equal(products.find(product => product.id === 'westworld-button-up').name, 'Westworld');
  assert.equal(products.find(product => product.id === 'ss24-dress').name, 'S/S24 Dress');
  assert.equal(products.find(product => product.id === 'phyllite-jacket').images[0], './assets/photos/home/denim-feature-01.jpg');
  assert.equal(products.find(product => product.id === 'lorimer-selvedge-denim').images[0], './assets/photos/home/denim-feature-02.jpg');
  assert.equal(products.find(product => product.id === 'deconstructed-bomber').images[0], './assets/photos/PRODUCTS/Deconstructesd Bomber Jacket/1.jpg');
});

test('every Tops and Bottoms garment declares a subcategory', () => {
  const products = loadProducts();
  const topsSubcats = ['Shirts', "Women's Tops", 'Jackets', 'Sweatshirts', 'Vests'];
  const bottomsSubcats = ['Skirts', 'Trousers', 'Denim'];
  products.filter(p => p.category === 'Tops').forEach(p => assert.ok(topsSubcats.includes(p.subcategory), `${p.id} missing a valid Tops subcategory`));
  products.filter(p => p.category === 'Bottoms').forEach(p => assert.ok(bottomsSubcats.includes(p.subcategory), `${p.id} missing a valid Bottoms subcategory`));
});

test('homepage primary-product links use the canonical top-row IDs', () => {
  const html = read('index.html');
  assert.match(html, /href="product-detail\.html\?id=phyllite-jacket"[\s\S]*?denim-feature-01\.jpg[\s\S]*?>Phyllite Jacket</);
  assert.match(html, /href="product-detail\.html\?id=lorimer-selvedge-denim"[\s\S]*?denim-feature-02\.jpg[\s\S]*?>Lorimer Selvedge Denim</);
});

test('shop declares exact twelve-row sequence with no standalone look cards', () => {
  const source = read('js/shop.js');
  const context = vm.createContext({ module: { exports: {} } });
  vm.runInContext(`${source}\nmodule.exports = SHOP_ROWS;`, context);
  const rows = JSON.parse(JSON.stringify(context.module.exports));
  const compact = rows.map(row => [row.type, ...(row.products || [])]);
  assert.deepEqual(compact, expectedRows);
  assert.deepEqual(rows[1].images, ['./assets/photos/shop/still-01.jpg', './assets/photos/shop/still-02.jpg']);
  assert.deepEqual(rows[6].images, ['./assets/photos/shop/still-03.jpg', './assets/photos/shop/still-04.jpg']);
  assert.deepEqual(rows.map(row => Boolean(row.ss24)), [false, false, false, false, false, false, false, true, true, false, true, true]);
  assert.match(source, /rowIndex === 0 \? 'two'/);
});

test('shop cards link garments and replace sold-out prices', () => {
  const source = read('js/shop.js');
  assert.match(source, /product-detail\.html\?id=\$\{encodeURIComponent\(product\.id\)\}/);
  assert.match(source, /product\.available\s*\?\s*formatPrice\(product\.price\)\s*:\s*'Sold Out'/);
  assert.match(source, /textContent/);
  assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|onerror\s*=/);
});

test('no leftover "view look" card markup or styles', () => {
  const source = read('js/shop.js');
  const css = read('css/styles.css');
  assert.doesNotMatch(source, /shop-look-card|createLookCard|View Look/);
  assert.doesNotMatch(css, /shop-look-card/);
});

test('filters retain matching garments and subcategories while hiding editorial cards and empty rows', () => {
  const source = read('js/shop.js');
  assert.match(source, /row\.querySelectorAll\('\.product-card'\)/);
  assert.match(source, /row\.dataset\.rowType === 'divider'/);
  assert.match(source, /card\.dataset\.category !== filter && card\.dataset\.subcategory !== filter/);
  assert.match(source, /row\.hidden = visibleProducts === 0/);
});

test('shop sidebar declares Tops and Bottoms subcategory filters', () => {
  const html = read('shop.html');
  assert.match(html, />Shop All</);
  for (const filter of ['Shirts', "Women's Tops", 'Jackets', 'Sweatshirts', 'Vests', 'Skirts', 'Trousers', 'Denim']) {
    assert.match(html, new RegExp(`data-filter="${filter.replace(/'/g, "&#39;|'")}"`));
  }
});

test('shop CSS defines row columns, ratios, and mobile stacking', () => {
  const css = read('css/styles.css');
  assert.match(css, /\.shop-row\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.shop-row--two\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.shop-row--three\s*\{[^}]*display:\s*flex[^}]*justify-content:\s*center/s);
  assert.match(css, /\.shop-row--three \.product-card\s*\{[^}]*flex:\s*0 0 calc\(\(100% - 4px\) \/ 3\)/s);
  assert.match(css, /\.shop-divider__image\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.shop-row\s*\{[^}]*grid-template-columns:\s*1fr/s);
});

test('shop page reuses the ss24 scroll-lock pattern', () => {
  const css = read('css/styles.css');
  const html = read('shop.html');
  assert.match(html, /<body class="[^"]*\bshop-page\b/);
  assert.match(css, /html:has\(body\.shop-page\)\s*\{\s*scroll-snap-type:\s*y mandatory;\s*\}/);
});
