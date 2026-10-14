/* animations.js — editorial microinteractions */

document.addEventListener('DOMContentLoaded', () => {
  initPageTransitions();
  initScrollReveals();
});

function initPageTransitions() {
  // Safari/iOS restore pages from the back-forward cache exactly as they
  // were left — mid-exit at opacity 0 — so Back showed a blank white page.
  window.addEventListener('pageshow', () => document.body.classList.remove('page-exit'));
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    // Only same-site page navigations fade out; mailto:/tel:/new-tab links
    // never unload this page, so fading them would strand it at opacity 0.
    if (
      !href ||
      href.startsWith('#') ||
      /^[a-z][a-z0-9+.-]*:/i.test(href) ||
      link.target && link.target !== '_self' ||
      link.hasAttribute('download') ||
      link.classList.contains('open-cart')
    ) return;
    e.preventDefault();
    document.body.classList.add('page-exit');
    setTimeout(() => { window.location.href = href; }, 200);
  });
}

function initScrollReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal:not([data-manual-reveal])').forEach(el => observer.observe(el));
}

/* Called by shop.js after dynamic render to observe new cards */
function observeNewReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal:not(.is-revealed):not([data-manual-reveal])').forEach(el => observer.observe(el));
}
