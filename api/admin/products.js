const { getDb } = require('../_lib/db');
const { isAuthenticated } = require('../_lib/session');

module.exports = async function handler(req, res) {
  if (!isAuthenticated(req, process.env.SESSION_SECRET)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const sql = getDb();

  if (req.method === 'GET') {
    const rows = await sql`select id, name, description, price_cents, images from products order by id`;
    res.status(200).json(rows);
    return;
  }

  if (req.method === 'PUT') {
    const { id, name, description, price_cents, images } = req.body || {};
    if (
      typeof id !== 'string' || typeof name !== 'string' || typeof description !== 'string' ||
      !Number.isInteger(price_cents) || price_cents < 0 || !Array.isArray(images)
    ) {
      res.status(400).json({ error: 'invalid product payload' });
      return;
    }
    await sql`
      update products
      set name = ${name}, description = ${description}, price_cents = ${price_cents},
          images = ${JSON.stringify(images)}::jsonb, updated_at = now()
      where id = ${id}
    `;
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
