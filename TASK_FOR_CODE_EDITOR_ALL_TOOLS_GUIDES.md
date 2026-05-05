# Task For Code Editor: All-Tools Guide Foundation

Read `ALL_TOOLS_GUIDE_SYSTEM_PLAN.md` first.

## Goal

Implement a scalable foundation for dedicated Tool Mastery Guide pages for all BenchOS Tool Library catalog items without duplicating 1,600 giant guide files.

## Rules

- Preserve Auth0-only mandatory login.
- Do not expose secrets.
- Do not commit `.env` files.
- Do not run destructive Git commands.
- Do not create unsafe tool guidance.
- Do not claim BenchXP is certification.
- Do not add fake/demo/Titus production data.
- Do not use localStorage for core guide/BenchXP/progress data.
- Keep guide progress, BenchXP, maintenance logs, mistake logs, confidence check-ins, owned-tool notes, and dismissed tooltips user-scoped.
- Keep performance in mind and lazy-load guide content.
- Do not load all 1,600 guide bodies at startup.

## Build

1. Create a guide content hierarchy foundation:
   - category guide
   - tool-type guide
   - brand/model overlay
   - user-owned tool layer

2. Add catalog guide routing:
   - canonical guide slug per catalog item
   - duplicate slug handling
   - compatibility with old `/tool-guides/:toolTypeId`
   - type fallback route

3. Update the reusable guide page template:
   - guide hero
   - model/source metadata
   - content status indicators
   - quick reference
   - safety first
   - setup/use/mistakes/practice/maintenance sections
   - BenchXP panel

4. Map every Tool Library catalog item to a dedicated guide page:
   - use catalog item ID and generated slug
   - inherit category/tool-type content
   - show honest missing overlay/status when unavailable

5. Add docs and tests.

## Checks

- `npm run build`
- `npm run lint`
- `npm run test`

## Summary

Create `CODE_EDITOR_ALL_TOOLS_GUIDES_SUMMARY.md` with changed files, catalog mapping count, remaining guide coverage gaps, content status behavior, performance notes, backend/persistence risks, and checks.
