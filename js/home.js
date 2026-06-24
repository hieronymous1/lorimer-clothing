/* home.js — hero sticky scroll effect */

document.addEventListener('DOMContentLoaded', () => {
  injectCartDrawer();
  initHeroScroll();
});

function initHeroScroll() {
  const hero = document.querySelector('.hero');
  const leftImages = document.querySelector('.hero__col:first-child .hero__col-images');
  const rightImages = document.querySelector('.hero__col:last-child .hero__col-images');
  if (!hero || !leftImages || !rightImages) return;

  const leftCount = leftImages.children.length;
  const rightCount = rightImages.children.length;

  function onScroll() {
    const rect = hero.getBoundingClientRect();
    const scrolled = -rect.top;
    const total = rect.height - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrolled / total));

    const vh = window.innerHeight - 43;
    const leftOffset = progress * (leftCount - 1) * vh;
    const rightOffset = progress * (rightCount - 1) * vh;

    leftImages.style.transform = `translateY(-${leftOffset}px)`;
    rightImages.style.transform = `translateY(-${rightOffset}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
