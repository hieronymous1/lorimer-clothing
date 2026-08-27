# Homepage Spacing and Product Sync Design

## Scope

Refine the homepage below the hero while preserving its current typography, hover treatment, card styling, navigation, and footer.

## Vertical Rhythm

- Introduce `--home-section-gap: clamp(180px, 45svh, 480px)` and use it between the bottom of the featured two-card section and the top of the six-product grid, and between the bottom of the six-product grid and the top of the SS24 preview. This matches the large hero-to-featured rhythm in the approved reference while remaining bounded on short screens.
- Match the generous whitespace shown in the supplied ideal-spacing screenshots without allowing adjacent sections to overlap.
- Keep content inside each section naturally sized rather than clipping it with a smaller containing box.
- Reduce the gap proportionally on narrow screens while retaining clear separation.

## Six-Product Grid

Replace the six editorial/look cards with the PNG products mapped to the existing Shop catalog records. The live catalog's exact IDs and names remain the source of truth:

| Order | Catalog ID | Exact display name | Catalog image | Detail URL |
| --- | --- | --- | --- | --- |
| 1 | `layered-denim-jeans` | Layered Denim Distressed Jeans | `assets/photos/PRODUCTS/Layered Denim Distressed Jeans/IMG_7844.JPG` | `product-detail.html?id=layered-denim-jeans` |
| 2 | `denim1-wax-jacket` | Lorimer Women's Wax Coated Denim Jacket | `assets/photos/PRODUCTS/DENIM1 - Lorimer Womens Wax Coated Denim Jacket/IMG_9001.JPG` | `product-detail.html?id=denim1-wax-jacket` |
| 3 | `deconstructed-bomber` | Deconstructed Bomber Jacket | `assets/photos/PRODUCTS/Deconstructesd Bomber Jacket/1.png` | `product-detail.html?id=deconstructed-bomber` |
| 4 | `zip-up-utility-vest` | Zip Up Utility Vest | `assets/photos/PRODUCTS/Zip Up Utility Vest/2.jpg` | `product-detail.html?id=zip-up-utility-vest` |
| 5 | `westworld-button-up` | Westworld Short Sleeve Button Up | `assets/photos/PRODUCTS/Westworld Short Sleeve Button Up/IMG_2947.jpeg` | `product-detail.html?id=westworld-button-up` |
| 6 | `layered-denim-shorts` | Layered Denim Distressed Shorts | `assets/photos/PRODUCTS/Layerered Denim Distressed Shorts/IMG_7641.JPG` | `product-detail.html?id=layered-denim-shorts` |

The PNG labels “Lorimer Selvedge Denim Jeans” and “Waxed Cropped Denim Jacket” map to the existing `layered-denim-jeans` and `denim1-wax-jacket` catalog records; no duplicate records are added. Each card uses meaningful alt text naming the product. Preserve the charcoal overlay and underlined `View in products` action on both pointer hover and keyboard focus.

## Removed Element

- Remove the standalone `View all products` row and its horizontal rules entirely.
- Do not leave an empty spacer, border, or margin belonging to the removed row.

## SS24 Preview

- Keep the current three-part preview content: runway image, Spring/Summer copy, and underlined SS24 link.
- Replace the image with `assets/ss24/Group/F10E840B-0A75-47F7-A778-7E4FCB3E7413.JPG`, matching the supplied reference.
- Center the image, copy, and link together as one compact composition inside the section rather than spreading the link to the viewport edge.
- Use meaningful alt text describing Lorimer models walking the Spring/Summer 2024 runway.

## Verification

- Automated checks verify the six IDs, exact names, image sources, and order against the Shop catalog.
- Automated checks confirm `product-preview__all` and `View all products` are absent.
- Automated checks verify meaningful product alt text, focus-visible overlay behavior, the corrected SS24 image path, and the exact shared spacing token.
- Browser checks at desktop and mobile widths verify both defined section boundaries use the computed token value (within 1px), there is no leftover spacer after row removal, the SS24 content is centered, and there is no overlap or horizontal overflow.
