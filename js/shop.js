/* shop.js — declarative editorial catalog */

const SHOP_ROWS = [
  { type: 'products', products: ['lorimer-selvedge-denim', 'phyllite-jacket'] },
  { type: 'divider', images: ['./assets/photos/shop/still-01.jpg', './assets/photos/shop/still-02.jpg'] },
  { type: 'products', products: ['deconstructed-bomber', 'zip-up-utility-vest', 'westworld-button-up'] },
  { type: 'products', products: ['layered-denim-shorts', 'layered-denim-jeans', 'westworld-straight-jeans'] },
  { type: 'products', products: ['reconstructed-button-up-1', 'reconstructed-button-up-2', 'reinforced-pinstripe-trousers'] },
  { type: 'products', products: ['upcycled-two-piece', 'trigall-dress', 'overlapped-fray-skirt'] },
  { type: 'divider', images: ['./assets/photos/shop/still-03.jpg', './assets/photos/shop/still-04.jpg'] },
  { type: 'products', products: ['dual-texture-knit-vest', 'adjustable-button-trousers'], ss24: true },
  { type: 'products', products: ['university-striped-sweatshirt', 'mens-straight-trousers', 'distressed-lorimer-cap'], ss24: true },
  { type: 'products', products: ['3d-panel-bomber', 'denim-leather-trousers'] },
  { type: 'products', products: ['asymmetrical-white-top', 'white-layered-skirt'], ss24: true },
  { type: 'products', products: ['zip-up-top', 'womens-wide-trousers', 'ss24-dress'], ss24: true },
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

const FEATURED_BY_FILTER = {
  Bottoms: [{ id: 'lorimer-selvedge-denim' }, { id: 'lorimer-selvedge-denim-black' }],
  Denim: [{ id: 'lorimer-selvedge-denim' }, { id: 'lorimer-selvedge-denim-black' }],
  Tops: [{ id: 'phyllite-jacket', finishId: 'wax' }, { id: 'phyllite-jacket', finishId: 'fabric-paint' }],
  Jackets: [{ id: 'phyllite-jacket', finishId: 'wax' }, { id: 'phyllite-jacket', finishId: 'fabric-paint' }],
};

function catalogueOrder() {
  return SHOP_ROWS.filter(row => row.type === 'products').flatMap(row => row.products);
}

function buildFilterLayout(products, filter) {
  const byId = new Map(products.map(product => [product.id, product]));
  const matches = id => {
    const product = byId.get(id);
    return product && (product.category === filter || product.subcategory === filter);
  };
  const featured = (FEATURED_BY_FILTER[filter] || [])
    .filter(entry => matches(entry.id))
    .map(entry => ({ product: byId.get(entry.id), finishId: entry.finishId }));
  const featuredIds = new Set(featured.map(entry => entry.product.id));
  const rest = catalogueOrder().filter(id => matches(id) && !featuredIds.has(id)).map(id => byId.get(id));
  return { featured, rest };
}

function toTitleCase(label) {
  return label.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
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

  const filtered = document.createElement('div');
  filtered.className = 'shop-filtered';
  filtered.id = 'shop-filtered';
  filtered.hidden = true;
  grid.appendChild(filtered);
}

function createProductCard(product, eager, index = 0, finishId = '') {
  const finish = finishId ? (product.finishes || []).find(f => f.id === finishId) : null;
  const link = document.createElement('a');
  link.className = `product-card reveal reveal-delay-${(index % 3) + 1}`;
  if (!finish) link.id = product.id;
  link.href = `product-detail.html?id=${encodeURIComponent(product.id)}${finish ? `&finish=${encodeURIComponent(finish.id)}` : ''}`;
  link.dataset.category = product.category;
  if (product.subcategory) link.dataset.subcategory = product.subcategory;
  link.dataset.productId = product.id;

  const media = document.createElement('div');
  media.className = 'product-card__media';
  media.appendChild(createProductImage(finish?.image || product.images?.[0], product.name, eager));
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
  price.textContent = product.notForSale ? 'Inquiry' : product.available ? formatPrice(finish ? finish.price : product.price) : 'Sold Out';
  details.append(name);
  if (finish) {
    const finishLine = document.createElement('p');
    finishLine.className = 'product-card__finish';
    finishLine.textContent = toTitleCase(finish.label);
    details.append(finishLine);
  }
  details.append(price);
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

function renderFiltered(layout) {
  const container = document.getElementById('shop-filtered');
  container.replaceChildren();
  if (layout.featured.length) {
    const row = document.createElement('div');
    row.className = 'shop-row shop-row--two shop-filtered__featured';
    layout.featured.forEach((entry, index) => row.appendChild(createProductCard(entry.product, index === 0, index, entry.finishId)));
    container.appendChild(row);
  }
  if (layout.rest.length) {
    const track = document.createElement('div');
    track.className = 'shop-filtered__track';
    layout.rest.forEach((product, index) => track.appendChild(createProductCard(product, false, index)));
    container.appendChild(track);
  }
  container.hidden = false;
  animateFilteredCards(container);
  return layout.featured.length + layout.rest.length;
}

function animateFilteredCards(container) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  container.querySelectorAll('.product-card').forEach((card, index) => {
    card.classList.remove('reveal');
    if (typeof card.animate !== 'function') return;
    const keyframes = reduce
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }];
    card.animate(keyframes, {
      duration: 220,
      delay: Math.min(index, 5) * 40,
      easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
      fill: 'backwards',
    });
  });
}

function applyFilter(filter) {
  document.querySelectorAll('.filter-btn').forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  const filtered = document.getElementById('shop-filtered');
  const rows = document.querySelectorAll('#shop-grid > .shop-row');
  let visibleCount = 0;

  if (filter !== 'All' && filter !== 'S/S 24') {
    rows.forEach(row => { row.hidden = true; });
    visibleCount = renderFiltered(buildFilterLayout(PRODUCTS, filter));
  } else {
    if (filtered) {
      filtered.hidden = true;
      filtered.replaceChildren();
    }
    const ss24Only = filter === 'S/S 24';
    rows.forEach(row => {
      if (row.dataset.rowType === 'divider') {
        row.hidden = filter !== 'All';
        return;
      }

      // S/S 24 filter surfaces the complete-look rows in full.
      if (ss24Only) {
        const isSS24 = row.dataset.ss24 === 'true';
        row.hidden = !isSS24;
        row.querySelectorAll('.product-card').forEach(card => { card.hidden = false; });
        if (isSS24) visibleCount += row.querySelectorAll('.product-card[data-product-id]').length;
        return;
      }

      row.hidden = false;
      row.querySelectorAll('.product-card').forEach(card => { card.hidden = false; });
      visibleCount += row.querySelectorAll('.product-card[data-product-id]').length;
    });
  }

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
