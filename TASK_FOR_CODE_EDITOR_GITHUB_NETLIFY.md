# Task For Code Editor: GitHub + Netlify Preparation

You are the BenchOS Code Editor.

Do not start until the owner explicitly approves this task.

## Scope

Prepare BenchOS for GitHub + Netlify deployment.

Use a branch or worktree such as:

```text
code-editor-execution
```

Do not work directly on `main` unless the owner explicitly says to.

## Hard Rules

- Do not expose secrets.
- Do not print `.env` values.
- Do not commit `.env`, `.env.local`, `.env.production`, or any secret file.
- Do not delete files unless the owner approves the exact deletion.
- Do not refactor unrelated app code.
- Do not redesign the app.
- Do not change auth behavior.
- Do not change database schema.
- Do not install packages.
- Do not change dependencies.
- Do not run destructive Git commands.
- Preserve the orange BenchOS accent.
- Preserve Local Mode.

## First Inspect

Before editing, inspect and report:

- `git status --short --branch`
- `git remote -v`
- `package.json`
- `.gitignore`
- whether `netlify.toml` exists
- whether `public/_redirects` exists
- whether `.env.example` contains the expected variable names
- whether `src/App.tsx` still uses `BrowserRouter`

If `git status` shows unrelated changes, stop and ask the owner or Coordinator before editing.

Known current risk from the Planner pass:

```text
D  public/icons.svg
D  src/assets/hero.png
```

Do not restore or delete those files unless the owner explicitly approves what to do.

## Approved Implementation Items

If still needed after inspection, implement these small deployment prep items:

1. Create `netlify.toml` at the repo root with:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Do not create `public/_redirects` if `netlify.toml` handles the SPA redirect.

3. Verify `.gitignore` protects:

```text
.env
.env.*
*.local
node_modules
dist
```

4. Add `docs/DEPLOYMENT.md` with beginner-friendly instructions for:

- GitHub repo setup
- Netlify connection
- build command: `npm run build`
- publish directory: `dist`
- production branch: `main`
- deploy previews from pull requests
- environment variables by name only
- never committing secrets
- optional `NPM_FLAGS=--legacy-peer-deps` if Netlify install fails
- SPA routing fallback through `netlify.toml`

5. Update `README.md` with a short deployment section that points to `docs/DEPLOYMENT.md`.

## Environment Variable Rules

Mention variable names only:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_PUBLISHABLE_KEY
```

Recommended Netlify variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Do not include real values.

Do not mention Supabase service-role keys except to warn never to use them in the frontend.

## Verification

After edits, run:

```bash
npm run lint
npm run test
npm run build
```

If a command fails, do not hide it. Report:

- command run
- failure summary
- likely cause
- whether any files were changed before the failure

## Final Summary Required

At the end, summarize:

- files changed
- why each file changed
- checks run
- check results
- whether `netlify.toml` was created
- whether `public/_redirects` was intentionally not created
- any remaining owner action in GitHub or Netlify

## Do Not Do

- Do not connect GitHub remote.
- Do not push branches.
- Do not create the Netlify site.
- Do not add Netlify environment variable values.
- Do not edit Supabase migrations.
- Do not change app routing.
- Do not touch unrelated deleted files.
