# Skill Observation Log

Observations captured during task-oriented work. Each entry identifies a potential skill improvement or new skill opportunity.

**Status key:** OPEN = not yet actioned | ACTIONED = skill updated/created | DECLINED = user decided not to pursue

---

## 2026-08-27 — Storefront navigation and footer revision

### Observation 1: Separate reference content from reference styling

**Status:** OPEN
**Date:** 2026-08-27
**Session context:** Updating an existing storefront from user-supplied navigation and footer screenshots.
**Skill:** brainstorming
**Type:** open-source
**Phase/Area:** Requirements clarification for visual references

**Issue:** A request to use the content and alignment from a visual reference did not necessarily authorize replacing the existing interface's typography and styling. The user later clarified that those established visual traits should remain unchanged.

**Suggested improvement:** In the visual-reference clarification step, distinguish content, alignment/layout, typography, color, borders, spacing, and interaction. Explicitly record which layers should be copied and which existing layers should be preserved.

**Principle:** Treat a reference image as a set of independently adoptable design attributes, not an instruction to copy every visible characteristic.

### Observation 2: Keep design-reference routes synchronized with the library

**Status:** OPEN
**Date:** 2026-08-28
**Session context:** Designing and implementing a compact ecommerce cart drawer for an existing editorial storefront.
**Skill:** design-inspiration
**Type:** open-source
**Phase/Area:** Reference routing

**Issue:** The skill's router pointed to `references/design-direction.md` and pattern-bucket paths for source-site references, while the installed library had moved those resources to `references/core/` and `references/source-sites/`. Following the documented paths produced avoidable missing-file errors before the current locations were discovered.

**Suggested improvement:** Update the router and always-read paths to match the installed directory structure, or add a lightweight index-based resolution step that treats `references/INDEX.md` as the source of truth.

**Principle:** A reference-routing skill should validate its own paths against a canonical index so library reorganizations do not break the workflow.

### Observation 3: Document the MCP fallback when the Playwright CLI binary is absent

**Status:** OPEN
**Date:** 2026-08-28
**Session context:** Browser-verifying a local responsive storefront after frontend implementation.
**Skill:** playwright-cli
**Type:** open-source
**Phase/Area:** Environment detection and fallback routing

**Issue:** The skill prescribed `playwright-cli` commands, but the binary was not installed even though equivalent Playwright MCP browser controls were available. The workflow had to discover the MCP tools separately after the CLI command failed.

**Suggested improvement:** Add a preflight command-availability check and explicitly route to equivalent Playwright MCP browser controls when the CLI binary is absent. Installing a new binary should remain optional when existing browser automation can complete verification.

**Principle:** Tool-specific automation skills should define a capability-equivalent fallback so environment packaging differences do not interrupt validation.

### Observation 4: Preflight the Python Playwright dependency before writing a smoke test

**Status:** OPEN
**Date:** 2026-09-01
**Session context:** End-to-end verification of a local ecommerce admin and Stripe Checkout flow.
**Skill:** webapp-testing
**Type:** open-source
**Phase/Area:** Environment detection and fallback routing

**Issue:** The skill prescribed native Python Playwright scripts, but the Python `playwright` package was absent while an existing browser-control surface could perform the same local UI validation. A smoke script was written before that dependency gap was detected.

**Suggested improvement:** Add an initial dependency check for both the Python interpreter and `playwright` module. If either is unavailable, route directly to an installed browser-control capability before creating a test script or installing new packages.

**Principle:** Automation workflows should verify their required runtime and library together before generating harness code, then prefer an already-installed capability-equivalent fallback.
