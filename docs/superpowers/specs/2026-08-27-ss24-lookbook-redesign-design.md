# SS24 Lookbook Redesign

## Goal

Redesign `ss24.html` to faithfully reproduce the seventh PNG (`7.png`) from `WEB Temp 2.0.zip`. The PNG is the source of truth for the page's navigation labels, lookbook copy, imagery, composition, date, and footer content.

## Visual Direction

The page is a restrained editorial lookbook on an off-white background. At desktop widths it uses:

- A slim five-point header with the SS24 label, Products, centered Lorimer wordmark, About, and Cart.
- Six vertically spaced looks in an alternating image-and-copy composition.
- Small serif and monospaced typography with generous whitespace.
- The exact look titles, descriptions, product-link wording, date, and footer copy visible in `7.png`.
- The corresponding supplied photographs in the same look order and visual crops.
- A centered closing group image followed by the date and a split footer.

The implementation should match the reference through proportion, spacing, typography, and image rhythm rather than through a fixed-width screenshot canvas.

## Page Structure

Only the existing shared navigation and cart behavior remains functional. The labels, ordering, and visual layout in `7.png` override the current navigation and footer markup. SS24-specific layout rules are isolated to the lookbook page. `PRODUCTS` and every `View in Products` link point to `shop.html`; the cart control keeps the existing drawer trigger and displays no count when the cart is empty.

Each look is a self-contained editorial unit with:

1. A numbered title.
2. An exact transcription of the description in `7.png`.
3. A `View in Products` link.
4. The corresponding image and useful alternative text.

The six units alternate image and copy positions on desktop. The closing group image and date form a separate end matter section above the footer.

## Authoritative Copy

| Location | Exact text |
| --- | --- |
| Navigation | `S/S24`, `PRODUCTS`, `LORIMER®`, `ABOUT`, `CART` |
| Look 1 title | `Look 1` |
| Look 1 description | `A contoured seam defines the transition between knit textures as the silhouette adapts form through ferromagnetic articulation` |
| Look 2 title | `Look 2` |
| Look 2 description | `Panelled construction composes a visual rhythm, bringing contrasting textures into a singular expression` |
| Look 3 title | `Look 3` |
| Look 3 description | `Faceted engineering introduces a sculptural surface, balanced by a transition between structured and fluid materials` |
| Look 4 title | `Look 4` |
| Look 4 description | `Layered surfaces establish a softened sense of continuity, allowing asymmetry to move with cohesion.` |
| Look 5 title | `Look 5` |
| Look 5 description | `Curved panel seams define the upper form, giving way to a fluid sense of movement` |
| Look 6 title | `Look 6` |
| Look 6 description | `A sculpted composition emerges within a form-fitting foundation, converging a structural language into a singular expression.` |
| Repeated link label | `View in Products` |
| Date | `9.5.2024` |
| Footer left | `ABOUT`, `© Lorimer 2026`, `Helsinki, 00750` |
| Footer right | `NEWSLETTER`, `contact@lorimer.com`, `@Lorimer.Clo` |

The parenthetical text near Look 1 in the PNG—`(Slideshow arrow to show click/swipe though pictures)`—is a design annotation, not page copy, and must not render on the finished page.

## Image Galleries

Each look is a local, progressively enhanced gallery. The initial image is the filename already used in `ss24.html`, matching the screenshot. The exact gallery order is:

- Look 1: `37AC10C7-072C-4FFC-B401-D905B2D72774.JPG`, `4197884F-A398-489F-A38B-83309E9FEAA5.JPG`, `BF141E23-9DBC-450C-951F-AC1FD8D1146C.JPG`, `F31E1665-3DFC-4EF1-B8CC-54427B0ADFA8.JPG`.
- Look 2: `1A7930C9-3066-4EFC-AD1A-6E448A42D2E2.JPG`, `31E09BAB-4A75-44B8-BDAC-B016A3CF66CD.JPG`, `8403428D-DC01-46A1-853C-7D60166D441A.JPG`, `BDA200D2-B5C7-4B99-8003-4A85013B0A4A.JPG`, `F43DBA0E-BC89-4914-A404-288B89EE3180.JPG`.
- Look 3: `49BD66C7-B71F-45B1-B6F8-E7E5A514BD73.JPG`, `4ECE6648-F8DA-435E-BAA6-FA621CB57394.JPG`, `98EFEEEB-81CB-483D-B46B-DF35BAC4E4B9.JPG`, `A427E3CA-7230-4A8F-AE90-71AAC3542437.JPG`, `D1BB5258-9956-4261-BCA5-4DFF87465E53.JPG`, `F334098E-160B-4A33-A4F0-EBE8F3B3AE91.JPG`.
- Look 4: `USETHIS.JPG`, `25A4397B-885A-407C-A15C-6F390B3DC31B.JPG`, `7F051453-BD15-45B2-AF28-7B9F0CE2F0C7.JPG`, `E735247D-703B-488D-BAB4-326B5F204D6F.JPG`, `EA79442A-9F44-4909-A205-28A87FF5F4BB.JPG`.
- Look 5: `52E2F432-A737-47D7-B6C2-FFB46E494D6D.JPG`, `8721F093-0F06-4B89-AE82-06EEF950A850.JPG`, `A846329C-82BE-45EB-AB70-FAF2049A4C54.JPG`, `C003E9D6-5130-4A08-AF07-EE68E180C3C5.JPG`, `CAD6E91F-FC9F-4382-9024-10641660FC3C.JPG`.
- Look 6: `2AFEAA6F-061C-44D0-BC05-42F5C8ADED17.JPG`, `6AE70570-6E63-4C9E-800C-793634B07ECC.JPG`.

The group end matter uses `assets/ss24/9.5.2024.JPG`, which matches the composited group image in the reference; the separate `Group/` photographs are not part of this page.

| Look | Initial image | Gallery size |
| --- | --- | --- |
| 1 | `assets/ss24/Look 1/37AC10C7-072C-4FFC-B401-D905B2D72774.JPG` | 4 |
| 2 | `assets/ss24/Look 2/1A7930C9-3066-4EFC-AD1A-6E448A42D2E2.JPG` | 5 |
| 3 | `assets/ss24/Look 3/49BD66C7-B71F-45B1-B6F8-E7E5A514BD73.JPG` | 6 |
| 4 | `assets/ss24/Look 4/USETHIS.JPG` | 5 |
| 5 | `assets/ss24/Look 5/52E2F432-A737-47D7-B6C2-FFB46E494D6D.JPG` | 5 |
| 6 | `assets/ss24/Look 6/2AFEAA6F-061C-44D0-BC05-42F5C8ADED17.JPG` | 2 |

All look images use a `2:3` portrait aspect ratio, `object-fit: cover`, and centered focal positioning. The group image uses its natural `3:2` ratio. Each gallery has one small, semi-transparent, square next button centered on the image's right edge, matching `7.png`; it remains in the same relative position at every breakpoint. Clicking or activating it with Enter/Space advances and wraps from the final image to the first. Left/right arrow keys while focused within a gallery and horizontal touch swipe allow movement in both directions and wrap at both ends. Active-image alt text follows `Model wearing Lorimer SS24 Look N, image X of Y`; the group image uses `Models wearing the Lorimer SS24 collection`. Without JavaScript, the screenshot-matching initial image and its alt text remain visible and the next button is hidden. This local carousel state is allowed; no shared, remote, or persistent application state is introduced.

## Responsive Behavior

- Desktop preserves the alternating reference composition and large vertical intervals.
- At 768 CSS pixels, margins, gaps, and image dimensions reduce proportionally without changing the reading order.
- At 390 CSS pixels, every look uses one column: image first, then title, description, and link.
- Navigation must remain usable without clipping or horizontal overflow.
- Images use intentional aspect ratios and `object-fit: cover` to preserve the reference crops.

## Interaction and Accessibility

- Product and navigation links receive restrained hover feedback and visible keyboard focus.
- The existing cart trigger remains wired to the site's cart behavior.
- Content is present in the HTML and remains usable if JavaScript fails.
- Existing reveal effects may be retained only when they do not hide content permanently.
- Reduced-motion preferences disable nonessential animation.
- Images have concise, meaningful alt text.

## Scope Boundaries

- Redesign only the SS24/lookbook page and the styles or tests required for it.
- Do not redesign other storefront pages.
- Do not introduce shared or persistent application state, API calls, or dependencies. Local per-gallery index state is permitted.
- Do not reuse the placeholder descriptions currently in `ss24.html`.

## Verification

Verification must cover:

- Exact transcription and ordering of all user-visible text from `7.png`.
- Correct ordering and alternating placement of all six look images.
- Every gallery's complete ordered asset list and count, next-button wrapping, bidirectional keyboard and swipe navigation, updated subject-and-position alt text, and no-JavaScript initial-image fallback.
- Desktop visual comparison against `7.png` at 1366 CSS pixels wide.
- Tablet verification at 768 CSS pixels and mobile verification at 390 CSS pixels, with no overlap or horizontal scrolling and image-first reading order on mobile.
- Working navigation, product links, cart trigger, keyboard focus, and reduced-motion behavior.
- Passing existing storefront tests plus focused SS24 structural tests added before implementation.

## Security Notes

The page remains static and renders only repository-controlled content. It must not use unsafe HTML insertion, dynamic script construction, or untrusted URL interpolation.
