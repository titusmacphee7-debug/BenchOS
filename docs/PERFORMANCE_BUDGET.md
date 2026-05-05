# BenchOS Performance Budget

BenchOS should optimize real interactivity first. Loading animation polish should never hide preventable JavaScript work.

## Current Budget Targets

- Initial logged-out shell JavaScript: keep as small as practical.
- Authenticated app shell JavaScript: keep under `250 KB gzip` where possible.
- Individual route chunks: keep under `120 KB gzip` unless documented.
- CSS: keep under `50 KB gzip`.
- TBT: target under `300ms`.
- LCP: target under `1.8s`.
- CLS: keep near `0`.

## Current Strategy

- Route modules stay lazy-loaded.
- Auth/session route state uses a lightweight hook instead of broad app data hooks.
- Local catalog seeding is deferred until after Auth0/session boot.
- Hashed Vite assets are long-cacheable on Netlify.
- Service worker files revalidate to avoid stale app shells.
- The hammer loader is delayed and lightweight.

## Verification Checklist

- Run `npm run build`.
- Confirm no large chunk warning.
- Run Lighthouse on `appbenchos.com` after deploy.
- Compare Total Blocking Time, JS boot-up, unused JS, and main-thread work.
- Test reduced-motion mode for the loader.
