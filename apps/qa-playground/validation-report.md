# Figma → QA pipeline validation report

**Date:** 2026-05-11 (updated)  
**Figma URLs**

| Route | Node | URL |
| --- | --- | --- |
| `/figma-pipeline/button` | `2459:24854` | [Button doc frame](https://www.figma.com/design/mH1yPtRJzZSNCS0kX737t6/%E2%9D%96--Backup-2026-05-04--OneUI-Components?node-id=2459-24854&m=dev) |
| `/figma-pipeline/2459-24856` | `2459:24856` | [Container around grid](https://www.figma.com/design/mH1yPtRJzZSNCS0kX737t6/%E2%9D%96--Backup-2026-05-04--OneUI-Components?node-id=2459-24856&m=dev) |

## 1. Figma data (`get_figma_data`)

- **`2459:24854`** — full **Button** documentation frame (header + large variant matrix).  
- **`2459:24856`** — **Container** → **Grid** of **`ComponentBGCell`** (~240 instances in MCP); the export is mostly cell chrome without expanded inner Button props.

## 2. React pages (aligned with Figma Button library)

Both pipeline routes render **`ButtonQaShowcase`** — the same canvas as `/c/button`: sizes (contained / condensed / uncontained), attention, full width, states, loading, slots, single-text, multi-accent matrix. That matches the **Figma Button** screenshot structure (wide matrix, pill buttons, icons, full-width rows), not a separate 3×3 slug grid.

- **`src/pages/FigmaPipelineButtonPage.tsx`** — `2459:24854` + `wrapFullBleed` for full-width layout.  
- **`src/pages/FigmaPipelineContainer245924856Page.tsx`** — `2459:24856` + same showcase (Container wraps that matrix in Figma).

**Layout fix:** The old `figmaPipelineButtonMatrix` used long labels inside pills and a dense `auto-fill` grid, which caused **overlap**. The showcase uses **flex rows / columns** and short labels like Figma (“Button”, “high”, icon rows).

**Accessibility:** `QaStoryBand` sections are **`role="region"`** with **`aria-labelledby`** pointing at the visible `<h3>` title (stable for Playwright `getByRole('region')`).

## 3. Vite on port 3333

`pnpm dev:figma-pipeline` — see `vite.config.ts` (`PORT`).

## 4. `browser_navigate`

- `http://localhost:3333` — catalog.  
- `http://localhost:3333/figma-pipeline/button` or `…/2459-24856` — pipeline pages.

## 5. `getComputedStyle()` assertions

Playwright (`**/figma-pipeline-2459*.spec.ts`):

- Screenshots: **one PNG per `role="region"` band** (filename from `h3` text).  
- Styles: spot-check **`#button-qa-button-attention`** — **high** has non-transparent fill, **low** (ghost) transparent.

Artifacts: `test-results/figma-pipeline-2459-*-screenshots/`, `figma-pipeline-2459*-computed-styles.json`.

## 6. Re-run

```bash
cd apps/qa-playground
pnpm test:figma-pipeline
```
