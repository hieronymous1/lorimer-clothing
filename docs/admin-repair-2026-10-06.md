# Admin repair — 6 October 2026

Production: https://www.lorimerclothing.com/admin
Deployment: https://lorimer-clothing-184lfvypo-hieronymous1s-projects.vercel.app

The October deployment queried `products.finish_prices`, but that column was absent from the production database. `/api/products` and `/api/admin/products` returned 500. The public site silently displayed static fallback data, making the client's saved edits appear lost; the product editor failed to render.

Before repair, backed up products, inventory and content to `.vercel/backups/cms-before-repair-2026-10-06.json` (ignored by Git and deployment). Three product records, 14 photo references, 16 stock rows and eight content entries were present. Comparison after migration confirmed every pre-existing field, including timestamps, was unchanged.

Applied the corrected additive migration: add the missing column, initialize missing finish prices, and insert the two missing jacket size rows at zero stock. Removed the old migration's overwrites of product copy, jacket photos, name and base price.

Additional deployed repairs:

- Keep uploaded URLs in the form and clear the uploaded file, preventing a later save from losing or duplicating it.
- Preserve unfinished edits across tab switches; warn before leaving with unsaved edits.
- Show API, connection and expired-session errors instead of blank editors or generic save failures.
- Save all product fields in one SQL update; return the saved record and use its timestamp to detect stale product edits.
- Report missing product/inventory records as errors instead of false success.
- Honor empty image lists instead of restoring default photos.
- Disable API caching; version the admin script; validate uploads locally with a conservative 4 MB limit, matching server validation.

Verification:

- `npm test`: 162 passing tests.
- Browser regression: upload, repeated save, reload persistence, drafts across tabs, expired sessions and oversized uploads. Run `tests/admin-ui.browser.js` using the Playwright runner with the site served on port 8937.
- Production: real password login; all four admin endpoints; a real temporary image upload, byte-for-byte download verification, then deletion of the unattached test image.
- Production: product, inventory and content save/read-back using existing values; stale product save rejected with 409; missing stock row rejected with 404; unauthenticated product access rejected with 401.
- Production browser: three product forms, 18 inventory rows, eight content forms and four orders; no JavaScript errors; no horizontal overflow at 390 px.

No customer order or fulfillment status was changed. Order listing was verified; fulfillment writes were not exercised against real orders. CMS scope remains the product fields/photos and content regions documented in CLIENT_GUIDE.md; editorial and finish-specific shop preview images remain code-managed.
