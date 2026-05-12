# Phase 05: Shop page architecture rebuild

## Prompt

Rebuild the shop page architecture so it feels like a curated fashion catalogue instead of a centered product gallery.

### Current issue

The current Vercel page appears too centered and too generic.
The left sidebar exists conceptually but the whole page still reads like a floating block in the middle of a large empty field.

### Target structure

Desktop:
- strong left navigation / filter column
- right product field with clear but airy grid logic
- the product field should begin close enough to the sidebar to feel related
- the whole layout should use the page width more intentionally

### Sidebar requirements

Include:
- brand mark
- collection or gender filters
- season marker
- category filters

Behavior:
- visually stable
- may be sticky if appropriate
- no boxes
- no cards
- no icons unless truly essential
- text led only

### Product field requirements

- not centered in the viewport as a lonely block
- use a stronger column system
- preserve generous whitespace but in a controlled way
- cards should feel curated, not auto generated

### Grid behavior

Desktop:
- likely 3 columns
- but tuned gaps and widths matter more than the number itself

Tablet:
- reduce carefully
- maintain structure

Mobile:
- one column or disciplined two up depending on image ratios
- avoid cramped cards

### Deliverable

Implement the shop architecture rebuild and summarize:
- page shell changes
- sidebar strategy
- product grid strategy
