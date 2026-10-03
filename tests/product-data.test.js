const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
function loadProducts() {
  const context = vm.createContext({ module: { exports: {} } });
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/products-data.js'), 'utf8'), context);
  return JSON.parse(JSON.stringify(context.module.exports));
}

const ARCHIVE = {
  'deconstructed-bomber': ['Mason Jacket 001', 'April 2023', 'Spain'],
  'zip-up-utility-vest': ['Gardner Vest 001', 'June 2025', 'Finland'],
  'westworld-button-up': ['Fletcher Shirt 001', 'May 2023', 'Spain'],
  'layered-denim-shorts': ['Weaver Shorts 001', 'November 2025', 'Finland'],
  'layered-denim-jeans': ['Weaver Jeans 002', 'November 2025', 'Finland'],
  'westworld-straight-jeans': ['Fletcher Jeans 002', 'May 2023', 'Spain'],
  'reconstructed-button-up-1': ['Mercer Shirt 001', 'April 2025', 'Finland'],
  'reconstructed-button-up-2': ['Mercer Shirt 002', 'April 2025', 'Finland'],
  'reinforced-pinstripe-trousers': ['Sawyer Trousers 003', 'April 2025', 'Finland'],
  'upcycled-two-piece': ['Hosier Two Piece 002', 'February 2023', 'Spain'],
  'trigall-dress': ['Trigall Dress 001', 'August 2022', 'Spain'],
  'overlapped-fray-skirt': ['Webster Skirt 003', 'May 2023', 'Spain'],
  'dual-texture-knit-vest': ['Franklin Vest 001', 'May 2024', 'Spain'],
  'adjustable-button-trousers': ['Clasper Trousers 002', 'May 2024', 'Spain'],
  'university-striped-sweatshirt': ['UoL Sweatshirt 001', 'May 2024', 'Spain'],
  'mens-straight-trousers': ['Foreman Trousers 002', 'May 2024', 'Spain'],
  'distressed-lorimer-cap': ['Sterling Cap 003', 'May 2024', 'Spain'],
  '3d-panel-bomber': ['Slater Jacket 001', 'May 2024', 'Spain'],
  'denim-leather-trousers': ['Lacquer Trousers 002', 'May 2024', 'Spain'],
  'asymmetrical-white-top': ['Fowler Top 001', 'May 2024', 'Spain'],
  'white-layered-skirt': ['Lyster Skirt 004', 'May 2024', 'Spain'],
  'zip-up-top': ['Moulder Top 001', 'May 2024', 'Spain'],
  'womens-wide-trousers': ['Carder Trousers 002', 'May 2024', 'Spain'],
  'ss24-dress': ['Manuta Dress 001', 'May 2024', 'Spain'],
};

test('every archive piece carries the client name, date, origin and 1-of-1 status', () => {
  const products = loadProducts();
  Object.entries(ARCHIVE).forEach(([id, [name, constructedOn, madeIn]]) => {
    const product = products.find(entry => entry.id === id);
    assert.ok(product, id);
    assert.equal(product.name, name, id);
    assert.equal(product.constructedOn, constructedOn, id);
    assert.equal(product.madeIn, madeIn, id);
    assert.equal(product.notForSale, true, id);
    assert.equal(product.oneOfOne, true, id);
    ['sizes', 'material', 'styleWith', 'longDescription', 'origin'].forEach(field => assert.equal(product[field], undefined, `${id}.${field}`));
    assert.ok(product.description.split('\n\n').every(p => p.trim().length > 20), `${id} description paragraphs`);
  });
});

test('Phyllite has four sizes, two priced finishes and the new cover', () => {
  const phyllite = loadProducts().find(p => p.id === 'phyllite-jacket');
  assert.deepEqual(phyllite.sizes, ['Size 1', 'Size 1.5', 'Size 2', 'Size 2.5']);
  assert.deepEqual(phyllite.finishes.map(f => [f.id, f.label, f.price]), [['wax', 'WAX', 70], ['fabric-paint', 'FABRIC PAINT', 80]]);
  assert.match(phyllite.finishes[1].image, /IMG_3420\.jpg$/);
  assert.match(phyllite.images[0], /Phyllite Jacket - Photoshoot\/IMG_2297\.jpg$/);
  assert.equal(phyllite.images.filter(src => src.endsWith('IMG_2297.jpg')).length, 1);
  assert.equal(phyllite.material, '100% Cotton Denim, Stainless Steel Hardware');
  assert.equal(phyllite.description.split('\n\n').length, 2);
  assert.equal(phyllite.styleWith, undefined);
  assert.equal(phyllite.longDescription, undefined);
});

test('live denim carries the new copy and material', () => {
  const products = loadProducts();
  ['lorimer-selvedge-denim', 'lorimer-selvedge-denim-black'].forEach(id => {
    const denim = products.find(p => p.id === id);
    assert.match(denim.description, /^Constructed from a 100% Japanese Selvedge Denim fabric/);
    assert.equal(denim.description.split('\n\n').length, 3);
    assert.equal(denim.material, '100% Cotton Japanese Selvedge Denim, Cowhide Leather, Stainless Steel Hardware');
    assert.equal(denim.styleWith, undefined);
    assert.equal(denim.longDescription, undefined);
  });
});

test('Accessories contains only the cap', () => {
  const accessories = loadProducts().filter(p => p.category === 'Accessories').map(p => p.id);
  assert.deepEqual(accessories, ['distressed-lorimer-cap']);
  const suit = loadProducts().find(p => p.id === 'upcycled-two-piece');
  assert.equal(suit.category, 'Bottoms');
  assert.equal(suit.subcategory, 'Skirts');
});
