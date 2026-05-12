# Corrective prompt: if the result still feels too centered

Use this if Codex delivers a result that is technically improved but still feels too much like a standard ecommerce site.

## Prompt

The current result is still too centered and too generic.

Rework the page shells so they stop behaving like centered template layouts.

### You must check for and fix:
- wrappers using `max-width` plus `margin: 0 auto` that are narrowing the composition too much
- product grids placed in a centered container instead of a deliberately staged content field
- nav structures relying only on `justify-between`
- homepage hero using equal halves without image art direction
- excessive dead space above or around the product listing

### Desired outcome

The site should feel horizontally authored.
The sidebar should anchor the catalogue.
The product area should feel placed in relation to that anchor.
The homepage should feel like an editorial spread, not a banner split.

Return the exact layout changes you make.
