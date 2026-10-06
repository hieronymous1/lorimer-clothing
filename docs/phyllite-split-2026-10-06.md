# Phyllite product split

The original `phyllite-jacket` is Wax (€70 by default). Fabric Paint is now
`phyllite-jacket-v2`, named Phyllite Jacket V2 (€80 by default).
Each has its own gallery, product page, database price and inventory by size.
Tops and Jackets feature both, matching the two denim colourways. Shop All
keeps the original opening pair; the product-page swatches link the versions.

Old `finish=fabric-paint` URLs and saved cart lines map to V2. Checkout also
accepts the legacy identity from an already-open browser tab and uses V2's
database price and stock. Wax links and carts map to the original product.

## Release

Before deploying this code to an existing database, with `DATABASE_URL` set:

```sh
node scripts/split-phyllite-products.js
```

The migration creates V2 and converts the original record in one SQL statement.
It preserves the stored finish prices, original product name and copy, and
unrecognised custom images. Known V2 photos are removed from the original
gallery. Subsequent runs preserve CMS edits and inventory.

The former stock was shared. Existing quantities remain with Wax; V2 is
initialised at zero. Enter the actual quantities for both products in Admin
before making V2 available. Fresh databases get both products from `seed.js`.

Released to production on 6 October 2026 at https://www.lorimerclothing.com.
The migration completed successfully. Existing Wax stock remains 10 in Size 1;
all V2 sizes start at zero. The original product copy and uploaded photos were
preserved; V2 uses the fabric-painted description and its separate gallery.
A pre-migration product/inventory backup is stored in the ignored `.vercel/backups/` directory.
