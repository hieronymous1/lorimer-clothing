(function () {
  var scriptsAfter = window.__LORIMER_SCRIPTS_AFTER__ || [];

  function loadNext(index) {
    if (index >= scriptsAfter.length) {
      // By the time these deferred scripts run, the document's real
      // DOMContentLoaded has already fired and won't fire again — dispatch
      // a synthetic one so their own listeners (registered as each script
      // just executed) still run.
      document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
      return;
    }
    var script = document.createElement('script');
    script.src = scriptsAfter[index];
    script.onload = function () { loadNext(index + 1); };
    script.onerror = function () { loadNext(index + 1); };
    document.head.appendChild(script);
  }

  function applyOverrides(overrides) {
    if (!Array.isArray(overrides) || typeof PRODUCTS === 'undefined') return;
    overrides.forEach(function (override) {
      var product = PRODUCTS.find(function (entry) { return entry.id === override.id; });
      if (!product) return;
      if (typeof override.name === 'string') product.name = override.name;
      if (typeof override.description === 'string') product.description = override.description;
      if (typeof override.price === 'number') product.price = override.price;
      if (override.finish_prices && typeof override.finish_prices === 'object' && Array.isArray(product.finishes)) {
        product.finishes.forEach(function (finish) {
          var price = override.finish_prices[finish.id];
          if (typeof price === 'number' && price > 0) finish.price = price;
        });
        if (product.finishes[0]) product.price = product.finishes[0].price;
      }
      if (Array.isArray(override.images) && override.images.length) product.images = override.images;
      if (override.stock_by_size && typeof override.stock_by_size === 'object') {
        product.stockBySize = override.stock_by_size;
        product.available = Object.values(override.stock_by_size).some(function (stock) { return stock > 0; });
      }
    });
  }

  fetch('/api/products', { cache: 'no-store' })
    .then(function (res) { return res.ok ? res.json() : []; })
    .then(applyOverrides)
    .catch(function () {})
    .finally(function () { loadNext(0); });
})();
