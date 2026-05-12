x   x# Phase 03: Navbar rebuild

## Prompt

Rebuild the global navbar so it behaves like a quiet editorial masthead rather than a generic top menu.

### Target structure

Desktop top row should feel light, stretched, and intentional.

Primary read:
- HOME on the left
- brand mark centered
- SHOP and ABOUT on the right zone

Secondary seasonal marker:
- S/S_24 present as a separate informational anchor
- it should not feel like a normal nav item
- it should read as part of the fashion system

### Visual behavior

- fixed or sticky depending on current architecture, but it must stay elegant
- pale background
- subtle separation from content
- no heavy borders
- no oversized buttons
- no pill buttons
- no generic active states

### Spacing and alignment

This is where the current build likely fails.
The nav must align to a stronger horizontal system.

Requirements:
- balanced left and right edge spacing
- centered logo should actually feel optically centered
- nav item zones should not collapse into a random evenly distributed flex row
- use explicit layout columns, not just justify-between on everything

### Responsive behavior

Tablet:
- maintain brand presence
- do not let items collide or compress awkwardly

Mobile:
- simplify cleanly
- keep brand visible
- prevent clutter
- preserve luxury tone

### Deliverable

Implement the navbar rebuild and explain:
- alignment model used
- spacing decisions
- responsive behavior
