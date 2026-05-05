# BenchOS Cleaner Audit

## 1. Current Code Health

BenchOS is healthier after the cleanup pass. The previously identified starter artifacts have been removed, the notification copy typo is fixed, route-level lazy loading is now in place, and shared modal/table accessibility has improved.

Verification after cleanup:

- `npm run lint`: passed.
- `npm run test`: passed, 17 test files and 80 tests.
- `npm run build`: passed.
- No standalone `typecheck` script exists; TypeScript checking runs through `npm run build`.
- The old Vite large-chunk warning is gone. The largest built JS chunk is now about 488.43 kB before gzip.
- No `console.*`, `debugger`, `@ts-ignore`, `@ts-expect-error`, or `eslint-disable` hits were found in `src`.

Recent cleanup already present in the repo includes:

- Deleted unused starter files: `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`.
- Deleted ignored generated dev/preview log files.
- Fixed `src/components/layout/TopBar.tsx` copy from `Your all caught up!` to `You're all caught up!`.
- Added route-level `React.lazy` / `Suspense` code splitting in `src/app/routes.tsx`.
- Added stronger roles/focus/keyboard behavior to `src/components/ui/Modal.tsx`, `src/components/ui/ConfirmDialog.tsx`, and `src/components/ui/DataTable.tsx`.
- This audit pass also removed unreferenced starter-style assets: `src/assets/hero.png` and `public/icons.svg`.

The remaining mess is mostly maintainability, naming, planned shared component cleanup, and larger architectural slicing. The riskiest areas remain data/schema/sync/search/readiness behavior, not ordinary unused imports.

## 2. No-Risk Cleanup

- Keep running lint/test/build after every cleanup pass; all are currently green.
- Keep root generated files ignored. No root `.log` files are currently present.
- Keep avoiding import-only cleanup unless lint/build reports it; current strict TypeScript already catches unused locals/imports.
- Keep avoiding commented-out-code cleanup unless a fresh scan finds it; no commented-out old code was found in `src`.
- Keep avoiding console/debug cleanup unless a fresh scan finds it; none was found in `src`.

## 3. Low-Risk Cleanup

- Review `src/components/ui/EmptyState.tsx` and `src/components/ui/FilterBar.tsx`. They are documented in `docs/design-system.md` but not imported by app code. Either wire them into pages intentionally or mark them as planned design-system components.
- Review `src/data/mock/mockData.ts`. It appears to be an old mock dataset now that live data comes from Dexie seed modules.
- Move `StatusTone` out of `src/data/mock/types.ts` before any mock folder removal. Production status utilities still depend on that one type.
- Clean or consolidate untracked coordination/report docs only with owner approval. Current untracked docs include `BENCHOS_COMMAND_CENTER.md`, `BENCHOS_PLANNER_REPORT.md`, `CODE_EDITOR_PHASE_1_SUMMARY.md`, and `TASK_FOR_CODE_EDITOR.md`.

## 4. Medium-Risk Cleanup

- Split very large files only with focused tests around each boundary:
  - `src/data/actions.ts`: about 1,185 lines.
  - `src/data/schema.ts`: about 961 lines.
  - `src/data/hooks.ts`: about 411 lines.
  - `src/features/tool-library/ToolLibraryPage.tsx`: about 588 lines.
  - `src/features/auth/AuthPages.tsx`, `src/features/projects/ProjectDetailPage.tsx`, `src/features/my-tools/MyToolsPage.tsx`, `src/features/dashboard/DashboardPage.tsx`, `src/features/wishlist/WishlistPage.tsx`, and `src/features/materials/MaterialsPage.tsx` remain large page-plus-modal files.
- Add clearer page-level loading/empty/error state behavior. Many `useLiveQuery` hooks still default to `[]`, so some pages cannot distinguish "still loading" from "empty result".
- Continue accessibility hardening beyond the shared components. `ToolLibraryPage` still has a custom `ToolDetailModal` implementation instead of using the shared `Modal` component.
- Review repeated filtering/pagination/form-modal patterns across `MaterialsPage`, `MyToolsPage`, `ProjectsPage`, and `WishlistPage`.
- Review readiness/search performance before scaling further. Some pages still compute readiness by filtering all requirements inside project/template maps.

## 5. High-Risk Changes To Avoid

- Do not refactor database schema, Dexie versioning, Supabase migrations, sync tables, or conflict behavior as cleanup.
- Do not alter seed data shape or public inventory expansion logic without product/data review.
- Do not change readiness, diagnostics, search ranking, or project-template behavior merely to reduce file size.
- Do not remove auth, local mode, onboarding, or account-linking paths without validating the intended account/sync flow.
- Do not remove `.agents/skills/benchos-tool-image-agent`; it is project tooling, not app dead code.
- Do not delete untracked planning/report docs unless the owner confirms they are obsolete.

## 6. Unused Code Candidates

| File path | What seems unused | Why you think it is unused | Confidence level | Safe action |
| --- | --- | --- | --- | --- |
| `src/components/ui/EmptyState.tsx` | Shared empty-state component | Import graph shows no app imports. It is listed in `docs/design-system.md`, so it may be planned rather than dead. | high | leave |
| `src/components/ui/FilterBar.tsx` | Shared filter component/type | Import graph shows no app imports. Similar filter UIs are implemented inline on several pages. It is also listed in `docs/design-system.md`. | high | leave |
| `src/data/mock/mockData.ts` | Old mock dataset | Import graph shows no app imports. Live app data appears to come from seed/database modules now. | high | needs review |
| `src/data/mock/types.ts` | Mostly old mock types | `StatusTone` is still used by `src/lib/utils/status.ts`; other mock types appear tied to the unused mock dataset. | medium | needs review |
| `src/lib/sync/accountLinkingService.ts` | Account linking helper wrapper | Import graph shows no app imports. It may be planned auth/sync glue, so deletion needs owner approval. | medium | needs review |
| `src/data/schema.ts` exported type aliases | Some exported domain type aliases are not externally referenced | Export scan shows many public domain types without direct imports, but these may be intentional documentation/API types. | low | leave |
| `src/lib/sync/localModeService.ts` `getPendingSyncCount` | Exported helper | No external references found in current app scan. Could be intended for future sync UI. | low | leave |

Resolved in this cleanup:

- `src/App.css` removed.
- `src/assets/react.svg` removed.
- `src/assets/vite.svg` removed.
- `src/assets/hero.png` removed.
- `public/icons.svg` removed.
- Root dev/preview log files removed.

## 7. Duplicate Code Candidates

- `nextStepLabel` appears in both `src/features/dashboard/DashboardPage.tsx` and `src/features/projects/ProjectsPage.tsx`.
- `readinessTone` is duplicated in `src/features/project-templates/ProjectTemplatesPage.tsx` even though `src/lib/utils/status.ts` exports a richer version.
- `groupBy` appears in `src/data/hooks.ts` and `src/features/project-templates/ProjectTemplatesPage.tsx`.
- `formatDate` style helpers are repeated across dashboard, materials, my-tools, auth/account, and top bar files.
- Tool and material filter UIs are similar while `src/components/ui/FilterBar.tsx` remains unused.
- Tool and material pagination controls are nearly identical.
- Create/edit modal patterns are repeated inline in page files: projects, materials, my-tools, wishlist, project detail, and tool library.
- Archive flows still mix `window.confirm` in feature pages with `ConfirmDialog` in settings.
- Table/list empty states are implemented ad hoc or missing despite an unused `EmptyState` design-system component.
- Stat-card grids repeat across dashboard, materials, my-tools, projects, mastery, and gap analyzer pages.

## 8. Exact Phase 2 Code Editor Prompt

```text
You are the BenchOS Code Editor doing Phase 2 cleanup only.

Read CLEANER_AUDIT.md first. Do not change schemas, migrations, seed data, sync behavior, auth behavior, readiness logic, search ranking, routing behavior, or dependencies.

Make only this cleanup pass:
1. Move the `StatusTone` type out of `src/data/mock/types.ts` into an appropriate non-mock shared type location, then update imports.
2. After that, review whether `src/data/mock/mockData.ts` and the remaining mock-only types in `src/data/mock/types.ts` can be removed. Remove them only if no production or test imports remain.
3. Do not remove `src/components/ui/EmptyState.tsx`, `src/components/ui/FilterBar.tsx`, or `src/lib/sync/accountLinkingService.ts`.
4. Do not refactor large files yet.
5. Do not touch untracked planning/report docs unless explicitly asked.

After changes, run `npm run lint`, `npm run test`, and `npm run build`. Report exactly what changed, what remained, and any warnings. Stop there.
```
