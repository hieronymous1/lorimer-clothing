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
  document.getElementById('product-price').textContent = product.available ? '$' + product.price : 'Sold Out';
  document.getElementById('product-desc').textContent = product.description;
  document.getElementById('product-material').textContent = 'Material: ' + product.material;

  renderGallery(product);
  renderSizes(product);
  initAddToCart(product);
}

function renderGallery(product) {
  const gallery = document.getElementById('product-gallery');
  if (!gallery) return;

  gallery.replaceChildren();
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];

  if (images.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'gallery-empty';
    empty.textContent = 'No product image available';
    gallery.appendChild(empty);
    return;
  }

  images.forEach((src, index) => {
    const image = document.createElement('img');
    image.className = 'gallery-image';
    image.src = src;
    image.alt = index === 0 ? product.name : '';
    image.loading = index === 0 ? 'eager' : 'lazy';
    image.decoding = 'async';
    if (index === 0) image.fetchPriority = 'high';
    gallery.appendChild(image);
    initImageMagnifier(image);
  });
}

function initImageMagnifier(image) {
  const magnifier = document.createElement('span');
  magnifier.className = 'gallery-magnifier';
  magnifier.hidden = true;
  magnifier.setAttribute('aria-hidden', 'true');
  document.body.appendChild(magnifier);

  const cursor = document.createElement('span');
  cursor.className = 'gallery-detail-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  image.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const bounds = image.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100));
    const lensSize = magnifier.getBoundingClientRect().width || 320;
    magnifier.hidden = false;
    magnifier.style.backgroundImage = `url("${image.currentSrc || image.src}")`;
    magnifier.style.backgroundPosition = `${x}% ${y}%`;
    magnifier.style.left = `${Math.min(window.innerWidth - lensSize - 16, event.clientX + 24)}px`;
    magnifier.style.top = `${Math.min(window.innerHeight - lensSize - 16, Math.max(16, event.clientY - lensSize / 2))}px`;
    cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    cursor.classList.add('is-active');
  });

  image.addEventListener('pointerleave', () => {
    magnifier.hidden = true;
    cursor.classList.remove('is-active');
  });
}

function renderSizes(product) {
  const sizeGrid = document.getElementById('size-grid');
  if (!sizeGrid) return;

  sizeGrid.replaceChildren();
  product.sizes.forEach(size => {
    const button = document.createElement('button');
    button.className = 'size-btn';
    button.type = 'button';
    button.dataset.size = size;
    button.textContent = size;
    button.disabled = !product.available;
    sizeGrid.appendChild(button);
  });

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

  if (!product.available) {
    btn.textContent = 'Sold Out';
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    return;
  }

  btn.addEventListener('click', async () => {
    const selected = document.querySelector('.size-btn.selected');
    if (!selected) {
      document.getElementById('size-error')?.classList.add('visible');
      return;
    }
    btn.disabled = true;
    const result = await cartService.addLine({
      productId: product.id,
      merchandiseId: '',
      name: product.name,
      size: selected.dataset.size,
      image: product.images[0] || '',
      unitPrice: { amountMinor: Math.round(product.price * 100), currencyCode: 'USD' },
    });
    btn.disabled = false;
    if (!result.ok) {
      const error = document.getElementById('size-error');
      if (error) {
        error.textContent = cartErrorMessage(result.error);
        error.classList.add('visible');
      }
      return;
    }
    updateCartBadge();
    openCartDrawer(btn);
  });
}
