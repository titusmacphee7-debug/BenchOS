# BenchOS GitHub + Netlify Integration Plan

## 1. Current Repo Status

BenchOS is already a local Git repo.

Observed repo folder:

```text
C:\Users\slaye\Documents\Codex\BenchOS
```

Current branch:

```text
main
```

GitHub remote status:

- No Git remote is currently configured.
- `git remote -v` returned no remote entries.
- This means the local repo has not yet been connected to GitHub.

Current uncommitted changes:

```text
D  public/icons.svg
D  src/assets/hero.png
?? BENCHOS_COMMAND_CENTER.md
?? BENCHOS_PLANNER_REPORT.md
?? CLEANER_AUDIT.md
?? CODE_EDITOR_PHASE_1_SUMMARY.md
?? TASK_FOR_CODE_EDITOR.md
```

Important risk before pushing:

- Do not push this repo to GitHub until the deleted asset files are reviewed.
- The deleted files may be intentional cleanup, accidental deletion, or leftovers from another Codex task. This plan does not decide that.
- Several planning/summary files are untracked. Decide which ones should be committed before the first GitHub push.
- `.env` exists locally, but `.gitignore` ignores `.env`, `.env.*`, and `*.local`, which is good.
- Never commit real environment files or Supabase secret keys.

## 2. Framework + Build Detection

Detected framework/build tool:

- Vite
- React
- TypeScript
- React Router
- Tailwind CSS
- Vite PWA plugin

Package manager:

- npm
- `package-lock.json` exists.
- No `pnpm-lock.yaml`, `yarn.lock`, or `bun.lockb` was detected.

Install command:

```bash
npm install --legacy-peer-deps
```

Recommended Netlify install behavior:

- Netlify will detect npm from `package-lock.json`.
- If Netlify fails during dependency install because of peer dependency resolution, set this Netlify environment variable:

```text
NPM_FLAGS=--legacy-peer-deps
```

Dev command:

```bash
npm run dev
```

Local dev command from README:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Build command:

```bash
npm run build
```

Preview command:

```bash
npm run preview
```

Netlify publish directory:

```text
dist
```

Base directory:

- Use the repo root.
- `package.json`, `vite.config.ts`, and `index.html` are all in the root of `C:\Users\slaye\Documents\Codex\BenchOS`.
- No Netlify base directory override appears needed.

Package directory:

- No separate package directory appears needed.
- This is not a monorepo based on the inspected structure.

Node version:

- No `.nvmrc`, `.node-version`, or `engines.node` setting was detected.
- Netlify can use its default supported Node version first.
- If the first Netlify build fails because of Node version, set Node in the Netlify UI or create a version file in a later approved Code Editor task.

## 3. Required GitHub Setup

What to do in GitHub:

1. Create a new GitHub repository for BenchOS if it does not already exist.
2. Keep it private at first unless there is a clear reason to make it public.
3. Do not add a README, license, or `.gitignore` from GitHub if the local repo will be pushed as the source of truth.
4. Copy the GitHub remote URL.

What to do locally after reviewing uncommitted changes:

```bash
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

Use branches for Codex work:

- Do not let every Codex chat edit `main`.
- Create task branches for implementation, audits, docs, cleanup, and review.
- Push task branches to GitHub when the owner wants backup, review, or Netlify preview deploys.

Protect `main` if possible:

- Require pull requests before merging.
- Require at least one review for larger changes.
- Require the Netlify preview to be checked before merge.
- Consider requiring `npm run build`, `npm run lint`, and `npm run test` through GitHub Actions later.

Do not commit:

- `.env`
- `.env.local`
- `.env.production`
- Supabase service-role keys
- Any secret token
- `node_modules`
- `dist`

## 4. Recommended Branch Workflow

Use this branch model:

```text
main = stable live branch
code-editor-execution = implementation branch
planner-roadmap = planning/docs branch
cleanup-phase-1 = cleanup branch
review-qa = review branch
```

`main`:

- Stable branch.
- Netlify production deploys from this branch.
- Only merge after review and successful preview.
- Do not do experimental Codex editing directly here.

`code-editor-execution`:

- Use for approved feature or deployment implementation.
- Push when there is a working checkpoint or when a Netlify preview is needed.
- Open a pull request into `main`.
- Delete after merge if no longer needed.

`planner-roadmap`:

- Use for planning reports, roadmap docs, task briefs, and owner checklists.
- Push when planning docs should be backed up or reviewed.
- Merge into `main` when the owner wants the docs kept in the main repo.
- Safe to delete after merge.

`cleanup-phase-1`:

- Use only for approved low-risk cleanup.
- Push only after the cleanup scope is clear.
- Open a pull request into `main`.
- Delete after merge.
- Do not mix cleanup with feature work.

`review-qa`:

- Use for review notes, QA reports, and verification docs.
- Usually should not edit app code.
- Push when QA artifacts should be saved or attached to a PR.
- Merge only if the docs are useful to keep.

Beginner-safe rule:

- One Codex chat should own one branch at a time.
- Do not let multiple Codex agents edit the same branch or same files at once.

## 5. Required Netlify Setup

In Netlify:

1. Create a new Netlify site.
2. Choose "Import from Git" or equivalent GitHub connection flow.
3. Connect GitHub.
4. Select the BenchOS repository.
5. Set the production branch to:

```text
main
```

Build settings:

```text
Build command: npm run build
Publish directory: dist
Base directory: leave blank / repo root
Package directory: leave blank / repo root
```

Dependency setting:

- If npm install fails, add:

```text
NPM_FLAGS=--legacy-peer-deps
```

Deploy previews:

- Enable deploy previews for pull requests.
- Use deploy previews to test Code Editor branches before merging to `main`.

Branch deploys:

- Optional.
- Useful for long-running branches like `code-editor-execution`.
- Not required for docs-only planner branches unless the owner wants a preview.

Production deploy:

- Production deploy should come from `main`.
- After a pull request is reviewed and merged into `main`, Netlify should build and deploy production.

## 6. Netlify Environment Variables

BenchOS uses optional Supabase Auth and cloud sync.

Detected required/public variable names:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Detected fallback accepted by code:

```text
VITE_SUPABASE_PUBLISHABLE_KEY
```

Recommended Netlify variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Where to add them:

- Netlify site settings.
- Environment variables section.
- Add values for production.
- Add values for deploy previews if previews should use Supabase too.

Important notes:

- `.env.local` or `.env` is for your computer only.
- Netlify environment variables are for deployed builds.
- Vite only exposes variables beginning with `VITE_` to browser code.
- The Supabase anon/publishable key is public-client configuration, but still should be managed carefully.
- Never put a Supabase service-role key in BenchOS frontend code.
- Never commit env files to GitHub.

Optional Netlify build variable:

```text
NPM_FLAGS=--legacy-peer-deps
```

This is not a secret. Add it only if Netlify dependency installation needs it.

## 7. Routing / Redirects

BenchOS is a single-page app.

Evidence:

- `src/App.tsx` uses `BrowserRouter` from `react-router-dom`.
- The app has client-side routes such as `/projects`, `/tool-library`, `/wishlist`, `/login`, and `/account`.
- Vite builds static files into `dist`.

Likely needed for Netlify:

```text
public/_redirects:
/* /index.html 200
```

Why:

- Without a rewrite, direct visits or refreshes on routes like `/projects` may return a Netlify 404 because those files do not exist as physical HTML files.
- The rewrite tells Netlify to serve `index.html` and let React Router handle the route.

Current status:

- `public/_redirects` does not exist.
- `netlify.toml` does not exist.

Do not create `_redirects` yet unless explicitly approved.

## 8. netlify.toml Recommendation

Current status:

- `netlify.toml` is missing.

Recommendation:

- Create `netlify.toml` in a later approved Code Editor task.
- Prefer `netlify.toml` because it keeps build settings and SPA routing in one reviewed file.
- If `netlify.toml` is used for redirects, `public/_redirects` is not required.

Proposed content:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Not included yet:

- No secrets.
- No Supabase values.
- No branch-specific deployment rules.
- No Node version pin.
- No npm flags.

Optional later addition if Netlify install fails:

```text
Add NPM_FLAGS=--legacy-peer-deps in the Netlify UI.
```

## 9. Codex + Netlify Workflow

Recommended 5-chat workflow:

```text
Planner -> Cleaner -> Code Editor -> Reviewer / QA -> Coordinator
```

Planner:

- Creates plans and task briefs.
- May write planning markdown files.
- Does not edit app code.
- Uses `planner-roadmap` for planning docs if a branch is needed.

Cleaner:

- Audits cleanup opportunities.
- Writes cleanup reports.
- Does not delete files or edit app code unless a later cleanup implementation task is approved.
- Uses `cleanup-phase-1` only after cleanup scope is approved.

Code Editor:

- Implements approved changes.
- Uses `code-editor-execution`.
- Creates `netlify.toml` and/or `public/_redirects` only when approved.
- Runs checks after edits.
- Pushes branch when a Netlify deploy preview is needed.

Reviewer / QA:

- Reviews Code Editor changes.
- Tests the Netlify preview.
- Checks routes, Local Mode, Supabase optional mode, and core loop.
- Uses `review-qa` for report docs if needed.

Coordinator:

- Decides when a branch is ready to merge.
- Confirms the preview deploy was reviewed.
- Merges to `main` only after checks and owner approval.
- Watches for overlapping Codex work.

GitHub:

- Stores all branches.
- Provides pull requests for review.
- Keeps `main` stable.

Netlify:

- Creates deploy previews for pull requests.
- Can create branch deploys for selected branches.
- Deploys production from `main`.

## 10. Risks / Mistakes To Avoid

Avoid these mistakes:

- Committing `.env`, `.env.local`, or any secret file.
- Exposing Supabase service-role keys.
- Pushing current unreviewed deletions to GitHub.
- Pushing broken code directly to `main`.
- Setting the wrong Netlify publish directory.
- Forgetting Supabase env vars in Netlify.
- Forgetting the SPA rewrite and getting 404s on refresh.
- Letting multiple Codex agents edit the same branch at the same time.
- Merging without reviewing the Netlify preview.
- Treating deploy preview success as full product QA.
- Adding `NPM_FLAGS` with the wrong value if npm install fails.
- Changing auth, schema, routes, or deployment behavior without a narrow approved task.

## 11. Exact Tasks For Me

1. In GitHub:
   - Create a new private BenchOS repository.
   - Do not initialize it with a README, license, or `.gitignore`.
   - Copy the repo URL.

2. In the local repo:
   - Ask the Coordinator or Reviewer to inspect the current dirty Git status.
   - Decide what to do about `public/icons.svg` and `src/assets/hero.png`.
   - Decide which planning docs should be committed.
   - Only after review, connect the remote and push `main`.

3. In Netlify:
   - Import from GitHub.
   - Select the BenchOS repo.
   - Set production branch to `main`.
   - Set build command to `npm run build`.
   - Set publish directory to `dist`.
   - Leave base/package directory blank unless Netlify asks for a root path.

4. In Netlify environment variables:
   - Copy variable names from `.env.example`.
   - Copy values from your local `.env` or Supabase dashboard without sharing them in chat.
   - Add:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

   - If Netlify npm install fails, add:

```text
NPM_FLAGS=--legacy-peer-deps
```

5. Deployment branch:
   - Use `main` for production.
   - Use pull request deploy previews for implementation branches.

6. After first deployment, test:
   - Home page loads.
   - Refresh works on `/tool-library`.
   - Refresh works on `/projects`.
   - Refresh works on `/wishlist`.
   - Local Mode still works.
   - Supabase login/signup pages behave correctly if env vars are configured.
   - Tool Library loads catalog data.
   - Add to My Tools works.
   - Add to Wishlist works.
   - Project readiness pages still load.
   - No secrets appear in Netlify deploy logs.

Reference notes:

- Netlify docs describe `npm run build`-style build commands and publish directories for static/SPAs.
- Netlify docs recommend a `/* /index.html 200` rewrite for SPAs using client-side routing.
- Netlify docs support `NPM_FLAGS` for npm install flags such as `--legacy-peer-deps`.
