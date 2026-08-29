const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

test('homepage uses one seamless video beneath the aperture reveal', () => {
  const html = read('index.html');
  const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0] || '';

  assert.match(hero, /assets\/video\/lorimer-promo\.mp4/);
  assert.equal((hero.match(/<video\b/g) || []).length, 1);
  assert.match(hero, /hero__media/);
  assert.doesNotMatch(hero, /hero__col-images|MAH00426|<img\b[^>]*alt="Look [A-C2-3]"/);
  assert.doesNotMatch(hero, /hero__playback/);
});

test('homepage restores images for two featured and six preview products', () => {
  const html = read('index.html');
  const featured = html.match(/<section class="featured-products"[\s\S]*?<\/section>/)?.[0] || '';
  const preview = html.match(/<section class="product-preview"[\s\S]*?<\/section>/)?.[0] || '';

  assert.equal((featured.match(/class="[^"]*product-tile\b/g) || []).length, 2);
  assert.equal((preview.match(/class="[^"]*preview-card\b/g) || []).length, 6);
  assert.equal((featured.match(/<img\b/g) || []).length, 2);
  assert.equal((preview.match(/<img\b/g) || []).length, 6);
  assert.doesNotMatch(preview, /product-preview__names/);
  assert.equal((html.match(/View in products/g) || []).length, 8);
});

test('homepage interaction supports an aperture reveal and reduced motion', () => {
  const source = read('js/home.js');

  assert.match(source, /prefers-reduced-motion:\s*reduce/);
  assert.match(source, /--aperture/);
  assert.doesNotMatch(source, /playbackButton|hero__playback/);
  assert.match(source, /requestAnimationFrame/);
});

test('homepage-owned final assets exist', () => {
  const required = [
    'assets/video/lorimer-promo.mp4',
    'assets/photos/home/denim-feature-01.jpg',
    'assets/photos/home/denim-feature-02.jpg',
    'assets/photos/home/ss24-editorial.jpg',
  ];

  for (const relativePath of required) {
    assert.ok(fs.existsSync(path.join(ROOT, relativePath)), `${relativePath} is missing`);
  }
});

test('homepage product grid is large and uses the shared editorial section rhythm', () => {
  const css = read('css/styles.css');

  assert.match(css, /\.product-preview\s*\{[\s\S]*?width:\s*min\(100%\s*-\s*48px,\s*1120px\)/);
  assert.match(css, /\.product-preview\s*\{[\s\S]*?margin:\s*0\s+auto\s+var\(--home-section-gap\)/);
  assert.match(css, /\.look-section\s*\{[\s\S]*?height:\s*auto/);
  assert.match(css, /\.look-section\s*\{[\s\S]*?grid-template-columns:\s*minmax\(280px,\s*420px\)\s+minmax\(240px,\s*320px\)\s+auto/);
});

test('desktop homepage featured products stay viewport-bounded and footer has no top rule', () => {
  const css = read('css/styles.css');

  assert.match(css, /\.featured-products\s*\{[\s\S]*?max-height:\s*calc\(100svh\s*-\s*var\(--nav-h\)\)/);
  assert.match(css, /\.footer\s*\{[\s\S]*?border-top:\s*none/);
  assert.doesNotMatch(css, /\.product-tile:nth-child\(2\)\s*\{[^}]*margin-top:\s*(?!0\b)/);
});
