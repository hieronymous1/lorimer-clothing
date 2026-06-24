/* cart.js — localStorage cart state */

const CART_KEY = 'lorimer-cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product, size) {
  const cart = getCart();
  const key = product.id + '|' + size;
  const existing = cart.find(i => i.id === product.id && i.size === size);
  if (existing) {
    existing.quantity += 1;
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
  return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function getCount() {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}
