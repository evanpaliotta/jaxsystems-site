
'use strict';

const video = document.querySelector('.film-frame video');
if (video) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  async function syncVideo() {
    const shouldPlay = !reducedMotion.matches && document.visibilityState === 'visible';
    if (!shouldPlay) {
      video.pause();
      return;
    }
    try {
      await video.play();
      video.classList.add('is-playing');
    } catch (error) {}
  }

  reducedMotion.addEventListener('change', syncVideo);
  document.addEventListener('visibilitychange', syncVideo);
  syncVideo();
}
