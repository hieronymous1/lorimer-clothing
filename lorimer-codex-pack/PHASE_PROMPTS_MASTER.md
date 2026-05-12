# Lorimer Phase Prompts (Master)

Use phases in strict order. Do not skip ahead.
Do not redesign freely outside this system.
Keep outputs concise and structured.

## Global Rules (apply to all phases)

- Preserve quiet, editorial, high-fashion tone.
- Avoid generic centered ecommerce template behavior.
- No shadows, no loud effects, no gratuitous animation.
- Desktop first, then tablet, then mobile.
- Keep implementation modular and tokenized.
- Do not stop mid-phase.
- If Figma/Framer MCP is available, use it as a verification source during audit and QA.

## Framer/Figma MCP Workflow (when active)

- Use MCP to inspect reference structure and screenshot target nodes before major edits.
- Use MCP screenshots/context to validate composition, spacing, and hierarchy after each phase.
- Prefer node-level comparisons over memory-based visual judgment.
- If MCP is unavailable, continue with local image references in `lorimer-codex-pack/references/`.

## Required Output Format (for every phase)

Return exactly:

1. Files changed
2. What was implemented
3. What remains (only next-phase items)

---

## Phase 01: Audit and Plan

### Objective

Identify precise mismatches before editing.

### Prompt

Audit the existing codebase against the Framer reference and this pack.

You must identify exact components/files for:

- global layout shell
- navbar
- home hero
- shop listing architecture
- product card
- product detail page
- global CSS/tokens/theme source

Then produce:

- mismatch report grouped into global/home/shop/responsive
- file-level implementation order
- risks and assumptions
- MCP evidence notes (if MCP used): reference node/page checked and key visual deltas

### Completion Gate

- exact files named
- exact layout issues identified (`max-width`, centered wrappers, flex assumptions, etc.)
- no code edits yet

---

## Phase 02: Global System Rebuild

### Objective

Set foundations before page-level tuning.

### Prompt

Implement:

- strict spacing scale
- typography system (masthead/nav/title/body/meta)
- restrained color system
- page shell strategy (no generic centered container)
- image rules (no radius/shadow, deliberate crops)
- reusable tokens/variables

### Completion Gate

- tokens centralized
- shell/padding strategy implemented
- duplicated magic values reduced

---

## Phase 03: Navbar Rebuild

### Objective

Make navbar read like an editorial masthead.

### Prompt

Rebuild navbar using explicit layout zones, not a generic `justify-between` row.

Target anchors:

- HOME (left)
- S/S_24 (quiet seasonal marker)
- centered brand mark
- SHOP + ABOUT (right grouping)

Ensure optical centering, restrained hover, and responsive stability.

### Completion Gate

- alignment model explained
- desktop/tablet/mobile behaviors defined
- no compressed/colliding nav states

---

## Phase 04: Home Hero Rebuild

### Objective

Match campaign-style split composition.

### Prompt

Rebuild hero as near full-viewport diptych with intentional seam:

- left field quieter/colder/muted
- right field richer/warmer/direct

Tune `object-position` and crops. Use subtle overlays only if needed.
Keep motion minimal and elegant.

### Completion Gate

- seam intentional
- desktop composition matches direction
- tablet/mobile recomposed (not squashed desktop)

---

## Phase 05: Shop Architecture Rebuild

### Objective

Replace centered gallery feel with authored catalogue layout.

### Prompt

Rebuild shop shell:

- strong left rail (text-led sidebar)
- related right product field
- intentional horizontal staging

Desktop target:

- sidebar around 220px
- sidebar/content gap around 40 to 64px
- 3-column grid with tuned card rhythm

### Completion Gate

- sidebar authority restored
- grid no longer floats as centered block
- desktop/tablet/mobile structure intentional

---

## Phase 06: Product Card Refinement

### Objective

Cards feel like lookbook plates, not ecommerce widgets.

### Prompt

Refine card anatomy:

- dominant image
- modest title
- optional quiet meta line

Hover:

- subtle scale/opacity only
- no shadow/lift/chrome

### Completion Gate

- image dominance preserved
- typography understated and consistent
- aspect ratio/crop handling stable across breakpoints

---

## Phase 07: Product Page Rebuild

### Objective

Image-first, minimal product detail composition.

### Prompt

Implement:

- dominant media column + narrower info column on desktop
- clean hierarchy (title, price, short copy, size, add-to-cart)
- simple controls and generous spacing
- clean mobile stack with premium feel

### Completion Gate

- image-first layout achieved
- CTA accessible without clutter
- no generic boxed ecommerce module feel

---

## Phase 08: Responsive Pass and QA

### Objective

Finish with a full responsive redesign pass and final polish.

### Prompt

Validate and fix at:

- 1440+
- 1280
- 1024
- 768
- 430
- 390

Check and fix:

- global paddings/type/nav stability/overflow
- hero crop balance and seam behavior
- shop sidebar/grid/card spacing
- product page hierarchy/stacking/CTA visibility

If MCP is available, include:

- one MCP-backed verification note per page type (Home, Shop, Product page)
- brief mismatch/fix summary tied to MCP screenshot/context checks

### Completion Gate

- all breakpoints validated
- no overflow/collisions/compression
- no generic centered template regressions

---

## Corrective Prompt A: If Still Too Centered

The result is still too centered and generic.
Rework shells to remove template behavior:

- fix `max-width` + `margin: 0 auto` narrowing
- re-stage sidebar-to-grid relationship
- replace `justify-between` nav assumptions
- re-art-direct hero split and spacing

Return exact layout changes made.

---

## Corrective Prompt B: If Responsive Feels Broken

Desktop improved but responsive is broken/generic.
Do a dedicated responsive redesign pass (not shrink pass):

- recompose hero at narrow widths
- prevent navbar collisions
- redesign shop mobile flow intentionally
- keep product cards image-led and spacious
- keep product page premium on mobile

List responsive changes by component.
