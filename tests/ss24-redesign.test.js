const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const descriptions = [
  'A contoured seam defines the transition between knit textures as the silhouette adapts form through ferromagnetic articulation.',
  'Panelled construction composes a visual rhythm, bringing contrasting textures into a singular expression.',
  'Faceted engineering introduces a sculptural surface, balanced by a transition between structured and fluid materials.',
  'Curved panel seams define the upper form, giving way to a fluid sense of movement.',
  'Layered surfaces establish a softened sense of continuity, allowing asymmetry to move with cohesion.',
  'An asymmetrical silhouette unfolds from a sculpted foundation, as layered lengths and technical fabrications create a refined balance of structure and movement.',
];

test('SS24 page transcribes the reference copy and navigation', () => {
  const html = read('ss24.html');

  for (const label of ['S/S_24', 'SHOP', 'LORIMER®', 'ABOUT', 'CART']) {
    assert.match(html, new RegExp(label.replace('/', '\\/')));
  }
  descriptions.forEach(description => assert.ok(html.includes(description), `missing: ${description}`));
  assert.equal((html.match(/View in Products/g) || []).length, 6);
  assert.match(html, /9\.5\.2024/);
  assert.match(html, /© Lorimer 2026/);
  assert.match(html, /contact@lorimer\.com/);
  assert.doesNotMatch(html, /Nettspend|Slideshow arrow to show/);
});

test('SS24 page contains six exact Look-folder galleries and stable anchors', () => {
  const html = read('ss24.html');

  assert.equal((html.match(/class="lookbook-look\b/g) || []).length, 6);
  assert.equal((html.match(/class="lookbook-gallery\b/g) || []).length, 6);
  assert.equal((html.match(/class="lookbook-gallery__next"/g) || []).length, 0);
  assert.equal((html.match(/data-gallery-images=/g) || []).length, 6);
  assert.match(html, /assets\/ss24\/9\.5\.2024\.JPG/);
  assert.match(html, /js\/ss24\.js/);
  [4, 5, 6, 5, 5, 2].forEach((count, index) => {
    const look = index + 1;
    assert.match(html, new RegExp(`id="look-${look}"`));
    assert.equal((html.match(new RegExp(`assets/ss24/Look%20${look}/`, 'g')) || []).length, count + 1);
  });
  assert.doesNotMatch(html, /assets\/ss24\/(?:reedit|Group)\//);
  assert.doesNotMatch(html, /innerHTML\s*=/);
});

test('all configured Look images are owned by the project', () => {
  [4, 5, 6, 5, 5, 2].forEach((count, index) => {
    const directory = path.join(ROOT, `assets/ss24/Look ${index + 1}`);
    const images = fs.readdirSync(directory).filter(file => /\.(?:jpg|jpeg|png)$/i.test(file));
    assert.equal(images.length, count);
  });
});

test('View in Products links target exact stable product anchors', () => {
  const html = read('ss24.html');
  for (const id of ['dual-texture-knit-vest', 'university-striped-sweatshirt', '3d-panel-bomber', 'asymmetrical-white-top', 'zip-up-top', 'ss24-dress']) {
    assert.match(html, new RegExp(`href="shop\\.html#${id}"`));
  }
});

test('SS24 styles encode editorial ratios, responsive stack, and accessible controls', () => {
  const css = read('css/styles.css');

  assert.match(css, /\.ss24-page\s*\{/);
  assert.match(css, /\.lookbook-gallery\s*\{[\s\S]*?aspect-ratio:\s*2\s*\/\s*3/);
  assert.match(css, /\.lookbook-end__image\s*\{[\s\S]*?aspect-ratio:\s*3\s*\/\s*2/);
  assert.match(css, /\.lookbook-gallery:focus-visible/);
  assert.match(css, /\.lookbook-look\s*\{[\s\S]*?scroll-margin-top:\s*var\(--nav-h\)/);
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.lookbook-look/);
  assert.match(css, /@media\s*\(max-width:\s*420px\)[\s\S]*?\.lookbook-look\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
});

test('SS24 navigation and footer use the shared site chrome scale', () => {
  const css = read('css/styles.css');

  assert.match(css, /\.ss24-page\.page-body\s*\{\s*padding-top:\s*var\(--nav-h\)/);
  assert.match(css, /\.ss24-nav\s*\{[\s\S]*?height:\s*var\(--nav-h\)/);
  assert.match(css, /\.ss24-nav\s*\{[\s\S]*?border-bottom:\s*1px solid var\(--black\)/);
  assert.match(css, /\.ss24-footer\s*\{\s*padding:\s*32px 24px/);
  assert.doesNotMatch(css, /\.ss24-nav \.navbar__item,[\s\S]*?font-size:\s*8px/);
  assert.doesNotMatch(css, /\.ss24-footer \.footer__col p,[\s\S]*?font-size:\s*7px/);
});

test('SS24 look copy uses the editorial font treatment', () => {
  const css = read('css/styles.css');

  assert.match(css, /\.lookbook-look__copy h2\s*\{[\s\S]*?font-family:\s*var\(--font-serif\)/);
  assert.match(css, /\.lookbook-look__copy p\s*\{[\s\S]*?font-family:\s*var\(--font-serif\)[\s\S]*?line-height:\s*1\.5/);
  assert.match(css, /\.lookbook-look__copy a\s*\{[\s\S]*?font-family:\s*var\(--font-serif\)[\s\S]*?text-decoration:\s*underline/);
});

test('SS24 desktop composition uses the large reference scale', () => {
  const css = read('css/styles.css');

  assert.match(css, /\.lookbook\s*\{[\s\S]*?1500px/);
  assert.match(css, /\.lookbook-look\s*\{[\s\S]*?600px/);
  assert.match(css, /\.lookbook-look__copy h2\s*\{[\s\S]*?clamp\(18px,[^;]+24px\)/);
  assert.match(css, /\.lookbook-look__copy p\s*\{[\s\S]*?clamp\(16px,[^;]+22px\)/);
  assert.match(css, /\.lookbook-look__copy a\s*\{[\s\S]*?clamp\(14px,[^;]+18px\)/);
});

test('SS24 gallery controller supports hover preview, keyboard, swipe, and alt updates', () => {
  const source = read('js/ss24.js');

  assert.match(source, /injectCartDrawer\s*\(\s*\)/);
  assert.match(source, /replaceChildren|\.src\s*=/);
  assert.match(source, /image X of Y|image \$\{/);
  assert.match(source, /mouseenter/);
  assert.doesNotMatch(source, /mouseleave/);
  assert.match(source, /ArrowLeft/);
  assert.match(source, /ArrowRight/);
  assert.match(source, /touchstart/);
  assert.match(source, /touchend/);
  assert.doesNotMatch(source, /lookbook-gallery__next|innerHTML|insertAdjacentHTML|eval\s*\(/);
});

test('first two SS24 looks share a viewport-bounded reference composition and mobile order', () => {
  const css = read('css/styles.css');

  assert.match(css, /#look-1,\s*#look-2\s*\{[^}]*--look-composition-height:\s*min\(calc\(100svh - var\(--nav-h\) - 76px\),\s*850px\)/s);
  assert.match(css, /#look-1 \.lookbook-look__copy,\s*#look-2 \.lookbook-look__copy\s*\{[^}]*min-height:\s*var\(--look-composition-height\)/s);
  assert.match(css, /@media\s*\(max-width:\s*420px\)[\s\S]*?#look-1 \.lookbook-gallery,\s*#look-2 \.lookbook-gallery\s*\{[^}]*order:\s*1/s);
  assert.match(css, /@media\s*\(max-width:\s*420px\)[\s\S]*?#look-1 \.lookbook-look__copy,\s*#look-2 \.lookbook-look__copy\s*\{[^}]*order:\s*2/s);
});
