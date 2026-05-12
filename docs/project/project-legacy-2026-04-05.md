# LORIMER
_Last updated: 2026-04-05_

## Project Snapshot
- Name: LORIMER
- Type: `website`
- Status: `design`
- Mode: `recovery-mode`
- Template depth: `lean`
- Owner: not recorded in repo
- Target launch: TBD
- Links: live reference `https://full-point-623707.framer.app`, local build surface `site/index.html`, reference PDF `wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/Website.Template.V2.pdf`, Figma file `https://www.figma.com/design/wNyUe9JlpN01XQCN0MLEPf`

## Phase Status
- Current phase: `design`
- Next phase: `dev`
- Phase exit condition: the Figma design system, shell components, desktop page direction, and mobile adaptation rules are written down clearly enough to use as the source of truth before implementation.

## Active Blacksite To-Do
- [x] Select mode and template depth
- [x] Audit the current prototype and reference surfaces
- [x] Choose the visual register
- [x] Confirm Figma-first redesign path
- [x] Lock the design system tokens and typography
- [ ] Lock the shell components and reusable page patterns
- [ ] Write desktop page build direction for Home, S-S 24, Shop, and About
- [ ] Write mobile adaptation rules
- [ ] Confirm the design artifact is complete enough to begin Figma production
- [ ] Keep `dev` blocked until the design artifact is approved
- [x] Capture live Framer desktop replicas into the Lorimer Figma file
- [x] Capture live Framer mobile replicas into the Lorimer Figma file
- [x] Record route anomalies found during capture QA

## Problem
The repo contains a real four-route static site, but the UI was effectively designed in code and is not strong enough to treat as a final design source. The project needs a Figma-first redesign path that keeps the useful structure, discards weak visual/content decisions, and prevents further design drift before development resumes.

## Goals
- Primary goal: define a clean Figma-first UI redesign path for Home, S-S 24, Shop, and About.
- Secondary goals: preserve the correct information architecture, replace weak prototype-level visuals and copy, and keep code out of design decision-making until the UI is approved.
- Success metric: Figma becomes the design source of truth and the current prototype is only used as a structural reference.

## Audience
- Primary audience: client reviewers and visitors browsing a fashion/editorial brand site.
- What they need: a calm, premium, easy-to-scan website that presents collection, product, and brand context without broken states or generic ecommerce behavior.
- What action they should take: move clearly between S-S 24, Shop, and About, then contact or continue browsing products.

## Inputs
- Inspiration links: live Framer site as benchmark for structure, not finish.
- Additional visual benchmark: `Road of Silk` screenshot set supplied on `2026-04-03` as the active Figma styling reference after the source file itself was inaccessible.
- Screenshot references: none stored separately in this repo.
- Existing site or product: `site/index.html`, `site/ss24.html`, `site/shop.html`, `site/about.html`, `site/styles.css`, `site/app.js`
- Wireframes: none in repo.
- Brand assets: local garment-flat asset folder in `wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/`
- Required content: final editorial imagery, approved brand/about copy, product-state rules, privacy/shipping copy
- Supporting notes: `recreation-audit-2026-04-01.md`, `figma-construction-brief.md`

## Figma Sync Status
- Figma exists: yes
- Canonical design source for the live-replica capture surface: Figma file `wNyUe9JlpN01XQCN0MLEPf`
- Sync strategy: `Figma-first`
- Current sync state: `partially synced`
- Captured this run:
  - desktop homepage at node `42:2`
  - desktop S-S 24 at node `43:2`
  - desktop Shop at node `44:2`
  - desktop About/404 capture at node `45:2`
  - mobile homepage at node `48:2`
  - mobile S-S 24 at node `49:2`
  - mobile Shop at node `50:2`
  - mobile About route currently resolves to Framer 404 and was captured as node `51:2`
- Capture note: Playwright submission calls timed out locally, but each corresponding Figma poll completed successfully and added the design to the file.

## Audit Summary
- Current issues: the prototype is useful structurally but not visually resolved enough to transfer directly into Figma as a near-final design.
- UX issues: route hierarchy is usable, but the page-level storytelling and commerce handoffs are still too generic.
- Visual issues: typography is serviceable rather than distinctive, imagery is still garment-flat driven, and several sections still read like tidy placeholders instead of premium fashion UI.
- Content issues: current copy is mostly scaffolding copy and should not be preserved as approved design language.
- Technical constraints: current implementation is a simple static site; Figma notes indicate the authenticated account may only have view access.

## Direction
- Desired personality: strict, premium, editorial, monochrome, quiet.
- Must feel like: a paced fashion site where whitespace, typography, image scale, and restraint create status.
- Must not feel like: a wireframe, a generic ecommerce template, or a polished placeholder.
- References we like and why:
  - live Framer site: useful for route order and baseline seasonal structure
  - reference PDF: useful for category framing, page rhythm, and shell proportions
  - figma construction brief: useful for the intended near-finished black/white editorial system
  - `Road of Silk` screenshots: useful for softer shell cards, pale stone surface hierarchy, compact control treatment, and better-organized component/page boards in Figma
- References to avoid and why:
  - unfinished live placeholder states: broken or joke copy, dead CTAs, and default metadata should not be carried forward as approved design
  - generic retail patterns: they would flatten the editorial pacing the current shell is trying to preserve

## Scope
### In scope
- Pages or screens: Home, S-S 24, Shop, About
- Key interactions: top navigation, mobile menu, category anchors, route-to-route handoff, footer/contact access
- Responsive support: desktop and mobile together

### Out of scope
- coding or frontend implementation
- Full ecommerce checkout or account flows
- CMS/data integration
- Final content approval or deployment

## Structure
- Home: establish the brand frame and hand off into S-S 24 and Shop
- S-S 24: present the seasonal sequence first, with commerce as secondary
- Shop: organize products into restrained category-led browsing
- About: hold brand framing, contact context, and quieter supporting copy

## What Stays
- Four-route information architecture
- Shared site shell and route hierarchy
- Seasonal page as the primary editorial page
- Shop as category-led rather than generic retail
- Monochrome fashion/editorial direction

## What Changes
- Rebuild the UI in Figma rather than transferring the current pages one-to-one
- Replace most current body copy and section language
- Rework typography hierarchy and image strategy for a stronger luxury/editorial read
- Tighten Home so it feels designed, not explained
- Recompose S-S 24 around image pacing, not placeholder product copy
- Reframe Shop so it supports product browsing without looking like a placeholder catalog
- Rebuild About as a true brand page rather than an expanded footer

## UI Direction
- Typography: Cargo-adjacent severe editorial serif for display, narrow/utilitarian uppercase UI type, restrained secondary serif body
- Color: black and white only in the current pass
- Layout style: severe luxury editorial, very high negative space, strong rules, broad image fields, sparse but intentional compositions
- Imagery: garment flats for structure now, editorial photography later
- Motion: minimal; only enough to support navigation and state clarity

## Design System
### Typography
- Display family direction: high-contrast editorial serif with Didot/Bodoni/Cargo-like severity
- UI/meta family direction: Area Normal or similarly restrained grotesk for small uppercase navigation and labels
- Body family direction: restrained editorial serif, used sparingly and never as dense long-form copy
- Type behavior:
  - display is large, cold, and exact
  - meta text is small uppercase with disciplined tracking
  - body copy stays short and subordinate to image and whitespace

### Spacing
- Desktop page gutter: `40`
- Desktop inner editorial inset: `72`
- Desktop standard section gap: `128`
- Desktop large editorial gap: `160` to `192`
- Desktop grid gap: `24` to `32`
- Desktop nav vertical padding: `20` to `24`
- Mobile page gutter: `20`
- Mobile section gap: `48` to `64`

### Grid
- Desktop frame width should feel bounded and calm, with wide outer whitespace
- Use a 12-column desktop working grid
- Use a 4-column mobile working grid
- Text blocks should sit on fewer columns than image blocks
- Empty space is an active layout element, not leftover room

### Rules And Surfaces
- Default rule weight: `1`
- Rules are structural separators only
- No soft cards, no shadows, no rounded luxury cues
- Monochrome only in the first draft
- Background stays white unless a single full-bleed image field justifies contrast

### Component Families
- Top navigation
- Footer
- Page intro band
- Section divider
- Editorial image block
- Split text/image composition
- Seasonal look row
- Product grid card
- Category nav
- Contact/info block

## Figma Build Order
1. Tokens page
2. Type scale and spacing reference page
3. Shared shell components
4. Desktop Home
5. Desktop S-S 24
6. Desktop Shop
7. Desktop About
8. Mobile shell and page variants
9. Review pass before any implementation planning

## Deliverables
- Updated operating brief aligned to the actual repo and the Figma-first design path
- Revision priorities for visual direction, copy strategy, and page composition
- Figma page and shell direction built from structure, not direct page transfer
- Design-system rules for tokens, type, spacing, and reusable shell patterns
- Handoff notes documenting what is stable and what remains unresolved

## Timeline
- Milestone: stabilize the brief and revision priorities
- Review date: next internal review
- Launch date: TBD after design approval

## Risks / Unknowns
- Risk: the project can drift again if Figma, code, and review notes are not kept aligned to the same shell rules
- Risk: placeholder imagery may distort design decisions if treated as final
- Open question: what final editorial assets replace the garment flats on Home and S-S 24?
- Open question: what exact product-state behavior is required for pricing, availability, and `View In Products` destinations?
- Open question: what final About and footer copy is approved?

## Approval
- Stakeholders: client and internal design/review owner
- Feedback cadence: internal review before any client-facing Figma pass
- Final approver: client

## Decision Log
- 2026-04-02: Selected `recovery-mode` because the repo already contains a functioning site shell, but the UI direction was largely formed in code and is not reliable enough to carry forward directly.
- 2026-04-02: Kept the brief in the lean format because the work is a four-route editorial website, not a large product system.
- 2026-04-02: Treated the live Framer site, reference PDF, and current static prototype as structural references only, not approved final design.
- 2026-04-02: Chose a Figma-first redesign path as the fastest safe approach: preserve structure, rebuild the design.
- 2026-04-03: Chose `Severe Luxury Editorial` as the visual register and aligned the system toward Cargo-like typography, strict monochrome, and aggressive negative space.
- 2026-04-03: Raised the desktop spacing system above the earlier prototype values to produce a more deliberate editorial feel in Figma.
- 2026-04-03: Added `Road of Silk` screenshots as the active visual benchmark for the Figma build, borrowing softer shell treatment, calmer neutral surfaces, and cleaner board organization while keeping Lorimer's editorial route structure and typography distinct.
- 2026-04-05: Captured the live Framer site into the Lorimer Figma file `wNyUe9JlpN01XQCN0MLEPf` for exact desktop and mobile reference replicas before any further redesign work.
- 2026-04-05: Confirmed that `https://full-point-623707.framer.app/about` currently resolves to `Page Not Found | Framer`; preserved that state in the replica set instead of inventing a page that does not exist on the live surface.
