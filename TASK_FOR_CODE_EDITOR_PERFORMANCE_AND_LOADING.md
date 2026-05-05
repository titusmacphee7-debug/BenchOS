# Task For Code Editor: BenchOS Performance + Hammer Loading

Read `BENCHOS_PERFORMANCE_AND_LOADING_PLAN.md` first.

## Goal

Improve BenchOS load speed and responsiveness, especially Total Blocking Time, then add a lightweight premium hammer reveal loader that does not make performance worse.

## Rules

- Preserve Auth0-only mandatory login.
- Do not expose secrets.
- Do not commit `.env` files.
- Do not run destructive Git commands.
- Do not add fake/demo/Titus production data.
- Do not hide real slowness behind a long animation.
- Keep the loader lightweight.
- Do not use video, GIF, Lottie, or heavy animation libraries.
- Do not install packages unless the owner explicitly approves.
- localStorage may only be used for harmless UI preferences, not core production app data.

## Performance Tasks

1. Run `npm run build` and inspect bundle output.
2. Reduce startup imports, especially broad imports from `data/hooks.ts`.
3. Remove or isolate production boot dependency on local/Dexie seeding.
4. Keep route-level lazy loading and improve Suspense boundaries.
5. Add route-specific skeleton or delayed loading states.
6. Avoid loading all guide/tool/project data at startup.
7. Review service worker/PWA behavior.
8. Add conservative Netlify caching headers for hashed assets and service worker files.
9. Update docs with performance budget and verification notes.

## Hammer Loader Tasks

1. Create a lightweight CSS/SVG hammer reveal loader.
2. Use CSS transforms and opacity only.
3. Show no hammer loader for loads under `250ms`.
4. Show quick hammer reveal for major route/app loads over `250ms`.
5. For loads over `1200ms`, show honest loading text.
6. Do not delay real page readiness just to finish the animation.
7. Add reduced-motion support.
8. Add accessible loading text with `role="status"` / `aria-live`.

## Checks

- `npm run build`
- `npm run lint`
- `npm run test`

Create `CODE_EDITOR_PERFORMANCE_AND_LOADING_SUMMARY.md` with:

- What changed.
- Files changed.
- Before/after bundle observations.
- Remaining TBT/main-thread risks.
- Loader behavior.
- Reduced-motion/accessibility notes.
- Checks passed/failed.
- Follow-up tasks.

Commit only if checks pass.
