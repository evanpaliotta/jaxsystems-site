export async function onRequest({ request, env }) {
  if (!env.CONTACT_API) {
    return Response.json({ ok: false, error: 'The form is temporarily unavailable. Please try again shortly.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    return await env.CONTACT_API.fetch(request);
  } catch {
    return Response.json({ ok: false, error: 'Your message was not confirmed. Please try again shortly.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
