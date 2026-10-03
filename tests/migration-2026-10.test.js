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

test('migration writes finish prices in cents and the new copy', async () => {
  const { sql, calls } = recordingSql();
  await migrate(sql);
  const phyllite = calls.find(c => /update products set/.test(c.text) && c.values.includes('phyllite-jacket'));
  assert.ok(phyllite);
  assert.ok(phyllite.values.includes(JSON.stringify({ wax: 7000, 'fabric-paint': 8000 })));
  const denimUpdates = calls.filter(c => /update products set/.test(c.text) && c.values.some(v => String(v).startsWith('lorimer-selvedge-denim')));
  assert.equal(denimUpdates.length, 2);
});

test('running twice issues the same idempotent statements', async () => {
  const a = recordingSql();
  const b = recordingSql();
  await migrate(a.sql);
  await migrate(b.sql);
  assert.deepEqual(a.calls.map(c => c.text), b.calls.map(c => c.text));
});

test('denim rows only receive the new description; admin price and images survive', async () => {
  const { sql, calls } = recordingSql();
  await migrate(sql);
  const denim = calls.filter(c => /update products set/.test(c.text) && c.values.some(v => String(v).startsWith('lorimer-selvedge-denim')));
  assert.equal(denim.length, 2);
  denim.forEach(call => {
    assert.match(call.text, /update products set description = \?, updated_at = now\(\) where id = \?/);
    assert.doesNotMatch(call.text, /price_cents|images|finish_prices/);
  });
  const phyllite = calls.find(c => /update products set/.test(c.text) && c.values.includes('phyllite-jacket'));
  assert.match(phyllite.text, /name = \?/);
  assert.ok(phyllite.values.includes('Phyllite Jacket'));
});
