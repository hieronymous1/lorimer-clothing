# Store Backend: Checkout, Inventory & CMS

Date: 2026-08-31
Status: Approved for planning

## Context

LORIMER is a static HTML/CSS/JS site (no framework, no build step) hosted on
Vercel (project `lorimer-clothing`). The cart (`js/cart.js`) is fully
client-side (localStorage). `checkout.html` currently renders a placeholder
"Online checkout is currently unavailable" state — there is no payment
processing, no inventory tracking, and no way for the client to edit site
content without a developer.

The store sells exactly two products at launch (from `js/products-data.js`):

- **Phyllite Jacket** (`phyllite-jacket`) — $70, sizes `Size 1`, `Size 2`
- **Lorimer Selvedge Denim** (`lorimer-selvedge-denim` / `lorimer-selvedge-denim-black`,
  a single product with two color variants) — $80, sizes `30×30`…`34×34`

All other catalog entries stay `available: false` and are unaffected by this
work.

Stripe CLI is authenticated locally against `acct_1UASNJB7TZi1N4gh`. All
credentials (Stripe keys, Neon connection string, admin password, session
secret) are supplied as Vercel environment variables — never committed.

## Goals

1. Real checkout: customers can pay for the jacket and the denim and shipping
   is charged correctly by region.
2. Inventory that can't be oversold: stock is tracked per size/variant and
   decremented only on confirmed payment.
3. A single admin surface where the (non-technical) client can edit product
   text/images/price, see and update orders, and edit a handful of site copy
   blocks (homepage, about, footer) — without a developer or a redeploy.

## Non-goals

- Multi-user admin accounts / roles (single shared admin password is
  sufficient — one client, one login).
- Editing site layout, adding new pages, or a page-builder. Only text/image
  *content* inside existing sections is editable.
- Adding new products through the admin UI. The two-product catalog is fixed
  for this phase; adding a third product later is a follow-up.
- Discount codes, taxes, multi-currency. Single currency (EUR), no
  promotions, at launch.
- Real-time inventory sync across sales channels — this store is the only
  sales channel.

## Architecture

```
Browser (static HTML/CSS/JS, unchanged pages)
   |
   |-- fetch --> /api/products   (public GET)  --\
   |-- fetch --> /api/content    (public GET)     >  read from Neon
   |-- fetch --> /api/inventory  (public GET, stock-only)  --/
   |
   |-- POST --> /api/checkout          --> Stripe Checkout Session --> redirect
   |
Stripe --webhook--> /api/stripe-webhook --> decrements stock in Neon

Admin browser (/admin, password-gated)
   |-- POST --> /api/admin/login        --> sets signed session cookie
   |-- CRUD --> /api/admin/products     --> Neon `products`
   |-- CRUD --> /api/admin/content      --> Neon `content`
   |-- CRUD --> /api/admin/inventory    --> Neon `inventory`
   |-- GET  --> /api/admin/orders       --> proxies Stripe (list/expand sessions)
   |-- POST --> /api/admin/upload       --> Vercel Blob (images)
```

**Data store: Neon Postgres.** Three tables:

- `products (id text pk, name, description, price_cents int, images jsonb, updated_at)`
  — seeded from the two live SKUs above. Public pages fetch this instead of
  reading the hardcoded values in `products-data.js` for name/description/
  price/images; sizes and non-editable structural fields (category, material
  labels used for filtering) stay in `products-data.js` since the client
  never edits those.
- `inventory (product_id text, size text, stock int, primary key (product_id, size))`
  — one row per size per product (jacket: 2 rows, denim: one row per
  size **per colorway**, since `lorimer-selvedge-denim` and
  `-black` are distinct catalog ids today). Starts at `stock = 0` for every
  row; the client sets real counts via `/admin` before launch.
- `content (key text pk, value text, updated_at)` — small flat key→text
  store for the editable copy blocks (see below). No nested/rich-text
  structure — plain text or short HTML fragments per key, editable as a
  single textarea per key in the admin UI.

Orders are **not** duplicated into Neon. `/api/admin/orders` calls the Stripe
API directly (`checkout.session.list`, expanded with line items) so order
data is always exactly what Stripe has — no sync bugs, no second source of
truth for money. The only local order-related field is an optional
`fulfilled boolean` + `tracking text`, stored keyed by Stripe session id in a
fourth, minimal `order_notes` table, since Stripe has no native "fulfillment"
field we can write back to.

**Images**: uploaded via `/api/admin/upload` to **Vercel Blob**, which
returns a public URL stored in `products.images` or a `content` value. The
existing `assets/photos/...` files stay as-is as the initial/default images;
an admin upload simply replaces the URL in the DB.

**Auth**: `/api/admin/login` checks a password against `ADMIN_PASSWORD` (env
var) and, on success, sets an httpOnly, signed cookie (HMAC with
`SESSION_SECRET` env var) with an expiry. All `/api/admin/*` routes verify
that cookie. No user table, no OAuth — matches the single-operator non-goal
above.

## Checkout flow

1. Customer builds a cart client-side as today (`cart.js`, unchanged).
2. On `checkout.html`, "Pay Now" POSTs the cart (id/size/quantity pairs) to
   `/api/checkout`.
3. `/api/checkout`:
   - Re-derives price server-side from the `products` table (never trusts
     client-sent prices).
   - Checks `inventory.stock >= quantity` for every line; if any line fails,
     returns 409 with which size is unavailable (checkout.js shows this
     inline, no charge attempted).
   - Creates a Stripe Checkout Session with one `line_item` per cart line,
     `shipping_address_collection` restricted to allowed countries, and
     `shipping_options` set to the three flat rates below.
   - Returns the Checkout Session URL; the page redirects the browser to it.
4. Stripe hosts the actual payment page (card entry, 3DS, etc.) — no PCI
   surface on our side.
5. On success, Stripe redirects back to a confirmation page
   (`checkout.html?success=1&session_id=...` is sufficient — no new page
   needed, just a success state added to the existing layout).
6. Stripe sends `checkout.session.completed` to `/api/stripe-webhook`, which
   verifies the Stripe signature, then decrements `inventory.stock` for each
   purchased line inside a single transaction (so two near-simultaneous
   buyers of the last unit can't both succeed).

**Shipping rates** (flat, by `shipping_address_collection` country group):

- Finland: €5
- Rest of EU: €12
- Rest of world: €25

## Admin panel (`/admin`)

Plain static page (no framework) with four tabs, all backed by the
`/api/admin/*` routes above:

- **Products** — edit name, description, price, and images (upload via
  Blob) for the two live products. Size lists are not editable here
  (structural, lives in `products-data.js`).
- **Inventory** — a table of every `(product, size)` row with an editable
  stock number and a Save button per row.
- **Orders** — list of Stripe Checkout Sessions (customer, items, total,
  date, payment status) with a fulfilled checkbox + tracking-number field
  persisted to `order_notes`.
- **Content** — one textarea per key in `content` (e.g. `home.hero.tagline`,
  `about.body`, `footer.about`, `footer.newsletter`) with a Save button per
  key. The exact key list is finalized during implementation by reading the
  current copy out of `index.html`/`about.html`/the footer partial.

Login is a single password field gating the whole page (cookie-based
session, see Architecture).

## Error handling

- `/api/checkout` never charges if server-side stock/price checks fail —
  returns a 4xx with a reason the frontend already knows how to surface
  (checkout.js today renders inline messages).
- Webhook handler verifies the Stripe signature header and rejects
  unverified requests; it's idempotent (keyed on Stripe event id) so retried
  webhook deliveries don't double-decrement stock.
- Admin routes return 401 without a valid session cookie; the admin page
  redirects to the login form on any 401.

## Testing

- Unit-level: stock-check and price-derivation logic in `/api/checkout`
  (pure functions, testable without hitting Stripe/Neon).
- Integration: Stripe CLI (`stripe trigger checkout.session.completed`) to
  exercise the webhook against a local dev server and confirm stock
  decrements exactly once, including a simulated duplicate delivery.
- Manual: full purchase run in Stripe test mode for both products across at
  least one in-stock and one zero-stock size (to confirm the block works),
  plus a manual pass through every `/admin` tab.

## Environment variables (Vercel)

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL` (Neon),
`ADMIN_PASSWORD`, `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`.
