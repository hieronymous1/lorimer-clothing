/* checkout.js — real Stripe Checkout handoff */

document.addEventListener('DOMContentLoaded', () => {
  renderOrderSummary();
  handleRedirectState();
  wirePayButton();
  wireShippingRegion();
});

function formatEuro(cents) {
  return `€${(cents / 100).toFixed(2)}`;
}

function getSelectedRegion() {
  return document.querySelector('input[name="shipping_region"]:checked')?.value || '';
}

function renderShippingRegions() {
  const fieldset = document.getElementById('checkout-shipping-region');
  if (!fieldset || typeof SHIPPING_REGIONS === 'undefined') return;
  SHIPPING_REGIONS.forEach(entry => {
    const label = document.createElement('label');
    label.className = 'checkout-region';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'shipping_region';
    input.value = entry.region;
    input.className = 'checkout-region__input';
    const name = createTextElement('span', 'checkout-region__name', entry.label);
    const price = createTextElement('span', 'checkout-region__price', formatEuro(entry.amount_cents));
    const delivery = createTextElement('span', 'checkout-region__delivery', entry.delivery);
    label.append(input, name, price, delivery);
    fieldset.append(label);
  });
}

function swapText(el, text) {
  if (!el) return;
  el.classList.add('swap-text');
  const current = el.querySelector('span:not(.is-leaving)');
  if (current && current.textContent === text) return;
  const next = document.createElement('span');
  next.textContent = text;
  if (!current) {
    el.replaceChildren(next);
    return;
  }
  next.classList.add('is-entering');
  current.classList.add('is-leaving');
  el.append(next);
  requestAnimationFrame(() => next.classList.remove('is-entering'));
  current.addEventListener('transitionend', () => current.remove(), { once: true });
  setTimeout(() => current.remove(), 260);
}

function handleRedirectState() {
  const params = new URLSearchParams(window.location.search);
  const successEl = document.getElementById('checkout-success');
  const canceledEl = document.getElementById('checkout-canceled');
  const formEl = document.getElementById('checkout-form');

  if (params.get('success') === '1') {
    if (successEl) successEl.hidden = false;
    if (formEl) formEl.hidden = true;
    if (typeof clearCart === 'function') clearCart();
    renderOrderSummary();
  } else if (params.get('canceled') === '1') {
    if (canceledEl) canceledEl.hidden = false;
  }
}

function wirePayButton() {
  const button = document.getElementById('checkout-pay-btn');
  const errorEl = document.getElementById('checkout-error');
  if (!button) return;

  button.addEventListener('click', async () => {
    const cart = getCart();
    if (errorEl) errorEl.hidden = true;

    if (cart.length === 0) {
      if (errorEl) {
        errorEl.textContent = 'Your cart is empty.';
        errorEl.hidden = false;
      }
      return;
    }
    if (!getSelectedRegion()) {
      if (errorEl) {
        errorEl.textContent = 'Please select your shipping destination.';
        errorEl.hidden = false;
      }
      return;
    }

    button.disabled = true;
    button.textContent = 'Redirecting to payment…';

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map(item => ({ id: item.id, size: item.size, finish: item.finish || '', quantity: item.quantity })),
          shipping_region: getSelectedRegion(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (errorEl) {
          errorEl.textContent = data.error || 'Something went wrong. Please try again.';
          errorEl.hidden = false;
        }
        button.disabled = false;
        button.textContent = 'Pay Now';
        return;
      }

      window.location.href = data.url;
    } catch {
      if (errorEl) {
        errorEl.textContent = 'Something went wrong. Please try again.';
        errorEl.hidden = false;
      }
      button.disabled = false;
      button.textContent = 'Pay Now';
    }
  });
}

function wireShippingRegion() {
  renderShippingRegions();
  const regionEl = document.getElementById('checkout-shipping-region');
  if (!regionEl) return;
  regionEl.addEventListener('change', renderOrderSummary);
}

function renderOrderSummary() {
  const itemsEl = document.getElementById('summary-items');
  const subtotalEl = document.getElementById('summary-subtotal');
  const totalEl = document.getElementById('summary-total');

  const cart = getCart();

  if (!itemsEl) return;
  itemsEl.replaceChildren();

  if (cart.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'checkout-empty';
    empty.textContent = 'Your cart is empty.';
    itemsEl.append(empty);
    if (subtotalEl) subtotalEl.textContent = '€0';
    if (totalEl) totalEl.textContent = '€0';
    return;
  }

  const fragment = document.createDocumentFragment();
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'summary-item';

    const image = createSafeCartImage(item, 'summary-item__image');
    const info = document.createElement('div');
    info.className = 'summary-item__info';
    info.append(
      createTextElement('p', 'summary-item__name', item.name),
      createTextElement('p', 'summary-item__size', `${formatSizeLabel(item.size)}${item.finish ? ` · ${toTitleCase(getFinishLabel(getCanonicalProduct(item.id), item.finish))}` : ''}${item.quantity > 1 ? ` × ${item.quantity}` : ''}`),
    );
    const price = createTextElement('span', 'summary-item__price', `€${getLineTotal(item).toLocaleString()}`);

    row.append(image, info, price);
    fragment.append(row);
  });
  itemsEl.append(fragment);

  const total = getTotal();
  const region = getSelectedRegion();
  const entry = typeof SHIPPING_REGIONS !== 'undefined' ? SHIPPING_REGIONS.find(r => r.region === region) : null;
  const shippingCents = entry ? entry.amount_cents : 0;
  const subtotalCents = Math.round(total * 100);
  const shippingEl = document.getElementById('summary-shipping');
  if (subtotalEl) subtotalEl.textContent = formatEuro(subtotalCents);
  swapText(shippingEl, entry ? formatEuro(shippingCents) : 'Select region');
  swapText(totalEl, formatEuro(subtotalCents + shippingCents));
}

function toTitleCase(label) {
  return label.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
}
