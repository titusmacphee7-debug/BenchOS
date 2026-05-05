# BenchOS Delete Account Plan

## Summary

BenchOS account deletion is an immediate hard-delete flow after explicit confirmation. The browser must never receive Auth0 Management API credentials or database credentials, and deletion must be scoped from the verified Auth0 subject on the server.

## Locked Decisions

- Delete policy: immediate hard delete after typed confirmation.
- Export: offer data export before deletion, but do not require it.
- Auth provider: Auth0 only.
- Database: current production persistence uses Netlify Database behind Netlify Functions.
- Deletion target: the currently authenticated Auth0 user only.
- Confirmation phrase: `DELETE`.

## Desired Flow

1. User opens `Settings`.
2. User finds `Account / Danger Zone`.
3. User clicks `Delete account`.
4. BenchOS shows a destructive modal explaining the irreversible action.
5. User may export data first.
6. User must type `DELETE`.
7. Frontend calls `DELETE /.netlify/functions/delete-account` with an Auth0 access token.
8. Server verifies the token and derives `auth0_sub`.
9. Server deletes only that user's BenchOS database records.
10. Server deletes the verified Auth0 user through the Auth0 Management API.
11. Frontend clears app-side session state and sends the user to `/account-deleted`.

## Required Server Environment Names

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

`AUTH0_MANAGEMENT_AUDIENCE` may be omitted if it is the standard `https://{AUTH0_DOMAIN}/api/v2/` value, but keeping it explicit in Netlify is clearer.

## Data Deleted

Delete user-owned server data by removing the matching `app_users` row for the verified `auth0_sub`. Current Netlify Database tables are designed to cascade from `app_users` and/or `workspaces`. Shared catalog, guide content, templates, and public reference data are not deleted.

Browser-local cleanup is privacy cleanup only. It is not production deletion.

## Auth0 Management API

The delete endpoint obtains a Management API access token server-side using a Machine-to-Machine application with the `delete:users` scope. It then calls the Auth0 user deletion endpoint for the verified `sub`. The frontend never supplies a target user id and deletion is never performed by email.

## Re-Auth Note

Auth0 recent re-auth is recommended for this dangerous action. It requires a `max_age`/`auth_time` flow and server-side validation. This pass documents it as a follow-up rather than pretending browser-only confirmation is equivalent.

## Partial Failure Handling

The endpoint returns a safe generic error if database deletion or Auth0 deletion fails. The current schema does not include a durable `deleting` status marker, so a future hardening pass can add deletion operation tracking if needed.

## Manual Owner Steps Before Production Use

- Create or use an Auth0 Machine-to-Machine app.
- Authorize it for the Auth0 Management API with `delete:users`.
- Add the server-only Management API env names in Netlify.
- Redeploy after env changes.
- Test with a non-important test Auth0 account first.

