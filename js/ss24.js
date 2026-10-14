/* SS24 lookbook galleries — progressively enhanced, local state only. */
injectCartDrawer();

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lookbook-gallery, .look-gallery').forEach(initLookbookGallery);
});

function initLookbookGallery(gallery) {
  const frontImage = gallery.querySelector('.lookbook-gallery__image');
  const images = (gallery.dataset.galleryImages || '').split('|').filter(Boolean);
  const look = gallery.dataset.look;
  const label = gallery.dataset.galleryLabel || `Look ${look}`;
  if (!frontImage || images.length < 2) return;

  // One stacked layer per image, all fetched and decoded before the viewer
  // reaches the gallery, so a click swaps instantly instead of leaving the
  // previous photo on screen while the next one downloads.
  frontImage.classList.add('is-visible');
  frontImage.alt = `${label}, image 1 of ${images.length}`;
  let anchor = frontImage;
  const layers = images.map((src, i) => {
    if (i === 0) return frontImage;
    const layer = frontImage.cloneNode(false);
    layer.classList.remove('is-visible');
    layer.removeAttribute('src');
    layer.removeAttribute('loading');
    layer.alt = '';
    layer.dataset.src = src;
    anchor.after(layer);
    anchor = layer;
    return layer;
  });
  const preload = () => layers.forEach(layer => {
    if (!layer.dataset.src) return;
    layer.src = layer.dataset.src;
    delete layer.dataset.src;
    layer.decode?.().catch(() => {});
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      preload();
    }, { rootMargin: '600px 0px' });
    observer.observe(gallery);
  } else preload();

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'lookbook-gallery__dots';
  dotsWrap.setAttribute('aria-hidden', 'true');
  images.forEach(() => dotsWrap.appendChild(document.createElement('span')));
  gallery.appendChild(dotsWrap);

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'lookbook-gallery__nav lookbook-gallery__nav--prev';
  prevBtn.setAttribute('aria-label', 'Previous image');
  gallery.appendChild(prevBtn);

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'lookbook-gallery__nav lookbook-gallery__nav--next';
  nextBtn.setAttribute('aria-label', 'Next image');
  gallery.appendChild(nextBtn);

  let index = 0;
  let touchStartX = null;
  const updateChrome = () => {
    dotsWrap.querySelectorAll('span').forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };
  const move = direction => {
    preload();
    layers[index].classList.remove('is-visible');
    layers[index].alt = '';
    index = (index + direction + images.length) % images.length;
    layers[index].alt = `${label}, image ${index + 1} of ${images.length}`;
    layers[index].classList.add('is-visible');
    updateChrome();
  };
  updateChrome();

  prevBtn.addEventListener('click', event => { event.stopPropagation(); move(-1); });
  nextBtn.addEventListener('click', event => { event.stopPropagation(); move(1); });
  gallery.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });
  gallery.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  gallery.addEventListener('touchend', event => {
    if (touchStartX === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) >= 40) move(distance < 0 ? 1 : -1);
  }, { passive: true });
}
