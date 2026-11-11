# Jax Systems visual-forward homepage execution plan

## Goal
Replace the decorative homepage hero animation with a single Jax-specific visual workflow stage that cycles through the five approved use cases, keeps the approved headline/CTA/contact path, and stays accessible, lightweight, and indexable.

## Constraints
- Keep the exact three-line homepage headline.
- Keep light Jacksonville/coastal colors, chosen logo, real contact path, and all 7 pages.
- Use original illustrative UI panels only; do not mimic Clay assets or imply real customer data/results.
- Auto-advance examples at about 7 seconds, with manual selection, visible pause/play control, and pause on hover, focus, reduced motion, hidden tab, and offscreen state.
- No text clutter, no invented metrics, no SEO/indexability regressions, no motion requirement.
- Prove changes with TDD, existing tests, browser verification, asset versioning, deploy, CI, and production verification.

## Steps
1. Add failing tests for the new hero/stage structure, the removal of the video dependency, the presence of visible cycle controls, and the non-decorative illustrative copy boundaries.
2. Replace the homepage hero markup with a visual workflow stage that contains five selectable use-case pills, concise explanatory copy, and large illustrative UI panels for calls, quotes, scheduling, documents, and updates.
3. Expand `public/site.js` to drive the stage state, timed cycling, pause/play behavior, hover/focus/offscreen/visibility handling, reduced-motion handling, and keyboard-accessible tab interactions.
4. Update `public/site.css` and `public/workshop.css` for the new visual layout, responsive behavior, overflow safety, and restrained supporting visuals.
5. Refresh asset hashes with `scripts/version-assets.py`.
6. Run the red/green test cycle, then the full static/contact test suite and JS syntax checks.
7. Preview locally and verify desktop/mobile rendering plus interaction behavior in a real browser.
8. Commit only the repo changes, push `main`, watch the matching GitHub Actions deployment, and verify the live production site and public contact flow as far as environment protections allow.

## Files expected
- Modify: `public/index.html`
- Modify: `public/site.js`
- Modify: `public/site.css`
- Modify: `public/workshop.css`
- Modify: `tests/test_public.py`
- Modify: `tests/test_design_recovery.py`
- Create: `docs/2026-11-10-visual-forward-homepage-plan.md`
