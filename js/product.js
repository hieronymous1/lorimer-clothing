/* product.js — image gallery, size selector, add to cart */

document.addEventListener('DOMContentLoaded', () => {
  injectCartDrawer();
  loadProduct();
});

function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  const initialFinish = selectedFinishFromUrl(product, window.location.search);
  const finish = (product.finishes || []).find(f => f.id === initialFinish);

  document.title = product.name + ' — LORIMER®';

  const soldOut = product.notForSale || !product.available;
  const priceText = soldOut ? 'Sold Out' : '€' + (finish ? finish.price : product.price);
  document.getElementById('product-name').textContent = product.name;
  setPrice(priceText);
  const mobileName = document.getElementById('mobile-product-name');
  const mobilePrice = document.getElementById('mobile-product-price');
  if (mobileName) mobileName.textContent = product.name;
  if (mobilePrice) mobilePrice.textContent = priceText;
  renderLongDescription(product);

  document.getElementById('product-material').textContent = product.material ? 'Material: ' + product.material : '';

  // Archive pieces have no purchasable size; they show a 1 of 1 box and construction details.
  const sizeSection = document.getElementById('size-section');
  if (sizeSection) sizeSection.hidden = !!product.notForSale;
  if (product.notForSale) {
    const oneOfOne = document.getElementById('one-of-one-section');
    if (oneOfOne) oneOfOne.hidden = false;
    document.querySelector('.product-info')?.classList.add('product-info--archive');
    const constructed = document.getElementById('product-constructed');
    if (constructed && product.constructedOn) {
      constructed.textContent = `Date of Construction: ${product.constructedOn}.`;
      constructed.hidden = false;
    }
    const madeIn = document.getElementById('product-made-in');
    if (madeIn && product.madeIn) {
      madeIn.textContent = `Made in ${product.madeIn}`;
      madeIn.hidden = false;
    }
  }

  renderGallery(product);
  renderColorVariants(product);
  renderFinishes(product, initialFinish);
  if (!product.notForSale) renderSizes(product);
  initAddToCart(product);
  initSizeGuide(product);
}

function selectedFinishFromUrl(product, search) {
  const finishes = Array.isArray(product?.finishes) ? product.finishes : [];
  if (finishes.length === 0) return '';
  const requested = new URLSearchParams(search).get('finish');
  return finishes.some(f => f.id === requested) ? requested : finishes[0].id;
}

function createOptionGroup({ container, options, selected, onChange }) {
  let value = selected || '';
  container.replaceChildren();
  container.setAttribute('role', 'radiogroup');
  const buttons = options.map(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-btn';
    button.setAttribute('role', 'radio');
    button.dataset.value = option.value;
    button.textContent = option.label;
    button.disabled = !!option.disabled;
    if (option.disabled) button.setAttribute('aria-label', `${option.label}, sold out`);
    button.addEventListener('click', () => select(option.value, true));
    container.appendChild(button);
    return button;
  });

  function sync() {
    const enabled = buttons.filter(b => !b.disabled);
    const focusTarget = buttons.find(b => b.dataset.value === value && !b.disabled) || enabled[0];
    buttons.forEach(button => {
      const checked = button.dataset.value === value;
      button.setAttribute('aria-checked', String(checked));
      button.tabIndex = button === focusTarget ? 0 : -1;
    });
  }

  function select(next, notify) {
    value = next;
    sync();
    if (notify) onChange?.(value);
  }

  container.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
    const enabled = buttons.filter(b => !b.disabled);
    if (enabled.length === 0) return;
    event.preventDefault();
    const current = Math.max(0, enabled.indexOf(document.activeElement));
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const next = enabled[(current + step + enabled.length) % enabled.length];
    next.focus();
    select(next.dataset.value, true);
  });

  sync();
  return { getValue: () => value };
}

let finishGroup = null;
let sizeGroup = null;

function renderFinishes(product, initialFinish) {
  const section = document.getElementById('finish-section');
  const grid = document.getElementById('finish-grid');
  if (!section || !grid) return;
  const finishes = Array.isArray(product.finishes) ? product.finishes : [];
  section.hidden = finishes.length === 0 || !!product.notForSale;
  if (section.hidden) return;
  finishGroup = createOptionGroup({
    container: grid,
    options: finishes.map(f => ({ value: f.id, label: f.label })),
    selected: initialFinish,
    onChange: finishId => {
      const finish = finishes.find(f => f.id === finishId);
      const text = `€${finish.price}`;
      setPrice(text);
      const mobilePrice = document.getElementById('mobile-product-price');
      if (mobilePrice) mobilePrice.textContent = text;
    },
  });
}

function setPrice(text) {
  const el = document.getElementById('product-price');
  if (!el) return;
  const current = el.querySelector('span:not(.is-leaving)');
  if (current && current.textContent === text) return;
  const next = document.createElement('span');
  next.textContent = text;
  if (!current) {
    el.replaceChildren(next);
    return;
  }
  next.classList.add('is-entering');
  current.classList.add('is-leaving');
  el.append(next);
  requestAnimationFrame(() => next.classList.remove('is-entering'));
  current.addEventListener('transitionend', () => current.remove(), { once: true });
  setTimeout(() => current.remove(), 260);
}

function renderLongDescription(product) {
  const container = document.getElementById('product-desc');
  if (!container) return;
  container.replaceChildren();

  const paragraphs = (product.description || '').split(/\n{2,}/).map(t => t.trim()).filter(Boolean);
  paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text;
    container.appendChild(p);
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
  });

  image.addEventListener('pointerleave', () => {
    magnifier.hidden = true;
  });
}

function renderSizes(product) {
  const grid = document.getElementById('size-grid');
  if (!grid) return;
  sizeGroup = createOptionGroup({
    container: grid,
    options: product.sizes.map(size => ({
      value: size,
      label: size,
      disabled: !product.available || (product.stockBySize && !(product.stockBySize?.[size] > 0)),
    })),
    selected: '',
    onChange: () => document.getElementById('size-error')?.classList.remove('visible'),
  });
}

function initAddToCart(product) {
  const btn = document.getElementById('add-to-cart');
  if (!btn) return;

  if (product.notForSale || !product.available) {
    const label = btn.querySelector('.btn-add-cart__label') || btn;
    label.textContent = 'Sold Out';
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    return;
  }

  btn.addEventListener('click', async () => {
    const size = sizeGroup?.getValue();
    if (!size) {
      document.getElementById('size-error')?.classList.add('visible');
      return;
    }
    const finishId = finishGroup ? finishGroup.getValue() : '';
    const finish = (product.finishes || []).find(f => f.id === finishId);
    btn.disabled = true;
    const result = await cartService.addLine({
      productId: product.id,
      merchandiseId: '',
      name: product.name,
      size,
      finish: finishId,
      image: product.images[0] || '',
      unitPrice: { amountMinor: Math.round((finish ? finish.price : product.price) * 100), currencyCode: 'EUR' },
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
