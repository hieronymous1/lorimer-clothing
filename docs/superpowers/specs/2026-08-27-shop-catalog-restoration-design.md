# Shop Catalog Restoration Design

## Goal

Restore the Shop to its original compact retail proportions while retaining the two user-supplied campaign stills as restrained editorial interruptions. The result must read as a usable shop first: one product per catalog record, visible names and prices, a persistent filter, and predictable product density.

## Approved direction

The current chapter-based editorial treatment is removed. It makes products too large, repeats merchandise, repeats filters, hides prices, and creates excessive empty space. The replacement uses the original Shop shell and measurements:

- A 200px sticky desktop filter rail with 11px filter labels.
- A three-column product grid with 2px gaps.
- Product images at a 3:4 aspect ratio using `object-fit: cover`.
- Product names and prices at 10px.
- One card per product, in the canonical order from `PRODUCTS`.
- No repeated products, chapter indices, detail strips, or duplicate filter groups.

## Editorial stills

`assets/photos/shop/still-01.png` and `assets/photos/shop/still-02.png` remain in the Shop as non-clickable editorial breaks. Each still spans all three desktop columns and uses a wide crop. The first appears after the sixth product and the second after the fifteenth product, so they interrupt the catalog without dominating its opening or replacing merchandise.

Stills use empty alternative text because they are decorative campaign imagery. They are hidden whenever a category filter is active so filtered results remain a compact product-only grid.

## Filtering and rendering

The single filter group contains All, Jackets, Tops, Bottoms, and Accessories. Buttons expose `aria-pressed`; the selected button receives the existing active treatment. Filtering hides nonmatching product cards, hides both editorial stills outside the All state, and announces the visible product count through the existing polite live region.

The renderer uses DOM creation methods and `textContent`, not HTML string interpolation. Product IDs are URL encoded. Missing images degrade to the existing neutral placeholder.

## Responsive behavior

At 768px and below, the sidebar becomes the existing horizontal filter band and the grid becomes two columns. Editorial stills span both columns. Card imagery, names, and prices retain the original scale. The layout must not overflow horizontally, and filter controls retain usable touch targets and visible keyboard focus.

## Files

- `shop.html`: restore the sidebar and grid shell.
- `js/shop.js`: render the canonical product list once, insert two stills at fixed breakpoints, and filter safely.
- `css/styles.css`: restore the original Shop measurements and add only the full-row still treatment.
- `tests/shop-editorial.test.js`: replace chapter expectations with compact catalog, sizing, ordering, still placement, filtering, and safe-rendering expectations.

## Verification

Automated tests must demonstrate the old chapter implementation fails the restored requirements before production code changes. After implementation, the focused Shop tests and the full test suite must run. Browser verification must confirm desktop and mobile proportions, visible prices, one instance per product, correct filter behavior, still placement, no horizontal overflow, and no new console errors.
