/* returns.js — Returns & Exchanges Portal form */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('returns-form');
  if (!form) return;
  const status = document.getElementById('returns-status');
  const exchange = form.querySelector('.returns-form__exchange');
  const submit = form.querySelector('.returns-form__submit');

  // Hidden + disabled when returning, so it is neither required nor submitted.
  const syncType = () => {
    const isExchange = form.elements.request_type.value === 'exchange';
    exchange.hidden = !isExchange;
    exchange.querySelector('input').disabled = !isExchange;
  };
  form.addEventListener('change', syncType);
  syncType();

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const invalid = [...form.querySelectorAll('[required]')].find(field => !field.checkValidity());
    if (invalid) {
      status.textContent = invalid.type === 'email' && invalid.value ? 'Please enter a valid email address.' : 'Please fill in every field.';
      status.classList.add('is-error');
      invalid.focus();
      return;
    }
    const payload = Object.fromEntries(new FormData(form));
    submit.disabled = true;
    status.classList.remove('is-error');
    status.textContent = 'Sending…';
    try {
      const res = await fetch('/api/returns', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Your request could not be sent. Please try again.');
      form.replaceChildren(status);
      status.textContent = 'Thank you. Your request has been registered and we will be in touch by email shortly. Please do not send the item back until you hear from us.';
    } catch (error) {
      status.textContent = error.message === 'Failed to fetch' ? 'Connection failed. Please try again.' : error.message;
      status.classList.add('is-error');
      submit.disabled = false;
    }
  });
});
