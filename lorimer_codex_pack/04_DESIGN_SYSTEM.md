# 04_DESIGN_SYSTEM

## Core Thesis
Spacing communicates luxury more than decoration.
The design system must be strict, controlled, and minimal.

## 1. Spacing System

### Base unit
8px

### Approved spacing scale
- 8
- 16
- 24
- 40
- 64
- 96
- 128

### Rules
- Do not use arbitrary spacing values unless absolutely required by an implementation edge case
- Prefer all paddings, margins, gaps, and offsets to resolve to the approved scale
- Sections should typically use 64, 96, or 128
- Internal spacing should typically use 16, 24, or 40
- Large layout rhythm should visibly follow a repeated system

### Vertical rhythm targets
Examples:
- section top to next major element: 96
- major block to major block: 64
- visual divider to next content group: 96 or 128
- text cluster internal spacing: 16 or 24
- CTA or link separation from descriptive copy: 24 or 40

### Areas already known to need more breathing room
- logo to sub navigation text
- row 1 to row 2 in Products preview on home
- image to product title in Products page
- categories on Products page
- S/S24 section to footer
- product detail page text groups

## 2. Grid System

### Desktop
- 12 columns
- max width around 1280px
- outer margins around 96px
- gutter around 24px
- layout should feel aligned even when asymmetrical

### Tablet
- maintain the editorial feel but simplify the composition
- reduce asymmetry complexity where needed
- avoid cramped two column patterns that break balance

### Mobile
- 1 column
- horizontal padding around 16 to 20px
- no attempt to preserve desktop lateral compositions literally

## 3. Typography

### Primary font
Lora

### Tone
Quiet, refined, restrained, chic.

### Suggested scale
- H1: 48 to 56 desktop / 32 mobile
- H2: 28 to 32 desktop / 22 mobile
- Body: 16 desktop / 14 mobile
- Meta / labels: 11 to 12

### Typography rules
- Minimal bold usage
- Avoid decorative type styling
- No aggressive tracking
- Use line height around 1.5 for body copy
- Let spacing do the hierarchy rather than font tricks

## 4. Color
- Background: #FFFFFF
- Text: #000000

Optional subtle interaction overlay:
- rgba(0,0,0,0.04) to rgba(0,0,0,0.06)

## 5. Image Ratio System
Only define and use a few image families:

- Product image: 4:5
- Lookbook image: 3:4
- Editorial divider / campaign wide image: 16:9

Rules:
- Do not mix aspect ratios randomly within the same content section
- Reserve aspect ratio space in CSS to avoid layout shift
- Treat wide images as editorial interruptions

## 6. Motion System
Allowed:
- fade
- opacity shift
- subtle underline
- gentle image swap

Timing:
- around 200 to 300ms

Avoid:
- bounce
- large scale animations
- flashy parallax
- loud cursor effects
