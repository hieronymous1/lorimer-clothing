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

test('same size in two finishes stays as two priced lines', async () => {
  const ctx = loadCart();
  await ctx.cartService.addLine({ productId: 'phyllite-jacket', size: 'Size 1.5', finish: 'wax' });
  await ctx.cartService.addLine({ productId: 'phyllite-jacket', size: 'Size 1.5', finish: 'fabric-paint' });
  const cart = ctx.getCart();
  assert.equal(cart.length, 2);
  assert.deepEqual(plain(cart.map(i => [i.finish, i.price])), [['wax', 70], ['fabric-paint', 80]]);
  const state = await ctx.cartService.getCart();
  assert.deepEqual(plain(state.lines.map(l => l.lineKey)), ['phyllite-jacket|Size 1.5|wax', 'phyllite-jacket|Size 1.5|fabric-paint']);
});

test('unknown finish is refused', async () => {
  const ctx = loadCart();
  const result = await ctx.cartService.addLine({ productId: 'phyllite-jacket', size: 'Size 1', finish: 'gold' });
  assert.equal(result.ok, false);
  assert.equal(ctx.getCart().length, 0);
});

test('a pre-release Phyllite line without finish becomes wax; denim keeps no finish', () => {
  const ctx = loadCart([
    { id: 'phyllite-jacket', size: 'Size 1', quantity: 1 },
    { id: 'lorimer-selvedge-denim', size: '30×30', quantity: 2 },
  ]);
  const cart = ctx.getCart();
  assert.deepEqual(plain(cart.map(i => [i.id, i.finish, i.price, i.quantity])), [
    ['phyllite-jacket', 'wax', 70, 1],
    ['lorimer-selvedge-denim', '', 80, 2],
  ]);
});

test('remove and update address a single finish line', async () => {
  const ctx = loadCart();
  await ctx.cartService.addLine({ productId: 'phyllite-jacket', size: 'Size 2', finish: 'wax' });
  await ctx.cartService.addLine({ productId: 'phyllite-jacket', size: 'Size 2', finish: 'fabric-paint' });
  await ctx.cartService.updateLineQuantity('phyllite-jacket|Size 2|fabric-paint', 3);
  await ctx.cartService.removeLine('phyllite-jacket|Size 2|wax');
  assert.deepEqual(plain(ctx.getCart().map(i => [i.finish, i.quantity])), [['fabric-paint', 3]]);
});
