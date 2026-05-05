# Task For Code Editor: Tool Mastery Guides + BenchXP

Read `BENCHOS_TOOL_MASTERY_GUIDES_PLAN.md` first.

Implement the upgraded Tool Mastery guide + BenchXP foundation in safe phases.

## Hard Rules

- Auth0 is the only production auth provider.
- Netlify Database is the selected production database direction.
- No Supabase Auth fallback.
- No local mode.
- No automatic Titus account.
- No automatic demo data.
- Do not use localStorage, Dexie, or IndexedDB as production source of truth for mastery/progress data.
- User guide progress, XP, evidence, confidence, mistakes, maintenance, tooltip dismissals, and preferences must be scoped to the authenticated Auth0 user when persistence is implemented.
- Do not expose secrets.
- Do not commit `.env` files.
- Do not run destructive Git commands.
- Do not claim BenchXP is certification, professional qualification, licensing, or proof of safe competence.
- Do not include unsafe tool instructions or advice to bypass guards, manuals, or codes.

## Build

- Upgrade the dedicated Tool Guide page UI.
- Create reusable guide/content helpers where practical.
- Add a structured static guide content model for v0.02.
- Add first priority guide outlines/content for cordless drill, impact driver, circular saw, miter saw, orbital sander, tape measure, speed square, clamps, shop vac/dust collection, and socket set.
- Add safety/setup/use/mistakes/maintenance/accessories/comparisons/project examples sections.
- Add Quick Guide, Full Guide, and Shop Card display modes if feasible.
- Keep Tool Library guide links working.
- Add BenchXP familiarity labels.
- Add evidence/explain-my-score foundation if feasible.
- Add practice task foundation if feasible.
- Add beginner help hints/tooltips.
- Connect guide state to project readiness as Balanced Warnings only, not hard gates.
- Preserve BenchOS orange accent and premium dark workshop-command-center feel.
- Improve mobile layout and accessibility.

## Persistence

- Static guide content may live in TypeScript.
- User progress must persist through Auth0-verified server/API and Netlify Database when the backend phase is implemented.
- If backend integration is too large for this pass, implement UI/content foundation only and create a clear follow-up persistence task.
- Do not ship a new local production fallback.

## Docs

- Update docs with BenchXP philosophy: Guides + Practice + Projects + Safety + Maintenance + Evidence.
- Document that BenchXP is familiarity/readiness guidance, not certification.
- Document required env names only, never values.

## Checks

Run:

- `npm run lint`
- `npm run test`
- `npm run build`

## Summary

Create `CODE_EDITOR_TOOL_MASTERY_GUIDES_SUMMARY.md`.

Include files changed, behavior added, persistence gaps, auth/database risks, checks run, and follow-up tasks.

Do not push to GitHub. Do not bump the version until the owner asks for a push/release.
