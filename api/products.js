const { getDb } = require('./_lib/db');
const PRODUCTS = require('../js/products-data.js');

const LIVE_IDS = ['phyllite-jacket', 'lorimer-selvedge-denim', 'lorimer-selvedge-denim-black'];

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const sql = getDb();
  const rows = await sql`select id, name, description, price_cents, images from products`;
  const byId = new Map(rows.map(row => [row.id, row]));

  const payload = LIVE_IDS.map(id => {
    const structural = PRODUCTS.find(p => p.id === id);
    const override = byId.get(id);
    return {
      id,
      name: override?.name ?? structural.name,
      description: override?.description ?? structural.description,
      price: override ? override.price_cents / 100 : structural.price,
      images: override?.images?.length ? override.images : structural.images,
      sizes: structural.sizes,
    };
  });

  res.status(200).json(payload);
};
