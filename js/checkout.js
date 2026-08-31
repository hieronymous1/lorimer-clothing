/* checkout.js — real Stripe Checkout handoff */

document.addEventListener('DOMContentLoaded', () => {
  renderOrderSummary();
  handleRedirectState();
  wirePayButton();
});

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

    button.disabled = true;
    button.textContent = 'Redirecting to payment…';

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map(item => ({ id: item.id, size: item.size, quantity: item.quantity })),
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
    if (subtotalEl) subtotalEl.textContent = '$0';
    if (totalEl) totalEl.textContent = '$0';
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
      createTextElement('p', 'summary-item__size', `Size: ${item.size}${item.quantity > 1 ? ` × ${item.quantity}` : ''}`),
    );
    const price = createTextElement('span', 'summary-item__price', `$${getLineTotal(item).toLocaleString()}`);

    row.append(image, info, price);
    fragment.append(row);
  });
  itemsEl.append(fragment);

  const total = getTotal();
  if (subtotalEl) subtotalEl.textContent = '$' + total.toLocaleString();
  if (totalEl) totalEl.textContent = '$' + total.toLocaleString();
}
