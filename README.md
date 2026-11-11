# Jax Systems website

Customer website for https://jaxsystems.ai, hosted on Cloudflare Pages project `jaxsystems-site`.

- Source: `~/Projects/jaxsystems-site`
- Deploy: push `main` → GitHub Actions → `wrangler pages deploy public`
- Only `public/` is served. Research, tests and this README are not deployed.
- Preview: https://jaxsystems-site.pages.dev
- Internal workspace stays separate: https://evanpaliotta.github.io/jax-systems/

## Current website

Evan selected Jax Workshop for the custom domain. The five-page design and original video were promoted from `~/Projects/fde-lab/design-lab/concepts/13-jax-workshop/`; the original design lab remains unchanged. Only the relative design-lab backlink was changed to its existing absolute URL for the new hosting root.

Homepage, How we help (19 industries / 57 workflow scenarios), Pricing, Contact, and Privacy are included. The approved workflow graphic is on Home; `/how-it-works` redirects to that section. About is removed, including navigation and discovery links; `/about` and `/about.html` temporarily redirect home. Do not publish founder identity or biography without explicit approval. The approved How we help preview is now the production experience at `/how-we-help`, with `/ways-we-help` preserved as a compatibility redirect. Contact uses the live website delivery pipeline; do not reintroduce preview/noindex copy.

Edit the files in `public/` here for customer-site updates, not the design-lab source. Pushes deploy automatically. Validate static files with `python3 -m unittest discover -s tests -v`.

## Credentials

GitHub repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are configured. The deployment token has Pages Write permission for the hosting account, not DNS or email administration. Never commit credentials.
