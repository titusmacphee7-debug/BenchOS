# BenchOS

BenchOS is a workshop operating system for tools, materials, projects, readiness, mastery, diagnostics, and buying decisions.

Current app version: `v0.04`

Version rule: every committed app/source-code change increases the visible app version by `0.01`. See [VERSION_HISTORY.md](VERSION_HISTORY.md).

## Local Development

```bash
npm install --legacy-peer-deps
npm run dev -- --host 127.0.0.1 --port 5173
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/).

## Supabase Auth

BenchOS production requires Supabase Auth before the dashboard and workshop pages open. Add these public frontend environment variables for local development and Netlify:

1. Create a Supabase project.
2. Copy `.env.example` to `.env`.
3. Add:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

4. Run the SQL migration in `supabase/migrations/20260504000000_phase4_auth_sync.sql` if you are testing the existing Supabase sync layer.
5. Add local Auth redirect URLs for `/login`, `/signup`, `/account`, and `/account-onboarding`.

Only user/workshop data syncs through the existing Supabase sync layer. Seeded catalog/library records stay app reference data. Netlify Database is planned as the production app data store in a later implementation slice.

See [docs/supabase-setup.md](docs/supabase-setup.md) for the full setup checklist.

## Netlify Deployment

BenchOS is ready to deploy to Netlify as a Vite + React app. Use `npm run build` as the build command and `dist` as the publish directory.

For the full setup checklist, including `appbenchos.com` DNS instructions and environment variable names, see [docs/NETLIFY_DEPLOYMENT.md](docs/NETLIFY_DEPLOYMENT.md).

## Validation

```bash
npm run build
npm run lint
npm run test -- --run
```
