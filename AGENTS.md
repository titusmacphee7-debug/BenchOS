# AGENTS.md - BenchOS Codex Safety Guide

This file is for Codex agents working on BenchOS. Explain work clearly for a non-coder, move carefully, and preserve the existing product.

## BenchOS Identity

BenchOS is a local-first workshop/tool management app. It helps users manage tools, materials, projects, readiness, wishlist items, purchases, usage, maintenance, BenchXP, and Tool Mastery.

Core loop:

```text
Tool Library -> inventory -> projects -> readiness -> wishlist -> purchases -> more buildable projects -> skill progression
```

Current stack discovered from `package.json`:

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Dexie / IndexedDB
- Auth0 React SDK for production auth
- Vitest
- ESLint

## Product Rules

- Preserve existing features.
- Do not rewrite the app.
- Do not redesign the app.
- Preserve the BenchOS orange accent.
- Do not remove Tool Library, My Tools, Projects, Readiness, Wishlist, Materials, BenchXP, or Tool Mastery features.
- Do not change database schema unless explicitly approved.
- Do not change authentication or login logic unless the owner explicitly approves the auth task.
- Do not add new dependencies unless explicitly approved.
- Do not delete files unless clearly safe and approved.
- Do not rename routes, pages, or navigation items unless explicitly approved.
- Do not print secret values from `.env`, `.env.local`, or any other env file.

## Tool Library Rules

- Treat the Tool Library as the starting point of the BenchOS loop.
- Preserve catalog search, tool detail, and add-to-inventory flows.
- Keep Tool Library, My Tools, project requirements, readiness, wishlist, and purchases connected.
- Do not remove public inventory seed data or tool type relationships unless explicitly approved.
- When editing tool data, prefer small corrections over broad restructures.

## Image Rules

BenchOS tool images must stay brand-neutral and legally safe.

- No logos.
- No brand marks.
- No text inside generated tool images.
- No watermarks or signatures.
- No exact product or trade-dress copying.
- No photorealism.
- No people.
- No background scenes.
- Prefer centered square 1:1 tool illustrations.
- Use generic brand-neutral tool imagery even for brand/model catalog items.
- Generate one image per internal tool type first, then reuse it across brand/model catalog items.
- Follow `docs/TOOL_IMAGE_AGENT.md` for tool image work.
- Do not manually add random image files without updating the relevant manifest and validation flow.

## Tool Mastery Guide Rules

- Preserve BenchXP, Tool Mastery, tool usage logs, maintenance logs, and skill progression.
- Tool Mastery should remain tied to real workshop activity where possible.
- Do not remove deep tool guide content or mastery progress logic.
- If editing mastery logic, add or update focused tests.
- Keep educational guide text practical, workshop-safe, and beginner-friendly.

## Safe Coding Rules

- Make the smallest change that solves the task.
- Read nearby code before editing.
- Use the app's existing patterns instead of inventing a new architecture.
- Keep business logic out of UI components where existing code already separates it.
- Preserve TypeScript types.
- Add focused tests when changing logic.
- Do not change schema, auth, routes, or navigation without approval.
- Do not add dependencies without approval.
- Do not expose or log secrets.
- Run checks after edits and report what passed or failed.
- Explain changes clearly for a non-coder.

## Cleanup Rules

- Cleanup work must be low-risk and easy to review.
- Do not combine cleanup with redesigns, new features, schema changes, or auth changes.
- Do not delete files unless the user has approved the exact deletion.
- Prefer comments, documentation, tiny naming fixes, or clearly unused code removal only after evidence.
- Keep a clear list of changed files and why each changed.

## Worktree Rules

- Use Git worktrees for parallel Codex work once this folder is a real Git repository and the working tree is clean.
- Do not create worktrees if `git status` is dirty unless the user understands and approves the risk.
- Do not overwrite existing folders.
- Do not use destructive Git commands.
- Keep each worktree focused on one purpose.
- Avoid multiple agents editing the same files at the same time.
- Audit-only worktrees may inspect and write reports, but should not edit app code.
- Code-editing worktrees must run relevant checks before their changes are merged.

Recommended planned worktrees:

- `BenchOS-audit` on branch `audit-cleanup`: audit/report only.
- `BenchOS-cleanup` on branch `cleanup-phase-1`: safe low-risk cleanup only.
- `BenchOS-ui-polish` on branch `ui-polish-audit`: UI audit/report only.

## Commands

Discovered from `package.json`:

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run preview
```

No standalone `typecheck` script is currently defined. TypeScript checking is part of `npm run build` through `tsc -b && vite build`.

README development command:

```bash
npm install --legacy-peer-deps
npm run dev -- --host 127.0.0.1 --port 5173
```

## Environment Rules

- BenchOS production auth is Auth0-only.
- Public frontend Auth0 env names:
  - `VITE_AUTH0_DOMAIN`
  - `VITE_AUTH0_CLIENT_ID`
- Optional future API token audience:
  - `VITE_AUTH0_AUDIENCE`
- Browser code must never receive database credentials.
- Never print real env values.
- Never commit `.env`, `.env.local`, or other real env files.

## Final Response Rule

When finished, explain in plain English:

- What changed.
- Why it changed.
- Which files changed.
- Which checks were run.
- Any warnings or next steps.
