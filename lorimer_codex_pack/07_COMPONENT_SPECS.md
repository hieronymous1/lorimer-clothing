# 07_COMPONENT_SPECS

## Goal
Build reusable components so the system does not drift.

## 1. SectionWrapper
Responsibilities:
- apply consistent max width
- control vertical spacing
- manage section level alignment

Props or options:
- spacing size
- constrained or full width
- alignment mode

## 2. NavBlock
Contents:
- Lorimer logo
- S/S24
- Products
- About

Behavior:
- toolbar disappears on scroll
- nav under logo remains the key route layer
- links must be clickable from home
- on internal pages, keep the logo block aligned with the overall margins, not hugging the wall

## 3. EditorialRow
Responsibilities:
- render content using Pattern A, B, or C
- support image, image, text combinations
- maintain consistent rhythm

## 4. ProductCard
Contents:
- primary image
- hover image
- product name
- optional price or metadata
- destination link

Rules:
- hover image must map correctly to the specific product
- invisible product bug must be impossible
- text position should breathe under the image

## 5. CollectionPreview
Use for home page S/S24.
Contents:
- group image
- title: S/S24
- destination link

## 6. LookBlock
Use on S/S24 page.
Contents:
- look image
- description
- "View in Products"
- optional arrow / multi image navigation

## 7. DividerImage
Use between catalogue sections.
Rules:
- large enough to feel like a pacing reset
- use 16:9 when intended as a wide editorial interruption

## 8. ProductDetailLayout
Desktop:
- text left
- image right dominant

Content groups:
- title
- short description
- details
- price / CTA
- support information if needed

## 9. Footer
Tone:
- tiny, chic, quiet, confident

Contents can include:
- Lorimer
- Contact
- Instagram
- legal or year line if needed

Rules:
- not visually heavy
- must provide closure
