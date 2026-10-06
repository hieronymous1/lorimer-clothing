/* Split the former Phyllite finish options into independent products.
   Run before deploying the split storefront: node scripts/split-phyllite-products.js
   Uses DATABASE_URL; safe to rerun and never duplicates existing stock. */
const PRODUCTS = require('../js/products-data.js');

async function migrate(sql) {
  const wax = PRODUCTS.find(product => product.id === 'phyllite-jacket');
  const painted = PRODUCTS.find(product => product.id === 'phyllite-jacket-v2');
  await sql`alter table products add column if not exists finish_prices jsonb`;

  // Both product changes happen in one statement. The inserted row is the
  // one-time guard, so rerunning cannot replace subsequent CMS edits.
  await sql`
    with inserted as (
      insert into products (id, name, description, price_cents, images, finish_prices)
      values (
        ${painted.id}, ${painted.name},
        coalesce((select description from products where id = ${wax.id}), ${painted.description}),
        coalesce((select (finish_prices->>'fabric-paint')::integer from products where id = ${wax.id}), ${Math.round(painted.price * 100)}),
        ${JSON.stringify(painted.images)}::jsonb, null
      )
      on conflict (id) do nothing
      returning id
    )
    update products
    set price_cents = coalesce((finish_prices->>'wax')::integer, price_cents),
        images = coalesce((
          select jsonb_agg(photo order by position)
          from jsonb_array_elements_text(images) with ordinality as gallery(photo, position)
          where not (${JSON.stringify(painted.images)}::jsonb ? photo)
        ), '[]'::jsonb),
        finish_prices = null,
        updated_at = now()
    where id = ${wax.id} and exists (select 1 from inserted)
  `;

  // The former inventory was shared; do not copy it into a second product.
  // Keep existing stock with Wax and initialise V2 for the owner to count.
  for (const product of [wax, painted]) {
    for (const size of product.sizes) {
      await sql`
        insert into inventory (product_id, size, stock)
        values (${product.id}, ${size}, 0)
        on conflict (product_id, size) do nothing
      `;
    }
  }
}

module.exports = { migrate };

if (require.main === module) {
  migrate(require('../api/_lib/db').getDb())
    .then(() => console.log('Phyllite products separated. Set V2 stock in Admin.'))
    .catch(error => { console.error(error); process.exitCode = 1; });
}
