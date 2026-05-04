# Category Background Rules

Final BenchOS tool images use category-colored backgrounds that match the BenchOS UI category tag accents.

Required process:
1. Generate black line art on transparent or white background.
2. Resolve the category color from `scripts/composite-category-background.ts`.
3. Composite the line art onto that background with Sharp.
4. Store both `categoryColor` and `backgroundColor` in the manifest.

Do not ask the image model to invent or choose the background color.

The script color map mirrors the existing category accents in `src/lib/images/imageFallbackResolver.ts`, including:

| Category | Color |
| --- | --- |
| Cutting | `#ff6a00` |
| Drilling | `#38bdf8` |
| Fastening | `#f59e0b` |
| Sanding | `#a78bfa` |
| Measuring | `#60a5fa` |
| Layout | `#22d3ee` |
| Clamping | `#34d399` |
| Routing | `#c084fc` |
| Finishing | `#f472b6` |
| Safety | `#22c55e` |
| Dust Collection | `#67e8f9` |
| Shop Equipment | `#fb923c` |
| Automotive | `#f43f5e` |
| Electrical | `#fde047` |
| Plumbing | `#06b6d4` |
| Outdoor / Yard | `#84cc16` |

If a category is missing:
- Use the neutral fallback `#94a3b8`.
- Mark the manifest record with the fallback color.
- Report the missing category in validation.

If BenchOS later moves category colors into a shared token module, update the script map to import those tokens instead of duplicating values.
