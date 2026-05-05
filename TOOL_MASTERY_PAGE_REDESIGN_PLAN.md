# BenchOS Tool Mastery + Guide Page Redesign Plan

## Summary

BenchOS already has a protected `/mastery` page and `/tool-guides/:toolTypeId` route. The current guide detail foundation already supports structured guide content, Quick/Full/Shop Card modes, BenchXP panels, practice logging, confidence check-ins, mistake logging, maintenance logging, favorites, and Auth0-token API calls.

The redesign should build on that foundation rather than restarting it. The goal is to make Tool Mastery feel like a premium workshop skill command center, make guide pages more scannable and practical, add honest empty states, and keep BenchXP evidence tied to user-scoped server data.

## Current Reality

- Framework: Vite + React + TypeScript.
- Auth: Auth0-only route protection.
- Overview route: `/mastery`.
- Guide detail route: `/tool-guides/:toolTypeId`.
- Static guide content lives in `src/lib/guides/toolMasteryContent.ts`.
- User progress/evidence is read and written through `/.netlify/functions/benchxp`.
- BenchXP migration exists at `netlify/database/migrations/0002_benchxp_mastery/migration.sql`.
- The current page should not use fake XP, fake inventory, Titus data, or demo data.

## Product Direction

Tool Mastery should become the central hub for:

- Overall BenchXP.
- Category mastery.
- Owned-tool familiarity.
- Skill dimensions: Safety, Setup, Control, Accuracy, Maintenance, Project Use.
- Evidence and “Explain My Score.”
- Recommended next skill.
- Practice tasks.
- Weakest link/readiness gaps.
- Safety and maintenance status.
- Recent evidence feed.

Individual guide pages should become practical reference pages with:

- Guide hero and owned/not-owned state.
- Quick reference.
- Safety-first panel.
- Guide mode selector.
- Sticky section navigation.
- Setup, use, mistakes, maintenance, accessories, comparisons, substitutions, and project readiness guidance.
- BenchXP score, skill dimensions, evidence, practice, confidence, mistakes, and maintenance actions.

## Implementation Defaults

- Keep sidebar/page label as `Tool Mastery`.
- Use `BenchXP` as the score/evidence system.
- Show 0-100 familiarity labels prominently.
- Keep XP/level as secondary detail.
- Use labels: `Unfamiliar`, `Beginner`, `Learning`, `Comfortable`, `Skilled`, `Highly Familiar`.
- Do not use certification language.
- Default readiness mode remains Balanced Warnings.
- Safety content is prominent but not a hard gate by default.
- Empty users get honest starter actions, not sample data.

## Persistence Requirements

Static guide content can live in the repo. User-specific progress, guide completions, evidence, confidence, mistakes, maintenance, dismissed hints, favorites, and readiness preferences must remain user-scoped through Auth0-verified server/API calls.

Required production tables are covered by the BenchXP migration:

- `user_guide_progress`
- `user_guide_checklist_progress`
- `user_benchxp_events`
- `user_skill_evidence`
- `user_practice_task_logs`
- `user_confidence_checkins`
- `user_mistake_logs`
- `user_maintenance_logs`
- `user_tool_mastery`
- `user_specific_tool_familiarity`
- `user_category_mastery`
- `user_technique_mastery`
- `user_material_familiarity`
- `user_favorite_guides`
- `dismissed_tooltips`
- `user_readiness_preferences`
- `user_mastery_roadmap_progress`

## Testing Plan

- `npm run lint`
- `npm run test`
- `npm run build`

Manual checks:

- Logged-out users cannot access `/mastery` or `/tool-guides/:toolTypeId`.
- Empty new users see useful empty states and no fake data.
- Tool owners see owned-tool familiarity cards.
- Guide pages show hero, quick reference, safety, navigation, content, readiness, and BenchXP panels.
- Buttons route or save through Auth0-backed actions.
- Mobile layout remains readable.
- No `.env` or secrets are committed.
