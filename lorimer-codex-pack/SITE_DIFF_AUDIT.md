# Site difference audit based on the supplied visuals

This is the design diagnosis Codex should keep in mind throughout the rebuild.

## 1. Biggest mismatch: composition, not content

The Vercel build already has some of the same information architecture:
- top navigation
- home page
- shop page
- product cards
- categories

But it does not yet carry the same compositional authority.

The Framer version feels authored.
The Vercel version feels placed.

That difference comes from:
- optical balance
- container logic
- pacing of whitespace
- image staging
- relationship between navigation and content

## 2. Homepage mismatch

### Framer reference
The homepage is built around a split visual field:
- left half very washed, quiet, desaturated
- right half richer, darker, more bodily
- overlap gives a campaign editorial feel
- the seam is part of the composition

### Vercel risk
If implemented too literally, it becomes:
- a generic two column hero
- flat image split
- wrong crop balance
- insufficient depth

### Correction
The hero needs:
- more deliberate crop selection
- stronger verticality
- subtle overlap and transparency control
- large scale image staging

## 3. Shop page mismatch

### Framer reference
The shop feels like a fashion archive page with a left textual navigation rail and a product area that breathes.

### Current Vercel look from screenshot
The shop content feels like:
- large empty area
- small centered product block
- sidebar that lacks enough authority
- overall page feels under composed

### Correction
Need:
- stronger left anchor
- clearer page width usage
- tighter relationship between sidebar and grid
- carefully tuned card widths and gaps

## 4. Navbar mismatch

### Framer reference
The navbar acts like a quiet masthead.

### Likely Vercel issue
Probably implemented as a standard flex row.
That usually causes:
- weak center logo behavior
- bad spacing rhythm
- seasonal marker feeling random
- insufficient visual refinement

### Correction
Build nav around explicit columns and optical centering.

## 5. Typography mismatch

The current site likely reads too browser default or too mechanically typeset.

Correction:
- tune font pairing and font sizes
- reduce generic scale jumps
- adjust tracking and line height
- treat product names like captions, not like blog headlines

## 6. Luxury perception issue

Luxury here comes from:
- restraint
- whitespace with intent
- consistency
- image confidence

The current build likely has whitespace, but not enough structure.
This creates awkward emptiness instead of luxury.

## 7. Responsive risk

A site like this can look good only on desktop if not carefully rebuilt.
Main risks:
- nav collisions
- hero losing its editorial split
- sidebar becoming dead space
- product cards becoming too small or too dense
- mobile stacking becoming generic

Responsive behavior must be designed, not merely inherited.
