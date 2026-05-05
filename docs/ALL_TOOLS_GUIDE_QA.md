# All-Tools Guide QA Rules

BenchOS guide pages can be complete, reviewed, template-based, or missing model overlays. The UI must keep that status visible.

## Content Inheritance

Guide pages should resolve content in this order:

1. Category foundation
2. Tool-type foundation
3. Brand/model overlay
4. User-owned tool progress and evidence

If model-specific data is missing, the page should still be useful, but it must not invent specs, warnings, manuals, images, or compatibility claims.

## Safety Review Checklist

- PPE section exists.
- Setup checklist exists.
- Common mistakes exist.
- Maintenance guidance exists.
- Manual/manufacturer reminder exists.
- High-risk categories show strict review status.
- No guard-bypass instructions.
- No local-code or professional-work overconfidence.
- No BenchXP certification language.

## Missing Data Copy

Use calm, honest copy:

- `Model-specific notes are not fully reviewed yet.`
- `Specs unavailable. Check the manufacturer manual before setup.`
- `Accessory and compatibility metadata is thin or missing.`
- `BenchXP familiarity is guidance, not certification.`

## Performance Notes

- Catalog pages use generated route metadata.
- Full guide bodies load only on the guide route.
- Tool Library cards should not import all guide content.
- User progress must remain Auth0/API-backed and private.
