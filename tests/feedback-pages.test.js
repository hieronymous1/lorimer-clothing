const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const PAGES = ['index.html', 'ss24.html', 'shop.html', 'product-detail.html', 'checkout.html', 'about.html'];

test('homepage slideshow is the client seven from the Group set', () => {
  const html = read('index.html');
  const images = html.match(/class="look-section__media look-gallery[^"]*"[^>]*data-gallery-images="([^"]*)"/)[1].split('|');
  assert.deepEqual(images.map(src => src.split('/').pop()), [
    'F10E840B-0A75-47F7-A778-7E4FCB3E7413.JPG',
    '03B5025B-98F5-4A36-A8F9-58516410A806.JPG',
    '56AFFC6A-DA54-4CCE-8A62-8D128D74D297.JPG',
    '45D39E80-E7CC-4184-AF83-E545F1859F9A.JPG',
    '68DD5925-96F3-4CFC-9AD2-BEDD9534A61A.JPG',
    'C629834E-4F3B-4A80-90C5-37A555B36A68.JPG',
    '773069D2-7E89-4446-9633-C799B9202234.JPG',
  ]);
  images.forEach(src => assert.ok(fs.existsSync(path.join(ROOT, src.replace(/^\.\//, ''))), src));
});

test('homepage preview grid follows the client order with new names', () => {
  const html = read('index.html');
  const preview = html.slice(html.indexOf('product-preview__grid'));
  const ids = [...preview.matchAll(/class="preview-card[^"]*" href="product-detail\.html\?id=([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(ids, ['deconstructed-bomber', 'reconstructed-button-up-1', 'zip-up-utility-vest', 'layered-denim-shorts', 'adjustable-button-trousers', 'layered-denim-jeans']);
  ['Mason Jacket 001', 'Mercer Shirt 001', 'Gardner Vest 001', 'Weaver Shorts 001', 'Clasper Trousers 002', 'Weaver Jeans 002'].forEach(name => assert.match(preview, new RegExp(name)));
});

test('homepage covers: black denim stays, Phyllite uses IMG_2297', () => {
  const html = read('index.html');
  assert.match(html, /Lorimer Selvedge Denim Black - Photoshoot\/IMG_3161\.jpg/);
  assert.match(html, /Phyllite Jacket - Photoshoot\/IMG_2297\.jpg/);
});

test('every page: S/S24 label, footer ABOUT link, no custom cursor', () => {
  PAGES.forEach(page => {
    const html = read(page);
    assert.doesNotMatch(html, /S\/S_24/, page);
    assert.doesNotMatch(html, /<p>ABOUT<\/p>/, page);
    assert.match(html, /<footer[\s\S]*<a href="about\.html">ABOUT<\/a>/, page);
    assert.doesNotMatch(html, /cursor\.js/, page);
  });
  assert.ok(!fs.existsSync(path.join(ROOT, 'js/cursor.js')));
  const css = read('css/styles.css');
  assert.doesNotMatch(css, /custom-cursor/);
  assert.doesNotMatch(css, /gallery-detail-cursor/);
  assert.match(css, /\.gallery-image\s*\{[^}]*cursor:\s*zoom-in/);
});

test('SS24 Look 4 third image is DSC_0384', () => {
  const html = read('ss24.html');
  const look4 = html.match(/data-look="4" data-gallery-images="([^"]*)"/)[1].split('|');
  assert.equal(decodeURIComponent(look4[2]), 'assets/ss24-reedit/Look 4/DSC_0384.jpg');
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/ss24-reedit/Look 4/DSC_0384.jpg')));
});

test('SS24 product links share one alignment rule across both orientations', () => {
  const css = read('css/styles.css');
  assert.match(css, /\.lookbook-look__copy > a\s*\{[^}]*justify-self:\s*start/);
  assert.doesNotMatch(css, /\.lookbook-look--reverse \.lookbook-look__copy > a\s*\{[^}]*justify-self/);
});

test('size labels never double the "Size" prefix', () => {
  const vm = require('node:vm');
  const context = vm.createContext({ module: { exports: {} }, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } });
  vm.runInContext(read('js/products-data.js'), context);
  vm.runInContext(read('js/cart.js'), context);
  assert.equal(context.formatSizeLabel('Size 1.5'), 'Size 1.5');
  assert.equal(context.formatSizeLabel('32×32'), 'Size 32×32');
  assert.match(read('js/checkout.js'), /formatSizeLabel\(item\.size\)/);
  assert.match(read('js/main.js'), /formatSizeLabel\(line\.size\)/);
});

test('archive cards say Sold Out and the size guide sits in the size row', () => {
  assert.doesNotMatch(read('js/shop.js'), /Inquiry/);
  const html = read('product-detail.html');
  assert.match(html, /<div class="option-row">\s*<div class="option-group" id="size-grid"[^>]*><\/div>\s*<button class="option-group__guide" id="size-guide-trigger"/);
  assert.match(read('css/styles.css'), /\.option-row\s*\{[^}]*display:\s*flex[^}]*align-items:\s*center/);
});

test('every page loads one shared products-data and stylesheet version', () => {
  const pages = ['index.html', 'ss24.html', 'shop.html', 'product-detail.html', 'checkout.html', 'about.html'];
  const versions = name => new Set(pages.flatMap(page => [...read(page).matchAll(new RegExp(`${name}\\?v=(\\d+)`, 'g'))].map(m => m[1])));
  const data = versions('js/products-data\\.js');
  assert.equal(data.size, 1, `products-data versions: ${[...data]}`);
  assert.ok(Number([...data][0]) >= 13);
  const css = versions('css/styles\\.css');
  assert.equal(css.size, 1, `styles versions: ${[...css]}`);
  pages.forEach(page => assert.doesNotMatch(read(page), /href="css\/styles\.css"/, page));
});

test('an empty filter shows a visible message', () => {
  const js = read('js/shop.js');
  assert.match(js, /shop-filtered__empty/);
  assert.match(read('css/styles.css'), /\.shop-filtered__empty\s*\{/);
});
