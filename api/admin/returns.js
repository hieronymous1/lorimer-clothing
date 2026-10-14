const { getDb } = require('../_lib/db');
const { isAuthenticated } = require('../_lib/session');

module.exports = async function handler(req, res) {
  if (!isAuthenticated(req, process.env.SESSION_SECRET)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const sql = getDb();

  if (req.method === 'GET') {
    const rows = await sql`
      select id::text as id, to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at, name, email, order_ref, request_type,
             item, exchange_size, reason, handled, admin_note
      from return_requests order by handled, created_at desc limit 200
    `;
    res.status(200).json(rows);
    return;
  }

  if (req.method === 'PUT') {
    const { id, handled, admin_note } = req.body || {};
    if (typeof id !== 'string' || !/^\d+$/.test(id) || typeof handled !== 'boolean' ||
      typeof admin_note !== 'string' || admin_note.length > 2000) {
      res.status(400).json({ error: 'invalid return payload' });
      return;
    }
    const rows = await sql`
      update return_requests set handled = ${handled}, admin_note = ${admin_note}
      where id = ${id} returning id
    `;
    if (!rows.length) {
      res.status(404).json({ error: 'Return request not found. Reload the page.' });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
