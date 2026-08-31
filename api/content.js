const { getDb } = require('./_lib/db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  const sql = getDb();
  const rows = await sql`select key, value from content`;
  const map = {};
  rows.forEach(row => { map[row.key] = row.value; });
  res.status(200).json(map);
};
