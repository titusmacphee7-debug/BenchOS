# BenchOS Version History

## Version Rule

- Every committed app/source-code change must increase the visible BenchOS app version by `0.01`.
- The app version is tracked in `src/lib/version.ts`.
- The sidebar and Settings page read from that shared version file.
- `package.json` uses npm-safe semver, so app `v0.06` is represented as package version `0.0.6`.
- Coordinator, Planner, and implementation summaries should mention the current app version after each code-changing task.

## Current Version

```text
BenchOS v0.06
```

## History

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
- Kept Supabase Auth available for the existing sync fallback.
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
