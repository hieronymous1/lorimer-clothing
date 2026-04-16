# 13_COPY_PASTE_PROMPTS

## MASTER ORCHESTRATION PROMPT

You are implementing the Lorimer website in code.

Read and follow every markdown file in this documentation pack before making changes:
- PROJECT.md
- 01_PROJECT_OVERVIEW.md
- 02_REFERENCES_AND_SOURCE_OF_TRUTH.md
- 03_CLIENT_CHANGELOG.md
- 04_DESIGN_SYSTEM.md
- 05_LAYOUT_SYSTEM.md
- 06_MOBILE_RESPONSIVENESS_SYSTEM.md
- 07_COMPONENT_SPECS.md
- 08_CONTENT_REQUIREMENTS.md
- 09_IMAGE_DIRECTION.md
- 10_INTERACTION_MOTION.md
- 11_QA_ACCEPTANCE_CRITERIA.md
- 12_BUILD_SEQUENCE.md
- 14_IMPLEMENTATION_GUARDRAILS.md

Also use these reference sources:
- Framer draft: https://full-point-623707.framer.app
- Client PDF template: Website.Template.V2.pdf
- Design inspiration: https://mfpen.com and https://www.buendia0222.com

Project direction is locked:
- ultra minimal
- strict editorial asymmetry
- black text on white background
- quiet luxury
- editorial ecommerce
- Lora typeface
- mobile and responsiveness are top priority
- spacing system is the main quality signal
- Shopify integration later, not now

Important:
- do not drift into generic ecommerce patterns
- do not improvise new layout languages
- do not compress spacing on mobile
- do not preserve desktop composition literally on mobile
- do not add visual clutter
- do not add loud interaction effects

Implementation strategy:
1. Build the system first
2. Build page layouts second
3. Build detail pages third
4. Refine mobile and responsiveness aggressively
5. Run QA against the acceptance criteria

Before coding, summarize:
- the design system
- the mobile strategy
- the page structure
- the critical risks
Then implement in phases.

---

## PHASE 1 PROMPT

Read the full Lorimer pack and implement only Phase 1 from 12_BUILD_SEQUENCE.md.

Scope:
- spacing system
- typography system
- grid
- layout patterns A/B/C
- image ratio primitives
- reusable wrappers and base components

Requirements:
- use the approved spacing scale only where possible
- encode mobile recomposition rules into the base system
- do not build final page details yet
- show the resulting structure and explain how the components enforce consistency

---

## PHASE 2 PROMPT

Read the full Lorimer pack and implement only the Home page.

Requirements:
- match the Framer draft structure
- incorporate the PDF pacing and editorial feel
- satisfy every Home page change in 03_CLIENT_CHANGELOG.md
- toolbar disappears on scroll
- links under Lorimer logo are clickable
- spacing between logo and section text is improved
- products preview breathes more
- S/S24 uses a group image and reads as a collection
- footer is present
- prioritize mobile quality equally with desktop

After implementation, explain:
- spacing choices
- mobile recomposition choices
- any places where you refined the Framer draft for better luxury feel

---

## PHASE 3 PROMPT

Read the full Lorimer pack and implement only the Products page.

Requirements:
- remove top toolbar
- increase product image scale
- improve image to text spacing
- categories must breathe
- horizontal editorial images must feel significant
- every product card links correctly
- fix invisible Reconstructed Bomber Jacket issue
- ensure hover image mapping is correct
- keep the page editorial rather than storefront-like
- mobile product browsing should remain single column unless you can strongly justify otherwise

After implementation, explain:
- how the page avoids generic ecommerce behavior
- how spacing and image scale were used to create luxury

---

## PHASE 4 PROMPT

Read the full Lorimer pack and implement only the S/S24 page.

Requirements:
- reduce unnecessary vertical white space
- enlarge images
- make text smaller and cleaner
- alternate image and text composition
- add "View in Products" links
- add arrow based image navigation where appropriate
- make the bottom image 16:9
- add footer
- preserve mobile clarity

After implementation, explain:
- how the page reflects the PDF lookbook logic
- how mobile sequencing works

---

## PHASE 5 PROMPT

Read the full Lorimer pack and implement only the individual product page system.

Requirements:
- make image dominant on the right on desktop
- reduce congestion in text
- structure text into clean groups
- make mobile image first and text second
- use buendia0222 inspiration for overall balance, without copying

After implementation, explain:
- how the composition improves perceived luxury
- what spacing rules were applied

---

## PHASE 6 PROMPT

Read the full Lorimer pack and implement content and polish tasks.

Scope:
- About page layout and copy
- product descriptions
- S/S24 descriptions
- footer copy
- final image selection alignment
- subtle motion refinement
- accessibility and QA improvements

Ensure:
- no filler text remains
- copy tone stays restrained and conceptual
- performance remains strong

---

## FINAL QA PROMPT

Read 11_QA_ACCEPTANCE_CRITERIA.md and audit the current implementation against every item.

Return:
1. pass / fail list
2. exact issues
3. exact files to edit
4. fixes in priority order

Then implement the fixes.
