# BenchOS Performance + Hammer Loading Plan

## Summary

BenchOS paints reasonably well, but Lighthouse showed too much JavaScript boot work and main-thread blocking. The top priority is reducing startup imports and synchronous work before adding any loading animation.

Reported baseline from the plan:

- FCP: about `2.0s`
- LCP: about `2.1s`
- Speed Index: about `2.6s`
- CLS: `0`
- TBT: about `1,330ms`
- Max Potential FID: about `490ms`
- TTI: about `3.7s`
- Main-thread work: about `2.95s`
- JavaScript boot-up: about `2.23s`

## Highest Impact Areas

1. Keep the auth/session route shell lightweight.
2. Stop blocking app boot on local Dexie seed/catalog imports.
3. Preserve route-level lazy loading and improve Suspense fallbacks.
4. Defer local catalog seeding and other noncritical work until after the app shell is ready.
5. Keep Tool Library search and guide data route-scoped.
6. Add conservative static asset caching.
7. Add a lightweight hammer loader only after performance work.

## Loader Requirements

- Use CSS and inline SVG only.
- No video, GIF, Lottie, or animation package.
- Show no hammer animation for loads under `250ms`.
- For slower loads, show a dark steel plate/shutter, hammer strike, orange impact ring, and reveal.
- For loads over `1200ms`, show honest loading text.
- Respect `prefers-reduced-motion`.
- Use accessible loading text with `role="status"` and `aria-live="polite"`.

## Performance Targets

- TBT under `300ms` if feasible.
- LCP under `1.8s`.
- Speed Index under `2.0s`.
- Keep CLS near `0`.
- Keep initial boot chunks smaller by avoiding route/data imports in app startup.

## Verification

Run:

- `npm run build`
- `npm run lint`
- `npm run test`

Manual follow-up:

- Run Lighthouse after deploy.
- Compare TBT, JS boot-up, unused JS, and main-thread work.
- Confirm loader does not appear on instant loads.
- Confirm reduced-motion mode avoids hammer/spark motion.
