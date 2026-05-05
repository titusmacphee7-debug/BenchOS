# BenchOS Worktree Setup Summary

Git worktrees were created successfully for safe Codex work.

## Main Folder

```text
C:\Users\slaye\Documents\Codex\BenchOS
```

Branch:

```text
main
```

Purpose:

- Keep this as the trusted main BenchOS folder.
- Use it for review, documentation, and final checks.
- Do not run broad cleanup directly here.

## Worktrees Created

### BenchOS-audit

Folder:

```text
C:\Users\slaye\Documents\Codex\BenchOS-audit
```

Branch:

```text
audit-cleanup
```

Purpose:

- Audit/report only.
- Do not edit app code.
- Write findings, risks, and suggested cleanup order.

Prompt to run:

```text
Audit BenchOS for safe cleanup opportunities. Do not edit app code. Write a clear report with file references, risk level, and suggested order. Preserve existing features, routes, schema, auth, and the BenchOS orange accent.
```

### BenchOS-cleanup

Folder:

```text
C:\Users\slaye\Documents\Codex\BenchOS-cleanup
```

Branch:

```text
cleanup-phase-1
```

Purpose:

- Safe low-risk cleanup only.
- May edit code only within the approved cleanup scope.
- Must not redesign UI, change schema, change auth, rename routes, add dependencies, or delete files without approval.

Prompt to run:

```text
Make only safe, low-risk cleanup changes in BenchOS. Do not redesign UI, change schema, change auth, rename routes, add dependencies, or delete files without approval. Explain every change for a non-coder and run checks after edits.
```

### BenchOS-ui-polish

Folder:

```text
C:\Users\slaye\Documents\Codex\BenchOS-ui-polish
```

Branch:

```text
ui-polish-audit
```

Purpose:

- UI audit/report only.
- Preserve the current BenchOS design language.
- Preserve the orange accent.
- Do not edit app code unless you explicitly approve a later implementation pass.

Prompt to run:

```text
Audit the BenchOS UI for polish opportunities. Preserve the existing design and orange accent. Do not edit app code. Write a beginner-friendly report with screenshots or file references if useful.
```

## Worktree List Command

Command run:

```bash
git worktree list
```

Result:

```text
C:/Users/slaye/Documents/Codex/BenchOS           [main]
C:/Users/slaye/Documents/Codex/BenchOS-audit     [audit-cleanup]
C:/Users/slaye/Documents/Codex/BenchOS-cleanup   [cleanup-phase-1]
C:/Users/slaye/Documents/Codex/BenchOS-ui-polish [ui-polish-audit]
```

The actual commit id shown by `git worktree list` can change as setup docs are committed.

## Important Notes

- `.env`, `node_modules`, and `dist` are ignored and were not committed.
- Worktrees do not automatically get ignored local files like `.env.local`.
- If a worktree needs Supabase, create its own `.env.local` there.
- Do not ask Codex to print secret values.
- Avoid running multiple editing agents on the same files.
- Audit worktrees should write reports, not app changes.
- Code-editing worktrees should run checks before merge.

## Dependency Setup Completed

Dependencies were installed in all three worktrees with:

```bash
npm ci --legacy-peer-deps
```

Completed folders:

- `C:\Users\slaye\Documents\Codex\BenchOS-audit`
- `C:\Users\slaye\Documents\Codex\BenchOS-cleanup`
- `C:\Users\slaye\Documents\Codex\BenchOS-ui-polish`

npm reported 0 vulnerabilities in each worktree.

Notes:

- `node_modules` is ignored in each worktree.
- npm printed deprecation warnings for existing packages `source-map@0.8.0-beta.0` and `glob@11.1.0`.
- No dependency versions were changed.
- No app code was changed.

## Final Verification

These checks passed in the main BenchOS folder:

```bash
npm run lint
npm run test
npm run build
```

Test result:

```text
16 test files passed
76 tests passed
```

Build note:

- Production build completed successfully.
- Vite reported a chunk-size warning for a JavaScript bundle larger than 500 kB. This is a warning, not a failed build.

## Safe Review Flow

1. Open one worktree.
2. Give it only one job.
3. Ask it to explain changes in plain English.
4. Run checks.
5. Review changed files.
6. Merge only one branch at a time.
