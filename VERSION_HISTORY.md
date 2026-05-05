# BenchOS Version History

## Version Rule

- Every committed app/source-code change must increase the visible BenchOS app version by `0.01`.
- The app version is tracked in `src/lib/version.ts`.
- The sidebar and Settings page read from that shared version file.
- `package.json` uses npm-safe semver, so app `v0.03` is represented as package version `0.0.3`.
- Coordinator, Planner, and implementation summaries should mention the current app version after each code-changing task.

## Current Version

```text
BenchOS v0.03
```

## History

### v0.03 - Mandatory Auth Shell

- Added mandatory login routing.
- Disabled the production Local Mode route.
- Removed visible Local Mode bypass copy and actions.
- Removed hardcoded `Titus` production fallbacks.
- Disabled automatic personal sample data seeding.
- Updated deployment docs for `appbenchos.com`.
- Commit range:
  - `6c1c519` mandatory auth implementation.
  - version tracking commit follows this history entry.

### v0.02 - Tool Library/Core Loop Baseline

- Existing visible app version before the mandatory auth shell.
- Tool Library, inventory, projects, readiness, wishlist, and mastery loop were already present.
