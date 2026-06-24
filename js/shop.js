/* shop.js — category filter + product grid */

document.addEventListener('DOMContentLoaded', () => {
  injectCartDrawer();
  renderShopGrid();
  initFilters();
});

function renderShopGrid() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;

  const delayClasses = ['', 'reveal-delay-1', 'reveal-delay-2'];

  grid.innerHTML = PRODUCTS.map((p, i) => {
    const img = p.images[0]
      ? `<div class="card-media"><img class="product-card__img" src="${p.images[0]}" alt="${p.name}" loading="lazy" onerror="this.parentElement.outerHTML='<div class=\'product-card__img no-img\'><span>${p.name}</span></div>'"></div>`
      : `<div class="product-card__img no-img"><span>${p.name}</span></div>`;

    return `
      <a class="product-card reveal ${delayClasses[i % 3]}" href="product-detail.html?id=${p.id}" data-category="${p.category}">
        ${img}
        <div class="product-card__info">
          <p class="product-card__name">${p.name}</p>
          <p class="product-card__price">$${p.price}</p>
        </div>
      </a>
    `;
  }).join('');

  if (typeof observeNewReveals === 'function') observeNewReveals();
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      document.querySelectorAll('.product-card').forEach(card => {
        if (filter === 'All' || card.dataset.category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}
