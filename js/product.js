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

  const priceText = product.notForSale ? 'Sold Out' : product.available ? '€' + product.price : 'Sold Out';
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-price').textContent = priceText;
  const mobileName = document.getElementById('mobile-product-name');
  const mobilePrice = document.getElementById('mobile-product-price');
  if (mobileName) mobileName.textContent = product.name;
  if (mobilePrice) mobilePrice.textContent = priceText;
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
  renderFinishes(product);
  renderStyleWith(product);
  if (!product.notForSale) renderSizes(product);
  initAddToCart(product);
  initSizeGuide(product);
}

function renderFinishes(product) {
  const section = document.getElementById('finish-section');
  const grid = document.getElementById('finish-grid');
  if (!section || !grid) return;

  const finishes = Array.isArray(product.finishes) ? product.finishes : [];
  if (finishes.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  grid.replaceChildren();

  finishes.forEach((finish, index) => {
    const button = document.createElement('button');
    button.className = 'finish-btn' + (index === 0 ? ' selected' : '');
    button.type = 'button';
    button.dataset.finish = finish;
    button.textContent = finish;
    button.addEventListener('click', () => {
      grid.querySelectorAll('.finish-btn').forEach(b => b.classList.remove('selected'));
      button.classList.add('selected');
    });
    grid.appendChild(button);
  });
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
    button.disabled = !product.available || (product.stockBySize && !(product.stockBySize?.[size] > 0));
    if (button.disabled) button.setAttribute('aria-label', `${size} — Sold Out`);
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
    if (!result.ok) {
      btn.disabled = false;
      const error = document.getElementById('size-error');
      if (error) {
        error.textContent = cartErrorMessage(result.error);
        error.classList.add('visible');
      }
      return;
    }
    updateCartBadge();
    confirmAddToCart(btn, () => openCartDrawer(btn));
  });
}

function confirmAddToCart(btn, onDone) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    btn.disabled = false;
    onDone();
    return;
  }
  btn.classList.add('is-added');
  window.setTimeout(() => {
    onDone();
    btn.classList.remove('is-added');
    btn.disabled = false;
  }, 550);
}

const SIZE_GUIDE_TOPS = [
  ['XS', '32–34', '17'],
  ['S', '35–37', '17.5'],
  ['M', '38–40', '18'],
  ['L', '41–43', '18.5'],
  ['XL', '44–46', '19'],
];
const SIZE_GUIDE_BOTTOMS_NUMERIC = [
  ['26', '26–27', '35–36'],
  ['27', '27–28', '36–37'],
  ['28', '28–29', '37–38'],
  ['29', '29–30', '38–39'],
  ['30', '30–31', '39–40'],
  ['32', '32–33', '41–42'],
  ['34', '34–35', '43–44'],
  ['36', '36–37', '45–46'],
];
const SIZE_GUIDE_BOTTOMS_WAIST = [
  ['30×30', '30', '30'],
  ['30×32', '30', '32'],
  ['32×30', '32', '30'],
  ['32×32', '32', '32'],
  ['32×34', '32', '34'],
  ['34×32', '34', '32'],
  ['34×34', '34', '34'],
];

function sizeGuideTable(product) {
  const isBottoms = product.category === 'Bottoms';
  if (isBottoms && product.sizes.some(size => size.includes('×'))) {
    return { headers: ['Size', 'Waist (in)', 'Inseam (in)'], rows: SIZE_GUIDE_BOTTOMS_WAIST };
  }
  if (isBottoms) {
    return { headers: ['Size', 'Waist (in)', 'Hip (in)'], rows: SIZE_GUIDE_BOTTOMS_NUMERIC };
  }
  return { headers: ['Size', 'Chest (in)', 'Sleeve (in)'], rows: SIZE_GUIDE_TOPS };
}

function initSizeGuide(product) {
  const trigger = document.getElementById('size-guide-trigger');
  if (!trigger) return;
  injectSizeGuideModal();

  const overlay = document.getElementById('size-guide-overlay');
  const modal = document.getElementById('size-guide-modal');
  const closeButtons = [document.getElementById('size-guide-close'), overlay];

  const open = () => {
    renderSizeGuideTable(product);
    overlay.classList.add('open');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => document.getElementById('size-guide-close')?.focus());
  };
  const close = () => {
    overlay.classList.remove('open');
    modal.classList.remove('open');
    document.body.style.overflow = '';
    trigger.focus();
  };

  trigger.hidden = !!product.notForSale;
  trigger.addEventListener('click', open);
  closeButtons.forEach(el => el?.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('open')) close();
  });
}

function renderSizeGuideTable(product) {
  const container = document.getElementById('size-guide-table');
  if (!container) return;
  const { headers, rows } = sizeGuideTable(product);

  container.replaceChildren();
  const table = document.createElement('table');
  table.className = 'size-guide-table';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headers.forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(text => {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

function injectSizeGuideModal() {
  if (document.getElementById('size-guide-overlay')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="size-guide-overlay" id="size-guide-overlay" aria-hidden="true"></div>
    <div class="size-guide-modal" id="size-guide-modal" role="dialog" aria-modal="true" aria-labelledby="size-guide-heading">
      <div class="size-guide-modal__header">
        <h2 id="size-guide-heading">Size Guide</h2>
        <button class="size-guide-modal__close" id="size-guide-close" type="button" aria-label="Close size guide">×</button>
      </div>
      <div class="size-guide-modal__body" id="size-guide-table"></div>
      <p class="size-guide-modal__note">Measurements are body measurements in inches. For an in-between size, we recommend sizing up.</p>
    </div>
  `);
}
