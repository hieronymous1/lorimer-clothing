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

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    if (subtotalEl) subtotalEl.textContent = '$0';
    return;
  }

  itemsEl.innerHTML = cart.map((item, i) => `
    <div class="cart-item" style="--i:${i}">
      <img class="cart-item__img" src="${item.image}" alt="${item.name}" onerror="this.style.background='#e4e4e7';this.style.minHeight='96px';">
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__size">Size: ${item.size}${item.quantity > 1 ? ' &times; ' + item.quantity : ''}</p>
        <p class="cart-item__price">$${(item.price * item.quantity).toLocaleString()}</p>
      </div>
      <button class="cart-item__remove" data-id="${item.id}" data-size="${item.size}" aria-label="Remove">&times;</button>
    </div>
  `).join('');

  itemsEl.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.id, btn.dataset.size);
      updateCartBadge();
      renderCartDrawer();
    });
  });

  const total = getTotal();
  if (subtotalEl) subtotalEl.textContent = '$' + total.toLocaleString();
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
