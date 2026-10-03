/* migrate-2026-10.js — October 2026 client feedback round.
   Additive and idempotent. Run only with explicit approval:
   DATABASE_URL=… node scripts/migrate-2026-10.js */
const PRODUCTS = require('../js/products-data.js');

const LIVE_IDS = ['phyllite-jacket', 'lorimer-selvedge-denim', 'lorimer-selvedge-denim-black'];
const NEW_PHYLLITE_SIZES = ['Size 1.5', 'Size 2.5'];

function finishPricesCents(product) {
  if (!Array.isArray(product.finishes)) return null;
  return Object.fromEntries(product.finishes.map(f => [f.id, Math.round(f.price * 100)]));
}

async function migrate(sql) {
  await sql`alter table products add column if not exists finish_prices jsonb`;

  for (const id of LIVE_IDS) {
    const product = PRODUCTS.find(p => p.id === id);
    const prices = finishPricesCents(product);
    await sql`
      update products set
        description = ${product.description},
        images = ${JSON.stringify(product.images)}::jsonb,
        price_cents = ${Math.round(product.price * 100)},
        finish_prices = ${prices ? JSON.stringify(prices) : null}::jsonb,
        updated_at = now()
      where id = ${id}
    `;
  }

  for (const size of NEW_PHYLLITE_SIZES) {
    await sql`insert into inventory (product_id, size, stock) values (${'phyllite-jacket'}, ${size}, 0) on conflict (product_id, size) do nothing`;
  }
}

module.exports = { migrate };

if (require.main === module) {
  const { getDb } = require('../api/_lib/db');
  migrate(getDb())
    .then(() => { console.log('migrate-2026-10: done'); })
    .catch(error => { console.error(error); process.exitCode = 1; });
}
