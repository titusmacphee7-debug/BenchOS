# Task For Code Editor: Delete Account

Read `BENCHOS_DELETE_ACCOUNT_PLAN.md` before editing.

Implement the delete account feature in safe phases.

## Hard Rules

- Auth0 is the only production login provider.
- No Supabase Auth fallback.
- No local mode.
- No hardcoded Titus account.
- Do not expose secrets.
- Do not commit `.env` files.
- Do not run destructive Git commands.
- Do not delete another user's data.
- Do not rely on frontend-only deletion.
- Do not delete by email alone.
- Do not expose Auth0 Management API credentials or database credentials to browser code.

## Build

- Add Settings account danger-zone UI.
- Add destructive confirmation modal requiring exact `DELETE`.
- Offer export before delete.
- Add `/.netlify/functions/delete-account`.
- Verify Auth0 session/token server-side.
- Derive target user from verified Auth0 `sub`; do not accept target user ID from frontend.
- Delete user-scoped BenchOS database records.
- Delete Auth0 user through Auth0 Management API.
- Add `/account-deleted` confirmation page as a public route.
- Clear app session/cache and redirect after success.

## Backend

- Store Auth0 Management API credentials only in server environment variables.
- Use env variable names only in docs.
- Required names likely include `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_MANAGEMENT_CLIENT_ID`, `AUTH0_MANAGEMENT_CLIENT_SECRET`, `AUTH0_MANAGEMENT_AUDIENCE`, and Netlify Database configuration managed by Netlify.

## Safety

- Check typed confirmation on client and server.
- Prevent double-submit.
- Keep logs and errors non-sensitive.
- Treat recent Auth0 re-auth as recommended follow-up unless server-verifiable `auth_time` is implemented.

## Checks

- Run `npm run lint`.
- Run `npm run test`.
- Run `npm run build`.

## Summary

Create `CODE_EDITOR_DELETE_ACCOUNT_SUMMARY.md` with changed files, endpoint behavior, env variable names, risks, partial-failure handling, checks run, and follow-up tasks.

