# Surface Logic — Reference Spec

> Canonical spec for the surface algorithm. The engine in `packages/shared/src/engine/surfaceNew.ts` + `cssGenNew.ts` should track this reference 1:1. Deviations are bugs unless explicitly documented.

## Reference sources

| Artifact                                | Location                                                                              | Role                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Spec document                            | `/Users/nunomarcelino/Downloads/Surface Logics.md`                                    | Plain-language rules, offset tables, edge cases.               |
| Algorithm implementation                 | `/Users/nunomarcelino/Documents/Code/OneUIColourTool 2/packages/core/src/surfaceLogic.ts` | The pure-function implementation of everything in the spec.    |
| Figma plugin consumer                    | `/Users/nunomarcelino/Documents/Code/OneUIColourTool 2/packages/figma-plugin-v2/src/apply.ts` | How a real consumer (the plugin) binds surfaces to nodes.       |
| Tokenator / variable emission            | `/Users/nunomarcelino/Documents/Code/OneUIColourTool 2/packages/figma-tokenator/src/`  | Figma variable naming + collection hierarchy.                   |

## What the reference defines

1. **7 surface tokens** — `default`, `ghost`, `minimal`, `subtle`, `moderate`, `bold`, `elevated`. No BG/FG split.
2. **Contrasting direction** — WCAG(step 2500 vs step 200) against parent step. Single `dir` reused for surface, content, and interaction at each level.
3. **Bold rule** — `baseStep`/`darkerBaseStep` + 7-step distance check; fallback `parent ± 700`, flip if out of bounds.
4. **Content tokens** — `high`, `medium`, `low` (opacity-solved), `tinted`, `tintedA11y` (contrast-walked), `strokeMedium`, `strokeLow` (fixed offsets).
5. **Interaction overlays** — parent's `dir`; hover/pressed ±1/±2 (bold: ±3/±5).
6. **Focus ring** — always informative scale.
7. **Transparent material** — separate resolution for surfaces over media; 3 contexts (`dynamic`/`dark`/`light`); static lookup tables for surface/content/interaction/focus.
8. **Opacity scale** — 25-step, `opacity = 1 - (step - 100) / 2400`.

## How to use this

- When editing the engine, read the corresponding section of the spec first.
- When adding a test case, if it mirrors a reference scenario, cite the spec line in the test.
- When a behavioural delta is intentional, document it in `docs/surface-context-awareness.md` with rationale and flag it as a deviation. Current deviations are tracked in the surface-logic refactor plan (see `~/.claude/plans/partitioned-scribbling-widget.md`).

## Current known deviations

These are listed in the active refactor plan for reconciliation. They are **not** intentional — they are numeric/scope drifts to close.

- Bold fallback offset: engine uses `±1000` / flip-threshold `< 400`; reference uses `±700` / `< 500`.
- Bold interaction deltas: engine uses ±1/±2 for all surface tokens; reference gives bold ±3/±5.
- Focus ring: engine uses `Text-High`; reference mandates informative-scale walk.
- Transparent material: not implemented in engine; reference has full system.

## When the reference updates

The reference repo is the single source of truth for surface algorithm behaviour. When it updates:

1. Read the new `surfaceLogic.ts` + spec diff.
2. Mirror any changes in `packages/shared/src/engine/surfaceNew.ts`.
3. Add/update tests in `surfaceNew.test.ts`.
4. Update `docs/surface-context-awareness.md` if the public surface contract (token names, APIs) changed.
5. If the change is behavioural-only, no doc update needed beyond a note in this file's "known deviations" section (if it creates a new one).
