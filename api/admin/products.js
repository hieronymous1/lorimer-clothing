const { getDb } = require('../_lib/db');
const { isAuthenticated } = require('../_lib/session');
const PRODUCTS = require('../../js/products-data.js');

function validFinishPrices(productId, value) {
  if (value === undefined || value === null) return true;
  if (typeof value !== 'object' || Array.isArray(value)) return false;
  const structural = PRODUCTS.find(p => p.id === productId);
  const known = Array.isArray(structural?.finishes) ? structural.finishes.map(f => f.id) : [];
  return Object.entries(value).every(([key, cents]) => known.includes(key) && Number.isInteger(cents) && cents > 0);
}

module.exports = async function handler(req, res) {
  if (!isAuthenticated(req, process.env.SESSION_SECRET)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const sql = getDb();

  if (req.method === 'GET') {
    const rows = await sql`select id, name, description, price_cents, images, finish_prices from products order by id`;
    res.status(200).json(rows);
    return;
  }

  if (req.method === 'PUT') {
    const { id, name, description, price_cents, images, finish_prices } = req.body || {};
    if (
      typeof id !== 'string' || typeof name !== 'string' || typeof description !== 'string' ||
      !Number.isInteger(price_cents) || price_cents < 0 || !Array.isArray(images)
    ) {
      res.status(400).json({ error: 'invalid product payload' });
      return;
    }
    if (!validFinishPrices(id, finish_prices)) {
      res.status(400).json({ error: 'invalid finish prices' });
      return;
    }
    await sql`
      update products
      set name = ${name}, description = ${description}, price_cents = ${price_cents},
          images = ${JSON.stringify(images)}::jsonb, updated_at = now()
      where id = ${id}
    `;
    if (finish_prices !== undefined) {
      await sql`
        update products
        set finish_prices = ${finish_prices ? JSON.stringify(finish_prices) : null}::jsonb
        where id = ${id}
      `;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
