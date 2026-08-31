(function () {
  fetch('/api/content', { cache: 'no-store' })
    .then(function (res) { return res.ok ? res.json() : {}; })
    .then(function (map) {
      document.querySelectorAll('[data-cms-key]').forEach(function (el) {
        var key = el.getAttribute('data-cms-key');
        if (Object.prototype.hasOwnProperty.call(map, key)) {
          el.innerHTML = map[key];
        }
      });
    })
    .catch(function () {});
})();
