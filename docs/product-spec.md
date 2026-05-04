# BenchOS Product Spec

BenchOS is a local-first workshop operating system for tools, materials, projects, wishlist items, and tool mastery.

## Product Loop

1. Search the Tool Library.
2. Add owned tools to My Tools.
3. Track materials and stock levels.
4. Create projects.
5. Add tool, capability, category, and material requirements.
6. Run readiness checks.
7. Add missing items to Wishlist.
8. Convert purchased items into inventory.
9. Log tool and material usage.
10. Earn BenchXP and improve Tool Mastery.

## Phase 1 Scope

Phase 1 is a polished static UI shell with mock data only.

Included:
- App shell and navigation.
- Dark-first design system.
- Dashboard mock data.
- Tool Library mock data.
- My Tools table and detail panel.
- Materials table and detail panel.
- Projects list and project detail page.
- Wishlist shell.
- Tool Mastery shell.
- Settings shell.

Not included:
- Local database.
- CRUD behavior.
- Real search.
- Readiness calculation.
- Import/export behavior.
- Persistence.

## Phase 2 Direction

Phase 2 should add Dexie-backed IndexedDB storage, real local search, ToolPicker flows, My Tools CRUD, and Materials CRUD.
