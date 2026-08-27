# Product Detail Scroll Gallery Design

## Goal

Make every Lorimer product detail page follow the supplied Buen Dia product-page reference: product photography scrolls as a continuous vertical sequence while purchasing information remains visible beside it on desktop.

The supplied Lorimer product photographs are the source of truth for the media treatment. Images retain the neutral studio background, portrait composition, and full subject presentation.

## Desktop layout

The product page uses two equal-width columns below the existing navigation.

- The left column renders every image in the selected product's `images` array in source order.
- Images form one uninterrupted vertical stack with no thumbnails, framing, or gaps.
- Each image fills the column width at its intrinsic aspect ratio (`width: 100%; height: auto`). The page does not impose a crop, so the supplied full-subject photography remains intact.
- The right column contains the existing name, price, description, material, size selection, add-to-cart control, and back link.
- The information content uses native CSS sticky positioning, `align-self: start`, and an offset based on the navigation height. It remains visible while the left image sequence scrolls and releases naturally at the end of the product section.
- The sticky panel's maximum height is the available viewport below the navigation. If its content exceeds that space, the panel itself becomes vertically scrollable so every control remains reachable on short screens.
- A single vertical rule preserves Lorimer's existing editorial structure between media and information.

No scroll-linked transforms, parallax, fades, or JavaScript animation are added. The reaction to scrolling comes from the contrast between the moving image sequence and stationary product controls, matching the reference interaction.

## Mobile layout

At the existing mobile breakpoint, the page becomes a single column.

- Images remain in their source order as a genuinely edge-to-edge, full-width vertical stack with no gallery padding.
- Product information follows the gallery in normal document flow.
- Sticky positioning is disabled to avoid obscuring content or creating nested scroll behavior.
- The desktop panel height limit and internal overflow are also removed on mobile.
- Existing cart and size-selection touch behavior remains unchanged.

## Rendering and accessibility

`renderGallery` creates image elements using DOM APIs rather than inserting product data as HTML. Because the current product model has no per-image descriptions, the first image identifies the product and subsequent alternate angles use empty alternative text to avoid repeating indistinguishable labels to screen-reader users. The first image loads eagerly with high fetch priority; later images use native lazy loading and asynchronous decoding.

If a product has no images, the gallery renders a neutral placeholder with an accessible text label and does not throw. A failed individual image displays the gallery's neutral background without breaking layout. Existing product selection, cart behavior, and URL-based product loading are unchanged.

## Files and responsibilities

- `product-detail.html`: simplify the gallery container by removing the single main-image and thumbnail structure.
- `js/product.js`: render the complete accessible image sequence.
- `css/styles.css`: implement the stacked media column, sticky information panel, and single-column responsive fallback.
- `tests/product-detail-scroll.test.js`: protect gallery markup, safe rendering, sticky desktop behavior, mobile fallback, and removal of obsolete thumbnail interactions.

## Verification

Automated tests must establish the new structure before implementation and pass afterward. The full existing test suite must continue to pass. Manual browser verification should confirm:

1. All images scroll vertically in the correct order on desktop.
2. Product controls remain visible while the image column moves.
3. The sticky panel releases at the end of the product section.
4. Mobile uses a natural stacked flow with no horizontal overflow.
5. Size selection and add-to-cart still work.
6. Pages with one image and pages with multiple images both render correctly.
7. A missing or empty image list and an individual image-load failure degrade safely.
8. Product information remains reachable when its content is taller than the available viewport.
9. Size controls and add-to-cart remain keyboard reachable with visible focus states.
