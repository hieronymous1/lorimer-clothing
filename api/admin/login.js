const { createSessionCookie, clearSessionCookie } = require('../_lib/session');

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    const { password } = req.body || {};
    if (typeof password !== 'string' || password !== process.env.ADMIN_PASSWORD) {
      res.status(401).json({ error: 'invalid password' });
      return;
    }
    res.setHeader('Set-Cookie', createSessionCookie(process.env.SESSION_SECRET));
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearSessionCookie());
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
