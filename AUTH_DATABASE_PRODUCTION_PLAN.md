# BenchOS Mandatory Login + Netlify Database Plan

Domain:

```text
appbenchos.com
```

Planning note:

- Existing deployment docs currently mention `app.benchos.com`.
- The new production domain in this task is `appbenchos.com`.
- That should be updated in a later approved Code Editor task.

## 1. Current App State

Framework:

- Vite
- React
- TypeScript
- React Router with `BrowserRouter`
- Tailwind CSS
- Vite PWA plugin

Package manager:

- npm
- `package-lock.json` exists.

Current scripts from `package.json`:

```text
npm run dev
npm run build
npm run lint
npm run test
npm run preview
```

Current deployment shape:

- Static SPA built by Vite.
- Netlify config exists at `netlify.toml`.
- `netlify.toml` builds with `npm run build`, publishes `dist`, and has an SPA fallback redirect to `/index.html`.
- No `netlify/functions` folder was found.
- No `.netlify` folder was found.
- No `public/_redirects` file was found, which is fine because `netlify.toml` currently handles routing fallback.

Current Git status:

- Repo is on `main`.
- GitHub remote exists:

```text
origin https://github.com/titusmacphee7-debug/BenchOS.git
```

- There are current uncommitted changes and deleted files:

```text
D  public/icons.svg
D  src/assets/hero.png
?? BENCHOS_COMMAND_CENTER.md
?? BENCHOS_PLANNER_REPORT.md
?? CLEANER_AUDIT.md
?? CODE_EDITOR_PHASE_1_SUMMARY.md
?? GITHUB_NETLIFY_INTEGRATION_PLAN.md
?? TASK_FOR_CODE_EDITOR.md
?? TASK_FOR_CODE_EDITOR_GITHUB_NETLIFY.md
```

Current auth state:

- Supabase Auth exists.
- Auth code lives mainly in:
  - `src/lib/auth/supabaseClient.ts`
  - `src/lib/auth/authService.ts`
  - `src/features/auth/AuthPages.tsx`
  - `src/features/auth/AccountOnboardingPage.tsx`
- Supabase env names in `.env.example`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Code also accepts `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Auth is currently optional, not mandatory.
- Local Mode is currently a supported app path.

Current data source:

- Core app data is stored in browser IndexedDB through Dexie.
- The database is defined in `src/data/db.ts`.
- Data hooks read from Dexie through `dexie-react-hooks` in `src/data/hooks.ts`.
- Data mutations write to Dexie in `src/data/actions.ts`.
- Supabase cloud sync exists as an optional sync layer in `src/lib/sync/cloudSyncService.ts`.
- Existing Supabase cloud tables use `workshops`, `user_profiles`, and a JSONB `workshop_records` table.
- No Netlify Database code was found.
- No server/API layer for app data was found.
- No `fetch`-based app API layer was found.
- No `@netlify/database` package was found in `package.json`.
- No `netlify/functions` folder was found.

Current local/demo/sample data usage:

- `src/App.tsx` calls `useSeedDatabase()` before rendering routes.
- `src/data/hooks.ts` calls `ensureDatabaseSeeded()`.
- `src/data/seed/seedDatabase.ts` seeds the tool catalog and also seeds personal/sample data by default because `includeSampleData` defaults to `true`.
- Sample personal data includes:
  - `src/data/seed/starterInventory.ts`
  - `src/data/seed/starterProjects.ts`
  - `src/data/seed/starterMastery.ts`
- Default local profile/session records are in `src/data/seed/profiles.ts`.
- Settings include reset/import/export flows that reinforce local-first behavior in `src/features/settings/SettingsPage.tsx`.

Current hardcoded account usage:

- I did not find hardcoded Supabase credentials or an actual auto-login using a Titus email/password.
- I did find hardcoded `Titus` as a display-name fallback in production UI/action paths:
  - `src/components/layout/TopBar.tsx`
  - `src/features/auth/AuthPages.tsx`
  - `src/features/auth/AccountOnboardingPage.tsx`
  - `src/data/actions.ts`
- Tests also use `Titus` and `titus@example.com`, which is fine for fixtures if clearly test-only.

Current database/schema files:

- Dexie schema: `src/data/db.ts`
- Shared TypeScript schema: `src/data/schema.ts`
- Supabase migrations:
  - `supabase/migrations/20260504000000_phase4_auth_sync.sql`
  - `supabase/migrations/20260504093811_add_user_profiles_default_workshop_index.sql`
  - `supabase/migrations/20260504231500_tighten_workshop_record_rls.sql`

Netlify Database context from current Netlify docs:

- Netlify Database is managed Postgres built into Netlify.
- Netlify Database supports branching and automatic migrations.
- Production deploys are the only deploys allowed to access the main database.
- Deploy previews get isolated database branches copied from production at preview creation time.
- Netlify Functions can run server-side code and access runtime environment variables.

## 2. Problems To Fix

These conflict with the new production rules:

- App data is currently Dexie/IndexedDB-first.
- App starts by seeding local data through `useSeedDatabase()`.
- `ensureDatabaseSeeded()` currently loads sample personal data by default.
- Local Mode is a first-class app path and production fallback.
- Unauthenticated users can reach app/dashboard after onboarding/local data state is satisfied.
- Login is optional.
- Account onboarding can default display name to `Titus`.
- Top bar can display `Titus` when no real user profile name exists.
- Account page can display `Titus` when no real user profile name exists.
- Default profiles use `local-user`, `local-workshop`, and `local-session`.
- Default profile name is `Local Mode`.
- Tool buying preferences use id `default`.
- Many hooks and actions read/write all local records without requiring an authenticated user.
- User scoping exists as optional metadata, not as the required access boundary.
- Existing Supabase sync stores app data as JSONB payloads, not as first-class production tables in Netlify Database.
- No server/database layer currently protects app data.
- No Netlify Functions API layer currently exists.
- No Netlify Database migrations currently exist.
- No Netlify Database package or client is currently installed.
- Settings still expose local backup/import/reset/clear controls as core app data controls.
- Existing docs still describe Local Mode and optional Supabase.
- Existing docs mention `app.benchos.com`, while the new domain is `appbenchos.com`.

Important nuance:

- I found no direct `localStorage` calls for app data.
- However, Dexie/IndexedDB is still browser-local production data, so it conflicts with the new rule that core app data must come from the authenticated user's database account.
- Supabase Auth may persist auth session data in browser storage depending on configuration. If the owner interprets "localStorage may only be UI preferences" strictly enough to include auth tokens, that requires a cookie/session redesign.

## 3. Required Production Behavior

BenchOS production behavior should be:

- First visit to `appbenchos.com` shows login/register, not dashboard.
- Unauthenticated users cannot access app pages.
- Any protected route redirects to login if there is no valid session.
- After login, the user sees only their own data.
- New accounts start empty:
  - no starter inventory
  - no starter projects
  - no starter wishlist
  - no starter mastery progress
  - no fake local profile
  - no Titus fallback
- The real shared Tool Library/catalog may still exist, but it must be treated as product/catalog reference data, not demo personal data.
- Optional starter/sample personal data can exist only as an explicit user action.
- Any starter data import must be clearly labeled and reversible where possible.
- Logout ends the session and returns the user to login.
- Refresh keeps a valid session.
- Expired or invalid session returns to login.
- No production fallback should silently switch to Local Mode.
- Browser storage may only hold harmless UI preferences, such as theme, sidebar state, filters, or dismissed tips.
- Core data must persist in Netlify Database through a server/API layer.

## 4. Authentication Strategy

What exists:

- Supabase Auth is already implemented for signup, login, magic link, password reset, session refresh, and sign out.
- The app already has login/signup/account pages.
- The app already has Supabase client env variables.
- The app currently treats Supabase as optional and keeps Local Mode available.

Recommendation:

- Keep Supabase Auth for the first production conversion.
- Move app data to Netlify Database.
- Use Supabase Auth only for identity/session, not as the production app data store.
- Make Supabase Auth mandatory at the route level.
- Netlify Functions should validate the authenticated user before every database read/write.
- Netlify Database rows should store a stable `auth_provider` and `auth_user_id` mapping.

Recommended identity mapping:

```text
Supabase auth user id -> Netlify Database app_users.auth_user_id
```

Suggested `app_users` fields:

```text
id uuid primary key
auth_provider text not null default 'supabase'
auth_user_id text not null
email text
display_name text
created_at timestamptz
updated_at timestamptz
unique(auth_provider, auth_user_id)
```

How functions validate sessions:

- Frontend gets the Supabase session.
- Frontend sends the access token to Netlify Functions using an `Authorization: Bearer ...` header.
- Netlify Function validates that token server-side.
- Function looks up or creates the matching `app_users` row.
- Function runs Netlify Database queries filtered by `app_user.id`.

Benefits:

- Reuses existing auth screens and auth service.
- Avoids building a custom auth system.
- Keeps database credentials out of the browser.
- Lets Netlify Database become the production app data source.
- Separates identity from app data.

Risks:

- Supabase Auth is still an external auth dependency.
- Preview deployments may use the same Supabase project unless a separate preview auth project is configured.
- Supabase frontend sessions may use browser storage. If that violates the strict localStorage rule, the project needs an HttpOnly cookie/session approach instead.
- User deletion or email changes need a clear sync/mapping policy.

If Supabase Auth is not kept:

- Netlify Database does not automatically provide login.
- The project would need a separate auth provider or a custom server-side auth system.
- A custom auth system is a larger and higher-risk change than keeping Supabase Auth.

Decision:

- Keep Supabase Auth for now unless the owner explicitly chooses a different auth provider or requires HttpOnly cookie-only sessions.

## 5. Netlify Database Strategy

Netlify Database should hold production app data in first-class Postgres tables.

Tables to plan:

Core identity:

- `app_users`
- `user_profiles`
- `workshops`

User-owned app data:

- `user_tools`
- `materials`
- `projects`
- `project_requirements`
- `project_steps`
- `project_activity`
- `wishlist_items`
- `purchase_history`
- `tool_usage_logs`
- `material_usage_logs`
- `maintenance_logs`
- `mastery_progress`
- `xp_events`
- `notifications`
- `tool_buying_preferences`
- `readiness_snapshots` if cached readiness is useful
- `settings` for server-backed user settings only

Shared/reference data:

- `tool_types`
- `tool_families`
- `brands`
- `battery_platforms`
- `tool_catalog_items`
- `tool_catalog_specs`
- `tool_catalog_source_notes`
- `capabilities`
- `tool_type_capabilities`
- `tool_accessories`
- `tool_consumables`
- `tool_compatibility_rules`
- `tool_guide_sections`
- `project_templates`
- `project_template_requirements`
- `tool_images`

User scoping:

- Every user-owned table should have `user_id uuid not null references app_users(id)`.
- If workshops remain separate, user-owned tables may also have `workshop_id uuid references workshops(id)`.
- Queries should always filter by `user_id`.
- Project child tables should include both `user_id` and `project_id` or join through a user-scoped parent.

Useful constraints:

- `app_users`: unique `(auth_provider, auth_user_id)`.
- `workshops`: index `(user_id)`.
- `user_tools`: index `(user_id, archived_at)`.
- `materials`: index `(user_id, archived_at)`.
- `projects`: index `(user_id, status, archived_at)`.
- `project_requirements`: index `(user_id, project_id)`.
- `wishlist_items`: index `(user_id, status, priority)`.
- `mastery_progress`: unique `(user_id, guide_id, user_tool_id)` where practical.
- `xp_events`: index `(user_id, awarded_at)`.
- `notifications`: index `(user_id, status, updated_at)`.
- Reference tables should have stable IDs or slugs.

Migrations:

- Use Netlify Database migrations.
- Migrations should be created by the Netlify Database CLI or the current Netlify-recommended workflow.
- Do not hand-edit production database state outside migrations.
- Keep migrations small and reviewable.
- Include indexes and constraints in the same migration or a clearly paired migration.
- Do not migrate secrets.

Preview database branches:

- Use Netlify deploy previews for schema and API work.
- Preview database branches should protect production data from test writes.
- Be aware that preview branches may start as a copy of production data.
- Use test accounts for preview QA.
- Avoid destructive preview tests on real owner data even though preview writes should be isolated.

Production data protection:

- Only `main` should deploy to production.
- Only production deploys should access the main Netlify Database branch.
- Keep database migrations behind PR review.
- Avoid running reset commands against production.
- Never expose database connection strings to frontend code or logs.

## 6. Data Access Layer

Because BenchOS is currently a Vite static SPA, the safest production backend layer is Netlify Functions.

Recommended architecture:

```text
React UI -> typed API client -> Netlify Functions -> Netlify Database
```

Rules:

- Frontend must not connect directly to Netlify Database.
- Frontend must not receive `DATABASE_URL`.
- Frontend must not receive database usernames/passwords.
- Every Netlify Function must require a valid authenticated user.
- Every database query must filter by the authenticated app user.
- Shared services/hooks should replace direct Dexie/demo access.
- Mutations should happen through API calls, not direct browser database writes.

Suggested folders:

```text
netlify/functions/api/*
src/lib/api/*
src/lib/auth/*
src/data/serverHooks/* or src/data/hooks.ts replacement layer
```

API shape:

- `GET /api/session/me`
- `GET /api/dashboard`
- `GET /api/tool-catalog`
- `GET /api/user-tools`
- `POST /api/user-tools`
- `PATCH /api/user-tools/:id`
- `GET /api/materials`
- `POST /api/materials`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects/:id/requirements`
- `GET /api/wishlist`
- `POST /api/wishlist`
- `POST /api/wishlist/:id/purchased`
- `POST /api/wishlist/:id/convert`
- `GET /api/mastery`
- `POST /api/mastery/:guideId/start`
- `POST /api/mastery/:guideId/steps/:stepId/complete`

Implementation note:

- The Code Editor should confirm the current Netlify Database package/API before coding.
- If `@netlify/database` or another package is required, stop and get explicit owner approval before installing.

## 7. Local Mode Removal Plan

Remove or replace as production behavior:

- `LocalModePage` as a production path.
- `enterLocalMode()` as a production login bypass.
- "Continue in Local Mode" buttons.
- "Local Mode still works" copy.
- "Local-first" production status copy.
- `defaultAuthSessionState` as an app login state.
- `defaultUserProfile` and `defaultWorkshopProfile` as production user records.
- Auto-loading `starterUserTools`, `starterMaterials`, `starterProjects`, `starterWishlistItems`, and `starterMasteryProgress`.
- `includeSampleData` defaulting to `true`.
- `useSeedDatabase()` as production startup behavior.
- Dexie as the production source for user-owned data.
- Import/export/reset sample data as core production controls until redesigned around authenticated accounts.
- Hardcoded `Titus` fallback in UI and onboarding.

What can remain:

- Test fixtures.
- Static or database-backed shared tool catalog data.
- Static or database-backed project templates.
- Sample data files if they are not automatically loaded.
- Dev-only seed scripts that never run automatically in production.
- UI preferences in browser storage.
- Dexie/fake-indexeddb in tests only, if useful.
- Optional backup/export later, if it exports authenticated database data intentionally.

Suggested treatment of the Tool Library:

- Keep a shared production catalog.
- Do not treat catalog records as a user's personal data.
- A new user can see the catalog but should have empty inventory, projects, wishlist, and mastery progress.

## 8. Migration Plan

Phase 1: Audit and disable auto-login/demo defaults

- Remove `Titus` fallback behavior from production UI.
- Stop treating Local Mode as a valid production state.
- Change automatic seed behavior so personal/sample data is not loaded by default.
- Keep shared catalog/reference data available only if it is clearly product catalog data.
- Update tests to reflect mandatory auth expectations.

Phase 2: Add mandatory auth guard

- Add session loading state.
- Add protected route wrapper.
- Redirect unauthenticated users to login.
- Keep only login/signup/reset routes public.
- Remove Local Mode route from production navigation.
- Logout should return to login.

Phase 3: Add Netlify Database schema/migrations

- Initialize Netlify Database workflow after owner approval.
- Create migrations for app user and user-owned tables.
- Add constraints and indexes.
- Add optional shared reference/catalog tables or plan catalog import separately.

Phase 4: Add server/API data layer

- Add Netlify Functions.
- Validate Supabase Auth session server-side.
- Map auth identity to `app_users`.
- Add typed frontend API client.
- Handle API errors and session expiration consistently.

Phase 5: Migrate app screens from local/demo data to database-backed data

- Replace Dexie reads/writes page by page.
- Start with dashboard shell and account/session.
- Then My Tools.
- Then Materials.
- Then Projects and requirements.
- Then Wishlist and purchase conversion.
- Then Mastery/XP.
- Then diagnostics/readiness/workshop score.

Phase 6: Add empty states for new users

- Empty dashboard.
- Empty inventory.
- Empty projects.
- Empty wishlist.
- Empty mastery progress.
- Clear calls to action.

Phase 7: Add optional starter/demo data import

- Add a clearly labeled "Load sample starter setup" action.
- Require confirmation.
- Mark imported sample records as user-owned and optional.
- Do not run this automatically.

Phase 8: Testing/deployment verification

- Test locally.
- Test Netlify preview.
- Test production after merge.
- Confirm preview DB branch behavior.
- Confirm production data is not mutated by preview actions.

## 9. UI/UX Requirements

Required screens/states:

- Login screen.
- Signup screen if signup remains enabled.
- Password reset screen if Supabase password auth remains enabled.
- Logout action.
- Session loading state.
- Unauthenticated redirect state.
- Expired session message.
- Empty dashboard for new users.
- Empty My Tools state.
- Empty Projects state.
- Empty Wishlist state.
- Empty Materials state.
- Empty Tool Mastery progress state.
- Database loading state.
- Database error state.
- Offline/network error state.
- Optional starter data confirmation modal.

Content rules:

- No "Local Mode" as a production promise.
- No "Titus" placeholder identity.
- No fake workshop names.
- Empty states should say what the user can do next.
- Sample data must be labeled as sample/demo and opt-in.

## 10. Security Rules

Security rules:

- Never expose `DATABASE_URL` to browser code.
- Never expose Netlify database credentials to browser code.
- Never commit `.env` files.
- Never commit secret keys.
- Never put a Supabase service-role key in frontend code.
- Every API request for app data must require an authenticated user.
- Every user-owned query must filter by authenticated `user_id`.
- Never trust a `user_id` passed from the browser.
- Derive user identity server-side from the verified auth token/session.
- Keep production and preview environment behavior explicit.
- Review migrations before merge.
- Avoid hardcoded admin/user accounts.
- Avoid hidden production bypasses.
- Do not log auth tokens or database URLs.
- Be careful with preview branches because they may copy production data into an isolated preview database.

## 11. Files Likely To Change

Likely files to inspect or modify:

- `package.json`: may need Netlify Database/server dependency after explicit approval.
- `package-lock.json`: changes only if dependency installation is approved.
- `netlify.toml`: may need functions settings or environment notes.
- `netlify/functions/*`: new server/API functions.
- `src/App.tsx`: currently seeds local data before routes; must move to auth/session bootstrap.
- `src/app/routes.tsx`: needs mandatory auth guard and route changes.
- `src/lib/auth/supabaseClient.ts`: auth config and session retrieval need production review.
- `src/lib/auth/authService.ts`: should become mandatory auth service and remove local fallback assumptions.
- `src/features/auth/AuthPages.tsx`: remove Local Mode copy/buttons and make login production entry.
- `src/features/auth/AccountOnboardingPage.tsx`: remove Titus/local defaults and local mode button.
- `src/components/layout/TopBar.tsx`: remove Titus fallback and Local Mode UI.
- `src/data/hooks.ts`: currently reads Dexie directly; should move to API-backed hooks.
- `src/data/actions.ts`: currently writes Dexie directly; should move to API-backed mutations.
- `src/data/db.ts`: Dexie should no longer be production user-data source.
- `src/data/seed/seedDatabase.ts`: stop automatic personal sample data seeding.
- `src/data/seed/profiles.ts`: remove production default local profile/session usage.
- `src/features/dashboard/DashboardPage.tsx`: empty account state and API-backed data.
- `src/features/my-tools/MyToolsPage.tsx`: API-backed inventory and empty state.
- `src/features/materials/MaterialsPage.tsx`: API-backed materials and empty state.
- `src/features/projects/*`: API-backed projects/requirements/steps.
- `src/features/wishlist/WishlistPage.tsx`: API-backed wishlist/purchase conversion.
- `src/features/mastery/MasteryPage.tsx`: API-backed mastery progress.
- `src/features/settings/SettingsPage.tsx`: remove local-first production controls or relabel as account-safe tools.
- `src/lib/sync/*`: Supabase sync layer likely becomes obsolete for app data.
- `supabase/migrations/*`: keep for legacy/reference only unless Supabase data sync remains temporarily.
- `docs/NETLIFY_DEPLOYMENT.md`: update domain and production auth/database instructions.
- `README.md`: update production setup and remove local-only production framing.
- Tests in `src/**/*.test.ts*`: update from Local Mode/default data assumptions to mandatory auth/account data assumptions.

## 12. Risk Assessment

Low risk:

- Documentation updates.
- Removing visible `Titus` text fallback.
- Adding empty-state copy.
- Updating domain references from `app.benchos.com` to `appbenchos.com`.
- Adding route-level tests for unauthenticated redirects.

Medium risk:

- Making auth mandatory.
- Removing Local Mode navigation.
- Changing startup from local seed to session bootstrap.
- Disabling automatic sample data.
- Updating account onboarding defaults.
- Introducing API client hooks while preserving UI behavior.

High risk:

- Replacing Dexie as the production data source.
- Adding Netlify Database migrations.
- Adding Netlify Functions and server-side auth validation.
- Migrating all CRUD flows to server APIs.
- Preserving readiness/workshop score behavior while changing data source.
- Ensuring preview deployments cannot corrupt production data.
- Handling session expiration and token validation correctly.

Biggest breakage risks:

- Users get stuck in login/onboarding loop.
- App pages render before session is known.
- Dashboard assumes seeded data exists.
- Readiness and diagnostics assume local arrays are always loaded.
- API queries forget `user_id` filters.
- Netlify Functions cannot access database env vars because env scope is wrong.
- Netlify preview uses production auth but isolated database branch, causing confusing test results.

## 13. Testing Plan

Manual testing checklist:

1. Visit `https://appbenchos.com` logged out.
2. Verify login/register is shown first.
3. Try direct route `/tool-library`.
4. Verify unauthenticated user redirects to login.
5. Try direct route `/projects`.
6. Verify no dashboard access without login.
7. Create a new account or log in.
8. Verify account starts empty.
9. Verify no Titus name appears.
10. Verify no starter inventory appears.
11. Verify no starter projects appear.
12. Verify no starter wishlist items appear.
13. Verify Tool Library catalog loads as shared product data.
14. Add a tool to inventory.
15. Add a material.
16. Add a project.
17. Add a project requirement.
18. Add a wishlist item.
19. Complete a purchase/convert flow.
20. Start or update Tool Mastery progress.
21. Refresh the page.
22. Verify data persists.
23. Logout.
24. Verify user returns to login.
25. Log back in.
26. Verify same user's data persists.
27. Log in as a second user.
28. Verify second user cannot see first user's tools/projects/materials/wishlist/XP.
29. Test expired/invalid session behavior.
30. Test network/database error state.
31. Test mobile layout.
32. Test Netlify deploy preview with a test account.
33. Verify preview writes do not affect production data.
34. Verify production data is not reset by migrations.
35. Verify no database credentials or secret keys appear in browser DevTools source.
36. Verify no secrets appear in Netlify deploy logs.

Automated checks:

```text
npm run lint
npm run test
npm run build
```

Additional tests to add:

- Unauthenticated route redirects.
- No auto-seeded personal data.
- New account empty state.
- API requires auth.
- API rejects user-supplied `user_id` spoofing.
- API filters by authenticated user.
- Wishlist conversion persists after refresh.
- Readiness works from server-loaded data.

## 14. Recommended Execution Order

Recommended Code Editor order:

1. Stop and resolve unrelated dirty worktree state before implementation.
2. Remove production `Titus` fallbacks.
3. Add mandatory auth guard and redirect behavior.
4. Remove Local Mode as a production route/action.
5. Disable automatic personal sample data seeding.
6. Keep or migrate shared catalog data as explicit reference data.
7. Add empty states for new users.
8. Add Netlify Database migration setup after owner approval.
9. Add server-side auth validation in Netlify Functions.
10. Add API layer for one vertical slice first: `user_tools`.
11. Convert My Tools to the API.
12. Convert Materials.
13. Convert Projects and requirements.
14. Convert Wishlist and purchase conversion.
15. Convert Mastery/XP.
16. Convert diagnostics/readiness/workshop score.
17. Add optional starter/demo data import.
18. Update docs.
19. Run full checks.
20. Test Netlify preview.
21. Merge only after owner approval.

Recommended first implementation slice:

```text
Mandatory login + no auto sample data + no Titus fallback + empty authenticated dashboard.
```

Reason:

- This proves the new production rule before touching every data feature.

## 15. Decision Points For Me

Owner decisions needed:

1. Keep Supabase Auth or choose another auth provider?
2. If keeping Supabase Auth, is browser-stored auth session acceptable, or do you require HttpOnly cookie-only sessions?
3. Should signup be open to anyone or invite-only during beta?
4. Is `appbenchos.com` production or beta?
5. Should deploy previews use the same Supabase Auth project or a separate preview auth project?
6. Should new users see the shared Tool Library catalog immediately?
7. Should optional starter/demo data exist at all?
8. If starter data exists, should it be a one-click import, onboarding choice, or admin-only tool?
9. Should any current local data be migrated into your account?
10. Should Supabase cloud sync be removed immediately or kept temporarily during transition?
11. Should project templates be shared catalog data or user-copyable starter data?
12. Should import/export remain available in production?
13. Should production migrations be reviewed manually before merge?
14. Should old Supabase migrations remain in the repo as legacy docs or be moved later?

Source notes:

- Netlify Database docs: https://docs.netlify.com/build/data-and-storage/netlify-database/
- Netlify Database CLI docs: https://docs.netlify.com/build/data-and-storage/netlify-database/cli/
- Netlify Functions docs: https://docs.netlify.com/build/functions/overview/
- Netlify Functions environment variable docs: https://docs.netlify.com/build/functions/environment-variables/
