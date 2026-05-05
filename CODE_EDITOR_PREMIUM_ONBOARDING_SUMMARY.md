# Code Editor Premium Onboarding Summary

## What Plan Was Executed

Implemented the first production-ready slice of the BenchOS Premium Onboarding plan:

- Premium Auth0-protected "Workshop Setup Mission" onboarding.
- Server/API bootstrap path.
- Netlify Database migrations for onboarding/workspace data.
- Auth0 token attachment from the frontend.
- Server-side Auth0 token verification in Netlify Functions.
- Explicit sample/demo tracking only; no automatic demo inventory.

Owner instruction honored:

- No commit.
- No push.
- No version bump.
- Current app/package version remains `v0.07` / `0.0.7`.

## Important Direction Change

The original plan said not to use Netlify Database and to expect a server-side `DATABASE_URL`.

The owner clarified:

> in that case just use the netlify database

Implementation was changed accordingly:

- Added `@netlify/database`.
- Moved the onboarding migration to `netlify/database/migrations/`.
- Removed the raw `DATABASE_URL` assumption from docs and server code.
- Netlify Database still must be initialized for the site before deployed onboarding persistence works.

Official Netlify docs used:

- https://docs.netlify.com/build/data-and-storage/netlify-database/
- https://docs.netlify.com/build/data-and-storage/netlify-database/getting-started/
- https://docs.netlify.com/build/data-and-storage/netlify-database/migrations/
- https://docs.netlify.com/build/data-and-storage/netlify-database/api/

## Files Created

- `BENCHOS_PREMIUM_ONBOARDING_PLAN.md`
  - Captures the premium onboarding direction, updated to Netlify Database.

- `TASK_FOR_CODE_EDITOR_PREMIUM_ONBOARDING.md`
  - Execution task file for future Code Editor runs, updated to Netlify Database.

- `netlify/database/migrations/0001_auth0_onboarding.sql`
  - Creates server-owned onboarding/workspace tables:
    - `app_users`
    - `workspaces`
    - `onboarding_state`
    - `user_goals`
    - `workshop_preferences`
    - `user_tool_platforms`
    - `user_project_goals`
    - `user_skill_profile`
    - `setup_missions`
    - `sample_data_batches`
    - `dashboard_preferences`

- `netlify/functions/_shared/auth.mjs`
  - Verifies Auth0 bearer tokens with JWKS.

- `netlify/functions/_shared/db.mjs`
  - Uses `@netlify/database` and a database pool transaction helper.

- `netlify/functions/_shared/onboardingStore.mjs`
  - Creates/fetches authenticated app user, primary workspace, onboarding state, setup missions, and sample batch tracking.

- `netlify/functions/_shared/responses.mjs`
  - Shared JSON/error helpers.

- `netlify/functions/bootstrap-user.mjs`
  - `POST` endpoint for Auth0-verified workspace bootstrap.

- `netlify/functions/onboarding.mjs`
  - `GET` and `PUT` endpoint for onboarding state.

- `netlify/functions/onboarding-complete.mjs`
  - `POST` endpoint to complete or skip onboarding.

- `netlify/functions/sample-data.mjs`
  - `POST`/`DELETE` endpoint for explicit sample/demo batch tracking.

- `src/lib/api/benchApi.ts`
  - Frontend API helper that attaches Auth0 access tokens.

- `src/lib/onboarding/onboardingTypes.ts`
  - Shared onboarding frontend types.

- `src/lib/onboarding/onboardingCache.ts`
  - Local route-cache helper used only after server-confirmed completion/skip.

## Key Files Changed

- `src/features/auth/AccountOnboardingPage.tsx`
  - Replaced the basic form with the premium Workshop Setup Mission:
    - secure boot sequence
    - welcome screen
    - Quick / Guided / Power setup paths
    - workshop profile
    - goals
    - platforms
    - first-tools setup guidance
    - project goals
    - BenchXP baseline
    - wishlist strategy
    - explicit demo data choice
    - summary/unlock screen
  - Shows clear setup error if Netlify Database is not initialized.

- `src/lib/auth/auth0Config.ts`
  - Added optional `VITE_AUTH0_AUDIENCE`.

- `src/lib/auth/benchAuth0Context.ts`
  - Added `getAccessToken()`.

- `src/lib/auth/BenchAuth0Provider.tsx`
  - Passes Auth0 audience when configured.
  - Exposes `getAccessTokenSilently`.

- `.env.example`
  - Added:
    - `VITE_AUTH0_AUDIENCE`
    - `AUTH0_DOMAIN`
    - `AUTH0_AUDIENCE`
  - No real values.

- `README.md`
  - Updated data direction to Netlify Functions + Netlify Database.

- `docs/ENVIRONMENT_SETUP.md`
  - Updated env and data guidance for Netlify Database.

- `docs/NETLIFY_DEPLOYMENT.md`
  - Added Netlify Database initialization instructions.
  - Added post-deploy checks for onboarding bootstrap.

- `src/app/routes.test.tsx`
  - Updated the signed-in incomplete account route expectation to the new onboarding heading.

- `package.json` / `package-lock.json`
  - Added `@netlify/database`.
  - Added `jose`.
  - Version left unchanged at `0.0.7`.

## Dependencies Added

- `@netlify/database`
  - Used by Netlify Functions to access Netlify Database.

- `jose`
  - Used by Netlify Functions to verify Auth0 JWTs against JWKS.

No secret values were added.

## Auth/Database Notes

- Browser code does not receive database credentials.
- Frontend uses Auth0 access tokens.
- Netlify Functions verify Auth0 tokens server-side.
- Database rows are scoped by server-derived Auth0 subject mapped to `app_users`.
- Netlify Database must still be initialized for the Netlify site before this works in production.

Required Auth0/API env names:

```text
VITE_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID
VITE_AUTH0_AUDIENCE
AUTH0_DOMAIN
AUTH0_AUDIENCE
```

Netlify Database setup still required:

```bash
netlify database init
```

Or use the Netlify UI Database page to create the database, then deploy so migrations run.

## Demo Data Policy

- No demo data is created automatically.
- The onboarding UI has explicit choices:
  - keep workspace empty
  - add one sample project
  - explore full demo workspace
- The API currently creates sample batch tracking only. Real sample records should be added in a later explicit pass and remain labeled/removable.

## Commands Run

```bash
npm install pg jose
npm uninstall pg
npm install @netlify/database
npm run lint
npm run test
npm run build
git diff --check
node --check netlify/functions/**/*.mjs
```

## Command Results

- `npm install pg jose`: passed.
- `npm uninstall pg`: passed.
- `npm install @netlify/database`: passed.
- `npm run lint`: passed.
- `npm run test`: passed; 15 test files, 75 tests.
- `npm run build`: passed.
- `git diff --check`: passed; Windows LF-to-CRLF warnings only.
- Netlify Function syntax checks: passed.

## Remaining Warnings / Risks

- Netlify Database is not initialized from this local code change. It must be created in Netlify before deploy persistence works.
- Auth0 API audience must be configured in Auth0 and Netlify env vars.
- Full inventory/projects/materials migration from Dexie to Netlify Database is not done in this pass.
- Existing app pages still read existing local Dexie tables for inventory/project features. This pass moves onboarding/workspace bootstrap server-side first.
- Vite still warns that one built chunk is larger than 500 kB. Build still passes.
- Worktree remains uncommitted and unpushed by owner request.

## Recommended Next Step

Initialize Netlify Database for the BenchOS Netlify site, configure the Auth0 API audience, then ask Code Editor to commit/push when ready. At that point, decide whether to bump the version.
