const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const pages = ['index.html', 'shop.html', 'ss24.html', 'product-detail.html', 'checkout.html'];
const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

test('every storefront page uses the approved five-item navigation order', () => {
  for (const page of pages) {
    const nav = read(page).match(/<nav class="[^"]*navbar[^"]*"[\s\S]*?<\/nav>/)?.[0] || '';
    assert.doesNotMatch(nav, />\s*HOME\s*</, `${page} still exposes HOME`);

    const positions = [
      nav.indexOf('S/S_24'),
      nav.indexOf('>SHOP<'),
      nav.indexOf('class="navbar__logo"'),
      nav.indexOf('>ABOUT<'),
      nav.indexOf('CART <span class="cart-count">(0)</span>'),
    ];
    assert.ok(positions.every(position => position >= 0), `${page} is missing a navigation item`);
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b), `${page} navigation order is wrong`);
    assert.match(nav, /class="navbar__logo" href="index\.html"/);
    assert.match(nav, /class="navbar__logo"[^>]*>[\s\S]*?<img[^>]+src="\.\/assets\/logo\.png"[^>]+alt="LORIMER®"/);
  }
});

test('cart count remains visible and renders a parenthesized quantity safely', () => {
  const source = read('js/main.js');
  const css = read('css/styles.css');

  assert.match(source, /el\.textContent\s*=\s*`\(\$\{count\}\)`/);
  assert.doesNotMatch(source, /classList\.toggle\('visible',\s*count\s*>\s*0\)/);
  assert.match(css, /\.cart-count\s*\{[\s\S]*?display:\s*inline/);
  assert.doesNotMatch(css, /\.cart-count\s*\{[^}]*border-radius/);
  assert.ok(source.indexOf('injectCartDrawer();') < source.indexOf('initCartDrawer();'), 'drawer must exist before listeners are attached');
});

test('shared navigation uses five equal tracks with a centered logo', () => {
  const css = read('css/styles.css');

  assert.match(css, /\.navbar\s*\{[\s\S]*?grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.navbar__logo\s*\{[\s\S]*?grid-column:\s*3/);
  assert.doesNotMatch(css, /\.navbar__logo\s*\{[^}]*position:\s*absolute/);
});

test('homepage uses the approved compact SS24 preview content', () => {
  const html = read('index.html');
  const section = html.match(/<section class="look-section"[\s\S]*?<\/section>/)?.[0] || '';

  assert.match(section, /Spring\/Summer 24/);
  assert.match(section, /SS24 Featuring 6 original looks available for viewing in Products and S\/S24 page/);
  assert.match(section, /View in S\/S24/);
  const expectedSlides = ['DSC04197.jpg', 'DSC04200.jpg', 'addition.jpg', 'IMG_6295.jpg', 'DSC_0409.jpg', 'addition4.jpg'];
  let previousSlide = -1;
  for (const slide of expectedSlides) {
    const position = section.indexOf(slide);
    assert.ok(position > previousSlide, `${slide} is missing or out of order`);
    previousSlide = position;
  }
  assert.match(section, /<a class="look-gallery__link" href="ss24\.html" aria-label="View the Spring\/Summer 2024 collection"><\/a>/);
  assert.match(section, /alt="Models walking the Lorimer Spring\/Summer 2024 runway"/);
});

test('homepage leads with black selvedge denim and replaces Westworld with pinstripe trousers', () => {
  const html = read('index.html');
  const featured = html.match(/<section class="featured-products"[\s\S]*?<\/section>/)?.[0] || '';
  const preview = html.match(/<section class="product-preview"[\s\S]*?<\/section>/)?.[0] || '';

  assert.match(featured, /product-detail\.html\?id=lorimer-selvedge-denim-black[\s\S]*?Lorimer Selvedge Denim Black - Photoshoot\/IMG_3161\.jpg/);
  assert.match(preview, /product-detail\.html\?id=reinforced-pinstripe-trousers[\s\S]*?Reinforced Pinstripe Trousers\/12\.jpg[\s\S]*?Reinforced Pinstripe Trousers/);
  assert.doesNotMatch(preview, /product-detail\.html\?id=westworld-button-up/);
});

test('homepage six-card grid mirrors the approved Shop catalog products', () => {
  const html = read('index.html');
  const section = html.match(/<section class="product-preview"[\s\S]*?<\/section>/)?.[0] || '';
  const products = [
    ['reconstructed-button-up-1', 'Reconstructed Button Up 001', 'Reconstructed Button Up 1/10.jpg'],
    ['deconstructed-bomber', 'Deconstructed Bomber Jacket', 'Deconstructesd Bomber Jacket/1.jpg'],
    ['zip-up-utility-vest', 'Zip Up Utility Vest', 'Zip Up Utility Vest/2.jpg'],
    ['reinforced-pinstripe-trousers', 'Reinforced Pinstripe Trousers', 'Reinforced Pinstripe Trousers/12.jpg'],
    ['layered-denim-jeans', 'Layered Distressed Jeans', 'Layered Denim Distressed Jeans/4.jpg'],
    ['layered-denim-shorts', 'Layered Distressed Shorts', 'Layerered Denim Distressed Shorts/6.jpg'],
  ];

  let previousPosition = -1;
  for (const [id, name, image] of products) {
    const position = section.indexOf(`product-detail.html?id=${id}`);
    assert.ok(position > previousPosition, `${id} is missing or out of order`);
    previousPosition = position;
    assert.ok(section.includes(name), `${id} has the wrong display name`);
    assert.ok(section.includes(image), `${id} has the wrong image`);
    assert.match(section, new RegExp(`<img[^>]+${image.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]+alt="[^"]+"`));
  }
});

test('homepage removes the standalone product row and uses one section gap token', () => {
  const html = read('index.html');
  const css = read('css/styles.css');

  assert.doesNotMatch(html, /product-preview__all|View all products/i);
  assert.match(css, /--home-section-gap:\s*clamp\(180px,\s*45svh,\s*480px\)/);
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?--home-section-gap:\s*clamp\(120px,\s*24svh,\s*180px\)/);
  assert.match(css, /\.featured-products\s*\{[^}]*margin:[^;}]*var\(--home-section-gap\)/s);
  assert.match(css, /\.product-preview\s*\{[^}]*margin:[^;}]*var\(--home-section-gap\)/s);
  assert.match(css, /\.preview-card:focus-visible \.card-media__action/);
});

test('every storefront page uses the approved footer content', () => {
  for (const page of pages) {
    const footer = read(page).match(/<footer class="[^"]*footer[^"]*"[\s\S]*?<\/footer>/)?.[0] || '';
    for (const content of ['ABOUT', '© Lorimer 2026', 'Helsinki, 00750', 'NEWSLETTER', 'contact@lorimer.com', '@Lorimer.Clo']) {
      assert.ok(footer.includes(content), `${page} footer is missing ${content}`);
    }
  }
});
