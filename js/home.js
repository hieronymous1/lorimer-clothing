/* home.js — seamless video aperture homepage hero */

document.addEventListener('DOMContentLoaded', () => {
  injectCartDrawer();
  initHeroScroll();
});

function initHeroScroll() {
  const hero = document.querySelector('.hero');
  const video = document.querySelector('.hero__video');
  const scrollCue = document.querySelector('.hero__scroll-cue');

  if (!hero || !video) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;

  video.muted = true;

  function playVideo() {
    video.play().catch(() => {});
  }
  video.addEventListener('loadeddata', () => hero.classList.add('is-ready'), { once: true });

  if (reduceMotion) {
    hero.classList.add('is-reduced-motion', 'is-ready');
    scrollCue?.setAttribute('hidden', '');
    video.pause();
    return;
  }

  function updateHero() {
    const rect = hero.getBoundingClientRect();
    const scrollDistance = Math.max(1, rect.height - window.innerHeight);
    const rawProgress = Math.max(0, Math.min(1, -rect.top / scrollDistance));
    const apertureProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    const apertureInset = (1 - apertureProgress) * 50;

    hero.style.setProperty('--aperture', `${apertureInset}%`);
    video.style.transform = `scale(${1 + apertureProgress * 0.025})`;
    if (scrollCue) scrollCue.style.opacity = String(Math.max(0, 1 - rawProgress * 5));
  }

  function requestScrollUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateHero();
      ticking = false;
    });
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });

  updateHero();
  if (video.readyState >= 2) hero.classList.add('is-ready');
  playVideo();
}
