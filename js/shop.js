/* shop.js — declarative editorial catalog */

const SHOP_ROWS = [
  { type: 'products', products: ['lorimer-selvedge-denim', 'phyllite-jacket'] },
  { type: 'divider', images: ['./assets/photos/shop/still-01.jpg', './assets/photos/shop/still-02.jpg'] },
  { type: 'products', products: ['deconstructed-bomber', 'layered-denim-jeans', 'zip-up-utility-vest'] },
  { type: 'products', products: ['layered-denim-shorts', 'westworld-button-up', 'westworld-straight-jeans'] },
  { type: 'products', products: ['reconstructed-button-up-1', 'reconstructed-button-up-2', 'reinforced-pinstripe-trousers'] },
  { type: 'products', products: ['upcycled-two-piece', 'trigall-dress', 'overlapped-fray-skirt'] },
  { type: 'divider', images: ['./assets/photos/shop/still-03.jpg', './assets/photos/shop/still-04.jpg'] },
  { type: 'products', products: ['dual-texture-knit-vest', 'adjustable-button-trousers'], ss24: true },
  { type: 'products', products: ['university-striped-sweatshirt', 'mens-straight-trousers', 'distressed-lorimer-cap'], ss24: true },
  { type: 'products', products: ['3d-panel-bomber', 'denim-leather-trousers'] },
  { type: 'products', products: ['asymmetrical-white-top', 'white-layered-skirt', 'ss24-dress'], ss24: true },
  { type: 'products', products: ['zip-up-top', 'womens-wide-trousers'], ss24: true },
];

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    injectCartDrawer();
    renderShop();
    bindFilters();
    applyFilter('All');
    focusHashProduct();
    observeNewReveals();
  });
}

function productById(id) {
  return Array.isArray(PRODUCTS) ? PRODUCTS.find(product => product.id === id) : null;
}

function renderShop() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  grid.replaceChildren();

  SHOP_ROWS.forEach((row, rowIndex) => {
    const element = document.createElement('div');
    const columns = rowIndex === 0 ? 'two' : row.type === 'divider' ? 'two' : 'three';
    element.className = `shop-row shop-row--${columns}`;
    element.dataset.rowType = row.type;
    element.dataset.rowIndex = String(rowIndex + 1);
    if (row.ss24) element.dataset.ss24 = 'true';

    if (row.type === 'divider') {
      row.images.forEach(src => element.appendChild(createDividerImage(src)));
    } else {
      row.products.forEach((id, productIndex) => {
        const product = productById(id);
        element.appendChild(product ? createProductCard(product, rowIndex === 0 && productIndex === 0, productIndex) : createProductPlaceholder(id));
      });
    }
    grid.appendChild(element);
  });
}

function createProductCard(product, eager, index = 0) {
  const link = document.createElement('a');
  link.className = `product-card reveal reveal-delay-${(index % 3) + 1}`;
  link.id = product.id;
  link.href = `product-detail.html?id=${encodeURIComponent(product.id)}`;
  link.dataset.category = product.category;
  if (product.subcategory) link.dataset.subcategory = product.subcategory;
  link.dataset.productId = product.id;

  const media = document.createElement('div');
  media.className = 'product-card__media';
  media.appendChild(createProductImage(product.images?.[0], product.name, eager));
  const secondarySrc = product.images?.[1];
  if (secondarySrc) {
    const secondary = createProductImage(secondarySrc, '', false);
    secondary.classList.add('product-card__img--secondary');
    secondary.setAttribute('aria-hidden', 'true');
    media.appendChild(secondary);
  }
  link.appendChild(media);

  const details = document.createElement('div');
  details.className = 'product-card__info';
  const name = document.createElement('p');
  name.className = 'product-card__name';
  name.textContent = product.name;
  const price = document.createElement('p');
  const soldOut = !product.available && !product.notForSale;
  price.className = `product-card__price${soldOut ? ' product-card__price--sold-out' : ''}`;
  price.textContent = product.notForSale ? 'Inquiry' : product.available ? formatPrice(product.price) : 'Sold Out';
  details.append(name, price);
  link.appendChild(details);
  return link;
}

function createProductImage(src, alt, eager) {
  if (!src) return createImagePlaceholder(alt);
  const image = document.createElement('img');
  image.className = 'product-card__img';
  image.src = src;
  image.alt = alt;
  image.loading = eager ? 'eager' : 'lazy';
  image.decoding = 'async';
  if (eager) image.fetchPriority = 'high';
  image.addEventListener('error', () => image.replaceWith(createImagePlaceholder(alt)));
  return image;
}

function createImagePlaceholder(label) {
  const placeholder = document.createElement('span');
  placeholder.className = 'product-card__img product-card__placeholder';
  placeholder.textContent = label || 'Image unavailable';
  return placeholder;
}

function createProductPlaceholder(id) {
  const placeholder = createImagePlaceholder(`Product unavailable: ${id}`);
  placeholder.classList.add('product-card');
  return placeholder;
}

function createDividerImage(src) {
  const image = document.createElement('img');
  image.className = 'shop-divider__image reveal';
  image.src = src;
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => image.replaceWith(createImagePlaceholder('Editorial image unavailable')));
  return image;
}

function bindFilters() {
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      applyFilter(button.dataset.filter);
      const panel = button.nextElementSibling;
      const isSubButton = button.classList.contains('filter-btn--sub');
      if (panel && panel.classList.contains('shop-subfilters')) {
        toggleSubfilterPanel(button, panel);
      } else if (!isSubButton) {
        closeAllSubfilterPanels();
      }
    });
  });
}

function toggleSubfilterPanel(button, panel) {
  const isOpen = panel.classList.contains('is-open');
  closeAllSubfilterPanels();
  if (!isOpen) {
    panel.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
  }
}

function closeAllSubfilterPanels() {
  document.querySelectorAll('.shop-subfilters.is-open').forEach(panel => panel.classList.remove('is-open'));
  document.querySelectorAll('.filter-btn[aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
}

function applyFilter(filter) {
  document.querySelectorAll('.filter-btn').forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  const ss24Only = filter === 'S/S 24';
  let visibleCount = 0;
  document.querySelectorAll('.shop-row').forEach(row => {
    if (row.dataset.rowType === 'divider') {
      row.hidden = filter !== 'All';
      return;
    }

    // S/S 24 filter surfaces the complete-look rows in full.
    if (ss24Only) {
      const isSS24 = row.dataset.ss24 === 'true';
      row.hidden = !isSS24;
      if (isSS24) {
        row.querySelectorAll('.product-card').forEach(card => {
          card.hidden = false;
          if (card.dataset.productId) visibleCount += 1;
        });
      }
      return;
    }

    let visibleProducts = 0;
    row.querySelectorAll('.product-card').forEach(card => {
      card.hidden = filter !== 'All' && card.dataset.category !== filter && card.dataset.subcategory !== filter;
      if (!card.hidden && card.dataset.productId) visibleProducts += 1;
    });
    row.hidden = visibleProducts === 0;
    visibleCount += visibleProducts;
  });

  const status = document.getElementById('shop-results-status');
  if (status) status.textContent = visibleCount ? `${visibleCount} products shown` : 'No products found';
}

function focusHashProduct() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const product = document.getElementById(id);
  if (product) requestAnimationFrame(() => product.scrollIntoView({ block: 'center' }));
}

function formatPrice(price) {
  return `€${Number.isFinite(price) ? price : 0}`;
}
