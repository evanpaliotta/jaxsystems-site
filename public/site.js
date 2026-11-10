
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
    description: 'Collect the job basics, callback window and ownership so the next person starts with context instead of a voicemail hunt.',
    trigger: 'Missed call or web enquiry',
    gather: 'Contact details, location, issue, callback window',
    handoff: 'One organized summary where the team already works',
    human: 'Your team still decides pricing and availability',
    boundary: 'Pricing and scheduling stay with your team.'
  },
  quotes: {
    title: 'An estimate stays visible until someone answers.',
    description: 'Queue agreed follow-up, stop when the customer replies, and make the open estimate easy to find.',
    trigger: 'Quote sent, no reply yet',
    gather: 'Last contact date, quote status, owner, next follow-up',
    handoff: 'A clean reminder queue instead of inbox archaeology',
    human: 'Final numbers, discounts and promises stay human',
    boundary: 'Commercial judgment and exceptions stay with your team.'
  },
  schedule: {
    title: 'A change of plan reaches everyone who needs it.',
    description: 'Put confirmed dates, access notes and next actions in the same place.',
    trigger: 'Schedule change',
    gather: 'Agreed date, access details and assigned person',
    handoff: 'One clear next step for the team',
    human: 'Your team confirms availability',
    boundary: 'Your team makes the final scheduling decision.'
  },
  docs: {
    title: 'Missing documents become easier to track.',
    description: 'Track requested files in an approved checklist and flag what is still outstanding.',
    trigger: 'Document request',
    gather: 'Required files, due date and owner',
    handoff: 'A named review queue',
    human: 'Your reviewer checks access and completeness',
    boundary: 'Receiving a document is not the same as approving it.'
  },
  updates: {
    title: 'Routine updates stop eating the afternoon.',
    description: 'Use approved status facts to prepare a draft update that a person can review before it goes out.',
    trigger: 'Customer or owner asks for an update',
    gather: 'Current milestone, responsible person, next step, source links',
    handoff: 'A reviewable draft in the right channel',
    human: 'Sensitive wording and commitments still get checked',
    boundary: 'Nothing here promises automatic customer communication.'
  }
};

const demoButtons = Array.from(document.querySelectorAll('[data-demo]'));
function chooseDemo(button) {
  const demo = demos[button.dataset.demo];
  if (!demo) return;
  demoButtons.forEach(item => {
    const active = item === button;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  document.querySelector('#demo-panel')?.setAttribute('aria-labelledby', button.id);
  const mappings = {
    '[data-demo-title]': demo.title,
    '[data-demo-description]': demo.description,
    '[data-demo-trigger]': demo.trigger,
    '[data-demo-gather]': demo.gather,
    '[data-demo-handoff]': demo.handoff,
    '[data-demo-human]': demo.human,
    '[data-demo-boundary]': demo.boundary
  };
  Object.entries(mappings).forEach(([selector, text]) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = text;
  });
}

for (const [index, button] of demoButtons.entries()) {
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
}

async function initIndustries() {
  const buttonsHost = document.querySelector('#industry-buttons');
  const panelsHost = document.querySelector('#industry-panels');
  const summary = document.querySelector('#industry-summary');
  const search = document.querySelector('#industry-search');
  const empty = document.querySelector('#industry-empty');
  if (!buttonsHost || !panelsHost || !summary) return;

  try {
    const response = await fetch('industries.json', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('load_failed');
    const industries = await response.json();
    const examples = industries.reduce((total, item) => total + item.examples.length, 0);
    summary.textContent = `${industries.length} industries, ${examples} examples.`;

    buttonsHost.innerHTML = industries.map((industry, index) => `
      <button type="button" data-industry-select="${industry.id}" aria-pressed="${index === 0}">${industry.name}</button>
    `).join('');

    panelsHost.innerHTML = industries.map((industry, index) => `
      <section class="industry-panel" data-industry-panel="${industry.id}" ${index === 0 ? '' : 'hidden'}>
        <p class="eyebrow">Industry ${String(index + 1).padStart(2, '0')}</p>
        <h3>${industry.name}</h3>
        <p>${industry.audience}</p>
        <div class="example-grid">
          ${industry.examples.map(example => `
            <article class="example-card">
              <h4>${example.title}</h4>
              <p><strong>Problem:</strong> ${example.problem}</p>
              <p><strong>Possible fix:</strong> ${example.fix}</p>
            </article>
          `).join('')}
        </div>
        <div class="boundary">
          <strong>What stays human</strong>
          <p>${industry.human}</p>
        </div>
      </section>
    `).join('');

    const allButtons = Array.from(buttonsHost.querySelectorAll('[data-industry-select]'));
    const allPanels = Array.from(panelsHost.querySelectorAll('[data-industry-panel]'));

    function showIndustry(id) {
      const fallback = allButtons[0]?.dataset.industrySelect;
      const targetId = allPanels.some(panel => panel.dataset.industryPanel === id) ? id : fallback;
      allButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.industrySelect === targetId)));
      allPanels.forEach(panel => { panel.hidden = panel.dataset.industryPanel !== targetId; });
    }

    buttonsHost.addEventListener('click', event => {
      const button = event.target.closest('[data-industry-select]');
      if (!button) return;
      showIndustry(button.dataset.industrySelect);
      history.replaceState(null, '', `#${button.dataset.industrySelect}`);
    });

    if (search) {
      search.addEventListener('input', () => {
        const query = search.value.trim().toLowerCase();
        let visible = 0;
        allButtons.forEach((button, index) => {
          const industry = industries[index];
          const haystack = `${industry.name} ${industry.audience} ${industry.examples.map(example => `${example.title} ${example.problem} ${example.fix}`).join(' ')}`.toLowerCase();
          const show = !query || haystack.includes(query);
          button.hidden = !show;
          if (show) visible += 1;
        });
        if (empty) empty.hidden = visible !== 0;
      });
    }

    showIndustry(location.hash.slice(1));
    window.addEventListener('hashchange', () => showIndustry(location.hash.slice(1)));
  } catch (error) {
    summary.textContent = 'The industry examples could not load right now.';
  }
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
