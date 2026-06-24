/* checkout.js — order summary, form validation, success */

document.addEventListener('DOMContentLoaded', () => {
  renderOrderSummary();
  initForm();
});

function renderOrderSummary() {
  const itemsEl = document.getElementById('summary-items');
  const subtotalEl = document.getElementById('summary-subtotal');
  const totalEl = document.getElementById('summary-total');

  const cart = getCart();

  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="checkout-empty">Your cart is empty.</p>';
    if (subtotalEl) subtotalEl.textContent = '$0';
    if (totalEl) totalEl.textContent = '$0';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="summary-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.style.background='#e4e4e7';">
      <div class="summary-item__info">
        <p class="summary-item__name">${item.name}</p>
        <p class="summary-item__size">Size: ${item.size}${item.quantity > 1 ? ' &times; ' + item.quantity : ''}</p>
      </div>
      <span class="summary-item__price">$${(item.price * item.quantity).toLocaleString()}</span>
    </div>
  `).join('');

  const total = getTotal();
  if (subtotalEl) subtotalEl.textContent = '$' + total.toLocaleString();
  if (totalEl) totalEl.textContent = '$' + total.toLocaleString();
}

function initForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  formatCardNumber();
  formatExpiry();

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    clearCart();

    form.style.display = 'none';
    const success = document.getElementById('order-success');
    if (success) success.classList.add('visible');

    document.getElementById('summary-items').innerHTML = '';
    document.getElementById('summary-subtotal').textContent = '$0';
    document.getElementById('summary-total').textContent = '$0';
  });
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      valid = false;
    } else {
      input.classList.remove('error');
    }
  });
  return valid;
}

function formatCardNumber() {
  const input = document.getElementById('card-number');
  if (!input) return;
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '').substring(0, 16);
    input.value = v.replace(/(.{4})/g, '$1 ').trim();
  });
}

function formatExpiry() {
  const input = document.getElementById('card-expiry');
  if (!input) return;
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
    input.value = v;
  });
}
