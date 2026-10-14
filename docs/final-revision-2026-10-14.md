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

## Release procedure

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
the HTML). The migration was run successfully on 14 October; see below.

### Release completion — Codex, 14 October 2026

- Implementation pushed as `b6f62b7` on `design/elevation`.
- Deployed to production at https://www.lorimerclothing.com.
  Deployment: https://lorimer-clothing-ipltp1mcu-hieronymous1s-projects.vercel.app.
- Live smoke checks passed: Home, Returns, Cookies, 28 public products,
  the CMS portal link, authenticated Returns listing (200), unauthenticated
  Returns rejection (401), and empty public submission rejection (400).
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

## Still open
- **New copy from Riki:**
  - Lorimer Selvedge Denim (both colours share it)
  - Phyllite Jacket
  - Phyllite Jacket V2
  - The Brand
  - Rest of About
  - S/S24

  Product copy and About sections can also be edited in admin. S/S24 look copy
  lives in `ss24.html`.
- **New hero video:** Riki is sending the final version on 15 Oct. Replace
  `assets/video/lorimer-promo.mp4` and `poster.jpg` in `index.html`, and
  cache-bust them.
- **Sold-out product photo order:** Riki can set it in admin after the
  migration, or send file names and order.
- **contact@lorimer.com:** the site domain is `lorimerclothing.com`. Confirm
  whether Riki owns lorimer.com. The address also appears inside both
  size-guide images and across the site's copy.
- **Final mobile pass** after the copy and video land.
- **Release completed.** Follow the release procedure again for future changes.

## Known minor caveats
- `api/returns.js` rejects a *return* request that carries a malformed
  `exchange_size` (non-string or more than 60 characters). The real form
  never sends that field for returns.
- Old `assets/photos/shop/still-01.png` and `still-02.png` are unused
  leftovers.
