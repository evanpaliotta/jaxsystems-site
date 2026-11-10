const HOSTS = new Set(['jaxsystems.ai', 'www.jaxsystems.ai', 'jaxsystems-site.pages.dev']);
const PREVIEW = /^[a-z0-9-]+\.jaxsystems-site\.pages\.dev$/;
const MAX_BYTES = 8192;
const WINDOW_SECONDS = 600;
const MAX_REQUESTS = 5;
const allowedHost = hostname => HOSTS.has(hostname) || PREVIEW.test(hostname);

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
function error(message, status) { return json({ ok: false, error: message }, status); }

async function boundedJSON(request) {
  const length = Number(request.headers.get('Content-Length'));
  if (length > MAX_BYTES) return { tooLarge: true };
  const reader = request.body?.getReader();
  if (!reader) return { invalid: true };
  let total = 0;
  const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) { await reader.cancel(); return { tooLarge: true }; }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let position = 0;
  for (const chunk of chunks) { bytes.set(chunk, position); position += chunk.length; }
  try { return { data: JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) }; }
  catch { return { invalid: true }; }
}

function validate(data) {
  if (!data || Array.isArray(data) || typeof data !== 'object') return null;
  for (const field of ['name', 'email', 'message', 'turnstileToken']) if (typeof data[field] !== 'string') return null;
  if (data.business !== undefined && typeof data.business !== 'string') return null;
  if (data.website !== undefined && typeof data.website !== 'string') return null;
  const entry = { name: data.name.trim(), email: data.email.trim(), business: (data.business || '').trim(), message: data.message.trim(), turnstileToken: data.turnstileToken.trim() };
  if (!entry.name || entry.name.length > 100 || /[\r\n\0]/.test(entry.name)) return null;
  if (entry.email.length > 254 || !/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(entry.email)) return null;
  if (entry.business.length > 160 || /[\r\n\0]/.test(entry.business)) return null;
  if (entry.message.length < 10 || entry.message.length > 3000 || entry.message.includes('\0')) return null;
  if (entry.turnstileToken.length < 1 || entry.turnstileToken.length > 2048 || (data.website || '').trim()) return null;
  return entry;
}

async function submit(request, env) {
  let origin;
  try { origin = new URL(request.headers.get('Origin') || ''); } catch { return error('Please send the form from our website.', 403); }
  if (origin.protocol !== 'https:' || !allowedHost(origin.hostname) || origin.port) return error('Please send the form from our website.', 403);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return error('Please use the enquiry form.', 415);
  const body = await boundedJSON(request);
  if (body.tooLarge) return error('That message is too large. Please shorten it and retry.', 413);
  const entry = body.invalid ? null : validate(body.data);
  if (!entry) return error('Please check your details and complete the spam check.', 400);
  if (!env.TURNSTILE_SECRET || !env.RATE_LIMIT_SALT || !env.CONTACT_RATE || !env.NOTIFY || !env.CONTACT_TO) return error('The form is temporarily unavailable. Please try again shortly.', 503);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  let verification;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: entry.turnstileToken, ...(ip === 'unknown' ? {} : { remoteip: ip }) }),
      signal: AbortSignal.timeout(10000)
    });
    verification = await response.json();
  } catch { return error('The spam check is unavailable. Please try again.', 503); }
  if (!verification.success || !allowedHost(verification.hostname || '') || verification.action !== 'contact') return error('The spam check expired. Please try again.', 403);

  const bucket = Math.floor(Date.now() / (WINDOW_SECONDS * 1000));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${env.RATE_LIMIT_SALT}:${ip}:${bucket}`));
  const key = 'contact:' + Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  try {
    const count = Number(await env.CONTACT_RATE.get(key) || 0);
    if (count >= MAX_REQUESTS) return error('Several enquiries have been sent from this connection. Please try again later.', 429);
    await env.CONTACT_RATE.put(key, String(count + 1), { expirationTtl: WINDOW_SECONDS * 2 });
  } catch { return error('The form is temporarily unavailable. Please try again shortly.', 503); }

  const id = crypto.randomUUID();
  try {
    await env.NOTIFY.send({
      to: env.CONTACT_TO,
      from: { email: 'enquiries@jaxsystems.ai', name: 'Jax Systems website' },
      replyTo: entry.email,
      subject: 'New Jax Systems enquiry',
      text: `Enquiry reference: ${id}\nReceived: ${new Date().toISOString()}\n\nName: ${entry.name}\nEmail: ${entry.email}\nBusiness: ${entry.business || 'Not provided'}\n\n${entry.message}\n\nUse Reply to respond to this person. This notification does not subscribe them to marketing.`
    });
  } catch { return error('Your message was not confirmed. Your details are still here; please try again.', 502); }
  return json({ ok: true, id });
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== '/api/contact') return error('Not found.', 404);
    if (request.method === 'GET') return json({ turnstileSiteKey: env.TURNSTILE_SITE_KEY || null });
    if (request.method !== 'POST') return error('Method not allowed.', 405);
    try { return await submit(request, env); }
    catch { return error('The form is temporarily unavailable. Please try again shortly.', 503); }
  }
};
