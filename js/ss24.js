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

  // Two stacked layers so the opacity transition actually has something to
  // crossfade between, instead of swapping .src on a single <img>.
  frontImage.classList.add('is-visible');
  const backImage = frontImage.cloneNode(false);
  backImage.removeAttribute('src');
  backImage.alt = '';
  backImage.classList.remove('is-visible');
  gallery.insertBefore(backImage, frontImage.nextSibling);
  const layers = [frontImage, backImage];
  let frontIndex = 0;

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'lookbook-gallery__dots';
  dotsWrap.setAttribute('aria-hidden', 'true');
  images.forEach(() => dotsWrap.appendChild(document.createElement('span')));
  gallery.appendChild(dotsWrap);

  const counter = document.createElement('span');
  counter.className = 'lookbook-gallery__counter';
  counter.setAttribute('aria-hidden', 'true');
  gallery.appendChild(counter);

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
    counter.textContent = `${index + 1} / ${images.length}`;
    dotsWrap.querySelectorAll('span').forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };
  const move = direction => {
    index = (index + direction + images.length) % images.length;
    const back = layers[1 - frontIndex];
    back.src = images[index];
    back.alt = `${label}, image ${index + 1} of ${images.length}`;
    back.classList.add('is-visible');
    layers[frontIndex].classList.remove('is-visible');
    frontIndex = 1 - frontIndex;
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
