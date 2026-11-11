import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('public/how-it-works.html', root), 'utf8');
const js = readFileSync(new URL('public/workflow-visual-7ba2a9654c72.js', root), 'utf8');
const css = readFileSync(new URL('public/workflow-visual-6428c1f98a21.css', root), 'utf8');

const approvedDescriptions = [
  ['01', 'Understand your day', 'We look at the real calls, inbox threads, schedules, and spreadsheets your team relies on every day.'],
  ['02', 'Find the bottleneck', 'Working shoulder-to-shoulder with your staff, we spot the exact handoff where tasks queue up or stall.'],
  ['03', 'Build and test together', 'Together we test the right improvement—simplifying steps first, connecting tools, or automating routine follow-up.'],
  ['04', 'Put it to work', 'Your team keeps clear ownership and human approval gates, with fewer crossed wires and an obvious next step.'],
];

test('how-it-works restores the approved workflow visual markup and assets', () => {
  assert.match(html, /workflow-visual-6428c1f98a21\.css/);
  assert.match(html, /workflow-visual-7ba2a9654c72\.js/);
  assert.match(html, /<div class="workflow-frame" id="workflow-frame" data-paused="false">/);
  assert.match(html, /id="workflow-motion-toggle" class="workflow-motion-toggle" aria-label="Pause workflow animation" hidden>Pause animation<\/button>/);
  assert.match(html, /<svg class="flow-svg flow-svg--desktop" id="svg-desktop"/);
  assert.match(html, /<svg class="flow-svg flow-svg--mobile" id="svg-mobile"/);
  assert.match(html, /<h2>Four-phase operational workflow diagram<\/h2>/);
  for (const [step, heading, copy] of approvedDescriptions) {
    assert.match(html, new RegExp(`<h3><span>${step}</span> ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/h3>`));
    assert.match(html, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('workflow visual stylesheet keeps pause, mobile, and reduced-motion affordances', () => {
  assert.match(css, /\.workflow-frame\[data-paused="true"\] \.bottleneck-pulse \{\s*animation: none;/);
  assert.match(css, /@media \(max-width:820px\) \{[\s\S]*\.flow-svg--desktop \{display:none;\} \.flow-svg--mobile \{display:block;/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\) \{[\s\S]*\.bottleneck-pulse \{animation:none !important;\}/);
});

function createNode(attributes = {}) {
  return {
    attributes: { ...attributes },
    listeners: {},
    hidden: false,
    textContent: '',
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    getAttribute(name) {
      return this.attributes[name];
    },
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    querySelectorAll() {
      return [];
    },
  };
}

function createPath(id, factor) {
  return {
    id,
    getTotalLength() {
      return 100;
    },
    getPointAtLength(length) {
      return { x: length * factor, y: length * (factor + 0.5) };
    },
  };
}

function buildHarness() {
  const frame = createNode({ 'data-paused': 'false' });
  const viewport = createNode({ 'data-phase': 'all' });
  const toggle = createNode({ 'aria-label': 'Pause workflow animation' });
  toggle.hidden = true;

  const desktopPaths = {
    'd-p1b': createPath('d-p1b', 1),
    'd-p2': createPath('d-p2', 1.1),
  };
  const mobilePaths = {
    'm-p1d': createPath('m-p1d', 0.9),
    'm-p4b': createPath('m-p4b', 1.2),
  };

  const desktopCircles = [
    createNode({ 'data-track': 'd-p1b', 'data-stage-ref': '1', 'data-offset': '0.55' }),
    createNode({ 'data-track': 'd-p2', 'data-stage-ref': '2', 'data-offset': '0.2' }),
  ];
  const mobileCircles = [
    createNode({ 'data-track': 'm-p1d', 'data-stage-ref': '1', 'data-offset': '0.65' }),
    createNode({ 'data-track': 'm-p4b', 'data-stage-ref': '4', 'data-offset': '0.4' }),
  ];

  const desktopSignals = createNode();
  desktopSignals.querySelectorAll = () => desktopCircles;
  const mobileSignals = createNode();
  mobileSignals.querySelectorAll = () => mobileCircles;

  const svgDesktop = {
    getBoundingClientRect() {
      return { width: 960 };
    },
  };
  const svgMobile = {
    getBoundingClientRect() {
      return { width: 344 };
    },
  };

  const motion = {
    matches: false,
    listener: null,
    addEventListener(type, handler) {
      if (type === 'change') this.listener = handler;
    },
  };

  const elements = {
    'workflow-frame': frame,
    'diagram-viewport': viewport,
    'workflow-motion-toggle': toggle,
    'svg-desktop': svgDesktop,
    'svg-mobile': svgMobile,
    'desktop-signals': desktopSignals,
    'mobile-signals': mobileSignals,
    ...desktopPaths,
    ...mobilePaths,
  };

  let nextAnimationFrame = null;
  const window = {
    matchMedia() {
      return motion;
    },
    requestAnimationFrame(callback) {
      nextAnimationFrame = callback;
      return 1;
    },
    addEventListener() {},
  };

  const document = {
    getElementById(id) {
      return elements[id] ?? null;
    },
  };

  vm.runInNewContext(js, { window, document, console });

  return {
    frame,
    viewport,
    toggle,
    motion,
    circles: { desktop: desktopCircles, mobile: mobileCircles },
    runFrame(time) {
      assert.equal(typeof nextAnimationFrame, 'function');
      const callback = nextAnimationFrame;
      nextAnimationFrame = null;
      callback(time);
    },
  };
}

test('workflow visual script animates signal positions, exposes pause/resume, and honors reduced motion', () => {
  const harness = buildHarness();
  const desktopSignal = harness.circles.desktop[0];

  assert.equal(harness.toggle.hidden, false);
  assert.equal(harness.toggle.textContent, 'Pause animation');
  assert.equal(harness.toggle.getAttribute('aria-label'), 'Pause workflow animation');
  assert.equal(harness.viewport.getAttribute('data-phase'), '1');
  assert.equal(harness.frame.getAttribute('data-paused'), 'false');

  const before = {
    cx: desktopSignal.getAttribute('cx'),
    cy: desktopSignal.getAttribute('cy'),
  };
  harness.runFrame(0);
  harness.runFrame(100);
  const after = {
    cx: desktopSignal.getAttribute('cx'),
    cy: desktopSignal.getAttribute('cy'),
  };
  assert.notEqual(after.cx, before.cx);
  assert.notEqual(after.cy, before.cy);
  assert.equal(desktopSignal.getAttribute('opacity'), '0.92');
  assert.equal(harness.circles.desktop[1].getAttribute('opacity'), '0.18');

  harness.toggle.listeners.click();
  assert.equal(harness.frame.getAttribute('data-paused'), 'true');
  assert.equal(harness.toggle.textContent, 'Play animation');
  assert.equal(harness.toggle.getAttribute('aria-label'), 'Play workflow animation');

  harness.toggle.listeners.click();
  assert.equal(harness.frame.getAttribute('data-paused'), 'false');
  assert.equal(harness.viewport.getAttribute('data-phase'), '1');
  assert.equal(harness.toggle.textContent, 'Pause animation');

  harness.motion.listener({ matches: true });
  assert.equal(harness.frame.getAttribute('data-paused'), 'true');
  assert.equal(harness.viewport.getAttribute('data-phase'), 'all');
  assert.equal(harness.toggle.textContent, 'Play animation');

  harness.motion.listener({ matches: false });
  assert.equal(harness.frame.getAttribute('data-paused'), 'false');
  assert.equal(harness.viewport.getAttribute('data-phase'), '1');
  assert.equal(harness.toggle.textContent, 'Pause animation');
});
