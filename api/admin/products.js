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
    const rows = await sql`select id, name, description, price_cents, images, finish_prices, updated_at::text as updated_at from products order by id`;
    res.status(200).json(rows);
    return;
  }

  if (req.method === 'PUT') {
    const { id, name, description, price_cents, images, finish_prices, updated_at } = req.body || {};
    if (
      typeof id !== 'string' || typeof name !== 'string' || typeof description !== 'string' ||
      !Number.isInteger(price_cents) || price_cents < 0 || !Array.isArray(images) ||
      !images.every(image => typeof image === 'string' && /^(https:\/\/|\.?\/assets\/)/.test(image)) ||
      (updated_at !== undefined && (typeof updated_at !== 'string' || !Number.isFinite(Date.parse(updated_at))))
    ) {
      res.status(400).json({ error: 'invalid product payload' });
      return;
    }
    if (!validFinishPrices(id, finish_prices)) {
      res.status(400).json({ error: 'invalid finish prices' });
      return;
    }
    const rows = await sql`
      update products
      set name = ${name}, description = ${description}, price_cents = ${price_cents},
          images = ${JSON.stringify(images)}::jsonb,
          finish_prices = case when ${finish_prices !== undefined} then ${finish_prices ? JSON.stringify(finish_prices) : null}::jsonb else finish_prices end,
          updated_at = now()
      where id = ${id} and (${updated_at ?? null}::timestamptz is null or updated_at = ${updated_at ?? null}::timestamptz)
      returning id, name, description, price_cents, images, finish_prices, updated_at::text as updated_at
    `;
    if (!rows.length) {
      res.status(updated_at ? 409 : 404).json({ error: updated_at
        ? 'This product changed in another session. Copy your edits, reload, and compare before saving again.'
        : 'Product not found. Reload the editor.' });
      return;
    }
    res.status(200).json({ ok: true, product: rows[0] });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
