# Task For Code Editor: Mandatory Login + Netlify Database

You are the BenchOS Code Editor.

Read this first:

```text
AUTH_DATABASE_PRODUCTION_PLAN.md
```

## Goal

Convert BenchOS toward a real production app for:

```text
appbenchos.com
```

Production rules:

- Login is mandatory.
- No dashboard/app access without authentication.
- No hardcoded Titus account or Titus display fallback.
- No automatic personal demo/sample data.
- No Local Mode as the production app experience.
- No browser-local production source for core user data.
- User data must be authenticated and user-scoped.
- Netlify Database must be the planned production app data store.
- Database access must happen server-side through Netlify Functions or another safe backend layer.
- Never expose database credentials to the browser.

## Hard Rules

- Do not expose secrets.
- Do not print `.env` values.
- Do not commit `.env`, `.env.local`, `.env.production`, or any secret file.
- Do not expose `DATABASE_URL`.
- Do not put Netlify Database credentials in frontend code.
- Do not put Supabase service-role keys in frontend code.
- Do not run destructive Git commands.
- Do not delete files unless the owner approves the exact deletion.
- Do not refactor unrelated code.
- Do not redesign the app.
- Preserve the orange BenchOS accent.
- Preserve the core loop.

## First Inspect

Before editing, inspect and summarize:

```bash
git status --short --branch
git remote -v
```

Also inspect:

- `AUTH_DATABASE_PRODUCTION_PLAN.md`
- `package.json`
- `.gitignore`
- `netlify.toml`
- `src/App.tsx`
- `src/app/routes.tsx`
- `src/lib/auth/*`
- `src/features/auth/*`
- `src/data/hooks.ts`
- `src/data/actions.ts`
- `src/data/db.ts`
- `src/data/seed/*`
- `src/lib/sync/*`
- `docs/NETLIFY_DEPLOYMENT.md`

If unrelated changes are present, stop and ask the owner or Coordinator before editing.

Known current dirty state from Planner pass:

```text
D  public/icons.svg
D  src/assets/hero.png
```

Do not restore, delete, stage, or commit those unless the owner explicitly approves.

## Implementation Phases

### Phase 1: Mandatory Auth Shell

Implement first:

- Add a protected route/auth guard.
- Only login/signup/reset routes should be public.
- Redirect unauthenticated users to login.
- Add session loading state.
- Logout returns to login.
- Refresh keeps a valid session.
- Expired/invalid session returns to login.
- Remove or disable Local Mode as a production path.
- Remove "Continue in Local Mode" buttons and production copy.
- Remove Titus fallback from:
  - `src/components/layout/TopBar.tsx`
  - `src/features/auth/AuthPages.tsx`
  - `src/features/auth/AccountOnboardingPage.tsx`
  - `src/data/actions.ts`

### Phase 2: Disable Automatic Personal Sample Data

Implement:

- Stop automatic seeding of personal inventory/projects/materials/wishlist/mastery progress.
- New authenticated users should start empty.
- Shared Tool Library/catalog may remain only as product reference data.
- Sample/demo personal setup must be opt-in only.
- Do not automatically mark onboarding complete because sample data exists.
- Update tests that currently expect Local Mode or seeded personal data.

### Phase 3: Netlify Database Preparation

Implement only after confirming required package/tooling.

If Netlify Database requires a package that is not installed, stop and request explicit package-install approval before installing.

Prepare:

- Netlify Database migration folder using the current Netlify-recommended layout.
- Initial migration for user-scoped production tables.
- Server-only database access utilities.
- No database credentials in frontend code.

Tables to include or plan:

- `app_users`
- `user_profiles`
- `workshops`
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
- shared catalog/reference tables if included in this phase

Every user-owned table must be scoped by authenticated user.

### Phase 4: Server/API Data Layer

Add Netlify Functions or the appropriate Netlify server layer for this Vite SPA.

Requirements:

- Validate authenticated user on every request.
- Map Supabase auth user ID to Netlify Database `app_users`.
- Never trust a `user_id` from the browser.
- Filter all reads/writes by authenticated user.
- Return clear 401/403/500 responses.
- Add a typed frontend API client.

Start with one vertical slice:

```text
My Tools / user_tools
```

Then continue:

1. Materials
2. Projects and requirements
3. Wishlist and purchase conversion
4. Mastery/XP
5. Dashboard/readiness/diagnostics

### Phase 5: Empty States

Add or verify empty states:

- Empty dashboard.
- Empty My Tools.
- Empty Materials.
- Empty Projects.
- Empty Wishlist.
- Empty Tool Mastery progress.
- Database error state.
- Network/offline error state.

No fake data should appear unless the user explicitly imports sample data.

### Phase 6: Optional Starter Data

If approved by owner:

- Add a clearly labeled "Load sample starter setup" action.
- Require confirmation.
- Store sample records as that authenticated user's records.
- Do not run sample setup automatically.

If not approved:

- Leave sample files as test/dev fixtures only.

### Phase 7: Docs

Update:

- `README.md`
- `docs/NETLIFY_DEPLOYMENT.md`
- Any auth/setup docs that still say Local Mode is the production fallback.

Docs must say:

- Production domain is `appbenchos.com`.
- Login is required.
- Netlify Database stores production app data.
- Supabase Auth is identity only if kept.
- Secrets stay out of GitHub and frontend code.
- Deploy previews should use safe test accounts.

## Testing

Run:

```bash
npm run lint
npm run test
npm run build
```

Add or update tests for:

- unauthenticated redirect
- mandatory login
- no Titus fallback
- no automatic personal sample data
- empty new account state
- API rejects unauthenticated requests
- API scopes data by authenticated user

Manual test:

- Visit `appbenchos.com` logged out.
- Verify login required.
- Verify no dashboard without login.
- Create/login account.
- Verify account starts empty.
- Add tool/project/wishlist item.
- Refresh.
- Verify data persists.
- Logout.
- Log back in.
- Verify data persists.
- Log in as second user.
- Verify first user's data is not visible.
- Test Netlify preview with a test account.
- Verify preview writes do not corrupt production data.

## Summary File

Create:

```text
CODE_EDITOR_AUTH_DATABASE_SUMMARY.md
```

Include:

- what changed
- files changed
- whether Netlify Database package/tooling was added
- migrations created
- API/functions created
- auth guard behavior
- how Local Mode was removed/disabled
- how sample data was disabled
- checks run
- check results
- remaining risks
- owner actions needed in Netlify/Supabase/GitHub

## Commit Rule

Commit only if:

- owner approved the implementation scope
- unrelated dirty changes were not included
- lint passes
- tests pass
- build passes
- no secrets are staged
- summary file is created

If checks fail:

- do not commit
- summarize the failure in `CODE_EDITOR_AUTH_DATABASE_SUMMARY.md`
- ask for review

## Do Not Do

- Do not edit unrelated files.
- Do not hide failing checks.
- Do not commit deleted files unless explicitly approved.
- Do not remove the shared Tool Library catalog unless explicitly approved.
- Do not expose env values.
- Do not use browser-local storage as production app data.
- Do not make Netlify Database client credentials available to React code.
