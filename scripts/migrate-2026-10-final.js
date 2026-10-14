/* migrate-2026-10-final.js — final revision round. Run once before deploying:
   DATABASE_URL=… node scripts/migrate-2026-10-final.js
   Additive and idempotent; never overwrites admin edits or stock.
   1. Lists the sold-out 1 of 1 pieces in admin so their copy and photo order
      can be edited. They stay unpurchasable: api/checkout.js only sells its
      own LIVE_IDS, and no inventory rows are created.
   2. Creates the Returns & Exchanges Portal table.
   3. Links "Lorimer Returns & Exchanges Portal" in the About returns copy. */
const PRODUCTS = require('../js/products-data.js');

const PORTAL_TEXT = 'Lorimer Returns &amp; Exchanges Portal';
const PORTAL_LINK = `<a href="returns.html">${PORTAL_TEXT}</a>`;

async function migrate(sql) {
  for (const product of PRODUCTS.filter(p => p.notForSale)) {
    await sql`
      insert into products (id, name, description, price_cents, images, finish_prices)
      values (${product.id}, ${product.name}, ${product.description}, ${Math.round(product.price * 100)}, ${JSON.stringify(product.images)}::jsonb, null)
      on conflict (id) do nothing
    `;
  }

  await sql`
    create table if not exists return_requests (
      id bigserial primary key,
      created_at timestamptz not null default now(),
      name text not null,
      email text not null,
      order_ref text not null,
      request_type text not null check (request_type in ('return', 'exchange')),
      item text not null,
      exchange_size text not null default '',
      reason text not null,
      handled boolean not null default false,
      admin_note text not null default ''
    )
  `;

  await sql`
    update content
    set value = replace(replace(value, 'Lorimer Returns & Exchanges Portal', ${PORTAL_TEXT}), ${PORTAL_TEXT}, ${PORTAL_LINK}),
        updated_at = now()
    where key = 'about.returns' and position('returns.html' in value) = 0
  `;
}

module.exports = { migrate, PORTAL_LINK };

if (require.main === module) {
  const { getDb } = require('../api/_lib/db');
  migrate(getDb())
    .then(() => { console.log('migrate-2026-10-final: done'); })
    .catch(error => { console.error(error); process.exitCode = 1; });
}
