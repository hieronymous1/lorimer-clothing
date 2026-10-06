const test = require('node:test');
const assert = require('node:assert/strict');
const { migrate } = require('../scripts/migrate-2026-10.js');

function recordingSql() {
  const calls = [];
  const sql = (strings, ...values) => {
    calls.push({ text: strings.join('?').replace(/\s+/g, ' ').trim(), values });
    return Promise.resolve([]);
  };
  return { sql, calls };
}

test('migration is additive and never overwrites stock', async () => {
  const { sql, calls } = recordingSql();
  await migrate(sql);
  const text = calls.map(c => c.text).join('\n');
  assert.match(text, /alter table products add column if not exists finish_prices jsonb/);
  assert.match(text, /insert into inventory \(product_id, size, stock\) values \(\?, \?, 0\) on conflict \(product_id, size\) do nothing/);
  assert.doesNotMatch(text, /update inventory/);
  assert.doesNotMatch(text, /delete /);
  const sizes = calls.filter(c => /insert into inventory/.test(c.text)).map(c => c.values[1]);
  assert.deepEqual(sizes, ['Size 1.5', 'Size 2.5']);
});

test('historical migration does not reintroduce finish pricing after products are split', async () => {
  const { sql, calls } = recordingSql();
  await migrate(sql);
  assert.equal(calls.filter(c => /update products/.test(c.text)).length, 0);
});

test('running twice issues the same idempotent statements', async () => {
  const a = recordingSql();
  const b = recordingSql();
  await migrate(a.sql);
  await migrate(b.sql);
  assert.deepEqual(a.calls.map(c => c.text), b.calls.map(c => c.text));
});
