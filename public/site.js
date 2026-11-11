
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

(() => {
const section=document.querySelector('.use-case-gallery');
if(!section)return;
const tabs=[...section.querySelectorAll('.tab')],panels=[...section.querySelectorAll('.panel')],track=section.querySelector('.track'),prev=section.querySelector('#prev'),next=section.querySelector('#next'),toggle=section.querySelector('#cycle-toggle'),nav=section.querySelector('.navrow'),rail=section.querySelector('.tabs');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let active=0,playing=!reduced.matches,hovering=false,focused=false,dragging=false,visible=false,timer,settleTimer;
// Repeated visual tabs permit a true circular rail. Only the original five are in the accessibility tree.
tabs.forEach((tab,i)=>{tab.style.setProperty('--tab-accent',panels[i].style.getPropertyValue('--accent'));tab.dataset.index=i});
const fragments=[...tabs];
for(let group=0;group<3;group++)fragments.forEach(tab=>{let clone=tab.cloneNode(true);clone.removeAttribute('id');clone.removeAttribute('role');clone.removeAttribute('aria-controls');clone.removeAttribute('aria-selected');clone.setAttribute('aria-hidden','true');clone.tabIndex=-1;rail.append(clone)});
for(let group=0;group<3;group++)[...fragments].reverse().forEach(tab=>{let clone=tab.cloneNode(true);clone.removeAttribute('id');clone.removeAttribute('role');clone.removeAttribute('aria-controls');clone.removeAttribute('aria-selected');clone.setAttribute('aria-hidden','true');clone.tabIndex=-1;rail.prepend(clone)});
const physical=[...rail.querySelectorAll('.tab')];
function centerX(b){let r=rail.getBoundingClientRect(),q=b.getBoundingClientRect();return rail.scrollLeft+q.left+q.width/2-r.left-r.width/2}
function highlight(b){physical.forEach(x=>x.classList.toggle('is-current',x===b))}
function rebase(i){let canonical=tabs[i];rail.scrollTo({left:centerX(canonical),behavior:'instant'});highlight(canonical)}
function center(i,animate=true){clearTimeout(settleTimer);let choices=physical.filter(x=>Number(x.dataset.index)===i),candidate=choices.reduce((best,x)=>Math.abs(centerX(x)-rail.scrollLeft)<Math.abs(centerX(best)-rail.scrollLeft)?x:best);highlight(candidate);rail.scrollTo({left:centerX(candidate),behavior:animate&&!reduced.matches?'smooth':'instant'});if(candidate!==tabs[i])settleTimer=setTimeout(()=>rebase(i),850)}
function showPlayback(){toggle.textContent=playing?'Pause':'Play';toggle.setAttribute('aria-label',playing?'Pause automatic cycling':'Play automatic cycling')}
function schedule(){clearTimeout(timer);if(!playing||hovering||focused||dragging||!visible||document.hidden)return;timer=setTimeout(()=>select((active+1)%tabs.length),8000)}
function sync(i,animate=true){if(!Number.isInteger(i)||i<0||i>=tabs.length)return;active=i;tabs.forEach((b,j)=>{b.setAttribute('aria-selected',j===i);b.tabIndex=j===i?0:-1;panels[j].inert=j!==i;panels[j].classList.toggle('is-active',j===i)});center(i,animate)}
function select(i,focus=false){i=(i+tabs.length)%tabs.length;sync(i);if(focus)tabs[i].focus({preventScroll:true});schedule()}
tabs.forEach((b,i)=>{b.onclick=()=>select(i);b.onkeydown=e=>{let j=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;if(j!==null){e.preventDefault();select(j,true)}}});
physical.filter(b=>b.getAttribute('aria-hidden')==='true').forEach(b=>b.onclick=()=>select(Number(b.dataset.index)));prev.onclick=()=>select(active-1);next.onclick=()=>select(active+1);
toggle.onclick=()=>{playing=!playing;if(playing)focused=false;showPlayback();schedule()};

let swipeStart=null;
track.addEventListener('pointerdown',e=>{swipeStart={x:e.clientX,y:e.clientY};dragging=true;schedule()});
track.addEventListener('pointerup',e=>{if(swipeStart){let dx=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))select(active+(dx<0?1:-1))}swipeStart=null;dragging=false;schedule()});
track.addEventListener('pointercancel',()=>{swipeStart=null;dragging=false;schedule()});
let railDrag=null,suppressClick=false,wheelTimer;
function nearestTab(){let r=rail.getBoundingClientRect();return physical.reduce((a,b)=>{let ax=a.getBoundingClientRect(),bx=b.getBoundingClientRect();return Math.abs(bx.x+bx.width/2-r.x-r.width/2)<Math.abs(ax.x+ax.width/2-r.x-r.width/2)?b:a})}
rail.addEventListener('pointerdown',e=>{if(e.button!==0)return;clearTimeout(settleTimer);railDrag={x:e.clientX,y:e.clientY,left:rail.scrollLeft,moved:false};dragging=true;schedule()});
rail.addEventListener('pointermove',e=>{if(!railDrag)return;let dx=e.clientX-railDrag.x,dy=e.clientY-railDrag.y;if(!railDrag.moved&&Math.abs(dx)>6&&Math.abs(dx)>Math.abs(dy)){railDrag.moved=true;rail.setPointerCapture(e.pointerId);rail.classList.add('dragging')}if(railDrag.moved){if(e.cancelable)e.preventDefault();rail.scrollLeft=railDrag.left-dx}});
function endRailDrag(e){if(!railDrag)return;let moved=railDrag.moved;railDrag=null;dragging=false;rail.classList.remove('dragging');if(moved){suppressClick=true;select(Number(nearestTab().dataset.index));setTimeout(()=>suppressClick=false,50)}schedule()}
rail.addEventListener('pointerup',endRailDrag);rail.addEventListener('pointercancel',endRailDrag);
rail.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation()}},true);
rail.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>0){clearTimeout(wheelTimer);clearTimeout(timer);wheelTimer=setTimeout(()=>select(Number(nearestTab().dataset.index)),180)}},{passive:true});
nav.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovering=true;schedule()}});nav.addEventListener('pointerleave',()=>{hovering=false;schedule()});
nav.addEventListener('focusin',()=>{focused=true;schedule()});nav.addEventListener('focusout',e=>{if(!nav.contains(e.relatedTarget)){focused=false;schedule()}});
reduced.addEventListener('change',e=>{if(e.matches){playing=false;showPlayback();schedule()}});
document.addEventListener('visibilitychange',schedule);window.addEventListener('resize',()=>requestAnimationFrame(()=>{if(rail.clientWidth>0){clearTimeout(settleTimer);rebase(active)}}));
if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule()},{threshold:.1}).observe(section)}else visible=true;
sync(0,false);rebase(0);showPlayback();schedule();
})();

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
