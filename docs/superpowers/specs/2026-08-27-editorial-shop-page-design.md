# Editorial Shop Page Design

## Goal

Rebuild the Lorimer Shop page to match the supplied `Website Template Products NEW.png` composition. The page becomes a long editorial catalog: products appear in deliberate chapters, campaign stills interrupt the retail grid, and generous white space controls the rhythm.

The existing product records remain the source of truth for names, prices, categories, links, and purchasable items. Existing local photography supplies all media; no generated or external images are introduced.

## Catalog sequence

The unfiltered Shop page follows this order:

1. Featured denim pair: Layered Denim Distressed Jeans; Lorimer Women's Wax Coated Denim Jacket.
2. Detail strips for those two featured products.
3. Two horizontal campaign stills.
4. An uncaptioned, linked garment row: Deconstructed Bomber Jacket; Zip Up Utility Vest; Westworld Short Sleeve Button Up.
5. A larger captioned treatment of the same jackets and tops trio.
6. Bottoms: Layered Denim Distressed Shorts; Layered Denim Distressed Jeans; Men's Straight Cut Trousers.
7. Tailoring: Reconstructed Button Up Shirt 001; Reconstructed Button Up Shirt 002; Reinforced Pinstripe Trousers.
8. Statement pieces: Upcycled Two Piece Suit; Trigall Dress; Overlapped Fray Skirt.
9. A sparse detail/caption strip repeating the statement-piece trio, as shown in the reference.
10. Two horizontal campaign stills.
11. Look group: Dual Texture Knit Vest; Adjustable Button Trousers; one vertical campaign still.
12. Collegiate group: University of Lorimer Striped Sweatshirt; Men's Straight Cut Trousers; one vertical campaign still.
13. Panel group: 3D Panel Bomber Jacket; Denim and Leather Trousers; one vertical campaign still.
14. Light group: Asymmetrical White Top; White Layered Texture Skirt; one vertical campaign still.
15. Utility group: 1/3 Zip Up Top; Women's Wide Cut Trousers; one vertical campaign still.
16. Closing group: SS24 Dress; one vertical campaign still.

Products repeated by the reference may appear more than once in the editorial sequence but always link to the same product record. Product data order in `products-data.js` is not mutated; the Shop renderer owns this presentation order.

## Chapter layout

Each indexed chapter is a self-contained section with a compact Lorimer index at the left and media at the right. The reference shows a six-label editorial index that includes audience groupings unavailable in the current product model. The implementation therefore intentionally retains the catalog's five supported controls — All, Jackets, Tops, Bottoms, Accessories — while matching the reference's typography, position, and repetition. All is the explicit full/unfiltered state.

The first chapter uses two tall portrait product cards. Its detail-strip row reuses those featured files as alternate shallow horizontal crops. Subsequent product chapters use three visual columns, even when a column is a campaign still rather than a product.

Product images use transparent or neutral-background garment photography where the matching files exist. The renderer permits an explicit image override per catalog slot, so the Shop can follow the reference without changing product-detail galleries.

Product cards display the product name only, matching the reference; prices remain in product data and on detail pages but are not shown in this editorial index. The first uncaptioned garment row consists of real product links with accessible names but no visible names or prices.

The implementation uses this slot-to-file map:

| Slot | File | Treatment |
| --- | --- | --- |
| Featured jeans | `PRODUCTS/Layered Denim Distressed Jeans/IMG_7844.JPG` | portrait, intrinsic ratio |
| Featured wax jacket | `PRODUCTS/DENIM1 - Lorimer Womens Wax Coated Denim Jacket/IMG_9001.JPG` | portrait, intrinsic ratio |
| Featured detail strips | the same two files | `5 / 1` crop, bottom-centered |
| First still pair | `shop/still-01.png`; `shop/still-02.png` | supplied Still1/Still2 images, `3 / 2`, cover |
| Small garment trio | `Deconstructesd Bomber Jacket/4.png`; `Zip Up Utility Vest/2.jpg`; `Westworld Short Sleeve Button Up/3.jpg` | `4 / 3`, contain |
| Large garment trio | `Deconstructesd Bomber Jacket/1.png`; `Zip Up Utility Vest/2.jpg`; `Westworld Short Sleeve Button Up/8.png` | intrinsic portrait, contain |
| Bottoms | `Layerered Denim Distressed Shorts/6.jpg`; `Layered Denim Distressed Jeans/4.jpg`; `Mens Straight Cut Trousers - Look 2 Bottoms/21.jpg` | `4 / 5`, contain |
| Tailoring | `Reconstructed Button Up 1/11.jpg`; `Reconstructed Button Up 2/8.jpg`; `Reinforced Pinstripe Trousers/12.jpg` | `4 / 5`, contain |
| Statement pieces | `Upcycled Two Piece Suit/15.jpg`; `Trigall Dress/13.jpg`; `Overlapped Fray Skirt/9.png` | `4 / 5`, contain |
| Statement detail strip | same three statement files | `5 / 1`, center crop |
| Second still pair | `extras/IMG_7590.JPG`; `extras/IMG_3005.jpeg` | `3 / 2`, cover |
| Look-group still | `extras/IMG_4658.JPG` | `3 / 4`, cover |
| Collegiate still | `extras/14.png` | `3 / 4`, cover |
| Panel still | `extras/784A57B3-FADB-4C29-94E6-3EC4E403D90B.JPG` | `3 / 4`, cover |
| Light-group still | `extras/13.png` | `3 / 4`, cover |
| Utility still | `extras/IMG_3040.jpeg` | `3 / 4`, cover |
| Closing still | `extras/23.png` | `3 / 4`, cover |

The remaining product images in the final six groups — Look, Collegiate, Panel, Light, Utility, and Closing — use the first matching product image in `products-data.js`, except for the mapped campaign-still column.

Campaign stills are decorative editorial interruptions: they are not links and use empty alternative text. Product photography remains meaningful and uses the associated product name as alternative text.

No cards, shadows, rounded corners, gradients, or animated scroll effects are added. White space, image scale, and alignment supply the visual hierarchy.

## Filtering

The All state renders the full editorial composition. Selecting a category hides campaign-only chapters and any product slots outside that category. Empty chapters disappear completely. Chapters containing matching products retain their index and collapse to the available product count without blank columns.

The active filter is synchronized across every repeated index. Each control set has `role="group"` and an accessible “Filter products” label; every button exposes `aria-pressed`, and clicking any copy updates the semantic and visual state of all matching buttons. A polite live region announces the visible unique-product count. Filtering uses the `hidden` attribute so removed chapters, product links, and stills cannot retain keyboard focus. Filtering never changes the canonical order of remaining products.

## Responsive behavior

Desktop follows the wide reference: narrow index column, flexible media area, deliberate large vertical chapter gaps, two-column featured content, and three-column product groups.

At the existing 768px breakpoint:

- Each chapter becomes a single-column flow.
- The repeated index becomes a compact horizontal filter row above its media.
- Product and still slots display one per row in source order.
- Detail strips remain shallow, full-width crops.
- Spacing is reduced while retaining visible separation between chapters.
- All controls meet the existing 44px touch-target convention and show visible keyboard focus.

## Rendering, security, and accessibility

The Shop renderer constructs links, images, labels, and filters with DOM APIs and `textContent`; it does not interpolate product data through `innerHTML` or inline event handlers. Product IDs and category names come only from the local catalog and are encoded when placed in URLs.

Every product image uses the product name as its alternative text. Campaign stills are decorative editorial interruptions and consistently use empty alternative text. Missing product images render an accessible neutral placeholder. Later images use native lazy loading and asynchronous decoding; the first featured image loads eagerly.

## Files and responsibilities

- `shop.html`: replace the single sidebar/grid shell with the editorial catalog root.
- `js/shop.js`: define the presentation sequence, render chapters safely, and coordinate repeated filters.
- `css/styles.css`: implement editorial chapters, image variants, responsive stacking, and focus states.
- `tests/shop-editorial.test.js`: protect sequence, still-photo interruptions, safe rendering, synchronized filters, and responsive rules.

## Verification

Automated tests must fail before implementation and pass afterward. The existing suite must be run for regressions. Browser verification must confirm:

1. The All state follows the reference order from the denim pair through the SS24 dress.
2. Campaign stills visibly interrupt product groups.
3. Product cards link to the correct detail records.
4. Filters work from any repeated index, synchronize their active state, remove unrelated stills, and leave no empty chapters.
5. Desktop maintains the intended two- and three-column compositions.
6. Mobile preserves order without horizontal overflow.
7. Missing images degrade safely, keyboard focus remains visible, and the console has no new errors.
