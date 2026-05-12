# MASTER PROMPT

You are upgrading an existing fashion ecommerce site implementation so it matches a Framer reference more closely.

Your job is not to invent a new design direction.
Your job is to translate the existing Framer art direction into production quality code.

Read every markdown file in this pack before changing anything.

## Project goal

Upgrade the current Vercel implementation so it feels much closer to the Framer reference in:

- layout logic
- proportion
- spacing rhythm
- image treatment
- typography hierarchy
- editorial asymmetry
- responsive behavior
- interaction restraint

## What is currently wrong

The current Vercel site looks off because it feels like a generic centered ecommerce layout instead of a composed editorial fashion site.

Main problems:
- too much empty space in the wrong places
- not enough intentional structure
- product area is floating in the middle instead of being staged by a strong left navigation column
- home hero lacks the same tension and image composition as the Framer reference
- navbar reads as a plain row instead of a fashion masthead
- typography feels default rather than art directed
- spacing is inconsistent and not governed by a strict scale
- mobile and tablet behavior likely collapse the intended hierarchy

## Non negotiable creative direction

This site must feel:
- quiet
- high fashion
- lightly severe
- spacious
- editorial
- intentional
- image led
- structured, not decorative

This site must NOT feel:
- like Shopify default
- like a startup landing page
- like a normal React ecommerce template
- like a centered card grid
- like a UI kit

## Working method

1. Audit the current codebase first
2. Identify the components responsible for the mismatch
3. Rebuild the page shells and spacing system before fine detail
4. Fix desktop first
5. Then tablet
6. Then mobile
7. Only after layout is correct, refine hover and transition behavior

## Build constraints

- keep the implementation clean and modular
- do not introduce heavy dependencies unless already present
- prefer simple CSS or Tailwind with disciplined tokens
- no gratuitous animation libraries unless already used
- no shadows
- no rounded corners unless absolutely required by existing system
- no bold accent colors
- no loud hover effects
- no generic ecommerce badges or chips unless explicitly needed
- no “improvised design improvements” outside this pack

## Output expectations

For each phase:
- explain what files you will change
- explain why
- make the changes
- summarize what remains

Do not stop after one tweak.
Complete the full phase.
