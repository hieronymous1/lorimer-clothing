# Safe Demo Checkout and Storefront Hardening

## Goal

Make the unfinished storefront migration safe to preview and commit-ready without implying that payments are processed. Preserve the existing cart, product catalogue, asset migration, and homepage redesign.

## Scope

- Remove payment-card and CVV collection from the static checkout page.
- Replace the fake order-success flow with a clear checkout-unavailable state.
- Keep the cart and order summary visible so the storefront remains demonstrable.
- Remove the tracked MCP credential from `project.md`; external revocation and history cleanup remain operator actions.
- Prevent cart data loaded from `localStorage` from being interpreted as HTML.
- Exclude delivery-source and operating-system metadata from future commits.
- Verify JavaScript, asset references, malicious cart content, and desktop/mobile browser behavior.
- Preserve all pre-existing asset/homepage additions, modifications, and planned deletions exactly as found; make no further asset-tree changes.

## Design

### Checkout

The checkout page remains a cart review page. It shows line items and totals, explains that online checkout is not available, and provides a route back to the shop. It does not request contact, address, or payment-card information, does not clear the cart, and cannot show a false order confirmation.

### Safe rendering

Dynamic cart and order-summary rows are created with DOM APIs and assigned through `textContent` and safe element properties. Product catalogue rendering remains based on the repository-owned constant dataset.

Stored cart data is normalized in memory and is not written back during reads:

- The root must be an array; otherwise it becomes an empty cart. At most 50 input entries are considered.
- Each entry becomes only `{ id, name, size, price, quantity, image }`; unknown fields are discarded.
- `id`, `name`, and `size` must be non-empty strings, trimmed and capped at 128, 200, and 32 characters respectively.
- `quantity` is an integer clamped to 1–99. `price` is finite and clamped to 0–1,000,000.
- Duplicate `id` + `size` rows are merged with quantity capped at 99.
- `image` must be a relative path inside `assets/` (optional leading `./`), contain no `..` segment, and be capped at 512 characters. Remote URLs and other protocols use the empty-image fallback.
- Line totals and cart totals are finite and capped at 10,000,000.

### Credential handling

`project.md` retains only non-sensitive project notes. The existing credential is replaced with an instruction to configure integrations outside tracked files. Verification checks relevant source/config files for non-empty credential query-parameter assignments using a test pattern assembled from non-sensitive fragments; the test embeds and prints neither the endpoint nor credential. Because the credential exists in published history, code changes alone do not revoke it.

### Repository hygiene

Ignore `.DS_Store` files at any depth and the exact `swisstransfer_c69bec8a-ddee-4a91-9611-ddab39e78eb7 (1)/` delivery folder. Preserve `assets/` as the canonical deployed asset directory. Do not stage, commit, push, rewrite history, mutate the Git index or remotes, or make any further asset-tree changes as part of this implementation.

## Error handling

- Invalid or malformed stored-cart roots resolve to an empty cart; individual invalid entries are discarded.
- Quantities, prices, line totals, and cart totals obey the exact limits above.
- Missing images retain the existing visual fallback without injecting inline HTML from stored data.

## Verification

1. Add Node built-in tests runnable with `node --test tests/*.test.js`; run them against the current implementation and record the expected failures before production code changes.
2. Tests cover the exact cart schema and limits, duplicate handling, finite totals, local-image allowlisting, hostile HTML strings, remote/protocol image rejection, and no unsafe cart-to-`innerHTML` rendering.
3. Checkout acceptance tests cover empty and non-empty carts; absence of contact/address/card fields, fake-success markup/handler, and any submit-capable order action; presence of a shop-return link; and unchanged `localStorage` before and after page use.
4. A non-secret-bearing test asserts `project.md` and relevant current source/config files contain no non-empty credential query-parameter assignment. It constructs the pattern from harmless fragments and does not inspect Git history or embed/print the endpoint or credential.
5. Repository tests assert `.DS_Store` is ignored at any depth, the exact SwissTransfer directory is ignored, and canonical `assets/` remains present. Verification must not run staging, commit, history-rewrite, index-mutation, or remote-mutation commands.
6. Run `node --check` for every JavaScript file and verify every referenced local asset exists.
7. Serve locally on `127.0.0.1:4173`. With `playwright-cli`, test 1440×900 and 390×844 viewports. Navigate home → shop → product, select a size, add to cart, open checkout, assert summary and unavailable messaging, assert no form/order button and unchanged storage, visit SS24, and inspect console errors plus failed local requests. Repeat checkout with an empty cart.

## Out of scope

- Real payment processing or order persistence.
- Credential revocation or Git-history rewriting.
- Committing or pushing the completed changes.
- Broader visual redesign beyond fixing defects discovered in the approved migration.
