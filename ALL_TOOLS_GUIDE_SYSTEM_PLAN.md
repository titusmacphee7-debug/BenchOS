# BenchOS All-Tools Guide System Plan

## Goal

BenchOS should provide a dedicated guide page for every Tool Library catalog item without writing or bundling 1,641 separate essays.

The guide system uses inheritance:

`Category Guide -> Tool Type Guide -> Brand/Model Overlay -> User-Owned Tool Layer`

This keeps guide pages useful while staying honest about what is generic, what is reviewed, and what is verified for a specific model.

## Current Reality

- Tool catalog seed contains 1,641 catalog items.
- Tool Library has 170 tool types, 153 brands, 51 battery platforms, 1,047 specs, and 1,813 source notes.
- Ten priority tool-type guide foundations already exist as structured content.
- Existing guide route was tool-type based at `/tool-guides/:toolTypeId`.
- BenchXP progress is Auth0/API-backed and must remain user-scoped.

## Implementation Direction

- Keep `/tool-guides/:guideSlug` as the catalog-specific canonical route.
- Keep `/tool-guides/types/:toolTypeId` for tool-type foundations.
- Support `/tools/:catalogItemId/guide` for direct catalog item lookup.
- Preserve old `/tool-guides/:toolTypeId` behavior by resolving known tool-type IDs safely.
- Generate unique slugs from catalog display names, suffixing collisions and reserved tool-type IDs.
- Show content status badges so template/fallback pages do not pretend to be fully reviewed model guides.

## Content Statuses

- `Complete`
- `Reviewed`
- `Needs Review`
- `Template-Based`
- `Model Overlay Missing`
- `Safety Review Required`
- `Specs Missing`
- `Image Missing`
- `Accessories Missing`
- `Project Links Missing`

## Safety Rules

- No unsafe shortcuts.
- No bypassing guards, manuals, codes, or qualified professional requirements.
- No fake model-specific specs or warnings.
- No certification language for BenchXP.
- High-risk categories must show safety-first content and review status.

## Performance Rules

- Do not import all guide bodies into the initial app bundle.
- Tool Library cards should use guide metadata/slug helpers only.
- Guide pages load content only when the route is opened.
- Template content should be generated from catalog/type metadata, not duplicated per item.
- User progress remains private and API-backed.

## Phase 1 Result

This pass implements the scalable foundation:

- catalog route index
- slug generation and collision handling
- old route compatibility
- inherited template fallback sections
- content status behavior
- catalog model context panel
- Tool Library guide links to catalog-specific pages
- tests that every seeded catalog item maps to a unique guide route

Full first-50 hand-authored guide foundations, admin QA tooling, and verified brand/model overlays remain follow-up work.
