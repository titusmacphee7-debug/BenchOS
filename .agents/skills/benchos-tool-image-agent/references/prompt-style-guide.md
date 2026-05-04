# Prompt Style Guide

Use this exact template for generated tool-image prompts:

```text
Create an original black-and-white monoline technical illustration of a [TOOL NAME] for a workshop inventory app. Clean hand-drawn tool icon style, bold simple outline, minimal interior contour lines, centered object, 1:1 square composition, transparent or white background for compositing. No text, no labels, no watermark, no signature, no brand logos, no brand marks, no color on the tool, no photorealism, no people, no background scene.
```

Replace `[TOOL NAME]` with a generic, brand-neutral tool type such as `circular saw`, `cordless drill`, `random orbital sander`, or `floor jack`.

Do:
- Use internal tool type names first.
- Keep the requested object centered and alone.
- Ask for transparent or white background only because the category background is applied later.
- Keep the prompt short and consistent across tools.

Do not:
- Include brand, model, series, voltage platform branding, or logo names in the prompt.
- Ask for colored tools or category-colored backgrounds from the image model.
- Ask for packaging, UI labels, shop scenes, users, or hands.
- Describe an exact reference composition.

For catalog items:
- UI label: `DeWalt 20V MAX Circular Saw`
- Prompt name: `cordless circular saw` or `circular saw`
- UI label: `Milwaukee M18 Impact Driver`
- Prompt name: `impact driver`
- UI label: `3M Half Face Respirator`
- Prompt name: `half-face respirator`
