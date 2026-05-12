# Code style and architecture rules

## General

- prefer clear component boundaries
- keep layout primitives reusable
- centralize tokens where possible
- avoid magic numbers scattered across components
- avoid giant monolithic page files if the app is already componentized

## Styling

Use one styling system consistently.
If the project already uses Tailwind, refine it cleanly.
If it uses CSS modules or global CSS, keep the system coherent.

## Naming

Use precise names:
- `SiteHeader`
- `HomeHero`
- `ShopSidebar`
- `ProductGrid`
- `ProductCard`
- `ProductDetailLayout`

Avoid vague names like `Section2` or `WrapperX`.

## Implementation order

1. tokens and shell
2. header
3. home hero
4. shop layout
5. product cards
6. product page
7. responsive pass
