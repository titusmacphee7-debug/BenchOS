# BenchOS Cleaner Audit

## 1. Current Code Health

BenchOS is now on the v0.08/Auth0/Netlify path. The app has a clean mandatory-auth routing model, route-level lazy loading, Netlify Functions for server onboarding, and a larger Tool Mastery content surface. The core loop is still recognizable: Tool Library -> inventory -> projects -> readiness -> wishlist/purchases -> more buildable projects -> BenchXP/Tool Mastery.

This cleanup pass removed stale local/demo-era code and tightened a few internal exports. A fresh source scan found no `console.*`, `debugger`, TypeScript suppression comments, ESLint suppression comments, or old commented-out code markers in `src` or `netlify`.

What looks good:

- Current routing explicitly sends signed-out users to Auth0 login and keeps old local-mode/onboarding routes out of production flow.
- Route-level lazy loading is in place.
- Shared modal/dialog/table accessibility has tests.
- Status tone typing now lives outside `data/mock`.
- Netlify Functions are small entry files with shared auth/db/response helpers.

What still looks messy:

- `src/data/hooks.ts` is a broad hook module imported by startup code, which likely helps pull too much into the initial bundle.
- `src/features/auth/AccountOnboardingPage.tsx` is a 574-line page with many inline step components.
- `netlify/functions/_shared/onboardingStore.mjs` is a 272-line SQL/data-access module with no focused tests.
- There are many historical root planning/summary docs. Some still mention Supabase/local-mode plans and may confuse future agents unless clearly treated as history.
- Build passes but now warns that the main JS chunk is larger than 500 kB; latest observed main chunk was about 746.20 kB before gzip.

## 2. No-Risk Cleanup

Completed in this pass:

- Removed unused design-system helpers that had zero app imports:
  - `src/components/ui/EmptyState.tsx`
  - `src/components/ui/FilterBar.tsx`
- Removed stale mock/demo files that had zero app imports:
  - `src/data/mock/mockData.ts`
  - `src/data/mock/types.ts`
- Removed old unreachable local onboarding page:
  - `src/features/onboarding/OnboardingPage.tsx`
- Removed unused old `useOnboardingStatus` from `src/data/hooks.ts`.
- Updated `docs/design-system.md` so it no longer lists removed components.
- Made internal-only exports private in:
  - `src/lib/api/benchApi.ts`
  - `src/lib/import-export/backup.ts`
  - `src/lib/preferences/accountPersonalization.ts`
  - `src/lib/version.ts`

Still safe to repeat any time:

- Run `npm run lint`, `npm run test`, and `npm run build`.
- Re-run import/file scans before deleting anything.
- Keep generated `dist`, Netlify local state, real `.env` files, and logs out of commits.

## 3. Low-Risk Cleanup

- Consolidate historical root docs into a smaller `docs/history/` or `docs/reports/` area, but only with owner approval because many are project memory.
- Unexport additional type-only symbols when a fresh scan proves they are internal and no tests/docs rely on them.
- Add a short note to docs that old Supabase/local-mode reports are historical, not current production direction.
- Consider adding a simple Netlify Function unit test harness around request method validation and JSON error responses.

## 4. Medium-Risk Cleanup

- Split `src/data/hooks.ts` so boot/auth hooks do not import diagnostics and workshop-analysis logic into startup.
- Split `src/features/auth/AccountOnboardingPage.tsx` into step components and small helpers after adding focused tests around the onboarding flow.
- Add tests for `netlify/functions/_shared/onboardingStore.mjs` with a mocked query client before changing SQL/storage behavior.
- Reduce the current build warning by investigating startup imports and manual chunks. Do not just raise `chunkSizeWarningLimit`.
- Replace remaining `window.confirm` archive flows with the shared `ConfirmDialog` pattern.
- Add clearer loading/empty/error states where `useLiveQuery` currently defaults to `[]` and hides the difference between loading and empty.

## 5. High-Risk Changes To Avoid

- Do not change Auth0 login/session behavior as generic cleanup.
- Do not change Netlify Database schema, migrations, SQL semantics, or onboarding persistence without focused approval/tests.
- Do not change Dexie schema/versioning, seed data shape, readiness logic, diagnostics, search ranking, or Tool Mastery guide content as cleanup.
- Do not remove Tool Library, My Tools, Projects, Readiness, Wishlist, Materials, BenchXP, or Tool Mastery behavior.
- Do not delete historical planning/report docs without owner approval.
- Do not print, copy, or commit real `.env` values.

## 6. Unused Code Candidates

No high-confidence unused source files remain after this cleanup pass.

Lower-confidence candidates to leave alone:

| File path | What seems unused | Why you think it is unused | Confidence level | Safe action |
| --- | --- | --- | --- | --- |
| `src/data/hooks.ts` | `usePurchaseHistory` export | No current app imports found. Purchases are part of the core loop, so this may be future-facing. | medium | leave |
| `src/data/schema.ts` | Some exported domain aliases/constants | Export scan shows many are not imported directly. They document the data model and are type-only or low-cost. | low | leave |
| `src/lib/onboarding/onboardingTypes.ts` | Some exported draft/status subtypes | Some are consumed through aggregate types. Keeping these exports is clearer for the Netlify onboarding boundary. | low | leave |

Resolved unused-code removals:

- `src/App.css`
- `src/assets/react.svg`
- `src/assets/vite.svg`
- `src/assets/hero.png`
- `public/icons.svg`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/FilterBar.tsx`
- `src/data/mock/mockData.ts`
- `src/data/mock/types.ts`
- `src/features/onboarding/OnboardingPage.tsx`
- `src/data/hooks.ts` `useOnboardingStatus`

## 7. Duplicate Code Candidates

- `nextStepLabel` appears in both `src/features/dashboard/DashboardPage.tsx` and `src/features/projects/ProjectsPage.tsx`.
- `readinessTone` is duplicated in `src/features/project-templates/ProjectTemplatesPage.tsx` even though `src/lib/utils/status.ts` exports a richer version.
- `groupBy` appears in `src/data/hooks.ts` and `src/features/project-templates/ProjectTemplatesPage.tsx`.
- `formatDate` helpers are repeated across dashboard, materials, my-tools, auth/account, and top bar files.
- Tool and material filter UIs are similar and still implemented inline.
- Tool and material pagination controls are nearly identical.
- Create/edit modal patterns are repeated inline in projects, materials, my-tools, wishlist, project detail, and tool library pages.
- Netlify Function entry files share almost identical require-auth/try-catch/response wrappers.

## 8. Exact Phase 3 Code Editor Prompt

```text
You are the BenchOS Code Editor doing Phase 3 cleanup.

Read CLEANER_AUDIT.md first. Do not change Auth0 behavior, Netlify Database schema/migrations, Dexie schema, seed data, search ranking, readiness logic, Tool Mastery content, or routes.

Goal: reduce the current Vite main chunk warning without changing behavior.

Tasks:
1. Trace why `dist/assets/index-*.js` is above 500 kB after `npm run build`.
2. Prefer splitting startup imports over changing Vite warning limits.
3. Investigate whether `src/data/hooks.ts` can be split so boot/auth hooks used by `App.tsx` and `routes.tsx` do not import diagnostics/search/workshop score code.
4. Make the smallest safe change with focused tests if behavior is touched.
5. Run `npm run lint`, `npm run test`, and `npm run build`.
6. Report bundle sizes and any remaining warning.

Stop after the bundle-focused cleanup.
```
