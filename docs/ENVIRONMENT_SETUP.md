# BenchOS Environment Setup

This guide lists the local setup commands and environment variable names for BenchOS. It does not include real secret values.

## Project Location

The BenchOS app folder found during setup is:

```text
C:\Users\slaye\Documents\Codex\BenchOS
```

## Framework

BenchOS is a Vite app using React, TypeScript, Tailwind CSS, and React Router.

## Package Manager

This project uses npm. Evidence:

- `package-lock.json` exists.
- No `pnpm-lock.yaml`, `yarn.lock`, or Bun lockfile was found.

## Install

Use the install command already documented in the README:

```bash
npm install --legacy-peer-deps
```

## Dev Server

Package script:

```bash
npm run dev
```

README local dev command:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Open:

```text
http://127.0.0.1:5173/
```

## Build

```bash
npm run build
```

This runs TypeScript checking through `tsc -b` and then builds with Vite.

## Lint

```bash
npm run lint
```

## Typecheck

There is no standalone `typecheck` script in `package.json`.

Use this instead:

```bash
npm run build
```

## Test

```bash
npm run test
```

## Preview

```bash
npm run preview
```

Optional local preview host/port form:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

## Environment Variables

BenchOS production requires Supabase env vars for sign-in. Without them, local development can start, but protected app pages stay behind the login screen.

Supabase Auth and the current cloud sync layer use these env names:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The code also accepts this key name as a fallback:

```text
VITE_SUPABASE_PUBLISHABLE_KEY
```

Do not put real values in this document.

## Env Files

Real env files must not be committed.

Safe examples:

- `.env.example` can be committed because it contains names and placeholders.
- `.env` should not be committed.
- `.env.local` should not be committed.

The current `.gitignore` ignores `.env`, `.env.*`, and `*.local`, while allowing `.env.example`.

For safety, prefer `.env.local` for local secrets in each worktree. Vite reads `.env.local`, and it stays ignored by Git.

## Do Worktrees Need Their Own Env File?

Yes, usually.

Git worktrees share Git history, but ignored local files like `.env.local` are not automatically shared between folders. If a worktree needs Supabase Auth or sync, copy only the env names and values into that worktree's own `.env.local`.

Never ask Codex to print the secret values. A safe instruction is:

```text
Check whether .env.local exists and list only the variable names, not the values.
```

## Current Worktree Dependency Status

Dependencies have been installed in the three setup worktrees with:

```bash
npm ci --legacy-peer-deps
```

Prepared worktrees:

- `C:\Users\slaye\Documents\Codex\BenchOS-audit`
- `C:\Users\slaye\Documents\Codex\BenchOS-cleanup`
- `C:\Users\slaye\Documents\Codex\BenchOS-ui-polish`

Each worktree that needs to open protected BenchOS pages should have its own `.env.local` with the Supabase public env values.

## Codex App Local Environment Setup

No `.codex` folder was found in this repo. Because Codex App local environment config formats can vary, do not guess a config file.

Set it up in the Codex App UI instead:

1. Open the BenchOS project in Codex.
2. Find the project's local environment or setup settings.
3. Add setup/install:

```bash
npm install --legacy-peer-deps
```

4. Add dev action:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

5. Add build action:

```bash
npm run build
```

6. Add lint action:

```bash
npm run lint
```

7. Add test action:

```bash
npm run test
```

8. Add preview action:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Repeat or confirm this setup for each worktree after the worktrees exist.

## Important Safety Notes

- Do not change database schema unless explicitly approved.
- Do not change authentication or login logic unless only documenting env vars.
- Do not rename routes or pages unless approved.
- Do not add dependencies unless approved.
- Do not print real secret values.
