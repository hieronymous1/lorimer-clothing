# Final revision round (Riki, 14 October 2026)

Source: Riki's "Final Revision_LorimerWeb" list. Assets arrived in
`transfer-01a13ab3/` (untracked; delivery folder). All work below is on
`design/elevation`. See the release completion record below for current status.
Tests: 174 passing. Verified twice by a fresh-context verifier (second pass
CONFIRMED after fixing a cookie-notice overlap).

## Done

### Glitch fixes
- **Back button → white screen.** `js/animations.js` fades `body.page-exit`
  (opacity 0) before navigating. iOS Safari restores pages from the
  back-forward cache in that state. A `pageshow` listener now removes
  `page-exit`. The fade is also skipped for `mailto:`/`tel:`/any scheme,
  `target=_blank`, `download`, and modified or middle clicks, which used to
  leave the page blank. Desktop Chrome often doesn't use bfcache, which is why
  the bug didn't reproduce on a laptop.
- **S/S24 arrow lag.** `js/ss24.js` (S/S24 page and the homepage look gallery)
  now stacks one `<img>` per photo and preloads/decodes them within 600px of
  the viewport. The opacity transition on `.lookbook-gallery__image` was
  removed, so the swap is instant.

### Final touches
- **Size guides.** `sizeGuideImage` on the four live products in
  `js/products-data.js`:
  - `assets/photos/size-guides/phyllite-jacket.jpg` for both Phyllites
  - `assets/photos/size-guides/selvedge-denim.jpg` for both denims

  These replace the old inch tables in the modal (`js/product.js`). The images
  were trimmed of white margins for mobile. Tapping a chart opens it full size.
- **Products page stills.** `assets/photos/shop/still-01.jpg` comes from
  `Lorimer_NoGrain_0-37-19`, and `still-02.jpg` from `0-11-20`. They are
  referenced with `?v=2` in `js/shop.js`. `still-03/04` are unchanged.
- **Load-up screen** (`index.html`, `css/styles.css`), per `LoadUp_Page.png`:
  - full-bleed `assets/photos/preloader/loadup(-mobile).jpg` (from
    `0-01-23`) with a white haze
  - centre logo wipe-in
  - 0–100 counter at bottom right
  - "LORIMER® / HELSINKI" at top left

  The panels, "Garment Index", "Pattern loading" and the mark were removed.
  `js/preloader.js` is unchanged.
- **Footer.** "NEWSLETTER" is replaced by a "Cookies" link to `cookies.html`
  on every page.
- **Sold-out 1 of 1 products in admin.**
  - `api/products.js` also returns `notForSale` products, with
    `stock_by_size: null`.
  - `api/admin/products.js` flags them `archived` and sorts them after the live
    products.
  - Admin shows a "Sold out · 1 of 1" tag and numbered thumbnails that mirror
    the Images list, so photo order can be set by eye.
  - They remain unpurchasable: checkout keeps its own `LIVE_IDS`.

### Logistics
- **Cookies.**
  - Informational notice: `initCookieNotice` in `js/main.js`, localStorage key
    `lorimer-cookie-notice`.
  - On mobile product pages the notice is raised above the fixed Add to Cart
    bar.
  - `cookies.html` policy text is a **draft for Riki to review**. The site has
    no analytics or tracking.
- **Returns portal.**
  - `returns.html` + `js/returns.js` form posts to `api/returns.js`. It
    validates input, has a honeypot field, and rate-limits (3 per email per
    day, 30 per hour site-wide), then inserts into `return_requests`.
  - Admin **Returns** tab (`api/admin/returns.js`) has Handled and Note fields.
  - Nothing is emailed; Riki checks the tab.
  - The About returns copy links "Lorimer Returns & Exchanges Portal" to
    `returns.html` (in `about.html`, `scripts/seed.js`, and the DB via the
    migration).
- **`CLIENT_GUIDE.md`** documents the Returns tab and editing the sold-out
  pieces.

Cache-bust versions bumped: styles v4, products-data v16, main v11,
animations v2, product v13, shop v16, ss24 v12, admin.js v4, admin.css v2,
returns.js v2.

## Release

Before deploying, with `DATABASE_URL` set:

```sh
node scripts/migrate-2026-10-final.js
```

It is idempotent and additive:
- inserts the sold-out products (`on conflict do nothing`)
- creates `return_requests`
- links the portal text in the `about.returns` CMS value, only if it isn't
  already linked

Without it, the Returns form fails, the sold-out products don't appear in
admin, and the live About page has no portal link (the CMS value overrides
the HTML). Completed on 14 October; see the release completion record below.

### Release completion — Codex, 14 October 2026

- `npm test`: all 174 tests pass; `git diff --check` is clean.
- Admin browser regression passed: uploads, repeated saves, reload persistence,
  drafts across tabs, expired sessions, and oversized upload rejection.
- Browser checks at 390px passed on Home, Products, S/S24, About, Cookies,
  Returns, and the Phyllite product page with no horizontal overflow or JS
  errors. Verified size-chart loading, the persisted `pageshow` reset, and a
  mocked return submission that omits the disabled exchange-size field.
  External Google Fonts were blocked in this local smoke check.
- Production migration completed. The four existing product records and all
  22 inventory rows were verified unchanged. The catalog now contains 28
  products; `return_requests` exists and initially contains zero requests.
  The About CMS copy links to the returns portal; other CMS entries were
  verified unchanged.
- Pre-migration backup: `.vercel/backups/cms-before-final-2026-10-14.json`
  (ignored by Git and deployment).
- Raw delivery assets and local agent settings are ignored; optimized site
  assets are included in the release.

## Copy and verification completion — 15 October 2026

- Applied the supplied denim copy to both colourways, and the supplied wax and
  fabric-painted Phyllite descriptions. Proofread punctuation and phrasing while
  retaining fit, construction, finish, .5-size alterations and 1–3-day dispatch
  details.
- Revised the Brand story and all six S/S24 captions for clarity and concrete
  garment details. Corrected the inconsistent website domain and the missing
  policy reference. Payment copy now refers to methods actually offered at
  Stripe Checkout rather than promising a fixed list of providers.
- Confirmed with the owner that the domain is `lorimerclothing.com`. Changed all
  website contact links and returns error messages to
  `contact@lorimerclothing.com`. Corrected the embedded email in both supplied
  size charts; compared every table measurement against the original.
- Found stale database descriptions overriding the local product copy. Backed
  up products, content and inventory to the ignored file
  `.vercel/backups/cms-before-copy-2026-10-15.json`, then ran
  `scripts/migrate-2026-10-copy.js`. Verified all four live descriptions and
  intended About replacements, with prices, photos, archived records, unrelated
  CMS content and all 22 inventory rows unchanged.
- `npm test`: 176 tests pass. `git diff --check`: clean.
- Browser checks passed at 390, 768 and 1440 pixels on Home, Products, S/S24,
  About, Cookies, Returns, Checkout and the live product pages. No horizontal
  overflow or JavaScript exceptions; body visibility and preloader dismissal
  verified. Size-chart images loaded and their modals opened and closed.
- Mobile S/S24 Next/Previous controls and browser Back visibility passed.
- Deployed to production: `https://www.lorimerclothing.com` (deployment
  `lorimer-clothing-f82336piz-hieronymous1s-projects.vercel.app`). Production
  checks at 390 and 1440 pixels confirmed revised API copy, corrected contact
  links and both replacement size-chart images, with no overflow or JS errors.
- Local static-server checks exercise the bundled fallback catalog; database
  changes were separately verified against production.

## Still open

- **Mailbox creation:** owner confirmed Namecheap and signed in. The Launch
  one-mailbox trial is selected for lorimerclothing.com. Owner approved €0
  for 30 days, then €13.29/year with auto-renew, and accepted the checkout
  agreements. Order 216792816 completed at $0; subscription 4454361 is on
  trial until 15 November 2026. Namecheap automatically set Private Email DNS.
  Verified directly at the authoritative nameserver: MX records
  `mx1.privateemail.com` and `mx2.privateemail.com` (priority 10), SPF
  `v=spf1 include:spf.privateemail.com ~all`, and DKIM at
  `privateemail._domainkey`. Website A/CNAME records remain unchanged.
  Mailbox form has `contact` entered; waiting for the owner to set and save
  the password. Inbound/outbound delivery has not yet been tested.
  Do not describe the address as active until setup and delivery are tested.
- **Final hero video:** replacement not present in the workspace or Downloads.
  Existing video remains in place pending delivery of the final version.
- **Sold-out photo order:** admin supports numbered previews and ordering;
  current live photo lists were preserved, including today's uploaded photos.
  No new ordering instructions were supplied for this round.

## Known minor caveats
- `api/returns.js` rejects a *return* request that carries a malformed
  `exchange_size` (non-string or more than 60 characters). The real form
  never sends that field for returns.
- Old `assets/photos/shop/still-01.png` and `still-02.png` are unused
  leftovers.

## Final copy round — 17 October 2026

- Applied `Final Texts.md`: both denim colourways, the wax and fabric-paint
  Phyllite descriptions, the six S/S24 look captions, the Brand story, and the
  full Terms, Privacy, Shipping, Payments, Pricing and Returns copy.
- Homepage S/S24 text revised and set one size smaller; slideshow is five
  images (old image 5 is now image 3; old 6 and 7 removed).
- All site emails (footer, About, Returns, API messages, both size-chart
  images, client guide) now use `info@lorimerclothing.com`.
- New Sterling Cap 003 photo (`STERLINGCAP003.png`, trimmed to the 5:7 frame);
  product-page photos now fill a uniform 5:7 box (landscape photos keep their
  natural shape).
- **Live database:** run `node scripts/migrate-2026-10-17-final-copy.js` with
  `DATABASE_URL` set. It backs up the rows it touches to
  `.vercel/backups/cms-before-final-copy-2026-10-17.json`, then updates the
  About blocks, the four product descriptions and the cap photo path.
- The WeTransfer link contained only the cap photo; the final hero video has
  still not been received.
