# Netlify Deploy Fix Summary

## Problem

Netlify failed before the build step during dependency installation.

The failing pair was:

- `vite@8.0.10`
- `vite-plugin-pwa@1.2.0`

`vite-plugin-pwa@1.2.0` only declares peer compatibility through Vite 7, so npm refused to install the dependency tree on Netlify.

## Fix chosen

The latest `vite-plugin-pwa` release is still `1.2.0`, so there is no plugin upgrade available that supports Vite 8.

To avoid using `--legacy-peer-deps`, the Vite toolchain was adjusted to a compatible set:

- `vite` changed from `^8.0.10` to `^7.3.2`
- `@vitejs/plugin-react` changed from `^6.0.1` to `^5.2.0`
- `vite-plugin-pwa` stayed at `^1.2.0`

This keeps normal npm peer-dependency resolution working for Netlify.

## Files changed

- `package.json`
- `package-lock.json`
- `NETLIFY_DEPLOY_FIX_SUMMARY.md`

## Commands run

- `npm view vite-plugin-pwa@latest version peerDependencies --json`
- `npm view @vitejs/plugin-react@5 version peerDependencies --json`
- `npm view vite@7 version --json`
- `npm view vitest@4.1.5 peerDependencies --json`
- `npm install -D vite@^7.3.2 @vitejs/plugin-react@^5.2.0`
- `npm ls vite @vitejs/plugin-react vite-plugin-pwa`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm ci --dry-run`

## Results

- `npm install` completed successfully.
- `npm ls vite @vitejs/plugin-react vite-plugin-pwa` showed a valid tree using `vite@7.3.2`.
- `npm run lint` passed.
- `npm run test` passed: 17 test files, 80 tests.
- `npm run build` passed.
- `npm ci --dry-run` passed, confirming the lockfile can resolve cleanly.

## Warnings

- `npm install` reported a Windows cleanup warning while trying to remove an old native package folder inside ignored `node_modules`. This does not affect committed project files.
- The Vite build now reports a chunk-size warning for the main entry chunk. The build still succeeds.
- Existing unrelated local deletions remain unstaged and untouched:
  - `public/icons.svg`
  - `src/assets/hero.png`

## Netlify next step

Redeploy the latest `main` branch on Netlify after this commit is pushed.
