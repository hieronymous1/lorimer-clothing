const { getDb } = require('../_lib/db');
const { isAuthenticated } = require('../_lib/session');

module.exports = async function handler(req, res) {
  if (!isAuthenticated(req, process.env.SESSION_SECRET)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const sql = getDb();

  if (req.method === 'GET') {
    const rows = await sql`select key, value from content order by key`;
    res.status(200).json(rows);
    return;
  }

  if (req.method === 'PUT') {
    const { key, value } = req.body || {};
    if (typeof key !== 'string' || typeof value !== 'string') {
      res.status(400).json({ error: 'invalid content payload' });
      return;
    }
    await sql`
      insert into content (key, value, updated_at) values (${key}, ${value}, now())
      on conflict (key) do update set value = excluded.value, updated_at = now()
    `;
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
