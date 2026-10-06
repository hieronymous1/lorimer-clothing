const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
// vm-context arrays have a different prototype; compare plain JSON copies.
const plain = value => JSON.parse(JSON.stringify(value));

function loadCart(initial) {
  const store = new Map(initial ? [['lorimer-cart', JSON.stringify(initial)]] : []);
  const context = vm.createContext({
    module: { exports: {} },
    localStorage: {
      getItem: key => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: key => store.delete(key),
    },
  });
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/products-data.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/cart.js'), 'utf8'), context);
  // Top-level const bindings are not context properties; expose the ones tests use.
  context.cartService = vm.runInContext('cartService', context);
  return context;
}

test('same size in the two jackets stays as two distinct product lines', async () => {
  const ctx = loadCart();
  await ctx.cartService.addLine({ productId: 'phyllite-jacket', size: 'Size 1.5' });
  await ctx.cartService.addLine({ productId: 'phyllite-jacket-v2', size: 'Size 1.5' });
  const cart = ctx.getCart();
  assert.equal(cart.length, 2);
  assert.deepEqual(plain(cart.map(i => [i.id, i.price])), [['phyllite-jacket', 70], ['phyllite-jacket-v2', 80]]);
  const state = await ctx.cartService.getCart();
  assert.deepEqual(plain(state.lines.map(l => l.lineKey)), ['phyllite-jacket|Size 1.5|', 'phyllite-jacket-v2|Size 1.5|']);
});

test('unknown finish is refused', async () => {
  const ctx = loadCart();
  const result = await ctx.cartService.addLine({ productId: 'phyllite-jacket', size: 'Size 1', finish: 'gold' });
  assert.equal(result.ok, false);
  assert.equal(ctx.getCart().length, 0);
});

test('legacy Phyllite cart lines migrate to the correct separate products', () => {
  const ctx = loadCart([
    { id: 'phyllite-jacket', size: 'Size 1', quantity: 1 },
    { id: 'phyllite-jacket', size: 'Size 2', finish: 'fabric-paint', quantity: 1 },
    { id: 'lorimer-selvedge-denim', size: '30×30', quantity: 2 },
  ]);
  const cart = ctx.getCart();
  assert.deepEqual(plain(cart.map(i => [i.id, i.finish, i.price, i.quantity])), [
    ['phyllite-jacket', '', 70, 1],
    ['phyllite-jacket-v2', '', 80, 1],
    ['lorimer-selvedge-denim', '', 80, 2],
  ]);
});

test('remove and update address only the selected jacket', async () => {
  const ctx = loadCart();
  await ctx.cartService.addLine({ productId: 'phyllite-jacket', size: 'Size 2' });
  await ctx.cartService.addLine({ productId: 'phyllite-jacket-v2', size: 'Size 2' });
  await ctx.cartService.updateLineQuantity('phyllite-jacket-v2|Size 2|', 3);
  await ctx.cartService.removeLine('phyllite-jacket|Size 2|');
  assert.deepEqual(plain(ctx.getCart().map(i => [i.id, i.quantity])), [['phyllite-jacket-v2', 3]]);
});
