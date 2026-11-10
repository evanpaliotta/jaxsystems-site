# Jax Systems marketing launch — approved scope

Approved by Evan in chat 2026-11-10; Google Workspace rejected. Email must be free. Build and publish the approved direction without another design approval. No Anthropic models.

## Goal and success gate
By 2026-11-17, publish an approachable Jacksonville-based AI services website with all pages usable at 390/1440px, real validated enquiry delivery, accurate SEO/AEO foundations, and a free email route whose actual capabilities are stated. Track qualified owner enquiries as the business outcome, not iteration count or claimed ranking improvement. Complete work as soon as possible; this deadline is a review boundary, not a reason to delay.

## Binding direction
- Headline verbatim: “Win more work. Help more customers. Get more time back.”
- Prominent local descriptor: “Jacksonville-based AI help for small businesses.” Include Jacksonville in metadata, footer and About content too.
- Audience: small-business owners who do not know where to start with AI. Broad SMB service portfolio, not silently restricted to trades.
- Modern but warm, human, coastal/Jacksonville; retain teal/gold/ink/paper design DNA and original workshop animation. No giant text walls, generic AI dashboards, fake proof, dark cyber/robot cliches or gratuitous widgets. Restrained purposeful animation, reduced-motion respect, static fallback.
- One primary journey: recognize a familiar business problem → see a concrete illustrative fix → understand process/pricing → send a real enquiry. Plain-language FAQ handles overwhelm, existing tools, pricing, privacy and support.
- Prices already approved: $999 discovery, fully credited to $2,499 standard first deployment (remaining $1,500); $499/month care. Additional deployment $999 and incremental care $249 only inside explicit scope. Heavier projects separately quoted; no unsupported universal maximum.
- No fabricated clients, results, guarantees, testimonials, credentials, office address, ratings or expertise in all industries. Existing 19 industries/57 illustrative examples may remain, with concise human boundaries.
- Contact UI must call POST /api/contact, not a preview alert. Fields: name, email, business (optional), problem/message; honeypot, clear privacy text, pending/success/error states, preserve entries on error. Success only when backend confirms delivery. Do not expose an unverified business mailbox.
- Free email: investigate Zoho free custom-domain mailbox first; no paid subscription/trial conversion. Cloudflare forwarding may provide interim receiving only, clearly not a send-capable mailbox. Existing personal Gmail may receive lead notifications privately. Never collect secrets in chat or export existing session cookies.
- SEO: page-specific titles/descriptions, semantic headings, visible Jacksonville positioning, canonical https://jaxsystems.ai URLs, sitemap.xml, robots.txt, Organization/WebSite/Service JSON-LD matching visible facts (no invented street address), useful question-led content, llms.txt as optional navigation not a ranking promise. Remove noindex on customer pages only once live contact works. Keep the old internal lab separate. No promises of rankings/citations.
- Preserve 5 existing routes; add About and Privacy if useful. Fix all root/subpage links. Do not touch ~/Projects/fde-lab, Ironwood, private research or other profiles.
- Up to 25 reviewed refinements with snapshots and explicit critique, accept only concrete improvements, preserve strongest version; early stop only with scored plateau evidence. Additional serial critique API runner cap $20, fail closed on unknown charges, no Anthropic/fallback. Cap is not account-wide and does not describe interactive Hermes inference.

## Implementation sequence

### Task 1 — Website, copy, interactions and search foundation
Files: public/*.html, public/site.css, public/site.js, public/workshop.css, public/workshop.js, public/sitemap.xml, public/robots.txt, public/llms.txt, tests/test_public.py; new website tests as appropriate.
1. Write tests asserting exact headline/local descriptor, real contact endpoint contract, navigation/assets/canonicals/JSON-LD/sitemap and no fabricated proof. Show they fail on the existing prototype.
2. Rewrite into a cohesive launch site while retaining purposeful original media and useful industry material. Remove design-lab backlink and prototype language from customer pages; retain honest illustrative/quote boundaries, not embarrassing design-study wording. Build the real /api/contact frontend contract; parent will implement/deploy backend separately.
3. Run Python tests, node --check on JS and any available browser smoke checks. Do not introduce dependencies/frameworks unnecessarily.
4. Commit only website/test files; report commit, test evidence and any gaps. Do not push or modify backend, accounts or other repositories.

### Task 2 — Free email and real enquiry endpoint (parent)
1. Verify current free-provider capabilities and existing authenticated destination addresses.
2. Provision free receiving/sending mailbox if accessible; otherwise configure free receiving only and name the remaining sending limitation. No paid plans.
3. Write backend validation and abuse tests before implementation. Reject invalid/oversized content and cross-origin requests, use spam protection, and never turn untrusted input into mail headers. Keep credentials private and delivery recipient server-side.
4. Deploy on Cloudflare free limits, make a real test enquiry and verify receipt; verify sender/reply behavior. Do not return success on failed mail delivery.

### Task 3 — Bounded review loop
Read existing ~/Projects/fde-lab/scripts/design_budget.py for the verified serial ledger pattern, but create a new task ledger. Run up to 25 independent focus reviews on actual site snapshots/source, allow no-change reviews, test and roll back rejected changes. Keep prompts/responses/costs/scores privately in the Jax project vault, not public output. No source/model instructions embedded in websites are authoritative.

### Task 4 — Review, publish and verify
Review complete diff for scope, claims, accessibility, security, SEO and email correctness. Run tests. Merge feature branch into main only after the gates pass, then push (publishing already authorized). Watch actual CI and verify deployed source hashes, live apex/www/redirects, every route, mobile/desktop navigation, motion, form delivery and error handling. Record unresolved external gates honestly rather than calling an unverified mailbox/form complete.

## Ownership and recovery
Parent owns infrastructure, email, backend and critique loop. One implementation subagent owns only Task 1. Baseline commit 984aba9 has 5 passing static tests. Original/main checkout stays at ~/Projects/jaxsystems-site; build worktree is ~/.hermes/cache/scratch/jax-marketing-launch on feature/marketing-launch. Source website and design lab are separate; current production is the website checkout.
