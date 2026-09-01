const API = {
  session: () => fetch('/api/admin/login').then(r => r.json()),
  login: password => fetch('/api/admin/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
  }),
  logout: () => fetch('/api/admin/login', { method: 'DELETE' }),
  products: {
    list: () => fetch('/api/admin/products').then(r => r.json()),
    save: product => fetch('/api/admin/products', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product),
    }),
  },
  inventory: {
    list: () => fetch('/api/admin/inventory').then(r => r.json()),
    save: row => fetch('/api/admin/inventory', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row),
    }),
  },
  orders: {
    list: () => fetch('/api/admin/orders').then(r => r.json()),
    save: note => fetch('/api/admin/orders', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note),
    }),
  },
  content: {
    list: () => fetch('/api/admin/content').then(r => r.json()),
    save: entry => fetch('/api/admin/content', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry),
    }),
  },
  upload: file => fetch(`/api/admin/upload?filename=${encodeURIComponent(file.name)}`, {
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

  API.session().then(session => {
    if (!session.authenticated) return;
    loginView.hidden = true;
    panelView.hidden = false;
    renderProducts();
  }).catch(() => {});

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const password = document.getElementById('admin-password').value;
    const res = await API.login(password);
    if (!res.ok) {
      loginError.textContent = 'Incorrect password.';
      loginError.hidden = false;
      return;
    }
    loginView.hidden = true;
    panelView.hidden = false;
    renderProducts();
  });

  document.getElementById('admin-logout').addEventListener('click', async () => {
    await API.logout();
    panelView.hidden = true;
    loginView.hidden = false;
  });

  document.querySelectorAll('.admin-tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab[data-tab]').forEach(t => t.classList.remove('admin-tab--active'));
      document.querySelectorAll('.admin-tab-panel').forEach(p => { p.hidden = true; });
      tab.classList.add('admin-tab--active');
      document.getElementById(`admin-tab-${tab.dataset.tab}`).hidden = false;
      if (tab.dataset.tab === 'products') renderProducts();
      if (tab.dataset.tab === 'inventory') renderInventory();
      if (tab.dataset.tab === 'orders') renderOrders();
      if (tab.dataset.tab === 'content') renderContent();
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
        <label>Images (one URL per line)<textarea name="images">${(product.images || []).join('\n')}</textarea></label>
        <label>Add image<input name="image" type="file" accept="image/*"></label>
        <button type="submit">Save</button>
        <span class="admin-save-status"></span>
      `;
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const data = new FormData(form);
        const imageFile = data.get('image');
        const imageUrls = data.get('images').split('\n').map(s => s.trim()).filter(Boolean);
        if (imageFile?.size) {
          const uploadRes = await API.upload(imageFile);
          if (!uploadRes.ok) {
            form.querySelector('.admin-save-status').textContent = 'Image upload failed';
            return;
          }
          imageUrls.push((await uploadRes.json()).url);
        }
        const payload = {
          id: product.id,
          name: data.get('name'),
          description: data.get('description'),
          price_cents: Math.round(parseFloat(data.get('price')) * 100),
          images: imageUrls,
        };
        const res = await API.products.save(payload);
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
        <td><button type="button">Save</button><span class="admin-save-status"></span></td>
      `;
      tr.querySelector('button').addEventListener('click', async () => {
        const stock = parseInt(tr.querySelector('input').value, 10);
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
        <span class="admin-save-status"></span>
      `;
      card.querySelector('button').addEventListener('click', async () => {
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
        <span class="admin-save-status"></span>
      `;
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const value = new FormData(form).get('value');
        const res = await API.content.save({ key: row.key, value });
        form.querySelector('.admin-save-status').textContent = res.ok ? 'Saved' : 'Error';
      });
      panel.append(form);
    });
  }
});
