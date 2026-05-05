# BenchOS Tool Mastery Guides + BenchXP Plan

## Summary

BenchOS Tool Mastery should become a practical guide system that supports the core loop:

```text
tool library -> inventory -> projects -> readiness -> wishlist -> purchases -> more buildable projects -> skill progression
```

This execution pass starts the v0.02 guide foundation with structured static content, richer guide UI, safer BenchXP wording, and clear persistence notes. User progress still needs the production persistence follow-up before it can be treated as cross-device production truth.

## Locked Decisions

- Auth0 remains the only production auth provider.
- Netlify Database is the selected production database direction for BenchOS.
- Browser code must never receive database credentials.
- Static guide content may live in TypeScript for v0.02.
- User guide progress, BenchXP, evidence, confidence, mistakes, maintenance, tooltip dismissals, and preferences must persist through Auth0-verified Netlify Functions and Netlify Database when the backend phase is implemented.
- Readiness default is Balanced Warnings: guide/skill data adds confidence, warnings, and next-skill recommendations without hard blocking projects.
- Safety gates are not hard gates by default.
- BenchXP means familiarity and confidence, not certification, licensing, or proof of safe competence.

## Current Reality

- `src/features/mastery/MasteryPage.tsx` lists starter guides, progress, XP, and guide steps.
- `src/features/tool-guides/ToolGuidePage.tsx` renders guide sections for a selected tool type.
- `src/data/seed/starterMastery.ts` provides starter mastery guides.
- `src/data/seed/deepToolGuides.ts` provides deep guide sections.
- `src/lib/xp/xpEngine.ts` calculates XP levels and mastery progress.
- Current progress remains Dexie-backed in the local app layer. This pass does not claim production persistence is complete.

## Tool Mastery Experience

Dedicated guide pages should answer:

- What this tool is and when to use it.
- When not to use it.
- Safety risks and PPE.
- Setup checklist.
- Basic use steps.
- Common mistakes.
- Accessories and consumables.
- Maintenance.
- Similar tools and substitutions.
- Project examples and readiness impact.
- Practice tasks.
- BenchXP/familiarity evidence.

Guide depth modes:

- Quick Guide: safety, setup, use, mistakes.
- Full Guide: complete reference.
- Shop Card: compact project-use checklist.

## BenchXP Model

BenchXP should be framed as layered familiarity:

- Overall BenchXP.
- Category familiarity.
- Tool type familiarity.
- Owned tool familiarity.
- Skill dimensions.
- Evidence.

Skill dimensions:

- Safety.
- Setup.
- Control.
- Accuracy.
- Maintenance.
- Project Use.

Visible labels should avoid certification language:

- 0-10: Unfamiliar.
- 11-25: Beginner.
- 26-45: Learning.
- 46-65: Comfortable.
- 66-85: Skilled.
- 86-100: Highly Familiar.

Avoid labels such as certified, expert, professional, qualified, or licensed. Replace visible "Mastered" copy with "Highly Familiar" or "Completed Guide" where appropriate.

## Priority Guides

The first structured guide set covers:

- Cordless Drill.
- Impact Driver.
- Circular Saw.
- Miter Saw.
- Orbital Sander.
- Tape Measure.
- Speed Square.
- Clamps.
- Shop Vac / Dust Collection.
- Socket Set.

## Persistence Direction

Static guide content can be bundled with the app. User-specific guide progress must move to Auth0-verified server APIs backed by Netlify Database.

Recommended future Netlify Database tables:

- `user_guide_progress`.
- `user_guide_checklist_progress`.
- `user_tool_mastery`.
- `user_specific_tool_familiarity`.
- `user_category_mastery`.
- `user_technique_mastery`.
- `user_material_familiarity`.
- `user_benchxp_events`.
- `user_skill_evidence`.
- `user_practice_task_logs`.
- `user_confidence_checkins`.
- `user_mistake_logs`.
- `user_maintenance_logs`.
- `user_favorite_guides`.
- `dismissed_tooltips`.
- `user_readiness_preferences`.
- `user_mastery_roadmap_progress`.

All writes must derive the user from the verified Auth0 token server-side.

## Implementation Scope For This Pass

- Add structured static guide content and helpers.
- Seed the existing deep guide sections from the structured content.
- Upgrade the dedicated guide page UI.
- Add Quick Guide, Full Guide, and Shop Card display modes.
- Reframe mastery UI copy around familiarity and guide completion.
- Add focused tests for content coverage and familiarity thresholds.
- Document the remaining server-backed persistence gap.

## Checks

Run:

- `npm run lint`
- `npm run test`
- `npm run build`

## Follow-Up

Implement Auth0-verified Netlify Functions and Netlify Database tables for guide progress, evidence, confidence check-ins, practice task logs, mistake logs, maintenance evidence, and dismissed hints. Then migrate the production UI off local progress for user-specific mastery state.
