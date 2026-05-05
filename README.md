# BenchOS

BenchOS is a workshop operating system for tools, materials, projects, readiness, mastery, diagnostics, and buying decisions.

Current app version: `v0.08`

Version rule: every committed app/source-code change increases the visible app version by `0.01`. See [VERSION_HISTORY.md](VERSION_HISTORY.md).

## Local Development

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/).

The dev script uses port `5173` with `--strictPort` so Auth0 callback URLs do not drift to another Vite port.

## Auth0 Login

BenchOS production auth is Auth0-only. The app uses the official Auth0 React SDK for login, signup, session state, and logout.

Current public Auth0 app settings:

```text
VITE_AUTH0_DOMAIN=appbenchos.us.auth0.com
VITE_AUTH0_CLIENT_ID=Y0a2nfZcrGrwkAFWpeeHn6CoZPmcwCKh
```

Add these URLs in the Auth0 application before testing login:

```text
Allowed Callback URLs: http://localhost:5173, http://127.0.0.1:5173, https://appbenchos.com
Allowed Logout URLs:   http://localhost:5173, http://127.0.0.1:5173, https://appbenchos.com
Allowed Web Origins:   http://localhost:5173, http://127.0.0.1:5173, https://appbenchos.com
```

See [docs/AUTH0_SETUP.md](docs/AUTH0_SETUP.md) for the beginner checklist.

## Data Direction

BenchOS uses Netlify Functions plus Netlify Database for production onboarding/workspace data. Netlify Database is managed Postgres built into the Netlify deploy workflow.

New accounts start clean; starter sample data is not loaded automatically. Browser code must never receive database credentials.

The onboarding schema lives in:

```text
netlify/database/migrations/
```

Netlify applies these migrations during deploys once Netlify Database is initialized for the site.

## BenchXP And Tool Mastery

BenchXP is familiarity/readiness guidance, not certification or proof of safe competence. Tool Mastery guides combine practical reading, setup habits, safety review, practice, project use, maintenance, and evidence.

See [docs/BENCHXP_GUIDE_PHILOSOPHY.md](docs/BENCHXP_GUIDE_PHILOSOPHY.md).

## Netlify Deployment

BenchOS deploys to Netlify as a Vite + React single-page app. Use `npm run build` as the build command and `dist` as the publish directory.

For the full setup checklist, including `appbenchos.com` DNS instructions and environment variable names, see [docs/NETLIFY_DEPLOYMENT.md](docs/NETLIFY_DEPLOYMENT.md).

## Validation

```bash
npm run lint
npm run test
npm run build
```
