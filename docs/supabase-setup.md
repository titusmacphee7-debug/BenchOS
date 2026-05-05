# BenchOS Supabase Setup

BenchOS production requires Supabase Auth for login. The existing Supabase sync layer still covers user/workshop data while Netlify Database is prepared in a later implementation slice.

## 1. Create Project

Create a Supabase project and copy the public client values from Project Settings.

Create a local `.env` file:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

Do not add a service-role key to the frontend. Do not commit real keys.

## 2. Apply Database Migration

Apply the SQL in:

```text
supabase/migrations/20260504000000_phase4_auth_sync.sql
```

The migration creates:

- `workshops`
- `user_profiles`
- `workshop_records`

All three tables have RLS enabled and authenticated-only owner policies using `auth.uid()`.

## 3. Configure Auth Redirect URLs

In Supabase Auth URL settings, allow local development URLs:

```text
http://127.0.0.1:5173
http://127.0.0.1:5173/login
http://127.0.0.1:5173/signup
http://127.0.0.1:5173/account
http://127.0.0.1:5173/account-onboarding
```

Add production URLs later when BenchOS is deployed.

## 4. Verify

Start BenchOS:

```text
npm run dev -- --host 127.0.0.1 --port 5173
```

Then create an account. After sign-up/sign-in, BenchOS should route to account onboarding. Completing onboarding stores profile, workshop, safety, brand, platform, and sensitivity answers locally, then syncs them through `workshop_records` when Supabase is configured.

If Supabase env vars are missing, BenchOS can still build, but production sign-in is unavailable and protected app pages remain behind the login screen.
