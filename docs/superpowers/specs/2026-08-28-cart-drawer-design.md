# Cart Drawer Design

**Date:** 2026-08-28  
**Status:** Approved in conversation; pending written-spec review  
**Scope:** Replace the storefront's basic cart presentation with a compact, accessible, Shopify-ready slide-out cart.

## Goals

- Keep shoppers on the current page while they review and edit their cart.
- Open the drawer automatically after a successful Add to Cart action.
- Support quantity changes and removal directly in the drawer.
- Preserve Lorimer's compact, monochrome editorial visual language.
- Keep the current preview safe until a Shopify store is configured.
- Isolate cart presentation from storage so Shopify can replace local preview state without redesigning the drawer.

## Non-goals

- Collecting customer, shipping, or payment information on the static site.
- Simulating a successful checkout before Shopify is connected.
- Creating the Shopify account or catalog in this implementation.
- Replacing product and price data with Shopify data before credentials and variant IDs exist.

## Visual Design

The selected direction is **Compact Utility**.

- The drawer is 380px wide on desktop and full-width on mobile.
- It slides from the right over a dimmed page overlay.
- Styling uses white and black surfaces, hard one-pixel rules, compact mono labels, and no cards, shadows, gradients, or rounded containers.
- The header contains `Cart (quantity)` and an explicit close control.
- Product rows use a 72 × 96px image, product name, selected size, line price, quantity stepper, and remove action.
- Product rows scroll independently when necessary.
- A fixed footer contains the subtotal and checkout action.
- The empty state contains a short message and a return-to-shop action.

## Interaction Design

### Opening

The drawer opens when a shopper:

1. Activates any navigation cart button.
2. Successfully adds a sized product from a product-detail page.

If size validation fails, the existing inline size error remains visible and the drawer does not open.

### Editing

- Increment increases a line's quantity by one, subject to the cart quantity limit.
- Decrement decreases quantity by one; decrementing from one removes the line.
- Remove deletes the line regardless of quantity.
- Each successful edit updates the navigation count, line total, and subtotal.
- When the last line is removed, the drawer remains open and changes to the empty state.

### Closing

The drawer closes through its close control, overlay click, or Escape key. It does not close when the shopper interacts inside the drawer.

### Checkout

- In preview mode, checkout is visibly unavailable and does not navigate to a simulated checkout or collect customer data.
- After Shopify is configured, checkout requests the current Shopify cart `checkoutUrl` and navigates to Shopify's hosted checkout.
- Checkout is unavailable for an empty cart, while cart state is loading, or when Shopify configuration is incomplete.

## Accessibility

- The drawer is an accessible modal dialog with a programmatic label and modal semantics.
- Opening stores the triggering element, moves focus into the drawer, prevents background scrolling, and makes background content unavailable to keyboard and assistive-technology navigation.
- Focus is trapped within the open drawer.
- Closing restores focus to the element that opened it.
- Close, increment, decrement, remove, and checkout have descriptive accessible names and visible focus states.
- Cart changes are announced through a polite live region without moving focus.
- Reduced-motion preference removes the sliding and item-entry animation.

## Architecture

### Drawer view

The drawer module owns modal behavior and safe DOM rendering. It receives normalized cart state and invokes cart-service operations; it does not read or write storage directly.

### Cart service

The service boundary exposes these operations:

- `getCart()`
- `addLine(product, size)`
- `updateLineQuantity(id, size, quantity)`
- `removeLine(id, size)`
- `getCount()`
- `getSubtotal()`
- `beginCheckout()`

The initial adapter uses the existing validated localStorage representation. A later Shopify adapter maps each size selection to a Shopify merchandise variant, uses Storefront Cart mutations for line changes, treats Shopify's response as authoritative, and returns the current hosted checkout URL.

The public Storefront API credential may be present in browser code when Shopify is connected, but private Admin API credentials, webhook secrets, and payment secrets must never enter the client bundle or repository.

## State and Error Handling

The local preview adapter updates synchronously. The future Shopify adapter will:

- Disable the affected controls while a mutation is pending.
- Coalesce or reject repeated interactions for the same pending line.
- Reconcile the UI to Shopify's returned quantity, cost, warnings, and availability.
- Restore the last confirmed state and show an inline retry action if a mutation fails.
- Keep the drawer open for stock and network errors.
- Request a fresh checkout URL only when checkout begins.

Stored cart content remains untrusted. Product text is rendered with text nodes, image paths are restricted to local asset paths in preview mode, quantities and prices are bounded, and malformed roots resolve to an empty cart.

## Responsive Behavior

- Above the mobile breakpoint, the drawer is 380px wide.
- At the mobile breakpoint and below, the drawer occupies the viewport width.
- The footer remains visible above the mobile browser's safe-area inset.
- Product controls retain at least 44px interactive targets without making the rows visually bulky.

## Verification

Automated tests cover:

- Drawer injection before event binding.
- Nav-trigger opening and Add to Cart auto-opening.
- Close button, overlay, and Escape behavior.
- Focus entry, focus trap, background isolation, and focus restoration.
- Increment, decrement, removal, count, line-total, and subtotal updates.
- Empty-state transition and unavailable checkout state.
- Safe rendering of hostile or malformed stored values.
- Quantity and monetary bounds.
- Desktop and mobile CSS contracts.
- Reduced-motion behavior.

Browser verification covers desktop and mobile presentation, scroll containment, keyboard-only operation, and the complete add-edit-remove flow.

## Shopify Connection Follow-up

After the merchant creates a Shopify Basic store:

1. Create the two products and their size variants in Shopify.
2. Record the Shopify variant IDs against the site's product/size data.
3. Configure Storefront API access outside tracked secret files.
4. Replace the preview adapter with the Shopify Cart adapter.
5. Verify stock errors, international pricing, shipping configuration, test payments, order emails, and return URLs in a Shopify test environment before launch.
