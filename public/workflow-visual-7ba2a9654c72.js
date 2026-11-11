(function () {
  'use strict';
  var sequence = ['1', '2', '3', '4', 'all'];
  var duration = 4200;
  var frame = document.getElementById('workflow-frame');
  var viewport = document.getElementById('diagram-viewport');
  var toggle = document.getElementById('workflow-motion-toggle');
  if (!frame || !viewport || !toggle) return;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var playing = !motion.matches;
  var index = 0;
  var phase = playing ? '1' : 'all';
  var elapsed = 0;
  var lastTime = null;
  var signalPhase = 0;

  function collectSignals(svgId, groupId) {
    var svg = document.getElementById(svgId);
    var group = document.getElementById(groupId);
    return {svg: svg, items: group ? Array.prototype.map.call(group.querySelectorAll('circle[data-track]'), function (circle) {
      return {element: circle, path: document.getElementById(circle.getAttribute('data-track')),
        stage: circle.getAttribute('data-stage-ref'), offset: parseFloat(circle.getAttribute('data-offset') || '0')};
    }) : []};
  }
  var signalSets = [collectSignals('svg-desktop', 'desktop-signals'), collectSignals('svg-mobile', 'mobile-signals')];
  function applyState() {
    viewport.setAttribute('data-phase', phase);
    frame.setAttribute('data-paused', playing ? 'false' : 'true');
    toggle.textContent = playing ? 'Pause animation' : 'Play animation';
    toggle.setAttribute('aria-label', playing ? 'Pause workflow animation' : 'Play workflow animation');
  }
  function renderSignals() {
    signalSets.forEach(function (set) {
      if (!set.svg || !set.svg.getBoundingClientRect().width) return;
      set.items.forEach(function (item) {
        if (!item.path) return;
        try {
          var length = item.path.getTotalLength();
          if (!length) return;
          var point = item.path.getPointAtLength(((signalPhase + item.offset) % 1) * length);
          item.element.setAttribute('cx', point.x.toFixed(1));
          item.element.setAttribute('cy', point.y.toFixed(1));
          item.element.setAttribute('opacity', phase === 'all' || phase === item.stage ? '0.92' : '0.18');
        } catch (error) { /* A hidden SVG may not expose its geometry. */ }
      });
    });
  }
  function tick(now) {
    if (lastTime === null) lastTime = now;
    var delta = Math.min(80, now - lastTime);
    lastTime = now;
    if (playing) {
      signalPhase = (signalPhase + delta * 0.00024) % 1;
      elapsed += delta;
      if (elapsed >= duration) {
        elapsed = 0;
        index = (index + 1) % sequence.length;
        phase = sequence[index];
        applyState();
      }
      renderSignals();
    }
    window.requestAnimationFrame(tick);
  }
  toggle.addEventListener('click', function () {
    playing = !playing;
    if (playing && phase === 'all') { index = 0; phase = sequence[index]; elapsed = 0; }
    applyState();
    renderSignals();
  });
  if (motion.addEventListener) motion.addEventListener('change', function (event) {
    playing = !event.matches;
    index = 0;
    elapsed = 0;
    phase = playing ? sequence[index] : 'all';
    applyState();
    renderSignals();
  });
  window.addEventListener('resize', renderSignals);
  applyState();
  renderSignals();
  toggle.hidden = false;
  window.requestAnimationFrame(tick);
})();
