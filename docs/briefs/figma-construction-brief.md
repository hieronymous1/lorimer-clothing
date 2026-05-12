# LORIMER Figma Construction Brief
_Last updated: 2026-04-03_

## Approved Direction
- Figma-first website shell
- Near-finished website feel
- `Premium Systemized` structure
- Strict black/white editorial minimalism
- Padding and spacing are primary design concerns
- Desktop and mobile designed together
- Visual register: `Severe Luxury Editorial`
- Cargo-adjacent typography and layout discipline
- Very heavy negative space on desktop

## Route Structure
- `/` Home
- `/ss24` S-S 24
- `/shop` Shop
- `/about` About

## Navigation
Primary top nav:
- `HOME`
- `S-S 24`
- `SHOP`
- `ABOUT`

Nav rules:
- Fixed top navigation
- Central logo lockup
- Same route priority on desktop and mobile
- Minimal visual treatment, spacing-led hierarchy
- Treat the nav like a quiet gallery header, not a commerce utility bar

## Footer
Expanded editorial footer on every page:
- Contact
- Privacy
- Shipping
- Address

Footer rules:
- Shared information architecture across all pages
- Desktop uses wider editorial distribution
- Mobile stacks vertically without changing content

## Shell Anatomy
Shared shell parts:
- Fixed top nav
- Page intro band
- Primary content frame
- Section divider rule
- Expanded editorial footer
- Mobile nav variant
- Mobile footer stacking variant

Frame logic:
- Same outer width logic across all pages
- Same gutter system across all pages
- Each page begins with a restrained intro/header zone
- Content sits inside an editorial grid
- Rules are structural separators, not decorative borders
- Negative space is a primary compositional tool, not filler
- Text should never visually overpower the frame or image fields

## Token System
### Color
- `bg/base`: `#FFFFFF`
- `fg/base`: `#000000`
- `border/base`: `#000000`

Rules:
- No accent color in first draft
- No gray system unless needed for annotation or tooling
- Monochrome contrast should carry the visual identity
- No shadows
- No tinted surfaces
- No soft luxury treatments such as blur, glow, or rounded panels

### Spacing
Base scale:
- `4`
- `8`
- `12`
- `16`
- `24`
- `32`
- `48`
- `64`
- `96`
- `128`
- `160`
- `192`

Priority working units:
- `24`
- `32`
- `40`
- `72`
- `128`
- `160`

### Layout
- Desktop page gutter: `40`
- Desktop editorial inset: `72`
- Mobile page gutter: `20`
- Desktop section gap: `128`
- Desktop large editorial gap: `160` to `192`
- Mobile section gap: `48` to `64`
- Desktop internal gap: `24` to `32`
- Mobile internal gap: `16`
- Desktop grid: `12` columns
- Mobile grid: `4` columns

### Rules
- Default rule weight: `1`
- Use thicker framing only when a single strong editorial gesture is needed
- Avoid decorative framing accumulation

### Typography
Roles:
- Display XL
- Display L
- Heading
- Body
- Small meta
- Footer meta

Typography rules:
- Editorial display style with severe high-contrast proportions
- Tight display leading
- Restrained letter spacing
- Small uppercase meta/nav text
- Sparse type system, not over-granular
- Display text should feel cold, exact, and expensive
- Meta text should feel neutral and infrastructural
- Body text should remain short and secondary

### Typeface Direction
- Display reference: Didot/Bodoni/Cargo-like high-contrast serif behavior
- UI/meta reference: Area Normal or comparable restrained grotesk
- Body reference: quiet editorial serif, used with restraint
- Do not use an all-sans system
- Do not use friendly or warm type behavior

## Responsive Rules
### Breakpoint Strategy
- Desktop and mobile are authored together
- Tablet is an interpolation layer, not its own bespoke design system

### Invariants
- Same nav labels
- Same footer content
- Same monochrome token system
- Same spacing philosophy
- Same route hierarchy

### Changes Across Sizes
- Desktop uses multi-column editorial composition
- Mobile uses stacked or single-column composition
- Footer stacks vertically on mobile
- Nav compresses but preserves the same route importance

### Width Logic
- Desktop content sits in a centered bounded frame
- Mobile flows edge-to-edge with controlled gutters
- Images can feel broad
- Text blocks must remain readable and paced
- Desktop should feel more spacious, not more busy
- Mobile should preserve hierarchy, not miniaturize it

### Rhythm Rules
- Keep whitespace generous on both sizes
- Do not solve mobile by shrinking everything
- Preserve pacing first, simplify structure second
- Favor fewer, larger gestures over many small ones

## Page Build Order
1. Tokens page
2. Shell components page
3. Home
4. S-S 24
5. Shop
6. About
7. Mobile variants pass
8. Review and cleanup pass

## Page Requirements
### Home
- Shared shell
- Intro frame
- Campaign/entry structure
- Links into S-S 24 and Shop
- Should feel like an arrival page, not an explanation page
- One dominant image or image field at a time
- The page should not over-describe the brand

### S-S 24
- Shared shell
- Look-sequence structure
- Alternating editorial row rhythm
- Lineup/date close
- Placeholder descriptions until approved copy exists
- This is the most editorial page in the system
- Text should support image cadence, not replace it

### Shop
- Shared shell
- Category framing
- Product-grid logic
- Filter/navigation relationship
- Placeholder product states where needed
- Must remain category-led and editorial
- Should avoid generic ecommerce density

### About
- Shared shell
- Near-finished placeholder layout
- Temporary copy blocks
- Brand/contact/editorial framing
- Must feel like a true brand page, not an expanded footer

## Reusable Components
- Top navigation
- Mobile navigation
- Footer
- Intro band
- Section rule
- Editorial image block
- Split composition
- Seasonal look row
- Category header
- Product card
- Contact/info block

## Shared Shell Component Specs
### Top Navigation
- Height target: `64` to `72`
- Horizontal padding: page gutter only
- Composition: left routes, centered logo, right routes
- Type: small uppercase meta style
- Behavior: fixed, visually quiet, rule below
- No button styling in the desktop nav

### Mobile Navigation
- Uses the same route order as desktop
- Closed state remains minimal
- Open state becomes a vertical list with generous spacing
- Should feel editorial, not app-like

### Intro Band
- Sits directly under the nav
- Includes one small meta label, one primary title, optional short support line
- Vertical padding should feel substantial: `120` minimum on desktop
- Keep line lengths narrow and controlled

### Section Rule
- Full available content width
- Weight `1`
- Used to separate major editorial bands only
- Avoid stacking many rules too close together

### Editorial Image Block
- Prioritize large uninterrupted rectangles
- Default behavior is broad image field with minimal adjacent text
- Use image containment only when garment-flat structure requires it
- Prefer crop confidence over timid image scaling

### Split Composition
- Default relationship: image-dominant with narrower text column
- Standard text inset: `72`
- Use when a page needs narrative support without collapsing into article layout

### Seasonal Look Row
- Two-part composition with alternating rhythm across the page
- Image remains primary; text sits in a quieter adjacent column
- Each row needs enough vertical room to feel intentional, not list-like
- CTA treatment remains secondary and understated

### Product Card
- Built for category-led browsing, not hard-sell commerce
- Image first, title second, support text last
- Pricing and product-state logic stay visually subordinate
- Grid should breathe; avoid dense retail card packing

### Footer
- Three or four quiet information columns on desktop
- One-column vertical stack on mobile
- Same tone as the nav: infrastructural, not promotional
- Must feel stable enough to be reused unchanged across all pages

## Figma Production Notes
- Build tokens first and do not improvise spacing per page
- Create type styles before page design begins
- Create auto-layout shell components before page-specific sections
- Keep desktop primary; derive mobile with preserved hierarchy
- Treat the current static prototype as structural reference only
- Treat the PDF and live Framer pages as desktop pacing references, not literal styling references

## Current Build Constraint
The current authenticated Figma account has `View` access only, so Figma write operations may be blocked until edit-capable access is available.

## Immediate Build Sequence
1. Create or target a writable Figma file
2. Build the tokens page
3. Build the type, grid, and spacing reference page
4. Build the shared shell components
5. Lay out the four desktop pages
6. Add mobile counterparts
7. Review for spacing and type consistency
8. Prepare the first client-review draft
