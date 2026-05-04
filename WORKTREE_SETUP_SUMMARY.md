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
C:/Users/slaye/Documents/Codex/BenchOS           f25551b [main]
C:/Users/slaye/Documents/Codex/BenchOS-audit     f25551b [audit-cleanup]
C:/Users/slaye/Documents/Codex/BenchOS-cleanup   f25551b [cleanup-phase-1]
C:/Users/slaye/Documents/Codex/BenchOS-ui-polish f25551b [ui-polish-audit]
```

## Important Notes

- `.env`, `node_modules`, and `dist` are ignored and were not committed.
- Worktrees do not automatically get ignored local files like `.env.local`.
- If a worktree needs Supabase, create its own `.env.local` there.
- Do not ask Codex to print secret values.
- Avoid running multiple editing agents on the same files.
- Audit worktrees should write reports, not app changes.
- Code-editing worktrees should run checks before merge.

## Safe Review Flow

1. Open one worktree.
2. Give it only one job.
3. Ask it to explain changes in plain English.
4. Run checks.
5. Review changed files.
6. Merge only one branch at a time.
