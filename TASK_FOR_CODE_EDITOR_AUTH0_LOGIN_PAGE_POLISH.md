# Task For Code Editor: Auth0-Only Login + Premium Login Page Polish

Read `LOGIN_AUTH_PRODUCTION_PLAN.md` first.

## Goal

Make BenchOS production auth Auth0-only and redesign the login experience so it feels like a polished workshop command center for `appbenchos.com`.

## Hard Rules

- Do not expose secrets.
- Do not commit `.env` files.
- Do not use Supabase Auth fallback.
- Do not keep Supabase email/password UI.
- Do not keep Supabase magic-link UI.
- Do not keep Local Mode.
- Do not keep Titus/default account behavior.
- Preserve the BenchOS orange accent.
- Keep the design dark, premium, practical, and workshop-focused.
- Avoid cartoon styling and clutter.

## First Inspect

Run and summarize:

- `git status --short --branch`
- `package.json`
- `.env.example`
- `src/features/auth/AuthPages.tsx`
- `src/app/routes.tsx`
- `src/lib/auth/*`
- `src/App.tsx`
- `src/components/layout/TopBar.tsx`
- `src/data/seed/*`
- `README.md`
- `docs/AUTH0_SETUP.md`
- `docs/NETLIFY_DEPLOYMENT.md`

Do not include unrelated untracked planning files in the commit.

## Required Auth Changes

- Make Auth0 the only production login provider.
- Keep `@auth0/auth0-react`.
- Use Auth0 `loginWithRedirect` for login.
- Use Auth0 `loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })` for signup.
- Use Auth0 logout with `returnTo` set to the app origin.
- Remove Supabase auth functions, imports, UI, docs, env requirements, sync fallback, and package once no imports remain.
- Remove password reset route if it only exists for Supabase.
- Remove `VITE_SUPABASE_*` from production docs and `.env.example`.
- Keep only Auth0 public frontend config:
  - `VITE_AUTH0_DOMAIN`
  - `VITE_AUTH0_CLIENT_ID`
  - optional future `VITE_AUTH0_AUDIENCE`

## Required Login UI Changes

- Replace current generic split login with a minimal premium auth shell.
- No fake email/password inputs.
- No magic-link controls.
- No disabled fake auth options.
- Main CTA: `Continue with Auth0`.
- Signup CTA: `Create account with Auth0`.
- Add stronger BenchOS/workshop identity:
  - logo lockup
  - command-center headline
  - compact preview module
  - product outcome bullets
  - account-required/user-scoped data badge
- Use existing `Button`, `Card`, and `StatusPill` where practical.
- Add subtle grid/background/glow using CSS/Tailwind only.
- Make mobile stacked, readable, and not cramped.

## Required Copy

- Headline: `Your workshop command center starts here.`
- Subheadline: `Sign in to manage tools, projects, readiness, wishlist decisions, and BenchXP from one secure BenchOS account.`
- CTA: `Continue with Auth0`
- Security note: `Auth0 handles sign-in. BenchOS scopes workshop data to your authenticated account.`
- Empty account note: `New accounts start clean. Sample starter data can be added later only if you choose it.`

## Data Notes

- Do not implement full Netlify Database migration unless explicitly approved.
- Add or update docs noting that app data should be user-scoped by verified Auth0 identity through server/API functions.
- Do not expose database credentials to browser code.
- Keep automatic personal starter data disabled.

## Tests

Run:

- `npm run lint`
- `npm run test`
- `npm run build`

Add/update tests for:

- signed-out users redirect to login
- Local Mode route is unavailable
- Supabase login UI is absent
- Auth0 CTA is present
- no Titus text appears in production auth UI
- new accounts do not receive starter personal data automatically

## Summary

Create `CODE_EDITOR_AUTH0_LOGIN_PAGE_POLISH_SUMMARY.md` with:

- files changed
- Supabase removal completed
- Auth0-only behavior
- login UI changes
- docs/env changes
- tests run and results
- remaining database/user-scoping notes
- any owner actions needed in Auth0 or Netlify

## Commit Rule

Commit only if:

- checks pass
- no secrets are staged
- unrelated planning files are not staged
- no `.env` files are staged
