# BenchOS Version History

## Version Rule

- Every committed app/source-code change must increase the visible BenchOS app version by `0.01`.
- The app version is tracked in `src/lib/version.ts`.
- The sidebar and Settings page read from that shared version file.
- `package.json` uses npm-safe semver, so app `v0.08` is represented as package version `0.0.8`.
- Coordinator, Planner, and implementation summaries should mention the current app version after each code-changing task.

## Current Version

```text
BenchOS v0.08
```

## History

### v0.08 - Auth0 Production, Onboarding, And Tool Mastery Foundation

- Made production auth Auth0-only and removed Supabase/local-mode production fallback paths.
- Added Netlify Database-backed onboarding/API foundation for first-run workspace setup.
- Polished the login page into a focused Auth0 workshop access screen.
- Added premium onboarding mission UI and empty-workspace setup flow.
- Added structured Tool Mastery guide content, guide depth modes, BenchXP familiarity language, and guide philosophy docs.
- Preserved the BenchOS orange accent and did not expose secrets.

### v0.07 - Remove Stale Auth0 Setup Warning

- Removed the hardcoded Auth0 dashboard setup reminder from the login and sign-up panels now that Auth0 is configured and working.
- Preserved the prior mixed Auth0/fallback routing behavior before the later Auth0-only pass.

### v0.06 - HTTPS Browser Hardening

- Added Netlify security headers for deployed pages.
- Added `upgrade-insecure-requests` and `block-all-mixed-content` to reduce browser mixed-content warnings.
- Added `Referrer-Policy` and `X-Content-Type-Options` hardening.
- Preserved app behavior and routing.

### v0.05 - Auth0 React SDK Login

- Installed the official `@auth0/auth0-react` SDK.
- Wrapped the React app in Auth0Provider.
- Added Auth0 Universal Login buttons to the sign-in and sign-up pages.
- Bridged Auth0 signed-in users into the existing BenchOS local auth gate.
- Kept the then-existing fallback auth path available for the older sync flow.
- Pinned Vite local development to port `5173` with `--strictPort` to prevent Auth0 callback mismatch surprises.

### v0.04 - Remove Unused Starter Assets

- Deleted approved unused asset files:
  - `public/icons.svg`
  - `src/assets/hero.png`
- Preserved current app behavior.
- No routes, schema, auth, or dependencies changed.

### v0.03 - Mandatory Auth Shell

- Added mandatory login routing.
- Disabled the production Local Mode route.
- Removed visible Local Mode bypass copy and actions.
- Removed hardcoded `Titus` production fallbacks.
- Disabled automatic personal sample data seeding.
- Updated deployment docs for `appbenchos.com`.
- Commit range:
  - `6c1c519` mandatory auth implementation.
  - version tracking commit follows this history entry.

### v0.02 - Tool Library/Core Loop Baseline

- Existing visible app version before the mandatory auth shell.
- Tool Library, inventory, projects, readiness, wishlist, and mastery loop were already present.
