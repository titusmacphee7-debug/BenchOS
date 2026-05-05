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

BenchOS uses Auth0 for primary production login. The current Auth0 domain and client ID are included as public defaults in the app. If you want Netlify to control them instead, add these public frontend variables:

```text
VITE_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID
```

Use:

```text
VITE_AUTH0_DOMAIN=appbenchos.us.auth0.com
VITE_AUTH0_CLIENT_ID=Y0a2nfZcrGrwkAFWpeeHn6CoZPmcwCKh
```

BenchOS also supports Supabase Auth and cloud sync as a fallback. Add these public Supabase variables in Netlify if you want the existing sync feature.

In Netlify:

1. Open the BenchOS site dashboard.
2. Go to **Site configuration** or **Project configuration**.
3. Open **Environment variables**.
4. Add these variable names:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

BenchOS also recognizes this public fallback key name if needed:

```text
VITE_SUPABASE_PUBLISHABLE_KEY
```

Use the values from your local `.env.local` or Supabase project dashboard, but never paste those values into GitHub, docs, chat, or committed files.

Never use a Supabase service-role key in BenchOS frontend settings. Service-role keys are server-only secrets.

## C. Add The Custom Domain

In Netlify:

1. Open the BenchOS site dashboard.
2. Go to **Domain management**.
3. Choose **Add custom domain**.
4. Enter:

```text
appbenchos.com
```

5. If this is the main app URL, make `appbenchos.com` the primary domain.

## D. DNS Setup

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

## E. HTTPS

After DNS points to Netlify, Netlify should automatically provision HTTPS for `appbenchos.com`.

DNS and HTTPS can take time to activate. It is normal for the custom domain or certificate to show as pending for a while after setup.

## F. Post-Deploy Testing Checklist

After Netlify says the deploy is live, test:

- `appbenchos.com` loads.
- Auth0 login opens Universal Login.
- Auth0 login returns to BenchOS after sign-in.
- Auth0 logout returns to BenchOS after sign-out.
- Supabase connection works if Supabase variables were added.
- Refreshing app routes works, such as `/tool-library` or `/projects`.
- Dashboard loads.
- Tool Library loads.
- Projects load.
- Wishlist loads.
- Browser console has no major errors.
- Mobile layout is usable.

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
