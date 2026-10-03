const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

test('gallery controller drops the counter and keeps propagation guards', () => {
  const js = read('js/ss24.js');
  assert.doesNotMatch(js, /lookbook-gallery__counter/);
  assert.match(js, /aria-label', 'Previous image'/);
  assert.match(js, /aria-label', 'Next image'/);
  assert.match(js, /prevBtn\.addEventListener\('click', event => \{ event\.stopPropagation\(\)/);
  assert.match(js, /nextBtn\.addEventListener\('click', event => \{ event\.stopPropagation\(\)/);
});

test('edge scrims are visible at rest with gated hover and reduced motion', () => {
  const css = read('css/styles.css');
  assert.doesNotMatch(css, /\.lookbook-gallery__counter/);
  const nav = css.match(/\.lookbook-gallery__nav\s*\{[^}]*\}/)[0];
  assert.match(nav, /width:\s*72px/);
  assert.doesNotMatch(nav, /opacity:\s*0/);
  assert.match(css, /\.lookbook-gallery__nav--next\s*\{[^}]*linear-gradient\(to left, rgba\(0, 0, 0, \.22\), transparent\)/);
  assert.match(css, /\.lookbook-gallery__nav--prev\s*\{[^}]*linear-gradient\(to right, rgba\(0, 0, 0, \.22\), transparent\)/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)\s*\{[^}]*\.lookbook-gallery__nav:hover/);
  assert.match(css, /\.lookbook-gallery__image\s*\{[^}]*transition:\s*opacity 240ms var\(--ease-out\)/);
  assert.match(css, /@media \(max-width: 600px\)\s*\{[^}]*\.lookbook-gallery__nav\s*\{\s*width:\s*48px/);
});
