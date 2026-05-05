# Code Editor HTTPS Security Summary

## Issue Reported

Chrome showed `Not secure` for `appbenchos.com` even though the certificate panel said the certificate was valid.

## Checks Performed

- Checked `https://appbenchos.com` response headers.
- Checked `http://appbenchos.com` redirect behavior.
- Checked `https://www.appbenchos.com` and `http://www.appbenchos.com` redirect behavior.
- Inspected the live HTML for `http://` asset references.
- Inspected deployed manifest, service worker registration, and built asset output for obvious insecure resource loads.
- Checked the live certificate metadata.

## Findings

- `https://appbenchos.com` returns HTTP `200` from Netlify.
- `http://appbenchos.com` redirects to `https://appbenchos.com`.
- Netlify is already sending `Strict-Transport-Security`.
- The live certificate is valid for `appbenchos.com`.
- The obvious `http://` strings found are SVG namespace strings, Auth0 protocol identifiers, localhost setup text, or SDK strings, not deployed asset requests.

## Files Changed

- `netlify.toml`
  - Added deployed security headers:
    - `Content-Security-Policy: upgrade-insecure-requests; block-all-mixed-content`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `X-Content-Type-Options: nosniff`
- `package.json`
  - Bumped version to `0.0.6`.
- `package-lock.json`
  - Bumped lockfile package version to `0.0.6`.
- `src/lib/version.ts`
  - Bumped visible app version to `v0.06`.
- `README.md`
  - Updated current app version.
- `VERSION_HISTORY.md`
  - Added the `v0.06` entry.
- `BENCHOS_COMMAND_CENTER.md`
  - Updated current version and logged the HTTPS hardening.
- `BENCHOS_PLANNER_REPORT.md`
  - Updated current version and version notes.

## Why This Is Safe

- This does not change routes, auth logic, Supabase logic, database schema, or product behavior.
- The new CSP directive only upgrades insecure subrequests and blocks mixed content on the deployed site.
- The app already uses HTTPS endpoints for Netlify, Auth0, and Supabase.

## Commands Run

- `curl.exe -I https://appbenchos.com`
- `curl.exe -I http://appbenchos.com`
- `curl.exe -I https://www.appbenchos.com`
- `curl.exe -I http://www.appbenchos.com`
- `Invoke-WebRequest -Uri 'https://appbenchos.com'`
- `Invoke-WebRequest -Uri 'https://appbenchos.com/manifest.webmanifest'`
- `Invoke-WebRequest -Uri 'https://appbenchos.com/registerSW.js'`
- `Invoke-WebRequest -Uri 'https://appbenchos.com/sw.js'`
- `git status --short --branch`
- `npm run lint`
- `npm run test`
- `npm run build`
- `git diff --check`

## Command Results

- `npm run lint` passed.
- `npm run test` passed: 17 test files, 79 tests.
- `npm run build` passed.
- `git diff --check` passed.
- Build still has the existing large chunk warning.

## Remaining Manual Browser Step

If Chrome still shows `Not secure` after this deploy, clear the browser's cached site state for `appbenchos.com`:

1. Open Chrome.
2. Visit `https://appbenchos.com`.
3. Press `Ctrl+Shift+R`.
4. If it still shows `Not secure`, click the warning, open **Site settings**, and clear/reset site data for `appbenchos.com`.
5. Close and reopen the tab.

## Recommended Next Step

After Netlify deploys this commit, re-open `https://appbenchos.com` in Chrome and verify the warning is gone.
