# Safety And Brand Rules

BenchOS generated tool images must be original, generic, and brand-neutral.

Rules:
- No logos.
- No brand marks.
- No brand text.
- No product names or model numbers.
- No watermarks.
- No signatures.
- No artist text.
- No exact product or trade-dress copying.
- No copyrighted style copying.
- No external image scraping.
- No reference image copying.

Use brand/model catalog data only to infer the generic tool type. Ignore brand colors, battery platform marks, badges, stickers, distinctive housing shapes, and exact product silhouettes.

If the source item is brand-specific, normalize it:

| Catalog label | Prompt-safe name |
| --- | --- |
| DeWalt 20V MAX Circular Saw | circular saw |
| Makita XSH03Z Circular Saw | circular saw |
| Milwaukee M18 Impact Driver | impact driver |
| Klein NCVT Voltage Tester | non-contact voltage tester |
| 3M Half Face Respirator | half-face respirator |

Reject or revise any prompt that asks for:
- A recognizable branded product.
- A copied reference image.
- A logo-like mark.
- A watermark or signature.
- A photorealistic product render.
