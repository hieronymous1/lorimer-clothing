# First Products and SS24 Responsive Layout Design

## Goal

Match the supplied Products and SS24 screenshots as the visual source of truth for the first two product cards and first two SS24 looks. Preserve the references' deliberately asymmetric whitespace and image-to-copy ratios while preventing text or price content from falling outside the viewport.

## Scope

- Products page: the first two cards in the opening product row.
- SS24 page: Look 1 and Look 2 only.
- Desktop, tablet, and mobile responsive behavior for those items.
- Existing data, text, navigation, gallery interaction, product filtering, and later cards/looks remain unchanged.

## Products Composition

At desktop widths, retain the left filter rail and a two-card opening row. The content region should follow the reference proportions: a narrow navigation rail, two equal portrait images, modest gaps between those regions, and a small text block immediately below each image. The image remains the dominant element. The product name and price must both be visible within the first viewport-height composition at the reference desktop ratio.

The opening row receives a viewport-aware maximum width and its images receive a viewport-aware height cap. The existing 3:4 media ratio is preserved; `object-fit: cover` remains unchanged. The price stays in normal document flow below the name and is never clipped by a fixed-height card.

## SS24 Composition

Look 1 and Look 2 retain alternating image/copy placement. The desktop layout follows the supplied SS24 compositions:

- A portrait image occupies roughly one third of the page width.
- The copy occupies the remaining space with generous, intentionally unequal whitespace.
- The heading and description form a compact group near the upper third.
- “View in Products” sits substantially lower, near the lower third.
- Reversed looks mirror the image/copy relationship rather than centering all content uniformly.

The image remains 2:3 and is bounded by the available viewport height beneath the navigation. Copy height and vertical padding derive from the same bounded composition height so the text and link stay aligned to the image rather than a hard-coded 700px column.

## Responsive Behavior

At tablet widths, both compositions retain their desktop relationships but reduce side margins, column gaps, and maximum image sizes fluidly. No horizontal overflow is allowed.

At mobile widths, each targeted item becomes a single column:

1. image;
2. name/heading and descriptive text;
3. price or “View in Products” link.

The product image is capped against the usable viewport height so the image, name, and price form one visible card composition. SS24 images retain their 2:3 ratio, while copy follows beneath with reference-informed unequal gaps: the heading/description remain grouped and the link remains more separated, without forcing equal spacing.

## Implementation Boundaries

Prefer scoped CSS selectors (`.shop-row:first-child` and the first two look IDs) and existing markup. Add a small semantic class or custom property only if selector-based styling becomes brittle. Do not rebuild the catalog or gallery JavaScript and do not change product or look content.

## Verification

- Compare the desktop Products opening row with `Products_Page_Composition.png`.
- Compare alternating SS24 placement with `SS24VisualReference1.png` and `SS24VisualReference2.png`.
- Test representative desktop, tablet, and mobile widths.
- Confirm the first two product prices are visible, cards do not overflow horizontally, and mobile order is image then text then price/link.
- Run the existing shop and SS24 tests, adding focused regression assertions for the new scoped responsive rules where practical.

