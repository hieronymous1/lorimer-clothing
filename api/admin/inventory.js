const { getDb } = require('../_lib/db');
const { isAuthenticated } = require('../_lib/session');

module.exports = async function handler(req, res) {
  if (!isAuthenticated(req, process.env.SESSION_SECRET)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const sql = getDb();

  if (req.method === 'GET') {
    const rows = await sql`select product_id, size, stock from inventory order by product_id, size`;
    res.status(200).json(rows);
    return;
  }

  if (req.method === 'PUT') {
    const { product_id, size, stock } = req.body || {};
    if (typeof product_id !== 'string' || typeof size !== 'string' || !Number.isInteger(stock) || stock < 0) {
      res.status(400).json({ error: 'invalid inventory payload' });
      return;
    }
    await sql`update inventory set stock = ${stock} where product_id = ${product_id} and size = ${size}`;
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
