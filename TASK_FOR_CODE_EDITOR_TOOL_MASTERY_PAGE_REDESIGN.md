# Task For Code Editor: Tool Mastery + Guide Page Redesign

Read `TOOL_MASTERY_PAGE_REDESIGN_PLAN.md` first.

## Rules

- Preserve Auth0-only mandatory login.
- Do not add fake/demo/Titus mastery data.
- Do not rely on localStorage, Dexie, or local-only mode for core XP/mastery production data.
- Keep guide progress, BenchXP progress, guide completions, safety acknowledgements, tool familiarity, practice tasks, mistake logs, maintenance logs, tooltip dismissals, and saved preferences user-scoped.
- Use server/API verified Auth0 tokens before reading or writing user data.
- Do not expose database credentials or Auth0 secrets to the browser.
- Do not claim BenchXP is certification, professional qualification, licensing, or proof of safe competence.
- Preserve the BenchOS orange accent and dark workshop command-center feel.
- Do not run destructive Git commands.
- Do not commit `.env` files.

## Implementation Goals

1. Redesign `/mastery` into a premium BenchXP command center.
2. Redesign `/tool-guides/:toolTypeId` into a premium practical guide page.
3. Add Overall BenchXP hero with non-certification copy.
4. Add category mastery grid.
5. Add owned-tool familiarity section using real brand/model data where available.
6. Add guide progress and practice task sections using real guide/progress data.
7. Add Recommended Next Skill foundation.
8. Add Explain My Score foundation using real evidence.
9. Add useful empty states when data is missing.
10. Add guide hero, quick reference card, safety panel, mode selector, nav, and scannable content cards.
11. Add project readiness connection as Balanced Warnings only.
12. Improve mobile layout and accessibility.
13. Verify BenchXP migrations exist.
14. Run checks.
15. Create `CODE_EDITOR_TOOL_MASTERY_PAGE_REDESIGN_SUMMARY.md`.

## Backend/Persistence Requirement

Verify whether BenchXP database migrations exist for all tables used by `netlify/functions/_shared/benchXpStore.mjs`. If migrations are missing, add or document the blocker. Do not add a new local-only production fallback.

## Checks

- `npm run lint`
- `npm run test`
- `npm run build`

## Summary File Must Include

- What changed.
- Files changed.
- What remains backend-dependent.
- Persistence risks.
- Checks run and results.
- Manual testing notes.
