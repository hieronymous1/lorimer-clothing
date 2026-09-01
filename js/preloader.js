/* preloader.js — Cut Table entry sequence */

(() => {
  const preloader = document.querySelector('.site-preloader');
  const progress = preloader?.querySelector('[data-preloader-progress]');

  if (!preloader || !progress) {
    document.body.classList.remove('is-preloading');
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startedAt = performance.now();
  const minimumDuration = reduceMotion ? 0 : 900;
  const maximumDuration = 4500;
  let animatedProgress = 0;
  let displayedProgress = 0;
  let pageLoaded = document.readyState === 'complete';
  let dismissed = false;

  function blockTab(event) {
    const failsafeElapsed = performance.now() - startedAt >= 5500;
    if (event.key === 'Tab' && preloader.isConnected && !failsafeElapsed) event.preventDefault();
  }

  document.addEventListener('keydown', blockTab);

  function paintProgress(value) {
    displayedProgress = Math.min(100, Math.round(value));
    progress.textContent = String(displayedProgress).padStart(2, '0');
  }

  function animateProgress() {
    if (dismissed) return;
    const ceiling = pageLoaded ? 100 : 92;
    const distance = ceiling - animatedProgress;
    animatedProgress = Math.min(ceiling, animatedProgress + Math.max(.35, distance * .075));
    paintProgress(animatedProgress);

    if (pageLoaded && displayedProgress >= 99) {
      paintProgress(100);
      const elapsed = performance.now() - startedAt;
      window.setTimeout(dismiss, Math.max(0, minimumDuration - elapsed));
      return;
    }

    requestAnimationFrame(animateProgress);
  }

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    paintProgress(100);
    document.body.classList.remove('is-preloading');

    if (reduceMotion) {
      document.removeEventListener('keydown', blockTab);
      preloader.remove();
      return;
    }

    preloader.classList.add('is-leaving');
    window.setTimeout(() => {
      document.removeEventListener('keydown', blockTab);
      preloader.remove();
    }, 900);
  }

  window.addEventListener('load', () => { pageLoaded = true; }, { once: true });
  requestAnimationFrame(animateProgress);
  window.setTimeout(dismiss, maximumDuration);
})();
