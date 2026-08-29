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
  ['look', 'dual-texture-knit-vest', 'adjustable-button-trousers', 'look-1'],
  ['look', 'university-striped-sweatshirt', 'mens-straight-trousers', 'look-2'],
  ['products', '3d-panel-bomber', 'denim-leather-trousers'],
  ['look', 'asymmetrical-white-top', 'white-layered-skirt', 'look-4'],
  ['look', 'zip-up-top', 'womens-wide-trousers', 'look-5'],
  ['look', 'ss24-dress', 'look-6'],
];

test('catalog has exact 25 garments and only first two are available', () => {
  const products = loadProducts();
  assert.equal(products.length, 25);
  assert.deepEqual(products.filter(product => product.available).map(product => product.id), ['phyllite-jacket', 'lorimer-selvedge-denim']);
  assert.equal(new Set(products.map(product => product.id)).size, 25);
  assert.equal(products.find(product => product.id === 'westworld-button-up').name, 'Westworld');
  assert.equal(products.find(product => product.id === 'ss24-dress').name, 'S/S24 Dress');
  assert.equal(products.find(product => product.id === 'phyllite-jacket').images[0], './assets/photos/home/denim-feature-01.jpg');
  assert.equal(products.find(product => product.id === 'lorimer-selvedge-denim').images[0], './assets/photos/home/denim-feature-02.jpg');
  assert.equal(products.find(product => product.id === 'deconstructed-bomber').images[0], './assets/photos/PRODUCTS/Deconstructesd Bomber Jacket/1.jpg');
});

test('homepage primary-product links use the canonical top-row IDs', () => {
  const html = read('index.html');
  assert.match(html, /href="product-detail\.html\?id=phyllite-jacket"[\s\S]*?denim-feature-01\.jpg[\s\S]*?>Phyllite Jacket</);
  assert.match(html, /href="product-detail\.html\?id=lorimer-selvedge-denim"[\s\S]*?denim-feature-02\.jpg[\s\S]*?>Lorimer Selvedge Denim</);
});

test('shop declares exact thirteen-row sequence', () => {
  const source = read('js/shop.js');
  const context = vm.createContext({ module: { exports: {} } });
  vm.runInContext(`${source}\nmodule.exports = SHOP_ROWS;`, context);
  const rows = JSON.parse(JSON.stringify(context.module.exports));
  const compact = rows.map(row => [row.type, ...(row.products || []), ...(row.look ? [`look-${row.look}`] : [])]);
  assert.deepEqual(compact, expectedRows);
  assert.deepEqual(rows[1].images, ['./assets/photos/shop/still-01.jpg', './assets/photos/shop/still-02.jpg']);
  assert.deepEqual(rows[6].images, ['./assets/photos/shop/still-03.jpg', './assets/photos/shop/still-04.jpg']);
  assert.equal(rows[9].products.length, 2);
  assert.equal(rows[12].products.length, 1);
  assert.match(source, /rowIndex === 0 \? 'two'/);
});

test('shop cards link garments and replace sold-out prices', () => {
  const source = read('js/shop.js');
  assert.match(source, /product-detail\.html\?id=\$\{encodeURIComponent\(product\.id\)\}/);
  assert.match(source, /product\.available\s*\?\s*formatPrice\(product\.price\)\s*:\s*'Sold Out'/);
  assert.match(source, /textContent/);
  assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|onerror\s*=/);
});

test('look cards have exact destinations and assets', () => {
  const source = read('js/shop.js');
  for (const [look, image] of [[1, '37AC10C7-072C-4FFC-B401-D905B2D72774.JPG'], [2, '1A7930C9-3066-4EFC-AD1A-6E448A42D2E2.JPG'], [4, 'USETHIS.JPG'], [5, '52E2F432-A737-47D7-B6C2-FFB46E494D6D.JPG'], [6, '2AFEAA6F-061C-44D0-BC05-42F5C8ADED17.JPG']]) {
    assert.match(source, new RegExp(`ss24\\.html#look-${look}`));
    assert.ok(source.includes(image));
  }
});

test('filters retain matching garments while hiding editorial cards and empty rows', () => {
  const source = read('js/shop.js');
  assert.match(source, /row\.querySelectorAll\('\.product-card'\)/);
  assert.match(source, /row\.dataset\.rowType === 'divider'/);
  assert.match(source, /lookCard\.hidden = filter !== 'All'/);
  assert.match(source, /row\.hidden = visibleProducts === 0/);
});

test('shop CSS defines row columns, ratios, and mobile stacking', () => {
  const css = read('css/styles.css');
  assert.match(css, /\.shop-row\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.shop-row--two\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.shop-row--three\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.shop-divider__image\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  assert.match(css, /\.shop-look-card__image\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1\.414/s);
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.shop-row\s*\{[^}]*grid-template-columns:\s*1fr/s);
});
