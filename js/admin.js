// API failures must remain visible instead of leaving a blank editor or false success.
async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, { cache: 'no-store', ...options });
  } catch {
    throw new Error('Connection failed. Your edits are still here; please try saving again.');
  }
  if (!response.ok) {
    if (response.status === 401) throw new Error(options.method === 'POST' && url === '/api/admin/login' ? 'Incorrect password.' : 'Your session expired. Log in again in another tab, then retry saving here.');
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.error || `Request failed (${response.status}). Please try again.`);
  }
  return response;
}

const API = {
  session: () => request('/api/admin/login').then(r => r.json()),
  login: password => request('/api/admin/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
  }),
  logout: () => request('/api/admin/login', { method: 'DELETE' }),
  products: {
    list: () => request('/api/admin/products').then(r => r.json()),
    save: product => request('/api/admin/products', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product),
    }),
  },
  inventory: {
    list: () => request('/api/admin/inventory').then(r => r.json()),
    save: row => request('/api/admin/inventory', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row),
    }),
  },
  orders: {
    list: () => request('/api/admin/orders').then(r => r.json()),
    save: note => request('/api/admin/orders', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note),
    }),
  },
  content: {
    list: () => request('/api/admin/content').then(r => r.json()),
    save: entry => request('/api/admin/content', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry),
    }),
  },
  upload: file => request(`/api/admin/upload?filename=${encodeURIComponent(file.name)}`, {
    method: 'POST', headers: { 'Content-Type': file.type }, body: file,
  }),
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}
function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('admin-login');
  const panelView = document.getElementById('admin-panel');
  const loginForm = document.getElementById('admin-login-form');
  const loginError = document.getElementById('admin-login-error');

  const dirty = new Set();
  const revisions = new WeakMap();
  document.addEventListener('input', event => {
    const card = event.target.closest('.admin-card, tr');
    if (card) { dirty.add(card); revisions.set(card, (revisions.get(card) || 0) + 1); }
  });
  window.addEventListener('beforeunload', event => {
    if (dirty.size) { event.preventDefault(); event.returnValue = ''; }
  });

  function onAction(element, eventName, action) {
    element.addEventListener(eventName, async event => {
      event.preventDefault();
      const card = element.closest('.admin-card, tr') || element;
      const revision = revisions.get(card) || 0;
      const status = card.querySelector('.admin-save-status') || loginError;
      const buttons = [...card.querySelectorAll('button')];
      buttons.forEach(button => { button.disabled = true; });
      status.hidden = false;
      status.textContent = 'Saving…';
      try {
        await action(event);
        if ((revisions.get(card) || 0) === revision) dirty.delete(card);
      } catch (error) {
        status.textContent = error.message;
      } finally {
        buttons.forEach(button => { button.disabled = false; });
      }
    });
  }

  async function showTab(name) {
    const panel = document.getElementById(`admin-tab-${name}`);
    if (panel.dataset.loaded) return;
    panel.dataset.loaded = 'loading';
    panel.textContent = 'Loading…';
    try {
      await ({ products: renderProducts, inventory: renderInventory, orders: renderOrders, content: renderContent })[name]();
      panel.dataset.loaded = 'true';
      if (!panel.children.length) panel.textContent = 'No records yet.';
    } catch (error) {
      delete panel.dataset.loaded;
      panel.textContent = error.message + ' Select this tab to retry.';
    }
  }

  API.session().then(session => {
    if (!session.authenticated) return;
    loginView.hidden = true;
    panelView.hidden = false;
    showTab('products');
  }).catch(() => {});

  onAction(loginForm, 'submit', async event => {
    event.preventDefault();
    const password = document.getElementById('admin-password').value;
    await API.login(password);
    loginError.hidden = true;
    loginView.hidden = true;
    panelView.hidden = false;
    showTab('products');
  });

  document.getElementById('admin-logout').addEventListener('click', async () => {
    if (dirty.size && !window.confirm('Discard unsaved changes and log out?')) return;
    try { await API.logout(); } catch (error) { window.alert(error.message); return; }
    dirty.clear();
    window.location.reload();
    panelView.hidden = true;
    loginView.hidden = false;
  });

  document.querySelectorAll('.admin-tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab[data-tab]').forEach(t => t.classList.remove('admin-tab--active'));
      document.querySelectorAll('.admin-tab-panel').forEach(p => { p.hidden = true; });
      tab.classList.add('admin-tab--active');
      document.getElementById(`admin-tab-${tab.dataset.tab}`).hidden = false;
      showTab(tab.dataset.tab);
    });
  });

  async function renderProducts() {
    const panel = document.getElementById('admin-tab-products');
    const products = await API.products.list();
    panel.innerHTML = '';
    products.forEach(product => {
      const form = document.createElement('form');
      form.className = 'admin-card';
      form.innerHTML = `
        <label>Name<input name="name" value="${escapeAttr(product.name)}"></label>
        <label>Description<textarea name="description">${escapeHtml(product.description)}</textarea></label>
        <label>Price (EUR)<input name="price" type="number" step="0.01" value="${(product.price_cents / 100).toFixed(2)}"></label>
        ${product.finish_prices ? Object.entries(product.finish_prices).map(([key, cents]) => `
        <label>${escapeHtml(key === 'fabric-paint' ? 'Fabric Paint price (EUR)' : key === 'wax' ? 'Wax price (EUR)' : key)}<input name="finish:${escapeAttr(key)}" type="number" step="0.01" min="0.01" value="${(cents / 100).toFixed(2)}"></label>`).join('') : ''}
        <label>Images (one URL per line)<textarea name="images">${escapeHtml((product.images || []).join('\n'))}</textarea></label>
        <p>First image is the cover. Reorder or remove URLs above, then Save. Upload JPG, PNG, WebP, GIF or AVIF up to 4 MB.</p>
        <label>Add image<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif"></label>
        <button type="submit">Save</button>
        <span class="admin-save-status" role="status" aria-live="polite"></span>
      `;
      onAction(form, 'submit', async event => {
        event.preventDefault();
        const data = new FormData(form);
        const imageFile = data.get('image');
        const imageUrls = data.get('images').split('\n').map(s => s.trim()).filter(Boolean);
        if (imageFile?.size) {
          if (imageFile.size > 4 * 1024 * 1024) throw new Error('Choose an image of 4 MB or smaller.');
          if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(imageFile.type)) throw new Error('Use JPG, PNG, WebP, GIF or AVIF images.');
          const uploadRes = await API.upload(imageFile);
          imageUrls.push((await uploadRes.json()).url);
          // Retain the upload even if the subsequent product save fails. Retrying must
          // neither upload it twice nor restore the old image list.
          form.elements.images.value = imageUrls.join('\n');
          form.elements.image.value = '';
        }
        const payload = {
          id: product.id,
          updated_at: product.updated_at,
          name: data.get('name'),
          description: data.get('description'),
          price_cents: Math.round(parseFloat(data.get('price')) * 100),
          images: imageUrls,
        };
        const finishFields = [...data.keys()].filter(key => key.startsWith('finish:'));
        if (finishFields.length) {
          payload.finish_prices = Object.fromEntries(
            finishFields.map(key => [key.slice('finish:'.length), Math.round(parseFloat(data.get(key)) * 100)]),
          );
        }
        const res = await API.products.save(payload);
        const saved = await res.json();
        if (saved.product) Object.assign(product, saved.product);
        form.querySelector('.admin-save-status').textContent = res.ok ? 'Saved' : 'Error';
      });
      panel.append(form);
    });
  }

  async function renderInventory() {
    const panel = document.getElementById('admin-tab-inventory');
    const rows = await API.inventory.list();
    panel.innerHTML = '';
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Product</th><th>Size</th><th>Stock</th><th></th></tr></thead>';
    const tbody = document.createElement('tbody');
    rows.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(row.product_id)}</td>
        <td>${escapeHtml(row.size)}</td>
        <td><input type="number" min="0" value="${row.stock}"></td>
        <td><button type="button">Save</button><span class="admin-save-status" role="status" aria-live="polite"></span></td>
      `;
      onAction(tr.querySelector('button'), 'click', async () => {
        const input = tr.querySelector('input');
        const stock = Number(input.value);
        if (!input.value.trim() || !Number.isInteger(stock) || stock < 0) throw new Error('Stock must be a whole number of zero or more.');
        const res = await API.inventory.save({ product_id: row.product_id, size: row.size, stock });
        tr.querySelector('.admin-save-status').textContent = res.ok ? 'Saved' : 'Error';
      });
      tbody.append(tr);
    });
    table.append(tbody);
    panel.append(table);
  }

  async function renderOrders() {
    const panel = document.getElementById('admin-tab-orders');
    const orders = await API.orders.list();
    panel.innerHTML = '';
    orders.forEach(order => {
      const card = document.createElement('div');
      card.className = 'admin-card';
      const items = order.items.map(item => `${item.quantity} × ${item.description}`).join(', ');
      card.innerHTML = `
        <p><strong>${escapeHtml(order.customer_email)}</strong> — ${(order.amount_total / 100).toFixed(2)} ${order.currency.toUpperCase()}</p>
        <p>${escapeHtml(items)}</p>
        <label><input type="checkbox" ${order.fulfilled ? 'checked' : ''}> Fulfilled</label>
        <label>Tracking <input type="text" value="${escapeAttr(order.tracking)}"></label>
        <button type="button">Save</button>
        <span class="admin-save-status" role="status" aria-live="polite"></span>
      `;
      onAction(card.querySelector('button'), 'click', async () => {
        const fulfilled = card.querySelector('input[type="checkbox"]').checked;
        const tracking = card.querySelector('input[type="text"]').value;
        const res = await API.orders.save({ session_id: order.id, fulfilled, tracking });
        card.querySelector('.admin-save-status').textContent = res.ok ? 'Saved' : 'Error';
      });
      panel.append(card);
    });
  }

  async function renderContent() {
    const panel = document.getElementById('admin-tab-content');
    const rows = await API.content.list();
    panel.innerHTML = '';
    rows.forEach(row => {
      const form = document.createElement('form');
      form.className = 'admin-card';
      form.innerHTML = `
        <label>${escapeHtml(row.key)}<textarea name="value">${escapeHtml(row.value)}</textarea></label>
        <button type="submit">Save</button>
        <span class="admin-save-status" role="status" aria-live="polite"></span>
      `;
      onAction(form, 'submit', async event => {
        event.preventDefault();
        const value = new FormData(form).get('value');
        const res = await API.content.save({ key: row.key, value });
        form.querySelector('.admin-save-status').textContent = res.ok ? 'Saved' : 'Error';
      });
      panel.append(form);
    });
  }
});
