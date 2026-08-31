const crypto = require('node:crypto');

const COOKIE_NAME = 'lorimer_admin';
const MAX_AGE_MS = 1000 * 60 * 60 * 12;

function sign(payload, secret) {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const hmac = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${hmac}`;
}

function verify(token, secret) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [encoded, hmac] = token.split('.');
  if (!encoded || !hmac) return null;

  const expected = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  const a = Buffer.from(hmac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
  return payload;
}

function createSessionCookie(secret) {
  const token = sign({ role: 'admin', exp: Date.now() + MAX_AGE_MS }, secret);
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${Math.floor(MAX_AGE_MS / 1000)}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach(part => {
    const index = part.indexOf('=');
    if (index === -1) return;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  });
  return out;
}

function isAuthenticated(req, secret) {
  const cookies = parseCookies(req.headers.cookie);
  return verify(cookies[COOKIE_NAME], secret) !== null;
}

module.exports = { sign, verify, createSessionCookie, clearSessionCookie, parseCookies, isAuthenticated, COOKIE_NAME };
