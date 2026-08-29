/* shop.js — declarative editorial catalog */

const SHOP_ROWS = [
  { type: 'products', products: ['phyllite-jacket', 'lorimer-selvedge-denim'] },
  { type: 'divider', images: ['./assets/photos/shop/still-01.jpg', './assets/photos/shop/still-02.jpg'] },
  { type: 'products', products: ['deconstructed-bomber', 'zip-up-utility-vest', 'westworld-button-up'] },
  { type: 'products', products: ['layered-denim-shorts', 'layered-denim-jeans', 'westworld-straight-jeans'] },
  { type: 'products', products: ['reconstructed-button-up-1', 'reconstructed-button-up-2', 'reinforced-pinstripe-trousers'] },
  { type: 'products', products: ['upcycled-two-piece', 'trigall-dress', 'overlapped-fray-skirt'] },
  { type: 'divider', images: ['./assets/photos/shop/still-03.jpg', './assets/photos/shop/still-04.jpg'] },
  { type: 'look', products: ['dual-texture-knit-vest', 'adjustable-button-trousers'], look: 1, href: 'ss24.html#look-1', image: './assets/ss24/Look%201/37AC10C7-072C-4FFC-B401-D905B2D72774.JPG' },
  { type: 'look', products: ['university-striped-sweatshirt', 'mens-straight-trousers'], look: 2, href: 'ss24.html#look-2', image: './assets/ss24/Look%202/1A7930C9-3066-4EFC-AD1A-6E448A42D2E2.JPG' },
  { type: 'products', products: ['3d-panel-bomber', 'denim-leather-trousers', 'lorimer-selvedge-denim-black'] },
  { type: 'look', products: ['asymmetrical-white-top', 'white-layered-skirt'], look: 4, href: 'ss24.html#look-4', image: './assets/ss24/Look%204/USETHIS.JPG' },
  { type: 'look', products: ['zip-up-top', 'womens-wide-trousers'], look: 5, href: 'ss24.html#look-5', image: './assets/ss24/Look%205/52E2F432-A737-47D7-B6C2-FFB46E494D6D.JPG' },
  { type: 'look', products: ['ss24-dress'], look: 6, href: 'ss24.html#look-6', image: './assets/ss24/Look%206/2AFEAA6F-061C-44D0-BC05-42F5C8ADED17.JPG' },
];

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    injectCartDrawer();
    renderShop();
    bindFilters();
    applyFilter('All');
    focusHashProduct();
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
    element.className = `shop-row shop-row--${rowIndex === 0 ? 'two' : row.type === 'divider' ? 'two' : 'three'}`;
    element.dataset.rowType = row.type;
    element.dataset.rowIndex = String(rowIndex + 1);

    if (row.type === 'divider') {
      row.images.forEach(src => element.appendChild(createDividerImage(src)));
    } else {
      row.products.forEach((id, productIndex) => {
        const product = productById(id);
        element.appendChild(product ? createProductCard(product, rowIndex === 0 && productIndex === 0) : createProductPlaceholder(id));
      });
      if (row.type === 'look') element.appendChild(createLookCard(row));
    }
    grid.appendChild(element);
  });
}

function createProductCard(product, eager) {
  const link = document.createElement('a');
  link.className = 'product-card';
  link.id = product.id;
  link.href = `product-detail.html?id=${encodeURIComponent(product.id)}`;
  link.dataset.category = product.category;
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
  image.className = 'shop-divider__image';
  image.src = src;
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => image.replaceWith(createImagePlaceholder('Editorial image unavailable')));
  return image;
}

function createLookCard(row) {
  const link = document.createElement('a');
  link.className = 'shop-look-card';
  link.href = row.href;
  link.setAttribute('aria-label', `View SS24 Look ${row.look}`);
  const image = document.createElement('img');
  image.className = 'shop-look-card__image';
  image.src = row.image;
  image.alt = `Complete SS24 Look ${row.look}`;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => image.replaceWith(createImagePlaceholder(`SS24 Look ${row.look}`)));
  const text = document.createElement('span');
  text.className = 'shop-look-card__link';
  text.textContent = 'View Look';
  link.append(image, text);
  return link;
}

function bindFilters() {
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => applyFilter(button.dataset.filter));
  });
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
      const isLook = row.dataset.rowType === 'look';
      row.hidden = !isLook;
      if (isLook) {
        row.querySelectorAll('.product-card').forEach(card => {
          card.hidden = false;
          if (card.dataset.productId) visibleCount += 1;
        });
        const lookCard = row.querySelector('.shop-look-card');
        if (lookCard) lookCard.hidden = false;
      }
      return;
    }

    let visibleProducts = 0;
    row.querySelectorAll('.product-card').forEach(card => {
      card.hidden = filter !== 'All' && card.dataset.category !== filter;
      if (!card.hidden && card.dataset.productId) visibleProducts += 1;
    });
    const lookCard = row.querySelector('.shop-look-card');
    if (lookCard) lookCard.hidden = filter !== 'All';
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
