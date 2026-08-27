# Navigation, Footer, and SS24 Preview Design

## Scope

Refine the shared storefront navigation and footer, and restyle the homepage SS24 preview to match the user-provided references. Preserve the current monochrome typography, assets, cart drawer, and responsive behavior.

## Navigation

- Remove the visible `HOME` item.
- Make the `LORIMER®` wordmark the homepage link.
- Use five evenly spaced desktop positions in this order: `S/S_24`, `SHOP`, `LORIMER®`, `ABOUT`, `CART (0)`.
- Keep the logo in the true center position.
- Display the cart quantity at all times inside parentheses. An empty cart reads `CART (0)`; populated carts read the summed item quantity, such as `CART (3)`.
- Retain keyboard focus states, current-page indication, and the existing cart-drawer button behavior.
- Apply the shared navigation structure consistently to all storefront pages.
- On narrow screens, retain all essential destinations and allow smaller type/spacing without hiding the logo or cart count.

## Homepage SS24 Preview

- Replace the large split-screen editorial treatment with the compact horizontal composition in the supplied reference.
- Use the existing final runway image (`assets/photos/home/ss24-editorial.jpg`) on the left.
- Place the text immediately to its right: label `Spring/Summer 24` and copy `SS24 Featuring 6 original looks available for viewing in Shop and S/S24 page`.
- Place an underlined `View in S/S24` link at the far right, aligned toward the lower edge of the module.
- Keep the module comfortably within one viewport and stack it cleanly on small screens without overlap.

## Footer

- Use the supplied minimal, borderless two-column reference across storefront pages.
- Left column: `ABOUT`, `© Lorimer 2026`, `Helsinki, 00750`.
- Right column: `NEWSLETTER`, `contact@lorimer.com`, `@Lorimer.Clo`.
- Right-align the second column on desktop and left-align it when stacked on narrow screens.
- Use normal capitalization from the reference rather than forcing all footer content to uppercase.

## Data and Safety

- Read the existing cart through `getCount()` and render the result with `textContent`; do not build markup from cart values.
- Keep the cart count synchronized after initial load and after cart mutations already handled by the shared cart code.
- Use normal `mailto:` and Instagram links for footer contact items; no new external scripts or dependencies.

## Verification

- Automated checks confirm every page omits the old HOME link, includes the centered home-linked logo, and contains a visible parenthesized cart count.
- Verify the count starts at zero and changes when product quantities change.
- Verify the homepage SS24 preview and footer copy, image, links, and layout.
- In a live browser, confirm equal desktop nav spacing, true logo centering, no section overlap, responsive stacking, and working cart drawer behavior.
