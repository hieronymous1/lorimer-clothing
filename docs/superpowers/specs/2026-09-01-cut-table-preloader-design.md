# Cut Table Preloader Design

## Intent

Add a distinctive homepage-entry preloader without using campaign footage. The sequence should feel like a garment pattern table and use Lorimer's supplied identity assets rather than recreated typography.

## Visual system

- Use the existing pure-white and black tokens.
- Divide the viewport into six equal columns with fine black rules.
- Draw the supplied `assets/logo.png` wordmark horizontally at the center.
- Place the supplied `assets/apple-touch-icon.png` mark on a pure-white footer surface so its bitmap background disappears visually.
- Pair a two-character loading value from 00–99 (expanding to three characters at 100) with small Inter utility labels and the existing display stack.

## Behavior and timing

The displayed value is simulated progress gated by the real `window.load` event: it advances asymptotically toward 92 before `load`, then advances to 100. It does not claim byte-level resource progress. The sequence has a 900ms minimum duration. On completion, the six panels retract over 620ms with 40ms stagger increments, and the overlay is removed within 900ms of dismissal.

A 4500ms JavaScript timeout takes precedence over the minimum duration, sets the display to 100, and begins the normal panel exit. Pointer and keyboard interaction remain blocked during that exit and are restored when dismissal completes within 900ms. A CSS-only failsafe hides the overlay and restores scrolling after 5500ms if JavaScript starts but fails before cleanup; the time-bounded keyboard guard also becomes a no-op at that deadline.

The sequence is authored only in the root `index.html`; query strings and fragments therefore do not affect activation. Internal static pages and their navigation remain uninterrupted. The project has no client-side router, locale prefix, or hydration layer to account for.

## Accessibility and resilience

- Expose one static “Loading Lorimer” polite status message. The rapidly changing visual number is hidden from assistive technology so it is not repeatedly announced.
- Hide decorative structure from assistive technology.
- The overlay blocks pointer input while visible. A keyboard guard suppresses Tab only while the overlay is connected, including its exit; the guard automatically becomes a no-op after the 5500ms fail-open deadline and is removed when dismissal finishes. This avoids persistent native `inert` state after partial JavaScript failure.
- Under reduced motion, CSS suppresses the overlay before animation and restores scrolling; JavaScript also removes it without minimum duration or transition.
- Use a `noscript` fallback for disabled JavaScript and a 5500ms CSS fail-open for partial JavaScript failure.
- Keep the background exactly white across the overlay, panels, and icon surface.

## Verification

Automated tests cover brand assets, absence of video, six-panel structure, pure-white surfaces, responsive rules, reduced motion, load gating, keyboard-guard cleanup, and forced release. Desktop uses an 84vw centered wordmark, 20px edge metadata, and 62px brand mark. At 768px and below, the wordmark becomes 90vw, edges reduce to 16px, secondary header and center footer labels hide, the brand mark becomes 46px, and the counter scales between 58px and 86px. Browser verification covers desktop and mobile entry and confirms that the underlying homepage becomes focusable and scrollable after dismissal.
