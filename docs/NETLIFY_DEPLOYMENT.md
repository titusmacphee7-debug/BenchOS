# Netlify Deployment Guide

This guide walks through deploying BenchOS to Netlify at:

```text
appbenchos.com
```

BenchOS is a Vite + React single-page app. Netlify should build it with `npm run build` and publish the generated `dist` folder.

## A. Connect GitHub To Netlify

1. Log into Netlify.
2. Choose **Add new site** or **Add new project**.
3. Choose **Import from Git**.
4. Choose **GitHub** as the Git provider.
5. Select this repository:

```text
titusmacphee7-debug/BenchOS
```

6. Use these project settings:

```text
Production branch: main
Build command: npm run build
Publish directory: dist
```

7. Deploy the site.

The repo includes `netlify.toml`, so Netlify should also detect these build settings automatically.

## B. Add Environment Variables In Netlify

BenchOS uses Auth0 for production login. These are public SPA settings, not client secrets:

```text
VITE_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID
```

Use:

```text
VITE_AUTH0_DOMAIN=appbenchos.us.auth0.com
VITE_AUTH0_CLIENT_ID=Y0a2nfZcrGrwkAFWpeeHn6CoZPmcwCKh
```

Required API token audience for server-verified onboarding/API calls:

```text
VITE_AUTH0_AUDIENCE
AUTH0_DOMAIN
AUTH0_AUDIENCE
```

Required server-only Auth0 Management API variables for deleting an account:

```text
AUTH0_MANAGEMENT_CLIENT_ID
AUTH0_MANAGEMENT_CLIENT_SECRET
AUTH0_MANAGEMENT_AUDIENCE
```

Create or use an Auth0 Machine-to-Machine application that is authorized for the Auth0 Management API with the `delete:users` scope. Add the values in Netlify only. Never commit them to GitHub and never add them as `VITE_` variables.

Do not add Auth0 client secrets to this frontend app. Do not commit `.env` or `.env.local`.

## C. Initialize Netlify Database

BenchOS uses Netlify Database for production onboarding/workspace data.

For an existing project, Netlify's documented setup path is:

```bash
netlify database init
```

That setup installs/wires the database integration and creates the managed Postgres database for the site. The repo contains migrations in:

```text
netlify/database/migrations/
```

Netlify applies those migrations during production deploys and deploy previews after the database is initialized.

The deployed Functions need a server-only database connection in the Function runtime. BenchOS supports Netlify's current and legacy connection names:

```text
NETLIFY_DB_URL
NETLIFY_DATABASE_URL
DATABASE_URL
```

Do not add these as `VITE_` variables. Browser code must never receive database credentials.

## D. Auth0 Dashboard URLs

In the Auth0 dashboard, open the BenchOS SPA application and add:

```text
Allowed Callback URLs: http://localhost:5173, http://127.0.0.1:5173, https://appbenchos.com
Allowed Logout URLs:   http://localhost:5173, http://127.0.0.1:5173, https://appbenchos.com
Allowed Web Origins:   http://localhost:5173, http://127.0.0.1:5173, https://appbenchos.com
```

## E. Add The Custom Domain

In Netlify:

1. Open the BenchOS site dashboard.
2. Go to **Domain management**.
3. Choose **Add custom domain**.
4. Enter:

```text
appbenchos.com
```

5. If this is the main app URL, make `appbenchos.com` the primary domain.

## F. DNS Setup

DNS is what points `appbenchos.com` to your Netlify site.

### Case 1: Domain Uses An External DNS Provider

If your DNS is managed outside Netlify, create this DNS record with your DNS provider:

```text
Type: A
Host/Name: @
Value/Target: 75.2.60.5
```

Optional `www` redirect/alias:

```text
Type: CNAME
Host/Name: www
Value/Target: your actual Netlify site subdomain
```

The `www` target should look similar to `your-site-name.netlify.app`, but do not use that placeholder exactly. Copy the real Netlify subdomain from your Netlify site dashboard.

### Case 2: Domain Uses Netlify DNS

If you move DNS management to Netlify, follow Netlify's instructions for changing your domain's name servers.

After Netlify DNS is active, Netlify should manage the needed DNS records for `appbenchos.com`.

## G. HTTPS

After DNS points to Netlify, Netlify should automatically provision HTTPS for `appbenchos.com`.

DNS and HTTPS can take time to activate. It is normal for the custom domain or certificate to show as pending for a while after setup.

## H. Post-Deploy Testing Checklist

After Netlify says the deploy is live, test:

- `appbenchos.com` loads.
- Auth0 login opens Universal Login.
- Auth0 login returns to BenchOS after sign-in.
- Auth0 logout returns to BenchOS after sign-out.
- Netlify Database bootstrap succeeds after login.
- Workshop Setup Mission can be completed or skipped.
- Settings can open the account deletion modal and requires typing `DELETE`.
- Refreshing app routes works, such as `/tool-library` or `/projects`.
- Dashboard loads after onboarding is complete.
- Tool Library loads.
- Projects load.
- Wishlist loads.
- Browser console has no major errors.
- Mobile login layout is usable.

## Build Settings Reference

```text
Framework: Vite + React
Package manager: npm
Build command: npm run build
Publish directory: dist
Local dev command: npm run dev
Local preview command: npm run preview
```

## Routing Fallback

BenchOS uses React Router with `BrowserRouter`, so Netlify needs to serve `index.html` for app routes.

This is handled in `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Because `netlify.toml` handles this, `public/_redirects` is not needed.
