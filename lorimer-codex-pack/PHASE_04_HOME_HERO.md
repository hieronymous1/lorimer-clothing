# Phase 04: Home hero rebuild

## Prompt

Rebuild the homepage hero so it matches the Framer reference much more closely.

### Current issue

The current implementation likely does not recreate the compositional tension of the Framer version.
The Framer hero is not just a banner. It is a split editorial image field with layered visual contrast.

### Required composition

- full viewport hero or near full viewport
- two main vertical image fields
- left image: softer, colder, lower contrast, more muted
- right image: richer, warmer, more direct
- center seam should feel intentional
- image overlap and blend should feel composed, not like a simple two column crop

### Direction

Think campaign spread, not ecommerce hero.
The page should feel like an opening fashion plate.

### Implementation needs

- rebuild the hero wrapper proportions
- review image positioning and object fit
- review opacity layering if overlays are being used
- ensure desktop composition echoes the reference
- ensure the crop relationship between the two halves feels strong

### Motion

Keep motion extremely restrained:
- gentle fade in
- maybe slight opacity settle
- no strong parallax
- no aggressive transforms

### Responsive

Tablet:
- preserve the diptych feeling as long as possible

Mobile:
- choose a deliberate stacking behavior
- do not simply squash the desktop layout
- keep one strong image experience rather than a broken split if necessary

### Deliverable

Implement the home hero rebuild and summarize:
- composition choices
- image behavior
- responsive strategy
