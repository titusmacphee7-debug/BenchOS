# Task For Code Editor

You are the BenchOS Code Editor. This task gives you permission to write code, refactor, touch risky areas when needed, and execute the plan below. Move carefully, explain decisions in plain English, and preserve the product.

## Authority For This Task

You may:

- Edit app code.
- Refactor shared components and app structure.
- Touch risky areas if needed to complete the ordered plan.
- Add or update focused tests.
- Delete or move code files only when the reason is clear and checks support it.
- Commit a coherent implementation if all required checks pass.

You must not:

- Print or expose values from `.env`, `.env.local`, or any other secret-bearing file.
- Use destructive Git commands such as `git reset --hard`, `git clean -fd`, `git checkout --`, force-push, or branch deletion.
- Install packages or add dependencies.
- Change real env files.
- Remove Local Mode.
- Remove Tool Library, My Tools, Projects, Readiness, Wishlist, Materials, BenchXP, Tool Mastery, or the BenchOS orange accent.
- Hide risky changes inside a vague summary.

## Starting Context

Work in:

```text
C:\Users\slaye\Documents\Codex\BenchOS
```

Read these first:

1. `AGENTS.md`
2. `BENCHOS_COMMAND_CENTER.md`
3. `BENCHOS_PLANNER_REPORT.md`
4. `CLEANER_AUDIT.md`
5. `CODE_EDITOR_EXECUTION_SUMMARY.md`
6. `package.json`

Known current context:

- Main branch is `main`.
- Existing app stack is React, Vite, TypeScript, Tailwind CSS, React Router, Dexie, Supabase client, Vitest, and ESLint.
- No standalone `typecheck` script exists. TypeScript checking is included in `npm run build`.
- Last documented checks passed: `npm run lint`, `npm run test`, and `npm run build`.
- Build still has a known Vite chunk-size warning.
- Reviewer / QA has not yet created `REVIEWER_RISK_REPORT.md`.

Before editing, run:

```bash
git status --short --branch
npm run lint
npm run test
npm run build
```

If baseline checks fail before your edits, stop and write what failed unless the failure is obviously caused by the task file or existing coordination docs.

## Goal

Execute one focused risk-capable hardening pass:

```text
Reduce initial app bundle risk, improve shared UI accessibility, remove confusing mock-type coupling, and keep the core BenchOS loop intact.
```

This is not a redesign and not a feature expansion. Preserve current routes, visual identity, data behavior, auth behavior, sync behavior, and Local Mode unless a change is required to fix a discovered bug.

## Ordered Plan

### 1. Protect the working tree

- Run `git status --short --branch`.
- Note existing untracked coordination/report files.
- Do not delete or rewrite coordination files unless this task specifically names them.
- Avoid mixing unrelated changes into the implementation commit.

### 2. Inspect the route setup

Look at:

- `src/app/routes.tsx`
- Any nearby router/app shell files imported by it.
- Existing route tests, if any.

Implement route-level lazy loading/code splitting if the current route file imports every page eagerly.

Requirements:

- Keep every existing URL path the same.
- Keep navigation behavior the same.
- Keep auth/local-mode behavior the same.
- Use React/Vite/React Router patterns already available in the project.
- Do not add dependencies.
- Add a simple shared loading fallback only if needed for `Suspense`.
- Keep the fallback visually quiet and consistent with BenchOS.

Expected result:

- Feature pages are loaded lazily where practical.
- `npm run build` should still pass.
- The Vite chunk-size warning should be improved if possible, but passing checks matter more than eliminating the warning.

### 3. Harden modal and dialog accessibility

Look at:

- `src/components/ui/Modal.tsx`
- `src/components/ui/ConfirmDialog.tsx`
- Call sites that pass titles, descriptions, open/close handlers, or confirm/cancel actions.

Improve accessibility while preserving the existing API where possible.

Requirements:

- Dialogs should expose appropriate `role`, `aria-modal`, and accessible labelling.
- Escape key behavior should close dismissible dialogs when that matches existing behavior.
- Focus should move into the dialog when it opens.
- Focus should return to the previously focused element when it closes when practical.
- Overlay click behavior should not become more dangerous for confirm/destructive dialogs.
- Existing styling and layout should remain recognizably the same.

Add or update focused tests if the project already has nearby component tests. If tests are not practical, explain why in the summary.

### 4. Harden DataTable keyboard accessibility

Look at:

- `src/components/ui/DataTable.tsx`
- Pages that use clickable rows.

Improve keyboard and screen-reader behavior without redesigning the table.

Requirements:

- Clickable rows must also be keyboard reachable.
- Enter and Space should activate the same action as click.
- Add appropriate roles or semantic markup based on the existing structure.
- Preserve current visual styling and row behavior.
- Do not break pages that use the table for non-clickable rows.

Add focused tests if practical.

### 5. Remove mock-type coupling

Cleaner noted that production code imports `StatusTone` through mock data types. Fix that coupling.

Look at:

- `src/data/mock/types.ts`
- `src/lib/utils/status.ts`
- Any files importing `StatusTone`

Requirements:

- Move `StatusTone` to a real shared type location, such as `src/lib/types/status.ts` or another existing project-appropriate type module.
- Update imports.
- Do not change runtime behavior.
- Do not refactor unrelated mock data.
- Do not delete `src/data/mock/*` unless you find a clear, tested reason and explain it.

### 6. Run core-loop checks from source

After implementation, inspect or test enough of the core loop to make sure your refactor did not break it:

```text
Tool Library -> My Tools -> Projects -> Readiness -> Wishlist -> Purchase/Convert -> Tool Mastery
```

At minimum, verify that the routes/components involved still import, compile, and are reachable through the router.

If you find a broken core-loop bug caused by your changes, fix it before finishing.

If you find an unrelated existing bug, document it in the summary instead of expanding the task.

### 7. Run required checks

Run these after all edits:

```bash
npm run lint
npm run test
npm run build
git diff --check
```

If any check fails, either fix the failure or clearly explain why it remains.

### 8. Write the execution summary

Create or update:

```text
CODE_EDITOR_RISK_PASS_SUMMARY.md
```

Include:

- What changed.
- Why each risky area was touched.
- Files changed.
- Tests added or updated.
- Commands run.
- Check results.
- Any build warnings.
- Any remaining risks.
- Any items that should go to Reviewer / QA.

### 9. Commit only if coherent

If all required checks pass, make one implementation commit.

Rules:

- Use `git add` with explicit file paths.
- Do not accidentally commit unrelated untracked coordination files unless they are part of this task.
- Do not use destructive Git commands.
- Suggested commit message:

```text
Harden routing and shared UI accessibility
```

If checks fail or the work is incomplete, do not commit. Leave a clear summary instead.

## Stop Conditions

Stop and summarize instead of continuing if:

- You would need a new dependency.
- You would need to print or inspect secret values.
- You would need a destructive Git command.
- You would need a database migration.
- A route/auth/sync change becomes larger than this hardening pass.
- The app cannot pass baseline checks before your edits.

## Final Output Expected From Code Editor

When finished, report:

- Whether a commit was created.
- The commit hash if created.
- Files changed.
- Checks run and results.
- Whether the Vite chunk-size warning changed.
- Any remaining risks for Reviewer / QA.
