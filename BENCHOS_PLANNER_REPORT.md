# BenchOS Planner Report

## Version Tracking

- Current app version: `v0.03`.
- Version source: `src/lib/version.ts`.
- Version rule: every committed app/source-code change increases the visible app version by `0.01`.
- Future Planner, Coordinator, Code Editor, Cleaner, and Reviewer notes should reference the current app version when planning or summarizing code-changing work.
- `v0.03` includes the mandatory auth shell and no automatic personal sample data by default.

## 1. Current Product Understanding

BenchOS is a local-first workshop operating system for tool owners, DIY builders, and workshop learners.

The core loop is:

```text
Tool Library -> inventory -> projects -> readiness -> wishlist -> purchases -> more buildable projects -> skill progression
```

The product direction is clear:

- The Tool Library should be the starting point, not a secondary reference area.
- The main Tool Library UI should show real brand/model catalog tools by default.
- Generic tool types should remain useful internally for readiness, capabilities, mastery, and matching, but should not feel like the main customer-facing catalog.
- Manual/custom tool entry should remain available as a fallback.
- BenchOS should preserve the orange accent and dark workshop command-center identity.
- Important flows should use dedicated pages or focused modals, not small hidden sidebars.
- Tool Mastery should become deeper and more useful without becoming hard to use.
- Supabase Auth and sync are already present/planned as optional features, while Local Mode remains important.

Uncertain:

- The app labels the sidebar as `v0.02`, but the planning docs still describe early phases. For planning purposes, this report treats `v0.02` as the next product-quality focus, not necessarily as the exact current shipped version.

## 2. Current App Structure

Observed app folder:

```text
C:\Users\slaye\Documents\Codex\BenchOS
```

Launcher folder:

```text
C:\Users\slaye\OneDrive\Documents\New project
```

Observed stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Dexie / IndexedDB
- MiniSearch
- Optional Supabase Auth and sync
- Vitest
- ESLint

Important folders:

- `src/app`: app routes.
- `src/components/layout`: app shell, sidebar, top bar.
- `src/components/ui`: shared UI components.
- `src/components/tool-picker`: tool picker, tool cards, add custom tool modal.
- `src/components/logging`: usage, material usage, and maintenance logging modals.
- `src/data`: schema, Dexie database, hooks, actions, mock data, seed data.
- `src/data/seed`: starter tool library, starter inventory, starter projects, project templates, deeper tool guide data, public inventory expansion.
- `src/features`: major pages such as Tool Library, My Tools, Materials, Projects, Project Templates, Gap Analyzer, Workshop Score, Wishlist, Tool Mastery, Settings, Onboarding, and Auth.
- `src/lib`: domain logic for auth, diagnostics, guides, import/export, inventory, preferences, projects, readiness, search, sync, and XP.
- `supabase/migrations`: Supabase schema/RLS migration files.
- `docs`: setup, product spec, workflow, design system, Supabase, and tool image docs.
- `.agents`: local BenchOS tool image agent skill.

Observed app routes include:

- Dashboard
- Tool Library
- Tool Guide detail
- My Tools
- Materials
- Projects
- Project Detail
- Project Templates
- Project Template Detail
- Gap Analyzer
- Workshop Score
- Wishlist
- Tool Mastery
- Settings
- Buying Preferences
- Login, Signup, Reset Password, Account, Account Onboarding, Local Mode

Uncertain:

- `src/features/build-now` and `src/features/image-audit` directories exist, but they appeared empty or not routed during this inspection.

## 3. What v0.01 Appears To Include

Based on `docs/product-spec.md`, `docs/codex-plan.md`, `README.md`, routes, schema, actions, and seed files, BenchOS appears to include more than the original Phase 1 static shell.

What appears present:

- Dark BenchOS app shell and navigation.
- Tool Library page.
- Brand/model catalog records through `toolCatalogItems`.
- Internal generic tool types through `toolTypes`.
- Tool variants, brands, battery platforms, aliases, capabilities, specs, source notes, accessories, consumables, and compatibility rules.
- Catalog search using MiniSearch and custom ranking.
- Add catalog item to My Tools.
- Add catalog item to Wishlist.
- Add catalog item as a project requirement.
- Manual/custom tool add fallback.
- My Tools CRUD actions.
- Materials CRUD and stock adjustment actions.
- Projects CRUD, project requirements, project steps, and project activity.
- Project templates and template requirements.
- Readiness engine and diagnostics.
- Gap Analyzer.
- Workshop Score.
- Wishlist purchase and inventory conversion flow.
- Purchase history.
- Tool usage logs.
- Material usage logs.
- Maintenance logs.
- BenchXP events and XP summary.
- Tool Mastery guides and progress.
- Account onboarding.
- Buying preferences for preferred brands, avoided brands, battery platforms, budget tier, workshop type, space sensitivity, and cordless preference.
- Optional Supabase Auth and sync metadata.
- Supabase migrations for workshops, profiles, workshop records, and RLS tightening.
- Import/export logic.
- Tests for data/schema, actions, readiness, diagnostics, search, sync, XP, project templates, import/export, inventory, and seed behavior.

Important observation:

- The old docs describe Phase 1 as static mock UI and Phase 2 as Dexie/search/CRUD, but the current code appears to already include local-first data, CRUD, readiness, wishlist conversion, logs, XP, optional Supabase, and brand/model catalog records.

Uncertain:

- I did not run the app or verify every page visually. This is a code/doc structure assessment only.
- I did not run test commands because this task was planning-only.

## 4. What v0.02 Should Focus On

v0.02 should focus on product alignment, trust, and a clean core loop rather than a redesign.

Recommended v0.02 theme:

```text
Make BenchOS feel like a real brand/model workshop catalog connected to real owner workflows.
```

v0.02 should focus on:

- Tool Library as the first-class entry point.
- Brand/model tools shown by default.
- Generic tool types kept as internal matching and readiness structure.
- Clear search by brand, model, battery platform, tool type, capability, project, and material.
- Better catalog coverage for DeWalt, Milwaukee, Makita, Ryobi, Bosch, RIDGID, Craftsman, Klein, Stanley, Irwin, Festool, SawStop, Metabo HPT, EGO, and other already-seeded brands.
- Manual/custom add fallback that maps to internal type/category where possible.
- Stronger connection from catalog item to inventory, project requirements, readiness, wishlist, and purchase conversion.
- Dedicated or focused modal flows for meaningful actions.
- Tool Mastery guide depth without burying users in dense reading.
- Optional Supabase login/sync hardening only where it is already planned or present.
- Owner-safe QA, documentation, and verification flow.

v0.02 should not focus on:

- A visual redesign.
- Dependency churn.
- Large schema changes unless a specific feature requires it and the owner approves it.
- Scraping prices or pretending to have real-time retail data.
- Removing Local Mode.

## 5. Recommended Development Phases

### Phase A: Safety And Product Baseline

Goal:

- Confirm what already works before changing behavior.

Tasks:

- Run the existing checks in a clean worktree.
- Create a current feature map with screenshots if useful.
- Identify which pages are complete, partially complete, or placeholders.
- Confirm whether the app version label should say `v0.02`.
- Confirm whether empty/unrouted feature folders should remain untouched.

Owner decision needed:

- Decide whether `v0.02` is a current label, a target label, or a placeholder.

### Phase B: Tool Library Catalog Quality

Goal:

- Make the Tool Library feel like real tools first.

Tasks:

- Audit current catalog items for brand/model coverage.
- Identify top missing catalog records for DeWalt, Milwaukee, Makita, Ryobi, Bosch, RIDGID, Craftsman, Klein, Stanley, Irwin, Makita, and similar common workshop brands.
- Keep brand/model display as the default card identity.
- Keep internal tool type visible only as metadata or explanation.
- Improve search/favorites/preferences only within existing structure.
- Preserve custom add.

Owner decision needed:

- Decide whether BenchOS should include only widely recognizable real model names, or include a broader semi-curated catalog with confidence/source notes.

### Phase C: Core Loop Hardening

Goal:

- Prove one smooth user journey end to end.

Target journey:

```text
Search DeWalt drill -> add to My Tools -> create project -> add requirements -> see readiness -> add missing item to Wishlist -> mark purchased -> convert to inventory -> gain more buildable projects -> start mastery guide
```

Tasks:

- Test the loop manually.
- Fix only broken links in the loop.
- Make action outcomes clear through existing notices/modals/pages.
- Confirm wishlist conversion preserves brand/model/catalog item when available.
- Confirm readiness uses internal tool types without confusing the user-facing UI.

Owner decision needed:

- Decide which 3-5 project templates should be the official v0.02 demo projects.

### Phase D: Tool Mastery Depth

Goal:

- Make Tool Mastery guides deeper while staying usable.

Tasks:

- Audit current guide structure.
- Pick 5-10 priority tool types for deeper guides.
- Expand guides into practical sections: overview, safety, setup, use, mistakes, practice, maintenance, project ideas, and buying notes.
- Keep guide completion tied to BenchXP and real usage/maintenance where possible.
- Avoid turning guides into long walls of text.

Owner decision needed:

- Decide whether mastery should be more like a checklist, a mini-course, or a hybrid.

### Phase E: Account, Local Mode, And Sync Confidence

Goal:

- Keep Local Mode safe while making optional account features understandable.

Tasks:

- Audit login, signup, account onboarding, Local Mode, and sync states.
- Do not print or expose env secrets.
- Verify Supabase copy clearly explains optional status.
- Confirm sync only touches user/workshop data and does not attempt to sync seed catalog records.
- Preserve current migrations unless a specific approved change is needed.

Owner decision needed:

- Decide whether Supabase should be required for beta or remain optional.

### Phase F: Beta Polish And Owner Workflow

Goal:

- Make future development safer for a non-coder owner.

Tasks:

- Keep worktree workflow documented.
- Add simple release checklists.
- Keep prompts scoped.
- Run `npm run lint`, `npm run test`, and `npm run build` after code changes.
- Track known risks and avoid broad cleanup mixed with feature work.

Owner decision needed:

- Decide when to start cleanup work versus feature polish.

## 6. What Should Be Built First

Build first:

1. A v0.02 Tool Library audit report.
2. A v0.02 core-loop QA report.
3. A small, approved Tool Library catalog improvement pass.
4. A small, approved core-loop fix pass if QA finds broken behavior.
5. A Tool Mastery guide audit, then one deep guide prototype.

Why this order:

- The Tool Library is the top of the BenchOS loop.
- Brand/model catalog quality is central to the new direction.
- The app already has many advanced systems, so v0.02 should make the existing loop feel coherent before adding more surface area.
- A single deep Tool Mastery prototype lets the owner approve the content style before expanding many guides.

Recommended first build scope:

```text
Tool Library v0.02 alignment:
- brand/model catalog is the default browsing identity
- internal type stays secondary
- custom add remains available
- add to My Tools, Wishlist, and Project Requirement still work
- no redesign
- no schema changes unless explicitly approved
```

## 7. What Should Be Delayed

Delay:

- Retail price scraping.
- Affiliate links.
- Real-time purchase availability.
- Large product-link marketplace features.
- Major image generation or product-photo work.
- Broad UI redesign.
- Mobile redesign unless the current mobile experience is blocking real testing.
- Full cleanup/refactor.
- New dependencies.
- Schema changes that are not required for the next approved feature.
- Multi-user collaboration features.
- AI recommendation features.
- Complex importers from store accounts, receipts, or email.
- Deployment/PWA packaging unless beta testing requires it.

Reason:

- BenchOS already has a wide surface area. The next value is making the existing loop clear, trustworthy, and owner-safe.

## 8. What Should Not Be Touched Yet

Do not touch yet without explicit approval:

- Database schema.
- Supabase migrations.
- Auth/session logic.
- Sync conflict logic.
- Routes and navigation names.
- The orange BenchOS accent.
- Local Mode.
- Seed catalog relationships between catalog item, internal tool type, capability, project requirement, wishlist item, and mastery guide.
- Existing tests, except when updating tests for an approved behavior change.
- Dependencies and package versions.
- Build tooling.
- Worktree setup.
- Image agent rules.
- Empty/unrouted feature folders unless the owner approves a cleanup task.
- `.env`, `.env.local`, or any secret-bearing file.

Planning note:

- Avoid broad cleanup until after product direction and v0.02 loop checks are complete.

## 9. Risks For A Non-Coder Owner

Main risks:

- Too many agents editing at once could cause overlapping changes.
- The repo already has at least one untracked planning file, so future agents should always check status first.
- Old docs and current code are not fully aligned, which can cause agents to build the wrong phase.
- Worktrees are useful but can be confusing if the owner is not sure which folder is trusted.
- Supabase setup involves env values and RLS policies; a careless agent could expose secrets or weaken data rules.
- Schema changes can create local IndexedDB migration issues.
- Real brand/model catalogs can imply accuracy. BenchOS should use clear source notes and avoid fake product claims.
- Product photos/logos/trade dress can create legal and licensing risk.
- Generic internal tool types may leak into the UI and make the app feel less real if not handled carefully.
- Broad refactors may break the core loop even if tests pass.
- Adding dependencies can create install/build issues for a non-coder.
- Running cleanup before product stabilization can remove files that are not obviously used yet.

Safe owner workflow:

- Use one worktree per task.
- Give Codex one narrow prompt.
- Require a changed-file list.
- Require plain-English explanation.
- Require checks after code edits.
- Review before merging.
- Keep planning/report-only tasks separate from implementation tasks.

## 10. Exact Prompts For Future Codex Tasks

### Prompt 1: Tool Library v0.02 Audit Only

```text
You are working on BenchOS. Do not edit app code. Do not delete files. Do not install packages. Create a markdown audit report only.

Audit the current Tool Library for v0.02 alignment:
- brand/model tools should be the default UI
- generic tool types should remain internal/secondary
- custom add fallback must remain
- catalog search should support brand, model, platform, capability, project, and material intent
- preserve the orange BenchOS accent

Report what exists, what is uncertain, what is missing, and the safest next implementation order. Include file references. Stop after creating the report.
```

### Prompt 2: Core Loop QA Report Only

```text
You are working on BenchOS. Do not edit app code. Do not delete files. Do not install packages. Create a markdown QA report only.

Trace this BenchOS loop from source files and, if appropriate, by running the app locally:
Tool Library -> My Tools -> Projects -> Readiness -> Wishlist -> Purchase/Convert -> Tool Mastery.

Find broken or confusing parts only. Do not fix them. Preserve routes, schema, auth, Local Mode, and the orange accent. Mark uncertain items clearly. Stop after creating the QA report.
```

### Prompt 3: Small Tool Library Implementation Pass

```text
You are working on BenchOS. Make only the approved v0.02 Tool Library changes described below. Do not redesign the app. Do not change routes. Do not change schema. Do not change auth. Do not install packages. Do not delete files. Preserve the orange BenchOS accent.

Approved scope:
[PASTE APPROVED TOOL LIBRARY AUDIT ITEMS HERE]

Keep brand/model catalog tools as the default user-facing identity. Keep generic tool types as internal/secondary metadata. Preserve Add Custom Tool, Add to My Tools, Add to Wishlist, and Add to Project Requirement behavior.

Before editing, list the files you expect to touch. After editing, run relevant checks and summarize exactly what changed in plain English.
```

### Prompt 4: Catalog Data Expansion Pass

```text
You are working on BenchOS. Make only a small catalog data expansion. Do not redesign the app. Do not change schema. Do not change routes. Do not change auth. Do not install packages. Do not delete files.

Add or improve a limited set of brand/model catalog records for:
[PASTE APPROVED BRANDS AND TOOL CATEGORIES HERE]

Rules:
- real brand/model display names should be user-facing
- generic tool types may be used internally
- include reasonable aliases/search tags/source notes if the existing seed pattern supports them
- do not add logos, copyrighted product photos, or real-time price claims
- preserve existing catalog relationships and tests

Run relevant checks and summarize changed files.
```

### Prompt 5: Tool Mastery Audit Only

```text
You are working on BenchOS. Do not edit app code. Do not delete files. Do not install packages. Create a markdown report only.

Audit Tool Mastery and Tool Guides for depth and usability. Identify the best 5-10 tool types for deeper guides. Recommend one prototype guide format that is practical, beginner-friendly, safety-aware, and tied to BenchXP where possible.

Preserve current mastery progress logic, usage logs, maintenance logs, routes, schema, auth, and orange accent. Mark uncertain items clearly. Stop after creating the report.
```

### Prompt 6: One Deep Tool Guide Prototype

```text
You are working on BenchOS. Implement one approved deep Tool Mastery guide prototype only. Do not redesign the app. Do not change routes. Do not change schema unless explicitly approved. Do not change auth. Do not install packages. Do not delete files. Preserve the orange BenchOS accent.

Approved tool type:
[PASTE ONE TOOL TYPE HERE]

Guide should include practical sections for overview, safety, setup, basic use, common mistakes, practice task, maintenance, and buying notes if the existing data model supports them. Keep it usable, not a wall of text. Preserve BenchXP/progress behavior.

Run relevant checks and summarize changed files.
```

### Prompt 7: Supabase/Auth Audit Only

```text
You are working on BenchOS. Do not edit app code. Do not delete files. Do not install packages. Do not print env values. Create a markdown audit report only.

Audit optional Supabase Auth and sync setup:
- Local Mode should remain fully usable
- Supabase should be optional unless the owner decides otherwise
- only user/workshop data should sync
- seed catalog records should remain local app data
- RLS/auth assumptions should be documented carefully

Report risks, uncertain points, and safe next steps. Stop after creating the report.
```

### Prompt 8: Reviewer After Any Code Edit

```text
Review the latest BenchOS code changes as a reviewer. Do not edit files. Focus on bugs, regressions, missing tests, schema/auth/route risks, broken core-loop behavior, and accidental design changes. Preserve Local Mode and the orange BenchOS accent.

Start with findings ordered by severity and include file/line references. If there are no findings, say so clearly and mention remaining test gaps.
```

### Prompt 9: Safe Release Checklist Report

```text
You are working on BenchOS. Do not edit app code. Do not delete files. Do not install packages. Create a markdown release checklist only.

Create a beginner-friendly v0.02 release checklist that covers:
- core loop verification
- Tool Library catalog checks
- Local Mode checks
- optional Supabase checks without printing secrets
- tests/build/lint
- known risks
- owner sign-off steps

Stop after creating the checklist.
```

### Prompt 10: Coordinator Status Update

```text
You are the BenchOS Coordinator. Do not edit app code. Do not delete files. Do not install packages.

Inspect the current repo status and planning docs. Update only the coordination/status markdown file if needed. Summarize:
- which folder is trusted
- which worktrees exist
- current untracked/changed files
- last known checks
- safest next task
- risks for a non-coder owner

Do not approve code changes automatically. Stop after the status update.
```
