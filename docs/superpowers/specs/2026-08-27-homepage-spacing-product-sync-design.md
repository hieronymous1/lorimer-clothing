# Homepage Spacing and Product Sync Design

## Scope

Refine the homepage below the hero while preserving its current typography, hover treatment, card styling, navigation, and footer.

## Vertical Rhythm

- Introduce one responsive homepage section-gap token and use it between the featured two-card section, the six-product grid, and the SS24 preview.
- Match the generous whitespace shown in the supplied ideal-spacing screenshots without allowing adjacent sections to overlap.
- Keep content inside each section naturally sized rather than clipping it with a smaller containing box.
- Reduce the gap proportionally on narrow screens while retaining clear separation.

## Six-Product Grid

Replace the six editorial/look cards with these Shop products, in the order established by the supplied product-template PNG:

1. Lorimer Selvedge Denim Jeans
2. Waxed Cropped Denim Jacket
3. Deconstructed Bomber Jacket
4. Zip-Up Utility Vest
5. Westworld Short Sleeve Button Up
6. Layered Denim Distressed Shorts

Each card must use the matching product image already used by the Shop catalog, the Shop product name, and the correct product-detail URL. Preserve the existing charcoal hover overlay and underlined `View in products` action.

## Removed Element

- Remove the standalone `View all products` row and its horizontal rules entirely.
- Do not leave an empty spacer or border where the row was.

## SS24 Preview

- Keep the current three-part preview content: runway image, Spring/Summer copy, and underlined SS24 link.
- Replace the image with `assets/ss24/Group/F10E840B-0A75-47F7-A778-7E4FCB3E7413.JPG`, matching the supplied reference.
- Center the image, copy, and link together as one compact composition inside the section rather than spreading the link to the viewport edge.
- Use meaningful alt text describing Lorimer models walking the Spring/Summer 2024 runway.

## Verification

- Automated checks verify the six IDs, names, image sources, and order against the Shop catalog.
- Automated checks confirm `product-preview__all` and `View all products` are absent.
- Automated checks verify the corrected SS24 image path and shared spacing token.
- Browser checks at desktop and mobile widths verify consistent inter-section spacing, centered SS24 content, no overlap, and no horizontal overflow.
