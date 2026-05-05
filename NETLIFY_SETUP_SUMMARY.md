# Netlify Setup Summary

## Framework detected

BenchOS is a Vite + React single-page app.

Evidence:

- `package.json` uses `vite`.
- `src/App.tsx` uses React Router `BrowserRouter`.

## Package manager detected

npm.

Evidence:

- `package-lock.json` exists.
- Scripts are defined in `package.json`.

## Build command

```text
npm run build
```

## Publish directory

```text
dist
```

## Dev and preview commands

```text
npm run dev
npm run preview
```

## Supabase usage

Supabase is used for optional Auth and cloud sync. BenchOS still works in Local Mode without Supabase variables.

## Environment variable names required

Recommended Netlify variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Supported fallback key name:

```text
VITE_SUPABASE_PUBLISHABLE_KEY
```

No real values were read, printed, or committed.

## Files changed

- `netlify.toml`
- `docs/NETLIFY_DEPLOYMENT.md`
- `README.md`
- `NETLIFY_SETUP_SUMMARY.md`

## netlify.toml status

`netlify.toml` was created with:

```text
Build command: npm run build
Publish directory: dist
```

It also includes the SPA route fallback:

```text
/* -> /index.html
```

## Redirects status

`public/_redirects` was intentionally not created because `netlify.toml` handles the SPA redirect.

## .gitignore status

`.gitignore` already protects:

- `.env`
- `.env.local`
- `.env.*.local`
- `node_modules`
- `dist`
- `build`
- `.DS_Store`

## Commands run

- `git status --short --branch`
- `Get-Content package.json`
- `Get-Content .gitignore`
- `Get-Content .env.example`
- `git grep -n "VITE_SUPABASE\\|NEXT_PUBLIC_SUPABASE\\|SUPABASE" -- src docs .env.example README.md package.json vite.config.ts`
- `Select-String -LiteralPath src\App.tsx -Pattern BrowserRouter|HashRouter|Router`
- `git remote -v`
- Netlify read-only project lookup for `BenchOS`
- `npm run lint`
- `npm run test`
- `npm run build`

## Command results

- Netlify read-only lookup found no existing BenchOS project in the connected Netlify account.
- `npm run lint` passed.
- `npm run test` passed: 17 test files, 80 tests.
- `npm run build` passed.

## Exact manual Netlify steps still required

1. Log into Netlify.
2. Choose **Add new site** or **Add new project**.
3. Choose **Import from Git**.
4. Choose GitHub.
5. Select:

```text
titusmacphee7-debug/BenchOS
```

6. Use:

```text
Production branch: main
Build command: npm run build
Publish directory: dist
```

7. Deploy.
8. Add environment variables only if optional Supabase Auth/sync is needed.
9. Add the custom domain:

```text
app.benchos.com
```

10. Make `app.benchos.com` the primary domain if this should be the main app URL.

## Exact DNS record for app.benchos.com

If your DNS is managed outside Netlify, create this DNS record:

```text
Type: CNAME
Host/Name: app
Value/Target: copy the actual Netlify site subdomain from your Netlify dashboard
```

The target will look similar to:

```text
your-site-name.netlify.app
```

Do not use that placeholder exactly. Netlify creates the real subdomain after the site/project exists.

If your domain uses Netlify DNS, follow Netlify's name server instructions instead and let Netlify manage the needed DNS records.

## Warnings

- No Netlify site was created by this task.
- DNS was not changed by this task.
- The exact CNAME target cannot be known until the Netlify site exists.
- The local worktree still has unrelated pending deletions:
  - `public/icons.svg`
  - `src/assets/hero.png`
- Those deletions were not staged or committed.
- Existing untracked planning/task files remain uncommitted.
