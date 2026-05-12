# Recreation Audit
_Date: 2026-04-01_

## Scope
Audit the current recreation baseline using the sources that actually exist in this workspace:
- live Framer site: `https://full-point-623707.framer.app`
- `S/S 24` route: `https://full-point-623707.framer.app/ss24`
- reference PDF: `wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/Website.Template.V2.pdf`
- local asset folder: `wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/`

## Local Baseline Reality
- The repo currently contains assets and `project.md`, but no implementation files or local Framer export.
- `project.md` references `docs/superpowers/specs/...` and `docs/superpowers/plans/...`, but those files do not exist in this workspace.
- This means the live Framer site and the PDF are the real source of truth for the recreation phase.

## High-Priority Findings
1. The live site still contains obvious placeholder and joke content on `S/S 24`.
   Evidence:
   - Looks 1 to 6 all use placeholder editorial descriptions.
   - Current live copy includes: `If Benjamin Netanyahu was a rapper his rap name would be Nettspend`.
   - The PDF uses filler copy too, but the live site has a more visibly incorrect placeholder state.

2. The `ABOUT` path is not live.
   Evidence:
   - `https://full-point-623707.framer.app/about` returns `404`.
   - The `S/S 24` nav shows `ABOUT` as text, but in the live HTML it is not rendered as a navigable link.

3. The live site is still using default Framer metadata.
   Evidence:
   - `<title>My Framer Site</title>`
   - description content is `Made with Framer`
   - default Framer badge is present on the live site

4. `S/S 24` includes unfinished CTA/link states.
   Evidence:
   - `View in Products` is rendered as text within an anchor tag with no destination on the live page.
   - This is not ready to treat as final behavior in recreation.

5. The footer has unfinished states in the live baseline.
   Evidence:
   - Mobile/footer variants expose `[FOOTER]` placeholder text in the live HTML.
   - Footer behavior should be treated as incomplete baseline material, not approved final design.

## S/S 24 Baseline Structure
The current live `S/S 24` route appears to be structured as:
- fixed top navigation with `HOME`, `S/S_24`, `SHOP`, logo, `ABOUT`
- sequence of 6 look rows
- each row includes:
  - look label
  - editorial description block
  - `View in Products` CTA text
  - one portrait image
- final lineup/group image
- date marker: `9.5.2024`
- footer area

## PDF Reference Structure
The PDF indicates two relevant baselines:
- product/shop-style layouts with categories:
  - `Men`
  - `Women`
  - `S/S 24'`
  - `Tops`
  - `Bottoms`
  - `Accessories`
- `S/S 24` look sequence with 6 looks plus a dress mention and a `Thank you to everyone involved :)` closing note

The PDF uses filler text for look descriptions, so it should be treated as layout/reference guidance, not final copy.

## Asset Observations
- Local garment flat assets exist and are usable for product/shop recreation.
- The local workspace does not appear to include the live editorial images used on the `S/S 24` page.
- This means the recreation pass needs a clear placeholder/swap strategy for editorial photography unless those source images are pulled from Framer or provided separately.

## Recreation Priorities
1. Recreate the `S/S 24` route first as the baseline review surface.
2. Match layout, row ordering, typography scale, spacing, and image proportions before changing design.
3. Preserve unfinished/live baseline issues in notes, but do not treat them as approved content.
4. Mark these as explicit placeholder states during recreation:
   - all look descriptions
   - `View in Products` destinations
   - `ABOUT` route behavior
   - footer content/state
5. Treat home/shop/about as secondary until `S/S 24` is stable enough for side-by-side comparison.

## Immediate Recreation Checklist
- [ ] Capture the exact `S/S 24` information architecture from the live route
- [ ] Rebuild the top nav structure and current route state
- [ ] Rebuild all 6 look rows in the same sequence
- [ ] Preserve the alternating row rhythm used on desktop/mobile
- [ ] Add explicit placeholder labels for editorial descriptions
- [ ] Add explicit placeholder handling for `View in Products`
- [ ] Recreate the lineup image block and `9.5.2024` date placement
- [ ] Recreate footer layout, but mark unfinished footer states as baseline placeholders
- [ ] Create a mismatch list for anything that differs from the PDF or appears unfinished in the live site

## Open Questions To Resolve Before Design Review
- What should replace the current look-description placeholder copy?
- Should `View in Products` link to product groupings, filtered shop states, or individual product entries?
- Is `ABOUT` meant to be a real page, an overlay, or intentionally inactive for now?
- Should the footer exist in collapsed and expanded variants, or is the current live behavior temporary?
- Where do the approved editorial images for `S/S 24` actually live?

## Audit Conclusion
The current recreation phase should not be framed as rebuilding a polished approved site. It should be framed as rebuilding an unfinished but structurally usable baseline from the live Framer build and the PDF, while explicitly quarantining placeholder content, broken route states, and unfinished footer/CTA behavior for the design-change pass.
