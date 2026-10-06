// Run through Playwright's browser_run_code_unsafe filename option with the local server on :8937.
async (page) => {
  page = await page.context().newPage();
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  let saved = { id: 'phyllite-jacket', name: 'Jacket', description: 'Client copy', price_cents: 7000, images: ['https://example.com/original.jpg'], finish_prices: null };
  let uploads = 0;
  let failSave = false;
  await page.route('**/api/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.endsWith('/login')) return route.fulfill({ json: { authenticated: true } });
    if (path.endsWith('/upload')) { uploads++; return route.fulfill({ json: { url: 'https://example.com/upload.jpg' } }); }
    if (path.endsWith('/products')) {
      if (request.method() === 'PUT') {
        if (failSave) return route.fulfill({ status: 401, json: { error: 'unauthorized' } });
        saved = request.postDataJSON();
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: [saved] });
    }
    return route.fulfill({ json: [] });
  });
  await page.goto('http://127.0.0.1:8937/admin.html');
  const form = page.locator('#admin-tab-products form');
  await form.waitFor();
  await form.locator('input[type=file]').setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from('test-image') });
  await form.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.admin-save-status')?.textContent === 'Saved');
  assert((await form.locator('[name=images]').inputValue()).includes('upload.jpg'), 'Uploaded image must be retained in form after save');
  assert(await form.locator('input[type=file]').inputValue() === '', 'Uploaded file must be cleared to prevent duplicate uploads');
  await form.locator('[name=description]').fill('Second edit');
  await form.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.admin-save-status')?.textContent === 'Saved');
  assert(uploads === 1, 'Repeat save must not reupload image');
  assert(saved.images.length === 2, 'Repeat save must retain image');
  await page.reload();
  await form.waitFor();
  assert((await form.locator('[name=images]').inputValue()).includes('upload.jpg'), 'Image must survive reload');
  await form.locator('[name=description]').fill('Unsaved draft');
  await page.getByRole('button', { name: 'Inventory', exact: true }).click();
  await page.getByRole('button', { name: 'Products', exact: true }).click();
  assert(await form.locator('[name=description]').inputValue() === 'Unsaved draft', 'Switching tabs must preserve unsaved edits');
  failSave = true;
  await form.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForFunction(() => /session|log in/i.test(document.querySelector('.admin-save-status')?.textContent || ''));
  assert(await form.locator('[name=description]').inputValue() === 'Unsaved draft', 'Failed saves must preserve edits');
  failSave = false;
  await form.locator('input[type=file]').setInputFiles({ name: 'large.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(5 * 1024 * 1024) });
  await form.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForFunction(() => /4 MB/.test(document.querySelector('.admin-save-status')?.textContent || ''));
  assert(uploads === 1, 'Oversized upload must be rejected before network');
  await page.unrouteAll({ behavior: 'wait' });
  await page.close();
  return 'PASS: upload, repeat save, reload persistence, tab drafts, expired-session errors, oversized upload';
}
