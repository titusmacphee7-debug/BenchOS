# Code Editor Delete Account Summary

## What Changed

Implemented a server-side Auth0/Netlify Database delete-account foundation plus a Settings danger-zone UI for BenchOS v0.09.

## Files Changed For This Task

- `BENCHOS_DELETE_ACCOUNT_PLAN.md`
  - Created the implementation plan and safety notes for account deletion.
- `TASK_FOR_CODE_EDITOR_DELETE_ACCOUNT.md`
  - Created the execution task prompt for future agents.
- `.env.example`
  - Added server-only Auth0 Management API variable names.
- `docs/AUTH0_SETUP.md`
  - Documented the Auth0 Machine-to-Machine app requirement and `delete:users` scope.
- `docs/ENVIRONMENT_SETUP.md`
  - Documented server-only Management API env names.
- `docs/NETLIFY_DEPLOYMENT.md`
  - Added Netlify env setup and post-deploy delete modal test step.
- `netlify/functions/delete-account.mjs`
  - Added `DELETE /.netlify/functions/delete-account`.
  - Requires server-verified Auth0 access token.
  - Requires JSON confirmation value `DELETE`.
  - Deletes only the `app_users` row matching the verified Auth0 `sub`, with current Netlify Database cascades handling related user-owned rows.
  - Requests an Auth0 Management API token server-side and deletes the verified Auth0 user.
- `src/features/settings/SettingsPage.tsx`
  - Added Account / Danger Zone card.
  - Added export-before-delete option.
  - Added destructive modal requiring exact `DELETE`.
  - Calls the Netlify delete endpoint with an Auth0 access token.
  - Clears local app auth state and redirects to `/account-deleted` on success.
- `src/features/auth/AuthPages.tsx`
  - Added `AccountDeletedPage`.
- `src/app/routes.tsx`
  - Added public `/account-deleted` route for signed-out, onboarding, and signed-in route states.
- `src/lib/auth/BenchAuth0Provider.tsx`
  - Allowed optional Auth0 logout return paths for future use.
- `src/lib/auth/benchAuth0Context.ts`
  - Updated the logout type to accept an optional return path.
- `src/app/routes.test.tsx`
  - Added coverage that `/account-deleted` is public.
- `src/features/settings/SettingsPage.test.tsx`
  - Added coverage that final account deletion stays disabled until the typed confirmation is exactly `DELETE`.

## Endpoint Behavior

`DELETE /.netlify/functions/delete-account`

Required request:

```text
Authorization: Bearer <Auth0 access token>
Body: { "confirmation": "DELETE" }
```

Server behavior:

- Rejects non-DELETE methods.
- Rejects missing or incorrect typed confirmation.
- Verifies the Auth0 token using the existing `requireAuth` helper.
- Uses only the verified Auth0 `sub` as the deletion target.
- Does not accept user IDs or email addresses from the browser.
- Deletes user-owned BenchOS database records by deleting the matching `app_users` row.
- Calls Auth0 Management API to delete the same Auth0 user.

## Env Variables By Name Only

Frontend/public:

```text
VITE_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID
VITE_AUTH0_AUDIENCE
```

Server-only:

```text
AUTH0_DOMAIN
AUTH0_AUDIENCE
AUTH0_MANAGEMENT_CLIENT_ID
AUTH0_MANAGEMENT_CLIENT_SECRET
AUTH0_MANAGEMENT_AUDIENCE
```

## Checks Run

```text
npm run lint
```

Result: passed.

```text
npm run test
```

Result: passed. 17 test files passed, 82 tests passed.

```text
npm run build
```

Result: passed. Existing Vite chunk-size warning remains for the main JS chunk.

## Remaining Warnings / Risks

- Auth0 Management API deletion will not work until the server-only Management API env vars are configured in Netlify.
- The Auth0 Machine-to-Machine app needs the `delete:users` Management API scope.
- Recent Auth0 re-auth is documented as recommended but not enforced in this pass.
- If database deletion succeeds but Auth0 deletion fails, the current schema has no durable `deleting` marker. A future hardening pass can add operation tracking.
- The worktree had unrelated dirty changes before this task, including cleanup/docs/data-file changes and version-file changes. Those were not reverted.
- Build still shows the existing large main chunk warning.

## Version / Commit / Push Status

- Version bumped from `v0.08` to `v0.09` for the owner-approved push.
- Commit and push are approved by the owner for this pass.

## Recommended Next Step

Configure a test Auth0 Machine-to-Machine application in Auth0, add the server-only env vars in Netlify, deploy to a preview or safe environment, and test deletion with a throwaway Auth0 account before using it on an important account.
