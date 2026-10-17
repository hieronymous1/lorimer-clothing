const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { migrate, CONTENT, DESCRIPTION_IDS, CAP } = require('../scripts/migrate-2026-10-17-final-copy.js');
const PRODUCTS = require('../js/products-data.js');

test('final copy migration backs up first, then writes only copy, cap photo and About blocks', async () => {
  const calls = [];
  let backedUp = null;
  const sql = async (strings, ...values) => {
    calls.push({ text: strings.join('?').replace(/\s+/g, ' ').trim(), values });
    return [{ id: 'x' }];
  };
  await migrate(sql, rows => { backedUp = rows; });
  assert.ok(backedUp, 'backup callback runs');
  assert.match(calls[0].text, /^select id, description, images from products/);
  assert.match(calls[1].text, /^select key, value from content/);
  const updates = calls.filter(c => c.text.startsWith('update products set description'));
  assert.deepEqual(updates.map(c => c.values[1]), DESCRIPTION_IDS);
  updates.forEach(c => assert.equal(c.values[0], PRODUCTS.find(p => p.id === c.values[1]).description));
  assert.equal(calls.filter(c => c.text.startsWith('insert into content')).length, Object.keys(CONTENT).length);
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets/photos/PRODUCTS', CAP.next)));
});

test('About blocks in the migration match the bundled fallback markup and use the info mailbox', () => {
  const about = fs.readFileSync(path.join(__dirname, '..', 'about.html'), 'utf8');
  for (const [key, value] of Object.entries(CONTENT)) {
    const block = about.match(new RegExp(`data-cms-key="${key}">([\\s\\S]*?)\\n      </div>`))[1];
    assert.equal(block.replace(/\n\s*/g, ''), value, key);
  }
  assert.doesNotMatch(JSON.stringify(CONTENT), /contact@/);
});
