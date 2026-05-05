# BenchOS Premium Onboarding Plan

## Summary

BenchOS onboarding becomes a premium "Workshop Setup Mission" that runs only after valid Auth0 login and treats server-verified Postgres data as the production source of truth.

Locked decisions:

- Auth0 is the only production auth provider.
- Netlify Database is used for production app data.
- Netlify Database provides managed Postgres, automatic deploy migrations, and preview database branches.
- Netlify remains valid for hosting and Functions/API.
- No production local mode, hidden dev login, hardcoded user, automatic demo inventory, or browser-local production app data.
- Users may skip onboarding into an empty command center with setup missions.
- Demo data may exist only as explicit, labeled, removable demo data.

## Current App State

- Vite + React + TypeScript + Tailwind + React Router.
- npm package manager.
- Auth0 React SDK is installed and wired through the BenchOS Auth0 provider/context.
- Route gating sends signed-out users to `/login`.
- Signed-in users without completed setup currently route to `/account-onboarding`.
- User-owned app data still has local Dexie-era IDs such as `local-session`, `local-user`, and `local-workshop`.
- Sample personal data is not loaded automatically.

## Target Journey

Auth0 login -> secure boot sequence -> workshop profile -> setup path selection -> goals -> brands/platforms -> optional first tools -> optional project goals -> skill baseline -> optional wishlist strategy -> optional demo workspace -> command center unlocked.

Emotional target:

- Premium, dark, practical, workshop-focused.
- Feels like BenchOS is building a personal command center.
- Serious, not childish.
- Fast value without fake data.
- No forced long form.

## Onboarding Paths

- Quick Start: 60-90 seconds; workshop type, goals, brands/platforms; then empty dashboard plus setup missions.
- Guided Setup: default; 3-5 minutes; profile, goals, skill, platforms, first tools, project goals, readiness preview.
- Power Setup: deeper setup; workspace details, materials preference, budget/wishlist strategy, maintenance/upgrade interest.

Skip to Command Center must remain available after secure workspace creation.

## Command Center Boot Sequence

Show a fast initialization:

- Creating secure BenchOS workspace
- Preparing inventory system
- Loading project readiness engine
- Setting up BenchXP profile
- No starter data added automatically

Technical requirements:

- Verify Auth0 token server-side.
- Call server/API bootstrap endpoint.
- Create or fetch user row by Auth0 `sub`.
- Create empty primary workspace/profile/onboarding state.
- Do not create tools, projects, materials, wishlist, XP, or sample records.
- On error, show retry and sign-out options.

## First-Run Welcome Copy

Headline: `Build your workshop command center.`

Subheadline: `BenchOS connects your tools, projects, readiness, wishlist, and skills so your shop becomes measurable without fake starter data.`

Value cards:

- Map what you own
- See what you can build
- Turn gaps into smarter buys

Primary CTA: `Start Guided Setup`

Secondary CTA: `Skip to Empty Command Center`

Trust note: `Your workspace starts empty. Demo data is never added unless you choose it.`

## Data Model

Create server-side, user-scoped Postgres tables:

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

All rows scope by server-derived authenticated user ID, never client-supplied user ID.

## Backend Strategy

- Netlify Functions host the API.
- Netlify Database stores app data.
- Netlify provisions and connects the managed Postgres database during the deploy workflow.
- Auth0 JWTs are verified server-side with JWKS.
- Frontend attaches an Auth0 access token to API calls.
- Preview deploys should use a preview/staging database.
- Migrations are versioned in the repo.

## Public API Capabilities

- `POST /.netlify/functions/bootstrap-user`
- `GET /.netlify/functions/onboarding`
- `PUT /.netlify/functions/onboarding`
- `POST /.netlify/functions/onboarding-complete`
- `POST /.netlify/functions/sample-data`
- `DELETE /.netlify/functions/sample-data`

## UI Direction

- Dark command-center background.
- Subtle grid/workbench pattern.
- BenchOS orange accent glow.
- Strong cards, not nested-card clutter.
- Progress rail.
- Practical lucide icons.
- Small readiness meters and setup mission cards.
- Mobile stacked layout with sticky CTA/progress.
- Visible focus rings and accessible labels.

Avoid:

- Cartoon graphics.
- Busy gamification.
- Generic blue SaaS styling.
- Fake numbers or fake inventory.

## Initial Implementation Scope

This execution pass should implement the first production-ready slice:

1. Create the plan/task docs.
2. Add Netlify Database migrations for server-owned onboarding data.
3. Add Netlify Functions for Auth0-verified bootstrap, onboarding save/fetch/complete, and explicit sample-data tracking.
4. Add frontend Auth0 access token support and an API client.
5. Replace the basic account onboarding form with a premium Workshop Setup Mission shell.
6. Allow server-confirmed skip/complete to unlock the command center.
7. Keep demo data opt-in only.
8. Update docs/env names.
9. Run lint, test, and build.

Full app-data migration from Dexie inventory/projects/materials to Postgres is a later, high-risk phase. Browser-local data must not be documented as production truth.
