# Lorimer Homepage Redesign

Date: 2026-08-27

## Goal

Redesign the homepage around a single promotional video, a clean scroll-driven split reveal, more legible navigation, and a more spacious image-led product presentation. Use the latest supplied photography throughout.

## Page sequence

1. Fixed site navigation.
2. A single full-width promo-video hero using `Lorimer_Promo_21-8_Export_Video.mp4`.
3. The existing large Lorimer logo and section navigation.
4. Two featured Denim1 studio products.
5. A six-image product preview grid.
6. The SS/24 editorial preview.
7. Existing information/footer content.

The existing first two hero media rows are removed.

## Hero interaction

- The promo video autoplays muted, loops, and uses `playsinline`.
- A visible, keyboard-accessible play/pause control remains available over the hero and exposes its state with an accessible label.
- The hero is pinned for a controlled scroll interval.
- At the start it appears as one uninterrupted frame.
- As the visitor scrolls, two visually identical video layers clipped to the left and right halves move horizontally off-screen, creating a precise vertical aperture.
- Treat one video as the playback clock and keep the second layer synchronized to it: start both from the same readiness event, mirror play/pause/seek state, and correct meaningful `currentTime` drift during playback. Hide the split until both layers can render the same frame.
- The split reveals the existing Lorimer logo/navigation interlude underneath.
- Motion remains linear in direction but uses eased scroll interpolation to avoid jitter.
- The video may scale very slightly during the reveal, but there is no rotation, diagonal seam, or decorative distortion.
- Once the panels clear, normal document scrolling continues into the product content.
- With `prefers-reduced-motion: reduce`, the pinned choreography is removed and the video transitions to the logo/content with a simple fade or static sequence.

## Navigation and typography

- Preserve the existing Lorimer logo and minimalist monochrome visual language.
- Increase the size and spacing of `SS/24`, product/shop, about, cart, and logo-section navigation labels.
- Increase interactive target padding without adding visible button chrome.
- Maintain clear keyboard focus styles and avoid layout collisions at narrow widths.

## Product presentation

- Use the final color-corrected images in `/Users/adam/Downloads/Lorimer_Photoshoot/Color.Corrected` as the primary source for Denim1 and homepage product photography.
- Replace the names-only lower preview row with complete linked product cards containing images and labels.
- Follow the reference flow: two larger featured studio-product cards followed by six smaller preview cards.
- Add materially more whitespace between cards and between page sections. Desktop grids should feel editorial rather than catalogue-dense.
- Product-card hover treatment uses a charcoal translucent overlay and a centered `View product` label; keyboard focus must expose an equivalent affordance.
- Use gentle staggered reveal transitions for cards entering the viewport.
- Retain real product names and valid product-detail links from the current product data.

## SS/24 section

- Use the final imagery from `swisstransfer_b87e9962-7cc3-42b3-aa3e-12c022cdf43e.zip` (`SS24_ReEdit`).
- Keep the existing SS/24 narrative and destination, but replace outdated imagery with a suitable final group/editorial image.
- Preserve the spacious image-and-copy composition shown in the supplied third reference PNG.

## Asset handling

- Copy the approved promo video and selected final photographs into project-owned asset directories; runtime markup must not reference the Downloads folder.
- Use web-safe filenames and relative URLs.
- Preserve source files in Downloads.
- Set explicit image dimensions or aspect ratios to prevent layout shift, and use lazy loading below the fold.
- Provide useful alt text for informative imagery and empty alt text only for genuinely decorative duplicates.

## Responsive behavior

- Desktop retains the two-panel horizontal split and multi-column editorial grids.
- Tablet reduces gaps and card columns without compressing labels.
- Mobile keeps the video full-bleed, simplifies the split timing, stacks the featured products, and uses a two-column or single-column preview based on available width.
- Use fluid spacing and type scales with bounded `clamp()` values.

## Implementation boundaries

- Keep the site framework-free and follow the existing HTML/CSS/JavaScript organization.
- Implement hero behavior in the existing homepage script, presentation in the stylesheet, and semantic structure in `index.html`.
- Avoid new third-party runtime dependencies.
- Existing cart, product-detail, shop, and checkout behavior must remain unchanged.

## Verification

- Confirm the intended video is the only hero media and begins playback when browser policy permits.
- Verify the split is visually seamless and the page resumes normal scrolling after the reveal.
- Verify playback synchronization at the center seam while the video is moving, after tab visibility changes, and after play/pause or seeking.
- Verify the hero play/pause control by mouse, touch, and keyboard and confirm its accessible name reflects the current action.
- Verify every homepage product label has an image and valid destination.
- Check desktop, tablet, and mobile layouts.
- Check keyboard navigation, visible focus, reduced-motion behavior, missing-asset errors, and browser console errors.
- Run the existing security/storefront tests and add targeted homepage tests where practical.
