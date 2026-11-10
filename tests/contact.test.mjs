import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../backend/contact-worker.mjs';

const ORIGIN = 'https://jaxsystems.ai';
const valid = { name: 'Test Owner', email: 'owner@example.com', business: 'Fictional Test Business', message: 'Fictional test enquiry about a follow-up process.', website: '', turnstileToken: 'test-response-token' };
function env() {
  const values = new Map();
  const sent = [];
  return {
    TURNSTILE_SITE_KEY: 'public-key', TURNSTILE_SECRET: 'private-key', RATE_LIMIT_SALT: 'private-rate-salt', CONTACT_TO: 'inbox@example.com',
    CONTACT_RATE: { async get(k) { return values.get(k) || null; }, async put(k, v) { values.set(k, v); } },
    NOTIFY: { async send(message) { sent.push(message); return { messageId: 'accepted-message-id' }; } },
    sent, values
  };
}
function request(data = valid, extra = {}) {
  return new Request(`${ORIGIN}/api/contact`, { method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.10', ...extra }, body: JSON.stringify(data) });
}
async function run(req, configuration = env(), verification = { success: true, hostname: 'jaxsystems.ai', action: 'contact' }) {
  const original = globalThis.fetch;
  globalThis.fetch = async url => {
    assert.equal(String(url), 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    return Response.json(verification);
  };
  try { return await worker.fetch(req, configuration); }
  finally { globalThis.fetch = original; }
}

test('GET exposes only public CAPTCHA configuration, never secret or recipient', async () => {
  const response = await run(new Request(`${ORIGIN}/api/contact`));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { turnstileSiteKey: 'public-key' });
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
test('valid enquiry sends a fixed-recipient message and confirms accepted receipt', async () => {
  const configuration = env();
  const response = await run(request(), configuration);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.match(body.id, /^[0-9a-f-]{36}$/);
  assert.equal(configuration.sent.length, 1);
  assert.equal(configuration.sent[0].to, 'inbox@example.com');
  assert.equal(configuration.sent[0].replyTo, 'owner@example.com');
  assert.match(configuration.sent[0].text, /Fictional test enquiry/);
  assert.equal(configuration.sent[0].from.email, 'enquiries@jaxsystems.ai');
});
test('unsupported method is not accepted', async () => {
  const response = await run(new Request(`${ORIGIN}/api/contact`, { method: 'DELETE' }));
  assert.equal(response.status, 405);
});
test('unknown endpoint does not expose mailer', async () => {
  assert.equal((await run(new Request(`${ORIGIN}/other`))).status, 404);
});
test('cross-origin submission is rejected before sending', async () => {
  const configuration = env();
  assert.equal((await run(request(valid, { Origin: 'https://evil.example' }), configuration)).status, 403);
  assert.equal(configuration.sent.length, 0);
});
test('missing Origin is rejected', async () => {
  const r = request(); r.headers.delete('Origin');
  assert.equal((await run(r)).status, 403);
});
test('non-JSON payload is rejected', async () => {
  assert.equal((await run(request(valid, { 'Content-Type': 'text/plain' }))).status, 415);
});
test('malformed JSON is rejected', async () => {
  const r = new Request(`${ORIGIN}/api/contact`, { method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json' }, body: '{' });
  assert.equal((await run(r)).status, 400);
});
test('arrays and null cannot be used as form objects', async () => {
  assert.equal((await run(request([]))).status, 400);
  assert.equal((await run(request(null))).status, 400);
});
for (const [field, value] of [['name', ''], ['email', 'invalid'], ['email', 'x@example.com\r\nBcc: evil@example.com'], ['message', 'short'], ['business', 'x'.repeat(161)], ['message', 'x'.repeat(3001)]]) {
  test(`invalid ${field} is rejected without mail`, async () => {
    const configuration = env();
    const response = await run(request({ ...valid, [field]: value }), configuration);
    assert.equal(response.status, 400);
    assert.equal(configuration.sent.length, 0);
  });
}
test('oversized body is rejected even without a Content-Length header', async () => {
  assert.equal((await run(request({ ...valid, message: 'x'.repeat(10000) }))).status, 413);
});
test('honeypot submission is rejected rather than fake-success', async () => {
  assert.equal((await run(request({ ...valid, website: 'https://spam.example' }))).status, 400);
});
test('missing CAPTCHA response is rejected', async () => {
  assert.equal((await run(request({ ...valid, turnstileToken: '' }))).status, 400);
});
test('failed CAPTCHA does not send mail', async () => {
  const configuration = env();
  assert.equal((await run(request(), configuration, { success: false })).status, 403);
  assert.equal(configuration.sent.length, 0);
});
test('CAPTCHA hostname and action are validated', async () => {
  assert.equal((await run(request(), env(), { success: true, hostname: 'evil.example', action: 'contact' })).status, 403);
  assert.equal((await run(request(), env(), { success: true, hostname: 'jaxsystems.ai', action: 'other' })).status, 403);
});
test('unconfigured deployment fails closed', async () => {
  const configuration = env(); delete configuration.TURNSTILE_SECRET;
  assert.equal((await run(request(), configuration)).status, 503);
});
test('delivery rejection is never returned as success', async () => {
  const configuration = env(); configuration.NOTIFY.send = async () => { throw new Error('private provider error'); };
  const response = await run(request(), configuration);
  assert.equal(response.status, 502);
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.ok(!JSON.stringify(body).includes('private provider'));
});
test('rate limit applies before mail and stores no raw IP or enquiry', async () => {
  const configuration = env();
  for (let i = 0; i < 5; i++) assert.equal((await run(request(), configuration)).status, 200);
  assert.equal((await run(request(), configuration)).status, 429);
  assert.equal(configuration.sent.length, 5);
  const stored = JSON.stringify([...configuration.values.entries()]);
  assert.ok(!stored.includes('192.0.2.10'));
  assert.ok(!stored.includes('owner@example.com'));
  assert.ok(!stored.includes('Fictional test enquiry'));
});
