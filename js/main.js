/* main.js — shared: cart drawer, badge, nav active state */

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initCartDrawer();
  setNavActive();
});

function updateCartBadge() {
  const count = getCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.classList.toggle('visible', count > 0);
  });
}

function initCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (!overlay || !drawer) return;

  document.querySelectorAll('.cart-btn, .open-cart').forEach(btn => {
    btn.addEventListener('click', openCartDrawer);
  });

  overlay.addEventListener('click', closeCartDrawer);

  document.getElementById('cart-close')?.addEventListener('click', closeCartDrawer);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCartDrawer();
  });
}

function openCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (!overlay || !drawer) return;
  renderCartDrawer();
  overlay.classList.add('open');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (!overlay || !drawer) return;
  overlay.classList.remove('open');
  drawer.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartDrawer() {
  const itemsEl = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('cart-subtotal-amount');
  if (!itemsEl) return;

  const cart = getCart();
  itemsEl.replaceChildren();

  if (cart.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'cart-empty';
    empty.textContent = 'Your cart is empty.';
    itemsEl.append(empty);
    if (subtotalEl) subtotalEl.textContent = '$0';
    return;
  }

  const fragment = document.createDocumentFragment();
  cart.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.style.setProperty('--i', index);

    const image = createSafeCartImage(item, 'cart-item__img');
    const info = document.createElement('div');
    info.className = 'cart-item__info';
    info.append(
      createTextElement('p', 'cart-item__name', item.name),
      createTextElement('p', 'cart-item__size', `Size: ${item.size}${item.quantity > 1 ? ` × ${item.quantity}` : ''}`),
      createTextElement('p', 'cart-item__price', `$${getLineTotal(item).toLocaleString()}`),
    );

    const remove = document.createElement('button');
    remove.className = 'cart-item__remove';
    remove.type = 'button';
    remove.dataset.id = item.id;
    remove.dataset.size = item.size;
    remove.setAttribute('aria-label', `Remove ${item.name}`);
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      removeFromCart(item.id, item.size);
      updateCartBadge();
      renderCartDrawer();
    });

    row.append(image, info, remove);
    fragment.append(row);
  });
  itemsEl.append(fragment);

  const total = getTotal();
  if (subtotalEl) subtotalEl.textContent = '$' + total.toLocaleString();
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createSafeCartImage(item, className) {
  const image = document.createElement('img');
  image.className = className;
  image.alt = item.name;
  if (item.image) image.src = item.image;
  image.addEventListener('error', () => {
    image.removeAttribute('src');
    image.style.background = '#e4e4e7';
    image.style.minHeight = '96px';
  });
  return image;
}

function setNavActive() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a, .navbar__right a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (
      (path === 'index.html' || path === '') && (href === 'index.html' || href === './') ||
      path === 'ss24.html' && href.includes('ss24') ||
      path === 'shop.html' && href.includes('shop') ||
      path === 'checkout.html' && href.includes('checkout')
    ) {
      a.classList.add('nav-active');
    }
  });
}

/* Cart drawer HTML — injected once per page that needs it */
function injectCartDrawer() {
  if (document.getElementById('cart-overlay')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="cart-overlay" id="cart-overlay"></div>
    <aside class="cart-drawer" id="cart-drawer" role="dialog" aria-label="Shopping cart">
      <div class="cart-drawer__header">
        <h2>Cart</h2>
        <button class="cart-drawer__close" id="cart-close" aria-label="Close cart">&times;</button>
      </div>
      <div class="cart-drawer__items" id="cart-items"></div>
      <div class="cart-drawer__footer">
        <div class="cart-subtotal">
          <span>Subtotal</span>
          <span id="cart-subtotal-amount">$0</span>
        </div>
        <a href="checkout.html" class="btn-checkout">Checkout &rarr;</a>
      </div>
    </aside>
  `);
}
