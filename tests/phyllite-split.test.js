const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { migrate } = require('../scripts/split-phyllite-products');
const PRODUCTS = require('../js/products-data');

function checkoutHarness() {
  let session;
  const queriedStock = [];
  const sql = async (strings, ...values) => {
    const query = strings.join('?');
    if (query.includes('select id, name, price_cents')) return [
      { id: 'phyllite-jacket', name: 'Phyllite Jacket', price_cents: 7900, finish_prices: null },
      { id: 'phyllite-jacket-v2', name: 'Phyllite Jacket V2', price_cents: 8900, finish_prices: null },
    ];
    queriedStock.push(values);
    return [{ stock: 1 }];
  };
  const context = {
    module: { exports: {} }, process: { env: {} },
    require(name) {
      if (name === 'stripe') return class {
        checkout = { sessions: { create: async input => { session = input; return { url: 'https://checkout.stripe.com/test' }; } } };
      };
      if (name === './_lib/db') return { getDb: () => sql };
      return require(path.resolve(__dirname, '../api', name));
    },
  };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../api/checkout.js'), 'utf8'), context);
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } };
  return { handler: context.module.exports, res, queriedStock, session: () => session };
}

test('checkout prices and checks stock for each jacket independently', async () => {
  const h = checkoutHarness();
  await h.handler({ method: 'POST', headers: { host: 'localhost:8937' }, body: {
    shipping_region: 'FI',
    cart: ['phyllite-jacket', 'phyllite-jacket-v2'].map(id => ({ id, size: 'Size 1', quantity: 1 })),
  } }, h.res);
  assert.equal(h.res.statusCode, 200, JSON.stringify(h.res.body));
  assert.deepEqual(h.queriedStock, [['phyllite-jacket', 'Size 1'], ['phyllite-jacket-v2', 'Size 1']]);
  assert.deepEqual(Array.from(h.session().line_items, line => line.price_data.unit_amount), [7900, 8900]);
  assert.deepEqual(Array.from(h.session().line_items, line => line.price_data.product_data.metadata.product_id), ['phyllite-jacket', 'phyllite-jacket-v2']);
});

test('old fabric-paint checkout requests resolve to V2 and its database price', async () => {
  const h = checkoutHarness();
  await h.handler({ method: 'POST', headers: { host: 'localhost:8937' }, body: {
    shipping_region: 'FI',
    cart: [{ id: 'phyllite-jacket', finish: 'fabric-paint', size: 'Size 2', quantity: 1 }],
  } }, h.res);
  assert.equal(h.res.statusCode, 200, JSON.stringify(h.res.body));
  const line = h.session().line_items[0].price_data;
  assert.equal(line.unit_amount, 8900);
  assert.equal(line.product_data.metadata.product_id, 'phyllite-jacket-v2');
  assert.equal(line.product_data.metadata.finish, '');
});

test('split migration preserves existing edits and does not duplicate inventory', async () => {
  const calls = [];
  await migrate(async (strings, ...values) => { calls.push({ text: strings.join('?'), values }); return []; });
  const split = calls.find(call => call.text.includes('with inserted'));
  assert.match(split.text, /on conflict \(id\) do nothing/);
  assert.match(split.text, /exists \(select 1 from inserted\)/);
  assert.match(split.text, /finish_prices->>'fabric-paint'/);
  assert.match(split.text, /finish_prices->>'wax'/);
  assert.match(split.text, /finish_prices = null/);
  const inventory = calls.filter(call => call.text.includes('insert into inventory'));
  assert.equal(inventory.length, 8);
  for (const call of inventory) {
    assert.match(call.text, /values \(\?, \?, 0\)/);
    assert.match(call.text, /on conflict \(product_id, size\) do nothing/);
  }
  assert.deepEqual(inventory.map(call => call.values), PRODUCTS.filter(p => p.id.startsWith('phyllite-jacket')).flatMap(p => p.sizes.map(size => [p.id, size])));
});
