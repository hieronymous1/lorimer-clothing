# Store Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship real Stripe checkout, per-size inventory tracking, and a password-protected admin panel (products, inventory, orders, site copy) for the two live LORIMER products (Phyllite Jacket, Lorimer Selvedge Denim).

**Architecture:** Vercel serverless functions under `/api` back onto Neon Postgres (products/inventory/content/order-notes) and Stripe (payment + order records). The existing static HTML/CSS/JS pages stay static; two small loader scripts (`products-remote.js`, `content-remote.js`) fetch DB-backed overrides at page load and patch the DOM/`PRODUCTS` array before the rest of the page's scripts run. A single `/admin` page (its own login) drives all CRUD through the `/api/admin/*` routes.

**Tech Stack:** Node.js (Vercel serverless functions, CommonJS), `stripe` SDK, `@neondatabase/serverless`, `@vercel/blob`, plain HTML/CSS/vanilla JS (no framework, matching the existing site), `node:test` for unit tests (matches existing `tests/*.test.js` convention).

**Spec:** `docs/superpowers/specs/2026-08-31-store-backend-design.md`

## Global Constraints

- Exactly two live products: `phyllite-jacket` ($70/€70) and the denim pair `lorimer-selvedge-denim` (Blue, €80) / `lorimer-selvedge-denim-black` (Black, €80). No other catalog id becomes purchasable in this plan.
- Currency is EUR only. No taxes, no discount codes, no multi-currency.
- Shipping is flat-rate by region: Finland €5.00, EU €12.00, Rest of world €25.00 (all in cents: 500 / 1200 / 2500).
- Admin auth is a single shared password (`ADMIN_PASSWORD` env var) plus an HMAC-signed session cookie (`SESSION_SECRET` env var) — no user table, no OAuth.
- Orders are never duplicated into Neon; `/api/admin/orders` always reads live from Stripe. Only fulfillment status/tracking notes are stored locally (keyed by Stripe Checkout Session id).
- Never trust client-submitted price or stock — every price and stock check is re-derived server-side from Neon before Stripe is touched.
- Required env vars (Vercel project settings, never committed): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`.

---

## File Structure

**New:**
- `package.json` — declares `stripe`, `@neondatabase/serverless`, `@vercel/blob`
- `db/schema.sql` — table DDL only (no seed data — see `scripts/seed.js`)
- `scripts/seed.js` — one-time seed script (products, inventory rows at stock 0, content keys)
- `api/_lib/db.js` — Neon client factory
- `api/_lib/session.js` — HMAC cookie sign/verify (pure logic, unit tested)
- `api/_lib/shipping.js` — shipping rate table + allowed countries (pure logic, unit tested)
- `api/products.js` — public GET, merges Neon overrides onto `js/products-data.js` structural fields
- `api/content.js` — public GET, flat key→value map
- `api/checkout.js` — POST, validates stock/price, creates a Stripe Checkout Session
- `api/stripe-webhook.js` — POST, verifies signature, idempotently decrements stock
- `api/admin/login.js` — POST (login) / DELETE (logout)
- `api/admin/products.js` — GET/PUT, admin-only
- `api/admin/inventory.js` — GET/PUT, admin-only
- `api/admin/content.js` — GET/PUT, admin-only
- `api/admin/orders.js` — GET (Stripe proxy) / PUT (fulfillment note), admin-only
- `api/admin/upload.js` — POST, admin-only, uploads to Vercel Blob
- `admin.html` — admin page shell (login form + 4 tabs)
- `js/admin.js` — admin panel logic
- `css/admin.css` — admin page styles
- `js/products-remote.js` — fetches `/api/products`, patches `PRODUCTS`, then loads the rest of each page's scripts
- `js/content-remote.js` — fetches `/api/content`, patches every `[data-cms-key]` element
- `tests/lib/session.test.js`, `tests/lib/shipping.test.js` — unit tests for the pure-logic modules
- `tests/backend-integration.test.js` — static-analysis tests (script tail ordering, `data-cms-key` presence) matching the existing `tests/*.test.js` style

**Modified:**
- `index.html`, `about.html`, `shop.html`, `product-detail.html`, `ss24.html`, `checkout.html` — script-tail restructure (see Task 12) + footer `data-cms-key` attributes (Task 13)
- `about.html` — wrap section bodies in `data-cms-key` containers (Task 13)
- `checkout.html` — replace the "coming soon" block with a real Pay button + success/canceled banners (Task 11)
- `js/checkout.js` — wire Pay button to `/api/checkout`, handle redirect state (Task 11)

---

### Task 1: Project scaffolding — package.json, schema, seed script

**Files:**
- Create: `package.json`
- Create: `db/schema.sql`
- Create: `api/_lib/db.js`
- Create: `scripts/seed.js`
- Test: manual (verified via `psql`/Neon console query in Step 6)

**Interfaces:**
- Produces: `getDb()` from `api/_lib/db.js` — returns a Neon tagged-template SQL client (`const sql = getDb(); await sql\`select 1\`;`). Every later task that touches Postgres imports this.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "lorimer-clothing",
  "private": true,
  "scripts": {
    "test": "node --test tests/ tests/lib/"
  },
  "dependencies": {
    "stripe": "^17.4.0",
    "@neondatabase/serverless": "^0.10.4",
    "@vercel/blob": "^0.27.1"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `cd "/Volumes/Neuromancer/02CLIENTS/Active/LORIMER WEB" && npm install`
Expected: `node_modules/` created, `package-lock.json` created, no errors.

- [ ] **Step 3: Create `db/schema.sql`**

```sql
create table if not exists products (
  id text primary key,
  name text not null,
  description text not null,
  price_cents integer not null,
  images jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists inventory (
  product_id text not null references products(id),
  size text not null,
  stock integer not null default 0,
  primary key (product_id, size)
);

create table if not exists content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists order_notes (
  session_id text primary key,
  fulfilled boolean not null default false,
  tracking text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists webhook_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);
```

- [ ] **Step 4: Create `api/_lib/db.js`**

```js
const { neon } = require('@neondatabase/serverless');

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  return neon(process.env.DATABASE_URL);
}

module.exports = { getDb };
```

- [ ] **Step 5: Apply the schema to Neon**

Run (with `DATABASE_URL` exported in the shell, from the Neon project's connection string):
`psql "$DATABASE_URL" -f db/schema.sql`
Expected: five `CREATE TABLE` confirmations, no errors.

- [ ] **Step 6: Create `scripts/seed.js`**

```js
const { getDb } = require('../api/_lib/db');

const PRODUCTS = [
  {
    id: 'phyllite-jacket',
    name: 'Phyllite Jacket',
    description: 'Classic denim jacket treated with a matte wax finish for a distinct texture and weather resistance. Fitted silhouette with raw hem.',
    price_cents: 7000,
    images: ['./assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_1748.jpg'],
    sizes: ['Size 1', 'Size 2'],
  },
  {
    id: 'lorimer-selvedge-denim',
    name: 'Lorimer Selvedge Denim — Blue',
    description: 'Lorimer selvedge denim cut with a clean, structured silhouette and considered finishing throughout. Waxed and fabric-painted by hand — each pair develops its own character with wear.',
    price_cents: 8000,
    images: ['./assets/photos/PRODUCTS/Lorimer Selvedge Denim - Photoshoot/IMG_2520.jpg'],
    sizes: ['30×30', '30×32', '32×30', '32×32', '32×34', '34×32', '34×34'],
  },
  {
    id: 'lorimer-selvedge-denim-black',
    name: 'Lorimer Selvedge Denim — Black',
    description: 'Lorimer selvedge denim in black — cut with a clean, structured silhouette and considered finishing throughout. Waxed and fabric-painted by hand, developing its own character with wear.',
    price_cents: 8000,
    images: ['./assets/photos/PRODUCTS/Lorimer Selvedge Denim Black - Photoshoot/IMG_3161.jpg'],
    sizes: ['30×30', '30×32', '32×30', '32×32', '32×34', '34×32', '34×34'],
  },
];

const CONTENT = {
  'footer.copyright': `© Lorimer 2026`,
  'footer.location': `Helsinki, 00750`,
  'about.brand': `<p>Founded in Helsinki, Finland, Lorimer is an independent fashion label centred on the relationship between garment, wearer and time. Through considered pattern cutting, purposeful construction and a disciplined approach to materials, the brand creates clothing shaped by form, proportion and silhouette, designed to feel instinctive to wear while remaining quietly distinctive.</p><p>Lorimer focuses on garments that evolve with use, softening over time and taking on character through movement, wear and everyday life. Each piece is intended to accompany its wearer beyond the first impression, developing in a way that is unique to the individual and shaped by the life it lives.</p><p>Responsibility is approached through permanence rather than excess. By producing in limited quantities, prioritising considered manufacturing and focusing on enduring design over disposable consumption.<br>The brand is built on the belief that thoughtful design should remain accessible. By maintaining a direct relationship with its customers, Lorimer aims to place lasting garments into the hands of those who will build a personal connection with them.</p>`,
  'about.terms': `<h3>Terms of Sale</h3><p>These Terms of Sale govern all purchases made through lorimerclothing.com. By placing an order with Lorimer, you confirm that you have read and accepted these Terms of Sale.<br>These Terms should be read together with our Deliveries &amp; Shipping, Payments, Returns &amp; Exchanges, Pricing, VAT &amp; Customs, and Privacy Policy pages, which form an integral part of these Terms.</p><h3>Orders</h3><p>All orders are subject to acceptance and product availability. Once an order has been placed, you will receive an order confirmation by email. Lorimer reserves the right to refuse or cancel an order in the event of pricing errors, inaccurate product information, suspected fraudulent activity, payment issues or product unavailability. If payment has already been received for a cancelled order, a full refund will be issued to the original payment method.</p><h3>Product Information</h3><p>We make every reasonable effort to ensure that product descriptions, measurements, colours and imagery are presented as accurately as possible. Due to differences in screen settings and individual devices, slight variations in colour and appearance may occur.<br>As every Lorimer garment is carefully produced, minor variations in texture, finish or construction should not be considered faults but part of the character of the product.</p><h3>Payments</h3><p>All payments are securely processed through trusted payment providers. Lorimer does not store or have access to your complete payment information.<br>Available payment methods may vary depending on your location and will be displayed during checkout.</p><h3>Shipping &amp; Delivery</h3><p>Orders are dispatched from Helsinki, Finland. Shipping methods, delivery estimates, pricing and customs information are outlined in our Deliveries &amp; Shipping and Pricing, VAT &amp; Customs sections below.<br>While every effort is made to dispatch orders within the stated timeframes, delivery dates are estimates and may be affected by courier services, customs authorities or circumstances beyond our reasonable control.</p><h3>Returns &amp; Refunds</h3><p>Returns are accepted in accordance with our Returns &amp; Exchanges policy.<br>Approved refunds will be issued to the original payment method after the returned item has been received and inspected. Refund processing times may vary depending on your payment provider.</p><h3>Governing Law</h3><p>These Terms of Sale are governed by and interpreted in accordance with the laws of Finland. Any disputes arising in connection with purchases made through Lorimer shall be subject to the applicable courts of Finland, without affecting any mandatory consumer rights available under applicable legislation.</p><p>If you have any questions regarding these Terms of Sale or your order, please contact us at <a href="mailto:contact@lorimer.com">contact@lorimer.com</a>.</p><h2>Website Terms of Use</h2><p>By accessing or using lorimer-clothing.com, you agree to comply with these Website Terms of Use.</p><h3>Intellectual Property</h3><p>All content available on this website, including but not limited to photographs, graphics, logos, artwork, text, product designs, garment designs, layouts and other visual material, is the intellectual property of Lorimer unless otherwise stated.<br>No content from this website may be copied, reproduced, distributed, published, modified or used for commercial purposes without the prior written permission of Lorimer.</p><h3>Acceptable Use</h3><p>You agree not to use this website in any manner that is unlawful, fraudulent or intended to interfere with its operation. Any attempt to gain unauthorised access to the website, its servers or associated systems is strictly prohibited.</p><h3>Website Availability</h3><p>Lorimer aims to ensure that this website remains available and functions reliably at all times. However, temporary interruptions may occasionally occur due to maintenance, technical issues or circumstances beyond our control.<br>Lorimer reserves the right to update, modify or discontinue any part of the website, its content or its services without prior notice.</p><h3>Limitation of Liability</h3><p>To the fullest extent permitted by applicable law, Lorimer shall not be liable for any indirect or consequential losses arising from the use of this website. Nothing within these Terms limits or excludes any rights that cannot legally be excluded under applicable consumer protection legislation.</p><p>If you have any questions regarding these Website Terms of Use, please contact us at <a href="mailto:contact@lorimer.com">contact@lorimer.com</a>.</p>`,
  'about.delivery': `<p>Every Lorimer order is carefully prepared and dispatched from our studio in Helsinki, Finland using Posti, Finland's national postal service. All shipments include tracking, allowing you to follow your order from dispatch to delivery.<br>Orders are typically dispatched within 1–3 business days. During collection launches or busy periods, dispatch times may be slightly longer.</p><h3>Finland</h3><p>Shipping: €7.90<br>Estimated delivery: 1–3 business days</p><h3>European Union</h3><p>Shipping: €14.90<br>Estimated delivery: 3–7 business days<br>All orders shipped within the European Union are delivered without additional customs duties or import charges.</p><h3>United Kingdom</h3><p>Shipping: €19.90<br>Estimated delivery: 4–8 business days<br>Orders shipped to the United Kingdom may be subject to import duties, VAT or customs handling fees determined by local customs authorities. These charges, where applicable, are the responsibility of the customer.</p><h3>Worldwide</h3><p>Shipping: €24.90<br>Estimated delivery: 5–14 business days<br>International orders shipped outside the European Union may be subject to import duties, taxes or customs charges determined by the destination country. Any applicable fees remain the responsibility of the customer.</p><p>Please note that delivery times are estimates and may vary depending on the destination, customs processing and local postal services.</p><h3>Local Collection &amp; Fittings</h3><p>Customers located in or visiting Helsinki are welcome to enquire about arranging a private fitting or collection by appointment.<br>If you are interested in experiencing Lorimer in person, please contact us and we will be happy to discuss available appointments.</p>`,
  'about.payments': `<p>We accept all major credit and debit cards, together with a selection of trusted local and digital payment methods, including Apple Pay, Google Pay, PayPal, Klarna and MobilePay where available.<br>All payments are processed securely through certified payment providers using encrypted connections. Lorimer does not store or have access to your full payment card details at any stage of the transaction.<br>Available payment methods may vary depending on your location, currency and device. The payment options available for your order will be displayed during checkout.<br>Orders are processed once payment has been successfully authorised. If a payment cannot be completed or is declined by your payment provider, the order will not be confirmed and no products will be reserved until successful payment has been received.</p>`,
  'about.pricing': `<h3>Finland &amp; European Union</h3><p>All orders shipped within Finland and the European Union include applicable VAT.<br>Your order will be delivered with no additional customs duties or import charges, allowing you to complete your purchase with confidence, knowing the price shown at checkout is the final price you will pay.</p><h3>United Kingdom</h3><p>Orders shipped to the United Kingdom may be subject to import duties, VAT and customs handling fees determined by UK customs authorities.<br>These charges are not included in your order total and, where applicable, are the responsibility of the customer. As customs regulations may change over time, we recommend checking your local import requirements before placing an order.</p><h3>Worldwide</h3><p>Orders shipped outside the European Union may be subject to import duties, taxes, customs fees or other charges imposed by the destination country.<br>These charges are determined by local customs authorities and are outside of Lorimer's control. Where applicable, any additional duties or taxes are the responsibility of the customer.<br>If you're unsure about possible import charges in your country, please don't hesitate to contact us before placing your order. We'll always do our best to provide guidance and ensure you have the information you need before your purchase.</p>`,
  'about.returns': `<p>We hope every Lorimer garment becomes a lasting part of your wardrobe. If you wish to return an item, you may request a return within 14 days of receiving your order.<br>All returns must be registered through the Lorimer Returns &amp; Exchanges Portal before the item is sent back. Returns received without an approved return request may not be accepted.<br>To qualify for a return, the item must be returned in its original condition. Garments must be unworn, unwashed, unaltered and free from stains, odours, damage or any signs of use beyond what is necessary to inspect the product. All original tags, garment packaging and accompanying materials must be included.<br>Returned items remain the customer's responsibility until they have been safely delivered to Lorimer. We strongly recommend using a tracked shipping service, as Lorimer cannot accept responsibility for items lost or damaged during return transit.<br>Unless the item is faulty or incorrectly supplied, return shipping costs are the responsibility of the customer.<br>Once your return has been received and inspected, any approved refund will be issued to the original payment method. Refunds are processed within 14 days of receiving the returned item. The time required for the funds to appear in your account may vary depending on your payment provider.</p>`,
};

async function seed() {
  const sql = getDb();

  for (const product of PRODUCTS) {
    await sql`
      insert into products (id, name, description, price_cents, images)
      values (${product.id}, ${product.name}, ${product.description}, ${product.price_cents}, ${JSON.stringify(product.images)}::jsonb)
      on conflict (id) do nothing
    `;
    for (const size of product.sizes) {
      await sql`
        insert into inventory (product_id, size, stock)
        values (${product.id}, ${size}, 0)
        on conflict (product_id, size) do nothing
      `;
    }
  }

  for (const [key, value] of Object.entries(CONTENT)) {
    await sql`
      insert into content (key, value) values (${key}, ${value})
      on conflict (key) do nothing
    `;
  }

  console.log('Seed complete.');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 7: Run the seed script**

Run: `DATABASE_URL="$DATABASE_URL" node scripts/seed.js`
Expected: `Seed complete.` printed, no errors.

- [ ] **Step 8: Verify seed data**

Run: `psql "$DATABASE_URL" -c "select id, name, price_cents from products;" -c "select product_id, count(*) from inventory group by product_id;" -c "select key from content order by key;"`
Expected: 3 product rows (2 denim + jacket), inventory counts `phyllite-jacket` → 2, `lorimer-selvedge-denim` → 7, `lorimer-selvedge-denim-black` → 7, and 8 content keys (`footer.copyright`, `footer.location`, `about.brand`, `about.terms`, `about.delivery`, `about.payments`, `about.pricing`, `about.returns`).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json db/schema.sql api/_lib/db.js scripts/seed.js
git commit -m "feat(backend): add Neon schema, seed script, and db client"
```

---

### Task 2: Admin session cookies (`api/_lib/session.js`)

**Files:**
- Create: `api/_lib/session.js`
- Test: `tests/lib/session.test.js`

**Interfaces:**
- Consumes: nothing (pure Node `crypto`).
- Produces: `sign(payload, secret)`, `verify(token, secret)`, `createSessionCookie(secret)`, `clearSessionCookie()`, `parseCookies(header)`, `isAuthenticated(req, secret)`, `COOKIE_NAME`. Every `/api/admin/*` handler imports `isAuthenticated`; `api/admin/login.js` imports `createSessionCookie`/`clearSessionCookie`.

- [ ] **Step 1: Write the failing tests**

Create `tests/lib/session.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { sign, verify, parseCookies, createSessionCookie, clearSessionCookie, COOKIE_NAME } = require('../../api/_lib/session');

test('sign/verify round-trips a payload with a valid signature', () => {
  const token = sign({ role: 'admin', exp: Date.now() + 10_000 }, 'secret');
  const payload = verify(token, 'secret');
  assert.equal(payload.role, 'admin');
});

test('verify rejects a token signed with a different secret', () => {
  const token = sign({ role: 'admin', exp: Date.now() + 10_000 }, 'secret-a');
  assert.equal(verify(token, 'secret-b'), null);
});

test('verify rejects an expired token', () => {
  const token = sign({ role: 'admin', exp: Date.now() - 1 }, 'secret');
  assert.equal(verify(token, 'secret'), null);
});

test('verify rejects a malformed token', () => {
  assert.equal(verify('not-a-token', 'secret'), null);
  assert.equal(verify(undefined, 'secret'), null);
});

test('parseCookies splits a Cookie header into a key/value map', () => {
  const cookies = parseCookies(`${COOKIE_NAME}=abc; other=xyz`);
  assert.equal(cookies[COOKIE_NAME], 'abc');
  assert.equal(cookies.other, 'xyz');
});

test('createSessionCookie produces a cookie whose token verify() accepts', () => {
  const cookieHeader = createSessionCookie('secret');
  const token = cookieHeader.split(';')[0].split('=')[1];
  assert.notEqual(verify(token, 'secret'), null);
  assert.match(cookieHeader, /HttpOnly/);
  assert.match(cookieHeader, /SameSite=Strict/);
});

test('clearSessionCookie sets Max-Age=0', () => {
  assert.match(clearSessionCookie(), /Max-Age=0/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/lib/session.test.js`
Expected: FAIL — `Cannot find module '../../api/_lib/session'`

- [ ] **Step 3: Implement `api/_lib/session.js`**

```js
const crypto = require('node:crypto');

const COOKIE_NAME = 'lorimer_admin';
const MAX_AGE_MS = 1000 * 60 * 60 * 12;

function sign(payload, secret) {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const hmac = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${hmac}`;
}

function verify(token, secret) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [encoded, hmac] = token.split('.');
  if (!encoded || !hmac) return null;

  const expected = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  const a = Buffer.from(hmac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
  return payload;
}

function createSessionCookie(secret) {
  const token = sign({ role: 'admin', exp: Date.now() + MAX_AGE_MS }, secret);
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${Math.floor(MAX_AGE_MS / 1000)}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach(part => {
    const index = part.indexOf('=');
    if (index === -1) return;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  });
  return out;
}

function isAuthenticated(req, secret) {
  const cookies = parseCookies(req.headers.cookie);
  return verify(cookies[COOKIE_NAME], secret) !== null;
}

module.exports = { sign, verify, createSessionCookie, clearSessionCookie, parseCookies, isAuthenticated, COOKIE_NAME };
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/lib/session.test.js`
Expected: PASS, 7/7 tests.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/session.js tests/lib/session.test.js
git commit -m "feat(backend): add HMAC-signed admin session cookies"
```

---

### Task 3: Shipping rates (`api/_lib/shipping.js`)

**Files:**
- Create: `api/_lib/shipping.js`
- Test: `tests/lib/shipping.test.js`

**Interfaces:**
- Produces: `ALLOWED_COUNTRIES` (string[]), `SHIPPING_OPTIONS` (array of `{ region, label, amount_cents }`), `buildStripeShippingOptions()` → Stripe `shipping_options` array. `api/checkout.js` imports `ALLOWED_COUNTRIES` and `buildStripeShippingOptions`.

- [ ] **Step 1: Write the failing test**

Create `tests/lib/shipping.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { ALLOWED_COUNTRIES, SHIPPING_OPTIONS, buildStripeShippingOptions } = require('../../api/_lib/shipping');

test('includes Finland and covers all three regions', () => {
  assert.ok(ALLOWED_COUNTRIES.includes('FI'));
  assert.equal(SHIPPING_OPTIONS.length, 3);
});

test('flat rates match the approved figures (in cents)', () => {
  const byRegion = Object.fromEntries(SHIPPING_OPTIONS.map(o => [o.region, o.amount_cents]));
  assert.equal(byRegion.FI, 500);
  assert.equal(byRegion.EU, 1200);
  assert.equal(byRegion.ROW, 2500);
});

test('buildStripeShippingOptions returns Stripe-shaped fixed_amount rates in EUR', () => {
  const options = buildStripeShippingOptions();
  assert.equal(options.length, 3);
  options.forEach(option => {
    assert.equal(option.shipping_rate_data.type, 'fixed_amount');
    assert.equal(option.shipping_rate_data.fixed_amount.currency, 'eur');
    assert.equal(typeof option.shipping_rate_data.fixed_amount.amount, 'number');
    assert.equal(typeof option.shipping_rate_data.display_name, 'string');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/lib/shipping.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `api/_lib/shipping.js`**

```js
const FINLAND = 'FI';

const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
];

const REST_OF_WORLD_COUNTRIES = [
  'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE',
  'GB', 'CH', 'NO', 'IS', 'AL', 'RS', 'ME', 'MK', 'BA', 'MD', 'UA',
  'AU', 'NZ', 'JP', 'KR', 'CN', 'HK', 'TW', 'SG', 'MY', 'TH', 'VN', 'PH', 'ID', 'IN',
  'AE', 'SA', 'IL', 'TR', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB',
  'ZA', 'EG', 'MA', 'NG', 'KE', 'GH',
];

const ALLOWED_COUNTRIES = [FINLAND, ...EU_COUNTRIES, ...REST_OF_WORLD_COUNTRIES];

const SHIPPING_OPTIONS = [
  { region: 'FI', label: 'Finland', amount_cents: 500 },
  { region: 'EU', label: 'European Union', amount_cents: 1200 },
  { region: 'ROW', label: 'Rest of world', amount_cents: 2500 },
];

function buildStripeShippingOptions() {
  return SHIPPING_OPTIONS.map(option => ({
    shipping_rate_data: {
      type: 'fixed_amount',
      fixed_amount: { amount: option.amount_cents, currency: 'eur' },
      display_name: option.label,
    },
  }));
}

module.exports = { FINLAND, EU_COUNTRIES, REST_OF_WORLD_COUNTRIES, ALLOWED_COUNTRIES, SHIPPING_OPTIONS, buildStripeShippingOptions };
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/lib/shipping.test.js`
Expected: PASS, 3/3.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/shipping.js tests/lib/shipping.test.js
git commit -m "feat(backend): add flat-rate shipping table (FI/EU/ROW)"
```

---

### Task 4: Public read APIs — `api/products.js`, `api/content.js`

**Files:**
- Create: `api/products.js`
- Create: `api/content.js`
- Test: manual (via `vercel dev`, Step 4/5 below — these handlers need a live Neon connection, so they are verified by running the dev server rather than mocked unit tests, consistent with the spec's testing section)

**Interfaces:**
- Consumes: `getDb()` (Task 1), `js/products-data.js`'s `module.exports = PRODUCTS` (already present).
- Produces: `GET /api/products` → `[{ id, name, description, price, images, sizes }]` for the 3 live catalog ids. `GET /api/content` → `{ [key]: value }`. `js/products-remote.js` (Task 12) and `js/content-remote.js` (Task 13) consume these shapes.

- [ ] **Step 1: Implement `api/products.js`**

```js
const { getDb } = require('./_lib/db');
const PRODUCTS = require('../js/products-data.js');

const LIVE_IDS = ['phyllite-jacket', 'lorimer-selvedge-denim', 'lorimer-selvedge-denim-black'];

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const sql = getDb();
  const rows = await sql`select id, name, description, price_cents, images from products`;
  const byId = new Map(rows.map(row => [row.id, row]));

  const payload = LIVE_IDS.map(id => {
    const structural = PRODUCTS.find(p => p.id === id);
    const override = byId.get(id);
    return {
      id,
      name: override?.name ?? structural.name,
      description: override?.description ?? structural.description,
      price: override ? override.price_cents / 100 : structural.price,
      images: override?.images?.length ? override.images : structural.images,
      sizes: structural.sizes,
    };
  });

  res.status(200).json(payload);
};
```

- [ ] **Step 2: Implement `api/content.js`**

```js
const { getDb } = require('./_lib/db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  const sql = getDb();
  const rows = await sql`select key, value from content`;
  const map = {};
  rows.forEach(row => { map[row.key] = row.value; });
  res.status(200).json(map);
};
```

- [ ] **Step 3: Install the Vercel CLI locally if not already present**

Run: `npm ls -g vercel || npm install -g vercel`
Expected: `vercel` command available.

- [ ] **Step 4: Run the dev server and verify `/api/products`**

Run: `vercel dev --listen 3000` (leave running; `vercel link` first if prompted, selecting the existing `lorimer-clothing` project), then in another terminal:
`curl -s http://localhost:3000/api/products | node -e "const d=JSON.parse(require('fs').readFileSync(0));console.log(d.length, d.map(p=>p.id))"`
Expected: `3 [ 'phyllite-jacket', 'lorimer-selvedge-denim', 'lorimer-selvedge-denim-black' ]`

- [ ] **Step 5: Verify `/api/content`**

Run: `curl -s http://localhost:3000/api/content | node -e "const d=JSON.parse(require('fs').readFileSync(0));console.log(Object.keys(d).sort())"`
Expected: `[ 'about.brand', 'about.delivery', 'about.payments', 'about.pricing', 'about.returns', 'about.terms', 'footer.copyright', 'footer.location' ]`

- [ ] **Step 6: Commit**

```bash
git add api/products.js api/content.js
git commit -m "feat(backend): add public products/content read APIs"
```

---

### Task 5: Checkout API — `api/checkout.js`

**Files:**
- Create: `api/checkout.js`
- Test: manual (`vercel dev` + `curl`, Steps 3–5)

**Interfaces:**
- Consumes: `getDb()` (Task 1), `ALLOWED_COUNTRIES`/`buildStripeShippingOptions()` (Task 3), `js/products-data.js`.
- Produces: `POST /api/checkout` with body `{ cart: [{ id, size, quantity }] }` → `200 { url }` (Stripe Checkout URL) or `400`/`409 { error }`. `js/checkout.js` (Task 11) is the consumer.

- [ ] **Step 1: Implement `api/checkout.js`**

```js
const Stripe = require('stripe');
const { getDb } = require('./_lib/db');
const { buildStripeShippingOptions, ALLOWED_COUNTRIES } = require('./_lib/shipping');
const PRODUCTS = require('../js/products-data.js');

const LIVE_IDS = ['phyllite-jacket', 'lorimer-selvedge-denim', 'lorimer-selvedge-denim-black'];

function getStructuralProduct(id) {
  return LIVE_IDS.includes(id) ? PRODUCTS.find(p => p.id === id) : null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const cart = Array.isArray(req.body?.cart) ? req.body.cart : [];
  if (cart.length === 0) {
    res.status(400).json({ error: 'cart is empty' });
    return;
  }

  const sql = getDb();
  const productRows = await sql`select id, name, price_cents from products`;
  const productsById = new Map(productRows.map(row => [row.id, row]));

  const lines = [];
  for (const item of cart) {
    const id = typeof item?.id === 'string' ? item.id : '';
    const size = typeof item?.size === 'string' ? item.size : '';
    const quantity = Number.isInteger(item?.quantity) ? item.quantity : 0;

    const structural = getStructuralProduct(id);
    const dbProduct = productsById.get(id);
    if (!structural || !dbProduct || quantity < 1 || !structural.sizes.includes(size)) {
      res.status(400).json({ error: `invalid line item for ${id || 'unknown product'}` });
      return;
    }

    const [stockRow] = await sql`select stock from inventory where product_id = ${id} and size = ${size}`;
    if (!stockRow || stockRow.stock < quantity) {
      res.status(409).json({ error: `${dbProduct.name} in size ${size} is out of stock`, id, size });
      return;
    }

    lines.push({
      quantity,
      price_data: {
        currency: 'eur',
        unit_amount: dbProduct.price_cents,
        product_data: {
          name: `${dbProduct.name} — ${size}`,
          metadata: { product_id: id, size },
        },
      },
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.origin || `https://${req.headers.host}`;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lines,
    shipping_address_collection: { allowed_countries: ALLOWED_COUNTRIES },
    shipping_options: buildStripeShippingOptions(),
    success_url: `${origin}/checkout.html?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout.html?canceled=1`,
  });

  res.status(200).json({ url: session.url });
};
```

- [ ] **Step 2: Restart `vercel dev`** (Ctrl-C the running instance from Task 4, then `vercel dev --listen 3000` again) so the new route is picked up.

- [ ] **Step 3: Verify the empty-cart rejection**

Run: `curl -s -X POST http://localhost:3000/api/checkout -H "Content-Type: application/json" -d '{"cart":[]}'`
Expected: `{"error":"cart is empty"}`

- [ ] **Step 4: Verify the out-of-stock rejection** (seed data starts every size at 0 stock)

Run: `curl -s -X POST http://localhost:3000/api/checkout -H "Content-Type: application/json" -d '{"cart":[{"id":"phyllite-jacket","size":"Size 1","quantity":1}]}'`
Expected: `{"error":"Phyllite Jacket in size Size 1 is out of stock","id":"phyllite-jacket","size":"Size 1"}`

- [ ] **Step 5: Set stock to 5 and verify a session is created**

Run: `psql "$DATABASE_URL" -c "update inventory set stock = 5 where product_id = 'phyllite-jacket' and size = 'Size 1';"`, then:
`curl -s -X POST http://localhost:3000/api/checkout -H "Content-Type: application/json" -d '{"cart":[{"id":"phyllite-jacket","size":"Size 1","quantity":1}]}'`
Expected: `{"url":"https://checkout.stripe.com/..."}` (test-mode URL, since `STRIPE_SECRET_KEY` in local `.env`/`vercel env pull` should be the test key).

- [ ] **Step 6: Commit**

```bash
git add api/checkout.js
git commit -m "feat(backend): add checkout API with server-side stock/price validation"
```

---

### Task 6: Stripe webhook — `api/stripe-webhook.js`

**Files:**
- Create: `api/stripe-webhook.js`
- Test: manual (Stripe CLI `trigger`, Steps 3–5)

**Interfaces:**
- Consumes: `getDb()` (Task 1). Reads `metadata.product_id` / `metadata.size` set on each line item's `price_data.product_data.metadata` in `api/checkout.js` (Task 5) — the two files must stay in sync on this metadata shape.
- Produces: idempotent stock decrement on `checkout.session.completed`.

- [ ] **Step 1: Implement `api/stripe-webhook.js`**

```js
const Stripe = require('stripe');
const { getDb } = require('./_lib/db');

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers['stripe-signature'];
  const rawBody = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).json({ error: `signature verification failed: ${err.message}` });
    return;
  }

  const sql = getDb();
  const claimed = await sql`
    insert into webhook_events (event_id) values (${event.id})
    on conflict (event_id) do nothing
    returning event_id
  `;
  if (claimed.length === 0) {
    res.status(200).json({ ok: true, duplicate: true });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const stripeForExpand = new Stripe(process.env.STRIPE_SECRET_KEY);
    const fullSession = await stripeForExpand.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data.price.product'],
    });

    for (const item of fullSession.line_items?.data || []) {
      const metadata = item.price?.product?.metadata || {};
      const productId = metadata.product_id;
      const size = metadata.size;
      if (!productId || !size) continue;

      await sql`
        update inventory set stock = greatest(stock - ${item.quantity}, 0)
        where product_id = ${productId} and size = ${size}
      `;
    }
  }

  res.status(200).json({ ok: true });
}

handler.config = { api: { bodyParser: false } };
module.exports = handler;
```

- [ ] **Step 2: Forward Stripe webhooks to the local dev server** (in a third terminal, with `vercel dev` still running)

Run: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
Expected: prints a `whsec_...` value — export it as `STRIPE_WEBHOOK_SECRET` in the `vercel dev` terminal's environment (or `vercel env add STRIPE_WEBHOOK_SECRET development` then restart `vercel dev`) so signature verification succeeds locally.

- [ ] **Step 3: Set known stock and trigger a synthetic completed-checkout event**

Run: `psql "$DATABASE_URL" -c "update inventory set stock = 5 where product_id = 'phyllite-jacket' and size = 'Size 1';"`, then:
`stripe trigger checkout.session.completed`
Expected: `stripe listen` terminal shows a `200` response from `/api/stripe-webhook`.

- [ ] **Step 4: Confirm idempotency by re-delivering the same event**

Run: `stripe events resend <event_id printed by the previous trigger>`
Expected: second delivery also returns `200`, and `psql "$DATABASE_URL" -c "select event_id from webhook_events;"` shows the event only once (not duplicated), proving the `on conflict do nothing returning` claim prevented a second stock decrement.

Note: `stripe trigger` fabricates a session whose line items won't match real products, so this step only proves idempotency/signature handling, not a real stock decrement — Task 15's end-to-end pass covers the real decrement path with an actual Checkout Session id.

- [ ] **Step 5: Commit**

```bash
git add api/stripe-webhook.js
git commit -m "feat(backend): add idempotent Stripe webhook for inventory decrement"
```

---

### Task 7: Admin login — `api/admin/login.js`

**Files:**
- Create: `api/admin/login.js`
- Test: manual (`vercel dev` + `curl`, Steps 2–4)

**Interfaces:**
- Consumes: `createSessionCookie`, `clearSessionCookie` (Task 2).
- Produces: `POST /api/admin/login` (body `{ password }`) → `200` + `Set-Cookie` or `401`. `DELETE /api/admin/login` → `200` + cleared cookie. `js/admin.js` (Task 11... actually Task 8 covers the frontend) is the consumer.

- [ ] **Step 1: Implement `api/admin/login.js`**

```js
const { createSessionCookie, clearSessionCookie } = require('../_lib/session');

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    const { password } = req.body || {};
    if (typeof password !== 'string' || password !== process.env.ADMIN_PASSWORD) {
      res.status(401).json({ error: 'invalid password' });
      return;
    }
    res.setHeader('Set-Cookie', createSessionCookie(process.env.SESSION_SECRET));
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearSessionCookie());
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
```

- [ ] **Step 2: Restart `vercel dev`, verify wrong password is rejected**

Run: `curl -si -X POST http://localhost:3000/api/admin/login -H "Content-Type: application/json" -d '{"password":"wrong"}'`
Expected: `HTTP/1.1 401`, body `{"error":"invalid password"}`.

- [ ] **Step 3: Verify correct password sets a cookie**

Run: `curl -si -X POST http://localhost:3000/api/admin/login -H "Content-Type: application/json" -d "{\"password\":\"$ADMIN_PASSWORD\"}"`
Expected: `HTTP/1.1 200`, a `Set-Cookie: lorimer_admin=...; HttpOnly; ...` header present.

- [ ] **Step 4: Verify logout clears the cookie**

Run: `curl -si -X DELETE http://localhost:3000/api/admin/login`
Expected: `HTTP/1.1 200`, `Set-Cookie: lorimer_admin=; ...Max-Age=0`.

- [ ] **Step 5: Commit**

```bash
git add api/admin/login.js
git commit -m "feat(backend): add admin login/logout endpoint"
```

---

### Task 8: Admin products & inventory CRUD

**Files:**
- Create: `api/admin/products.js`
- Create: `api/admin/inventory.js`
- Test: manual (`vercel dev` + `curl`, Steps 3–6)

**Interfaces:**
- Consumes: `getDb()` (Task 1), `isAuthenticated()` (Task 2).
- Produces: `GET/PUT /api/admin/products` (`PUT` body `{ id, name, description, price_cents, images }`), `GET/PUT /api/admin/inventory` (`PUT` body `{ product_id, size, stock }`). `js/admin.js` (Task 10) is the consumer.

- [ ] **Step 1: Implement `api/admin/products.js`**

```js
const { getDb } = require('../_lib/db');
const { isAuthenticated } = require('../_lib/session');

module.exports = async function handler(req, res) {
  if (!isAuthenticated(req, process.env.SESSION_SECRET)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const sql = getDb();

  if (req.method === 'GET') {
    const rows = await sql`select id, name, description, price_cents, images from products order by id`;
    res.status(200).json(rows);
    return;
  }

  if (req.method === 'PUT') {
    const { id, name, description, price_cents, images } = req.body || {};
    if (
      typeof id !== 'string' || typeof name !== 'string' || typeof description !== 'string' ||
      !Number.isInteger(price_cents) || price_cents < 0 || !Array.isArray(images)
    ) {
      res.status(400).json({ error: 'invalid product payload' });
      return;
    }
    await sql`
      update products
      set name = ${name}, description = ${description}, price_cents = ${price_cents},
          images = ${JSON.stringify(images)}::jsonb, updated_at = now()
      where id = ${id}
    `;
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
```

- [ ] **Step 2: Implement `api/admin/inventory.js`**

```js
const { getDb } = require('../_lib/db');
const { isAuthenticated } = require('../_lib/session');

module.exports = async function handler(req, res) {
  if (!isAuthenticated(req, process.env.SESSION_SECRET)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const sql = getDb();

  if (req.method === 'GET') {
    const rows = await sql`select product_id, size, stock from inventory order by product_id, size`;
    res.status(200).json(rows);
    return;
  }

  if (req.method === 'PUT') {
    const { product_id, size, stock } = req.body || {};
    if (typeof product_id !== 'string' || typeof size !== 'string' || !Number.isInteger(stock) || stock < 0) {
      res.status(400).json({ error: 'invalid inventory payload' });
      return;
    }
    await sql`update inventory set stock = ${stock} where product_id = ${product_id} and size = ${size}`;
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
```

- [ ] **Step 3: Restart `vercel dev`, verify unauthenticated access is rejected**

Run: `curl -si http://localhost:3000/api/admin/products`
Expected: `HTTP/1.1 401`

- [ ] **Step 4: Log in and capture the cookie, then verify authenticated GET**

Run: `curl -s -c /tmp/lorimer-admin-cookie.txt -X POST http://localhost:3000/api/admin/login -H "Content-Type: application/json" -d "{\"password\":\"$ADMIN_PASSWORD\"}" > /dev/null && curl -s -b /tmp/lorimer-admin-cookie.txt http://localhost:3000/api/admin/products`
Expected: JSON array of 3 products.

- [ ] **Step 5: Verify a product PUT persists**

Run: `curl -s -b /tmp/lorimer-admin-cookie.txt -X PUT http://localhost:3000/api/admin/products -H "Content-Type: application/json" -d '{"id":"phyllite-jacket","name":"Phyllite Jacket","description":"Updated description.","price_cents":7500,"images":["./assets/photos/PRODUCTS/Phyllite Jacket - Photoshoot/IMG_1748.jpg"]}'` then `curl -s http://localhost:3000/api/products | node -e "const d=JSON.parse(require('fs').readFileSync(0));console.log(d.find(p=>p.id==='phyllite-jacket').price)"`
Expected: PUT returns `{"ok":true}`; public API now shows `75`.

- [ ] **Step 6: Verify an inventory PUT persists**

Run: `curl -s -b /tmp/lorimer-admin-cookie.txt -X PUT http://localhost:3000/api/admin/inventory -H "Content-Type: application/json" -d '{"product_id":"phyllite-jacket","size":"Size 1","stock":10}'` then `psql "$DATABASE_URL" -c "select stock from inventory where product_id='phyllite-jacket' and size='Size 1';"`
Expected: PUT returns `{"ok":true}`; `stock` is `10`.

- [ ] **Step 7: Commit**

```bash
git add api/admin/products.js api/admin/inventory.js
git commit -m "feat(backend): add admin products/inventory CRUD endpoints"
```

---

### Task 9: Admin content & orders

**Files:**
- Create: `api/admin/content.js`
- Create: `api/admin/orders.js`
- Test: manual (`vercel dev` + `curl`, Steps 3–5)

**Interfaces:**
- Consumes: `getDb()`, `isAuthenticated()`.
- Produces: `GET/PUT /api/admin/content` (`PUT` body `{ key, value }`); `GET/PUT /api/admin/orders` (`GET` → live Stripe orders merged with local notes; `PUT` body `{ session_id, fulfilled, tracking }`).

- [ ] **Step 1: Implement `api/admin/content.js`**

```js
const { getDb } = require('../_lib/db');
const { isAuthenticated } = require('../_lib/session');

module.exports = async function handler(req, res) {
  if (!isAuthenticated(req, process.env.SESSION_SECRET)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const sql = getDb();

  if (req.method === 'GET') {
    const rows = await sql`select key, value from content order by key`;
    res.status(200).json(rows);
    return;
  }

  if (req.method === 'PUT') {
    const { key, value } = req.body || {};
    if (typeof key !== 'string' || typeof value !== 'string') {
      res.status(400).json({ error: 'invalid content payload' });
      return;
    }
    await sql`
      insert into content (key, value, updated_at) values (${key}, ${value}, now())
      on conflict (key) do update set value = excluded.value, updated_at = now()
    `;
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
```

- [ ] **Step 2: Implement `api/admin/orders.js`**

```js
const Stripe = require('stripe');
const { getDb } = require('../_lib/db');
const { isAuthenticated } = require('../_lib/session');

module.exports = async function handler(req, res) {
  if (!isAuthenticated(req, process.env.SESSION_SECRET)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const sql = getDb();

  if (req.method === 'GET') {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sessions = await stripe.checkout.sessions.list({ limit: 50, expand: ['data.line_items'] });
    const noteRows = await sql`select session_id, fulfilled, tracking from order_notes`;
    const notesById = new Map(noteRows.map(row => [row.session_id, row]));

    const orders = sessions.data
      .filter(session => session.payment_status === 'paid')
      .map(session => ({
        id: session.id,
        customer_email: session.customer_details?.email || '',
        amount_total: session.amount_total,
        currency: session.currency,
        created: session.created,
        items: (session.line_items?.data || []).map(item => ({
          description: item.description,
          quantity: item.quantity,
        })),
        fulfilled: notesById.get(session.id)?.fulfilled ?? false,
        tracking: notesById.get(session.id)?.tracking ?? '',
      }));

    res.status(200).json(orders);
    return;
  }

  if (req.method === 'PUT') {
    const { session_id, fulfilled, tracking } = req.body || {};
    if (typeof session_id !== 'string' || typeof fulfilled !== 'boolean' || typeof tracking !== 'string') {
      res.status(400).json({ error: 'invalid order note payload' });
      return;
    }
    await sql`
      insert into order_notes (session_id, fulfilled, tracking, updated_at)
      values (${session_id}, ${fulfilled}, ${tracking}, now())
      on conflict (session_id) do update set fulfilled = excluded.fulfilled, tracking = excluded.tracking, updated_at = now()
    `;
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
```

- [ ] **Step 3: Restart `vercel dev`, verify content PUT persists**

Run: `curl -s -b /tmp/lorimer-admin-cookie.txt -X PUT http://localhost:3000/api/admin/content -H "Content-Type: application/json" -d '{"key":"footer.location","value":"Helsinki, Finland"}'` then `curl -s http://localhost:3000/api/content | node -e "const d=JSON.parse(require('fs').readFileSync(0));console.log(d['footer.location'])"`
Expected: PUT returns `{"ok":true}`; content API shows `Helsinki, Finland`. Revert with another PUT back to `"Helsinki, 00750"` afterward so seed data stays representative.

- [ ] **Step 4: Verify orders list returns an empty array with no real payments yet**

Run: `curl -s -b /tmp/lorimer-admin-cookie.txt http://localhost:3000/api/admin/orders`
Expected: `[]` (no paid Stripe test-mode sessions exist yet — Task 15 produces a real one).

- [ ] **Step 5: Verify an order-note PUT with a placeholder session id doesn't error**

Run: `curl -s -b /tmp/lorimer-admin-cookie.txt -X PUT http://localhost:3000/api/admin/orders -H "Content-Type: application/json" -d '{"session_id":"cs_test_placeholder","fulfilled":true,"tracking":"TEST123"}'`
Expected: `{"ok":true}`.

- [ ] **Step 6: Commit**

```bash
git add api/admin/content.js api/admin/orders.js
git commit -m "feat(backend): add admin content CRUD and orders (Stripe-backed) endpoints"
```

---

### Task 10: Image upload — `api/admin/upload.js`

**Files:**
- Create: `api/admin/upload.js`
- Test: manual (`vercel dev` + `curl`, Step 3)

**Interfaces:**
- Consumes: `isAuthenticated()` (Task 2), `@vercel/blob`'s `put()`.
- Produces: `POST /api/admin/upload?filename=<name>` (raw file bytes as body) → `200 { url }`. `js/admin.js` (Task 11) is the consumer.

- [ ] **Step 1: Implement `api/admin/upload.js`**

```js
const { put } = require('@vercel/blob');
const { isAuthenticated } = require('../_lib/session');

async function handler(req, res) {
  if (!isAuthenticated(req, process.env.SESSION_SECRET)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const filename = req.query.filename;
  if (typeof filename !== 'string' || !filename) {
    res.status(400).json({ error: 'filename query param is required' });
    return;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  const blob = await put(filename, body, {
    access: 'public',
    contentType: req.headers['content-type'] || 'application/octet-stream',
    addRandomSuffix: true,
  });

  res.status(200).json({ url: blob.url });
}

handler.config = { api: { bodyParser: false } };
module.exports = handler;
```

- [ ] **Step 2: Restart `vercel dev`** (ensure `BLOB_READ_WRITE_TOKEN` is set — `vercel env pull` if not already local)

- [ ] **Step 3: Verify an upload round-trips**

Run: `curl -s -b /tmp/lorimer-admin-cookie.txt -X POST "http://localhost:3000/api/admin/upload?filename=test.jpg" -H "Content-Type: image/jpeg" --data-binary @assets/logo.png`
Expected: `{"url":"https://<...>.public.blob.vercel-storage.com/test-<random>.jpg"}` — fetch that URL in a browser and confirm the image loads.

- [ ] **Step 4: Commit**

```bash
git add api/admin/upload.js
git commit -m "feat(backend): add admin image upload via Vercel Blob"
```

---

### Task 11: Checkout frontend — `checkout.html` + `js/checkout.js`

**Files:**
- Modify: `checkout.html`
- Modify: `js/checkout.js`
- Test: `tests/backend-integration.test.js` (created here, extended in Tasks 12–13)

**Interfaces:**
- Consumes: `getCart()`, `clearCart()` (existing, `js/cart.js:83`, `js/cart.js:160`), `POST /api/checkout` (Task 5).

- [ ] **Step 1: Replace the "coming soon" block in `checkout.html`**

In `checkout.html`, replace:

```html
      <!-- Left: safe preview state -->
      <div class="checkout-unavailable reveal">
        <p class="checkout-unavailable__eyebrow">Store Preview</p>
        <h1>Online checkout is currently unavailable</h1>
        <p>Your selections will stay in your cart while this storefront is being prepared for launch. No personal or payment information is collected.</p>
        <a href="shop.html">Return to Products</a>
      </div>
```

with:

```html
      <!-- Left: payment -->
      <div class="checkout-pay reveal">
        <div id="checkout-success" class="checkout-banner checkout-banner--success" hidden>
          <h1>Thank you — your order is confirmed.</h1>
          <p>A receipt has been sent to your email. Your cart has been cleared.</p>
        </div>
        <div id="checkout-canceled" class="checkout-banner checkout-banner--canceled" hidden>
          <p>Checkout was canceled. Your cart is still here whenever you're ready.</p>
        </div>
        <div id="checkout-form" class="checkout-form">
          <h1>Checkout</h1>
          <p>Shipping is calculated at the next step based on your country.</p>
          <button id="checkout-pay-btn" class="checkout-pay__button" type="button">Pay Now</button>
          <p id="checkout-error" class="checkout-error" hidden></p>
        </div>
      </div>
```

- [ ] **Step 2: Rewrite `js/checkout.js`**

```js
/* checkout.js — real Stripe Checkout handoff */

document.addEventListener('DOMContentLoaded', () => {
  renderOrderSummary();
  handleRedirectState();
  wirePayButton();
});

function handleRedirectState() {
  const params = new URLSearchParams(window.location.search);
  const successEl = document.getElementById('checkout-success');
  const canceledEl = document.getElementById('checkout-canceled');
  const formEl = document.getElementById('checkout-form');

  if (params.get('success') === '1') {
    if (successEl) successEl.hidden = false;
    if (formEl) formEl.hidden = true;
    if (typeof clearCart === 'function') clearCart();
    renderOrderSummary();
  } else if (params.get('canceled') === '1') {
    if (canceledEl) canceledEl.hidden = false;
  }
}

function wirePayButton() {
  const button = document.getElementById('checkout-pay-btn');
  const errorEl = document.getElementById('checkout-error');
  if (!button) return;

  button.addEventListener('click', async () => {
    const cart = getCart();
    if (errorEl) errorEl.hidden = true;

    if (cart.length === 0) {
      if (errorEl) {
        errorEl.textContent = 'Your cart is empty.';
        errorEl.hidden = false;
      }
      return;
    }

    button.disabled = true;
    button.textContent = 'Redirecting to payment…';

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map(item => ({ id: item.id, size: item.size, quantity: item.quantity })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (errorEl) {
          errorEl.textContent = data.error || 'Something went wrong. Please try again.';
          errorEl.hidden = false;
        }
        button.disabled = false;
        button.textContent = 'Pay Now';
        return;
      }

      window.location.href = data.url;
    } catch {
      if (errorEl) {
        errorEl.textContent = 'Something went wrong. Please try again.';
        errorEl.hidden = false;
      }
      button.disabled = false;
      button.textContent = 'Pay Now';
    }
  });
}

function renderOrderSummary() {
  const itemsEl = document.getElementById('summary-items');
  const subtotalEl = document.getElementById('summary-subtotal');
  const totalEl = document.getElementById('summary-total');

  const cart = getCart();

  if (!itemsEl) return;
  itemsEl.replaceChildren();

  if (cart.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'checkout-empty';
    empty.textContent = 'Your cart is empty.';
    itemsEl.append(empty);
    if (subtotalEl) subtotalEl.textContent = '$0';
    if (totalEl) totalEl.textContent = '$0';
    return;
  }

  const fragment = document.createDocumentFragment();
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'summary-item';

    const image = createSafeCartImage(item, 'summary-item__image');
    const info = document.createElement('div');
    info.className = 'summary-item__info';
    info.append(
      createTextElement('p', 'summary-item__name', item.name),
      createTextElement('p', 'summary-item__size', `Size: ${item.size}${item.quantity > 1 ? ` × ${item.quantity}` : ''}`),
    );
    const price = createTextElement('span', 'summary-item__price', `$${getLineTotal(item).toLocaleString()}`);

    row.append(image, info, price);
    fragment.append(row);
  });
  itemsEl.append(fragment);

  const total = getTotal();
  if (subtotalEl) subtotalEl.textContent = '$' + total.toLocaleString();
  if (totalEl) totalEl.textContent = '$' + total.toLocaleString();
}
```

- [ ] **Step 3: Add minimal CSS for the new checkout elements**

Append to `css/styles.css`:

```css
.checkout-banner { margin-bottom: 24px; }
.checkout-banner--success h1 { margin-bottom: 8px; }
.checkout-pay__button {
  display: inline-block;
  padding: 14px 32px;
  background: #111;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.checkout-pay__button:disabled { opacity: 0.6; cursor: default; }
.checkout-error { color: #b00020; margin-top: 12px; }
```

- [ ] **Step 4: Create `tests/backend-integration.test.js`** (static-analysis style, matching `tests/about-page.test.js`)

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('checkout page no longer shows the "coming soon" placeholder', () => {
  const html = read('checkout.html');
  assert.doesNotMatch(html, /Online checkout is currently unavailable/);
  assert.match(html, /id="checkout-pay-btn"/);
  assert.match(html, /id="checkout-success"/);
  assert.match(html, /id="checkout-canceled"/);
});

test('checkout.js posts to /api/checkout and clears the cart on success', () => {
  const js = read('js/checkout.js');
  assert.match(js, /fetch\('\/api\/checkout'/);
  assert.match(js, /clearCart\(\)/);
});
```

- [ ] **Step 5: Run the new test**

Run: `node --test tests/backend-integration.test.js`
Expected: PASS, 2/2.

- [ ] **Step 6: Manual browser check**

Run `vercel dev --listen 3000`, open `http://localhost:3000/shop.html`, add the Phyllite Jacket (Size 1, stock was set to 10 in Task 8 Step 6) to the cart, go to `/checkout.html`, click **Pay Now**, and confirm the browser redirects to a `checkout.stripe.com` test-mode page showing the item and shipping choices.

- [ ] **Step 7: Commit**

```bash
git add checkout.html js/checkout.js css/styles.css tests/backend-integration.test.js
git commit -m "feat(frontend): wire checkout page to real Stripe Checkout"
```

---

### Task 12: Progressive product-data loader — `js/products-remote.js`

**Files:**
- Create: `js/products-remote.js`
- Modify: `index.html`, `about.html`, `shop.html`, `product-detail.html`, `ss24.html`, `checkout.html`
- Test: `tests/backend-integration.test.js` (extended)

**Interfaces:**
- Consumes: `GET /api/products` (Task 4), the global `PRODUCTS` array from `js/products-data.js` (already loaded as a `<script src>` before this file on every page).
- Produces: mutates `PRODUCTS` in place with DB overrides, then dynamically injects the page's remaining `<script>` tags (listed in `window.__LORIMER_SCRIPTS_AFTER__`) so every later script sees the merged data.

- [ ] **Step 1: Create `js/products-remote.js`**

```js
(function () {
  var scriptsAfter = window.__LORIMER_SCRIPTS_AFTER__ || [];

  function loadNext(index) {
    if (index >= scriptsAfter.length) return;
    var script = document.createElement('script');
    script.src = scriptsAfter[index];
    script.onload = function () { loadNext(index + 1); };
    script.onerror = function () { loadNext(index + 1); };
    document.head.appendChild(script);
  }

  function applyOverrides(overrides) {
    if (!Array.isArray(overrides) || typeof PRODUCTS === 'undefined') return;
    overrides.forEach(function (override) {
      var product = PRODUCTS.find(function (entry) { return entry.id === override.id; });
      if (!product) return;
      if (typeof override.name === 'string') product.name = override.name;
      if (typeof override.description === 'string') product.description = override.description;
      if (typeof override.price === 'number') product.price = override.price;
      if (Array.isArray(override.images) && override.images.length) product.images = override.images;
    });
  }

  fetch('/api/products', { cache: 'no-store' })
    .then(function (res) { return res.ok ? res.json() : []; })
    .then(applyOverrides)
    .catch(function () {})
    .finally(function () { loadNext(0); });
})();
```

- [ ] **Step 2: Edit `index.html`'s script tail**

Replace:

```html
  <script src="js/products-data.js?v=9"></script>
  <script src="js/cart.js?v=6"></script>
  <script src="js/main.js?v=7"></script>
  <script src="js/home.js"></script>
  <script src="js/ss24.js?v=9"></script>
  <script src="js/animations.js"></script>
  <script src="js/cursor.js"></script>
```

with:

```html
  <script src="js/products-data.js?v=9"></script>
  <script>window.__LORIMER_SCRIPTS_AFTER__ = ['js/cart.js?v=6','js/main.js?v=7','js/home.js','js/ss24.js?v=9','js/animations.js','js/cursor.js'];</script>
  <script src="js/products-remote.js"></script>
```

- [ ] **Step 3: Edit `about.html`'s script tail**

Replace:

```html
  <script src="js/products-data.js?v=9"></script>
  <script src="js/cart.js?v=6"></script>
  <script src="js/main.js?v=7"></script>
  <script src="js/animations.js"></script>
  <script src="js/cursor.js"></script>
```

with:

```html
  <script src="js/products-data.js?v=9"></script>
  <script>window.__LORIMER_SCRIPTS_AFTER__ = ['js/cart.js?v=6','js/main.js?v=7','js/animations.js','js/cursor.js'];</script>
  <script src="js/products-remote.js"></script>
```

- [ ] **Step 4: Edit `shop.html`'s script tail**

Replace:

```html
  <script src="js/products-data.js?v=11"></script>
  <script src="js/cart.js?v=6"></script>
  <script src="js/main.js?v=7"></script>
  <script src="js/shop.js?v=10"></script>
  <script src="js/animations.js"></script>
  <script src="js/cursor.js"></script>
```

with:

```html
  <script src="js/products-data.js?v=11"></script>
  <script>window.__LORIMER_SCRIPTS_AFTER__ = ['js/cart.js?v=6','js/main.js?v=7','js/shop.js?v=10','js/animations.js','js/cursor.js'];</script>
  <script src="js/products-remote.js"></script>
```

- [ ] **Step 5: Edit `product-detail.html`'s script tail**

Replace:

```html
  <script src="js/products-data.js?v=11"></script>
  <script src="js/cart.js?v=6"></script>
  <script src="js/main.js?v=7"></script>
  <script src="js/product.js?v=8"></script>
  <script src="js/animations.js"></script>
  <script src="js/cursor.js"></script>
```

with:

```html
  <script src="js/products-data.js?v=11"></script>
  <script>window.__LORIMER_SCRIPTS_AFTER__ = ['js/cart.js?v=6','js/main.js?v=7','js/product.js?v=8','js/animations.js','js/cursor.js'];</script>
  <script src="js/products-remote.js"></script>
```

- [ ] **Step 6: Edit `ss24.html`'s script tail**

Replace:

```html
  <script src="js/products-data.js?v=9"></script>
  <script src="js/cart.js?v=6"></script>
  <script src="js/main.js?v=7"></script>
  <script src="js/ss24.js?v=9"></script>
  <script src="js/cursor.js"></script>
```

with:

```html
  <script src="js/products-data.js?v=9"></script>
  <script>window.__LORIMER_SCRIPTS_AFTER__ = ['js/cart.js?v=6','js/main.js?v=7','js/ss24.js?v=9','js/cursor.js'];</script>
  <script src="js/products-remote.js"></script>
```

- [ ] **Step 7: Edit `checkout.html`'s script tail**

Replace:

```html
  <script src="js/products-data.js?v=9"></script>
  <script src="js/cart.js?v=6"></script>
  <script src="js/main.js?v=7"></script>
  <script src="js/checkout.js"></script>
  <script src="js/animations.js"></script>
  <script src="js/cursor.js"></script>
```

with:

```html
  <script src="js/products-data.js?v=9"></script>
  <script>window.__LORIMER_SCRIPTS_AFTER__ = ['js/cart.js?v=6','js/main.js?v=7','js/checkout.js','js/animations.js','js/cursor.js'];</script>
  <script src="js/products-remote.js"></script>
```

- [ ] **Step 8: Extend `tests/backend-integration.test.js`**

Add:

```js
test('every storefront page defers to products-remote.js before its page script', () => {
  const pages = [
    ['index.html', 'js/home.js'],
    ['about.html', 'js/main.js?v=7'],
    ['shop.html', 'js/shop.js?v=10'],
    ['product-detail.html', 'js/product.js?v=8'],
    ['ss24.html', 'js/ss24.js?v=9'],
    ['checkout.html', 'js/checkout.js'],
  ];

  pages.forEach(([page, pageScript]) => {
    const html = read(page);
    assert.match(html, /window\.__LORIMER_SCRIPTS_AFTER__ = \[/, `${page} is missing the deferred script list`);
    assert.match(html, new RegExp(pageScript.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${page} is missing ${pageScript} in its deferred list`);
    assert.match(html, /<script src="js\/products-remote\.js"><\/script>/, `${page} is missing products-remote.js`);
  });
});
```

- [ ] **Step 9: Run the test**

Run: `node --test tests/backend-integration.test.js`
Expected: PASS.

- [ ] **Step 10: Manual browser check**

Open `http://localhost:3000/shop.html` with `vercel dev` running; confirm the shop grid still renders (products-remote.js didn't break the load order) and the Phyllite Jacket's price reflects the €75 override saved in Task 8 Step 5. Then revert that override via `curl -b /tmp/lorimer-admin-cookie.txt -X PUT http://localhost:3000/api/admin/products ...` back to `7000` cents / original description so the seed stays representative for later manual passes.

- [ ] **Step 11: Commit**

```bash
git add js/products-remote.js index.html about.html shop.html product-detail.html ss24.html checkout.html tests/backend-integration.test.js
git commit -m "feat(frontend): load product overrides from the database before page scripts run"
```

---

### Task 13: Editable content loader — `js/content-remote.js` + `data-cms-key` markup

**Files:**
- Create: `js/content-remote.js`
- Modify: `index.html`, `about.html`, `shop.html`, `product-detail.html`, `ss24.html`, `checkout.html` (footer keys)
- Modify: `about.html` (section keys)
- Test: `tests/backend-integration.test.js` (extended)

**Interfaces:**
- Consumes: `GET /api/content` (Task 4).
- Produces: patches every element with a `data-cms-key` attribute via `innerHTML`.

- [ ] **Step 1: Create `js/content-remote.js`**

```js
(function () {
  fetch('/api/content', { cache: 'no-store' })
    .then(function (res) { return res.ok ? res.json() : {}; })
    .then(function (map) {
      document.querySelectorAll('[data-cms-key]').forEach(function (el) {
        var key = el.getAttribute('data-cms-key');
        if (Object.prototype.hasOwnProperty.call(map, key)) {
          el.innerHTML = map[key];
        }
      });
    })
    .catch(function () {});
})();
```

- [ ] **Step 2: Add `content-remote.js` after `products-remote.js` on all six pages**

In `index.html`, `about.html`, `shop.html`, `product-detail.html`, `ss24.html`, and `checkout.html`, change the line added in Task 12:

```html
  <script src="js/products-remote.js"></script>
```

to:

```html
  <script src="js/products-remote.js"></script>
  <script src="js/content-remote.js"></script>
```

- [ ] **Step 3: Add footer `data-cms-key` attributes — multi-line form (`index.html`, `about.html`)**

In `index.html`, replace:

```html
    <div class="footer__col">
      <p>ABOUT</p>
      <p>© Lorimer 2026</p>
      <p>Helsinki, 00750</p>
    </div>
```

with:

```html
    <div class="footer__col">
      <p>ABOUT</p>
      <p data-cms-key="footer.copyright">© Lorimer 2026</p>
      <p data-cms-key="footer.location">Helsinki, 00750</p>
    </div>
```

In `about.html`, replace:

```html
    <div class="footer__col">
      <p>ABOUT</p>
      <p>© Lorimer 2026</p>
      <p>Helsinki, 00750</p>
    </div>
```

with the same replacement.

- [ ] **Step 4: Add footer `data-cms-key` attributes — single-line form (`shop.html`, `product-detail.html`, `ss24.html`, `checkout.html`)**

In each of these four files, replace:

```html
    <div class="footer__col"><p>ABOUT</p><p>© Lorimer 2026</p><p>Helsinki, 00750</p></div>
```

with:

```html
    <div class="footer__col"><p>ABOUT</p><p data-cms-key="footer.copyright">© Lorimer 2026</p><p data-cms-key="footer.location">Helsinki, 00750</p></div>
```

- [ ] **Step 5: Wrap the "Brand" section body in `about.html`**

Replace:

```html
      <h1 id="brand-title">The Brand</h1>
      <p>Founded in Helsinki, Finland, Lorimer is an independent fashion label centred on the relationship between garment, wearer and time. Through considered pattern cutting, purposeful construction and a disciplined approach to materials, the brand creates clothing shaped by form, proportion and silhouette, designed to feel instinctive to wear while remaining quietly distinctive.</p>
      <p>Lorimer focuses on garments that evolve with use, softening over time and taking on character through movement, wear and everyday life. Each piece is intended to accompany its wearer beyond the first impression, developing in a way that is unique to the individual and shaped by the life it lives.</p>
      <p>Responsibility is approached through permanence rather than excess. By producing in limited quantities, prioritising considered manufacturing and focusing on enduring design over disposable consumption.<br>The brand is built on the belief that thoughtful design should remain accessible. By maintaining a direct relationship with its customers, Lorimer aims to place lasting garments into the hands of those who will build a personal connection with them.</p>
```

with:

```html
      <h1 id="brand-title">The Brand</h1>
      <div data-cms-key="about.brand">
      <p>Founded in Helsinki, Finland, Lorimer is an independent fashion label centred on the relationship between garment, wearer and time. Through considered pattern cutting, purposeful construction and a disciplined approach to materials, the brand creates clothing shaped by form, proportion and silhouette, designed to feel instinctive to wear while remaining quietly distinctive.</p>
      <p>Lorimer focuses on garments that evolve with use, softening over time and taking on character through movement, wear and everyday life. Each piece is intended to accompany its wearer beyond the first impression, developing in a way that is unique to the individual and shaped by the life it lives.</p>
      <p>Responsibility is approached through permanence rather than excess. By producing in limited quantities, prioritising considered manufacturing and focusing on enduring design over disposable consumption.<br>The brand is built on the belief that thoughtful design should remain accessible. By maintaining a direct relationship with its customers, Lorimer aims to place lasting garments into the hands of those who will build a personal connection with them.</p>
      </div>
```

- [ ] **Step 6: Wrap the Terms & Conditions body**

Replace the opening of the terms section:

```html
      <h2 id="terms-title">Terms &amp; Conditions</h2>
      <h3>Terms of Sale</h3>
```

with:

```html
      <h2 id="terms-title">Terms &amp; Conditions</h2>
      <div data-cms-key="about.terms">
      <h3>Terms of Sale</h3>
```

and its closing, replace:

```html
      <p>If you have any questions regarding these Website Terms of Use, please contact us at <a href="mailto:contact@lorimer.com">contact@lorimer.com</a>.</p>
    </section>
```

with:

```html
      <p>If you have any questions regarding these Website Terms of Use, please contact us at <a href="mailto:contact@lorimer.com">contact@lorimer.com</a>.</p>
      </div>
    </section>
```

(this is the second occurrence of that exact paragraph in the file — the first occurs after "Governing Law" and refers to Terms of Sale; only the second, which follows "Limitation of Liability", should get the closing `</div>`).

- [ ] **Step 7: Wrap the Deliveries & Shipping body**

Replace:

```html
    <section class="about-section reveal" aria-labelledby="delivery-title">
      <h2 id="delivery-title">Deliveries &amp; Shipping</h2>
      <p>Every Lorimer order is carefully prepared
```

with:

```html
    <section class="about-section reveal" aria-labelledby="delivery-title">
      <h2 id="delivery-title">Deliveries &amp; Shipping</h2>
      <div data-cms-key="about.delivery">
      <p>Every Lorimer order is carefully prepared
```

and replace the section's closing:

```html
      <p>Customers located in or visiting Helsinki are welcome to enquire about arranging a private fitting or collection by appointment.<br>If you are interested in experiencing Lorimer in person, please contact us and we will be happy to discuss available appointments.</p>
    </section>
```

with:

```html
      <p>Customers located in or visiting Helsinki are welcome to enquire about arranging a private fitting or collection by appointment.<br>If you are interested in experiencing Lorimer in person, please contact us and we will be happy to discuss available appointments.</p>
      </div>
    </section>
```

- [ ] **Step 8: Wrap the Payments body**

Replace:

```html
    <section class="about-section reveal" aria-labelledby="payments-title">
      <h2 id="payments-title">Payments</h2>
      <p>We accept all major credit and debit cards, together with a selection of trusted local and digital payment methods, including Apple Pay, Google Pay, PayPal, Klarna and MobilePay where available.<br>All payments are processed securely through certified payment providers using encrypted connections. Lorimer does not store or have access to your full payment card details at any stage of the transaction.<br>Available payment methods may vary depending on your location, currency and device. The payment options available for your order will be displayed during checkout.<br>Orders are processed once payment has been successfully authorised. If a payment cannot be completed or is declined by your payment provider, the order will not be confirmed and no products will be reserved until successful payment has been received.</p>
    </section>
```

with:

```html
    <section class="about-section reveal" aria-labelledby="payments-title">
      <h2 id="payments-title">Payments</h2>
      <div data-cms-key="about.payments">
      <p>We accept all major credit and debit cards, together with a selection of trusted local and digital payment methods, including Apple Pay, Google Pay, PayPal, Klarna and MobilePay where available.<br>All payments are processed securely through certified payment providers using encrypted connections. Lorimer does not store or have access to your full payment card details at any stage of the transaction.<br>Available payment methods may vary depending on your location, currency and device. The payment options available for your order will be displayed during checkout.<br>Orders are processed once payment has been successfully authorised. If a payment cannot be completed or is declined by your payment provider, the order will not be confirmed and no products will be reserved until successful payment has been received.</p>
      </div>
    </section>
```

- [ ] **Step 9: Wrap the Pricing, VAT & Customs body**

Replace:

```html
    <section class="about-section reveal" aria-labelledby="pricing-title">
      <h2 id="pricing-title">Pricing, VAT &amp; Customs</h2>
      <h3>Finland &amp; European Union</h3>
```

with:

```html
    <section class="about-section reveal" aria-labelledby="pricing-title">
      <h2 id="pricing-title">Pricing, VAT &amp; Customs</h2>
      <div data-cms-key="about.pricing">
      <h3>Finland &amp; European Union</h3>
```

and its closing, replace:

```html
      <p>If you're unsure about possible import charges in your country, please don't hesitate to contact us before placing your order. We'll always do our best to provide guidance and ensure you have the information you need before your purchase.</p>
    </section>
```

with:

```html
      <p>If you're unsure about possible import charges in your country, please don't hesitate to contact us before placing your order. We'll always do our best to provide guidance and ensure you have the information you need before your purchase.</p>
      </div>
    </section>
```

- [ ] **Step 10: Wrap the Return & Exchange Policy body**

Replace:

```html
    <section class="about-section about-returns reveal" aria-labelledby="returns-title">
      <h2 id="returns-title">Return &amp; Exchange Policy</h2>
      <p>We hope every Lorimer garment becomes a lasting part of your wardrobe.
```

with:

```html
    <section class="about-section about-returns reveal" aria-labelledby="returns-title">
      <h2 id="returns-title">Return &amp; Exchange Policy</h2>
      <div data-cms-key="about.returns">
      <p>We hope every Lorimer garment becomes a lasting part of your wardrobe.
```

and its closing, replace:

```html
      <p>Once your return has been received and inspected, any approved refund will be issued to the original payment method. Refunds are processed within 14 days of receiving the returned item. The time required for the funds to appear in your account may vary depending on your payment provider.</p>
    </section>
```

with:

```html
      <p>Once your return has been received and inspected, any approved refund will be issued to the original payment method. Refunds are processed within 14 days of receiving the returned item. The time required for the funds to appear in your account may vary depending on your payment provider.</p>
      </div>
    </section>
```

- [ ] **Step 11: Extend `tests/backend-integration.test.js`**

Add:

```js
test('about.html exposes all six editable content regions and the existing section markers still exist', () => {
  const html = read('about.html');
  ['about.brand', 'about.terms', 'about.delivery', 'about.payments', 'about.pricing', 'about.returns'].forEach(key => {
    assert.match(html, new RegExp(`data-cms-key="${key}"`), `about.html is missing data-cms-key="${key}"`);
  });
  // existing about-page.test.js already checks the h1/h2/h3 id markers and order — this test only adds the new attribute checks
});

test('every footer exposes the copyright and location as editable content', () => {
  ['index.html', 'about.html', 'shop.html', 'product-detail.html', 'ss24.html', 'checkout.html'].forEach(page => {
    const html = read(page);
    assert.match(html, /data-cms-key="footer\.copyright"/, `${page} footer is missing footer.copyright`);
    assert.match(html, /data-cms-key="footer\.location"/, `${page} footer is missing footer.location`);
  });
});

test('content-remote.js patches every [data-cms-key] element from /api/content', () => {
  const js = read('js/content-remote.js');
  assert.match(js, /fetch\('\/api\/content'/);
  assert.match(js, /data-cms-key/);
});
```

- [ ] **Step 12: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including the pre-existing `tests/about-page.test.js` (confirms the `data-cms-key` wrapping didn't disturb section order, ids, or literal text the existing tests check for).

- [ ] **Step 13: Manual browser check**

With `vercel dev` running, open `http://localhost:3000/about.html` and confirm the page renders identically to before (content-remote.js round-trips the same seeded text). Then `curl -s -b /tmp/lorimer-admin-cookie.txt -X PUT http://localhost:3000/api/admin/content -H "Content-Type: application/json" -d '{"key":"about.brand","value":"<p>Updated brand copy for testing.</p>"}'`, reload the page, and confirm the Brand section now shows the updated text. Revert with another PUT back to the original seeded value afterward.

- [ ] **Step 14: Commit**

```bash
git add js/content-remote.js index.html about.html shop.html product-detail.html ss24.html checkout.html tests/backend-integration.test.js
git commit -m "feat(frontend): make footer and about-page copy editable via the CMS"
```

---

### Task 14: Admin panel — `admin.html`, `js/admin.js`, `css/admin.css`

**Files:**
- Create: `admin.html`
- Create: `js/admin.js`
- Create: `css/admin.css`
- Test: `tests/backend-integration.test.js` (extended)

**Interfaces:**
- Consumes: `/api/admin/login`, `/api/admin/products`, `/api/admin/inventory`, `/api/admin/content`, `/api/admin/orders` (Tasks 7–9).

- [ ] **Step 1: Create `admin.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin — LORIMER®</title>
  <link rel="stylesheet" href="css/styles.css">
  <link rel="stylesheet" href="css/admin.css">
</head>
<body class="admin-body">
  <div id="admin-login" class="admin-login">
    <h1>LORIMER Admin</h1>
    <form id="admin-login-form">
      <input type="password" id="admin-password" placeholder="Password" required>
      <button type="submit">Log in</button>
    </form>
    <p id="admin-login-error" class="admin-error" hidden></p>
  </div>

  <div id="admin-panel" class="admin-panel" hidden>
    <nav class="admin-tabs">
      <button data-tab="products" class="admin-tab admin-tab--active">Products</button>
      <button data-tab="inventory" class="admin-tab">Inventory</button>
      <button data-tab="orders" class="admin-tab">Orders</button>
      <button data-tab="content" class="admin-tab">Content</button>
      <button id="admin-logout" class="admin-tab admin-tab--logout" type="button">Log out</button>
    </nav>

    <section id="admin-tab-products" class="admin-tab-panel"></section>
    <section id="admin-tab-inventory" class="admin-tab-panel" hidden></section>
    <section id="admin-tab-orders" class="admin-tab-panel" hidden></section>
    <section id="admin-tab-content" class="admin-tab-panel" hidden></section>
  </div>

  <script src="js/admin.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `js/admin.js`**

```js
const API = {
  login: password => fetch('/api/admin/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
  }),
  logout: () => fetch('/api/admin/login', { method: 'DELETE' }),
  products: {
    list: () => fetch('/api/admin/products').then(r => r.json()),
    save: product => fetch('/api/admin/products', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product),
    }),
  },
  inventory: {
    list: () => fetch('/api/admin/inventory').then(r => r.json()),
    save: row => fetch('/api/admin/inventory', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row),
    }),
  },
  orders: {
    list: () => fetch('/api/admin/orders').then(r => r.json()),
    save: note => fetch('/api/admin/orders', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note),
    }),
  },
  content: {
    list: () => fetch('/api/admin/content').then(r => r.json()),
    save: entry => fetch('/api/admin/content', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry),
    }),
  },
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}
function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('admin-login');
  const panelView = document.getElementById('admin-panel');
  const loginForm = document.getElementById('admin-login-form');
  const loginError = document.getElementById('admin-login-error');

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const password = document.getElementById('admin-password').value;
    const res = await API.login(password);
    if (!res.ok) {
      loginError.textContent = 'Incorrect password.';
      loginError.hidden = false;
      return;
    }
    loginView.hidden = true;
    panelView.hidden = false;
    renderProducts();
  });

  document.getElementById('admin-logout').addEventListener('click', async () => {
    await API.logout();
    panelView.hidden = true;
    loginView.hidden = false;
  });

  document.querySelectorAll('.admin-tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab[data-tab]').forEach(t => t.classList.remove('admin-tab--active'));
      document.querySelectorAll('.admin-tab-panel').forEach(p => { p.hidden = true; });
      tab.classList.add('admin-tab--active');
      document.getElementById(`admin-tab-${tab.dataset.tab}`).hidden = false;
      if (tab.dataset.tab === 'products') renderProducts();
      if (tab.dataset.tab === 'inventory') renderInventory();
      if (tab.dataset.tab === 'orders') renderOrders();
      if (tab.dataset.tab === 'content') renderContent();
    });
  });

  async function renderProducts() {
    const panel = document.getElementById('admin-tab-products');
    const products = await API.products.list();
    panel.innerHTML = '';
    products.forEach(product => {
      const form = document.createElement('form');
      form.className = 'admin-card';
      form.innerHTML = `
        <label>Name<input name="name" value="${escapeAttr(product.name)}"></label>
        <label>Description<textarea name="description">${escapeHtml(product.description)}</textarea></label>
        <label>Price (EUR)<input name="price" type="number" step="0.01" value="${(product.price_cents / 100).toFixed(2)}"></label>
        <label>Images (one URL per line)<textarea name="images">${(product.images || []).join('\n')}</textarea></label>
        <button type="submit">Save</button>
        <span class="admin-save-status"></span>
      `;
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const data = new FormData(form);
        const payload = {
          id: product.id,
          name: data.get('name'),
          description: data.get('description'),
          price_cents: Math.round(parseFloat(data.get('price')) * 100),
          images: data.get('images').split('\n').map(s => s.trim()).filter(Boolean),
        };
        const res = await API.products.save(payload);
        form.querySelector('.admin-save-status').textContent = res.ok ? 'Saved' : 'Error';
      });
      panel.append(form);
    });
  }

  async function renderInventory() {
    const panel = document.getElementById('admin-tab-inventory');
    const rows = await API.inventory.list();
    panel.innerHTML = '';
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Product</th><th>Size</th><th>Stock</th><th></th></tr></thead>';
    const tbody = document.createElement('tbody');
    rows.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(row.product_id)}</td>
        <td>${escapeHtml(row.size)}</td>
        <td><input type="number" min="0" value="${row.stock}"></td>
        <td><button type="button">Save</button><span class="admin-save-status"></span></td>
      `;
      tr.querySelector('button').addEventListener('click', async () => {
        const stock = parseInt(tr.querySelector('input').value, 10);
        const res = await API.inventory.save({ product_id: row.product_id, size: row.size, stock });
        tr.querySelector('.admin-save-status').textContent = res.ok ? 'Saved' : 'Error';
      });
      tbody.append(tr);
    });
    table.append(tbody);
    panel.append(table);
  }

  async function renderOrders() {
    const panel = document.getElementById('admin-tab-orders');
    const orders = await API.orders.list();
    panel.innerHTML = '';
    orders.forEach(order => {
      const card = document.createElement('div');
      card.className = 'admin-card';
      const items = order.items.map(item => `${item.quantity} × ${item.description}`).join(', ');
      card.innerHTML = `
        <p><strong>${escapeHtml(order.customer_email)}</strong> — ${(order.amount_total / 100).toFixed(2)} ${order.currency.toUpperCase()}</p>
        <p>${escapeHtml(items)}</p>
        <label><input type="checkbox" ${order.fulfilled ? 'checked' : ''}> Fulfilled</label>
        <label>Tracking <input type="text" value="${escapeAttr(order.tracking)}"></label>
        <button type="button">Save</button>
        <span class="admin-save-status"></span>
      `;
      card.querySelector('button').addEventListener('click', async () => {
        const fulfilled = card.querySelector('input[type="checkbox"]').checked;
        const tracking = card.querySelector('input[type="text"]').value;
        const res = await API.orders.save({ session_id: order.id, fulfilled, tracking });
        card.querySelector('.admin-save-status').textContent = res.ok ? 'Saved' : 'Error';
      });
      panel.append(card);
    });
  }

  async function renderContent() {
    const panel = document.getElementById('admin-tab-content');
    const rows = await API.content.list();
    panel.innerHTML = '';
    rows.forEach(row => {
      const form = document.createElement('form');
      form.className = 'admin-card';
      form.innerHTML = `
        <label>${escapeHtml(row.key)}<textarea name="value">${escapeHtml(row.value)}</textarea></label>
        <button type="submit">Save</button>
        <span class="admin-save-status"></span>
      `;
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const value = new FormData(form).get('value');
        const res = await API.content.save({ key: row.key, value });
        form.querySelector('.admin-save-status').textContent = res.ok ? 'Saved' : 'Error';
      });
      panel.append(form);
    });
  }
});
```

- [ ] **Step 3: Create `css/admin.css`**

```css
.admin-body { font-family: 'Inter', sans-serif; background: #f7f7f5; margin: 0; padding: 40px 24px; }
.admin-login { max-width: 320px; margin: 80px auto; text-align: center; }
.admin-login input { display: block; width: 100%; padding: 10px; margin: 16px 0; box-sizing: border-box; }
.admin-login button { padding: 10px 24px; cursor: pointer; }
.admin-error { color: #b00020; }
.admin-panel { max-width: 900px; margin: 0 auto; }
.admin-tabs { display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid #ddd; }
.admin-tab { background: none; border: none; padding: 12px 4px; cursor: pointer; font-size: 14px; }
.admin-tab--active { border-bottom: 2px solid #111; font-weight: 600; }
.admin-tab--logout { margin-left: auto; }
.admin-card { background: #fff; border: 1px solid #e5e5e0; padding: 20px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px; }
.admin-card label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
.admin-card input, .admin-card textarea { padding: 8px; font-family: inherit; }
.admin-card textarea { min-height: 80px; }
.admin-card button { align-self: flex-start; padding: 8px 20px; cursor: pointer; }
.admin-save-status { font-size: 12px; color: #2e7d32; }
table { width: 100%; border-collapse: collapse; background: #fff; }
th, td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
```

- [ ] **Step 4: Extend `tests/backend-integration.test.js`**

Add:

```js
test('admin.html has a login form and all four tabs', () => {
  const html = read('admin.html');
  assert.match(html, /id="admin-login-form"/);
  ['products', 'inventory', 'orders', 'content'].forEach(tab => {
    assert.match(html, new RegExp(`data-tab="${tab}"`), `admin.html is missing the ${tab} tab`);
    assert.match(html, new RegExp(`id="admin-tab-${tab}"`), `admin.html is missing the ${tab} panel`);
  });
});

test('admin.js calls every admin API route', () => {
  const js = read('js/admin.js');
  ['/api/admin/login', '/api/admin/products', '/api/admin/inventory', '/api/admin/orders', '/api/admin/content'].forEach(route => {
    assert.match(js, new RegExp(route.replace(/\//g, '\\/')), `admin.js never calls ${route}`);
  });
});
```

- [ ] **Step 5: Run the test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 6: Manual browser walkthrough**

With `vercel dev` running, open `http://localhost:3000/admin.html`:
1. Submit the wrong password → confirm the "Incorrect password." message appears.
2. Submit the correct password → confirm the Products tab renders both live products with editable fields.
3. Edit the Phyllite Jacket's description, click Save → confirm "Saved" appears, then reload `http://localhost:3000/shop.html` and confirm the new description shows on the product tile/detail page.
4. Switch to Inventory → set a size's stock to 3, Save → confirm via `psql "$DATABASE_URL" -c "select stock from inventory where product_id='phyllite-jacket' and size='Size 1';"`.
5. Switch to Content → edit `footer.location`, Save → reload `index.html` and confirm the footer shows the new text.
6. Switch to Orders → confirm it loads without error (empty list is fine pre-Task 15).
7. Click Log out → confirm the login form reappears and reloading `admin.html` shows the login form again (session cleared).

- [ ] **Step 7: Commit**

```bash
git add admin.html js/admin.js css/admin.css tests/backend-integration.test.js
git commit -m "feat(frontend): add password-protected admin panel for products/inventory/orders/content"
```

---

### Task 15: End-to-end verification and production cutover

**Files:** none created — verification and configuration only.

- [ ] **Step 1: Set real stock via the admin panel**

Using `http://localhost:3000/admin.html` (or the deployed `/admin` once live), set realistic stock counts for every size of both products.

- [ ] **Step 2: Run a full test-mode purchase**

With `vercel dev` and `stripe listen --forward-to localhost:3000/api/stripe-webhook` both running: add one in-stock size of the denim to the cart on `/shop.html`, go to `/checkout.html`, click Pay Now, and complete payment on the Stripe test page using card `4242 4242 4242 4242`, any future expiry, any CVC, and a Finland address.

Expected: redirect back to `/checkout.html?success=1&session_id=...` showing the success banner; cart is empty afterward.

- [ ] **Step 3: Confirm the webhook decremented stock**

Run: `psql "$DATABASE_URL" -c "select stock from inventory where product_id='lorimer-selvedge-denim' and size='<size you bought>';"`
Expected: stock is exactly one less than what Step 1 set.

- [ ] **Step 4: Confirm the order appears in the admin Orders tab**

Reload `http://localhost:3000/admin.html`, Orders tab.
Expected: the just-completed order appears with the correct email, line items, and total; mark it fulfilled with a tracking number and Save; reload and confirm it persisted.

- [ ] **Step 5: Repeat Step 2 for an out-of-stock size**

Set a size's stock to 0 via the admin Inventory tab, attempt to buy it.
Expected: `checkout.js` shows the inline "…is out of stock" error and never redirects to Stripe.

- [ ] **Step 6: Run the full automated test suite one last time**

Run: `npm test`
Expected: all tests (pre-existing + new) pass.

- [ ] **Step 7: Deploy and configure production env vars**

Run: `vercel env add STRIPE_SECRET_KEY production`, `vercel env add STRIPE_WEBHOOK_SECRET production`, `vercel env add DATABASE_URL production`, `vercel env add ADMIN_PASSWORD production`, `vercel env add SESSION_SECRET production`, `vercel env add BLOB_READ_WRITE_TOKEN production` (use Stripe **live** keys once ready to accept real payments; test keys until then), then `vercel --prod`.

- [ ] **Step 8: Register the production webhook in Stripe**

Run: `stripe webhook_endpoints create --url https://<production-domain>/api/stripe-webhook --enabled-events checkout.session.completed`
Expected: prints a new endpoint with a `whsec_...` secret — set that as the production `STRIPE_WEBHOOK_SECRET` (Step 7) if it differs from the one used locally, then redeploy.

- [ ] **Step 9: Repeat Steps 2–5 against the production URL** with a real Stripe **test-mode** key still active (do not switch to live mode until this full pass is confirmed clean), then flip `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` to live-mode values for launch.
