# Shop and SS24 Sequence Design

**Date:** 2026-08-28  
**Status:** Approved in conversation; pending written-spec review

## Objective

Rebuild the Shop catalog into the supplied 13-row editorial sequence, make every garment link to a product page, mark every garment except the first two as sold out, and correct the SS24 look copy and image mapping.

## Product Availability

Availability is explicit product data.

- `Phyllite Jacket`: available and priced.
- `Lorimer Selvedge Denim`: available and priced.
- Every other garment: sold out.

Available cards show price. Sold-out cards replace the price entirely with `Sold Out`. Sold-out product pages remain accessible and retain their galleries, description, and material details, but display `Sold Out`, disable size controls, and replace/disable Add to Cart.

Availability is never trusted from a card, URL, stale cart line, or caller-supplied object. The cart service resolves the submitted product ID against the canonical `PRODUCTS` catalog and accepts an add or restored line only when that record has `available: true`. Unknown IDs and every record without explicit `available: true` are rejected. Quantity changes revalidate the canonical ID; stale or forged sold-out lines are removed during restore/normalization.

`denim1-wax-jacket` is renamed to Phyllite Jacket. Layered Denim Distressed Jeans remains a separate product. Lorimer Selvedge Denim and Westworld Straight Leg Jeans are added as distinct products using their matching existing assets.

## Exact Shop Sequence

The default All view renders these rows in order:

1. Two-column available row: Phyllite Jacket; Lorimer Selvedge Denim.
2. Two-column 16:9 divider: `still-01`; `still-02`.
3. Three-column products: Deconstructed Bomber Jacket; Zip-Up Utility Vest; Westworld.
4. Three-column products: Layered Distressed Shorts; Layered Distressed Jeans; Westworld Straight Leg Jeans.
5. Three-column products: Reconstructed Button Up Shirt 001; Reconstructed Button Up Shirt 002; Reinforced Pinstripe Trousers.
6. Three-column products: Upcycled Two Piece Suit; Trigall Dress; Overlapped Fray Skirt.
7. Two-column 16:9 divider: `still-03`; `still-04`.
8. SS24 Look 1: Dual Texture Knit Vest; Adjustable Button Trousers; A4 complete-look card linking to `ss24.html#look-1`.
9. SS24 Look 2: University of Lorimer Striped Sweatshirt; Men's Straight Cut Trousers; A4 complete-look card linking to `ss24.html#look-2`.
10. Three-column products with one intentionally unused track: 3D Panel Cropped Bomber Jacket; Denim & Leather Trousers.
11. SS24 Look 4: Asymmetrical White Top; White Layered Texture Skirt; A4 complete-look card linking to `ss24.html#look-4`.
12. SS24 Look 5: 1/3 Zip Up Top; Women's Wide Cut Trousers; A4 complete-look card linking to `ss24.html#look-5`.
13. SS24 Look 6: S/S24 Dress; A4 complete-look card linking to `ss24.html#look-6`; the third track remains unused.

The sequence associates the garment pairs with their supplied product-folder look numbers. Look 3 has no separate complete-look card in the supplied Shop sequence, while the row containing the 3D bomber and denim/leather trousers remains a standard product row.

## Shop Rendering Architecture

`shop.js` uses a declarative `SHOP_ROWS` schema rather than inserting editorial breaks by flat product index. Row types are:

- `products`: two or three product IDs.
- `divider`: two 16:9 local still paths.
- `look`: one or two product IDs plus a look number and representative image.

Every product card is a real link to `product-detail.html?id=<encoded-id>`. DOM text is assigned with `textContent`, paths come only from local allowlisted configuration, and failures render an accessible placeholder without removing the item or changing sequence.

Filters operate on garment cards individually. Outside All, both divider rows and only the A4 `View Look` cards are hidden; matching garment cards inside a look row remain discoverable. Each garment uses its canonical category from the table below. Surviving cards reflow from the start of the row with no preserved blank tracks, rows with no matching garments collapse, and zero total matches show the existing empty state. Returning to All restores the exact original tracks and sequence.

## Shop Layout

- Available row: two equal, spacious columns.
- Standard product row: three equal columns.
- Divider: two equal 16:9 images side by side.
- SS24 row: three equal columns, with the complete-look image at A-series portrait ratio and an underlined `View Look` below it.
- Row spacing remains editorial and flat: no cards, shadows, rounded containers, or gray image gutters.
- At the mobile breakpoint, every row becomes one column and preserves DOM order.
- The existing shared footer remains unchanged.

## SS24 Lookbook

Each look article gets an ID from `look-1` through `look-6`. Its gallery uses the exact ordered image list below, with the first image as the initial frame. No image from `Group` or `reedit` is used. Existing hover, arrow-key, and swipe behavior remains.

Copy is exact, including terminal punctuation:

1. **Look 1:** A contoured seam defines the transition between knit textures as the silhouette adapts form through ferromagnetic articulation.
2. **Look 2:** Panelled construction composes a visual rhythm, bringing contrasting textures into a singular expression.
3. **Look 3:** Faceted engineering introduces a sculptural surface, balanced by a transition between structured and fluid materials.
4. **Look 4:** Curved panel seams define the upper form, giving way to a fluid sense of movement.
5. **Look 5:** Layered surfaces establish a softened sense of continuity, allowing asymmetry to move with cohesion.
6. **Look 6:** An asymmetrical silhouette unfolds from a sculpted foundation, as layered lengths and technical fabrications create a refined balance of structure and movement.

Every `View in Products` link targets the first garment for that look through these exact stable links: Look 1 `shop.html#dual-texture-knit-vest`; Look 2 `shop.html#university-striped-sweatshirt`; Look 3 `shop.html#3d-panel-bomber`; Look 4 `shop.html#asymmetrical-white-top`; Look 5 `shop.html#zip-up-top`; Look 6 `shop.html#ss24-dress`. Reduced-motion and keyboard behavior remain supported.

## Canonical Product and Image Mapping

Paths below are relative to `assets/photos/PRODUCTS/`. Each primary is the Shop card image and first product-gallery image. After the primary, the product gallery includes every other `.jpg`, `.jpeg`, `.JPG`, and `.png` file in that exact source directory in natural filename order, without crossing into another directory. Lorimer Selvedge Denim is the sole one-image gallery and uses the named denim file from the shared DENIM1 source directory; that `DENIM1_SelvedgeDenim.JPG` file is explicitly excluded from the Phyllite Jacket gallery.

| Stable ID | Exact display name | Category | Source directory | Primary filename |
| --- | --- | --- | --- | --- |
| `phyllite-jacket` | Phyllite Jacket | Jackets | `DENIM1 - Lorimer Womens Wax Coated Denim Jacket` | `IMG_9001.JPG` |
| `lorimer-selvedge-denim` | Lorimer Selvedge Denim | Bottoms | `DENIM1 - Lorimer Womens Wax Coated Denim Jacket` | `DENIM1_SelvedgeDenim.JPG` |
| `deconstructed-bomber` | Deconstructed Bomber Jacket | Jackets | `Deconstructesd Bomber Jacket` | `1.png` |
| `zip-up-utility-vest` | Zip-Up Utility Vest | Tops | `Zip Up Utility Vest` | `2.jpg` |
| `westworld-button-up` | Westworld | Tops | `Westworld Short Sleeve Button Up` | `3.jpg` |
| `layered-denim-shorts` | Layered Distressed Shorts | Bottoms | `Layerered Denim Distressed Shorts` | `6.jpg` |
| `layered-denim-jeans` | Layered Distressed Jeans | Bottoms | `Layered Denim Distressed Jeans` | `4.jpg` |
| `westworld-straight-jeans` | Westworld Straight Leg Jeans | Bottoms | `Westworld Straight Leg Jeans` | `7.jpg` |
| `reconstructed-button-up-1` | Reconstructed Button Up Shirt 001 | Tops | `Reconstructed Button Up 1` | `10.jpg` |
| `reconstructed-button-up-2` | Reconstructed Button Up Shirt 002 | Tops | `Reconstructed Button Up 2` | `8.jpg` |
| `reinforced-pinstripe-trousers` | Reinforced Pinstripe Trousers | Bottoms | `Reinforced Pinstripe Trousers` | `12.jpg` |
| `upcycled-two-piece` | Upcycled Two Piece Suit | Accessories | `Upcycled Two Piece Suit` | `15.jpg` |
| `trigall-dress` | Trigall Dress | Accessories | `Trigall Dress` | `13.jpg` |
| `overlapped-fray-skirt` | Overlapped Fray Skirt | Bottoms | `Overlapped Fray Skirt` | `14.jpg` |
| `dual-texture-knit-vest` | Dual Texture Knit Vest | Tops | `Dual Texture Knit Vest - Look 1 Top` | `16.jpg` |
| `adjustable-button-trousers` | Adjustable Button Trousers | Bottoms | `Adjustable Button Trousers - Look 1 Bottoms` | `17.jpg` |
| `university-striped-sweatshirt` | University of Lorimer Striped Sweatshirt | Tops | `University of Lorimer Striped Sweatshirt - Look 2 Top` | `20.jpg` |
| `mens-straight-trousers` | Men's Straight Cut Trousers | Bottoms | `Mens Straight Cut Trousers - Look 2 Bottoms` | `21.jpg` |
| `3d-panel-bomber` | 3D Panel Cropped Bomber Jacket | Jackets | `3D Panel Bomber Jacket - Look 3 Top` | `24.jpg` |
| `denim-leather-trousers` | Denim & Leather Trousers | Bottoms | `Denim and Leather Trousers - Look 3 Bottoms` | `25.jpg` |
| `asymmetrical-white-top` | Asymmetrical White Top | Tops | `Asymmetrical White Top - Look 4 Top` | `22.jpg` |
| `white-layered-skirt` | White Layered Texture Skirt | Bottoms | `White Layered Texture Skirt - Look 4 Bottom` | `23.jpg` |
| `zip-up-top` | 1/3 Zip Up Top | Tops | `1-3 Zip Up Top - Look 5 Top` | `18.jpg` |
| `womens-wide-trousers` | Women's Wide Cut Trousers | Bottoms | `Womens Wide Cut Trousers - Look 5 Bottoms` | `19.jpg` |
| `ss24-dress` | S/S24 Dress | Accessories | `SS24 Dress` | `26.jpg` |

Divider paths are exactly `assets/photos/shop/still-01.jpg`, `still-02.jpg`, `still-03.jpg`, and `still-04.jpg` in numeric order.

## Exact SS24 Gallery Mapping

- Look 1: `37AC10C7-072C-4FFC-B401-D905B2D72774.JPG`, `4197884F-A398-489F-A38B-83309E9FEAA5.JPG`, `BF141E23-9DBC-450C-951F-AC1FD8D1146C.JPG`, `F31E1665-3DFC-4EF1-B8CC-54427B0ADFA8.JPG`.
- Look 2: `1A7930C9-3066-4EFC-AD1A-6E448A42D2E2.JPG`, `31E09BAB-4A75-44B8-BDAC-B016A3CF66CD.JPG`, `8403428D-DC01-46A1-853C-7D60166D441A.JPG`, `BDA200D2-B5C7-4B99-8003-4A85013B0A4A.JPG`, `F43DBA0E-BC89-4914-A404-288B89EE3180.JPG`.
- Look 3: `49BD66C7-B71F-45B1-B6F8-E7E5A514BD73.JPG`, `4ECE6648-F8DA-435E-BAA6-FA621CB57394.JPG`, `98EFEEEB-81CB-483D-B46B-DF35BAC4E4B9.JPG`, `A427E3CA-7230-4A8F-AE90-71AAC3542437.JPG`, `D1BB5258-9956-4261-BCA5-4DFF87465E53.JPG`, `F334098E-160B-4A33-A4F0-EBE8F3B3AE91.JPG`.
- Look 4: `USETHIS.JPG`, `25A4397B-885A-407C-A15C-6F390B3DC31B.JPG`, `7F051453-BD15-45B2-AF28-7B9F0CE2F0C7.JPG`, `E735247D-703B-488D-BAB4-326B5F204D6F.JPG`, `EA79442A-9F44-4909-A205-28A87FF5F4BB.JPG`.
- Look 5: `52E2F432-A737-47D7-B6C2-FFB46E494D6D.JPG`, `8721F093-0F06-4B89-AE82-06EEF950A850.JPG`, `A846329C-82BE-45EB-AB70-FAF2049A4C54.JPG`, `C003E9D6-5130-4A08-AF07-EE68E180C3C5.JPG`, `CAD6E91F-FC9F-4382-9024-10641660FC3C.JPG`.
- Look 6: `2AFEAA6F-061C-44D0-BC05-42F5C8ADED17.JPG`, `6AE70570-6E63-4C9E-800C-793634B07ECC.JPG`.

The Shop A4 complete-look cards use the first configured gallery image for Looks 1, 2, 4, 5, and 6. There is no A4 card for Look 3.

## Error Handling and Accessibility

- Missing product records or configured images produce labeled placeholders and do not reorder siblings.
- Product and look links have useful accessible names derived from visible names.
- Sold-out status is visible text and not color-only.
- Lazy loading is used below the first row; the first row receives high fetch priority.
- Look anchors account for the fixed navigation height with `scroll-margin-top`.
- Empty filter results update the existing polite status region.

## Verification

Automated tests cover:

- Exact 13-row type and product sequence.
- Exactly two available products, their visible prices, and sold-out labels replacing prices everywhere else.
- All 25 unique garment records and product links.
- Disabled size and Add to Cart controls for sold-out products.
- Canonical cart-service rejection of unknown, forged, stale, and sold-out IDs on add, restore, and quantity change.
- Correct packshot and divider paths.
- SS24 look anchors, exact copy, exact ordered files, and no `Group`/`reedit` leakage.
- Exact `View in Products` href for each of Looks 1–6.
- A4 cards only in rows 8, 9, 11, 12, and 13, with exact hrefs and portrait ratios.
- Rows 2 and 7 contain exactly two equal side-by-side stills rendered at 16:9.
- Row 10 track 3 and row 13 track 3 are unused in All; filter reflow, row collapse, empty state, and sequence restoration match the contract above.
- Desktop column contracts, mobile stacking, and unchanged footer.
- Safe DOM rendering and missing-image placeholders.

Browser verification checks the entire Shop and SS24 pages at desktop and mobile widths, every complete-look jump link, sold-out product behavior, and both available product purchase flows.
