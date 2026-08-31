const Stripe = require('stripe');
const { getDb } = require('../_lib/db');
const { isAuthenticated } = require('../_lib/session');

module.exports = async function handler(req, res) {
  if (!isAuthenticated(req, process.env.SESSION_SECRET)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const sql = getDb();

  if (req.method === 'GET') {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sessions = await stripe.checkout.sessions.list({ limit: 50, expand: ['data.line_items'] });
    const noteRows = await sql`select session_id, fulfilled, tracking from order_notes`;
    const notesById = new Map(noteRows.map(row => [row.session_id, row]));

    const orders = sessions.data
      .filter(session => session.payment_status === 'paid')
      .map(session => ({
        id: session.id,
        customer_email: session.customer_details?.email || '',
        amount_total: session.amount_total,
        currency: session.currency,
        created: session.created,
        items: (session.line_items?.data || []).map(item => ({
          description: item.description,
          quantity: item.quantity,
        })),
        fulfilled: notesById.get(session.id)?.fulfilled ?? false,
        tracking: notesById.get(session.id)?.tracking ?? '',
      }));

    res.status(200).json(orders);
    return;
  }

  if (req.method === 'PUT') {
    const { session_id, fulfilled, tracking } = req.body || {};
    if (typeof session_id !== 'string' || typeof fulfilled !== 'boolean' || typeof tracking !== 'string') {
      res.status(400).json({ error: 'invalid order note payload' });
      return;
    }
    await sql`
      insert into order_notes (session_id, fulfilled, tracking, updated_at)
      values (${session_id}, ${fulfilled}, ${tracking}, now())
      on conflict (session_id) do update set fulfilled = excluded.fulfilled, tracking = excluded.tracking, updated_at = now()
    `;
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
