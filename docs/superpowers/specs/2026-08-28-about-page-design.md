# Lorimer About Page Design

## Goal

Build a dedicated About page that faithfully reproduces the supplied `10.png` reference while remaining accessible, responsive, and consistent with the existing Lorimer storefront.

## Page structure

Create `about.html` using the shared five-item storefront navigation and cart drawer. The main page follows the reference in this order:

1. The Brand introduction
2. Two-image editorial row
3. Terms & Conditions and Website Terms of Use
4. Two-image editorial row
5. Deliveries & Shipping
6. Payments
7. Pricing, VAT & Customs
8. Return & Exchange Policy

The legal and service copy will be transcribed from the supplied reference. Email addresses will use `mailto:` links.

## Visual direction

The desktop target is the 1366 × 3840 reference: a white page, compact black typography, a narrow left-aligned content column, large vertical intervals between major groups, and paired landscape photographs. Existing Lorimer typography and navigation remain authoritative for shared chrome. Page-specific CSS will reproduce the reference proportions without introducing cards, decoration, gradients, or unnecessary UI.

The user supplied the exact four photographs. They will be copied into `assets/photos/about/` and placed to match the reference: first row `IMG_7858.JPG` left and `IMG_7679.JPG` right; second row `JAquet.jpg` left and `IMG_6484.JPG` right. Both rows use equal 3:2 landscape frames with `object-fit: cover`; the first three use centered crops and `IMG_6484.JPG` uses a slightly right-biased crop to retain both runway models.

At 1366px, the page uses an approximately 900–910px centered content region, with left and right viewport margins of approximately 228–233px. Prose spans the full content region. Image rows use the same region with a roughly 55px inter-column gap. Major groups use reference-derived vertical spacing rather than generic section padding.

## Responsive behavior

Desktop image rows use two equal columns. At 768px and below, they become a single column in source order with 16px gutters and 16px row gaps; the landscape aspect ratio is retained. Text remains comfortably readable and spacing compresses without changing content order. The existing mobile navigation and cart behavior remain unchanged.

## Integration

All storefront `ABOUT` navigation links, including the homepage reveal link, will point to `about.html`. The About page will reuse shared navigation markup and behavior; its desktop positioning will match the reference. The About link will expose `aria-current="page"` and use the existing visible active-nav treatment. The page will load the existing shared stylesheet and JavaScript needed for animation and cart behavior. The shared footer is omitted because the reference intentionally ends with the Return & Exchange Policy.

## Accessibility and security

Use semantic sections and headings, descriptive image alternative text, a labeled primary navigation, and focusable email links. Existing safe cart storage and external-link protections remain untouched. No remote dependencies or inline third-party scripts will be added. Copy must be manually proofed against `10.png`, preserving heading and paragraph order, country subsections, prices, addresses, capitalization, and punctuation. Unreadable text must be flagged rather than invented.

## Testing and verification

Add a failing page-level test first covering the file, required section order, shared navigation, About link integration, four images in the specified order, contact links, `aria-current`, two-column desktop structure, and one-column mobile behavior. After implementation, run the full Node test suite and verify navigation/cart interactions locally. Capture the page at 1366px wide and compare it with the 1366 × 3840 reference, targeting matching container edges and section starts within roughly 12px while allowing content-driven total-height differences. Capture at 390 × 844 to evaluate readable text, 16px gutters, image order, absence of overflow, keyboard focus, and cart usability; mobile is an adaptation rather than reference parity.
