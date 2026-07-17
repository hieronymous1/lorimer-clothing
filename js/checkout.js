/* checkout.js — safe, review-only order summary */

document.addEventListener('DOMContentLoaded', () => {
  renderOrderSummary();
});

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
