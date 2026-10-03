const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

test('checkout loads the shared shipping table and renders native radios', () => {
  const html = read('checkout.html');
  assert.match(html, /<script src="js\/shipping-data\.js[^"]*"><\/script>/);
  assert.match(html, /<fieldset[^>]*id="checkout-shipping-region"/);
  assert.match(html, /<legend[^>]*>Shipping destination<\/legend>/);
  assert.doesNotMatch(html, /<select/);
  assert.doesNotMatch(html, /€5|€12|€25|Rest of world/);
});

test('checkout script reads rates only from SHIPPING_REGIONS', () => {
  const js = read('js/checkout.js');
  assert.match(js, /SHIPPING_REGIONS/);
  assert.match(js, /type = 'radio'|type="radio"/);
  assert.match(js, /function getSelectedRegion/);
  assert.doesNotMatch(js, /shippingByRegion\s*=\s*\{/);
  assert.match(js, /shipping_region: getSelectedRegion\(\)/);
});

test('checkout layout styles', () => {
  const css = read('css/styles.css');
  assert.match(css, /\.checkout-region\s*\{[^}]*min-height:\s*56px/);
  assert.match(css, /\.checkout-form\s*\{[^}]*max-width:\s*440px/);
  assert.match(css, /\.checkout-pay__button\s*\{[^}]*width:\s*100%[^}]*min-height:\s*48px/);
});
