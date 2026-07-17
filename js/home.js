/* home.js — hero sticky scroll effect */

document.addEventListener('DOMContentLoaded', () => {
  injectCartDrawer();
  initHeroScroll();
});

function initHeroScroll() {
  const hero = document.querySelector('.hero');
  const leftCol = document.querySelector('.hero__col--left');
  const rightCol = document.querySelector('.hero__col--right');
  const leftImages = document.querySelector('.hero__col--left .hero__col-images');
  const rightImages = document.querySelector('.hero__col--right .hero__col-images');
  const reveal = document.querySelector('.hero__reveal');
  const videos = document.querySelectorAll('.hero__col-video');
  if (!hero || !leftCol || !rightCol || !leftImages || !rightImages) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 768px)').matches;

  const leftCount = leftImages.children.length;
  const rightCount = rightImages.children.length;
  let ticking = false;

  videos.forEach(video => {
    video.muted = true;
  });

  if (reduceMotion) {
    const viewportHeight = window.innerHeight - 43;
    leftCol.style.transform = 'translateX(-100%)';
    rightCol.style.transform = 'translateX(100%)';
    leftImages.style.transform = `translateY(-${(leftCount - 1) * viewportHeight}px)`;
    rightImages.style.transform = `translateY(-${(rightCount - 1) * viewportHeight}px)`;
    reveal?.classList.add('is-revealed');
    return;
  }

  if (mobile) {
    leftCol.style.transform = '';
    rightCol.style.transform = '';
    leftImages.style.transform = '';
    rightImages.style.transform = '';
    reveal?.classList.remove('is-revealed');
    window.setTimeout(() => {
      reveal?.classList.add('is-revealed');
    }, 450);
    return;
  }

  function onScroll() {
    const rect = hero.getBoundingClientRect();
    const scrolled = -rect.top;
    const total = rect.height - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrolled / total));
    const cycleProgress = Math.min(1, progress / 0.6);
    const splitProgress = Math.max(0, (progress - 0.6) / 0.4);

    const viewportHeight = window.innerHeight - 43;
    const leftOffset = cycleProgress * (leftCount - 1) * viewportHeight;
    const rightOffset = cycleProgress * (rightCount - 1) * viewportHeight;

    leftImages.style.transform = `translateY(-${leftOffset}px)`;
    rightImages.style.transform = `translateY(-${rightOffset}px)`;
    leftCol.style.transform = `translateX(-${splitProgress * 100}%)`;
    rightCol.style.transform = `translateX(${splitProgress * 100}%)`;
    reveal?.classList.add('is-revealed');
  }

  function requestScrollUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  onScroll();
}
