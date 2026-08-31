/* main.js — shared cart drawer, badge, and nav state */

let cartDrawerTrigger = null;
let cartDrawerClosing = false;
const cartBackgroundState = new Map();

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge(); injectCartDrawer(); initCartDrawer(); setNavActive();
  injectMobileMenu(); initMobileMenu();
});

let mobileMenuTrigger = null;

function injectMobileMenu() {
  if (document.getElementById('mobile-menu')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="mobile-menu-overlay" id="mobile-menu-overlay" aria-hidden="true"></div>
    <nav class="mobile-menu" id="mobile-menu" aria-label="Mobile navigation">
      <button class="mobile-menu__close" id="mobile-menu-close" type="button" aria-label="Close menu">×</button>
      <a href="index.html">Home</a>
      <a href="ss24.html">S/S_24</a>
      <a href="shop.html">Products</a>
      <a href="about.html">About</a>
    </nav>
  `);
}

function initMobileMenu() {
  const overlay = document.getElementById('mobile-menu-overlay');
  const menu = document.getElementById('mobile-menu');
  if (!overlay || !menu) return;
  document.querySelectorAll('.navbar__hamburger').forEach(button => {
    button.addEventListener('click', () => openMobileMenu(button));
  });
  overlay.addEventListener('click', closeMobileMenu);
  document.getElementById('mobile-menu-close')?.addEventListener('click', closeMobileMenu);
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('open')) closeMobileMenu();
  });
}

function openMobileMenu(trigger) {
  const overlay = document.getElementById('mobile-menu-overlay');
  const menu = document.getElementById('mobile-menu');
  if (!overlay || !menu) return;
  mobileMenuTrigger = trigger;
  trigger.setAttribute('aria-expanded', 'true');
  overlay.classList.add('open');
  menu.classList.add('open');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => document.getElementById('mobile-menu-close')?.focus());
}

function closeMobileMenu() {
  const overlay = document.getElementById('mobile-menu-overlay');
  const menu = document.getElementById('mobile-menu');
  if (!overlay || !menu || !menu.classList.contains('open')) return;
  overlay.classList.remove('open');
  menu.classList.remove('open');
  document.body.style.overflow = '';
  document.querySelectorAll('.navbar__hamburger').forEach(button => button.setAttribute('aria-expanded', 'false'));
  mobileMenuTrigger?.focus();
}

function updateCartBadge() {
  const count = getCount();
  document.querySelectorAll('.cart-count').forEach(el => { el.textContent = `(${count})`; });
  const heading = document.getElementById('cart-heading');
  if (heading) heading.textContent = `Cart (${count})`;
}

function initCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (!overlay || !drawer) return;
  document.querySelectorAll('.cart-btn, .open-cart').forEach(button => {
    button.addEventListener('click', event => openCartDrawer(event.currentTarget));
  });
  overlay.addEventListener('click', closeCartDrawer);
  document.getElementById('cart-close')?.addEventListener('click', closeCartDrawer);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawer.classList.contains('open')) closeCartDrawer();
    if (event.key === 'Tab' && (drawer.classList.contains('open') || cartDrawerClosing)) trapCartFocus(event);
  });
}

function setCartBackgroundInert(isInert) {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  [...document.body.children].forEach(element => {
    if (element === overlay || element === drawer || element.tagName === 'SCRIPT') return;
    if (isInert) {
      cartBackgroundState.set(element, { inert: element.inert, ariaHidden: element.getAttribute('aria-hidden') });
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
    } else {
      const previous = cartBackgroundState.get(element);
      if (!previous) return;
      element.inert = previous.inert;
      if (previous.ariaHidden === null) element.removeAttribute('aria-hidden');
      else element.setAttribute('aria-hidden', previous.ariaHidden);
    }
  });
  if (!isInert) cartBackgroundState.clear();
}

function openCartDrawer(trigger) {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (!overlay || !drawer) return;
  cartDrawerTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement;
  cartDrawerClosing = false;
  renderCartDrawer();
  setCartBackgroundInert(true);
  overlay.classList.add('open');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => document.getElementById('cart-close')?.focus());
}

function closeCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (!overlay || !drawer || !drawer.classList.contains('open')) return;
  cartDrawerClosing = true;
  overlay.classList.remove('open');
  drawer.classList.remove('open');
  const finishClose = () => {
    if (!cartDrawerClosing) return;
    cartDrawerClosing = false;
    document.body.style.overflow = '';
    setCartBackgroundInert(false);
    const fallback = document.querySelector('.cart-btn, .open-cart');
    const target = cartDrawerTrigger?.isConnected && !cartDrawerTrigger.disabled ? cartDrawerTrigger : fallback;
    if (target instanceof HTMLElement) target.focus();
    else { document.body.tabIndex = -1; document.body.focus(); }
  };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finishClose();
  else {
    drawer.addEventListener('transitionend', finishClose, { once: true });
    window.setTimeout(finishClose, 350);
  }
}

function trapCartFocus(event) {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  const controls = [...drawer.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')]
    .filter(element => !element.hidden);
  if (!controls.length) return;
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

function formatMoney(money) {
  return new Intl.NumberFormat('en', { style: 'currency', currency: money.currencyCode, maximumFractionDigits: 0 })
    .format(money.amountMinor / 100);
}

function announceCart(message, isError = false) {
  const status = document.getElementById('cart-status');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-error', isError);
}

function cartErrorMessage(error) {
  if (error === 'quantity-limit') return 'Maximum quantity reached.';
  if (error === 'line-limit') return 'This cart cannot hold another distinct item.';
  return 'Cart could not be updated. Please try again.';
}

async function mutateCartLine(button, operation, successMessage) {
  const row = button.closest('.cart-item');
  (row ? [...row.querySelectorAll('button')] : [button]).forEach(control => { control.disabled = true; });
  announceCart('Updating cart…');
  const result = await operation();
  updateCartBadge();
  renderCartDrawer();
  announceCart(result.ok ? successMessage : cartErrorMessage(result.error), !result.ok);
}

function renderCartDrawer() {
  const itemsElement = document.getElementById('cart-items');
  const subtotalElement = document.getElementById('cart-subtotal-amount');
  if (!itemsElement) return;
  const state = getCartState();
  updateCartBadge();

  if (state.lines.length === 0) {
    itemsElement.replaceChildren();
    renderEmptyCart(itemsElement);
  } else {
    if (itemsElement.querySelector('.cart-empty')) itemsElement.replaceChildren();
    // Only genuinely new/removed lines animate — an existing row is updated
    // in place so a quantity change on one line doesn't replay every row's
    // entrance animation.
    const existingRows = new Map(
      [...itemsElement.querySelectorAll('.cart-item')].map(row => [row.dataset.lineKey, row]),
    );
    const seenKeys = new Set();
    state.lines.forEach((line, index) => {
      seenKeys.add(line.lineKey);
      const existing = existingRows.get(line.lineKey);
      if (existing) updateCartRow(existing, line);
      else itemsElement.appendChild(createCartRow(line, index));
    });
    existingRows.forEach((row, key) => { if (!seenKeys.has(key)) row.remove(); });
  }

  if (subtotalElement) subtotalElement.textContent = formatMoney(state.subtotal);
}

function renderEmptyCart(itemsElement) {
  const empty = document.createElement('div');
  empty.className = 'cart-empty';
  empty.append(createTextElement('p', '', 'Your cart is empty.'));
  const returnButton = document.createElement('button');
  returnButton.type = 'button';
  returnButton.className = 'cart-empty__return';
  returnButton.textContent = 'Return to shop';
  returnButton.addEventListener('click', () => {
    const page = window.location.pathname.split('/').pop();
    if (page === 'shop.html') closeCartDrawer();
    else window.location.assign('shop.html');
  });
  empty.append(returnButton);
  itemsElement.append(empty);
}

function createCartRow(line, index) {
  const row = document.createElement('article');
  row.className = 'cart-item';
  row.dataset.lineKey = line.lineKey;
  row.dataset.lineName = line.name;
  row.style.setProperty('--i', index);
  const info = document.createElement('div');
  info.className = 'cart-item__info';
  const nameEl = createTextElement('h3', 'cart-item__name', line.name);
  const sizeEl = createTextElement('p', 'cart-item__size', `Size ${line.size}`);
  const priceEl = createTextElement('p', 'cart-item__price', `${formatMoney(line.unitPrice)} each · ${formatMoney(line.lineTotal)} total`);
  info.append(nameEl, sizeEl, priceEl);
  const actions = document.createElement('div');
  actions.className = 'cart-item__actions';
  const quantity = document.createElement('div');
  quantity.className = 'cart-item__quantity';
  quantity.setAttribute('aria-label', `Quantity for ${line.name}`);
  const decrement = createQuantityButton('cart-item__quantity-decrement', '−', `Decrease ${line.name} quantity`);
  const amount = createTextElement('span', 'cart-item__quantity-value', String(line.quantity));
  const increment = createQuantityButton('cart-item__quantity-increment', '+', `Increase ${line.name} quantity`);
  decrement.addEventListener('click', () => {
    const current = Number(amount.textContent) || 0;
    mutateCartLine(decrement, () => cartService.updateLineQuantity(row.dataset.lineKey, current - 1), current === 1 ? `${row.dataset.lineName} removed.` : `${row.dataset.lineName} quantity decreased.`);
  });
  increment.addEventListener('click', () => {
    const current = Number(amount.textContent) || 0;
    mutateCartLine(increment, () => cartService.updateLineQuantity(row.dataset.lineKey, current + 1), `${row.dataset.lineName} quantity increased.`);
  });
  quantity.append(decrement, amount, increment);
  const remove = document.createElement('button');
  remove.className = 'cart-item__remove';
  remove.type = 'button';
  remove.setAttribute('aria-label', `Remove ${line.name}`);
  remove.textContent = 'Remove';
  remove.addEventListener('click', () => mutateCartLine(remove, () => cartService.removeLine(row.dataset.lineKey), `${row.dataset.lineName} removed.`));
  actions.append(quantity, remove);
  info.append(actions);
  row.append(createSafeCartImage(line, 'cart-item__img'), info);
  row._refs = { priceEl, amount };
  return row;
}

function updateCartRow(row, line) {
  row.dataset.lineName = line.name;
  const refs = row._refs;
  if (!refs) return;
  refs.priceEl.textContent = `${formatMoney(line.unitPrice)} each · ${formatMoney(line.lineTotal)} total`;
  refs.amount.textContent = String(line.quantity);
}

function createQuantityButton(className, text, label) {
  const button = document.createElement('button');
  button.className = className; button.type = 'button'; button.textContent = text;
  button.setAttribute('aria-label', label);
  return button;
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function createSafeCartImage(item, className) {
  const image = document.createElement('img');
  image.className = className; image.alt = item.name;
  if (item.image) image.src = item.image;
  image.addEventListener('error', () => {
    image.removeAttribute('src'); image.style.background = '#e4e4e7'; image.style.minHeight = '96px';
  });
  return image;
}

function setNavActive() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar a').forEach(anchor => {
    const href = anchor.getAttribute('href') || '';
    if ((path === 'index.html' || path === '') && (href === 'index.html' || href === './') ||
      path === 'ss24.html' && href.includes('ss24') || path === 'shop.html' && href.includes('shop') ||
      path === 'about.html' && href.includes('about') || path === 'checkout.html' && href.includes('checkout')) {
      anchor.classList.add('nav-active');
    }
  });
}

function injectCartDrawer() {
  if (document.getElementById('cart-overlay')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="cart-overlay" id="cart-overlay" aria-hidden="true"></div>
    <aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-heading">
      <div class="cart-drawer__header">
        <h2 id="cart-heading">Cart (0)</h2>
        <button class="cart-drawer__close" id="cart-close" type="button" aria-label="Close cart">×</button>
      </div>
      <p class="cart-status" id="cart-status" aria-live="polite" aria-atomic="true"></p>
      <div class="cart-drawer__items" id="cart-items"></div>
      <div class="cart-drawer__footer">
        <div class="cart-subtotal"><span>Subtotal</span><span id="cart-subtotal-amount">$0</span></div>
        <button class="btn-checkout" type="button" disabled>Checkout unavailable</button>
        <p class="cart-checkout-note">Secure checkout will be available when the store launches.</p>
      </div>
    </aside>
  `);
}
