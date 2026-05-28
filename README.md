# Lorimer Storefront

Headless editorial storefront baseline built with `Next.js 15`, `TypeScript`, and `Tailwind CSS`.

## Current Surface
- `app/`: active storefront routes
- `components/`: shared editorial UI
- `lib/`: seed parsing, storefront mapping, integration stubs, and inquiry schema
- `public/assets/FINAL PICS WEBSITE/`: current image source copied into the app
- `site/`: legacy static implementation used as the current seed source
- `scripts/export-seed.mjs`: exports structured seed files for Shopify and Sanity migration

## Commands
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run seed:export`

## Environment
Copy `.env.example` and set the values you actually have:
- `NEXT_PUBLIC_SITE_URL`
- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_TOKEN`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_TO_EMAIL`

## Notes
- Shopify and Sanity are still wired as integration boundaries, not live data sources yet.
- Inquiry submissions work immediately and send through Resend when email env vars are configured.
- The current catalog and editorial content still come from `site/data.js` until external systems replace it.
