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

```bash
npm install
```

## Dev Server

Package script:

```bash
npm run dev
```

Recommended local command:

```bash
npm run dev -- --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:5173/
```

The Vite script pins port `5173` with `--strictPort` for Auth0 callback consistency.

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

BenchOS production auth is Auth0-only.

Public frontend Auth0 env names:

```text
VITE_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID
```

Required API audience for server-verified Auth0 tokens:

```text
VITE_AUTH0_AUDIENCE
```

Server-only Auth0 env names for Netlify Functions:

```text
AUTH0_DOMAIN
AUTH0_AUDIENCE
```

Server-only Auth0 Management API env names for account deletion:

```text
AUTH0_MANAGEMENT_CLIENT_ID
AUTH0_MANAGEMENT_CLIENT_SECRET
AUTH0_MANAGEMENT_AUDIENCE
```

The Auth0 Management API credentials must be stored only in Netlify environment variables. They are used by the `delete-account` function to delete the currently verified Auth0 user after the user types `DELETE`.

Do not put real values in this document.

## Env Files

Real env files must not be committed.

Safe examples:

- `.env.example` can be committed because it contains names and placeholders.
- `.env` should not be committed.
- `.env.local` should not be committed.

The current `.gitignore` ignores `.env`, `.env.local`, `.env.*.local`, `node_modules`, `dist`, `build`, and `.DS_Store`.

For safety, prefer `.env.local` for local values in each worktree. Vite reads `.env.local`, and it stays ignored by Git.

Never ask Codex to print secret values. A safe instruction is:

```text
Check whether .env.local exists and list only the variable names, not the values.
```

## Data Direction

BenchOS production onboarding data uses Netlify Database through Netlify Functions.

Netlify Database is managed Postgres built into the Netlify workflow. Migrations live in:

```text
netlify/database/migrations/
```

Initialize it for the site with Netlify's database setup flow, then deploy so Netlify can apply migrations. Browser code must never receive database credentials.

## Current Worktree Dependency Status

Prepared worktrees from earlier setup:

- `C:\Users\slaye\Documents\Codex\BenchOS-audit`
- `C:\Users\slaye\Documents\Codex\BenchOS-cleanup`
- `C:\Users\slaye\Documents\Codex\BenchOS-ui-polish`

Each worktree that needs Auth0 login should use the same fixed local port `5173` and the same Auth0 allowed local URLs.

## Codex App Local Environment Setup

No `.codex` folder was found in this repo. Because Codex App local environment config formats can vary, do not guess a config file.

Set it up in the Codex App UI instead:

1. Open the BenchOS project in Codex.
2. Find the project's local environment or setup settings.
3. Add setup/install:

```bash
npm install
```

4. Add dev action:

```bash
npm run dev -- --host 127.0.0.1
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

- Do not print real secret values.
- Do not commit `.env`, `.env.local`, or other real env files.
- Do not expose database credentials to browser code.
- Keep Auth0 dashboard URLs aligned with the browser origin used for testing.
