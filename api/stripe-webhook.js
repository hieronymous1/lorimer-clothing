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
  const claimed = await sql`
    insert into webhook_events (event_id) values (${event.id})
    on conflict (event_id) do nothing
    returning event_id
  `;
  if (claimed.length === 0) {
    res.status(200).json({ ok: true, duplicate: true });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data.price.product'],
    });

    for (const item of fullSession.line_items?.data || []) {
      const metadata = item.price?.product?.metadata || {};
      const productId = metadata.product_id;
      const size = metadata.size;
      if (!productId || !size) continue;

      await sql`
        update inventory set stock = greatest(stock - ${item.quantity}, 0)
        where product_id = ${productId} and size = ${size}
      `;
    }
  }

  res.status(200).json({ ok: true });
}

handler.config = { api: { bodyParser: false } };
module.exports = handler;
