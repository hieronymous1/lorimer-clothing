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
  document.getElementById('product-price').textContent =
    product.notForSale ? 'Not For Sale' : product.available ? '€' + product.price : 'Sold Out';
  renderLongDescription(product);

  const meta = [];
  if (product.material) meta.push('Material: ' + product.material);
  if (product.origin) meta.push(product.origin);
  if (product.oneOfOne) meta.push('1 of 1');
  document.getElementById('product-material').textContent = meta.join('  ·  ');

  // Not-for-sale pieces have no purchasable size selection.
  const sizeSection = document.getElementById('size-section');
  if (sizeSection) sizeSection.hidden = !!product.notForSale;

  renderGallery(product);
  renderColorVariants(product);
  renderStyleWith(product);
  if (!product.notForSale) renderSizes(product);
  initAddToCart(product);
}

function renderLongDescription(product) {
  const container = document.getElementById('product-desc');
  if (!container) return;
  container.replaceChildren();

  const paragraphs = [product.description, product.longDescription].filter(Boolean);
  paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text;
    container.appendChild(p);
  });
}

function renderStyleWith(product) {
  const section = document.getElementById('style-with-section');
  const grid = document.getElementById('style-with-grid');
  if (!section || !grid) return;

  const ids = Array.isArray(product.styleWith) ? product.styleWith : [];
  const items = ids.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

  if (items.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  grid.replaceChildren();

  items.forEach(item => {
    const link = document.createElement('a');
    link.className = 'style-with-card';
    link.href = `product-detail.html?id=${encodeURIComponent(item.id)}`;

    const image = document.createElement('img');
    image.className = 'style-with-card__img';
    image.src = item.images?.[0] || '';
    image.alt = item.name;
    image.loading = 'lazy';
    image.decoding = 'async';
    link.appendChild(image);

    const name = document.createElement('p');
    name.className = 'style-with-card__name';
    name.textContent = item.name;
    link.appendChild(name);

    grid.appendChild(link);
  });
}

function renderColorVariants(product) {
  const colorSection = document.getElementById('color-section');
  const swatchRow = document.getElementById('color-swatches');
  if (!colorSection || !swatchRow) return;

  const variantIds = Array.isArray(product.colorVariants) ? product.colorVariants : [];
  const variants = variantIds
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean);

  if (variants.length < 2) {
    colorSection.hidden = true;
    return;
  }

  colorSection.hidden = false;
  swatchRow.replaceChildren();

  variants.forEach(variant => {
    const link = document.createElement('a');
    link.className = 'color-swatch' + (variant.id === product.id ? ' selected' : '');
    link.href = `product-detail.html?id=${encodeURIComponent(variant.id)}`;
    link.setAttribute('aria-label', variant.colorway || variant.name);
    link.title = variant.colorway || variant.name;

    const dot = document.createElement('span');
    dot.className = 'color-swatch__dot';
    dot.style.backgroundColor = variant.swatch || '#ccc';
    link.appendChild(dot);

    swatchRow.appendChild(link);
  });
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

  if (product.notForSale) {
    btn.textContent = 'Inquiry';
    const subject = encodeURIComponent('Inquiry: ' + product.name);
    btn.addEventListener('click', () => {
      window.location.href = `mailto:contact@lorimer.com?subject=${subject}`;
    });
    return;
  }

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
      unitPrice: { amountMinor: Math.round(product.price * 100), currencyCode: 'EUR' },
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
