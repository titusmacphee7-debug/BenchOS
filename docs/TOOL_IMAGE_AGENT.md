# BenchOS Tool Image Agent

The repo-local Codex skill at `.agents/skills/benchos-tool-image-agent` plans, generates, composites, and validates BenchOS Tool Library images.

Invoke it for generated tool-image prompts, category-colored tool icons, missing catalog images, regeneration, and manifest updates. Do not use it for normal UI work, readiness logic, image scraping, or branded product/logo images.

## Commands

Dry-run prompt planning:

```bash
npm run images:prompts -- --dry-run --limit 10
```

Generate one image later:

```bash
npm run images:generate -- --tool circular-saw --limit 1 --skip-existing
```

Generate one image locally without OpenAI API billing:

```bash
npm run images:local -- --tool circular-saw
```

Generate a small sample batch later:

```bash
npm run images:generate -- --category Cutting --limit 3 --skip-existing
```

Generate a local sample batch without OpenAI API billing:

```bash
npm run images:local -- --category Cutting --limit 3
```

Validate outputs:

```bash
npm run images:validate
```

Plan generation without calling the image API:

```bash
npm run images:plan
```

## Image Style

Generated images should be original black-and-white monoline technical illustrations: clean hand-drawn workshop icon style, bold simple outline, minimal interior contour lines, centered object, square 1:1 composition.

Do not include text, labels, watermarks, signatures, brand logos, brand marks, photorealism, people, or background scenes. Use the circular saw reference only as broad style inspiration; do not copy it directly.

## Brand And Legal Safety

Brand/model names stay in BenchOS UI text and manifest context, not inside generated images. A catalog item like `DeWalt 20V MAX Circular Saw` should become a prompt for `circular saw` or `cordless circular saw`.

Do not copy exact product trade dress, logo placement, distinctive colorways, or exact reference compositions.

## Category Backgrounds

The image model generates transparent or white-background black line art. The final category background is applied by `composite-category-background.ts` using the BenchOS category colors mirrored from `src/lib/images/imageFallbackResolver.ts`.

If API billing is unavailable, `generate-local-tool-images.ts` creates deterministic SVG/PNG icons locally using the same category background colors and manifest fields.

To change category colors, update the app category token source first, then update the script color map to match. Validation reports missing category colors and color mismatches.

## Tool Library Connection

Generate one image per `internalToolTypeId` first, then reuse it across brand/model catalog tools. The manifest records the internal tool type, optional catalog item id, category, colors, prompt, model, PNG path, optional SVG path, status, timestamp, and errors.

## Regenerating A Bad Image

Use the internal tool type id and overwrite intentionally:

```bash
npm run images:generate -- --tool circular-saw --limit 1 --no-skip-existing
```

Then validate:

```bash
npm run images:validate -- --tool circular-saw
```
