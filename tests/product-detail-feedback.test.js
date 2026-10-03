const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

function loadProductModule() {
  const context = vm.createContext({ document: { addEventListener() {} }, window: {}, URLSearchParams });
  vm.runInContext(read('js/product.js'), context);
  return context;
}

test('finish from the URL is honoured only when known', () => {
  const { selectedFinishFromUrl } = loadProductModule();
  const product = { finishes: [{ id: 'wax' }, { id: 'fabric-paint' }] };
  assert.equal(selectedFinishFromUrl(product, '?id=phyllite-jacket&finish=fabric-paint'), 'fabric-paint');
  assert.equal(selectedFinishFromUrl(product, '?id=phyllite-jacket&finish=gold'), 'wax');
  assert.equal(selectedFinishFromUrl(product, '?id=phyllite-jacket'), 'wax');
  assert.equal(selectedFinishFromUrl({}, '?finish=wax'), '');
});

test('product page markup drops Style it with and adds sold-out metadata slots', () => {
  const html = read('product-detail.html');
  assert.doesNotMatch(html, /style-with/);
  assert.match(html, /id="finish-label"[^>]*>Select Finish</);
  assert.match(html, /id="product-constructed"/);
  assert.match(html, /id="product-made-in"/);
  assert.match(html, /id="product-one-of-one"/);
  assert.match(html, /id="product-price"[^>]*aria-live="polite"/);
});

test('product script uses one radio-group option component and no inquiry flow', () => {
  const js = read('js/product.js');
  assert.match(js, /function createOptionGroup/);
  assert.match(js, /setAttribute\('role', 'radiogroup'\)/);
  assert.match(js, /ArrowRight/);
  assert.doesNotMatch(js, /Inquiry/);
  assert.doesNotMatch(js, /renderStyleWith/);
  assert.match(js, /finish: /);
  assert.match(js, /Date of Construction: /);
});

test('option button styles follow the decided tokens', () => {
  const css = read('css/styles.css');
  assert.match(css, /--ease-out:\s*cubic-bezier\(0\.23, 1, 0\.32, 1\)/);
  assert.match(css, /--gray-text:\s*#6b6b73/);
  assert.match(css, /\.option-btn\s*\{[^}]*min-height:\s*44px[^}]*min-width:\s*72px/);
  assert.match(css, /\.option-btn:active\s*\{[^}]*transform:\s*scale\(\.97\)/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)\s*\{[^}]*\.option-btn:hover/);
  assert.doesNotMatch(css, /\.size-btn\s*\{/);
  assert.doesNotMatch(css, /\.finish-btn\s*\{/);
  assert.doesNotMatch(css, /transition:\s*all/);
});
