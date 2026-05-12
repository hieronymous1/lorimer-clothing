# Phase 01: Audit and plan

Use this prompt first.

## Prompt

Audit the current codebase against the Framer reference and create a precise implementation plan before editing.

### Your tasks

1. Inspect the existing app structure.
2. Identify:
   - layout shell
   - navbar component
   - home hero component
   - shop listing page component
   - product card component
   - product detail page component
   - global CSS or theme tokens
3. Compare the current implementation to the visual target described in this pack.
4. Produce a concise but complete mismatch report grouped into:
   - global system issues
   - homepage issues
   - shop page issues
   - responsive issues
5. Then list the exact files you will change in order.

### Rules

- do not write code yet until the audit is complete
- do not make vague statements like “improve spacing”
- name exact components, wrappers, containers, and styling sources
- call out whether layout is currently using max width containers, centered wrappers, or fixed grid assumptions that are causing the problem

### Deliverable format

Return:
1. mismatch report
2. file level implementation order
3. risks and assumptions
