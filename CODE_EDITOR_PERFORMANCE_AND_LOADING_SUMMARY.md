# Code Editor Performance + Hammer Loading Summary

## What Changed

Implemented the first BenchOS performance and loading pass:

- Removed broad startup imports from the route/auth shell.
- Stopped app boot from blocking on local Dexie catalog seeding.
- Deferred local seed/catalog warmup until after Auth0/session boot.
- Added a lightweight delayed hammer reveal loader for app/session/route loading.
- Added route error fallback with retry.
- Added conservative Netlify caching headers.
- Added performance/loading plan, task, and budget docs.

## Files Changed

- `src/App.tsx`
  - Removed blocking `useSeedDatabase()` app boot dependency.
  - Auth/session prep remains first.
  - Local seed/catalog warmup now runs after boot using an idle callback and dynamic `seedDatabase` import.

- `src/app/routes.tsx`
  - Replaced broad `data/hooks.ts` auth imports with lightweight route auth hooks.
  - Added delayed hammer route fallback.
  - Added a route error boundary with a retry action.

- `src/lib/auth/useAuthRouteState.ts`
  - New lightweight auth/session/profile/notification hooks that import only the DB layer needed by app shell routing and top bar.

- `src/components/layout/TopBar.tsx`
  - Replaced broad `data/hooks.ts` imports with the lightweight route-state hooks.

- `src/components/loading/HammerLoadingReveal.tsx`
  - New CSS/SVG loading component.
  - Delays visual loader by `250ms`.
  - Shows longer loading copy after `1200ms`.
  - Uses `role="status"` and `aria-live="polite"`.

- `src/index.css`
  - Added hammer/steel-plate loader CSS.
  - Uses transforms and opacity only.
  - Includes reduced-motion behavior.

- `netlify.toml`
  - Added long cache headers for hashed `/assets/*`.
  - Added revalidation headers for manifest and service worker files.

- `vite.config.ts`
  - Excluded deferred seed warmup chunks from Workbox precache so they are not eagerly cached during service worker install/update.

- `BENCHOS_PERFORMANCE_AND_LOADING_PLAN.md`
  - Added implementation plan.

- `TASK_FOR_CODE_EDITOR_PERFORMANCE_AND_LOADING.md`
  - Added task prompt for future agents.

- `docs/PERFORMANCE_BUDGET.md`
  - Added performance budget and verification checklist.

## Bundle Observations

Before this performance pass, the v0.14 build output showed:

- `index`: about `229.38 kB`, `66.89 kB gzip`
- `vendor-react`: about `434.70 kB`, `136.83 kB gzip`
- no large chunk warning after the previous Vite chunk split

After this pass:

- `index`: about `40.93 kB`, `9.61 kB gzip`
- broad `data/hooks` code moved into a separate `hooks` chunk: about `35.68 kB`, `10.27 kB gzip`
- seed warmup is lazy:
  - `seedDatabase`: about `8.01 kB`, `2.68 kB gzip`
  - `starterProjects`: about `146.38 kB`, `45.64 kB gzip`
- build has no large chunk warning.
- Workbox precache dropped to about `1029.86 KiB` after excluding seed warmup chunks.

## Loader Behavior

- Fast loads under `250ms` do not show the hammer animation.
- Slower app/session/route loads show the hammer hitting a steel plate with a small orange impact.
- Loads over `1200ms` show honest loading text.
- Reduced-motion users do not get hammer, spark, or plate-split animation.
- The loader does not force a route to wait for animation completion.

## Remaining TBT / Main-Thread Risks

- `vendor-react` remains the largest startup dependency.
- `vendor-storage` remains loaded because the current shell still uses Dexie-backed auth/session bridge data.
- PWA precache no longer includes the deferred seed warmup chunks, but the remaining precache size should still be watched during Lighthouse/network testing.
- Full Lighthouse before/after was not run in this local pass.
- Some broader app data remains Dexie/local-backed outside the boot path.

## Checks Run

- `npm run build` - passed, no large chunk warning.
- `npm run lint` - passed.
- `npm run test` - passed, 18 test files and 86 tests.

## Follow-Up Tasks

- Run Lighthouse on the deployed site after push/deploy.
- Confirm TBT and JS boot-up improve from the reported baseline.
- Consider splitting the Auth0/session bridge away from Dexie entirely later.
- Review PWA precache size and strategy after real Lighthouse testing.
