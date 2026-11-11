
'use strict';

const navButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const mobileQuery = window.matchMedia('(max-width: 760px)');

function syncNav() {
  if (!nav || !navButton) return;
  const open = navButton.getAttribute('aria-expanded') === 'true';
  nav.hidden = mobileQuery.matches ? !open : false;
}

if (navButton && nav) {
  navButton.addEventListener('click', () => {
    navButton.setAttribute('aria-expanded', String(navButton.getAttribute('aria-expanded') !== 'true'));
    syncNav();
  });
  mobileQuery.addEventListener('change', () => {
    if (!mobileQuery.matches) navButton.setAttribute('aria-expanded', 'false');
    syncNav();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileQuery.matches && navButton.getAttribute('aria-expanded') === 'true') {
      navButton.setAttribute('aria-expanded', 'false');
      syncNav();
      navButton.focus();
    }
  });
  syncNav();
}

const demos = {
  calls: {
    title: 'A missed call becomes a ready callback.',
    description: 'Capture the basics once, then hand a person a clean next step instead of a voicemail hunt.',
    gather: 'Caller, job address, issue, callback window',
    human: 'Your team decides pricing and availability',
    boundary: 'Illustrative only. Pricing and scheduling stay with your team.',
    tag: 'Phone + inbox',
    visualTitle: 'Enquiry board',
    visualDescription: 'The callback starts with context, not a blank voicemail.',
    trigger: 'Missed call or web enquiry',
    handoff: 'One organized summary in the team inbox',
    summaryOne: 'Caller, location, issue, callback window',
    summaryTwo: 'Office lead reviews and calls back',
    asideOne: 'One place to review the enquiry before anyone replies.',
    asideTwo: 'A person still decides the promise, schedule, or price.'
  },
  quotes: {
    title: 'An estimate stays visible until someone answers.',
    description: 'Keep open quotes in one review queue so follow-up does not disappear into inbox archaeology.',
    gather: 'Sent date, amount range, owner, next follow-up',
    human: 'Your team approves pricing, discounts, and exceptions',
    boundary: 'Illustrative only. Commercial judgment stays with your team.',
    tag: 'Quotes + follow-up',
    visualTitle: 'Quote queue',
    visualDescription: 'The next follow-up is visible before the estimate goes cold.',
    trigger: 'Quote sent, no reply yet',
    handoff: 'A clean reminder queue for the right owner',
    summaryOne: 'Latest quote, last contact, owner, next due date',
    summaryTwo: 'Sales owner reviews the reminder before it is sent',
    asideOne: 'Open estimates are easier to spot before they stall out.',
    asideTwo: 'Only your team decides the actual number or concession.'
  },
  schedule: {
    title: 'A change of plan reaches the right people faster.',
    description: 'Put the confirmed date, access notes, and assigned person in one place before the day gets messy.',
    gather: 'Confirmed date, access note, assigned person, next step',
    human: 'Your team still confirms availability and timing',
    boundary: 'Illustrative only. Final scheduling stays with your team.',
    tag: 'Calendar + field team',
    visualTitle: 'Schedule update board',
    visualDescription: 'Everyone sees the same update instead of three conflicting messages.',
    trigger: 'Customer or crew asks for a schedule change',
    handoff: 'A shared update for office and field staff',
    summaryOne: 'New date, access details, assigned crew, dependencies',
    summaryTwo: 'Dispatch confirms the final slot before anyone is promised it',
    asideOne: 'Fewer handoffs get lost between the office and the field.',
    asideTwo: 'A person still confirms the actual appointment or reroute.'
  },
  docs: {
    title: 'Missing documents become easier to chase down.',
    description: 'Turn document requests into a visible checklist so the next review starts with what is still missing.',
    gather: 'Requested files, due date, owner, latest upload status',
    human: 'Your reviewer still checks completeness and approval',
    boundary: 'Illustrative only. Receiving a file is not the same as approving it.',
    tag: 'Checklist + upload',
    visualTitle: 'Document request list',
    visualDescription: 'Outstanding items stay visible instead of hiding in old email threads.',
    trigger: 'A file is requested or still missing',
    handoff: 'A named review queue with the open items highlighted',
    summaryOne: 'Required files, due date, owner, latest customer response',
    summaryTwo: 'Reviewer checks what arrived before anything is approved',
    asideOne: 'The next reminder is easier to send with the missing items listed.',
    asideTwo: 'A human still verifies the document itself.'
  },
  updates: {
    title: 'Routine updates stop eating the whole afternoon.',
    description: 'Pull the approved facts together so someone can review a draft instead of writing the update from scratch.',
    gather: 'Current milestone, responsible person, next step, source notes',
    human: 'Your team still checks wording, timing, and commitments',
    boundary: 'Illustrative only. Nothing here promises automatic customer communication.',
    tag: 'Status + draft',
    visualTitle: 'Update draft desk',
    visualDescription: 'The draft starts with the latest facts instead of another blank message.',
    trigger: 'Customer or owner asks for an update',
    handoff: 'A reviewable draft in the right channel',
    summaryOne: 'Current milestone, blockers, next step, source links',
    summaryTwo: 'Owner reviews the draft before it reaches the customer',
    asideOne: 'Useful facts come together without another round of manual copy-paste.',
    asideTwo: 'A person still approves tone, timing, and promises.'
  }
};

const demoButtons = Array.from(document.querySelectorAll('[data-demo]'));
const demoStage = document.querySelector('[data-demo-stage]');
const demoToggle = document.querySelector('[data-demo-toggle]');
const demoStatus = document.querySelector('[data-demo-status]');
const demoReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const demoPauseReasons = new Set();
const demoSelectors = {
  '[data-demo-title]': 'title',
  '[data-demo-description]': 'description',
  '[data-demo-gather]': 'gather',
  '[data-demo-human]': 'human',
  '[data-demo-boundary]': 'boundary',
  '[data-demo-tag]': 'tag',
  '[data-demo-visual-title]': 'visualTitle',
  '[data-demo-visual-description]': 'visualDescription',
  '[data-demo-trigger]': 'trigger',
  '[data-demo-handoff]': 'handoff',
  '[data-demo-summary-one]': 'summaryOne',
  '[data-demo-summary-two]': 'summaryTwo',
  '[data-demo-aside-one]': 'asideOne',
  '[data-demo-aside-two]': 'asideTwo'
};
const demoCycleMs = 7000;
let demoTimer = null;
let demoActiveIndex = Math.max(0, demoButtons.findIndex(button => button.getAttribute('aria-selected') === 'true'));
let demoRotationPreference = demoReducedMotion.matches ? 'paused' : 'auto';

function demoRotationActive() {
  if (!demoStage || demoButtons.length < 2) return false;
  const allowedByPreference = demoRotationPreference === 'playing' || (demoRotationPreference === 'auto' && !demoReducedMotion.matches);
  return allowedByPreference && demoPauseReasons.size === 0;
}

function syncDemoStatus() {
  if (demoStatus) {
    demoStatus.textContent = `${demoRotationActive() ? 'Auto-rotating' : 'Paused'} · ${demoActiveIndex + 1} of ${demoButtons.length}`;
  }
  if (!demoToggle) return;
  demoToggle.textContent = demoRotationActive() ? 'Pause rotation' : 'Play rotation';
  demoToggle.setAttribute('aria-pressed', String(demoRotationActive()));
  demoToggle.setAttribute('aria-label', demoRotationActive() ? 'Pause example rotation' : 'Play example rotation');
}

function scheduleDemoRotation() {
  window.clearTimeout(demoTimer);
  if (!demoRotationActive()) {
    syncDemoStatus();
    return;
  }
  demoTimer = window.setTimeout(() => {
    chooseDemo(demoButtons[(demoActiveIndex + 1) % demoButtons.length]);
  }, demoCycleMs);
  syncDemoStatus();
}

function setDemoPauseReason(reason, paused) {
  if (paused) demoPauseReasons.add(reason);
  else demoPauseReasons.delete(reason);
  scheduleDemoRotation();
}

function chooseDemo(button) {
  if (!button) return;
  const demo = demos[button.dataset.demo];
  if (!demo) return;
  demoActiveIndex = demoButtons.indexOf(button);
  demoButtons.forEach(item => {
    const active = item === button;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  document.querySelector('#demo-panel')?.setAttribute('aria-labelledby', button.id);
  Object.entries(demoSelectors).forEach(([selector, key]) => {
    document.querySelectorAll(selector).forEach(node => {
      node.textContent = demo[key];
    });
  });
  scheduleDemoRotation();
}

if (demoStage && demoButtons.length) {
  demoButtons.forEach((button, index) => {
    button.addEventListener('click', () => chooseDemo(button));
    button.addEventListener('keydown', event => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % demoButtons.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + demoButtons.length) % demoButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = demoButtons.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      demoButtons[nextIndex].focus();
      chooseDemo(demoButtons[nextIndex]);
    });
  });

  if (demoToggle) {
    demoToggle.addEventListener('click', () => {
      demoRotationPreference = demoRotationActive() ? 'paused' : 'playing';
      scheduleDemoRotation();
    });
  }

  demoStage.addEventListener('mouseenter', () => setDemoPauseReason('hover', true));
  demoStage.addEventListener('mouseleave', () => setDemoPauseReason('hover', false));
  demoStage.addEventListener('focusin', event => {
    if (event.target === demoToggle) return;
    setDemoPauseReason('focus', true);
  });
  demoStage.addEventListener('focusout', event => {
    if (!demoStage.contains(event.relatedTarget) || event.relatedTarget === demoToggle) setDemoPauseReason('focus', false);
  });
  document.addEventListener('visibilitychange', () => setDemoPauseReason('hidden', document.visibilityState !== 'visible'));
  demoReducedMotion.addEventListener('change', event => {
    if (event.matches && demoRotationPreference === 'auto') demoRotationPreference = 'paused';
    if (!event.matches && demoRotationPreference === 'paused' && !demoToggle?.matches(':focus')) {
      demoRotationPreference = 'auto';
    }
    scheduleDemoRotation();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      setDemoPauseReason('offscreen', !(entry && entry.isIntersecting));
    }, { threshold: [0, 0.1] });
    observer.observe(demoStage);
  }

  chooseDemo(demoButtons[demoActiveIndex]);
}

async function initIndustries() {
  const buttonsHost = document.querySelector('#industry-buttons');
  const panelsHost = document.querySelector('#industry-panels');
  const summary = document.querySelector('#industry-summary');
  const search = document.querySelector('#industry-search');
  const empty = document.querySelector('#industry-empty');
  if (!buttonsHost || !panelsHost || !summary) return;

  const allButtons = Array.from(buttonsHost.querySelectorAll('[data-industry-select]'));
  const allPanels = Array.from(panelsHost.querySelectorAll('[data-industry-panel]'));
  if (!allButtons.length || !allPanels.length) return;

  const industryMeta = allButtons.map(button => {
    const panel = allPanels.find(item => item.dataset.industryPanel === button.dataset.industrySelect);
    return {
      id: button.dataset.industrySelect,
      button,
      panel,
      haystack: (panel?.dataset.search || `${button.textContent} ${panel?.textContent || ''}`).toLowerCase(),
      examples: panel ? panel.querySelectorAll('.workflow-showcase-card, .example-card').length : 0
    };
  }).filter(item => item.panel);

  function visibleIndustries() {
    return industryMeta.filter(item => !item.button.hidden);
  }

  function updateSummary() {
    const visible = visibleIndustries();
    const examples = visible.reduce((total, item) => total + item.examples, 0);
    summary.textContent = `${visible.length} ${visible.length === 1 ? 'industry' : 'industries'}, ${examples} ${examples === 1 ? 'example' : 'examples'}.`;
    if (empty) empty.hidden = visible.length !== 0;
  }

  function showIndustry(id) {
    const visible = visibleIndustries();
    const fallback = visible[0]?.id || industryMeta[0]?.id;
    const targetId = visible.some(item => item.id === id) ? id : fallback;
    industryMeta.forEach(item => {
      const active = item.id === targetId;
      item.button.setAttribute('aria-pressed', String(active));
      item.panel.hidden = !active || item.button.hidden;
    });
  }

  function filterIndustries(query) {
    const lowered = query.trim().toLowerCase();
    industryMeta.forEach(item => {
      const show = !lowered || item.haystack.includes(lowered);
      item.button.hidden = !show;
      item.panel.hidden = !show;
    });
    updateSummary();
    showIndustry(location.hash.slice(1) || visibleIndustries()[0]?.id);
  }

  buttonsHost.addEventListener('click', event => {
    const button = event.target.closest('[data-industry-select]');
    if (!button || button.hidden) return;
    showIndustry(button.dataset.industrySelect);
    history.replaceState(null, '', `#${button.dataset.industrySelect}`);
  });

  if (search) {
    search.addEventListener('input', () => filterIndustries(search.value));
  }

  updateSummary();
  showIndustry(location.hash.slice(1) || visibleIndustries()[0]?.id);
  window.addEventListener('hashchange', () => showIndustry(location.hash.slice(1) || visibleIndustries()[0]?.id));
}

const contactState = {
  turnstileSiteKey: null,
  turnstileWidgetId: null,
  turnstileRequired: false,
  turnstileToken: ''
};

function renderTurnstileWhenReady(attempt = 0) {
  if (!contactState.turnstileSiteKey || contactState.turnstileWidgetId !== null) return;
  if (window.turnstile && typeof window.turnstile.render === 'function') {
    const shell = document.querySelector('#turnstile-shell');
    const mount = document.querySelector('#turnstile-widget');
    shell.hidden = false;
    contactState.turnstileWidgetId = window.turnstile.render(mount, {
      sitekey: contactState.turnstileSiteKey,
      action: 'contact',
      callback(token) { contactState.turnstileToken = token; },
      'expired-callback'() { contactState.turnstileToken = ''; },
      'error-callback'() { contactState.turnstileToken = ''; }
    });
    return;
  }
  if (attempt < 40) window.setTimeout(() => renderTurnstileWhenReady(attempt + 1), 250);
}

function setStatus(message, state) {
  const status = document.querySelector('#contact-status');
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state || '';
}

function setPending(pending) {
  const button = document.querySelector('[data-submit-button]');
  if (!button) return;
  button.disabled = pending;
  button.textContent = pending ? 'Sending your note…' : 'Tell us what’s slowing you down';
}

async function loadContactConfig() {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  try {
    const response = await fetch('/api/contact', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('config_failed');
    const config = await response.json();
    contactState.turnstileSiteKey = config.turnstileSiteKey || null;
    contactState.turnstileRequired = Boolean(contactState.turnstileSiteKey);
    if (contactState.turnstileRequired) renderTurnstileWhenReady();
  } catch (error) {
    setStatus('We could not load delivery settings yet. You can still review your note and retry shortly.', 'error');
  }
}

async function submitContact(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const success = document.querySelector('#contact-success');
  success.hidden = true;

  if (contactState.turnstileRequired && !contactState.turnstileToken) {
    setStatus('Please complete the spam check before sending.', 'error');
    return;
  }

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    business: form.business.value.trim(),
    message: form.message.value.trim(),
    website: form.website.value.trim()
  };
  if (contactState.turnstileToken) payload.turnstileToken = contactState.turnstileToken;

  setPending(true);
  setStatus('Sending your note…', 'pending');

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok !== true || typeof data.id !== 'string') {
      throw new Error('delivery_failed');
    }
    setStatus('Your note was delivered.', 'success');
    const successCopy = document.querySelector('[data-success-copy]');
    if (successCopy) successCopy.textContent = `Thanks — your message is in our inbox. Your reference is ${data.id}.`;
    success.hidden = false;
    form.reset();
    contactState.turnstileToken = '';
    if (window.turnstile && contactState.turnstileWidgetId !== null) window.turnstile.reset(contactState.turnstileWidgetId);
  } catch (error) {
    setStatus('We could not confirm delivery yet. Your text is still here so you can retry.', 'error');
  } finally {
    setPending(false);
  }
}

async function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  form.addEventListener('submit', submitContact);
  await loadContactConfig();
}

initIndustries();
initContactForm();
