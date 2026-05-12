# Phase 02: Global system rebuild

After the audit, use this prompt.

## Prompt

Rebuild the global visual system so the whole site starts from the correct foundation.

### You must implement

1. A strict spacing scale
2. A clear typographic system
3. A page shell system
4. Consistent desktop side paddings 
5. A restrained color system
6. Stable image rendering rules
7. A global container strategy that does not default to centered ecommerce layout

### Design intent

The site should feel like an editorial fashion composition.
Whitespace should be structured, not accidental.
The interface should become calmer and more expensive looking.

### Required system decisions

#### Spacing scale
Use a fixed scale only.
Recommended:
- 4
- 8
- 12
- 16
- 24
- 32
- 48
- 64
- 96
- 128

No arbitrary values unless required by the reference.

#### Typography
Establish:
- a brand / masthead treatment
- a navigation treatment
- a product title treatment
- a body / meta treatment

Aim for:
- serif or serif like editorial feel for navigation and product names if aligned with current brand
- subtle tracking control
- disciplined line height
- no oversized generic UI text

#### Colors
Keep minimal:
- soft off white or pale grey background
- near black text
- muted secondary text
- subtle divider color

#### Page shell
Desktop padding should feel generous.
The site should breathe horizontally.

### Code expectations

- create or refine reusable tokens if possible
- reduce duplicated inline style values
- centralize layout decisions
- do not yet over tune page specific micro details until the foundation is in place

### Deliverable

Implement the global system, then summarize:
- files changed
- tokens created
- how this supports the later page rebuilds
