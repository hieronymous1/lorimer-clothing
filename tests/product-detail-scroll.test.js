const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

test('sold-out product pages replace price and disable size and purchase controls', () => {
  const source = read('js/product.js');
  assert.match(source, /product\.available\s*\?\s*'\$' \+ product\.price\s*:\s*'Sold Out'/);
  assert.match(source, /button\.disabled = !product\.available/);
  assert.match(source, /btn\.textContent = 'Sold Out'/);
  assert.match(source, /btn\.disabled = true/);
  assert.match(source, /if \(!product\.available\)/);
});

test('product detail uses one stacked gallery container without thumbnail controls', () => {
  const html = read('product-detail.html');

  assert.match(html, /<div class="product-gallery" id="product-gallery"/);
  assert.doesNotMatch(html, /gallery-main|gallery-thumbs/);
});

test('gallery renders every product image with safe DOM APIs and progressive loading', () => {
  const source = read('js/product.js');

  assert.match(source, /document\.createElement\('img'\)/);
  assert.match(source, /images\.forEach/);
  assert.match(source, /image\.className\s*=\s*'gallery-image'/);
  assert.match(source, /image\.loading\s*=\s*index\s*===\s*0\s*\?\s*'eager'\s*:\s*'lazy'/);
  assert.match(source, /image\.alt\s*=\s*index\s*===\s*0\s*\?\s*product\.name\s*:\s*''/);
  assert.match(source, /gallery\.appendChild\(image\)/);
  assert.doesNotMatch(source, /thumb|mainImg|innerHTML/);
});

test('empty galleries receive an accessible neutral placeholder', () => {
  const source = read('js/product.js');

  assert.match(source, /gallery-empty/);
  assert.match(source, /No product image available/);
  assert.match(source, /Array\.isArray\(product\.images\)/);
});

test('desktop stacks intrinsic-ratio images beside bounded sticky product information', () => {
  const css = read('css/styles.css');

  assert.match(css, /\.product-layout\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.product-gallery\s*\{[^}]*padding:\s*0/s);
  assert.match(css, /\.gallery-image\s*\{[\s\S]*?width:\s*100%[\s\S]*?height:\s*auto/);
  assert.match(css, /\.product-info\s*\{[\s\S]*?position:\s*sticky[\s\S]*?align-self:\s*start[\s\S]*?max-height:\s*calc\(100svh\s*-\s*var\(--nav-h\)\)/);
  assert.match(css, /\.product-info\s*\{[\s\S]*?overflow-y:\s*auto/);
  assert.doesNotMatch(css, /\.gallery-thumb/);
});

test('mobile gallery is edge-to-edge and product information returns to normal flow', () => {
  const css = read('css/styles.css');

  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.product-layout\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.product-info\s*\{[\s\S]*?position:\s*static[\s\S]*?max-height:\s*none[\s\S]*?overflow:\s*visible/);
});

test('product purchase controls retain visible keyboard focus', () => {
  const css = read('css/styles.css');

  assert.match(css, /\.size-btn:focus-visible/);
  assert.match(css, /\.btn-add-cart:focus-visible/);
});

test('desktop product images provide a cursor-tracked magnified detail lens', () => {
  const source = read('js/product.js');
  const css = read('css/styles.css');
  assert.match(source, /initImageMagnifier\(image\)/);
  assert.match(source, /pointermove/);
  assert.match(source, /pointerleave/);
  assert.match(source, /pointerType === 'touch'/);
  assert.match(source, /backgroundPosition/);
  assert.match(source, /Math\.min\(100, Math\.max\(0,/);
  assert.match(css, /\.gallery-magnifier\s*\{[\s\S]*?background-size:\s*250%/);
  assert.match(css, /@media\s*\(hover:\s*none\)[\s\S]*?\.gallery-magnifier\s*\{\s*display:\s*none/);
});

test('magnified product images use a restrained custom detail cursor', () => {
  const source = read('js/product.js');
  const css = read('css/styles.css');
  assert.match(source, /gallery-detail-cursor/);
  assert.match(source, /cursor\.style\.transform/);
  assert.match(source, /cursor\.classList\.add\('is-active'\)/);
  assert.match(source, /cursor\.classList\.remove\('is-active'\)/);
  assert.match(css, /\.gallery-detail-cursor::before/);
  assert.match(css, /\.gallery-detail-cursor::after/);
  assert.match(css, /\.gallery-detail-cursor\.is-active\s*\{[^}]*width:\s*42px[^}]*height:\s*42px/s);
  assert.match(css, /@media\s*\(hover:\s*none\)[\s\S]*?\.gallery-detail-cursor\s*\{\s*display:\s*none/);
});
