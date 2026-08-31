/* cursor.js — sitewide custom pointer, magnetic on primary CTAs.
   Skipped entirely on touch/coarse-pointer devices and under
   prefers-reduced-motion, where the system cursor is left alone. */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduceMotion || !finePointer) return;

  const MAGNET_SELECTOR = '.btn-add-cart, .btn-checkout, .cart-btn, .cart-empty__return';
  const MAGNET_RADIUS = 90;
  const MAGNET_STRENGTH = 16;
  const LERP = 0.22;

  document.documentElement.classList.add('has-custom-cursor');

  const dot = document.createElement('div');
  dot.className = 'custom-cursor';
  document.body.appendChild(dot);

  const raw = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const pos = { x: raw.x, y: raw.y };
  let primed = false;

  function onMove(event) {
    raw.x = event.clientX;
    raw.y = event.clientY;
    if (!primed) {
      pos.x = raw.x;
      pos.y = raw.y;
      primed = true;
      dot.style.opacity = '1';
    }
    updateMagnets(event.clientX, event.clientY);
  }

  function updateMagnets(pointerX, pointerY) {
    let nearAny = false;
    document.querySelectorAll(MAGNET_SELECTOR).forEach(el => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = pointerX - cx;
      const dy = pointerY - cy;
      const distance = Math.hypot(dx, dy);
      if (distance < MAGNET_RADIUS) {
        nearAny = true;
        const pull = (1 - distance / MAGNET_RADIUS) * MAGNET_STRENGTH;
        const angle = Math.atan2(dy, dx);
        el.classList.add('is-magnetic');
        el.style.transform = `translate(${Math.cos(angle) * pull}px, ${Math.sin(angle) * pull}px)`;
      } else if (el.classList.contains('is-magnetic')) {
        el.style.transform = '';
      }
    });
    dot.classList.toggle('is-near', nearAny);
  }

  function tick() {
    pos.x += (raw.x - pos.x) * LERP;
    pos.y += (raw.y - pos.y) * LERP;
    dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerdown', () => dot.classList.add('is-down'), { passive: true });
  document.addEventListener('pointerup', () => dot.classList.remove('is-down'), { passive: true });
  document.addEventListener('pointerleave', () => { dot.style.opacity = '0'; primed = false; });

  requestAnimationFrame(tick);
})();
