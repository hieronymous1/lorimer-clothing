/* cart.js — localStorage cart state */

const CART_KEY = 'lorimer-cart';
const CART_LIMITS = Object.freeze({
  items: 50,
  id: 128,
  name: 200,
  size: 32,
  image: 512,
  quantity: 99,
  price: 1_000_000,
  total: 10_000_000,
});

function normalizeText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function normalizeImage(value) {
  if (typeof value !== 'string') return '';
  const image = value.trim().slice(0, CART_LIMITS.image);
  if (!image || image.includes('\\')) return '';

  try {
    const decoded = decodeURIComponent(image).replace(/^\.\//, '');
    if (!decoded.startsWith('assets/')) return '';
    if (decoded.split('/').includes('..')) return '';
    return image;
  } catch {
    return '';
  }
}

function normalizeCart(value) {
  if (!Array.isArray(value)) return [];

  const items = [];
  const byKey = new Map();

  value.slice(0, CART_LIMITS.items).forEach(raw => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return;

    const id = normalizeText(raw.id, CART_LIMITS.id);
    const name = normalizeText(raw.name, CART_LIMITS.name);
    const size = normalizeText(raw.size, CART_LIMITS.size);
    if (!id || !name || !size || typeof raw.price !== 'number' || !Number.isFinite(raw.price)) return;

    const price = Math.min(CART_LIMITS.price, Math.max(0, raw.price));
    const rawQuantity = typeof raw.quantity === 'number' && Number.isFinite(raw.quantity)
      ? Math.trunc(raw.quantity)
      : 1;
    const quantity = Math.min(CART_LIMITS.quantity, Math.max(1, rawQuantity));
    const key = `${id}|${size}`;
    const existing = byKey.get(key);

    if (existing) {
      existing.quantity = Math.min(CART_LIMITS.quantity, existing.quantity + quantity);
      return;
    }

    const item = {
      id,
      name,
      size,
      price,
      quantity,
      image: normalizeImage(raw.image),
    };
    byKey.set(key, item);
    items.push(item);
  });

  return items;
}

function getCart() {
  try {
    return normalizeCart(JSON.parse(localStorage.getItem(CART_KEY)));
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(normalizeCart(cart)));
}

function addToCart(product, size) {
  const cart = getCart();
  const key = product.id + '|' + size;
  const existing = cart.find(i => i.id === product.id && i.size === size);
  if (existing) {
    existing.quantity = Math.min(CART_LIMITS.quantity, existing.quantity + 1);
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      size: size,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '',
    });
  }
  saveCart(cart);
  return cart;
}

function removeFromCart(id, size) {
  const cart = getCart().filter(i => !(i.id === id && i.size === size));
  saveCart(cart);
  return cart;
}

function updateQuantity(id, size, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id && i.size === size);
  if (item) {
    if (qty <= 0) return removeFromCart(id, size);
    item.quantity = qty;
    saveCart(cart);
  }
  return getCart();
}

function getTotal() {
  return getCart().reduce(
    (sum, item) => Math.min(CART_LIMITS.total, sum + getLineTotal(item)),
    0,
  );
}

function getLineTotal(item) {
  const total = item.price * item.quantity;
  return Number.isFinite(total) ? Math.min(CART_LIMITS.total, Math.max(0, total)) : 0;
}

function getCount() {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}
