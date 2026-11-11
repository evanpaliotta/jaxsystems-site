
'use strict';

const video = document.querySelector('.film-frame video');
const motionButton = document.querySelector('[data-motion]');

if (video && motionButton) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = reducedMotion.matches;
  let userEnabled = false;

  function showPaused() {
    motionButton.textContent = 'Play animation ▷';
    motionButton.setAttribute('aria-pressed', 'false');
    motionButton.setAttribute('aria-label', 'Play animation');
  }

  function showPlaying() {
    motionButton.textContent = 'Pause animation Ⅱ';
    motionButton.setAttribute('aria-pressed', 'true');
    motionButton.setAttribute('aria-label', 'Pause animation');
  }

  async function syncVideo() {
    const shouldPlay = (!reducedMotion.matches || userEnabled) && !userPaused && document.visibilityState === 'visible';
    if (!shouldPlay) {
      video.pause();
      showPaused();
      return;
    }
    try {
      await video.play();
      video.classList.add('is-playing');
      showPlaying();
    } catch (error) {
      showPaused();
    }
  }

  motionButton.addEventListener('click', () => {
    if (video.paused) {
      userPaused = false;
      userEnabled = true;
    } else {
      userPaused = true;
      userEnabled = false;
    }
    syncVideo();
  });

  reducedMotion.addEventListener('change', event => {
    if (event.matches) {
      userPaused = true;
      userEnabled = false;
    }
    syncVideo();
  });

  document.addEventListener('visibilitychange', syncVideo);
  syncVideo();
}
