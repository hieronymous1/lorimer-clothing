const { getDb } = require('./_lib/db');

// Public Returns & Exchanges Portal submissions. Requests are stored for the
// admin Returns tab; nothing is emailed and nothing is trusted as HTML.
const LIMITS = { name: 100, email: 254, order_ref: 100, item: 200, exchange_size: 60, reason: 2000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PER_EMAIL_PER_DAY = 3;
const PER_HOUR_TOTAL = 30;

function clean(value, max) {
  return typeof value === 'string' && value.trim().length <= max ? value.trim() : null;
}

function validate(body) {
  const fields = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    fields[key] = clean(body?.[key] ?? '', max);
    if (fields[key] === null) return { error: `${key.replace('_', ' ')} is too long` };
  }
  for (const key of ['name', 'email', 'order_ref', 'item', 'reason']) {
    if (!fields[key]) return { error: `Please fill in ${key === 'order_ref' ? 'your order number or date' : `your ${key}`}.` };
  }
  if (!EMAIL.test(fields.email)) return { error: 'Please enter a valid email address.' };
  if (body.request_type !== 'return' && body.request_type !== 'exchange') return { error: 'Choose return or exchange.' };
  fields.request_type = body.request_type;
  if (fields.request_type === 'return') fields.exchange_size = '';
  else if (!fields.exchange_size) return { error: 'Please tell us which size you would like instead.' };
  return { fields };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  // Honeypot: bots fill every field; people never see this one.
  if (req.body?.website) {
    res.status(200).json({ ok: true });
    return;
  }
  const { error, fields } = validate(req.body || {});
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const sql = getDb();
  const [{ by_email, total }] = await sql`
    select
      count(*) filter (where lower(email) = lower(${fields.email}) and created_at > now() - interval '1 day')::int as by_email,
      count(*) filter (where created_at > now() - interval '1 hour')::int as total
    from return_requests
  `;
  if (by_email >= PER_EMAIL_PER_DAY) {
    res.status(429).json({ error: 'We have already received your request. Please email contact@lorimer.com if you need to add anything.' });
    return;
  }
  if (total >= PER_HOUR_TOTAL) {
    res.status(429).json({ error: 'We are receiving a lot of requests right now. Please try again later or email contact@lorimer.com.' });
    return;
  }

  await sql`
    insert into return_requests (name, email, order_ref, request_type, item, exchange_size, reason)
    values (${fields.name}, ${fields.email}, ${fields.order_ref}, ${fields.request_type}, ${fields.item}, ${fields.exchange_size}, ${fields.reason})
  `;
  res.status(200).json({ ok: true });
};

module.exports.validate = validate;
