# RFC-0003 — Pending Work & Current Limitations

> Companion to `README.md`. The spike implementation (commits
> `89aeeaa5`, `1003c610`, `4f4413ff`, `8ad984d8`) closes the depth-N
> gap for fills, content tokens, and icons via a single
> `data-surface-step` lookup. This file lists everything still open
> after the spike. Each item is sized so it can be picked up
> independently.
>
> **Triage status**: `02-completion-plan.md` lists the items being
> built right now (Phase 1 + Phase 9). Everything else has been
> moved to `05-deferred.md` per the team's scope-down call. This
> doc is kept as the historical enumeration; the deferred register
> is the working list.

## 0. Perf re-bless — DONE (Phase 9), with finding

**Status**: baseline re-blessed; cold pipeline now at ~28ms p50, well
over the previous `<10ms` target. **The step lookup
(`generateNewStepLookupCSS`) is the dominant cost at 22.7ms p50** —
expected outcome of running `resolveTokenSet` for 25 steps × 11 roles
= 275 calls per theme.

**Implications**:

- **Brand-switch UX**: cold path is hit only on brand load / brand
  switch (memo 2 invalidation in `useBrandCSS`). Warm path is unchanged
  (cache hit returns instantly). For a typical user this means brand
  switches are ~30ms slower than pre-RFC-0003. Visible but not
  catastrophic — the brand-switching transition suppression already
  hides paint flash.
- **Theme toggle**: 55ms p50 because both light and dark step lookups
  rerun. Same caveat — runs once per toggle.
- **Storybook authoring**: each brand selection from the toolbar
  pays the cold cost. Worth a follow-up if this becomes painful.

**Optimization options** (deferred to a follow-up):

1. Prune `getOccupiedSteps()` from all 25 steps to the realistically
   reachable subset. Diminishing returns — `minimal` walking from root
   can reach every step in principle, but most apps stop at depth ~5
   so a graph walk capped at depth 5 yields ~10–12 steps. ~50% saving.
2. Memoize `resolveTokenSet(scale, step, darkMode)` keyed on
   scale-identity. Roles with shared scales (rare today; common when
   sub-brands share a neutral) get a free win.
3. Skip onBold / onSubtle content emission per block when the role
   doesn't surface those tokens. Each role's resolveTokenSet currently
   resolves 34 tokens; not all are emitted.

**Filed as deferred Item J** in `05-deferred.md`.

**Baseline file**: `perf-baseline.json` updated 2026-05-07. New
scenario `generateNewStepLookupCSS-light` added to the bench harness.

---

## 1. Bold step approximation in JSX — FIXED (Phase 1)

**Status**: closed in Phase 1 of the active plan.

**Resolution**: `BrandFoundationContext` (in
`packages/ui/src/contexts/BrandFoundationContext.tsx`) is populated by
`BrandStyleInjector` (Storybook) and `FoundationStyleProvider`
(platform) with the same `ThemeConfig` the engine consumes.
`<Surface>` reads it and calls the new `resolveSurfaceStep(...)` helper
in `@oneui/shared/engine` which routes through the real
`resolveSurface()` (with the 7-step rescue + `parent ± 700` fallback +
`anchorBoldToBaseStep` policy). When no provider is in scope (Storybook
without a brand selected, SSR pre-hydration), `Surface` falls back to
the scale-free `approxResolveStep` and the canonical 700/1900 pin.

**Verification**: `Surface.test.tsx` "uses brand baseStep when
BrandFoundationProvider is in scope" — a brand whose primary baseStep
is 1300 makes `<Surface mode="bold">` write `data-surface-step="1300"`.
Engine tests in `cssGenNew.test.ts` "resolveSurfaceStep" cover the
helper's policy: anchor honoured at root, stripped below root, 7-step
rescue active, ghost passthrough, etc.

---

## 2. Per-appearance Surface fills

**Status**: not implemented.

**Where it lives**: `packages/ui/src/components/Surface/Surface.module.css`
uses a single `--Surface-Self-Color` for every solid surface regardless
of `appearance`.

**What's wrong**: the engine emits `--Primary-Self-Color`,
`--Neutral-Self-Color`, `--Secondary-Self-Color`, … in every
`[data-surface-step]` block (per role). Surface.module.css ignores them.
A `<Surface mode="bold" appearance="secondary">` paints the primary
colour at the resolved step, not the secondary colour.

**Fix shape**: add per-appearance selectors in `Surface.module.css`
keyed on `[data-appearance="<role>"]` that read the matching
`--{Role}-Self-Color`. Surface.tsx already accepts `appearance` via the
existing override pattern (`style={{ '--Surface-Fill-Subtle': '...' }}`);
this would replace that pattern with first-class context awareness.

**Acceptance**: `<Surface mode="subtle" appearance="secondary">` paints
`--Secondary-Self-Color` at the resolved step. The
`Surface.stories.tsx` "RoleOverrideAtDepth" story renders the inner
secondary tint without needing inline overrides.

---

## 3. Dark-mode root step anchor — FIXED

**Status**: closed in commit (this branch).

**Resolution**: `SurfaceStepContext` default switched from `2500` to
`null` (sentinel for "no ancestor Surface — I'm at root"). When the
context returns `null`, the Surface anchors to the theme-appropriate
root step at render time (`useDocumentTheme` → 2500 for light, 200 for
dark). Apps that need a different root anchor for a sub-tree can wrap
with `<SurfaceStepContext.Provider value={…}>`. Theme reactivity is
handled by the new `useDocumentTheme` hook (see § 11 below).

**Verification**: `Surface.test.tsx > reacts to a runtime data-theme
flip on <html>` exercises the path; dark-mode minimal walks
`100 → 200`.

---

## 4. Transparent material regression (P0 — fix first)

**Status**: regression caused by RFC-0003.

**Where it lives**: `packages/ui/src/components/Surface/Surface.module.css`
— the per-mode `background-color` rules now read
`--Surface-Self-Color` first, before `--Surface-Fill-<Mode>`. The
transparent material's `[data-material="transparent"][data-media="<ctx>"]`
blocks (emitted by `generateTransparentMaterialCSS` in
`packages/shared/src/engine/cssGenNew.ts`) only override
`--Surface-Fill-<Mode>` to rgba(); they don't touch
`--Surface-Self-Color`. So transparent surfaces now paint solid.

**Fix shape (recommended)**: add explicit `[data-material="transparent"]`
overrides in `Surface.module.css` that read from `--Surface-Fill-<Mode>`
and bypass `--Surface-Self-Color`. Higher specificity (3 attrs vs 2)
wins over the generic mode rule.

```css
.surface[data-material="transparent"][data-surface="bold"] {
  background-color: var(--Surface-Fill-Bold, var(--Surface-Bold));
}
/* …one per mode */
```

**Alternative**: have `generateTransparentMaterialCSS` also emit
`--Surface-Self-Color` per media context as the same rgba value. Cleaner
in CSS but spreads engine knowledge of Self-Color across two functions.

**Acceptance**: the `Surface.stories.tsx` "Transparent Material" story
renders surfaces composited over the gradient backdrop again, with the
expected rgba alpha. Solid surfaces in non-transparent stories continue
to use `--Surface-Self-Color` (depth-N safe).

---

## 5. Bug stories using root-only fills for inner cards

**Status**: story authoring issue, not engine.

**Where it lives**:
`packages/ui/src/components/Surface/Surface.content-bugs.stories.tsx`
— the `ContentCard` component sets inline `background:
var(--Surface-Fill-Default)` and `var(--Surface-Fill-Subtle)` for the
swatch row and "Expected at this level" annotation block.

**What's wrong**: those tokens are root-only by design. Inside a deeply
nested Surface, they paint with the root-relative value (light tint),
which is the OLD bug pattern — it makes the inner annotation boxes look
out of context, distracting from the actual content-bug demonstration.

**Fix shape**: replace the inline backgrounds with nested `<Surface>`
elements (`mode="default"` for the swatch row, `mode="subtle"` for the
annotation block). The cascade then resolves their fills from the
parent step. Story prose is preserved; inner cards adapt correctly.

**Acceptance**: at depth-3 (bold › moderate › subtle), the inner
ContentCard's swatch row reads as a default-relative-to-its-parent
surface, not as a hard-coded light slab. Same for the annotation block.

---

## 6. Component CSS sweep

**Status**: not started.

**Where it lives**: every `packages/ui/src/components/**/*.module.css`
that contains `[data-surface=` selectors used to override role tokens
(rather than just visually-mode-conditional bits like halo gap).

**What's wrong**: components like `Input.module.css` (lines 482+) gate
internal styling on `[data-surface]:not([data-surface="default"])`. With
the step cascade in place those rules continue to work, but they're
fragile — they assume "any non-default mode" = "I'm on a colored surface,
adapt". That's mode-conditional, not step-conditional. Today it's still
correct; in the long run the per-component logic should be either:
(a) data-driven from token reads (let the Self-Color cascade handle it),
or (b) keyed off the new `data-surface-step` attribute when "I'm on a
non-root step" matters.

**Fix shape**: audit one component at a time. Drop any
`[data-surface]` selector that only existed to hand-roll role-token
remapping (the cascade does that now). Keep the ones that use mode for
visual decisions (e.g. "show a leading icon only on bold surfaces").

**Acceptance**: `pnpm check:literals` and the visual regression baseline
both pass after each component sweep. RFC-0003 § 5 step 4.

---

## 7. validateBrandCSS / validateSurfaceContextCSS coverage

**Status**: passes today but doesn't enforce the new invariant.

**Where it lives**: `packages/shared/src/engine/validateBrandCSS.ts:241`
(`validateSurfaceContextCSS`). Line 268 warns when the context block
exceeds 1500 declarations.

**What's needed**:
- Assertion that `[data-surface-step="N"]` blocks exist for every step
  in `STEPS` (covered by engine tests, but should also fire at runtime
  when the brand CSS injects, to catch malformed brand configs).
- Assertion that `[data-surface-step]` blocks do NOT contain
  `--Surface-Fill-*` declarations (RFC § 3 invariant).
- Assertion that no orphaned `[data-surface="<mode>"]` rules in
  component modules try to remap role tokens — i.e. confirm the
  cleanup from §6 above.

**Acceptance**: validator emits a single dev-mode warning if any
invariant is broken; CI gate runs the validator on a fixture brand.

---

## 8. Build script for static brand CSS export

**Status**: not started — required for library distribution.

**Where it lives**: `scripts/export-brand-css.ts` (does not yet exist).
RFC § 6 calls for it.

**What's needed**: a Node script that:
1. Reads brand foundation snapshots from a committed JSON directory
   (e.g. `packages/ui/brand-snapshots/<brandId>.json`).
2. For each snapshot × theme (light + dark): runs `buildNewPaletteData`
   + `generateNewRootCSS` + `generateNewContextCSS` +
   `generateNewStepLookupCSS` + `generateNewContextBoundaryCSS` +
   `generateNewTransparentCSS` (the existing pipeline).
3. Wraps in `@layer brand` and writes
   `packages/ui/dist/themes/<brandId>.css`.
4. Optional: emit a manifest `packages/ui/dist/themes/index.json`
   mapping brandId to file size and content hash for cache busting.

Plus a runtime helper `packages/ui/src/runtime/loadBrandCSS.ts` that
appends a `<link>` for the requested brand and toggles `data-theme`.

**Acceptance**: `pnpm export:brand-css` produces one stylesheet per
brand snapshot. A consumer app importing `loadBrandCSS('JioBase')` plus
`@oneui/ui/styles` renders correctly without a Convex deployment.

---

## 9. Perf regression baseline

**Status**: not measured.

**Where it lives**: `perf-baseline.json`. The cold-pipeline budget is
`<10ms`. Adding the step lookup multiplies role-token resolution by ~25
(steps) × ~11 (roles) per theme = 275 calls vs the previous 5 mode
blocks.

**What's needed**: rerun `pnpm bench:pipeline`, compare cold + warm
numbers, decide whether 275-call cost fits inside budget. If not, prune
unreachable steps via a graph walk in `getOccupiedSteps()`
(`cssGenNew.ts:412`) — currently returns all 25, not just the reachable
subset.

**Acceptance**: cold pipeline still under budget, baseline updated via
`pnpm bench:pipeline --bless`.

---

## 11. `useDocumentTheme` — theme reactivity utility

**Status**: landed alongside § 3.

**Where it lives**:
`packages/ui/src/hooks/useDocumentTheme.ts`. Exposes
`useDocumentTheme(): 'light' | 'dark'`. Backed by
`useSyncExternalStore` + a single `MutationObserver` watching
`<html data-theme>`.

Used by:
- `Surface.tsx` — recomputes step on theme flip without remount.
- Bug stories — keeps "Expected at this level" prose in sync with the
  toolbar theme.

Anything else that derives behaviour from the active theme should use
this hook instead of reading `dataset.theme` once. Free-of-charge to
add new consumers; the observer is shared across the whole tree.

## 10. Native parity

**Status**: not addressed.

**Where it lives**: `packages/ui-native/` and the
`buildNativeTheme.ts` engine path.

**What's needed**: React Native doesn't have a CSS cascade, so the step
lookup model has to be reimplemented as a JS context that components
read from. `useNativeTheme()` (or equivalent) should expose the same
step-keyed token lookup; the native Surface should provide
`SurfaceStepContext` like the web one and consumers should read tokens
via the resolved context instead of static imports.

**Acceptance**: `pnpm check:parity` passes after native Surface adopts
the same cascade model.

---

## Suggested order

1. Item 4 — transparent material regression (P0, blocks anyone using
   transparent surfaces).
2. Item 5 — story JSX cleanup (low risk, makes the visual regression
   stories useful again).
3. Item 1 — `BrandFoundationContext` for brand-accurate bold + dark
   root anchor (1 + 3 land together).
4. Item 2 — per-appearance Self-Color wiring.
5. Item 7 — validator hardening (catch regressions early).
6. Item 6 — component CSS sweep (mechanical, can land in parallel).
7. Item 8 — build script (unblocks library distribution).
8. Item 9 — perf gate (after the above stabilise).
9. Item 10 — native parity (largest scope, plan separately).

## References

- `README.md` — the original RFC.
- `00-analysis.md` — the analysis that motivated it.
- `02-completion-plan.md` — what's actually being built now.
- `05-deferred.md` — the deferred-work register (most items here).
- Implementation commits: `ef51714c`, `89aeeaa5`, `1003c610`,
  `4f4413ff`, `8ad984d8`.
- Spike-side files:
  - `packages/shared/src/engine/cssGenNew.ts` —
    `generateSurfaceStepLookupCSS` + `--{Role}-Self-Color` emission.
  - `packages/ui/src/engine/computeNewStacking.ts` —
    `generateNewStepLookupCSS` bridge.
  - `packages/ui/src/hooks/useBrandCSS.ts` — additionalBlocks ordering.
  - `packages/ui/src/components/Surface/Surface.tsx` —
    `SurfaceStepContext` + `approxResolveStep`.
  - `packages/ui/src/components/Surface/Surface.module.css` —
    `--Surface-Self-Color` fallback chain.
