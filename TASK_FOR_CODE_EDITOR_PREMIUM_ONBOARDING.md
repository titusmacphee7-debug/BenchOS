# Task For Code Editor: Premium BenchOS Onboarding

Read `BENCHOS_PREMIUM_ONBOARDING_PLAN.md` before editing.

Implement the upgraded BenchOS onboarding in safe phases.

## Hard Rules

- Auth0 is the only production login provider.
- Use Netlify Database for production app data.
- Do not use Supabase Auth.
- Do not use local mode.
- Do not use Dexie, IndexedDB, or localStorage as production source of truth for app data.
- Do not keep automatic demo data.
- Do not keep Titus shortcuts or hardcoded user assumptions.
- Do not expose secrets.
- Do not commit `.env` files.
- Do not run destructive Git commands.
- Do not commit or push unless the owner explicitly asks.
- Keep the current version number unchanged unless the owner explicitly asks to push/bump.

## Database/Backend

- Prepare Netlify Database integration using `@netlify/database`.
- Put migrations under `netlify/database/migrations`.
- If Netlify Database provisioning cannot be completed from this repo, create migrations/API code and document exact provisioning steps.
- Add server/API functions that verify Auth0 tokens before reading/writing.
- Every query must scope rows to the authenticated Auth0 user.
- Preview deploys must not use production data.

## Implementation

- Create a premium onboarding route/shell after Auth0 login.
- Add first-login bootstrap.
- Add a tasteful Command Center Boot Sequence.
- Add Quick Start, Guided Setup, and Power Setup.
- Guided Setup should be the default recommendation.
- Allow Skip to an empty dashboard with setup missions.
- Persist onboarding/profile/goals/platform/project-goal/skill state server-side.
- Add workshop type, goals, tool platform, project goals, skill baseline, and wishlist strategy steps.
- Integrate first-tools setup as guidance without auto-adding tools in this pass.
- Make full demo data opt-in only, clearly labeled, and deletable.
- Preserve BenchOS orange accent and dark workshop-command-center style.
- Improve mobile layout and accessibility.

## Current Repo Warnings

- The worktree already contains uncommitted Auth0-only/fallback-removal changes. Do not revert them.
- Existing files still reference local IDs such as `local-session`, `local-user`, and `local-workshop`; production onboarding must move away from these as source of truth.
- Legacy local onboarding/import/sample reset code may exist. Retire/remove it from production behavior only where safe.

## Docs

- Update env/deployment docs to remove Netlify Database as the app-data plan.
- Document required Auth0 env vars and server-only database env vars by name only.
- Do not print or commit real values.

## Checks

- Run `npm run lint`.
- Run `npm run test`.
- Run `npm run build`.

## Summary

- Create `CODE_EDITOR_PREMIUM_ONBOARDING_SUMMARY.md`.
- Include what changed, risks, database/auth notes, checks run, and any follow-up tasks.
- Do not commit or push unless the owner explicitly asks.
