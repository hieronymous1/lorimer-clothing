# LORIMER Project File
_Last updated: 2026-04-22_

## 1. Snapshot
- Name: `LORIMER`
- Type: `website`
- Current status: `design-ready, implementation pending`
- Working mode: `recovery-mode`
- Build surface: `site/`
- Owner: not recorded in repo

## 2. Canonical References
- Active front-end surface: `site/index.html`, `site/ss24.html`, `site/shop.html`, `site/product.html`, `site/about.html`
- Active front-end runtime: `site/styles.css`, `site/app.js`, `site/data.js`
- Active image source: `FINAL PICS WEBSITE/`
- Active product-page templates: `swisstransfer_4b3eefb9-eb78-4ac7-aee3-45f88107ae8c/Individual.Product.Page.Template.pdf`, `swisstransfer_4b3eefb9-eb78-4ac7-aee3-45f88107ae8c/Sellabel.Product.Page.Template.pdf`
- Prompt / future-stack brief: `PROMT - LORIMER - WEBSITE.md`
- Rebuild pack: `lorimer-codex-pack/`
- Legacy reference only: `wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/`
- Legacy full brief (pre-reorg): `docs/project/project-legacy-2026-04-05.md`
- External capture screenshots: `references/external-captures/`

## 3. Project Goal
Rebuild the current static site around the new final image set and product-page PDFs so the implementation feels editorial, quiet, and image-led while preserving the existing route architecture.

Success condition:
- the site no longer depends on the older WeTransfer garment-flat runtime paths
- product and S/S24 routes use the new active asset folders
- the visual system feels editorial, quiet, and intentional across desktop and mobile

## 4. Scope
In scope:
- Home
- S/S 24
- Shop
- About
- Global shell, navigation, hero, product grid/cards, product page composition, responsive behavior

Out of scope:
- Checkout/account flows
- CMS/data integration
- Final copy/content approvals
- Deployment strategy changes

## 5. Execution Plan (Use in Order)
Run phases from `lorimer-codex-pack/PHASE_PROMPTS_MASTER.md`:
1. Phase 01: Audit and plan
2. Phase 02: Global system rebuild
3. Phase 03: Navbar rebuild
4. Phase 04: Home hero rebuild
5. Phase 05: Shop architecture rebuild
6. Phase 06: Product card refinement
7. Phase 07: Product page rebuild
8. Phase 08: Responsive pass and QA

Corrective prompts (only if needed):
- `PROMPT_FIX_IF_TOO_CENTERED.md`
- `PROMPT_FIX_RESPONSIVE_IF_BROKEN.md`

## 6. Design and Build Constraints
- Preserve tone: quiet, high-fashion, lightly severe, editorial
- Avoid: Shopify-template feel, centered card-grid feel, loud interactions
- Keep this phase static and dependency-free
- No shadows, no decorative radius, no loud accent colors
- Desktop first, then tablet, then mobile
- Keep asset usage centralized through `site/data.js`

## 7. Current Known Risks
- Layout may regress into max-width centered wrappers
- Navbar optical center may break at tablet widths
- Hero may collapse into a generic split on narrow screens
- Sidebar/grid relationship may drift back to floating centered block
- Placeholder content/assets may distort final visual decisions

## 8. Open Questions
- Final editorial image set for Home and S/S 24
- Product-state behavior for price/availability labels
- Final approved About and footer copy

## 9. Immediate Next Actions
1. Remove junk files from `FINAL PICS WEBSITE/` and keep `.DS_Store` ignored.
2. Verify all active routes render from `FINAL PICS WEBSITE/` and the new PDFs, not the legacy WeTransfer pack.
3. Complete breakpoint QA at `1440, 1280, 1024, 768, 430, 390`.
4. Use this static rebuild as the visual baseline before any future Next.js / commerce migration.

## 10. Condensed Decision Log
- 2026-04-02: Chose recovery mode and Figma-first design path.
- 2026-04-03: Locked severe editorial direction and stricter spacing logic.
- 2026-04-05: Captured live Framer desktop/mobile replicas to Figma for reference.
- 2026-04-22: Standardized implementation workflow around `lorimer-codex-pack` and `PHASE_PROMPTS_MASTER.md`.
