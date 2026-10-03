# Client Feedback Round (October 2026) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the client's October feedback across homepage, SS24, Products, product pages, sold-out pages, and checkout, with server-authoritative per-finish Phyllite pricing and corrected four-region shipping.

**Architecture:** Static HTML pages with vanilla JS modules loaded in sequence (`products-data.js` → `products-remote.js` overrides from Neon → page scripts). Shared data files use the existing UMD pattern (`const X = …; if (typeof module !== 'undefined') module.exports = X;`) so the browser and Vercel functions read the same table. Pure logic is extracted into small testable units (`api/_lib/pricing.js`, `buildFilterLayout` in `js/shop.js`) and tested with `node:test` plus `node:vm`.

**Tech Stack:** HTML, CSS (`css/styles.css`), vanilla JS, Vercel serverless functions (CommonJS), Neon Postgres (`@neondatabase/serverless`), Stripe Checkout, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-03-client-feedback-round-design.md` (read it with this plan; Appendix A and B there hold all product copy).

## Global Constraints

- Product IDs and URLs never change.
- Server is authoritative for price: `api/checkout.js` ignores any client-supplied price.
- Shipping: FI €7.90 (`790`), EU €14.90 (`1490`), UK €19.90 (`1990`, GB only), WW €24.90 (`2490`, rest of world minus GB). Region codes `FI`, `EU`, `UK`, `WW`.
- Phyllite finishes: `wax` / `WAX` / €70, `fabric-paint` / `FABRIC PAINT` / €80. Sizes `Size 1`, `Size 1.5`, `Size 2`, `Size 2.5`. Stock per size, shared across finishes.
- Motion tokens: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`. Never `transition: all`. Animate only `transform`, `opacity`, `filter`. Hover effects only under `@media (hover: hover) and (pointer: fine)`. Every motion has a `prefers-reduced-motion: reduce` variant that keeps opacity and drops transforms.
- New token `--gray-text: #6b6b73` for muted text. Do not use `--gray-mid` for text you add or touch.
- Square corners everywhere (radius 0). Monochrome palette unchanged.
- No em-dash characters in any new visible copy you write (client-supplied names already containing them, such as `Lorimer Selvedge Denim — Blue`, stay as they are).
- Never run `scripts/migrate-2026-10.js` against a real `DATABASE_URL`, push, or deploy without explicit user approval.
- Do not touch `.agents/`, `.claude/`, `skills-lock.json`, or `.worktrees/`.
- Bump the `?v=` query on any script or stylesheet tag whose file you change, on every page that loads it.

## Review Focus

1. **A cart saved before this release** (lines with no `finish`, Phyllite at `Size 1`) must still load: a Phyllite line without a finish is normalised to `wax`, other lines are untouched. Test in Task 5.
2. **`?finish=` with an unknown value** (`?finish=gold`) must fall back to WAX, not break the page or add an unknown finish to the cart. Test in Task 7.
3. **Database row with `finish_prices` null** (migration not yet run) must still check out at the structural finish price, never at €0. Test in Task 3.
4. **Filtering to a category with zero matches** must show "No products found" and no empty featured row. Test in Task 8.
5. **A GB address on the EU or WW region** must be impossible: GB appears only in `UK`'s allowed countries. Test in Task 2.

---

### Task 1: Baseline test triage

The suite currently has 16 failing tests out of 110 on `design/elevation` before any change. They must be classified before new work, otherwise "all tests pass" cannot be used as acceptance.

**Files:**
- Modify: whichever of `tests/*.test.js` hold stale assertions; source files only for genuine regressions.

- [ ] **Step 1: Capture the failing list**

Run: `node --test --test-reporter=spec tests/*.test.js tests/lib/*.test.js 2>/dev/null | grep -E "✖" | sort -u`
Expected: the 16 names below.

```
about page uses the four supplied editorial images in reference order
about typography uses Lorimer tokens with readable long-form hierarchy
every storefront page defers to products-remote.js before its page script
sold-out product pages replace price and disable size and purchase controls
catalog has exact 27 garments and only the denim launch pieces are available
homepage primary-product links use the canonical top-row IDs
shop page reuses the ss24 scroll-lock pattern
SS24 page transcribes the reference copy and navigation
SS24 page contains six exact Look-folder galleries and stable anchors
SS24 styles encode editorial ratios, responsive stack, and accessible controls
SS24 desktop composition uses the large reference scale
SS24 gallery controller supports hover preview, keyboard, swipe, and alt updates
every storefront page uses the approved five-item navigation order
checkout page collects no card or personal data directly — payment happens on Stripe
every page declares a favicon without making an extra request
mobile navigation hides the centered logo to prevent control overlap
```

- [ ] **Step 2: Classify each failure**

For each test, read the failing assertion and compare it to the current code and to the approved specs in `docs/superpowers/specs/` (latest date wins). Classify as:
- **Stale:** the assertion encodes a decision a later approved spec superseded (e.g. image paths changed by the 2026-09-01 pass). Update the assertion to the current approved behaviour.
- **Regression:** the code violates a still-current requirement. Fix the source minimally.
- **Superseded by this plan:** the assertion will be rewritten by a later task (navigation label, gallery counter, checkout region select, catalog names). Mark it with `test.todo` *only if* a later task in this plan names it; otherwise treat as Stale or Regression.

Record the classification as a table in the commit body.

- [ ] **Step 3: Run the suite**

Run: `npm test`
Expected: 0 failures, except tests marked `todo`.

- [ ] **Step 4: Commit**

```bash
git add tests/ <any regression source fixes>
git commit -m "test: triage stale baseline assertions

<classification table>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Shared four-region shipping table

**Files:**
- Create: `js/shipping-data.js`
- Modify: `api/_lib/shipping.js`
- Test: `tests/lib/shipping.test.js` (rewrite)

**Interfaces:**
- Produces: global/module `SHIPPING_REGIONS: Array<{ region: 'FI'|'EU'|'UK'|'WW', label: string, amount_cents: number, delivery: string }>`.
- Produces (server): `getShippingRegion(code) -> { region, label, amount_cents, delivery, allowed_countries: string[] } | null`, `buildStripeShippingOptions(code)`, `ALLOWED_COUNTRIES`, `SHIPPING_OPTIONS` (same shape as `getShippingRegion` results).

- [ ] **Step 1: Write the failing tests**

Replace `tests/lib/shipping.test.js` with:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const SHIPPING_REGIONS = require('../../js/shipping-data.js');
const { ALLOWED_COUNTRIES, SHIPPING_OPTIONS, buildStripeShippingOptions, getShippingRegion } = require('../../api/_lib/shipping');

test('four regions with the client-approved rates in cents', () => {
  assert.deepEqual(
    SHIPPING_REGIONS.map(r => [r.region, r.label, r.amount_cents]),
    [
      ['FI', 'Finland', 790],
      ['EU', 'European Union', 1490],
      ['UK', 'United Kingdom', 1990],
      ['WW', 'Worldwide', 2490],
    ],
  );
  SHIPPING_REGIONS.forEach(r => assert.match(r.delivery, /^\d+–\d+ business days$/));
});

test('server options are built from the shared table', () => {
  assert.deepEqual(SHIPPING_OPTIONS.map(o => o.amount_cents), SHIPPING_REGIONS.map(r => r.amount_cents));
  assert.deepEqual(SHIPPING_OPTIONS.map(o => o.region), ['FI', 'EU', 'UK', 'WW']);
});

test('GB is only reachable through the UK region', () => {
  assert.deepEqual(getShippingRegion('UK').allowed_countries, ['GB']);
  ['FI', 'EU', 'WW'].forEach(code => assert.ok(!getShippingRegion(code).allowed_countries.includes('GB'), code));
  assert.ok(ALLOWED_COUNTRIES.includes('GB'));
});

test('regions constrain countries', () => {
  assert.deepEqual(getShippingRegion('FI').allowed_countries, ['FI']);
  assert.ok(getShippingRegion('EU').allowed_countries.includes('ES'));
  assert.ok(!getShippingRegion('EU').allowed_countries.includes('FI'));
  assert.ok(getShippingRegion('WW').allowed_countries.includes('US'));
  assert.equal(getShippingRegion('ROW'), null);
  assert.equal(getShippingRegion('unknown'), null);
});

test('Stripe options are fixed EUR amounts for the selected region only', () => {
  const [option] = buildStripeShippingOptions('UK');
  assert.equal(option.shipping_rate_data.type, 'fixed_amount');
  assert.equal(option.shipping_rate_data.fixed_amount.currency, 'eur');
  assert.equal(option.shipping_rate_data.fixed_amount.amount, 1990);
  assert.equal(option.shipping_rate_data.display_name, 'United Kingdom');
  assert.deepEqual(buildStripeShippingOptions('nope'), []);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/lib/shipping.test.js`
Expected: FAIL, `Cannot find module '../../js/shipping-data.js'`.

- [ ] **Step 3: Implement**

Create `js/shipping-data.js`:

```js
/* shipping-data.js — single source of shipping rates for storefront and API */
const SHIPPING_REGIONS = [
  { region: 'FI', label: 'Finland', amount_cents: 790, delivery: '1–3 business days' },
  { region: 'EU', label: 'European Union', amount_cents: 1490, delivery: '3–7 business days' },
  { region: 'UK', label: 'United Kingdom', amount_cents: 1990, delivery: '4–8 business days' },
  { region: 'WW', label: 'Worldwide', amount_cents: 2490, delivery: '5–14 business days' },
];

if (typeof module !== 'undefined') module.exports = SHIPPING_REGIONS;
```

In `api/_lib/shipping.js`, keep `FINLAND`, `EU_COUNTRIES`, and the rest-of-world list, then replace `SHIPPING_OPTIONS` and add the UK split:

```js
const SHIPPING_REGIONS = require('../../js/shipping-data.js');

const UNITED_KINGDOM = 'GB';
const WORLDWIDE_COUNTRIES = REST_OF_WORLD_COUNTRIES.filter(code => code !== UNITED_KINGDOM);

const COUNTRIES_BY_REGION = {
  FI: [FINLAND],
  EU: EU_COUNTRIES,
  UK: [UNITED_KINGDOM],
  WW: WORLDWIDE_COUNTRIES,
};

const ALLOWED_COUNTRIES = [FINLAND, ...EU_COUNTRIES, UNITED_KINGDOM, ...WORLDWIDE_COUNTRIES];

const SHIPPING_OPTIONS = SHIPPING_REGIONS.map(entry => ({
  ...entry,
  allowed_countries: COUNTRIES_BY_REGION[entry.region],
}));
```

Delete the old `ALLOWED_COUNTRIES` and `SHIPPING_OPTIONS` declarations. Keep `getShippingRegion` and `buildStripeShippingOptions` as they are. Update `module.exports` to `{ FINLAND, EU_COUNTRIES, REST_OF_WORLD_COUNTRIES, WORLDWIDE_COUNTRIES, ALLOWED_COUNTRIES, SHIPPING_OPTIONS, getShippingRegion, buildStripeShippingOptions }`.

- [ ] **Step 4: Run tests**

Run: `node --test tests/lib/shipping.test.js && npm test`
Expected: shipping tests PASS. If `tests/commerce-integrity.test.js` or `tests/storefront-security.test.js` assert `ROW` or the old amounts, update those assertions to the new codes and amounts in this task.

- [ ] **Step 5: Commit**

```bash
git add js/shipping-data.js api/_lib/shipping.js tests/
git commit -m "feat(shipping): four client-approved regions from one shared table

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Server-authoritative finish pricing in checkout

**Files:**
- Create: `api/_lib/pricing.js`
- Modify: `api/checkout.js`
- Test: `tests/lib/pricing.test.js`

**Interfaces:**
- Consumes: structural product from `js/products-data.js` where `finishes` is `Array<{ id, label, price }>` (Task 4 makes this real; tests here use inline fixtures).
- Produces: `resolveLinePrice(structural, dbRow, finish) -> { ok: true, unitAmount: number, finishId: string, finishLabel: string } | { ok: false, error: string }` where `dbRow = { price_cents: number, finish_prices: object|null }`.

- [ ] **Step 1: Write the failing tests**

Create `tests/lib/pricing.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveLinePrice } = require('../../api/_lib/pricing');

const phyllite = {
  id: 'phyllite-jacket',
  price: 70,
  finishes: [
    { id: 'wax', label: 'WAX', price: 70 },
    { id: 'fabric-paint', label: 'FABRIC PAINT', price: 80 },
  ],
};
const denim = { id: 'lorimer-selvedge-denim', price: 80 };

test('finish price comes from the database row', () => {
  const row = { price_cents: 7000, finish_prices: { wax: 7100, 'fabric-paint': 8200 } };
  assert.deepEqual(resolveLinePrice(phyllite, row, 'fabric-paint'), {
    ok: true, unitAmount: 8200, finishId: 'fabric-paint', finishLabel: 'FABRIC PAINT',
  });
});

test('null finish_prices falls back to structural finish price, never zero', () => {
  const row = { price_cents: 7000, finish_prices: null };
  assert.equal(resolveLinePrice(phyllite, row, 'fabric-paint').unitAmount, 8000);
  assert.equal(resolveLinePrice(phyllite, row, 'wax').unitAmount, 7000);
});

test('unknown or missing finish is rejected for a finished product', () => {
  const row = { price_cents: 7000, finish_prices: null };
  assert.deepEqual(resolveLinePrice(phyllite, row, 'gold'), { ok: false, error: 'invalid finish' });
  assert.deepEqual(resolveLinePrice(phyllite, row, ''), { ok: false, error: 'invalid finish' });
  assert.deepEqual(resolveLinePrice(phyllite, row, undefined), { ok: false, error: 'invalid finish' });
});

test('non-positive database finish price is rejected', () => {
  const row = { price_cents: 7000, finish_prices: { wax: 0 } };
  assert.deepEqual(resolveLinePrice(phyllite, row, 'wax'), { ok: false, error: 'invalid price' });
});

test('products without finishes use price_cents and refuse a finish', () => {
  const row = { price_cents: 8000, finish_prices: null };
  assert.deepEqual(resolveLinePrice(denim, row, ''), { ok: true, unitAmount: 8000, finishId: '', finishLabel: '' });
  assert.deepEqual(resolveLinePrice(denim, row, 'wax'), { ok: false, error: 'invalid finish' });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/lib/pricing.test.js`
Expected: FAIL, `Cannot find module '../../api/_lib/pricing'`.

- [ ] **Step 3: Implement `api/_lib/pricing.js`**

```js
function resolveLinePrice(structural, dbRow, finish) {
  const finishes = Array.isArray(structural?.finishes) ? structural.finishes : [];
  const finishId = typeof finish === 'string' ? finish : '';

  if (finishes.length === 0) {
    if (finishId) return { ok: false, error: 'invalid finish' };
    if (!Number.isInteger(dbRow?.price_cents) || dbRow.price_cents <= 0) return { ok: false, error: 'invalid price' };
    return { ok: true, unitAmount: dbRow.price_cents, finishId: '', finishLabel: '' };
  }

  const match = finishes.find(entry => entry.id === finishId);
  if (!match) return { ok: false, error: 'invalid finish' };

  const stored = dbRow?.finish_prices && typeof dbRow.finish_prices === 'object'
    ? dbRow.finish_prices[finishId]
    : undefined;
  const unitAmount = stored === undefined ? Math.round(match.price * 100) : stored;
  if (!Number.isInteger(unitAmount) || unitAmount <= 0) return { ok: false, error: 'invalid price' };

  return { ok: true, unitAmount, finishId, finishLabel: match.label };
}

module.exports = { resolveLinePrice };
```

- [ ] **Step 4: Wire into `api/checkout.js`**

1. Add `const { resolveLinePrice } = require('./_lib/pricing');`.
2. In the consolidation loop read `const finish = typeof item?.finish === 'string' ? item.finish : '';`, change the key to ``const lineKey = `${id}\u0000${size}\u0000${finish}`;`` and store `{ id, size, finish, quantity }`.
3. Change the product query to `select id, name, price_cents, finish_prices from products`.
4. In the line loop, after the existing validity check, add:

```js
    const priced = resolveLinePrice(structural, dbProduct, item.finish);
    if (!priced.ok) {
      res.status(400).json({ error: `${priced.error} for ${id}` });
      return;
    }
```

5. Stock check is per size. Two finishes of one size must share stock, so sum quantity per `id + size` before checking. Replace the per-line stock query with a pre-pass:

```js
  const quantityBySize = new Map();
  for (const item of consolidated.values()) {
    const sizeKey = `${item.id}\u0000${item.size}`;
    quantityBySize.set(sizeKey, (quantityBySize.get(sizeKey) || 0) + item.quantity);
  }
```

and in the loop check `stockRow.stock < quantityBySize.get(`${id}\u0000${size}`)`.

6. Build the Stripe line from `priced`:

```js
    const finishSuffix = priced.finishLabel ? ` (${toTitleCase(priced.finishLabel)})` : '';
    lines.push({
      quantity,
      price_data: {
        currency: 'eur',
        unit_amount: priced.unitAmount,
        product_data: {
          name: `${dbProduct.name}${finishSuffix}, ${size}`,
          metadata: { product_id: id, size, finish: priced.finishId },
        },
      },
    });
```

with, at the bottom of the file:

```js
function toTitleCase(label) {
  return label.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
}
```

- [ ] **Step 5: Add a source-level guard test**

Append to `tests/commerce-integrity.test.js`:

```js
test('checkout prices every line through resolveLinePrice and never trusts a client price', () => {
  const api = read('api/checkout.js');
  assert.match(api, /resolveLinePrice\(structural, dbProduct, item\.finish\)/);
  assert.match(api, /finish_prices from products/);
  assert.doesNotMatch(api, /item\.price\b/);
  assert.match(api, /quantityBySize/);
});
```

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add api/_lib/pricing.js api/checkout.js tests/
git commit -m "feat(checkout): price Phyllite lines by finish on the server

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Product data (archive copy, live copy, finishes, categories)

Mechanical and large. Copy text exactly from the spec's Appendix A and B.

**Files:**
- Modify: `js/products-data.js`
- Test: `tests/product-data.test.js` (create), `tests/shop-editorial.test.js` (update the catalog test's name and image expectations)

**Interfaces:**
- Produces on each archive product: `name`, `description` (paragraphs joined by `\n\n`), `constructedOn: string`, `madeIn: 'Spain'|'Finland'`, `notForSale: true`, `oneOfOne: true`; no `sizes`, `material`, `styleWith`, `longDescription`, `origin`.
- Produces on `phyllite-jacket`: `finishes: [{ id: 'wax', label: 'WAX', price: 70 }, { id: 'fabric-paint', label: 'FABRIC PAINT', price: 80, image: './assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_3420.jpg' }]`, `sizes: ['Size 1', 'Size 1.5', 'Size 2', 'Size 2.5']`, `images[0]` is `IMG_2297.jpg`.
- Produces on live denim: `description` (3 paragraphs), `material`.

- [ ] **Step 1: Write the failing test**

Create `tests/product-data.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
function loadProducts() {
  const context = vm.createContext({ module: { exports: {} } });
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/products-data.js'), 'utf8'), context);
  return JSON.parse(JSON.stringify(context.module.exports));
}

const ARCHIVE = {
  'deconstructed-bomber': ['Mason Jacket 001', 'April 2023', 'Spain'],
  'zip-up-utility-vest': ['Gardner Vest 001', 'June 2025', 'Finland'],
  'westworld-button-up': ['Fletcher Shirt 001', 'May 2023', 'Spain'],
  'layered-denim-shorts': ['Weaver Shorts 001', 'November 2025', 'Finland'],
  'layered-denim-jeans': ['Weaver Jeans 002', 'November 2025', 'Finland'],
  'westworld-straight-jeans': ['Fletcher Jeans 002', 'May 2023', 'Spain'],
  'reconstructed-button-up-1': ['Mercer Shirt 001', 'April 2025', 'Finland'],
  'reconstructed-button-up-2': ['Mercer Shirt 002', 'April 2025', 'Finland'],
  'reinforced-pinstripe-trousers': ['Sawyer Trousers 003', 'April 2025', 'Finland'],
  'upcycled-two-piece': ['Hosier Two Piece 002', 'February 2023', 'Spain'],
  'trigall-dress': ['Trigall Dress 001', 'August 2022', 'Spain'],
  'overlapped-fray-skirt': ['Webster Skirt 003', 'May 2023', 'Spain'],
  'dual-texture-knit-vest': ['Franklin Vest 001', 'May 2024', 'Spain'],
  'adjustable-button-trousers': ['Clasper Trousers 002', 'May 2024', 'Spain'],
  'university-striped-sweatshirt': ['UoL Sweatshirt 001', 'May 2024', 'Spain'],
  'mens-straight-trousers': ['Foreman Trousers 002', 'May 2024', 'Spain'],
  'distressed-lorimer-cap': ['Sterling Cap 003', 'May 2024', 'Spain'],
  '3d-panel-bomber': ['Slater Jacket 001', 'May 2024', 'Spain'],
  'denim-leather-trousers': ['Lacquer Trousers 002', 'May 2024', 'Spain'],
  'asymmetrical-white-top': ['Fowler Top 001', 'May 2024', 'Spain'],
  'white-layered-skirt': ['Lyster Skirt 004', 'May 2024', 'Spain'],
  'zip-up-top': ['Moulder Top 001', 'May 2024', 'Spain'],
  'womens-wide-trousers': ['Carder Trousers 002', 'May 2024', 'Spain'],
  'ss24-dress': ['Manuta Dress 001', 'May 2024', 'Spain'],
};

test('every archive piece carries the client name, date, origin and 1-of-1 status', () => {
  const products = loadProducts();
  Object.entries(ARCHIVE).forEach(([id, [name, constructedOn, madeIn]]) => {
    const product = products.find(entry => entry.id === id);
    assert.ok(product, id);
    assert.equal(product.name, name, id);
    assert.equal(product.constructedOn, constructedOn, id);
    assert.equal(product.madeIn, madeIn, id);
    assert.equal(product.notForSale, true, id);
    assert.equal(product.oneOfOne, true, id);
    ['sizes', 'material', 'styleWith', 'longDescription', 'origin'].forEach(field => assert.equal(product[field], undefined, `${id}.${field}`));
    assert.ok(product.description.split('\n\n').every(p => p.trim().length > 20), `${id} description paragraphs`);
  });
});

test('Phyllite has four sizes, two priced finishes and the new cover', () => {
  const phyllite = loadProducts().find(p => p.id === 'phyllite-jacket');
  assert.deepEqual(phyllite.sizes, ['Size 1', 'Size 1.5', 'Size 2', 'Size 2.5']);
  assert.deepEqual(phyllite.finishes.map(f => [f.id, f.label, f.price]), [['wax', 'WAX', 70], ['fabric-paint', 'FABRIC PAINT', 80]]);
  assert.match(phyllite.finishes[1].image, /IMG_3420\.jpg$/);
  assert.match(phyllite.images[0], /Phyllite Jacket - Photoshoot\/IMG_2297\.jpg$/);
  assert.equal(phyllite.images.filter(src => src.endsWith('IMG_2297.jpg')).length, 1);
  assert.equal(phyllite.material, '100% Cotton Denim, Stainless Steel Hardware');
  assert.equal(phyllite.description.split('\n\n').length, 2);
  assert.equal(phyllite.styleWith, undefined);
  assert.equal(phyllite.longDescription, undefined);
});

test('live denim carries the new copy and material', () => {
  const products = loadProducts();
  ['lorimer-selvedge-denim', 'lorimer-selvedge-denim-black'].forEach(id => {
    const denim = products.find(p => p.id === id);
    assert.match(denim.description, /^Constructed from a 100% Japanese Selvedge Denim fabric/);
    assert.equal(denim.description.split('\n\n').length, 3);
    assert.equal(denim.material, '100% Cotton Japanese Selvedge Denim, Cowhide Leather, Stainless Steel Hardware');
    assert.equal(denim.styleWith, undefined);
    assert.equal(denim.longDescription, undefined);
  });
});

test('Accessories contains only the cap', () => {
  const accessories = loadProducts().filter(p => p.category === 'Accessories').map(p => p.id);
  assert.deepEqual(accessories, ['distressed-lorimer-cap']);
  const suit = loadProducts().find(p => p.id === 'upcycled-two-piece');
  assert.equal(suit.category, 'Bottoms');
  assert.equal(suit.subcategory, 'Skirts');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/product-data.test.js`
Expected: FAIL on the first assertion (`Mason Jacket 001` vs current name).

- [ ] **Step 3: Edit `js/products-data.js`**

For each of the 24 archive IDs in the table above:
- Set `name` to the new name.
- Set `description` to the Appendix A paragraphs joined with `\n\n` (use a template literal or `'…\n\n…'`; keep curly apostrophes as straight `'` inside single-quoted strings by escaping, or use template literals).
- Add `constructedOn` and `madeIn` per the table.
- Add `notForSale: true` and `oneOfOne: true` where missing.
- Delete `sizes`, `material`, `styleWith`, `longDescription`, `origin`.
- Keep `id`, `category`, `subcategory`, `price`, `images`, and any other image or ordering fields exactly as they are.

`upcycled-two-piece`: `category: 'Bottoms', subcategory: 'Skirts'`.

`phyllite-jacket`: move `'./assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_2297.jpg'` to index 0 and remove it from its old slot; set `description` (Appendix B, 2 paragraphs joined by `\n\n`), `material`, `sizes`, `finishes` per Interfaces; delete `longDescription` and `styleWith`.

Both denim IDs: `description` (Appendix B, 3 paragraphs), `material`; delete `longDescription` and `styleWith`.

- [ ] **Step 4: Update the stale catalog test**

In `tests/shop-editorial.test.js` test `catalog has exact 27 garments…`, replace the `Westworld`, `S/S24 Dress`, and `images[0]` expectations with:

```js
  assert.equal(products.find(product => product.id === 'westworld-button-up').name, 'Fletcher Shirt 001');
  assert.equal(products.find(product => product.id === 'ss24-dress').name, 'Manuta Dress 001');
  assert.match(products.find(product => product.id === 'phyllite-jacket').images[0], /IMG_2297\.jpg$/);
```

Keep the count, availability, and bomber image assertions only if they still hold; correct any that reflect the 2026-09-01 approved images.

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add js/products-data.js tests/product-data.test.js tests/shop-editorial.test.js
git commit -m "feat(catalog): client names, copy, construction dates and Phyllite finishes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Finish-aware cart

**Files:**
- Modify: `js/cart.js`, `js/checkout.js` (payload only), `js/main.js` (cart drawer line rendering, if it prints size)
- Test: `tests/cart-finish.test.js` (create)

**Interfaces:**
- Consumes: `product.finishes` from Task 4.
- Produces: cart item `{ id, name, size, finish: string, price, quantity, image }`; `lineKey = `${id}|${size}|${finish}``; `cartService.addLine({ productId, size, finish, … })`; `getFinishLabel(product, finishId) -> string` (global).

- [ ] **Step 1: Write the failing test**

Create `tests/cart-finish.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
function loadCart(initial) {
  const store = new Map(initial ? [['lorimer-cart', JSON.stringify(initial)]] : []);
  const context = vm.createContext({
    module: { exports: {} },
    localStorage: {
      getItem: key => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: key => store.delete(key),
    },
  });
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/products-data.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/cart.js'), 'utf8'), context);
  // Top-level const bindings are not context properties; expose the ones tests use.
  context.cartService = vm.runInContext('cartService', context);
  return context;
}

test('same size in two finishes stays as two priced lines', async () => {
  const ctx = loadCart();
  await ctx.cartService.addLine({ productId: 'phyllite-jacket', size: 'Size 1.5', finish: 'wax' });
  await ctx.cartService.addLine({ productId: 'phyllite-jacket', size: 'Size 1.5', finish: 'fabric-paint' });
  const cart = ctx.getCart();
  assert.equal(cart.length, 2);
  assert.deepEqual(cart.map(i => [i.finish, i.price]), [['wax', 70], ['fabric-paint', 80]]);
  const state = await ctx.cartService.getCart();
  assert.deepEqual(state.lines.map(l => l.lineKey), ['phyllite-jacket|Size 1.5|wax', 'phyllite-jacket|Size 1.5|fabric-paint']);
});

test('unknown finish is refused', async () => {
  const ctx = loadCart();
  const result = await ctx.cartService.addLine({ productId: 'phyllite-jacket', size: 'Size 1', finish: 'gold' });
  assert.equal(result.ok, false);
  assert.equal(ctx.getCart().length, 0);
});

test('a pre-release Phyllite line without finish becomes wax; denim keeps no finish', () => {
  const ctx = loadCart([
    { id: 'phyllite-jacket', size: 'Size 1', quantity: 1 },
    { id: 'lorimer-selvedge-denim', size: '30×30', quantity: 2 },
  ]);
  const cart = ctx.getCart();
  assert.deepEqual(cart.map(i => [i.id, i.finish, i.price, i.quantity]), [
    ['phyllite-jacket', 'wax', 70, 1],
    ['lorimer-selvedge-denim', '', 80, 2],
  ]);
});

test('remove and update address a single finish line', async () => {
  const ctx = loadCart();
  await ctx.cartService.addLine({ productId: 'phyllite-jacket', size: 'Size 2', finish: 'wax' });
  await ctx.cartService.addLine({ productId: 'phyllite-jacket', size: 'Size 2', finish: 'fabric-paint' });
  await ctx.cartService.updateLineQuantity('phyllite-jacket|Size 2|fabric-paint', 3);
  await ctx.cartService.removeLine('phyllite-jacket|Size 2|wax');
  assert.deepEqual(ctx.getCart().map(i => [i.finish, i.quantity]), [['fabric-paint', 3]]);
});
```

If `js/cart.js` references DOM globals at load time and the test throws, add the minimal stubs the error names (e.g. `document: { addEventListener() {} }`) to the context in `loadCart`.

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/cart-finish.test.js`
Expected: FAIL (lines merge or `finish` undefined).

- [ ] **Step 3: Implement in `js/cart.js`**

Add after `isSizeAvailable`:

```js
const CART_FINISH_MAX = 32;

function getProductFinishes(product) {
  return Array.isArray(product?.finishes) ? product.finishes : [];
}

function resolveFinish(product, rawFinish) {
  const finishes = getProductFinishes(product);
  if (finishes.length === 0) return { ok: true, id: '', price: product.price };
  const id = normalizeText(rawFinish, CART_FINISH_MAX) || finishes[0].id;
  const match = finishes.find(entry => entry.id === id);
  return match ? { ok: true, id: match.id, price: match.price } : { ok: false };
}

function getFinishLabel(product, finishId) {
  return getProductFinishes(product).find(entry => entry.id === finishId)?.label || '';
}

function cartLineKey(item) {
  return `${item.id}|${item.size}|${item.finish || ''}`;
}
```

Then:
- `normalizeCart`: after `isSizeAvailable`, `const finish = resolveFinish(product, raw.finish); if (!finish.ok) return;`, use `finish.price` for `price`, ``const key = `${id}|${size}|${finish.id}`;`` and include `finish: finish.id` in the pushed item. A missing finish resolves to the first finish (`wax`), which covers the Review Focus legacy cart.
- `cartService.addLine`: an explicit unknown finish must be refused, so resolve with `const finish = resolveFinish(product, line?.finish); if (!finish.ok || (line?.finish && finish.id !== line.finish)) return failedCartResult('invalid-line');`. Use `Math.round(finish.price * 100)` for `amountMinor`. Match existing lines on `id`, `size`, and `finish`. Stock check: sum quantities of all lines with the same `id` and `size` plus 1. Push `finish: finish.id`.
- `getCartState`: `lineKey: cartLineKey(item)`, add `finish: item.finish`, `finishLabel: getFinishLabel(getCanonicalProduct(item.id), item.finish)`.
- `updateLineQuantity` and `removeLine`: compare `cartLineKey(entry) === lineKey`.
- Legacy helpers `addToCart`, `removeFromCart`, `updateQuantity`: match on `finish` as well (`i.finish === (finish || '')`), adding an optional trailing `finish` parameter.

In `js/checkout.js`, change the payload map to `cart.map(item => ({ id: item.id, size: item.size, finish: item.finish || '', quantity: item.quantity }))`.

Wherever the cart drawer (`js/main.js`) or checkout summary prints `Size: …`, print `Size ${size}` followed by ` · ${toTitleCase(finishLabel)}` when a finish label exists (e.g. `Size 1.5 · Fabric Paint`). Define `toTitleCase` locally in each file with the same body as Task 3.

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/cart.js js/checkout.js js/main.js tests/cart-finish.test.js
git commit -m "feat(cart): keep Phyllite finishes as separate priced lines

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Database finish prices, migration, API, admin

**Files:**
- Create: `scripts/migrate-2026-10.js`
- Modify: `db/schema.sql`, `scripts/seed.js`, `api/products.js`, `js/products-remote.js`, `api/admin/products.js`, `js/admin.js`
- Test: `tests/migration-2026-10.test.js` (create), additions to `tests/backend-integration.test.js`

**Interfaces:**
- Produces: `migrate(sql) -> Promise<void>` exported from `scripts/migrate-2026-10.js`, where `sql` is a tagged-template function returning a Promise of rows. Script runs `migrate(getDb())` only when invoked directly (`require.main === module`).
- Produces: `/api/products` items gain `finish_prices: { [finishId]: euros } | null`.
- Produces: admin `PUT /api/admin/products` accepts optional `finish_prices: { [finishId]: positive integer cents }`.

- [ ] **Step 1: Write the failing migration test**

Create `tests/migration-2026-10.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { migrate } = require('../scripts/migrate-2026-10.js');

function recordingSql() {
  const calls = [];
  const sql = (strings, ...values) => {
    calls.push({ text: strings.join('?').replace(/\s+/g, ' ').trim(), values });
    return Promise.resolve([]);
  };
  return { sql, calls };
}

test('migration is additive and never overwrites stock', async () => {
  const { sql, calls } = recordingSql();
  await migrate(sql);
  const text = calls.map(c => c.text).join('\n');
  assert.match(text, /alter table products add column if not exists finish_prices jsonb/);
  assert.match(text, /insert into inventory \(product_id, size, stock\) values \(\?, \?, 0\) on conflict \(product_id, size\) do nothing/);
  assert.doesNotMatch(text, /update inventory/);
  assert.doesNotMatch(text, /delete /);
  const sizes = calls.filter(c => /insert into inventory/.test(c.text)).map(c => c.values[1]);
  assert.deepEqual(sizes, ['Size 1.5', 'Size 2.5']);
});

test('migration writes finish prices in cents and the new copy', async () => {
  const { sql, calls } = recordingSql();
  await migrate(sql);
  const phyllite = calls.find(c => /update products set/.test(c.text) && c.values.includes('phyllite-jacket'));
  assert.ok(phyllite);
  assert.ok(phyllite.values.includes(JSON.stringify({ wax: 7000, 'fabric-paint': 8000 })));
  const denimUpdates = calls.filter(c => /update products set/.test(c.text) && c.values.some(v => String(v).startsWith('lorimer-selvedge-denim')));
  assert.equal(denimUpdates.length, 2);
});

test('running twice issues the same idempotent statements', async () => {
  const a = recordingSql();
  const b = recordingSql();
  await migrate(a.sql);
  await migrate(b.sql);
  assert.deepEqual(a.calls.map(c => c.text), b.calls.map(c => c.text));
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/migration-2026-10.test.js`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `scripts/migrate-2026-10.js`**

```js
/* migrate-2026-10.js — October 2026 client feedback round.
   Additive and idempotent. Run only with explicit approval:
   DATABASE_URL=… node scripts/migrate-2026-10.js */
const PRODUCTS = require('../js/products-data.js');

const LIVE_IDS = ['phyllite-jacket', 'lorimer-selvedge-denim', 'lorimer-selvedge-denim-black'];
const NEW_PHYLLITE_SIZES = ['Size 1.5', 'Size 2.5'];

function finishPricesCents(product) {
  if (!Array.isArray(product.finishes)) return null;
  return Object.fromEntries(product.finishes.map(f => [f.id, Math.round(f.price * 100)]));
}

async function migrate(sql) {
  await sql`alter table products add column if not exists finish_prices jsonb`;

  for (const id of LIVE_IDS) {
    const product = PRODUCTS.find(p => p.id === id);
    const prices = finishPricesCents(product);
    await sql`
      update products set
        description = ${product.description},
        images = ${JSON.stringify(product.images)}::jsonb,
        price_cents = ${Math.round(product.price * 100)},
        finish_prices = ${prices ? JSON.stringify(prices) : null}::jsonb,
        updated_at = now()
      where id = ${id}
    `;
  }

  for (const size of NEW_PHYLLITE_SIZES) {
    await sql`insert into inventory (product_id, size, stock) values (${'phyllite-jacket'}, ${size}, 0) on conflict (product_id, size) do nothing`;
  }
}

module.exports = { migrate };

if (require.main === module) {
  const { getDb } = require('../api/_lib/db');
  migrate(getDb())
    .then(() => { console.log('migrate-2026-10: done'); })
    .catch(error => { console.error(error); process.exitCode = 1; });
}
```

Note the phyllite update's `values` must contain the exact string `JSON.stringify({ wax: 7000, 'fabric-paint': 8000 })`; the key order follows `product.finishes`, which Task 4 fixed as wax then fabric-paint.

- [ ] **Step 4: Schema, seed, public API, remote overrides**

`db/schema.sql`: inside `create table if not exists products`, add `finish_prices jsonb,` after `images`, plus at file end `alter table products add column if not exists finish_prices jsonb;`.

`scripts/seed.js`: update the three seeded products to the new descriptions (import from `js/products-data.js` instead of duplicating: `description: PRODUCTS_DATA.find(p => p.id === id).description`), Phyllite `images: ['./assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_2297.jpg']`, Phyllite `sizes` with four values, and include `finish_prices` in the insert column list as `${product.finish_prices ? JSON.stringify(product.finish_prices) : null}::jsonb` with Phyllite `finish_prices: { wax: 7000, 'fabric-paint': 8000 }`.

`api/products.js`: select `finish_prices`; in the payload add

```js
      finish_prices: override?.finish_prices
        ? Object.fromEntries(Object.entries(override.finish_prices).map(([key, cents]) => [key, cents / 100]))
        : null,
```

`js/products-remote.js` `applyOverrides`, after the price line:

```js
      if (override.finish_prices && typeof override.finish_prices === 'object' && Array.isArray(product.finishes)) {
        product.finishes.forEach(function (finish) {
          var price = override.finish_prices[finish.id];
          if (typeof price === 'number' && price > 0) finish.price = price;
        });
        if (product.finishes[0]) product.price = product.finishes[0].price;
      }
```

- [ ] **Step 5: Admin finish prices**

`api/admin/products.js`: GET selects `finish_prices`. PUT reads `finish_prices` from the body; valid when `undefined`, `null`, or a plain object whose values are all positive integers and whose keys are all in the structural product's finish IDs (`require('../../js/products-data.js')`). Invalid → `400 { error: 'invalid finish prices' }`. Update statement adds `finish_prices = ${finish_prices ? JSON.stringify(finish_prices) : null}::jsonb` only when the field was provided; otherwise leave the column untouched (use two update statements to keep the tagged template simple).

`js/admin.js` `renderProducts`: when `product.finish_prices` is an object, render one input per key after the price field:

```js
        ${product.finish_prices ? Object.entries(product.finish_prices).map(([key, cents]) => `
        <label>${escapeHtml(key === 'fabric-paint' ? 'Fabric Paint price (EUR)' : key === 'wax' ? 'Wax price (EUR)' : key)}<input name="finish:${escapeAttr(key)}" type="number" step="0.01" min="0.01" value="${(cents / 100).toFixed(2)}"></label>`).join('') : ''}
```

and in the submit handler build `payload.finish_prices` from every `finish:*` field as `Math.round(parseFloat(value) * 100)` when any exist.

- [ ] **Step 6: Source-level tests**

Append to `tests/backend-integration.test.js`:

```js
test('public products expose finish prices in euros and the storefront applies them', () => {
  const api = fs.readFileSync(path.join(__dirname, '..', 'api/products.js'), 'utf8');
  const remote = fs.readFileSync(path.join(__dirname, '..', 'js/products-remote.js'), 'utf8');
  assert.match(api, /finish_prices/);
  assert.match(api, /cents \/ 100/);
  assert.match(remote, /override\.finish_prices/);
});

test('admin validates finish prices against known finishes', () => {
  const admin = fs.readFileSync(path.join(__dirname, '..', 'api/admin/products.js'), 'utf8');
  assert.match(admin, /invalid finish prices/);
  assert.match(admin, /Number\.isInteger/);
});
```

(Use whatever `read` helper the file already defines instead of `fs.readFileSync` if one exists.)

- [ ] **Step 7: Run tests**

Run: `npm test`
Expected: PASS. Do **not** run the migration script.

- [ ] **Step 8: Commit**

```bash
git add scripts/migrate-2026-10.js db/schema.sql scripts/seed.js api/products.js js/products-remote.js api/admin/products.js js/admin.js tests/
git commit -m "feat(db): editable per-finish prices and additive October migration

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Option buttons and product detail pages

Invoke `frontend-design`, `emil-design-eng`, and `better-typography` before editing CSS; the values below are already decided, so the skills are a check, not a redesign.

**Files:**
- Modify: `product-detail.html`, `js/product.js`, `css/styles.css`
- Test: `tests/product-detail-feedback.test.js` (create); update `tests/product-detail-scroll.test.js` and `tests/storefront-security.test.js` assertions that reference `.size-btn`, `.finish-btn`, `Inquiry`, or `style-with`

**Interfaces:**
- Consumes: `product.finishes`, `constructedOn`, `madeIn`, `getFinishLabel` (Task 5), `cartService.addLine({ …, finish })`.
- Produces: `createOptionGroup({ container, name, options: Array<{ value, label, disabled? }>, selected, onChange }) -> { getValue(): string }` in `js/product.js`; `selectedFinishFromUrl(product, search) -> string`.

- [ ] **Step 1: Write the failing tests**

Create `tests/product-detail-feedback.test.js`:

```js
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
```

If `js/product.js` touches the DOM at load time beyond `document.addEventListener`, extend the stub with exactly what the error names.

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/product-detail-feedback.test.js`
Expected: FAIL.

- [ ] **Step 3: Tokens and option-button CSS**

In `:root` add:

```css
  --gray-text: #6b6b73;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
```

Delete the `.size-btn` and `.finish-btn` rule blocks (including `:hover`, `.selected`, `:focus-visible` variants, and the `.finish-grid` rule) and add:

```css
/* ── Option buttons: size, finish, colour, region, 1 of 1 ───── */
.option-group { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.option-btn {
  min-height: 44px;
  min-width: 72px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--gray);
  background: var(--white);
  color: var(--black);
  font-family: var(--font-title);
  font-size: 11px;
  letter-spacing: .04em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease, transform 120ms var(--ease-out);
}
.option-btn:active { transform: scale(.97); }
.option-btn[aria-checked="true"] { background: var(--black); color: var(--white); border-color: var(--black); }
.option-btn:disabled { color: var(--gray-text); text-decoration: line-through; cursor: not-allowed; }
.option-btn:focus-visible { outline: 2px solid var(--black); outline-offset: 3px; }
.option-btn--static { cursor: default; }
.option-btn--static:active { transform: none; }
@media (hover: hover) and (pointer: fine) {
  .option-btn:hover:not(:disabled):not([aria-checked="true"]) { border-color: var(--black); }
}
@media (prefers-reduced-motion: reduce) {
  .option-btn { transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease; }
  .option-btn:active { transform: none; }
}
.option-group__guide { margin-left: 6px; color: var(--black); font-family: var(--font-title); font-size: 11px; letter-spacing: .04em; text-transform: uppercase; text-decoration: underline; text-underline-offset: 3px; }
```

- [ ] **Step 4: Typography and sold-out layout CSS**

Replace the `.product-info__name` and `.product-info__price` blocks with:

```css
.product-info__name {
  font-family: var(--font-title);
  font-weight: 700;
  font-size: clamp(18px, 1.5vw, 22px);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.2;
  text-wrap: balance;
}
.product-info__price {
  position: relative;
  display: inline-grid;
  font-family: var(--font-title);
  font-size: 17px;
  letter-spacing: 0.02em;
  margin-top: 12px;
  font-variant-numeric: tabular-nums;
}
.product-info__price > span { grid-area: 1 / 1; transition: opacity 200ms var(--ease-out), filter 200ms var(--ease-out); }
.product-info__price > span.is-leaving { opacity: 0; filter: blur(2px); }
.product-info__price > span.is-entering { opacity: 0; filter: blur(2px); }
@media (prefers-reduced-motion: reduce) {
  .product-info__price > span { transition: opacity 200ms ease; filter: none !important; }
}
.product-info--archive { display: flex; flex-direction: column; min-height: calc(100svh - var(--nav-h)); }
.product-info--archive .product-info__section { padding-top: 32px; }
.product-info__note {
  margin-top: 10px;
  text-align: right;
  font-family: var(--font-serif);
  font-size: 11px;
  color: var(--gray-text);
}
.product-info__made-in { margin-top: auto; padding-top: 32px; }
.product-info--archive .product-info__back { align-self: flex-start; margin-top: 24px; }
```

- [ ] **Step 5: Markup changes in `product-detail.html`**

- `#product-price` gets `aria-live="polite"`.
- The finish section label becomes `<p class="product-info__label" id="finish-label">Select Finish</p>` and its grid container becomes `<div class="option-group" id="finish-grid" role="radiogroup" aria-labelledby="finish-label"></div>`.
- The size grid becomes `<div class="option-group" id="size-grid" role="radiogroup" aria-labelledby="size-label"></div>` with its label `id="size-label"`; move the existing size-guide trigger inside `#size-section` directly after `#size-grid` with class `option-group__guide`.
- Delete the whole `#style-with-section` block.
- Add, after the size section: `<div class="product-info__section" id="one-of-one-section" hidden><span class="option-btn option-btn--static" id="product-one-of-one">1 of 1</span></div>`.
- After `#add-to-cart` add `<p class="product-info__note" id="product-constructed" hidden></p>`.
- After `#product-material` add `<p class="product-info__note product-info__made-in" id="product-made-in" hidden></p>`.

- [ ] **Step 6: `js/product.js`**

Add the shared component and URL helper:

```js
function selectedFinishFromUrl(product, search) {
  const finishes = Array.isArray(product?.finishes) ? product.finishes : [];
  if (finishes.length === 0) return '';
  const requested = new URLSearchParams(search).get('finish');
  return finishes.some(f => f.id === requested) ? requested : finishes[0].id;
}

function createOptionGroup({ container, options, selected, onChange }) {
  let value = selected || '';
  container.replaceChildren();
  container.setAttribute('role', 'radiogroup');
  const buttons = options.map(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-btn';
    button.setAttribute('role', 'radio');
    button.dataset.value = option.value;
    button.textContent = option.label;
    button.disabled = !!option.disabled;
    if (option.disabled) button.setAttribute('aria-label', `${option.label}, sold out`);
    button.addEventListener('click', () => select(option.value, true));
    container.appendChild(button);
    return button;
  });

  function sync() {
    const enabled = buttons.filter(b => !b.disabled);
    const focusTarget = buttons.find(b => b.dataset.value === value && !b.disabled) || enabled[0];
    buttons.forEach(button => {
      const checked = button.dataset.value === value;
      button.setAttribute('aria-checked', String(checked));
      button.tabIndex = button === focusTarget ? 0 : -1;
    });
  }

  function select(next, notify) {
    value = next;
    sync();
    if (notify) onChange?.(value);
  }

  container.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
    const enabled = buttons.filter(b => !b.disabled);
    if (enabled.length === 0) return;
    event.preventDefault();
    const current = Math.max(0, enabled.indexOf(document.activeElement));
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const next = enabled[(current + step + enabled.length) % enabled.length];
    next.focus();
    select(next.dataset.value, true);
  });

  sync();
  return { getValue: () => value };
}
```

Replace `renderFinishes` and `renderSizes` with:

```js
let finishGroup = null;
let sizeGroup = null;

function renderFinishes(product, initialFinish) {
  const section = document.getElementById('finish-section');
  const grid = document.getElementById('finish-grid');
  if (!section || !grid) return;
  const finishes = Array.isArray(product.finishes) ? product.finishes : [];
  section.hidden = finishes.length === 0 || !!product.notForSale;
  if (section.hidden) return;
  finishGroup = createOptionGroup({
    container: grid,
    options: finishes.map(f => ({ value: f.id, label: f.label })),
    selected: initialFinish,
    onChange: finishId => {
      const finish = finishes.find(f => f.id === finishId);
      setPrice(`€${finish.price}`);
    },
  });
}

function renderSizes(product) {
  const grid = document.getElementById('size-grid');
  if (!grid) return;
  sizeGroup = createOptionGroup({
    container: grid,
    options: product.sizes.map(size => ({
      value: size,
      label: size,
      disabled: !product.available || (product.stockBySize && !(product.stockBySize?.[size] > 0)),
    })),
    selected: '',
    onChange: () => document.getElementById('size-error')?.classList.remove('visible'),
  });
}

function setPrice(text) {
  const el = document.getElementById('product-price');
  if (!el) return;
  const current = el.querySelector('span:not(.is-leaving)');
  if (current && current.textContent === text) return;
  const next = document.createElement('span');
  next.textContent = text;
  if (!current) {
    el.replaceChildren(next);
    return;
  }
  next.classList.add('is-entering');
  current.classList.add('is-leaving');
  el.append(next);
  requestAnimationFrame(() => next.classList.remove('is-entering'));
  current.addEventListener('transitionend', () => current.remove(), { once: true });
  setTimeout(() => current.remove(), 260);
}
```

In `loadProduct`:
- Compute `const initialFinish = selectedFinishFromUrl(product, window.location.search);` and `const finish = (product.finishes || []).find(f => f.id === initialFinish);`.
- `priceText` = `'Sold Out'` when `notForSale` or not available, else `` `€${finish ? finish.price : product.price}` ``; call `setPrice(priceText)` instead of setting `textContent`; set the mobile price the same way via `textContent`.
- Meta line: `product.material ? 'Material: ' + product.material : ''` only (drop `origin` and `1 of 1`).
- For `notForSale`: hide `#size-section`; show `#one-of-one-section`; add class `product-info--archive` to `.product-info`; when `product.constructedOn` set `#product-constructed` text to `` `Date of Construction: ${product.constructedOn}.` `` and unhide; when `product.madeIn` set `#product-made-in` to `` `Made in ${product.madeIn}` `` and unhide.
- Call `renderFinishes(product, initialFinish)`; delete `renderStyleWith` and its call; delete `renderLongDescription`'s use of `longDescription` and instead split: `product.description.split(/\n{2,}/).map(s => s.trim()).filter(Boolean)` into `<p>` elements.

In `initAddToCart`:
- Replace the `notForSale` branch with: `btn.textContent = 'Sold Out'; btn.disabled = true; btn.setAttribute('aria-disabled', 'true'); return;` (keep the label span if the button uses `.btn-add-cart__label`: set that span's text instead).
- Selection: `const size = sizeGroup?.getValue(); if (!size) { …show error…; return; }`.
- Pass `size` and `finish: finishGroup ? finishGroup.getValue() : ''` to `cartService.addLine`, and `unitPrice` from the selected finish price when present.

- [ ] **Step 7: Update stale assertions**

Update `tests/product-detail-scroll.test.js` and `tests/storefront-security.test.js` so selectors match `.option-btn` / `#size-grid [role="radio"]`, sold-out pages expect `Sold Out` (not `Inquiry`), and no test expects `style-with`.

- [ ] **Step 8: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add product-detail.html js/product.js css/styles.css tests/
git commit -m "feat(product): option-button groups, finish pricing and sold-out archive layout

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Shop layout and filtered views

Invoke `frontend-design` and `responsive-design` before editing CSS.

**Files:**
- Modify: `js/shop.js`, `shop.html`, `css/styles.css`
- Test: `tests/shop-filters.test.js` (create); update `tests/shop-editorial.test.js` filter assertions

**Interfaces:**
- Consumes: `PRODUCTS`, `SHOP_ROWS`, finishes from Task 4.
- Produces: `buildFilterLayout(products, filter) -> { featured: Array<{ product, finishId? }>, rest: Product[] }` (pure, global in `js/shop.js`). `featured` is empty when `filter` is not one of `Bottoms`, `Denim`, `Tops`, `Jackets`.

- [ ] **Step 1: Write the failing test**

Create `tests/shop-filters.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

function load() {
  const context = vm.createContext({ module: { exports: {} } });
  vm.runInContext(read('js/products-data.js'), context);
  vm.runInContext(read('js/shop.js'), context);
  // Top-level const bindings are not context properties; expose PRODUCTS for the tests.
  context.PRODUCTS = vm.runInContext('PRODUCTS', context);
  return context;
}

test('Bottoms and Denim lead with both denim colourways', () => {
  const ctx = load();
  ['Bottoms', 'Denim'].forEach(filter => {
    const layout = ctx.buildFilterLayout(ctx.PRODUCTS, filter);
    assert.deepEqual(layout.featured.map(f => f.product.id), ['lorimer-selvedge-denim', 'lorimer-selvedge-denim-black'], filter);
    assert.ok(!layout.rest.some(p => p.id.startsWith('lorimer-selvedge-denim')), filter);
    assert.ok(layout.rest.length > 0, filter);
  });
});

test('Tops and Jackets lead with the two Phyllite finishes', () => {
  const ctx = load();
  ['Tops', 'Jackets'].forEach(filter => {
    const layout = ctx.buildFilterLayout(ctx.PRODUCTS, filter);
    assert.deepEqual(layout.featured.map(f => [f.product.id, f.finishId]), [['phyllite-jacket', 'wax'], ['phyllite-jacket', 'fabric-paint']], filter);
    assert.ok(!layout.rest.some(p => p.id === 'phyllite-jacket'), filter);
  });
});

test('other filters have no featured row and keep catalogue order', () => {
  const ctx = load();
  assert.deepEqual(ctx.buildFilterLayout(ctx.PRODUCTS, 'Accessories').rest.map(p => p.id), ['distressed-lorimer-cap']);
  assert.deepEqual(ctx.buildFilterLayout(ctx.PRODUCTS, 'Shirts').featured, []);
  assert.equal(ctx.buildFilterLayout(ctx.PRODUCTS, 'Shirts').rest.length, 3);
  assert.deepEqual(ctx.buildFilterLayout(ctx.PRODUCTS, 'Dresses').rest.map(p => p.id).sort(), ['ss24-dress', 'trigall-dress']);
});

test('an empty filter returns nothing to render', () => {
  const ctx = load();
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.buildFilterLayout(ctx.PRODUCTS, 'Nothing'))), { featured: [], rest: [] });
});

test('shop chrome: mirrored centring grid, black prices, inset sidebar', () => {
  const css = read('css/styles.css');
  assert.match(css, /--shop-side:\s*clamp\(/);
  assert.match(css, /\.shop-layout\s*\{[^}]*grid-template-columns:\s*var\(--shop-side\) minmax\(0, 1fr\) var\(--shop-side\)/);
  assert.match(css, /\.product-card__price\s*\{[^}]*color:\s*var\(--black\)[^}]*font-size:\s*11px/);
  assert.match(css, /\.shop-filtered__track\s*\{[^}]*justify-content:\s*center/);
});
```

`shop.js` must not touch the DOM at load when `document` is undefined (it already guards with `typeof document !== 'undefined'`).

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/shop-filters.test.js`
Expected: FAIL, `buildFilterLayout is not a function`.

- [ ] **Step 3: Implement `buildFilterLayout` and the filtered renderer in `js/shop.js`**

```js
const FEATURED_BY_FILTER = {
  Bottoms: [{ id: 'lorimer-selvedge-denim' }, { id: 'lorimer-selvedge-denim-black' }],
  Denim: [{ id: 'lorimer-selvedge-denim' }, { id: 'lorimer-selvedge-denim-black' }],
  Tops: [{ id: 'phyllite-jacket', finishId: 'wax' }, { id: 'phyllite-jacket', finishId: 'fabric-paint' }],
  Jackets: [{ id: 'phyllite-jacket', finishId: 'wax' }, { id: 'phyllite-jacket', finishId: 'fabric-paint' }],
};

function catalogueOrder() {
  return SHOP_ROWS.filter(row => row.type === 'products').flatMap(row => row.products);
}

function buildFilterLayout(products, filter) {
  const byId = new Map(products.map(product => [product.id, product]));
  const matches = id => {
    const product = byId.get(id);
    return product && (product.category === filter || product.subcategory === filter);
  };
  const featured = (FEATURED_BY_FILTER[filter] || [])
    .filter(entry => matches(entry.id))
    .map(entry => ({ product: byId.get(entry.id), finishId: entry.finishId }));
  const featuredIds = new Set(featured.map(entry => entry.product.id));
  const rest = catalogueOrder().filter(id => matches(id) && !featuredIds.has(id)).map(id => byId.get(id));
  return { featured, rest };
}
```

Extend `createProductCard(product, eager, index, finishId)`: when `finishId` is set, link to `` `product-detail.html?id=${product.id}&finish=${finishId}` ``, show the finish price (`€${finish.price}`), add a second name line `<p class="product-card__finish">${toTitleCase(finish.label)}</p>`, and use `finish.image || product.images[0]` as the image. Define `toTitleCase` locally as in Task 3.

Add a filtered container. In `renderShop`, after the editorial rows, append `<div class="shop-filtered" id="shop-filtered" hidden></div>`. Rewrite `applyFilter`:
- `filter === 'All'` or `'S/S 24'`: keep current behaviour for rows; hide `#shop-filtered`; ensure `.shop-grid` does not carry `is-filtered`.
- Any other filter: hide every `.shop-row`; build `buildFilterLayout(PRODUCTS, filter)`; render into `#shop-filtered`:

```js
function renderFiltered(layout) {
  const container = document.getElementById('shop-filtered');
  container.replaceChildren();
  if (layout.featured.length) {
    const row = document.createElement('div');
    row.className = 'shop-row shop-row--two shop-filtered__featured';
    layout.featured.forEach((entry, index) => row.appendChild(createProductCard(entry.product, index === 0, index, entry.finishId)));
    container.appendChild(row);
  }
  if (layout.rest.length) {
    const track = document.createElement('div');
    track.className = 'shop-filtered__track';
    layout.rest.forEach((product, index) => track.appendChild(createProductCard(product, false, index)));
    container.appendChild(track);
  }
  container.hidden = false;
  animateFilteredCards(container);
  return layout.featured.length + layout.rest.length;
}

function animateFilteredCards(container) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  container.querySelectorAll('.product-card').forEach((card, index) => {
    card.classList.remove('reveal');
    if (typeof card.animate !== 'function') return;
    const keyframes = reduce
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }];
    card.animate(keyframes, {
      duration: 220,
      delay: Math.min(index, 5) * 40,
      easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
      fill: 'backwards',
    });
  });
}
```

Status text uses the returned count (`'No products found'` when 0). Delete the old `.shop-grid.is-filtered` code path in JS.

- [ ] **Step 4: CSS**

Replace `.shop-layout`, `.shop-sidebar`, `.shop-grid-wrap` desktop rules and the `.shop-grid.is-filtered*` rules with:

```css
.shop-layout {
  --shop-side: clamp(184px, 15vw, 248px);
  display: grid;
  grid-template-columns: var(--shop-side) minmax(0, 1fr) var(--shop-side);
  align-items: start;
}
.shop-sidebar {
  grid-column: 1;
  padding: 40px 24px 40px clamp(18px, 2.2vw, 36px);
  position: sticky;
  top: var(--nav-h);
  height: calc(100vh - var(--nav-h));
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.shop-grid-wrap { grid-column: 2; min-width: 0; padding: 40px 0; }
.shop-filtered { display: flex; flex-direction: column; gap: 96px; }
.shop-filtered[hidden] { display: none; }
.shop-filtered__featured {
  grid-template-columns: repeat(2, minmax(0, min(100%, 592px)));
  justify-content: center;
  gap: clamp(24px, 4vw, 64px);
}
.shop-filtered__track {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 96px 2px;
  width: min(100%, 990px);
  margin: 0 auto;
}
.shop-filtered__track .product-card { flex: 0 0 calc((100% - 4px) / 3); max-width: calc((100% - 4px) / 3); }
.product-card__finish {
  font-family: var(--font-title);
  font-size: 10px;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--gray-text);
}
```

The `padding-left` of the sidebar uses the navbar's gutter value (`clamp(18px, 2.2vw, 36px)`) so SHOP ALL lines up with the S/S24 nav item. The `1px` gap math relies on the existing three-up card width; keep it.

Change `.product-card__price` to `color: var(--black); font-size: 11px; font-variant-numeric: tabular-nums;` (split the shared rule with `.product-card__name` so the name keeps `10px`).

In the existing `@media (max-width: 768px)` block, add `.shop-layout { display: block; }`, `.shop-grid-wrap { padding: 40px 16px; }`, and `.shop-filtered__track .product-card { flex-basis: 100%; max-width: 100%; }`. Keep the existing mobile sidebar rules.

- [ ] **Step 5: Update stale shop assertions**

In `tests/shop-editorial.test.js`, replace assertions about `.shop-grid.is-filtered` / `display: contents` with assertions that `applyFilter` calls `buildFilterLayout`, and that `#shop-filtered` exists in rendered markup source (`/id = 'shop-filtered'|id="shop-filtered"/`).

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add js/shop.js shop.html css/styles.css tests/
git commit -m "feat(shop): centred catalogue axis and featured filter rows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Gallery edge controls

Invoke `animate` before editing.

**Files:**
- Modify: `js/ss24.js`, `css/styles.css`
- Test: `tests/gallery-controls.test.js` (create); update `tests/ss24-redesign.test.js` assertions about the counter and hover-only nav

**Interfaces:**
- Consumes: existing `initLookbookGallery(gallery)`.
- Produces: no counter element; `.lookbook-gallery__nav--prev` / `--next` remain buttons with `aria-label` `Previous image` / `Next image`.

- [ ] **Step 1: Write the failing test**

Create `tests/gallery-controls.test.js`:

```js
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
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/gallery-controls.test.js`
Expected: FAIL.

- [ ] **Step 3: JS**

In `initLookbookGallery`, delete the `counter` creation block and the line that sets `counter.textContent`. Leave dots, buttons, keyboard, and swipe handling unchanged.

- [ ] **Step 4: CSS**

Delete the `.lookbook-gallery__counter` block. Change `.lookbook-gallery__image` transition to `transition: opacity 240ms var(--ease-out);`. Replace the `.lookbook-gallery__nav` block, its `::after`, and any `:hover`/`--prev`/`--next` rules for it with:

```css
.lookbook-gallery__nav {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  cursor: pointer;
  transition: background-color 160ms var(--ease-out);
}
.lookbook-gallery__nav--prev { left: 0; background: linear-gradient(to right, rgba(0, 0, 0, .22), transparent); }
.lookbook-gallery__nav--next { right: 0; background: linear-gradient(to left, rgba(0, 0, 0, .22), transparent); }
.lookbook-gallery__nav::after {
  content: '';
  width: 11px;
  height: 11px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transition: transform 160ms var(--ease-out);
}
.lookbook-gallery__nav--next::after { transform: rotate(-45deg); }
.lookbook-gallery__nav--prev::after { transform: rotate(135deg); }
.lookbook-gallery__nav::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 160ms var(--ease-out);
}
.lookbook-gallery__nav--prev::before { background: linear-gradient(to right, rgba(0, 0, 0, .12), transparent); }
.lookbook-gallery__nav--next::before { background: linear-gradient(to left, rgba(0, 0, 0, .12), transparent); }
.lookbook-gallery__nav:active::after { transition-duration: 100ms; }
.lookbook-gallery__nav--next:active::after { transform: rotate(-45deg) scale(.94); }
.lookbook-gallery__nav--prev:active::after { transform: rotate(135deg) scale(.94); }
.lookbook-gallery__nav:focus-visible { outline: 2px solid #fff; outline-offset: -4px; }
@media (hover: hover) and (pointer: fine) {
  .lookbook-gallery__nav:hover::before { opacity: 1; }
  .lookbook-gallery__nav--next:hover::after { transform: translateX(3px) rotate(-45deg); }
  .lookbook-gallery__nav--prev:hover::after { transform: translateX(-3px) rotate(135deg); }
}
@media (max-width: 600px) {
  .lookbook-gallery__nav { width: 48px; }
}
@media (prefers-reduced-motion: reduce) {
  .lookbook-gallery__nav::after { transition: none; }
  .lookbook-gallery__nav--next:hover::after,
  .lookbook-gallery__nav--next:active::after { transform: rotate(-45deg); }
  .lookbook-gallery__nav--prev:hover::after,
  .lookbook-gallery__nav--prev:active::after { transform: rotate(135deg); }
}
```

The `::before` overlay raises the effective scrim from `.22` towards `.34` on hover without animating the gradient itself. Remove any older rule that sets the nav to `opacity: 0` or reveals it on `.lookbook-gallery:hover`. If the homepage `.look-gallery` has its own nav or counter rules, apply the same changes there.

- [ ] **Step 5: Update stale SS24 assertions**

In `tests/ss24-redesign.test.js`, replace assertions about the counter or hover-revealed nav with references to the new test file's expectations; keep keyboard, swipe, and alt-text assertions.

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add js/ss24.js css/styles.css tests/
git commit -m "feat(gallery): always-visible edge scrims and no image counter

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Homepage, SS24 Look 4, navigation, footer, cursor

**Files:**
- Modify: `index.html`, `ss24.html`, `shop.html`, `product-detail.html`, `checkout.html`, `about.html`, `admin.html` (only if it loads `cursor.js`), `css/styles.css`, `js/product.js` (magnifier cursor)
- Delete: `js/cursor.js`
- Create: `assets/ss24-reedit/Look 4/DSC_0384.jpg` (copy of `assets/ss24/reedit/DSC_0384.jpg`)
- Test: `tests/feedback-pages.test.js` (create); update `tests/homepage-redesign.test.js`, `tests/storefront-chrome.test.js`

- [ ] **Step 1: Confirm the slideshow order source**

Run: `git show feat/store-backend:index.html | grep -o 'data-gallery-images="[^"]*"' | tr '|' '\n'`
Expected: nine `assets/ss24/Group/*.JPG` paths, first `F10E840B…`, then `03B5025B…`, `45D39E80…`, `56AFFC6A…`, `68DD5925…`, `773069D2…`, `85D9BDA2…`, `A38B227D…`, `C629834E…`. If the order differs, stop and report it; the target order below assumes this one.

- [ ] **Step 2: Write the failing test**

Create `tests/feedback-pages.test.js`:

```js
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
```

- [ ] **Step 3: Run to verify failure**

Run: `node --test tests/feedback-pages.test.js`
Expected: FAIL.

- [ ] **Step 4: Implement**

1. `index.html` slideshow: set `data-gallery-images` to the seven `./assets/ss24/Group/…` paths in test order; set the initial `<img class="lookbook-gallery__image">` `src` to the first and alt to `Models walking the Lorimer Spring/Summer 2024 runway`.
2. `index.html` Phyllite cover `<img>`: `src="./assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_2297.jpg"`, alt `Model wearing the Lorimer Phyllite Jacket`.
3. `index.html` preview grid: reorder the six `preview-card` anchors to the test order. Replace the pinstripe card with `adjustable-button-trousers`, using that product's `images[0]` from `js/products-data.js`. Update each `preview-card__name` to the new names. Keep `reveal-delay-N` classes sequential.
4. `cp "assets/ss24/reedit/DSC_0384.jpg" "assets/ss24-reedit/Look 4/DSC_0384.jpg"`; in `ss24.html` replace `Facetune_16-05-2024-18-57-12.jpg` in Look 4's `data-gallery-images` with `DSC_0384.jpg`.
5. Every page in `PAGES`: `S/S_24` → `S/S24` (navbar and mobile menu); footer `<p>ABOUT</p>` → `<a href="about.html">ABOUT</a>`; remove `'js/cursor.js'` from `__LORIMER_SCRIPTS_AFTER__` (and any direct `<script src="js/cursor.js">`).
6. `git rm js/cursor.js`. In `css/styles.css` delete the custom-cursor block (`html.has-custom-cursor…`, `.custom-cursor…`, its media query) and the `.gallery-detail-cursor` rules; set `.gallery-image { cursor: zoom-in; }` and delete the `cursor: default` override in the coarse-pointer query if it only existed to undo `none`.
7. `js/product.js` `initImageMagnifier`: delete creation and positioning of `.gallery-detail-cursor`; keep the magnifier.
8. SS24 looks 1, 3, 5: inspect `.lookbook-look:not(.lookbook-look--reverse) .lookbook-look__copy` rules; set the "View in Products" link to align with the description's inline-start edge the same way the reverse looks do (same `justify-self`/`align-self` and padding as `.lookbook-look--reverse .lookbook-look__copy a`). Assert this in the test by adding:

```js
test('SS24 product links share one alignment rule across both orientations', () => {
  const css = read('css/styles.css');
  assert.match(css, /\.lookbook-look__copy > a\s*\{[^}]*justify-self:\s*start/);
  assert.doesNotMatch(css, /\.lookbook-look--reverse \.lookbook-look__copy > a\s*\{[^}]*justify-self/);
});
```

and implementing a single `.lookbook-look__copy > a { justify-self: start; }` rule, removing orientation-specific overrides of the link's alignment.

- [ ] **Step 5: Update stale assertions**

`tests/homepage-redesign.test.js`: replace the six-frame `reedit` slideshow expectation and the old preview order with references matching the new test. `tests/storefront-chrome.test.js`: navigation label `S/S24`; drop expectations for `cursor.js`.

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add index.html ss24.html shop.html product-detail.html checkout.html about.html css/styles.css js/product.js "assets/ss24-reedit/Look 4/DSC_0384.jpg" tests/
git rm --cached -q js/cursor.js 2>/dev/null || true
git commit -m "feat(pages): client slideshow and preview order, S/S24 label, native cursor

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Checkout region selector and layout

**Files:**
- Modify: `checkout.html`, `js/checkout.js`, `css/styles.css`
- Test: `tests/checkout-ui.test.js` (create); update `tests/commerce-integrity.test.js` (`id="checkout-shipping-region"` assertion) and `tests/storefront-security.test.js` checkout assertions

**Interfaces:**
- Consumes: global `SHIPPING_REGIONS` from `js/shipping-data.js` (Task 2), `createOptionGroup` is **not** shared (it lives in `js/product.js`); checkout builds native radio inputs instead.
- Produces: `#checkout-shipping-region` becomes a `<fieldset>` containing `input[type="radio"][name="shipping_region"]`; `getSelectedRegion() -> string` in `js/checkout.js`.

- [ ] **Step 1: Write the failing test**

Create `tests/checkout-ui.test.js`:

```js
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
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/checkout-ui.test.js`
Expected: FAIL.

- [ ] **Step 3: Markup**

In `checkout.html`, before `js/products-data.js` add `<script src="js/shipping-data.js?v=1"></script>`. Replace the `<label>`, `<select>`, and note inside `#checkout-form` with:

```html
          <h1 class="checkout-title">Checkout</h1>
          <fieldset class="checkout-regions" id="checkout-shipping-region">
            <legend class="checkout-label">Shipping destination</legend>
            <!-- Rendered by checkout.js from SHIPPING_REGIONS -->
          </fieldset>
          <button id="checkout-pay-btn" class="checkout-pay__button" type="button">Pay Now</button>
          <p class="checkout-note">Your Stripe delivery address must be within the selected region.</p>
          <p id="checkout-error" class="checkout-error" hidden></p>
```

- [ ] **Step 4: Script**

In `js/checkout.js`:

```js
function formatEuro(cents) {
  return `€${(cents / 100).toFixed(2)}`;
}

function getSelectedRegion() {
  return document.querySelector('input[name="shipping_region"]:checked')?.value || '';
}

function renderShippingRegions() {
  const fieldset = document.getElementById('checkout-shipping-region');
  if (!fieldset || typeof SHIPPING_REGIONS === 'undefined') return;
  SHIPPING_REGIONS.forEach(entry => {
    const label = document.createElement('label');
    label.className = 'checkout-region';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'shipping_region';
    input.value = entry.region;
    input.className = 'checkout-region__input';
    const name = createTextElement('span', 'checkout-region__name', entry.label);
    const price = createTextElement('span', 'checkout-region__price', formatEuro(entry.amount_cents));
    const delivery = createTextElement('span', 'checkout-region__delivery', entry.delivery);
    label.append(input, name, price, delivery);
    fieldset.append(label);
  });
}
```

- `wireShippingRegion`: call `renderShippingRegions()` first, then listen for `change` on the fieldset and call `renderOrderSummary`.
- Submit handler: replace `regionEl.value` checks with `getSelectedRegion()`; payload `shipping_region: getSelectedRegion()`.
- `renderOrderSummary`: replace `shippingByRegion` with

```js
  const region = getSelectedRegion();
  const entry = typeof SHIPPING_REGIONS !== 'undefined' ? SHIPPING_REGIONS.find(r => r.region === region) : null;
  const shippingCents = entry ? entry.amount_cents : 0;
```

and set shipping text to `entry ? formatEuro(shippingCents) : 'Select region'`, total to `formatEuro(Math.round(total * 100) + shippingCents)`, subtotal to `formatEuro(Math.round(total * 100))`. Apply the price crossfade from Task 7 by giving `#summary-shipping` and `#summary-total` the same `<span>` swap: copy `setPrice`'s body into a local `swapText(el, text)` here (checkout does not load `js/product.js`).

- [ ] **Step 5: CSS**

```css
.checkout-form { max-width: 440px; display: flex; flex-direction: column; gap: 40px; }
.checkout-title { font-family: var(--font-title); font-size: 20px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
.checkout-regions { border: 0; display: flex; flex-direction: column; gap: 10px; }
.checkout-label { margin-bottom: 14px; font-family: var(--font-title); font-size: 11px; letter-spacing: .04em; text-transform: uppercase; }
.checkout-region {
  position: relative;
  min-height: 56px;
  padding: 10px 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  column-gap: 16px;
  border: 1px solid var(--gray);
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease, color 150ms ease, transform 120ms var(--ease-out);
}
.checkout-region:active { transform: scale(.99); }
.checkout-region__input { position: absolute; opacity: 0; pointer-events: none; }
.checkout-region__name, .checkout-region__price { font-family: var(--font-title); font-size: 11px; letter-spacing: .04em; text-transform: uppercase; }
.checkout-region__price { font-variant-numeric: tabular-nums; }
.checkout-region__delivery { grid-column: 1 / -1; margin-top: 4px; font-family: var(--font-serif); font-size: 12px; color: var(--gray-text); }
.checkout-region:has(.checkout-region__input:checked) { background: var(--black); color: var(--white); border-color: var(--black); }
.checkout-region:has(.checkout-region__input:checked) .checkout-region__delivery { color: var(--gray); }
.checkout-region:has(.checkout-region__input:focus-visible) { outline: 2px solid var(--black); outline-offset: 3px; }
@media (hover: hover) and (pointer: fine) {
  .checkout-region:hover { border-color: var(--black); }
}
@media (prefers-reduced-motion: reduce) {
  .checkout-region:active { transform: none; }
}
.checkout-note { margin-top: -28px; font-family: var(--font-serif); font-size: 12px; color: var(--gray-text); }
```

Update the existing `.checkout-pay__button` rule to include `width: 100%; min-height: 48px;`.

- [ ] **Step 6: Update stale assertions**

`tests/commerce-integrity.test.js`: the `id="checkout-shipping-region"` assertion still holds (fieldset); change `shipping_region:` expectation if needed. `tests/storefront-security.test.js`: update any `<select>`-specific checkout assertions.

- [ ] **Step 7: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add checkout.html js/checkout.js css/styles.css tests/
git commit -m "feat(checkout): region cards from the shared rates table and calmer layout

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Verification and review pass

Main session owns this task.

- [ ] **Step 1: Full suite**

Run: `npm test`
Expected: 0 failures.

- [ ] **Step 2: Static serve and browser pass**

Run (background): `python3 -m http.server 8765` from the repo root. `/api/*` will 404 locally; the storefront must still render from `products-data.js`.

With Playwright, at 1440×900 and 390×844, capture and inspect: `index.html`, `ss24.html`, `shop.html` (All, Bottoms, Jackets, Shirts, Dresses, Accessories), `product-detail.html?id=phyllite-jacket&finish=fabric-paint`, `product-detail.html?id=phyllite-jacket&finish=gold`, `product-detail.html?id=deconstructed-bomber`, `checkout.html` with a seeded cart (WAX Size 1.5 and FABRIC PAINT Size 1.5). Check keyboard-only navigation of option groups and region radios, gallery arrow clicks on the homepage not navigating, and `prefers-reduced-motion: reduce` emulation.

- [ ] **Step 3: Skill reviews**

Run `/Users/adam/.claude/skills/impeccable/scripts/impeccable detect --json index.html ss24.html shop.html product-detail.html checkout.html css/styles.css`. Then apply `design-review`, `web-design-guidelines`, `accessibility`, and `review-animations` to the changed files. Fix all findings in one batch, re-run `npm test`, commit `fix: address design review findings`.

- [ ] **Step 4: Fresh verifier**

Dispatch a `verifier` agent (no `model` argument) with the spec path, this plan path, and the commit range, asking it to refute: server-side finish pricing, shipping amounts and GB routing, legacy cart migration, filter layouts, gallery controls, and sold-out page content.

- [ ] **Step 5: Report**

Report results, the commit list, and the three approvals still pending: run `scripts/migrate-2026-10.js` against Neon, Stripe test-mode checkout, push or deploy.
