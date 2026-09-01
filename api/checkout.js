const Stripe = require('stripe');
const { getDb } = require('./_lib/db');
const { buildStripeShippingOptions, getShippingRegion } = require('./_lib/shipping');
const PRODUCTS = require('../js/products-data.js');

const LIVE_IDS = ['phyllite-jacket', 'lorimer-selvedge-denim', 'lorimer-selvedge-denim-black'];

function getStructuralProduct(id) {
  return LIVE_IDS.includes(id) ? PRODUCTS.find(p => p.id === id) : null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const cart = Array.isArray(req.body?.cart) ? req.body.cart : [];
  const shipping_region = req.body?.shipping_region;
  const shippingRegion = getShippingRegion(shipping_region);
  if (cart.length === 0) {
    res.status(400).json({ error: 'cart is empty' });
    return;
  }
  if (!shippingRegion) {
    res.status(400).json({ error: 'select a valid shipping region' });
    return;
  }

  const consolidated = new Map();
  for (const item of cart) {
    const id = typeof item?.id === 'string' ? item.id : '';
    const size = typeof item?.size === 'string' ? item.size : '';
    const quantity = Number.isInteger(item?.quantity) ? item.quantity : 0;
    const lineKey = `${id}\u0000${size}`;
    const existing = consolidated.get(lineKey);
    if (existing) existing.quantity += quantity;
    else consolidated.set(lineKey, { id, size, quantity });
  }

  const sql = getDb();
  const productRows = await sql`select id, name, price_cents from products`;
  const productsById = new Map(productRows.map(row => [row.id, row]));

  const lines = [];
  for (const item of consolidated.values()) {
    const id = typeof item?.id === 'string' ? item.id : '';
    const size = typeof item?.size === 'string' ? item.size : '';
    const quantity = Number.isInteger(item?.quantity) ? item.quantity : 0;

    const structural = getStructuralProduct(id);
    const dbProduct = productsById.get(id);
    if (!structural || !dbProduct || quantity < 1 || !structural.sizes.includes(size)) {
      res.status(400).json({ error: `invalid line item for ${id || 'unknown product'}` });
      return;
    }

    const [stockRow] = await sql`select stock from inventory where product_id = ${id} and size = ${size}`;
    if (!stockRow || stockRow.stock < quantity) {
      res.status(409).json({ error: `${dbProduct.name} in size ${size} is out of stock`, id, size });
      return;
    }

    lines.push({
      quantity,
      price_data: {
        currency: 'eur',
        unit_amount: dbProduct.price_cents,
        product_data: {
          name: `${dbProduct.name} — ${size}`,
          metadata: { product_id: id, size },
        },
      },
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = getSiteOrigin(req);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    integration_identifier: `lorimer_${randomLetters(8)}`,
    line_items: lines,
    shipping_address_collection: { allowed_countries: shippingRegion.allowed_countries },
    shipping_options: buildStripeShippingOptions(shipping_region),
    success_url: `${origin}/checkout.html?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout.html?canceled=1`,
  });

  res.status(200).json({ url: session.url });
};

function randomLetters(length) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let value = '';
  for (let index = 0; index < length; index += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return value;
}

function getSiteOrigin(req) {
  const host = String(req.headers.host || '');
  if (/^(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(host)) return `http://${host}`;
  return 'https://www.lorimerclothing.com';
}
