# Client Feedback Round (October 2026) Design

**Date:** 2026-10-03
**Status:** Approved in conversation section by section; pending written-spec review
**Branch:** `design/elevation`
**Sources:** `WEBSITE REPORT.Instructions.pdf`, `WEBSITE.REPORT.Visual.pdf`, `PRODUCT_TEXT_LORIMER_READY.pdf` (client transfer, 2026-10-03)

## Goal

Apply the client's October feedback across the homepage, SS24, Products, product detail pages, sold-out archive pages, and checkout, and introduce per-finish pricing for the Phyllite Jacket and correct regional shipping. This is a refinement of the incumbent editorial system (monochrome, Helvetica World uppercase labels, Lora serif body, square corners), not a redesign. Product IDs and URLs stay stable.

## Decisions Already Made

| Topic | Decision |
|---|---|
| Phyllite pricing | One product, priced by finish: WAX €70, FABRIC PAINT €80. Server is authoritative. |
| Phyllite sizes | Size 1, Size 1.5, Size 2, Size 2.5 |
| Phyllite stock | Per size, shared across finishes (finish applied in-house after construction) |
| Archive names | Client's new names everywhere (Appendix A) |
| Archive status | Every non-live piece is SOLD OUT and 1 of 1; the bomber's Inquiry state is removed |
| Custom cursor | Removed site-wide |
| Homepage slideshow | Client's 7 frames from the original 9-photo Group set (supersedes the September six-frame sequence) |
| Homepage denim cover | Stays black (`IMG_3161`), as set in September |
| Fabric Paint card image | `Phyllite Jacket - Photoshoot/IMG_3420.jpg` until the client names one |
| Gallery arrow placement | Vertically centred on each edge (matches client mockups pp. 7, 8, 11) |

## 1. Data and Checkout

### Product data (`js/products-data.js`)

- Archive pieces take the new `name` and `description` from Appendix A and gain `constructedOn` (e.g. `'April 2023'`) and `madeIn` (`'Spain'` or `'Finland'`). Remove `material`, `sizes`, `styleWith`, and `longDescription` from archive pieces. Set `notForSale: true` and `oneOfOne: true` on all of them. Remove any inquiry flag or copy from `deconstructed-bomber`; its `origin` field is replaced by `madeIn`.
- `upcycled-two-piece` moves out of `Accessories` to `category: 'Bottoms', subcategory: 'Skirts'` (it is a blazer and skirt set), so Accessories contains only `distressed-lorimer-cap`.
- Live products:
  - **Lorimer Selvedge Denim (Blue and Black):** description from Appendix B; `material: '100% Cotton Japanese Selvedge Denim, Cowhide Leather, Stainless Steel Hardware'`; remove `longDescription` and `styleWith`.
  - **Phyllite Jacket:** description from Appendix B; `material: '100% Cotton Denim, Stainless Steel Hardware'`; primary image `IMG_2297.jpg` (moved to index 0, removed from its old slot); `sizes: ['Size 1', 'Size 1.5', 'Size 2', 'Size 2.5']`; `finishes: [{ id: 'wax', label: 'WAX', price: 70 }, { id: 'fabric-paint', label: 'FABRIC PAINT', price: 80, image: '…/IMG_3420.jpg' }]`; `price: 70` remains the display default; remove `longDescription` and `styleWith`.
- `scripts/seed.js` mirrors the live-product changes, including `finish_prices`.

### Database

- New idempotent script `scripts/migrate-2026-10.js`:
  - `alter table products add column if not exists finish_prices jsonb`.
  - Upsert name, description, images, `price_cents`, and `finish_prices` (`{"wax": 7000, "fabric-paint": 8000}`) for `phyllite-jacket`; descriptions for both denim IDs.
  - Insert inventory rows for `phyllite-jacket` sizes `Size 1.5` and `Size 2.5` with `stock = 0` when absent; never overwrite existing stock.
- `db/schema.sql` documents the new column.
- `api/products.js` returns `finish_prices` (as euros) alongside the existing fields; `js/products-remote.js` applies them onto `product.finishes[].price`.
- Admin (`api/admin/products.js`, `js/admin.js`) can edit the two finish prices for the Phyllite. Validation: positive integer cents.
- **The migration is never run against Neon without the user's explicit go-ahead.**

### Cart and checkout

- A cart line's identity becomes `id + size + finish`. Same size in WAX and FABRIC PAINT are separate lines. Lines without a finish behave exactly as today.
- `api/checkout.js`:
  - For a product with finishes, `finish` is required and must be a known finish ID; otherwise respond `400`.
  - Unit amount comes from the database `finish_prices[finish]`, falling back to `price_cents` only when `finish_prices` is null. Client-supplied prices are ignored.
  - Stripe line item name includes the finish label (e.g. `Phyllite Jacket (Fabric Paint)`) and metadata includes `finish`.
- Stock checks and decrements stay per size.

### Shipping

- `api/_lib/shipping.js` becomes the single rates table:

| Region | Label | Amount | Countries |
|---|---|---|---|
| `FI` | Finland | €7.90 | FI |
| `EU` | European Union | €14.90 | EU list (unchanged) |
| `UK` | United Kingdom | €19.90 | GB |
| `WW` | Worldwide | €24.90 | Rest of world list minus GB |

- `js/checkout.js` stops hard-coding rates; the region list and amounts are rendered from data served with the page (a small `/api/shipping` GET or an inlined JSON block generated from the same module), so the on-page summary and the Stripe charge cannot drift.

## 2. Products Grid and Product Pages

### Shop layout (`shop.html`, `css/styles.css`, `js/shop.js`)

- Desktop grid becomes `[sidebar] [products] [mirror column]` where sidebar and mirror share one width token. The products column's centre therefore sits on the page centre, under the LORIMER logo. The sidebar gets the header gutter as its inline-start inset, so SHOP ALL no longer hugs the left edge. Mobile keeps its existing filter treatment.
- Card price: `10px` grey to `11px` black (`var(--black)`), `font-variant-numeric: tabular-nums`. Card name unchanged.
- Unfiltered row order (`SHOP_ROWS`) is unchanged; the client's row list matches it. Phyllite card shows `IMG_2297` and `€70`.

### Filtered views

A filter rebuilds the visible grid from matching products instead of hiding cards inside the editorial rows.

- **Featured filters:**
  - `Bottoms` or `Denim`: a featured pair row (same two-up composition as row 1) with Denim Blue and Denim Black, then remaining matches in rows of three.
  - `Tops` or `Jackets`: featured pair of two Phyllite cards, `Phyllite Jacket` / `Wax` / `€70` linking to `product-detail.html?id=phyllite-jacket&finish=wax`, and `Phyllite Jacket` / `Fabric Paint` / `€80` linking to `…&finish=fabric-paint` with the Fabric Paint image. Then remaining matches in rows of three.
- **All other filters:** matches render in a centred track (`justify-content: center`) in rows of up to three. Shirts (three items) form one row. Dresses and Accessories show centred single cards.
- `S/S 24` keeps its complete-look behaviour.
- Results status text (`N products shown`) remains.
- Transition: incoming cards fade from `opacity: 0; transform: translateY(6px)` over `220ms` with `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, staggered `40ms`, capped at the first 6 cards. Reduced motion: opacity only. Use transitions or WAAPI, never `transition: all`.

### Option button component

One `.option-btn` replaces `.size-btn` and `.finish-btn` (and is used for checkout regions in section 4):

- `min-height: 44px; min-width: 72px; padding: 0 16px;` group `gap: 10px`; square corners; `1px solid var(--gray)` border; Helvetica World 11px uppercase.
- Selected: black fill, white text; `background-color`/`color`/`border-color` transition `150ms ease`.
- Press: `transform: scale(.97)` over `120ms` with `--ease-out`. Hover border only under `@media (hover: hover) and (pointer: fine)`.
- Group semantics: `role="radiogroup"` with `aria-labelledby`; options `role="radio"` with `aria-checked`; roving `tabindex`; arrow keys move and select; visible `2px` focus ring with `3px` offset.
- Static variant `.option-btn--static` on a `<span>` (no role, no tabindex) for "1 of 1".

### Live product pages (`product-detail.html`, `js/product.js`)

- Name `14px` to `clamp(18px, 1.5vw, 22px)`, `text-wrap: balance`. Price `13px` to `17px`, tabular numerals.
- Size row: `.option-btn` group with "Size Guide" link at the row's end in black.
- Phyllite: "Select Finish" group (WAX, FABRIC PAINT) above sizes. `?finish=` preselects; default WAX. Changing finish crossfades the price (old and new stacked, `opacity` plus `filter: blur(2px)` on the outgoing value, `200ms`); the price element is `aria-live="polite"`. Reduced motion: opacity only. Add to Cart sends the finish.
- Remove the "Style it with" section on all product pages.
- Descriptions and material lines per section 1.

### Sold-out archive pages

Layout, top to bottom in the info column:

1. Name (same scale as live pages), then `Sold Out` in place of a price.
2. One `.option-btn--static` box reading `1 of 1`.
3. Disabled black `SOLD OUT` button.
4. `Date of Construction: April 2023.` in `11px` Lora, colour `--gray-text`, right-aligned to the button's edge.
5. Description paragraphs (no Material line).
6. `Made in Spain` in the same small style, right-aligned, at the foot of the text column.
7. `← Back to Products` pinned to the column's bottom-left corner (column is a flex column with `min-height` matching the gallery viewport).

Vertical rhythm increases to match the client mockup (pp. 33, 35): `32px` between groups 2 to 5.

New token: `--gray-text: #6b6b73` (about 5.2:1 on white) for muted metadata. `--gray-mid` is no longer used for text.

## 3. Homepage and SS24

### Shared gallery control (`js/ss24.js` `initLookbookGallery`, used by the homepage and SS24)

- Remove `.lookbook-gallery__counter` creation and styles. Dots remain.
- Replace the hover-only half-width zones with edge scrims: each `.lookbook-gallery__nav` is a `72px` strip on its edge (`48px` under 600px wide), background `linear-gradient(to left, rgba(0,0,0,.22), transparent)` (mirrored for prev), chevron `11px` white, `2px` stroke, vertically centred. Visible at rest on every input type; the full strip is the hit target.
- Hover (fine pointer only): gradient alpha to `.34`, chevron `translateX(3px)` outward, `160ms` `--ease-out`.
- Press: chevron `scale(.94)`, `100ms`.
- Image crossfade `350ms ease` to `240ms` `--ease-out`. Reduced motion keeps the fade and drops transforms.
- Nav buttons keep `stopPropagation` so arrows never follow the homepage slideshow link. Buttons keep accessible names ("Previous image", "Next image").

### Homepage (`index.html`)

- Phyllite cover becomes `Phyllite Jacket - Photoshoot/IMG_2297.jpg`. Denim cover stays black `IMG_3161`.
- Preview grid order and names: Mason Jacket 001 (`deconstructed-bomber`), Mercer Shirt 001 (`reconstructed-button-up-1`), Gardner Vest 001 (`zip-up-utility-vest`), Weaver Shorts 001 (`layered-denim-shorts`), Clasper Trousers 002 (`adjustable-button-trousers`, replacing Reinforced Pinstripe Trousers), Weaver Jeans 002 (`layered-denim-jeans`).
- Slideshow `data-gallery-images`, from `assets/ss24/Group/`, in this order (original positions 1, 2, 4, 3, 5, 9, 6):
  1. `F10E840B-0A75-47F7-A778-7E4FCB3E7413.JPG`
  2. `03B5025B-98F5-4A36-A8F9-58516410A806.JPG`
  3. `56AFFC6A-DA54-4CCE-8A62-8D128D74D297.JPG`
  4. `45D39E80-E7CC-4184-AF83-E545F1859F9A.JPG`
  5. `68DD5925-96F3-4CFC-9AD2-BEDD9534A61A.JPG`
  6. `C629834E-4F3B-4A80-90C5-37A555B36A68.JPG`
  7. `773069D2-7E89-4446-9633-C799B9202234.JPG`

  Dropped: `85D9BDA2-….JPG` and `A38B227D-….JPG` (original 7 and 8). The original order is the one on `feat/store-backend` `index.html`; implementation must confirm against that file before writing.

### All pages

- Navbar label `S/S_24` becomes `S/S24`.
- Footer `ABOUT` becomes a link to `about.html` on every page that renders the footer.
- Remove `js/cursor.js` from every page's script list and delete its styles. Product image zoom keeps the magnifier but uses `cursor: zoom-in` and drops `.gallery-detail-cursor`.

### SS24 (`ss24.html`)

- Look 4 image 3 `Facetune_16-05-2024-18-57-12.jpg` is replaced by `DSC_0384.jpg`, copied into `assets/ss24-reedit/Look 4/` so images never cross directories. Alt text updated.
- Looks 1, 3, and 5 (image-left): "View in Products" aligns under the description column, matching looks 2, 4, and 6, via the shared layout rule rather than per-look offsets.
- Product names shown on SS24 (if any) use the new names.

## 4. Checkout

- "Checkout" heading uses the site's uppercase Helvetica World title style.
- Shipping destination becomes a radio group of four `.option-btn`-styled rows (min height `56px`): region label left, price right (tabular numerals), estimated delivery beneath in `--gray-text` (Finland 1–3, EU 3–7, UK 4–8, Worldwide 5–14 business days). Arrow-key navigation and visible focus.
- Selecting a region updates Shipping and Total in the summary with the same price crossfade as product pages.
- Form column max width `440px`; `24px` within groups, `40px` between sections.
- Pay button full column width, `48px` tall. The Stripe address note sits under it in `--gray-text`. Errors inline beneath; existing success and cancelled banners unchanged.
- Order summary lines show finish where present (e.g. `Size 1.5 · Fabric Paint`).

## Testing

Logic is written test-first with `node --test`:

- Shipping: four regions with correct amounts; `GB` resolves to `UK`; unknown region rejected; client and server read the same table.
- Checkout: finish-priced unit amount; unknown or missing finish returns `400`; client-supplied price ignored; Stripe line name includes finish.
- Cart: finish-distinct line identity; finish-less lines unchanged.
- Data: every archive piece has the Appendix A name, `constructedOn`, `madeIn`, `notForSale`, `oneOfOne`, and no `sizes` or `material`; Phyllite has four sizes and two finishes; Accessories contains only the cap.
- Shop: featured pairs for Bottoms, Denim, Tops, Jackets; centred layout for other filters; status count correct.
- Galleries: no counter; both edge controls present; nav click does not follow the slideshow link.
- Homepage: slideshow order, preview order, Phyllite cover; navbar `S/S24`; footer ABOUT link; no page loads `cursor.js`.
- SS24: Look 4 image 3 is `DSC_0384.jpg`.
- Migration: idempotent against a stubbed SQL client; never lowers existing stock.

## Verification

- Full test suite.
- Browser pass at 1440px and 390px for every changed page, keyboard-only and reduced motion included.
- `impeccable detect` on changed UI files, then `design-review`, `web-design-guidelines`, `accessibility`, and `review-animations`; findings fixed in one batch.
- Fresh-context verifier attempts to refute the completed work.
- Stripe test-mode check of per-finish pricing and UK shipping.
- Commits on `design/elevation`. No push, deploy, or Neon migration without explicit user approval.

## Open Items for the Client

- Which photo represents the Fabric Paint Phyllite (default `IMG_3420.jpg`).
- Confirm arrows centred on the edges rather than in the corners.
- Opening stock for Phyllite Size 1.5 and Size 2.5 (default 0).

## Appendix A: Archive Copy

Source of truth: `PRODUCT_TEXT_LORIMER_READY.pdf`. Paragraph breaks are blank lines.

### `deconstructed-bomber`: Mason Jacket 001
Constructed April 2023. Made in Spain.

A bomber jacket rebuilt from unused leather jackets, taken apart, cut into individual pieces and reconstructed into a patchworked shell of 100% reclaimed leather sparking life back into the materials once left unused.

A rayon dark silver grey lining adds shine to the inside of the jacket. Cotton rib knit finishes the cuffs, collar and hem; a stainless steel zip and single flat welt pockets complete the front.

### `zip-up-utility-vest`: Gardner Vest 001
Constructed June 2025. Made in Finland.

The vest is constructed from a polycotton shell with a soft 100% cotton jersey lining inside.

A slim, structured ozark vest comes packed with facings across the front and back, two front pockets, a rib knit collar and a stainless steel zip to finish the garment.

### `westworld-button-up`: Fletcher Shirt 001
Constructed May 2023. Made in Spain.

A modernized western shirt in a midweight blend of 55% cotton and 45% linen fabric. Integrated yokes across the back and shoulders recall classic western tailoring, while the cropped body and elbow-length sleeves remix the silhouette.

The shirt is finished with a camp collar and five embossed metal buttons.

### `layered-denim-shorts`: Weaver Shorts 001
Constructed November 2025. Made in Finland.

The weaver denim takes two layers of fabrics sewn on top of one another: a soft boiled wool jersey fabric underneath with a 100% cotton denim layer on top.

The denim is cut to expose its yarns, which bloom after a careful wash and dry process giving the textile its full effect.

The barrel shaped shorts are fitted to the waist with a longer leg that falls past the knee.

### `layered-denim-jeans`: Weaver Jeans 002
Constructed November 2025. Made in Finland.

The weaver denim takes two layers of fabrics sewn on top of one another: a printed 100% cotton twill underneath with a 100% cotton denim layer on top.

The denim is cut to expose its yarns, which bloom after a careful wash and dry process giving the textile its full effect.

The jeans are a straight cut silhouette with a slight widening taper at the hem.

### `westworld-straight-jeans`: Fletcher Jeans 002
Constructed May 2023. Made in Spain.

Constructed from a blue 100% cotton denim, this straight leg cut pair of jeans tapers wider at the bottom hem to achieve a puddling visual effect over any footwear.

### `reconstructed-button-up-1`: Mercer Shirt 001
Constructed April 2025. Made in Finland.

A reconstruction project made with reclaimed shirts and scraps of fabrics that are brought together into a single shirt made from separate panels.

A boxy fitting shirt with a wider fit and a cropped body, the shirt is finished with a front pocket, six front buttons along with sleeve plackets and cuffs.

### `reconstructed-button-up-2`: Mercer Shirt 002
Constructed April 2025. Made in Finland.

A reconstruction project made with reclaimed shirts and scraps of fabrics that are brought together into a single shirt made from separate panels.

A relaxed regular fit, the shirt is finished with an elevated back yoke, front pocket, six front buttons along with sleeve plackets and cuffs.

### `reinforced-pinstripe-trousers`: Sawyer Trousers 003
Constructed April 2025. Made in Finland.

A lightweight wool crepe fabric with metallic silver pinstriping reinforced with a second layer of lightweight cotton voile fabric attached beneath the top layer, adding weight and a cleaner fall through the leg.

The side seam wraps to the front, and raw hems reveal the bottom layer at the leg opening. A sturdier fabric on the waistband carries the added weight, fastened with a matte black button. Straight cut, flat front, with side adjusters and front pockets.

### `upcycled-two-piece`: Hosier Two Piece 002
Constructed February 2023. Made in Spain.

For this project, a large glen check tweed blazer was upcycled into a two piece set of a cropped blazer jacket and a skirt.

A matching plaid fabric hangs from the side of the skirt with a magnetic button closure system, the skirt is completed with two double welt pockets made from that same plaid fabric.

### `trigall-dress`: Trigall Dress 001
Constructed August 2022. Made in Spain.

Cut from an emerald colored 100% acetate fabric, the dress joins triangular panels to construct a structured top that falls into a full-length skirt with a slit for fluid movement held in harmony by a binding tape in the same emerald tone.

### `overlapped-fray-skirt`: Webster Skirt 003
Constructed May 2023. Made in Spain.

The construction of this skirt comes from cutting our polycotton lightweight fabric into patterns resembling a pair of trousers, these patterns are then overlapped into the shape of a mid-length wrap skirt leaving raw edges which are frayed to create the aspired effect.

The overlapping patterns are held together inside of the waistband with an invisible zipper attached for accessibility.

### `dual-texture-knit-vest`: Franklin Vest 001
Constructed May 2024. Made in Spain.

Two cotton knit fabrics combine together by a contoured seam across the front and back. The rib knit fabric finishes the neck and hem while the boucle knit contours the body.

### `adjustable-button-trousers`: Clasper Trousers 002
Constructed May 2024. Made in Spain.

Black cotton twill trousers with six magnetic closures across from the knee point to the leg opening.

The buttons can be opened or closed adjusting the silhouette of the trousers from an overlapping straight leg shape all the way to a flared bell bottom look.

### `university-striped-sweatshirt`: UoL Sweatshirt 001
Constructed May 2024. Made in Spain.

Crimson boiled wool fabric and black cotton knit fabric pieces are cut into individual panels which are sewn together to create the sweatshirt.

A University of Lorimer collegiate logo is printed across the chest with a distressing finish on the sleeve hems. The sweatshirt comes in a relaxed, boxy fit.

### `mens-straight-trousers`: Foreman Trousers 002
Constructed May 2024. Made in Spain.

A brown pair of trousers with a subtle horizontal green stripe print across constructed from a sturdy cotton twill.

The straight leg shape hugs the legs comfortably and stacks at the hem, the trousers are finished with both side and back pockets.

### `distressed-lorimer-cap`: Sterling Cap 003
Constructed May 2024. Made in Spain.

A distressed logo cap, dyed black after construction for a deep black-on-black finish.

Lorimer is embroidered in cursive at the front in tonal thread achieved by the dyeing process. Frayed edges, one size with an adjustable strap.

### `3d-panel-bomber`: Slater Jacket 001
Constructed May 2024. Made in Spain.

A cropped bomber jacket with built in 3D construction throughout. Each panel is cut from individual triangle pieces, raised and reinforced with firm interfacing which are heat-pressed along the edges to sharpen the effect.

Rib knit finishes along the collar, neck and cuffs, fully lined inside and finished with a stainless steel double-sided zip to complete the jacket.

### `denim-leather-trousers`: Lacquer Trousers 002
Constructed May 2024. Made in Spain.

A wide pair of straight leg trousers transition from a soft polycotton denim crotch into a faux leather leg.

Each leg is built from four panels two on the sides and one on the front and back. Each panel is sewn down with french seams to ensure the leather stays in place, the heavyweight feel gives the trousers a rich drape.

### `asymmetrical-white-top`: Fowler Top 001
Constructed May 2024. Made in Spain.

An asymmetrically cut form fitting top features only one shoulder seam, a contoured seam that wraps around the torso from back to front and elbow cut-outs on the sleeves.

Made from a white lightweight cotton, the fabric stretches to follow the body's silhouette.

### `white-layered-skirt`: Lyster Skirt 004
Constructed May 2024. Made in Spain.

A skirt combining textiles each individually bleach-treated and layered together to form an asymmetrical A-line skirt shape.

Four fabrics including mesh, pleats and ribbing details cut into different shaped panels held together with an elastic waistband to complete the garment.

### `zip-up-top`: Moulder Top 001
Constructed May 2024. Made in Spain.

A fitted top of elastane-blended panels in grey and black that stretch to sculpt the body through curved seams.

Our quarter zip with custom hardware finishes the neckline.

### `womens-wide-trousers`: Carder Trousers 002
Constructed May 2024. Made in Spain.

Lightweight, breathable cotton trousers with an elastic waistband.

The trousers fit tightly at the waist and widen significantly at the leg opening to create its desired silhouette.

### `ss24-dress`: Manuta Dress 001
Constructed May 2024. Made in Spain.

The final look of Spring / Summer 2024. A jumpsuit made from stretchy elastane forms the base with a long sleeve for the left arm which transitions into a taffeta headpiece doubling as a short sleeve for the right arm.

That same taffeta completes the dress as a double layered skirt top layer being a short skirt while the bottom layer falls to ankle length.

## Appendix B: Live Product Copy

### Lorimer Selvedge Denim (Blue and Black)

Constructed from a 100% Japanese Selvedge Denim fabric, a brand new pair arrives as a heavy structured pair which over time molds to the wearer's body and movements enhancing the silhouette to fit the personality of its wearer.

The silhouette is more snug at the waist and thigh area opening up to a wider leg allowing the bottom hem to fall beautifully on any footwear. Refer to the size guide provided for specific measurements.

Finished with a contrasting stitch, back pocket design, strong wide belt loops, a cow leather waistband patch, embroidered coin pocket, a stainless steel button and rivets and roomy pockets with easy access.

Material: 100% Cotton Japanese Selvedge Denim, Cowhide Leather, Stainless Steel Hardware

### Phyllite Jacket

The subtle black two tone denim jacket is separated by its front and back panels seamlessly transitioning throughout the jacket's shoulders, sleeves and sides. Appearing in an exaggerated silhouette with a high crop on the body along with elongated sleeves and stainless steel buttons.

Like a Phyllite stone reaching its metamorphosis due to subjected heat and pressure, the jacket is given an added sheen during an in-house waxing or fabric painted procedure that elevates the jacket's look and feel. The Phyllite Jacket is fully lined inside with a soft and light 100% cotton lining for extra comfort.

Material: 100% Cotton Denim, Stainless Steel Hardware
