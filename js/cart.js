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

function getCanonicalProduct(id) {
  if (typeof PRODUCTS === 'undefined' || !Array.isArray(PRODUCTS)) return null;
  const product = PRODUCTS.find(entry => entry?.id === id);
  return product?.available === true ? product : null;
}

function isSizeAvailable(product, size, quantity = 1) {
  if (!product || !Array.isArray(product.sizes) || !product.sizes.includes(size)) return false;
  if (!product.stockBySize) return true;
  return Number.isInteger(product.stockBySize[size]) && product.stockBySize[size] >= quantity;
}

const CART_FINISH_MAX = 32;

function getProductFinishes(product) {
  return Array.isArray(product?.finishes) ? product.finishes : [];
}

function resolveFinish(product, rawFinish) {
  const finishes = getProductFinishes(product);
  if (finishes.length === 0) return { ok: true, id: '', price: product.price };
  const id = normalizeText(rawFinish, CART_FINISH_MAX) || finishes[0].id;
  const match = finishes.find(entry => entry.id === id);
  return match ? { ok: true, id: match.id, price: match.price } : { ok: false };
}

function getFinishLabel(product, finishId) {
  return getProductFinishes(product).find(entry => entry.id === finishId)?.label || '';
}

function formatSizeLabel(size) {
  return /^size\b/i.test(size) ? size : `Size ${size}`;
}

function cartLineKey(item) {
  return `${item.id}|${item.size}|${item.finish || ''}`;
}

function normalizeCart(value) {
  if (!Array.isArray(value)) return [];

  const items = [];
  const byKey = new Map();

  value.slice(0, CART_LIMITS.items).forEach(raw => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return;

    const id = normalizeText(raw.id, CART_LIMITS.id);
    const size = normalizeText(raw.size, CART_LIMITS.size);
    const product = getCanonicalProduct(id);
    if (!product || !size || !isSizeAvailable(product, size)) return;

    const finish = resolveFinish(product, raw.finish);
    if (!finish.ok) return;

    const price = Math.min(CART_LIMITS.price, Math.max(0, finish.price));
    const rawQuantity = typeof raw.quantity === 'number' && Number.isFinite(raw.quantity)
      ? Math.trunc(raw.quantity)
      : 1;
    const quantity = Math.min(CART_LIMITS.quantity, Math.max(1, rawQuantity));
    const key = `${id}|${size}|${finish.id}`;
    const existing = byKey.get(key);

    if (existing) {
      existing.quantity = Math.min(CART_LIMITS.quantity, existing.quantity + quantity);
      return;
    }

    const item = {
      id,
      name: normalizeText(product.name, CART_LIMITS.name),
      size,
      finish: finish.id,
      price,
      quantity,
      image: normalizeImage(product.images?.[0]),
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

function trySaveCart(cart) {
  try {
    const normalized = normalizeCart(cart);
    localStorage.setItem(CART_KEY, JSON.stringify(normalized));
    const confirmed = normalizeCart(JSON.parse(localStorage.getItem(CART_KEY)));
    return JSON.stringify(confirmed) === JSON.stringify(normalized);
  } catch {
    return false;
  }
}

function addToCart(product, size, finishId) {
  const canonical = getCanonicalProduct(product?.id);
  if (!canonical || !isSizeAvailable(canonical, size)) return getCart();
  const finish = resolveFinish(canonical, finishId);
  if (!finish.ok) return getCart();
  const cart = getCart();
  const existing = cart.find(i => i.id === canonical.id && i.size === size && i.finish === finish.id);
  if (existing) {
    existing.quantity = Math.min(CART_LIMITS.quantity, existing.quantity + 1);
  } else {
    cart.push({
      id: canonical.id,
      name: canonical.name,
      size: size,
      finish: finish.id,
      price: finish.price,
      quantity: 1,
      image: canonical.images[0] || '',
    });
  }
  saveCart(cart);
  return cart;
}

function removeFromCart(id, size, finish) {
  const cart = getCart().filter(i => !(i.id === id && i.size === size && i.finish === (finish || '')));
  saveCart(cart);
  return cart;
}

function updateQuantity(id, size, qty, finish) {
  const cart = getCart();
  const item = cart.find(i => i.id === id && i.size === size && i.finish === (finish || ''));
  if (item) {
    if (qty <= 0) return removeFromCart(id, size, finish);
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

function createMoney(amountMinor, currencyCode = 'EUR') {
  const amount = Number.isSafeInteger(amountMinor) ? amountMinor : 0;
  const currency = typeof currencyCode === 'string' && /^[A-Z]{3}$/.test(currencyCode)
    ? currencyCode
    : 'EUR';
  return { amountMinor: Math.max(0, amount), currencyCode: currency };
}

function getCartState(status = 'idle') {
  const cart = getCart();
  const lines = cart.map(item => {
    const unitPrice = createMoney(Math.round(item.price * 100));
    const lineTotal = createMoney(unitPrice.amountMinor * item.quantity, unitPrice.currencyCode);
    return {
      lineKey: cartLineKey(item),
      productId: item.id,
      merchandiseId: '',
      name: item.name,
      size: item.size,
      finish: item.finish,
      finishLabel: getFinishLabel(getCanonicalProduct(item.id), item.finish),
      image: item.image,
      unitPrice,
      quantity: item.quantity,
      lineTotal,
    };
  });
  return {
    lines,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: createMoney(lines.reduce((sum, line) => sum + line.lineTotal.amountMinor, 0)),
    status,
  };
}

function failedCartResult(error) {
  return { ok: false, cart: getCartState('error'), error };
}

const cartService = Object.freeze({
  async getCart() {
    return getCartState();
  },

  async addLine(line) {
    const productId = normalizeText(line?.productId, CART_LIMITS.id);
    const size = normalizeText(line?.size, CART_LIMITS.size);
    const product = getCanonicalProduct(productId);
    if (!product) return failedCartResult('product-unavailable');
    if (!size || !isSizeAvailable(product, size)) {
      return failedCartResult('invalid-line');
    }
    const finish = resolveFinish(product, line?.finish);
    if (!finish.ok || (line?.finish && finish.id !== line.finish)) return failedCartResult('invalid-line');
    const amountMinor = Math.round(finish.price * 100);

    const snapshot = getCart();
    const existing = snapshot.find(item => item.id === productId && item.size === size && item.finish === finish.id);
    // Stock is per size and shared across finishes.
    const sizeTotal = snapshot
      .filter(item => item.id === productId && item.size === size)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (!isSizeAvailable(product, size, sizeTotal + 1)) {
      return failedCartResult('product-unavailable');
    }
    if (!existing && snapshot.length >= CART_LIMITS.items) return failedCartResult('line-limit');
    if (existing && existing.quantity >= CART_LIMITS.quantity) return failedCartResult('quantity-limit');

    const next = snapshot.map(item => ({ ...item }));
    const nextExisting = next.find(item => item.id === productId && item.size === size && item.finish === finish.id);
    if (nextExisting) {
      nextExisting.quantity += 1;
    } else {
      next.push({
        id: productId,
        name: product.name,
        size,
        finish: finish.id,
        price: amountMinor / 100,
        quantity: 1,
        image: normalizeImage(product.images?.[0]),
      });
    }

    if (!trySaveCart(next)) return failedCartResult('storage-unavailable');
    return { ok: true, cart: getCartState() };
  },

  async updateLineQuantity(lineKey, quantity) {
    if (!Number.isInteger(quantity)) return failedCartResult('invalid-quantity');
    if (quantity <= 0) return this.removeLine(lineKey);
    if (quantity > CART_LIMITS.quantity) return failedCartResult('quantity-limit');

    const snapshot = getCart();
    const next = snapshot.map(item => ({ ...item }));
    const item = next.find(entry => cartLineKey(entry) === lineKey);
    if (!item) return failedCartResult('line-not-found');
    const product = getCanonicalProduct(item.id);
    const otherFinishes = next
      .filter(entry => entry !== item && entry.id === item.id && entry.size === item.size)
      .reduce((sum, entry) => sum + entry.quantity, 0);
    if (!product || !isSizeAvailable(product, item.size, otherFinishes + quantity)) return failedCartResult('product-unavailable');
    item.quantity = quantity;
    if (!trySaveCart(next)) return failedCartResult('storage-unavailable');
    return { ok: true, cart: getCartState() };
  },

  async removeLine(lineKey) {
    const snapshot = getCart();
    const next = snapshot.filter(item => cartLineKey(item) !== lineKey);
    if (next.length === snapshot.length) return failedCartResult('line-not-found');
    if (!trySaveCart(next)) return failedCartResult('storage-unavailable');
    return { ok: true, cart: getCartState() };
  },

  async beginCheckout() {
    return { ok: false, error: 'checkout-unavailable' };
  },
});
