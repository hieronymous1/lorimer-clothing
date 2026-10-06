const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function load(file, results = []) {
  const calls = [];
  const sql = async (strings, ...values) => { calls.push({text:strings.join('?'),values}); return results; };
  const context = { module:{exports:{}}, process:{env:{}}, require: name => {
    if (name.includes('/db')) return { getDb: () => sql };
    if (name.includes('/session')) return { isAuthenticated: () => true };
    return require(path.resolve(__dirname, '..', path.dirname(file), name));
  }};
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),context);
  const res = {statusCode:200, status(n){this.statusCode=n;return this;},json(body){this.body=body;return this;},setHeader(){}};
  return {handler:context.module.exports,res,calls};
}
const product = {id:'phyllite-jacket',name:'Client name',description:'Client copy',price_cents:7200,images:['https://example.com/photo.jpg'],finish_prices:null};
test('product writes all fields atomically and returns persisted version', async () => {
  const {handler,res,calls}=load('api/admin/products.js',[{...product,updated_at:'2026-10-06T12:00:00Z'}]);
  await handler({method:'PUT',body:product,headers:{}},res);
  assert.equal(res.statusCode,200);
  assert.equal(calls.length,1,'A partial update must not succeed before finish prices fail');
  assert.match(calls[0].text,/returning/);
  assert.equal(res.body.product.updated_at,'2026-10-06T12:00:00Z');
});
test('missing product does not report a successful save', async () => {
  const {handler,res}=load('api/admin/products.js');
  await handler({method:'PUT',body:product,headers:{}},res);
  assert.equal(res.statusCode,404);
});
test('missing inventory row does not report a successful save', async () => {
  const {handler,res}=load('api/admin/inventory.js');
  await handler({method:'PUT',body:{product_id:'missing',size:'Size 1',stock:4},headers:{}},res);
  assert.equal(res.statusCode,404);
});
test('product rejects non-image URL values before writing', async () => {
  for(const images of [[42],['javascript:alert(1)']]) {
    const {handler,res,calls}=load('api/admin/products.js');
    await handler({method:'PUT',body:{...product,images},headers:{}},res);
    assert.equal(res.statusCode,400);
    assert.equal(calls.length,0);
  }
});
test('public products respect an intentionally empty image list', async () => {
  const {handler,res}=load('api/products.js',[{...product,images:[]}]);
  await handler({method:'GET',headers:{}},res);
  assert.equal(res.body.find(p=>p.id===product.id).images.length,0);
});
test('a stale product version returns conflict rather than overwriting another edit', async () => {
  const {handler,res,calls}=load('api/admin/products.js');
  await handler({method:'PUT',body:{...product,updated_at:'2026-09-01T00:00:00Z'},headers:{}},res);
  assert.equal(res.statusCode,409);
  assert.match(calls[0].text,/updated_at =/);
});
