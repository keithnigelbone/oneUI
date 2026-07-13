# RFC-0003 — Surface Step Cascade (Solution D)

> Replace the current depth-1 `[data-surface]` cascade with a step-keyed lookup that supports arbitrary nesting depth and ships brand CSS as static, lazy-loadable files.

## Folder index

| File | Purpose | Read this if you want to… |
| --- | --- | --- |
| `README.md` (this file) | The RFC itself — problem, proposal, CSS shape, JSX bridge, distribution model. | Understand the design. |
| `00-analysis.md` | Four candidate solutions (A–D) compared side by side. | Understand *why* Solution D over A/B/C. |
| `01-pending-work.md` | Historical enumeration of every item the spike left open. | Audit what was originally in scope. |
| `02-completion-plan.md` | **Active plan.** Phases being built right now (Phase 1, Phase 9). | See what's actually shipping next. |
| `03-design-deltas.md` | Two algorithmic deltas vs. `OneUIColourTool` reference. | Understand where Studio diverges from the designer-side reference. |
| `04-buildtime-alternative.md` | Why we didn't ship the pure-CSS calc cascade; ReactNative analogue. | Understand the road not taken. |
| `05-deferred.md` | **Deferred-work register.** Items A–I with pickup triggers and architectural improvements. | Find out why something isn't being built and what would change that. |

## 1. Problem

The current engine (`packages/shared/src/engine/cssGenNew.ts:376` — `generateSurfaceContextCSS`) emits **one block per surface mode**, computed against a fixed root parent step (2500 light / 200 dark). At depth ≥ 2 the assumption breaks: an inner Surface paints fills resolved against root, not against its actual parent.

The bug surfaces in two ways, both visible in `packages/ui/src/components/Surface/Surface.nesting-bugs.stories.tsx`:

- **Fill collapse.** Stacked `<Surface mode="minimal">` levels render identical fills instead of walking the scale by 1 step per level.
- **Content inversion.** Each `[data-surface]` block emits *both* fill *and* content tokens (`--Text-High`, `--Primary-TintedA11y`, `--Primary-Stroke-Medium`). Content tokens share the same depth-1 ceiling — text colour stays root-relative even when the actual surface lands far from root. Result: dark text on dark inner surfaces.

RFC-0002 considered compound `[data-surface] [data-surface]` selectors (depth-2 only). Selector count multiplies by 5 per depth, so depth-3 blows the 50 KB CSS budget. We need a depth-N solution.

## 2. Proposal

Adopt **Solution D** from `00-analysis.md` § 3:

1. JSX bridge: each `<Surface>` resolves its own step via `resolveSurface(...)` (the existing pure function in `surfaceNew.ts:209`) and writes `data-surface-step="<N>"` on its DOM node. Step propagates through React context for the lookup; the DOM attribute is what CSS keys on.
2. CSS: emit one block per occupied `(step, role)` pair. Each block contains the full role token set — fills, content, state. Total ≈ 60–120 blocks per theme; well under budget.
3. Children read role tokens off cascade. Content tokens on the Surface itself read off the same block. One attribute, two consumers, both correct at any depth.

**Single attribute, not two.** Layers v4 uses `data-parent-scale` (for child fills) + `data-scale` (for content). OneUI does not need the split: the engine input "step at which to resolve role tokens" is the same value whether you're reading a fill from the parent's perspective or a content colour from the surface's perspective. Use `data-surface-step` only.

**Carry-overs from the current architecture:**

- `--Surface-Fill-<Mode>` and `--<Role>-Fill-<Mode>` stay root-only — never remapped inside lookup blocks. The Surface paints its own background from these stable tokens.
- `--Surface-Halo-Gap` keeps remapping per surface so focus halos still adapt.
- Bold's `darkerBaseStep` rescue (`surfaceNew.ts:238,390,397`) lives in the JS resolver, runs at render time, no CSS expression needed.

## 3. CSS shape

```css
:root { --parent-step: 2500; }                       /* light */
[data-theme="dark"] :root { --parent-step: 200; }    /* dark fallback */

/* Optional decorative cascade for raw `<div data-surface>` usage outside React.
   Components inside <Surface> rely on data-surface-step set by the JSX bridge. */
[data-surface="ghost"]    { /* parent-step unchanged */ }
[data-surface="minimal"]  { --parent-step: calc(var(--parent-step) - 100); }
[data-surface="subtle"]   { --parent-step: calc(var(--parent-step) - 200); }
[data-surface="moderate"] { --parent-step: calc(var(--parent-step) - 300); }
[data-surface="elevated"] { --parent-step: calc(var(--parent-step) + 100); }
[data-surface="default"]  { --parent-step: 2500; }

/* Lookup blocks — emitted once per occupied (step × role) for each theme. */
[data-surface-step="600"][data-appearance="primary"] {
  --Primary-Bold:        /* fill for child mode=bold,    parent at 600 */;
  --Primary-Subtle:      /* fill for child mode=subtle,  parent at 600 */;
  --Primary-Bold-High:   /* contrast extreme on bold at 600              */;
  --Primary-High:        /* content on a surface at step 600             */;
  --Primary-TintedA11y:  /* content on a surface at step 600             */;
  --Primary-Stroke-Medium: /* … */;
  --Primary-Hover:       /* state on a surface at 600                    */;
  /* …full role set */
}
[data-surface-step="800"][data-appearance="primary"] { /* … */ }
/* …one per occupied step × role */
```

Per-mode fills (`--Surface-Fill-<Mode>`, `--<Role>-Fill-<Mode>`) are emitted at `:root` only and intentionally absent from the lookup blocks.

## 4. JSX bridge

`packages/ui/src/components/Surface/Surface.tsx`:

```tsx
import { createContext, useContext, useMemo } from 'react';
import { resolveSurface, ROOT_PARENT_STEP } from '@oneui/shared/engine';

const SurfaceStepContext = createContext<number>(ROOT_PARENT_STEP);

export function Surface({ mode, appearance = 'primary', children, ...rest }: SurfaceProps) {
  const parentStep = useContext(SurfaceStepContext);
  const myStep = useMemo(
    () => resolveSurface({ parentStep, mode, role: appearance }),
    [parentStep, mode, appearance],
  );

  return (
    <SurfaceStepContext.Provider value={myStep}>
      <div
        data-surface={mode}
        data-surface-step={myStep}
        data-appearance={appearance}
        {...rest}
      >
        {children}
      </div>
    </SurfaceStepContext.Provider>
  );
}
```

Cost per Surface: one `useContext`, one `useMemo`, one extra DOM attribute. No layout reads, no observers.

## 5. Engine changes

| File | Change |
| --- | --- |
| `packages/shared/src/engine/cssGenNew.ts:376` (`generateSurfaceContextCSS`) | Replace the `for (mode of CONTEXT_SURFACE_TOKENS)` loop with a `for (step of OCCUPIED_STEPS)` loop. Emit one `[data-surface-step="N"][data-appearance="role"]` block per pair, containing fills + content + state. |
| `packages/shared/src/engine/cssGenNew.ts` (new helper) | `getOccupiedSteps({ scale, roles })` — walks the resolution graph: from every starting step (every step + the role baseSteps), apply each `mode ∈ {ghost, minimal, subtle, moderate, bold, elevated}`, collect the resulting set. Bounded by `[100, 2500]`. Expect ~10–15 steps per role; cache. |
| `packages/shared/src/engine/cssGenNew.ts` (new) | `generateSurfaceCascadeCSS()` — emits the 6 `[data-surface="<mode>"] { --parent-step: ...; }` blocks once. Output once per stylesheet, not per brand. |
| `packages/ui/src/components/Surface/Surface.tsx` | Add `SurfaceStepContext`, call `resolveSurface`, write `data-surface-step` and `data-appearance` attrs (see § 4). |
| `packages/shared/src/engine/index.ts` | Export `ROOT_PARENT_STEP`, `resolveSurface` (already public — confirm), `getOccupiedSteps`. |
| Component CSS modules | Sweep every `[data-surface="<mode>"] .myComponent { … }` rule. Convert to plain class rules reading role tokens (`var(--Primary-Bold)`, `var(--Text-High)`, etc.). The role tokens already exist; this is search-and-replace, not redesign. |
| `packages/shared/src/engine/validateBrandCSS.ts` | Add assertion: no orphaned `[data-surface="<mode>"]` token-remap rules in component modules. Block count within expected range (≤ 200 per theme). |

## 6. Brand CSS distribution (the Convex-vs-static question)

Two consumption paths must coexist. The current architecture only supports the first.

**Path A — Studio runtime (existing).** Platform app + Storybook stay on `useBrandCSS` + Convex live data. Used for authoring and live preview. No change.

**Path B — Library consumers (new, required for shipping).** The published `@oneui/ui` package must work *without* a Convex deployment. Consumers import components and a per-brand stylesheet, lazy-loaded by id. Mirrors layers v4 `dist/themes/*.css`.

New build script: `scripts/export-brand-css.ts`.

Inputs: a foundation JSON snapshot per brand (committed to repo or fetched once at release time from a Convex export endpoint). Outputs: `packages/ui/dist/themes/<brandId>.css` containing the full step-cascade lookup for that brand × {light, dark}.

```ts
// scripts/export-brand-css.ts (sketch)
import { generateFullCSS } from '@oneui/shared/engine';
import { readBrandSnapshots } from './snapshots';
import { writeFile } from 'node:fs/promises';

for (const brand of readBrandSnapshots()) {
  const light = generateFullCSS({ foundationData: brand, theme: 'light', injectionMode: 'global' });
  const dark  = generateFullCSS({ foundationData: brand, theme: 'dark',  injectionMode: 'global' });
  await writeFile(`packages/ui/dist/themes/${brand.id}.css`, [light, dark].join('\n'));
}
```

Add a thin runtime helper for consumers that don't want to import `<link>` tags themselves:

```ts
// packages/ui/src/runtime/loadBrandCSS.ts
export async function loadBrandCSS(brandId: string, baseUrl = '/themes/') {
  const href = `${baseUrl}${brandId}.css`;
  if (document.querySelector(`link[data-oneui-brand="${brandId}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.oneuiBrand = brandId;
  document.head.appendChild(link);
  await new Promise<void>((res, rej) => { link.onload = () => res(); link.onerror = () => rej(); });
}
```

Consumers call `loadBrandCSS('JioBase')` once at boot, toggle `data-theme="light|dark"` on `<html>`, done. No Convex, no runtime engine, no FOUC (the `<link>` blocks paint until loaded).

This makes Studio's runtime path a *development convenience*, not the shipping contract.

## 7. Migration plan

1. **Engine spike — primary role only.** Implement `getOccupiedSteps`, refactor `generateSurfaceContextCSS` for primary, wire `Surface.tsx` to write `data-surface-step`. Confirm `Surface.nesting-bugs.stories.tsx` renders correctly for primary at depth ≥ 3.
2. **Component CSS sweep.** Mechanical search-and-replace across `packages/ui/src/components/**/*.module.css` — drop `[data-surface]` token-remap rules, leave role tokens. Run `pnpm check:literals`.
3. **Roll to all 11 roles.** Extend the engine generator. Add validator assertion for orphaned rules.
4. **Build script + dist themes.** Ship `scripts/export-brand-css.ts`, generate one `dist/themes/<brand>.css` per known brand snapshot. Add `loadBrandCSS` runtime helper.
5. **Storybook validation.** Verify `Surface.nesting-bugs.stories.tsx` is green for *every* role and depth ≤ 5. Add Chromatic baseline.
6. **Perf gate.** `pnpm bench:pipeline` — confirm cold/warm budgets still met. Update `perf-baseline.json`.
7. **Decommission.** Remove `[data-surface="<mode>"]` content-token emission from `generateSurfaceContextCSS`. Keep `[data-surface]` cascade rule (`--parent-step` only) for non-React consumers.

## 7a. Depth-1 sanity check (separate finding)

While building the visual regression stories, a screenshot of `Surface.content-bugs.stories.tsx` story 1 (depth-1 baseline, single `<Surface mode="bold">`) showed text rendered black on the dark bold surface — which should never happen, since `cssGenNew.ts:240` emits a remapped `--Text-High` inside `[data-surface="bold"]`. Two possibilities:

1. **No brand selected in the toolbar.** Without a brand, `BrandStyleInjector` does not run, no `[data-surface]` blocks are injected, the static `:root` from `@oneui/tokens` supplies a single dark `--Text-High` for every surface, and any `<Surface mode="bold">` looks dark *because of the default Surface fill at root* — but `--Text-High` never gets its bold-context value. Stories degenerate to "everything reads root-level dark text."
2. **Genuine depth-1 regression.** The remap is emitted but something downstream (specificity, layer order, missing brand-CSS injection guard) is preventing it from winning at the bold block.

The Probe / Swatch components added in both story files read the live resolved value of `--Text-High` etc., so the diagnosis is mechanical: if the swatch matches root and the surface is bold, you're in case (1) — pick a brand. If the swatch differs from root and *still* matches the title text but the title still appears wrong, file a depth-1 regression.

This is **not** the bug RFC-0003 fixes. RFC-0003's fix only takes effect once depth-1 is correct, so this should be confirmed before measuring the RFC's value.

## 8. Open questions

- **Appearance inheritance.** A `<Button>` with no explicit `appearance` should pick up the nearest ancestor's appearance (e.g. `<Surface appearance="secondary">` wraps a button → button is secondary). Spec needs to confirm whether this is the design intent or whether buttons always default to `primary`. The cascade itself is neutral; the policy lives in the component.
- **Brand-Bg role.** The role's `bold` surface uses authored `baseStep` (Mint 2100 example, `surfaceNew.ts:121`), not the standard snap. Confirm the lookup generator handles this special case via the existing resolver — it should, since `resolveSurface` already knows.
- **Snapshot shape and source.** Where do `readBrandSnapshots()` snapshots live and how do they update? Two options: committed JSON in the repo (pro: deterministic builds, con: stale data); fetched once during release CI from a Convex export endpoint (pro: always current, con: release depends on Convex availability). Recommend committed snapshots with a CI job that opens a PR when Convex drifts.
- **Per-app brand override hooks.** Consumers may want to tweak a brand without re-running the engine — e.g. swap a logo, adjust a font slot. Decide whether `loadBrandCSS` accepts an override CSS string appended after the brand stylesheet, or whether overrides require a re-export.

## 9. References

- `00-analysis.md` — full analysis and four-solution comparison.
- `01-pending-work.md` — historical enumeration of every item the
  spike left open.
- `02-completion-plan.md` — items actively being built (Phase 1 +
  Phase 9).
- `03-design-deltas.md` — two algorithmic deltas vs. the designer-side
  reference (`OneUIColourTool/packages/core/src/surfaceLogic.ts`).
- `04-buildtime-alternative.md` — pure-CSS calc cascade discussion
  and ReactNative analogue.
- `05-deferred.md` — register of items scoped out of this round.
- `packages/shared/src/engine/surfaceNew.ts:209` — `resolveSurface`,
  the pure function the JSX bridge will call once Phase 1 lands.
- `packages/shared/src/engine/cssGenNew.ts` —
  `generateSurfaceStepLookupCSS` (the new step-keyed lookup) and
  `generateSurfaceContextCSS` (the legacy mode-keyed blocks, still
  emitted; deferred Item C decommissions them).
- `packages/ui/src/components/Surface/Surface.surface-bugs.stories.tsx` — fill-bug regression coverage (Page 1).
- `packages/ui/src/components/Surface/Surface.content-bugs.stories.tsx` — content/text/icon regression coverage (Page 2).
- Layers v4 reference: `react-4/layers-ui/dist/themes/*.css` —
  distribution model targeted by deferred Item H.
