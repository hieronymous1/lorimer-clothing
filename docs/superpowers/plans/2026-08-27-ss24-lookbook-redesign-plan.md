# SS24 Lookbook Redesign Implementation Plan

1. Add a focused Node test that asserts the approved exact copy, six gallery structures, ordered assets, closing image/date, dedicated script, responsive rules, and safe static rendering. Run it and confirm it fails against the current page.
2. Replace the current SS24 markup with semantic, progressively enhanced lookbook sections matching `7.png` and include repository-controlled gallery asset lists.
3. Add isolated SS24 CSS for the reference composition, typography, single right-edge control, focus states, 768px tablet adaptation, 390px mobile stack, and reduced motion.
4. Add a small `js/ss24.js` controller for next-button, keyboard, and swipe navigation using safe DOM properties and deterministic alt text.
5. Run the focused test to green, then all existing Node tests.
6. Serve the site locally and visually verify 1366px, 768px, and 390px viewports, correcting only reference-fidelity or responsive defects.

