# Home, SS24, and Products Editorial Pass Design

**Date:** 2026-09-01  
**Status:** Approved in conversation; pending written-spec review

## Goal

Apply the supplied merchandising, image, and spacing corrections without redesigning Lorimer's established editorial system. The pass covers the homepage, SS24 lookbook, and Products catalog, preserves responsive behavior and accessibility, and keeps unrelated local work intact.

## Homepage

- Replace the opening denim cover with `assets/photos/PRODUCTS/Lorimer Selvedge Denim Black - Photoshoot/IMG_3161.jpg`, the canonical primary image for the black variant, and link it to `product-detail.html?id=lorimer-selvedge-denim-black`.
- Replace the Westworld Shirt preview tile with Reinforced Pinstripe Trousers while retaining the rest of the preview composition.
- Replace the SS24 group slideshow with this exact six-frame sequence: `DSC04197.jpg`, `DSC04200.jpg`, `addition.jpg`, `IMG_6295.jpg`, `DSC_0409.jpg`, `addition4.jpg`.
- Make the slideshow itself a semantic link to `ss24.html`. Existing gallery arrows must keep changing slides rather than activating navigation; keyboard users must retain both gallery navigation and an understandable route into SS24.

## SS24 Lookbook

- Preserve the alternating left/right editorial composition and existing typography.
- On image-left sections, reduce the image-to-copy gap and align “View in Products” consistently with the description column.
- On image-right sections, reduce the copy-to-image gap by the same visual measure so alternating rows feel related rather than independently spaced.
- Replace the current desktop gap of `clamp(47px, 5.3vw, 113px)` with a shared target of `clamp(32px, 3.2vw, 64px)` and use `clamp(28px, 6vw, 48px)` at tablet widths. Both orientations use the same token; mobile remains gapless between grid tracks.
- Align every product link to the description's inline-start edge and preserve the current bottom-padding baseline. At each desktop row, the image and copy composition retain a shared height; links therefore land on one consistent lower baseline across alternating rows.
- Use `addition4.jpg` as the new final full-width SS24 image.
- Keep the current mobile image-first stack, touch navigation, arrow-key navigation, visible focus, and reduced-motion behavior.

Spacing changes should use the current layout variables and selectors where possible. They must be fluid at desktop and tablet widths and should not introduce one-off margins that break alternating symmetry.

## Products Catalog

- Keep Lorimer Selvedge Denim in its present first-row position and move Phyllite Jacket closer by replacing the first-row desktop gap `clamp(32px, 8.5vw, 176px)` with `clamp(24px, 4vw, 64px)`. At mobile widths the cards keep their existing one-column stack and 56px vertical gap.
- Place Westworld Shirt (`westworld-button-up`) in the first standard three-product row, after Zip Up Utility Vest.
- Ensure every SS24 garment card has a valid primary image. The affected lower rows use these primaries: `university-striped-sweatshirt/20.jpg`, `mens-straight-trousers/21.jpg`, `distressed-lorimer-cap/1.png`, `3d-panel-bomber/24.jpg`, `denim-leather-trousers/25.jpg`, `asymmetrical-white-top/22.jpg`, `white-layered-skirt/23.jpg`, `ss24-dress/26.jpg`, `zip-up-top/18.jpg`, and `womens-wide-trousers/19.jpg`.
- Add the supplied `IMG_3737.jpg` as the second Zip Up Utility Vest gallery image. Retain `2.jpg` as its card cover and gallery primary.
- Correct secondary image arrays for the bottom four catalog rows. In order after each primary, the deterministic filename mappings are:
  - University sweatshirt: `3_VSCO.JPG`, `EditTest.jpg`, `DSC04153.jpg`, `76F2B413-5A03-475A-A578-184DE63203E9.JPG`; men's trousers: no secondary; cap: no secondary.
  - 3D bomber: `IMG_6298.jpg`, `2_VSCO 3.JPG`, `DSC04180.jpg`, `4AA042A9-08D3-488A-A147-C9A6784B1D37.JPG`; denim/leather trousers: no secondary.
  - Asymmetrical top: `18.png`, `IMG_0686_VSCO.JPG`, `IMG_0655_VSCO.JPG`, `EE2693BD-823D-43C5-8FB6-F2620A8E827B.JPG`; white skirt: `Skirtt.png`; SS24 dress: `IMG_0742_VSCO.JPG`, `942E4476-5B3C-45E8-8140-BD56FB69AC83.JPG`.
  - 1/3 Zip Up Top: `2_VSCO 5.JPG`, `IMG_0584_VSCO.JPG`, `6CB18551-BC69-437A-A16D-4DE974995852.JPG`; women's trousers: `16.png`.

Where an editorial re-edit is listed above, it may come from the corresponding `assets/ss24-reedit/Look N` directory; every other image stays within its matching product directory. Images must never cross between garments.

The catalog's declarative row architecture, filters, availability rules, product IDs, and detail-page URLs remain unchanged except where ordering or image data must change to satisfy the request.

## Accessibility and Failure Behavior

- The clickable homepage slideshow receives a useful accessible label and visible keyboard focus.
- Gallery navigation controls stop click propagation so arrow use never unexpectedly follows the slideshow link.
- All configured local images receive descriptive alt text through the existing rendering system.
- A missing product or image continues to use the existing fallback behavior without reordering adjacent products.

## Verification

- Add or update focused tests for the homepage denim cover, preview replacement, exact slideshow order, slideshow link, SS24 final image, catalog row order, Zip Up Utility Vest gallery, and bottom-row secondary mappings.
- Run the full automated test suite.
- Check desktop and mobile layouts for the homepage, SS24, and Products pages, including focus and click behavior.
- Run the project-aware UI review on changed files and apply only safe corrections.
- Commit only the authorized storefront changes without absorbing unrelated generated directories. The user separately authorized pushing the completed branch.
