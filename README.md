# jaxsystems-site

Customer-facing site for **jaxsystems.ai** (Jax Systems — Jacksonville ops systems for HVAC,
plumbing and electrical businesses).

- Host: Cloudflare Pages, project `jaxsystems-site`
- Deploy: any push to `main` → GitHub Action `.github/workflows/deploy.yml` → `wrangler pages deploy`
- Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (repo-level, Pages-scoped token)
- Internal research workspace is separate: `~/Projects/fde-lab` → `evanpaliotta/jax-systems`

## Current state

Launch page only. The full multi-page customer site (problem index by business function,
industry views, delivery playbooks) is a separate design-first project per
`Projects/Deploy Lab/Website and Scope Direction.md`. Edit `index.html` and push; the deploy
runs automatically.
