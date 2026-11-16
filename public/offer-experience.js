document.documentElement.classList.add('offer-experience-ready');

(function () {
  const selector = document.getElementById('seven-area-selector');
  if (!selector) return;

  const buttons = Array.from(selector.querySelectorAll('[data-area-trigger]'));
  const panels = Array.from(selector.querySelectorAll('[data-area-panel]'));
  const stage = document.getElementById('area-visual-stage');
  if (!buttons.length || !panels.length || !stage) return;

  const activate = (id, focusButton = false) => {
    buttons.forEach((button) => {
      const active = button.dataset.areaTrigger === id;
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
      if (active && focusButton) { button.focus({preventScroll: true}); button.scrollIntoView({block: 'nearest', inline: 'nearest', behavior: 'instant'}); }
    });

    panels.forEach((panel) => {
      const active = panel.dataset.areaPanel === id;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });

    stage.dataset.current = id;
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => activate(button.dataset.areaTrigger));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = buttons.length - 1;
      else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % buttons.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + buttons.length) % buttons.length;
      activate(buttons[nextIndex].dataset.areaTrigger, true);
    });
  });

  const activeButton = buttons.find((button) => button.getAttribute('aria-selected') === 'true') || buttons[0];
  activate(activeButton.dataset.areaTrigger);
})();
