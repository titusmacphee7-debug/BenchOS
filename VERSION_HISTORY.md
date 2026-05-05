# BenchOS Version History

## Version Rule

- Every committed app/source-code change must increase the visible BenchOS app version by `0.01`.
- The app version is tracked in `src/lib/version.ts`.
- The sidebar and Settings page read from that shared version file.
- `package.json` uses npm-safe semver, so app `v0.08` is represented as package version `0.0.8`.
- Coordinator, Planner, and implementation summaries should mention the current app version after each code-changing task.

## Current Version

```text
BenchOS v0.16
```

## History

### v0.16 - All-Tools Guide Foundation

- Added a scalable guide route system so all 1,641 seeded Tool Library catalog items can resolve to dedicated guide pages.
- Added catalog guide slug generation, collision handling, and content status metadata.
- Preserved tool-type guide compatibility through `/tool-guides/types/:toolTypeId`.
- Added catalog model context panels with honest missing-spec/source/status copy.
- Updated Tool Library, Tool Mastery, My Tools, and Wishlist guide links for the new route strategy.
- Added guide QA docs and tests for all catalog item route mappings.

### v0.15 - Performance And Loading Pass

- Reduced the startup `index` bundle by moving broad data hooks out of the route/auth shell.
- Deferred local catalog seed warmup until after the secure app shell is ready.
- Added a lightweight hammer loading reveal with reduced-motion support.
- Added route loading/error fallbacks and conservative Netlify/PWA caching headers.
- Added performance budget and implementation docs.

### v0.14 - Tool Mastery Command Center Redesign

- Redesigned Tool Mastery into a BenchXP command-center page with overall familiarity, category mastery, owned-tool familiarity, next-skill guidance, score explanation, practice prompts, and honest empty states.
- Upgraded Tool Guide detail pages with stronger guide hero, owned/not-owned state, quick reference, readiness connection, and skill dimension bars.
- Added Tool Mastery redesign plan, task, and implementation summary docs.
- Split production vendor chunks so the Vite build no longer emits the large chunk warning.

### v0.13 - Stale Local Demo Cleanup

- Removed unused local/demo-era components, mock data files, and unreachable local onboarding page.
- Removed an obsolete local onboarding status hook.
- Made a few internal helper exports private.
- Updated cleaner and design-system docs to match the cleanup.

### v0.12 - BenchXP Button Interaction Fix

- Made Tool Mastery guide buttons open the full guide experience instead of only selecting the current row.
- Replaced the passive search-side tab button with a visible result count.
- Moved the next BenchXP action higher in the guide detail panel.
- Added visible success feedback for guide confidence, practice, mistake, maintenance, and favorite actions.

### v0.11 - Server-Backed BenchXP Upgrade

- Added Auth0-verified BenchXP API persistence through Netlify Functions.
- Added Netlify Database tables for guide progress, XP evidence, practice logs, confidence check-ins, mistake logs, maintenance logs, favorite guides, roadmap progress, and readiness preferences.
- Connected Tool Mastery, Tool Guides, Dashboard, Projects, Project Templates, My Tools, and Wishlist to server-backed BenchXP signals.
- Added Balanced Warning readiness confidence without hard-blocking projects.
- Preserved BenchXP as familiarity/readiness guidance, not certification.

### v0.10 - Netlify Database Runtime Connection Fix

- Updated the Netlify Function database helper to accept both `NETLIFY_DB_URL` and `NETLIFY_DATABASE_URL`.
- Added support for reading Function runtime variables through `Netlify.env.get` with a safe `process.env` fallback.
- Improved the bootstrap database error copy so it points to a runtime connection issue instead of only missing setup.
- Preserved Auth0-only production auth and did not expose database credentials.

### v0.09 - Delete Account Foundation

- Added Settings Account / Danger Zone delete-account UI.
- Added typed `DELETE` confirmation and export-before-delete prompt.
- Added public `/account-deleted` page.
- Added server-side Netlify Function for Auth0-verified account deletion.
- Documented server-only Auth0 Management API env names and `delete:users` requirement.
- Preserved Auth0-only production auth and did not expose secrets.

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
