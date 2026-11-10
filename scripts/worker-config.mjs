import { writeFileSync } from 'node:fs';
const recipient = process.env.CONTACT_TO;
if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
  throw new Error('CONTACT_TO must be supplied securely by the deployment environment.');
}
const configuration = {
  name: 'jaxsystems-contact',
  main: 'contact-worker.mjs',
  compatibility_date: '2026-11-10',
  workers_dev: false,
  preview_urls: false,
  keep_vars: true,
  send_email: [{ name: 'NOTIFY', destination_address: recipient }],
  kv_namespaces: [{ binding: 'CONTACT_RATE', id: '18a2718e956243799a642ad62fa06a92' }],
  vars: { TURNSTILE_SITE_KEY: '0x4AAAAAAF7xhEyIHo_ZUtCm', CONTACT_TO: recipient }
};
writeFileSync(new URL('../backend/wrangler.generated.json', import.meta.url), JSON.stringify(configuration, null, 2));
console.log('Generated private contact-worker deployment configuration.');
