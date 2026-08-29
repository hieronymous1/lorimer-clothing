const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('about page follows the approved reference content order', () => {
  const html = read('about.html');
  const markers = [
    'id="brand-title"',
    'id="terms-title"',
    '>Website Terms of Use</h2>',
    'id="delivery-title"',
    'id="payments-title"',
    'id="pricing-title"',
    'id="returns-title"',
  ];

  const positions = markers.map(marker => html.indexOf(marker));
  assert.ok(positions.every(position => position >= 0), 'about page is missing a required section');
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.match(html, /contact@lorimer\.com/);
  assert.match(html, /lorimer-clothing\.com/);
});

test('about page uses the four supplied editorial images in reference order', () => {
  const html = read('about.html');
  const images = ['IMG_7858.JPG', 'IMG_7679.JPG', 'JAquet.jpg', 'IMG_6484.JPG'];
  const positions = images.map(image => html.indexOf(`assets/photos/about/${image}`));

  assert.ok(positions.every(position => position >= 0), 'about page is missing a supplied image');
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.equal((html.match(/class="about-gallery__image(?:\s[^"]*)?"/g) || []).length, 4);
});

test('about page integrates shared navigation and identifies the current page', () => {
  const html = read('about.html');
  assert.match(html, /<nav class="navbar" aria-label="Primary navigation">/);
  assert.match(html, /href="about\.html"[^>]*aria-current="page"[^>]*>ABOUT</);
  assert.match(html, /CART <span class="cart-count">\(0\)<\/span>/);
});

test('about page ends with the approved shared storefront footer', () => {
  const html = read('about.html');
  const footer = html.match(/<footer class="[^"]*footer[^"]*"[\s\S]*?<\/footer>/)?.[0] || '';
  for (const content of ['ABOUT', '© Lorimer 2026', 'Helsinki, 00750', 'NEWSLETTER', 'contact@lorimer.com', '@Lorimer.Clo']) {
    assert.ok(footer.includes(content), `about footer is missing ${content}`);
  }
  assert.ok(html.indexOf('Return &amp; Exchange Policy') < html.indexOf('<footer'), 'footer must follow the policy content');
});

test('about layout matches desktop geometry and stacks galleries on mobile', () => {
  const css = read('css/styles.css');
  assert.match(css, /\.about-main\s*\{[\s\S]*?max-width:\s*910px/);
  assert.match(css, /\.about-gallery\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.about-gallery__image\s*\{[\s\S]*?aspect-ratio:\s*3\s*\/\s*2/);
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.about-gallery\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
});

test('about typography uses Lorimer tokens with readable long-form hierarchy', () => {
  const css = read('css/styles.css');

  assert.match(css, /\.about-page\s*\{[\s\S]*?font-family:\s*var\(--font-sans\)/);
  assert.match(css, /\.about-brand p\s*\{[\s\S]*?font-family:\s*var\(--font-serif\)/);
  assert.match(css, /\.about-section h1\s*\{[^}]*font-family:\s*var\(--font-sans\)[^}]*font-size:\s*20px/s);
  assert.match(css, /\.about-section h2\s*\{[^}]*font-family:\s*var\(--font-sans\)[^}]*font-size:\s*16px/s);
  assert.match(css, /\.about-section h3\s*\{[\s\S]*?font-family:\s*var\(--font-mono\)[\s\S]*?font-size:\s*12px/);
  assert.match(css, /\.about-section p\s*\{[\s\S]*?font-family:\s*var\(--font-sans\)[\s\S]*?font-size:\s*14px[\s\S]*?line-height:\s*1\.6/);
  assert.doesNotMatch(css, /\.about-(?:page|section)[\s\S]{0,180}?Arial/);
});

test('about sections use positive tokenized spacing without overlap hacks', () => {
  const css = read('css/styles.css');
  assert.match(css, /--about-space-section:/);
  assert.match(css, /--about-space-gallery:/);
  assert.doesNotMatch(css, /\.about-gallery \+ \.about-section\s*\{[^}]*margin-top:\s*-/);
});

test('every page links About navigation to the dedicated page', () => {
  for (const page of ['index.html', 'shop.html', 'product-detail.html', 'checkout.html', 'ss24.html', 'about.html']) {
    const html = read(page);
    const nav = html.match(/<nav class="[^\"]*navbar[^\"]*"[^>]*>[\s\S]*?<\/nav>/)?.[0] || '';
    assert.match(nav, /href="about\.html"[^>]*>ABOUT<\/a>/, `${page} does not link to about.html`);
  }
  assert.match(read('index.html'), /hero__reveal-nav[\s\S]*?href="about\.html">ABOUT<\/a>/);
});
