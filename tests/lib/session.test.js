const test = require('node:test');
const assert = require('node:assert/strict');
const { sign, verify, parseCookies, createSessionCookie, clearSessionCookie, COOKIE_NAME } = require('../../api/_lib/session');

test('sign/verify round-trips a payload with a valid signature', () => {
  const token = sign({ role: 'admin', exp: Date.now() + 10_000 }, 'secret');
  const payload = verify(token, 'secret');
  assert.equal(payload.role, 'admin');
});

test('verify rejects a token signed with a different secret', () => {
  const token = sign({ role: 'admin', exp: Date.now() + 10_000 }, 'secret-a');
  assert.equal(verify(token, 'secret-b'), null);
});

test('verify rejects an expired token', () => {
  const token = sign({ role: 'admin', exp: Date.now() - 1 }, 'secret');
  assert.equal(verify(token, 'secret'), null);
});

test('verify rejects a malformed token', () => {
  assert.equal(verify('not-a-token', 'secret'), null);
  assert.equal(verify(undefined, 'secret'), null);
});

test('parseCookies splits a Cookie header into a key/value map', () => {
  const cookies = parseCookies(`${COOKIE_NAME}=abc; other=xyz`);
  assert.equal(cookies[COOKIE_NAME], 'abc');
  assert.equal(cookies.other, 'xyz');
});

test('createSessionCookie produces a cookie whose token verify() accepts', () => {
  const cookieHeader = createSessionCookie('secret');
  const token = cookieHeader.split(';')[0].split('=')[1];
  assert.notEqual(verify(token, 'secret'), null);
  assert.match(cookieHeader, /HttpOnly/);
  assert.match(cookieHeader, /SameSite=Strict/);
});

test('clearSessionCookie sets Max-Age=0', () => {
  assert.match(clearSessionCookie(), /Max-Age=0/);
});
