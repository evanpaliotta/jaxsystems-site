    (function () {
      var CAPTIONS = {
        all: {
          tag: 'Full flow',
          text: 'From scattered daily handoffs to a calmer workflow—mapped, tested, and put to work alongside your team.'
        },
        '1': {
          tag: 'Phase 01',
          text: 'We look at the real calls, inbox threads, schedules, and spreadsheets your team relies on every day.'
        },
        '2': {
          tag: 'Phase 02',
          text: 'Working shoulder-to-shoulder with your staff, we spot the exact handoff where tasks queue up or stall.'
        },
        '3': {
          tag: 'Phase 03',
          text: 'Together we test the right improvement—simplifying steps first, connecting tools, or automating routine follow-up.'
        },
        '4': {
          tag: 'Phase 04',
          text: 'Your team keeps clear ownership and human approval gates, with fewer crossed wires and an obvious next step.'
        }
      };

      var SEQUENCE = ['1', '2', '3', '4', 'all'];
      var STEP_DURATION = 4200;

      var frame = document.getElementById('workflow-frame');
      var viewport = document.getElementById('diagram-viewport');
      var stepBtns = Array.prototype.slice.call(document.querySelectorAll('.step-btn'));
      var btnAll = document.getElementById('btn-all');
      var btnToggle = document.getElementById('btn-toggle');
      var btnReplay = document.getElementById('btn-replay');
      var iconPause = document.getElementById('icon-pause');
      var iconPlay = document.getElementById('icon-play');
      var toggleLabel = document.getElementById('toggle-label');
      var captionEl = document.getElementById('phase-caption');
      var captionTag = document.getElementById('caption-tag');
      var captionText = document.getElementById('caption-text');
      var stageHits = Array.prototype.slice.call(document.querySelectorAll('.flow-stage-hit'));

      var reducedMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
      var isReducedMotion = Boolean(reducedMotionQuery.matches);

      var currentPhase = isReducedMotion ? 'all' : '1';
      var isPlaying = !isReducedMotion;
      var seqIndex = 0;
      var stepElapsed = 0;
      var lastTime = null;
      var signalPhase = 0;

      function collectSignals(containerId, svgId) {
        var svg = document.getElementById(svgId);
        var group = document.getElementById(containerId);
        if (!svg || !group) return { svg: svg, items: [] };
        var circles = Array.prototype.slice.call(group.querySelectorAll('circle[data-track]'));
        var items = circles.map(function (c) {
          var trackId = c.getAttribute('data-track');
          var path = document.getElementById(trackId);
          return {
            el: c,
            path: path,
            stageRef: c.getAttribute('data-stage-ref'),
            offset: parseFloat(c.getAttribute('data-offset') || '0')
          };
        });
        return { svg: svg, items: items };
      }

      var desktopSignals = collectSignals('desktop-signals', 'svg-desktop');
      var mobileSignals = collectSignals('mobile-signals', 'svg-mobile');

      function clearProgressBars() {
        stepBtns.forEach(function (btn) {
          btn.removeAttribute('data-playing');
          var bar = btn.querySelector('.step-btn__progress');
          if (bar) bar.style.transform = 'scaleX(0)';
        });
      }

      function applyPhaseUI(phase, announcePolite) {
        currentPhase = phase;
        viewport.setAttribute('data-phase', phase);

        stepBtns.forEach(function (btn) {
          var isMatch = btn.getAttribute('data-step') === phase;
          btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
        });

        btnAll.setAttribute('aria-pressed', phase === 'all' ? 'true' : 'false');

        if (!announcePolite) {
          captionEl.setAttribute('aria-live', 'off');
        } else {
          captionEl.setAttribute('aria-live', 'polite');
        }

        var copy = CAPTIONS[phase] || CAPTIONS.all;
        captionTag.textContent = copy.tag;
        captionText.textContent = copy.text;
      }

      function applyTransportUI() {
        frame.setAttribute('data-paused', isPlaying ? 'false' : 'true');
        iconPause.style.display = isPlaying ? 'block' : 'none';
        iconPlay.style.display = isPlaying ? 'none' : 'block';
        toggleLabel.textContent = isPlaying ? 'Pause' : 'Play';
        btnToggle.setAttribute('aria-label', isPlaying ? 'Pause automatic sequence' : 'Play automatic sequence');
        if (!isPlaying) {
          clearProgressBars();
        }
      }

      function positionSignalSet(set, tGlobal) {
        if (!set.svg) return;
        var rect = set.svg.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        for (var i = 0; i < set.items.length; i++) {
          var item = set.items[i];
          if (!item.path) continue;
          try {
            var total = item.path.getTotalLength();
            if (total > 0) {
              var u = (tGlobal + item.offset) % 1;
              var pt = item.path.getPointAtLength(u * total);
              item.el.setAttribute('cx', pt.x.toFixed(1));
              item.el.setAttribute('cy', pt.y.toFixed(1));
              var active = currentPhase === 'all' || currentPhase === item.stageRef;
              item.el.setAttribute('opacity', active ? '0.92' : '0.18');
            }
          } catch (e) {
            /* Ignore hidden SVG geometry query */
          }
        }
      }

      function renderSignals() {
        positionSignalSet(desktopSignals, signalPhase);
        positionSignalSet(mobileSignals, signalPhase);
      }

      function updateActiveProgressBar(ratio) {
        stepBtns.forEach(function (btn) {
          var step = btn.getAttribute('data-step');
          var bar = btn.querySelector('.step-btn__progress');
          if (!bar) return;
          if (isPlaying && step === currentPhase) {
            btn.setAttribute('data-playing', 'true');
            bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, ratio)).toFixed(3) + ')';
          } else {
            btn.removeAttribute('data-playing');
            bar.style.transform = 'scaleX(0)';
          }
        });
      }

      function tick(now) {
        if (lastTime === null) lastTime = now;
        var dt = Math.min(80, now - lastTime);
        lastTime = now;

        if (isPlaying && !isReducedMotion) {
          signalPhase = (signalPhase + dt * 0.00024) % 1;
          stepElapsed += dt;
          if (stepElapsed >= STEP_DURATION) {
            stepElapsed = 0;
            seqIndex = (seqIndex + 1) % SEQUENCE.length;
            applyPhaseUI(SEQUENCE[seqIndex], false);
          }
          updateActiveProgressBar(stepElapsed / STEP_DURATION);
        }

        renderSignals();
        window.requestAnimationFrame(tick);
      }

      /* Manual Step Selection (pauses automatic cycle) */
      stepBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var step = btn.getAttribute('data-step');
          isPlaying = false;
          stepElapsed = 0;
          var nextPhase = (currentPhase === step) ? 'all' : step;
          var foundIdx = SEQUENCE.indexOf(nextPhase);
          if (foundIdx !== -1) seqIndex = foundIdx;
          applyTransportUI();
          applyPhaseUI(nextPhase, true);
          renderSignals();
        });
      });

      /* Clicking directly on an SVG stage also selects it */
      stageHits.forEach(function (group) {
        group.addEventListener('click', function () {
          var stage = group.getAttribute('data-stage');
          if (!stage) return;
          isPlaying = false;
          stepElapsed = 0;
          var nextPhase = (currentPhase === stage) ? 'all' : stage;
          var foundIdx = SEQUENCE.indexOf(nextPhase);
          if (foundIdx !== -1) seqIndex = foundIdx;
          applyTransportUI();
          applyPhaseUI(nextPhase, true);
          renderSignals();
        });
      });

      btnAll.addEventListener('click', function () {
        isPlaying = false;
        stepElapsed = 0;
        seqIndex = SEQUENCE.indexOf('all');
        applyTransportUI();
        applyPhaseUI('all', true);
        renderSignals();
      });

      btnToggle.addEventListener('click', function () {
        isPlaying = !isPlaying;
        if (isPlaying) {
          isReducedMotion = false;
          stepElapsed = 0;
          if (currentPhase === 'all') {
            seqIndex = 0;
            applyPhaseUI('1', true);
          }
        }
        applyTransportUI();
      });

      btnReplay.addEventListener('click', function () {
        seqIndex = 0;
        stepElapsed = 0;
        applyPhaseUI('1', true);
        if (!reducedMotionQuery.matches) {
          isReducedMotion = false;
          isPlaying = true;
        } else {
          isPlaying = false;
        }
        applyTransportUI();
        renderSignals();
      });

      if (reducedMotionQuery.addEventListener) {
        reducedMotionQuery.addEventListener('change', function (e) {
          isReducedMotion = e.matches;
          if (isReducedMotion) {
            isPlaying = false;
            applyPhaseUI('all', false);
            applyTransportUI();
          }
        });
      }

      window.addEventListener('resize', renderSignals);

      /* Initialize */
      applyPhaseUI(currentPhase, false);
      applyTransportUI();
      renderSignals();
      window.requestAnimationFrame(tick);
    })();
