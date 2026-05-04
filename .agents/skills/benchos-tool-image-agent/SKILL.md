---
name: benchos-tool-image-agent
description: Use this skill when creating, validating, or managing BenchOS generated tool images, tool-image prompts, category-colored image backgrounds, image manifests, or line-art image generation scripts.
---

# BenchOS Tool Image Agent

Use this skill for BenchOS Tool Library image work only. It creates prompt plans, generates brand-neutral line-art tool images through scripts, composites category-colored backgrounds, and validates the image manifest.

Trigger examples:
- "Generate BenchOS tool image prompts"
- "Create tool images for the library"
- "Generate category-colored tool icons"
- "Validate generated tool images"
- "Regenerate the circular saw image"
- "Create images for missing tool catalog items"
- "Update the tool image manifest"

## When To Use

Use this skill when the request involves:
- BenchOS tool-image prompts or prompt review.
- OpenAI Images API generation for BenchOS tool art.
- Category-colored image backgrounds for tool images.
- Tool image manifests and metadata.
- Batch planning for missing tool catalog images.
- Regeneration of a bad BenchOS tool illustration.

Do not use this skill for normal UI work, project readiness logic, external image scraping, copying reference images, or branded logo/product image generation.

## Core Workflow

1. Read the relevant references before acting:
   - `references/prompt-style-guide.md` for prompt wording and style.
   - `references/safety-and-brand-rules.md` for no-logo/no-watermark and brand-neutral rules.
   - `references/category-background-rules.md` for category colors and compositing.
2. Generate prompt plans first. Do not generate all images unless the user explicitly asks for a batch.
3. If API billing is unavailable or the user asks for a no-cost route, use `scripts/generate-local-tool-images.ts` to create deterministic local SVG/PNG monoline icons.
4. Prefer one generated image per internal tool type, then reuse it across brand/model catalog items.
5. For OpenAI image generation, generate transparent or white-background black line art.
6. Composite the final PNG onto the category color with `scripts/composite-category-background.ts`.
7. Update the manifest with category color, background color, prompt, model, paths, status, timestamp, and any error.
8. Validate before reporting completion.

## Image Style Rules

All generated BenchOS tool images must be:
- Original black-and-white monoline technical illustrations.
- Clean hand-drawn workshop icon style.
- Bold simple outline with minimal interior contour lines.
- Centered object in a square 1:1 composition.
- No text, labels, watermark, signature, brand logos, or brand marks.
- No photorealism, people, or background scene.

Use any attached circular saw example only as broad style inspiration. Do not copy it directly and do not recreate its exact composition.

## Category Background Rules

The tool drawing stays black line art. The image model must not choose the final background color.

Use the script's category color map, which mirrors the existing BenchOS category tag accent colors from `src/lib/images/imageFallbackResolver.ts`. If a category is missing, use the neutral fallback and report it during validation.

## Brand-Neutral Rules

Brand/model names belong in UI text, not in generated images. For a catalog item like "DeWalt 20V MAX Circular Saw", prompt for "cordless circular saw" or "circular saw". Do not include the brand, logo, text, color trade dress, or exact product configuration.

## Required Output Structure

Manifest records must include:
- `id`
- `catalogItemId`, optional
- `internalToolTypeId`
- `categoryId`
- `categoryName`
- `categoryColor`
- `backgroundColor`
- `displayName`
- `normalizedToolName`
- `prompt`
- `model`
- `pngPath`
- `svgPath`, optional
- `status`
- `generatedAt`
- `error`, optional

## Scripts

Run scripts through npm when possible:

```bash
npm run images:prompts
npm run images:plan
npm run images:generate
npm run images:local
npm run images:validate
```

Useful direct forms:

```bash
npm run images:prompts -- --dry-run --limit 10
npm run images:generate -- --tool circular-saw --limit 1 --skip-existing
npm run images:local -- --tool circular-saw
npm run images:validate
```

Do not run `images:generate` unless the user explicitly asks for image generation. Use `images:plan` or `--dry-run` for planning.

Use `images:local` when OpenAI API billing is unavailable or when the user wants generated BenchOS-owned procedural icons without external image calls.

## Validation Checklist

Before finishing any image-generation task, verify:
- Prompt uses generic tool names, not brand/model names.
- Prompt includes no text, labels, watermark, signature, logos, brand marks, color on the tool, photorealism, people, or background scene.
- Background color comes from the BenchOS category color map, not the image model.
- Manifest records exist for intended internal tool types.
- Generated PNG paths exist for records marked `generated`.
- Missing categories use the neutral fallback and are reported.
- No batch generation happened unless explicitly commanded.
