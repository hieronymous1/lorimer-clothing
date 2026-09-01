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

test('opening product pair uses the reference composition and keeps mobile price in flow', () => {
  const css = read('css/styles.css');

  assert.match(css, /\.shop-row:first-child\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*min\(100%,\s*592px\)\)\)/s);
  assert.match(css, /\.shop-row:first-child \.product-card__img\s*\{[^}]*aspect-ratio:\s*5\s*\/\s*7/s);
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.shop-row:first-child\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.shop-row:first-child \.product-card__info\s*\{[^}]*position:\s*static/s);
});

test('product galleries follow the supplied Finder compositions exactly', () => {
  const products = loadProducts();
  const imageOrder = {
    'westworld-button-up': ['3.jpg', 'DSC_0215.jpg', 'DSC_0263.jpg', 'IMG_2953.jpeg', 'IMG_2958.jpeg', 'IMG_3040.jpg'],
    'westworld-straight-jeans': ['7.jpg', 'DSC_0205.jpg', 'IMG_2945.jpg', 'IMG_2947.jpeg', 'IMG_3045.jpg'],
    'layered-denim-shorts': ['6.jpg', 'IMG_7821.JPG', 'IMG_7762.JPG', 'IMG_7769.JPG', 'IMG_7785.JPG', 'IMG_7641.JPG', 'IMG_7700.JPG', 'IMG_7814.JPG'],
    'layered-denim-jeans': ['4.jpg', 'IMG_7885.JPG', 'IMG_8054.JPG', 'IMG_8172.JPG', 'IMG_8175.JPG', 'IMG_7844.JPG', 'IMG_8039.JPG', 'IMG_8068.JPG'],
    'reconstructed-button-up-1': ['10.jpg', '11.jpg', 'IMG_6251.JPG', 'IMG_6352.JPG', 'IMG_6328.JPG'],
    'reconstructed-button-up-2': ['8.jpg', '9.jpg', 'IMG_6539.JPG', 'IMG_6624.JPG', 'IMG_6699.JPG'],
    'reinforced-pinstripe-trousers': ['12.jpg', 'IMG_6393.jpg', 'IMG_6712.JPG'],
    'upcycled-two-piece': ['15.jpg', 'Upsycle.Photo.Best.jpg', '82699B49-7632-4C84-B578-A3CC458E2F70.JPG'],
    'overlapped-fray-skirt': ['14.jpg', 'DSC_0107.jpg', 'DSC_0129.jpg', 'IMG_3029.jpeg', 'IMG_2981.jpeg', 'DSC_0279.jpg'],
    'dual-texture-knit-vest': ['16.jpg', 'DSC04170.jpg', 'IMG_6267.jpg'],
    'adjustable-button-trousers': ['17.jpg', 'DSC04171.jpg', 'IMG_6269.jpg'],
    'distressed-lorimer-cap': ['1.png'],
    'university-striped-sweatshirt': ['20.jpg', '3_VSCO.JPG', 'EditTest.jpg', 'DSC04153.jpg', '76F2B413-5A03-475A-A578-184DE63203E9.JPG'],
    'mens-straight-trousers': ['21.jpg'],
    '3d-panel-bomber': ['24.jpg', 'IMG_6298.jpg', '2_VSCO 3.JPG', 'DSC04180.jpg', '4AA042A9-08D3-488A-A147-C9A6784B1D37.JPG'],
    'denim-leather-trousers': ['25.jpg'],
    'asymmetrical-white-top': ['22.jpg', '18.png', 'IMG_0686_VSCO.JPG', 'IMG_0655_VSCO.JPG', 'EE2693BD-823D-43C5-8FB6-F2620A8E827B.JPG'],
    'white-layered-skirt': ['23.jpg', 'Skirtt.png'],
    'zip-up-top': ['18.jpg', '2_VSCO 5.JPG', 'IMG_0584_VSCO.JPG', '6CB18551-BC69-437A-A16D-4DE974995852.JPG'],
    'womens-wide-trousers': ['19.jpg', '16.png'],
    'ss24-dress': ['26.jpg', 'IMG_0742_VSCO.JPG', '942E4476-5B3C-45E8-8140-BD56FB69AC83.JPG'],
  };

  for (const [id, expectedNames] of Object.entries(imageOrder)) {
    const product = products.find(item => item.id === id);
    assert.ok(product, `missing product ${id}`);
    assert.deepEqual(product.images.map(image => decodeURIComponent(image.split('/').pop())), expectedNames, `${id} image order differs`);
    product.images.forEach(image => assert.ok(fs.existsSync(path.join(ROOT, decodeURIComponent(image))), `missing image ${image}`));
  }
});

test('SS24 dress sits with the Look 5 top and bottom in the final row', () => {
  const source = read('js/shop.js');
  const context = vm.createContext({ module: { exports: {} } });
  vm.runInContext(`${source}\nmodule.exports = SHOP_ROWS;`, context);
  const rows = JSON.parse(JSON.stringify(context.module.exports));

  assert.deepEqual(rows.at(-2).products, ['asymmetrical-white-top', 'white-layered-skirt']);
  assert.deepEqual(rows.at(-1).products, ['zip-up-top', 'womens-wide-trousers', 'ss24-dress']);
});
