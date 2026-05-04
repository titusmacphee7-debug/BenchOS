# BenchOS Codex Worktree Workflow

This guide explains how to use Codex safely on BenchOS. It is written for a non-coder.

## The Simple Idea

A Git worktree is a second copy of the same project folder, connected to the same Git history but checked out on a different branch.

That means one Codex session can inspect or edit one branch while another Codex session works somewhere else. If something goes wrong in one worktree, the main folder is easier to protect.

## Local vs Worktree

Local means the normal project folder:

```text
C:\Users\slaye\Documents\Codex\BenchOS
```

Use Local for:

- Reading the app.
- Running the app.
- Small approved documentation edits.
- Checking the current trusted state.

Worktree means a separate folder created by Git, usually next to the main folder.

Use worktrees for:

- Parallel Codex sessions.
- Audits.
- Cleanup experiments.
- UI review passes.
- Any work where you want an easy way to inspect changes before they touch the main folder.

## Planned Worktrees

Audit-only worktrees:

- `BenchOS-audit` on branch `audit-cleanup`
- `BenchOS-ui-polish` on branch `ui-polish-audit`

These should inspect the app and write reports. They should not edit app code unless you later approve it.

Code-editing worktree:

- `BenchOS-cleanup` on branch `cleanup-phase-1`

This one may make safe, low-risk cleanup edits only. It should not redesign the UI, rewrite the app, change schema, change auth, rename routes, add dependencies, or delete files without approval.

## Why Worktrees Are Safer

Worktrees help because each Codex session gets its own folder and branch.

This reduces the chance that two agents accidentally change the same file at the same time. It also gives you a clear place to review each set of changes before anything is merged.

## How To Avoid Agents Editing The Same Files

Give each Codex session a narrow job.

Good examples:

- Audit only: "Read the code and write a cleanup report. Do not edit app code."
- Docs only: "Update setup docs only."
- One feature area: "Only inspect Tool Library files and report risks."

Avoid broad prompts like:

```text
Clean up the whole app.
```

That is too vague and can cause overlapping edits.

## Beginner-Friendly Workflow

1. Start in the main BenchOS folder.
2. Ask Codex to run `git status`.
3. Only continue if Git says the working tree is clean.
4. Create or use one worktree for one specific task.
5. Tell that Codex session exactly what it may and may not edit.
6. Have Codex run checks after edits.
7. Review the changed files before merging.
8. Merge only one branch at a time.

## How To Review Changes

Ask Codex in that worktree:

```text
Show me what changed in beginner-friendly language. Do not make new edits.
```

Then ask:

```text
Run the available checks and summarize the result.
```

For BenchOS, useful checks are:

```bash
npm run lint
npm run test
npm run build
```

## How To Merge Safely

Safe merge checklist:

1. Confirm the worktree branch has a clear purpose.
2. Confirm the changed files match that purpose.
3. Confirm no schema, auth, dependency, route, or major UI redesign happened without approval.
4. Confirm checks passed or that any failure is clearly explained.
5. Merge one branch at a time.
6. Run checks again after merging.

If you are unsure, stop and ask Codex to explain the risk in plain English.

## Prompts To Use

For `BenchOS-audit`:

```text
Audit BenchOS for safe cleanup opportunities. Do not edit app code. Write a clear report with file references, risk level, and suggested order.
```

For `BenchOS-cleanup`:

```text
Make only safe, low-risk cleanup changes in BenchOS. Do not redesign UI, change schema, change auth, rename routes, add dependencies, or delete files without approval. Explain every change for a non-coder and run checks.
```

For `BenchOS-ui-polish`:

```text
Audit the BenchOS UI for polish opportunities. Preserve the existing design and orange accent. Do not edit app code. Write a report with screenshots or file references if useful.
```

## Current Status

At first, this folder did not contain a `.git` folder. Git was later installed successfully, this folder was initialized as a local Git repository, and the planned worktrees were created.

If plain `git` does not work immediately in Codex, restart Codex or open a new terminal so Windows refreshes the PATH. Git is installed at:

```text
C:\Program Files\Git\cmd\git.exe
```

See `WORKTREE_SETUP_SUMMARY.md` for the exact worktree folders, branches, and starter prompts.
