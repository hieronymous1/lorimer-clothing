/* SS24 lookbook galleries — progressively enhanced, local state only. */
injectCartDrawer();

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lookbook-gallery').forEach(initLookbookGallery);
});

function initLookbookGallery(gallery) {
  const image = gallery.querySelector('.lookbook-gallery__image');
  const images = (gallery.dataset.galleryImages || '').split('|').filter(Boolean);
  const look = gallery.dataset.look;
  if (!image || images.length < 2) return;

  let index = 0;
  let touchStartX = null;
  const render = () => {
    image.src = images[index];
    image.alt = `Model wearing Lorimer SS24 Look ${look}, image ${index + 1} of ${images.length}`;
  };
  const move = direction => {
    index = (index + direction + images.length) % images.length;
    render();
  };

  gallery.addEventListener('mouseenter', () => move(1));
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
