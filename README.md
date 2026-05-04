# BenchOS

BenchOS is a local-first workshop operating system for tools, materials, projects, readiness, mastery, diagnostics, and buying decisions.

## Local Development

```bash
npm install --legacy-peer-deps
npm run dev -- --host 127.0.0.1 --port 5173
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/).

## Optional Supabase Auth + Cloud Sync

BenchOS works fully in Local Mode without Supabase. To enable optional accounts and row-level cloud sync:

1. Create a Supabase project.
2. Copy `.env.example` to `.env`.
3. Add:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

4. Run the SQL migration in `supabase/migrations/20260504000000_phase4_auth_sync.sql`.
5. Add local Auth redirect URLs for `/login`, `/signup`, `/account`, and `/account-onboarding`.

Only user/workshop data syncs. Seeded catalog/library records stay local app data.

See [docs/supabase-setup.md](docs/supabase-setup.md) for the full setup checklist.

## Validation

```bash
npm run build
npm run lint
npm run test -- --run
```
