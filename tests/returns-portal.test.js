const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

function load(file, results = [], authenticated = true) {
  const calls = [];
  const sql = async (strings, ...values) => { calls.push({ text: strings.join('?'), values }); return results; };
  const context = { module: { exports: {} }, process: { env: {} }, require: name => {
    if (name.includes('/db')) return { getDb: () => sql };
    if (name.includes('/session')) return { isAuthenticated: () => authenticated };
    return require(path.resolve(__dirname, '..', path.dirname(file), name));
  } };
  context.exports = context.module.exports;
  vm.runInNewContext(read(file), context);
  const res = { statusCode: 200, status(n) { this.statusCode = n; return this; }, json(body) { this.body = body; return this; }, setHeader() {} };
  return { handler: context.module.exports, res, calls };
}

const valid = {
  request_type: 'exchange', name: 'Ada', email: 'ada@example.com', order_ref: '12 Oct',
  item: 'Phyllite Jacket, Size 1', exchange_size: 'Size 2', reason: 'Too small',
};

test('a valid return request is stored once after the rate check', async () => {
  const { handler, res, calls } = load('api/returns.js', [{ by_email: 0, total: 0 }]);
  await handler({ method: 'POST', body: valid, headers: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 2);
  assert.match(calls[1].text, /insert into return_requests/);
  assert.deepEqual(calls[1].values, ['Ada', 'ada@example.com', '12 Oct', 'exchange', 'Phyllite Jacket, Size 1', 'Size 2', 'Too small']);
});

test('invalid, oversized or non-string fields are rejected before any write', async () => {
  for (const body of [
    { ...valid, email: 'not-an-email' },
    { ...valid, request_type: 'refund' },
    { ...valid, reason: '' },
    { ...valid, exchange_size: '' },
    { ...valid, reason: 'x'.repeat(2001) },
    { ...valid, name: { $ne: '' } },
  ]) {
    const { handler, res, calls } = load('api/returns.js');
    await handler({ method: 'POST', body, headers: {} }, res);
    assert.equal(res.statusCode, 400, JSON.stringify(body).slice(0, 60));
    assert.equal(calls.length, 0);
  }
});

test('honeypot submissions look successful but are never stored', async () => {
  const { handler, res, calls } = load('api/returns.js');
  await handler({ method: 'POST', body: { ...valid, website: 'spam.example' }, headers: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 0);
});

test('repeat submissions are rate limited', async () => {
  const { handler, res, calls } = load('api/returns.js', [{ by_email: 3, total: 3 }]);
  await handler({ method: 'POST', body: valid, headers: {} }, res);
  assert.equal(res.statusCode, 429);
  assert.equal(calls.length, 1);
});

test('admin returns endpoint requires a session and validates updates', async () => {
  const anon = load('api/admin/returns.js', [], false);
  await anon.handler({ method: 'GET', headers: {} }, anon.res);
  assert.equal(anon.res.statusCode, 401);
  const bad = load('api/admin/returns.js');
  await bad.handler({ method: 'PUT', body: { id: '1; drop', handled: true, admin_note: '' }, headers: {} }, bad.res);
  assert.equal(bad.res.statusCode, 400);
  assert.equal(bad.calls.length, 0);
});

test('About returns copy links the portal text to the portal page', () => {
  for (const file of ['about.html', 'scripts/seed.js']) {
    assert.match(read(file), /<a href="returns\.html">Lorimer Returns &amp; Exchanges Portal<\/a>/, file);
  }
  assert.match(read('returns.html'), /id="returns-form"/);
  assert.match(read('returns.html'), /js\/returns\.js/);
});
