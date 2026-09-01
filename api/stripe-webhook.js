const Stripe = require('stripe');
const { getDb } = require('./_lib/db');

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', chunk => chunks.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers['stripe-signature'];
  const rawBody = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).json({ error: `signature verification failed: ${err.message}` });
    return;
  }

  const sql = getDb();
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    if (session.payment_status === 'paid') {
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items.data.price.product'],
      });

      const lines = [];
      for (const item of fullSession.line_items?.data || []) {
        const metadata = item.price?.product?.metadata || {};
        const productId = metadata.product_id;
        const size = metadata.size;
        if (!productId || !size) continue;

        lines.push({ product_id: productId, size, quantity: item.quantity });
      }

      const [result] = await sql`
        with claimed as (
          insert into webhook_events (event_id) values (${event.id})
          on conflict (event_id) do nothing
          returning event_id
        ), lines as (
          select * from jsonb_to_recordset(${JSON.stringify(lines)}::jsonb)
          as line(product_id text, size text, quantity integer)
        ), updated as (
          update inventory
          set stock = greatest(inventory.stock - lines.quantity, 0)
          from lines, claimed
          where inventory.product_id = lines.product_id and inventory.size = lines.size
          returning inventory.product_id
        )
        select (select count(*) from claimed)::integer as claimed,
               (select count(*) from updated)::integer as updated
      `;
      res.status(200).json({ ok: true, duplicate: result.claimed === 0 });
      return;
    }
  }

  await sql`
    insert into webhook_events (event_id) values (${event.id})
    on conflict (event_id) do nothing
  `;

  res.status(200).json({ ok: true });
}

handler.config = { api: { bodyParser: false } };
module.exports = handler;
