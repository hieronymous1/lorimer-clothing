const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const PRODUCTS = require('../js/products-data.js');
const { migrate } = require('../scripts/migrate-2026-10-final.js');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

function recordingSql() {
  const calls = [];
  const sql = (strings, ...values) => {
    calls.push({ text: strings.join('?').replace(/\s+/g, ' ').trim(), values });
    return Promise.resolve([]);
  };
  return { sql, calls };
}

test('archive migration inserts every sold-out piece without touching stock or edits', async () => {
  const { sql, calls } = recordingSql();
  await migrate(sql);
  const archive = PRODUCTS.filter(p => p.notForSale).map(p => p.id);
  assert.ok(archive.length > 10);
  const inserts = calls.filter(c => /insert into products/.test(c.text));
  assert.deepEqual(inserts.map(c => c.values[0]), archive);
  inserts.forEach(call => {
    assert.match(call.text, /^insert into products .* on conflict \(id\) do nothing$/);
  });
  const text = calls.map(c => c.text).join('\n');
  assert.doesNotMatch(text, /inventory|update products|delete /);
  assert.match(text, /create table if not exists return_requests/);
  assert.match(text, /update content .* where key = 'about\.returns' and position\('returns\.html' in value\) = 0/);
});

test('archive pieces are editable but checkout still only sells the live products', () => {
  const checkout = read('api/checkout.js');
  const live = checkout.match(/const LIVE_IDS = \[([^\]]*)\]/)[1];
  PRODUCTS.filter(p => p.notForSale).forEach(p => assert.ok(!live.includes(`'${p.id}'`), p.id));
  assert.match(read('api/products.js'), /archived \? null : stockByProduct/);
});
