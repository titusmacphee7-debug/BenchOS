# Code Editor Auth + Database Summary

## What changed

- Implemented the approved first production-auth slice for `appbenchos.com`.
- Made login mandatory at the route shell:
  - `/login`, `/signup`, and `/reset-password` are the only public routes.
  - Protected app routes redirect to `/login` when signed out.
  - Signed-in users without account onboarding go to `/account-onboarding`.
  - The old `/local-mode` route no longer opens a production Local Mode page.
- Removed visible Local Mode bypass actions and copy from auth/account/top-bar flows.
- Removed hardcoded `Titus` display fallbacks from production code and tests.
- Stopped automatic personal sample data seeding by default.
- Kept shared reference data seeding:
  - Tool Library/catalog data.
  - Project templates.
  - Tool mastery guide definitions.
- Kept personal sample data available only when `includeSampleData: true` is explicitly requested.
- Updated deployment/auth docs to use `appbenchos.com` and describe mandatory Supabase Auth.

## Files changed

- `README.md`
  - Updated production auth and Netlify domain notes.
- `docs/ENVIRONMENT_SETUP.md`
  - Documented that protected pages require Supabase env vars.
- `docs/NETLIFY_DEPLOYMENT.md`
  - Updated domain from `app.benchos.com` to `appbenchos.com`.
  - Updated DNS guidance for the apex/root domain.
  - Updated environment variable wording for mandatory auth.
- `docs/supabase-setup.md`
  - Updated Supabase Auth from optional to required for production sign-in.
- `src/App.tsx`
  - Waits for initial auth session check.
  - Records signed-out state if session verification fails.
  - Updated startup copy to remove sample/local wording.
- `src/app/routes.tsx`
  - Added mandatory auth routing.
  - Added public auth frame.
  - Removed Local Mode route rendering.
- `src/app/routes.test.tsx`
  - Replaced local-mode route tests with mandatory auth tests.
  - Covered public signup/reset routes and protected core-loop routes.
- `src/components/layout/TopBar.tsx`
  - Removed Local Mode account prompts.
  - Removed hardcoded `Titus` fallback.
  - Sends sign-out users to `/login`.
- `src/data/actions.ts`
  - Requires signed-in account setup.
  - Requires real display/workshop names instead of falling back to `Titus` or `Local Workshop`.
- `src/data/hooks.ts`
  - Added auth gate state hook.
  - Changed startup seeding to shared reference data only.
  - Made account onboarding incomplete unless signed in and completed.
- `src/data/seed/profiles.ts`
  - Changed default session to `signed_out`.
  - Renamed opt-in sample profile/workshop values.
- `src/data/seed/seedDatabase.ts`
  - Changed `includeSampleData` default to `false`.
  - Moved personal profile/workshop/preferences/mastery progress behind explicit sample seeding.
- `src/data/seed/seedDatabase.test.ts`
  - Added coverage that default seeding creates no personal sample records.
  - Added coverage that explicit sample seeding still works.
- `src/features/auth/AccountOnboardingPage.tsx`
  - Removed Local Mode button.
  - Removed `Titus` and local workshop fallbacks.
- `src/features/auth/AuthPages.tsx`
  - Removed Local Mode page/export and visible bypass UI.
  - Updated login/signup/account copy for mandatory auth.
- `src/features/dashboard/DashboardPage.tsx`
  - Removed `Titus` and local workshop fallbacks.
- `src/lib/import-export/importExport.test.ts`
  - Requests explicit sample data where tests need seeded personal records.
- `src/lib/sync/authSync.test.ts`
  - Removed `Titus` fixture.
- `src/lib/sync/cloudSyncService.ts`
  - Removed Local Mode fallback wording from sync error copy.

## Netlify Database package/tooling

- No Netlify Database package/tooling was added.
- No new dependencies were added.
- No Netlify Functions were created in this slice.

## Migrations created

- None.
- No database schema or migration files were changed.

## API/functions created

- None.
- Server-side Netlify Database access is still a later approved slice.

## Auth guard behavior

- Signed-out users can only reach:
  - `/login`
  - `/signup`
  - `/reset-password`
- Signed-out users visiting app routes are redirected to `/login`.
- Signed-in users without completed account onboarding are redirected to `/account-onboarding`.
- Signed-in users with completed account onboarding can reach the existing app routes.
- Signing out routes back to `/login`.

## Local Mode removal/disablement

- The production `/local-mode` page is no longer routed.
- Visible Local Mode buttons and production copy were removed from auth/account/top-bar flows.
- The legacy `localModeService.ts` file remains in the repo for now because this task did not approve deleting files and because deeper data/backend migration work is still pending.

## Sample data behavior

- `ensureDatabaseSeeded()` now seeds shared reference data only by default.
- New accounts no longer auto-receive starter inventory, materials, projects, wishlist items, or mastery progress.
- Personal sample data is still available only through explicit `includeSampleData: true` paths, such as existing sample reset/import test flows.

## Commands run

- `git status --short --branch`
- `git remote -v`
- `npm run lint`
- `npm run test`
- `npm run build`
- `git grep` scans for `Titus`, old `app.benchos.com`, and visible Local Mode bypass copy

## Check results

- Baseline before edits:
  - `npm run lint`: passed.
  - `npm run test`: passed, 17 files / 80 tests.
  - `npm run build`: passed with existing Vite chunk-size warning.
- After edits:
  - `npm run lint`: passed.
  - `npm run test`: passed, 17 files / 79 tests.
  - `npm run build`: passed with existing Vite chunk-size warning.

## Remaining risks

- Core app data still uses Dexie/IndexedDB until the approved Netlify Database/API slice is implemented.
- Server-side user scoping is not implemented yet because no Netlify Functions or Netlify Database layer were added in this slice.
- Existing Supabase cloud sync remains in the app as the current transitional sync layer.
- Legacy Local Mode service/tests remain until deletion or deeper backend migration is approved.
- The build still reports the known chunk-size warning for the main bundle.
- Existing unrelated working-tree deletions remain untouched:
  - `public/icons.svg`
  - `src/assets/hero.png`

## Owner actions needed

- Add the public Supabase env variables in Netlify:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Confirm Supabase Auth redirect URLs for local and production login flows.
- Confirm DNS for `appbenchos.com` points to Netlify.
- Approve the next backend slice before adding Netlify Database migrations/functions/packages.

## Recommended next step

Run a Reviewer / QA pass on this auth slice, then approve a small Netlify Database/API vertical slice starting with authenticated `user_tools`.
