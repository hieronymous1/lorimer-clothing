/* product.js — image gallery, size selector, add to cart */

document.addEventListener('DOMContentLoaded', () => {
  injectCartDrawer();
  loadProduct();
});

function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];

  document.title = product.name + ' — LORIMER®';

  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-price').textContent = '$' + product.price;
  document.getElementById('product-desc').textContent = product.description;
  document.getElementById('product-material').textContent = 'Material: ' + product.material;

  renderGallery(product);
  renderSizes(product);
  initAddToCart(product);
}

function renderGallery(product) {
  const mainImg = document.getElementById('gallery-main');
  const thumbsEl = document.getElementById('gallery-thumbs');
  if (!mainImg || !thumbsEl) return;

  if (product.images.length > 0) {
    mainImg.src = product.images[0];
    mainImg.alt = product.name;
  }

  thumbsEl.innerHTML = product.images.map((src, i) => `
    <img class="gallery-thumb ${i === 0 ? 'active' : ''}" src="${src}" alt="${product.name} view ${i + 1}" loading="lazy">
  `).join('');

  thumbsEl.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      mainImg.src = product.images[i];
      thumbsEl.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

function renderSizes(product) {
  const sizeGrid = document.getElementById('size-grid');
  if (!sizeGrid) return;

  sizeGrid.innerHTML = product.sizes.map(s => `
    <button class="size-btn" data-size="${s}">${s}</button>
  `).join('');

  sizeGrid.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sizeGrid.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('size-error')?.classList.remove('visible');
    });
  });
}

function initAddToCart(product) {
  const btn = document.getElementById('add-to-cart');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const selected = document.querySelector('.size-btn.selected');
    if (!selected) {
      document.getElementById('size-error')?.classList.add('visible');
      return;
    }
    addToCart(product, selected.dataset.size);
    updateCartBadge();
    openCartDrawer();
  });
}
