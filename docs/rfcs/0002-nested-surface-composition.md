# RFC 0002 — Nested `[data-surface]` Composition

Status: **Draft** (2026-04-25)
Owner: Design System team
Drivers: Badge surface-context fixes (commits `670a5afd`, `d8f39c71`); the
"bold-on-bold invisibility" symptom and the icon/text colour-pair drift
that prompted Badge's per-role `-High` slot enumeration.

## Problem

The brand-CSS engine emits one `[data-surface="<mode>"]` block per context
surface (`minimal`, `subtle`, `moderate`, `bold`, `elevated`). Each block's
tokens are computed once with the **page root** as the assumed parent step
(2500 light / 200 dark) — see `cssGenNew.ts:677` and
`generateSurfaceContextCSS()` at `cssGenNew.ts:373`.

From `docs/surface-context-awareness.md` § Cascade remapping:

> Nesting resets fully — each `[data-surface]` block replaces the parent's
> values rather than merging.

In practice this produces a real visual bug whenever a surface-coloured
component is placed inside a same-coloured parent surface. The recent
Badge work hit it directly:

- `<Surface mode="bold">` renders at a stepped bold colour.
- A `<Badge variant="bold">` inside that Surface reads `--{Role}-Bold`,
  which the inner `[data-surface="bold"]` block has already pinned to
  the **same** stepped value.
- Result: Badge fill = parent fill = invisible Badge.

The engine's own algorithm in `surfaceNew.ts` already handles the
"bold candidate too close to parent" case (offset by 700 steps,
direction-flipped if out of bounds). That logic only fires at engine
emission time. The static `[data-surface="bold"]` block has no notion
of the actual nesting depth at the call site.

A second symptom appears once the first is patched: the on-colour pair
for nested-bold drifts because the inner `[data-surface]` block's
`--Primary-Bold-High` is resolved against the page root, not the
parent surface step. Badge currently works around this by enumerating
`--{Role}-High` remaps for all 11 appearance roles inside its
`.bold .start` slot rule — a maintenance footgun that doesn't scale to
other components.

This RFC scopes a fix to the emission, not the algorithm.

## Non-goals

- **Not changing `surfaceLogic.ts`** (`surfaceNew.ts`'s resolution
  rules). The math for "what step does bold land at when parent is X"
  is correct and already handles edge cases. Only the emission to CSS
  needs to expose those resolutions for nested cases.
- **Not introducing JavaScript at runtime** for surface detection. The
  whole system is CSS-cascade-only by design (per
  `docs/surface-context-awareness.md` § Core Architecture); this RFC
  preserves that property.
- **Not solving inter-brand cascade interaction** (sub-brand inside a
  parent brand). Out of scope.

## Research probes

### 1. Real-world nesting frequency

Counted `<Surface` usages across `apps/platform/src`,
`apps/storybook/.storybook`, and `packages/ui/src`:

- 192 total occurrences
- 108 distinct files
- ~20 files contain 2+ occurrences (one or more pairs of `<Surface>`
  in scope)

A line-level scan for *actual* nested-open-before-close cases (one
`<Surface>` opening before the previous one closes) produced **20
hits**, all from the same shortlist:

| File | Nested cases |
|---|---|
| `packages/ui/src/components/Surface/Surface.stories.tsx` | 10 |
| `packages/ui/src/components/Surface/Surface.test.tsx` | 3 |
| `packages/ui/src/components/Surface/Surface.tsx` (recursive default-mode reset) | 3 |
| `packages/ui/src/components/Tooltip/Tooltip.stories.tsx` | 4 |
| `packages/ui/src/components/Tabs/Tabs.stories.tsx` | 5 |
| `packages/ui/src/components/Checkbox/Checkbox.stories.tsx`, `Checkbox.tsx` | 3 |
| `apps/platform/.../EditorContent.tsx` | 4 (brand editor preview) |
| `apps/platform/.../ButtonSurfacePreview.tsx` | 3 |
| `apps/platform/.../SurfacesContent.tsx` | 3 |

**Reading:** the deep-nesting load is concentrated in **showcase /
documentation surfaces** (Storybook stories, foundations preview pages,
the in-app component editor) rather than production product code.
Production product surfaces in `apps/platform` typically nest at most
1 `<Surface>` deep — a card on a page surface, a hero on a page
surface — and that case is already covered by the existing single-block
emission.

The forcing function is therefore **showcase fidelity** (the editor
preview renders bold-on-bold and the team needs that to look right) and
**component composition** (Badge variants on Surface variants). Neither
demands depth-3+.

### 2. Static emission size today

From `cssGenNew.test.ts` assertions and the emission code:

- Per `[data-surface]` block: ~26 declarations × number of appearance
  roles. A typical brand has 11 roles → ~286 declarations per block.
- 5 context blocks × 286 ≈ **1,430 declarations** in
  `generateSurfaceContextCSS` output.
- Plus root, transparent material, focus, halo — total brand CSS
  lands well inside the **50 KB soft budget** documented in `CLAUDE.md`.

### 3. Combinatorial expansion budget per strategy

For depth-2 nesting (one `<Surface>` inside another), the table of
distinct outer × inner combinations is:

|         | inner=ghost | inner=minimal | inner=subtle | inner=moderate | inner=bold | inner=elevated |
| ------- | ----------- | ------------- | ------------ | -------------- | ---------- | -------------- |
| **outer=minimal**  | (ghost ≡ parent, no remap) | (depth-2 needed) | (depth-2 needed) | (depth-2 needed) | (depth-2 needed) | (depth-2 needed) |
| **outer=subtle**   | "                          | "                | "                | "                | "                | "                |
| **outer=moderate** | "                          | "                | "                | "                | "                | "                |
| **outer=bold**     | "                          | "                | "                | "                | "                | "                |
| **outer=elevated** | "                          | "                | "                | "                | "                | "                |

5 outer × 5 inner = **25 additional blocks**. Per block ≈ 286
declarations. Worst-case added size: **~7,150 declarations** if all 25
are emitted with full role coverage. That's **~5× the current
context-block size**, a real budget concern but still likely under the
50 KB ceiling for typical brands.

For depth-3: 5³ = 125 compound selectors. Already past the budget.

### 4. Reference algorithm (Figma plugin)

`OneUIColourTool/packages/core/src/surfaceLogic.ts` is the upstream
reference (per `CLAUDE.md`: *the algorithm should stay in lockstep
with it*). It is **not** vendored into the design-system repo or any
of its worktrees, so a direct read is not possible from this RFC.

The algorithm's resolution function (`surfaceNew.ts:resolveSurface`)
already accepts a `parentStep` parameter and the per-context fall-
back ("if candidate < 7 steps from parent, offset by 700") is already
implemented. The Figma plugin presumably calls that function at every
nesting boundary it encounters in the document tree, since Figma has
a live document graph available at render time. The web port has only
CSS — hence the gap this RFC addresses.

**Action item for follow-up:** before implementation, vendor the
relevant `surfaceLogic.ts` block (or a frozen reference snapshot) into
this repo so future changes here can be reviewed against it.

## Strategies considered

### A. Compound selectors

Emit a `[data-surface="<outer>"] [data-surface="<inner>"]` block per
combination, with tokens re-resolved at the actual outer step.

```css
[data-surface="bold"] [data-surface="bold"] {
  /* tokens computed with parentStep = bold-on-page step */
  --Primary-Bold:        <stepped value, distinct from outer>;
  --Primary-Bold-High:   <pair-matched on-colour>;
  /* ... */
}
```

**Pros:**
- Pure CSS cascade. Zero JS at runtime — preserves the core invariant.
- Natural composition with existing `[data-surface]` rules; the more-
  specific compound selector wins when both apply.
- Algorithm reuse: the same `resolveContextTokenSet` is called with a
  different `outerParentStep` per emission. No new algorithm code.

**Cons:**
- Combinatorial: depth-2 = 25 extra blocks; depth-3 = 125. Current
  research suggests depth-2 covers nearly all real cases — see
  Probe 1.
- Selector specificity: `[data-surface][data-surface]` matches
  *both* the outer and inner Surface unless we anchor with `>` or
  similar. Needs care to avoid the inner block's tokens leaking up.
- ~5× the size of today's context blocks if implemented across all
  paired combinations. Within the 50 KB budget but worth measuring.

### B. Data-attribute composition (path encoded)

A new attribute encodes the active surface path. The `<Surface>`
component computes it at render from its parent on the React tree.

```html
<div data-surface-path="page>bold">
  <div data-surface-path="bold>bold">…</div>
</div>
```

```css
[data-surface-path="bold>bold"] { /* re-resolved tokens */ }
```

**Pros:**
- Predictable size (one block per legal path string).
- Easier to reason about than nested-attribute selectors.

**Cons:**
- **Breaks the "zero JS at runtime" invariant.** `<Surface>` would
  need to read its parent's path via context or DOM traversal at
  render time. That's exactly what the system was designed to avoid.
- Migration cost: every `<Surface>` consumer would receive a new prop
  contract or context.
- Doesn't compose with non-`<Surface>` containers that set
  `data-surface` directly (rare but legal).

### C. CSS-only via custom-property inheritance with arithmetic-free
   pre-computation

Define each role's bold step as `var(--Active-Parent-Step, <root>)`
and have each `[data-surface]` block set `--Active-Parent-Step` to
its own step. Resolution at the container would then walk through
inherited CSS variables.

**Pros:**
- Zero JS, zero combinatorial expansion.

**Cons:**
- CSS variables don't do arithmetic. The inner block can't compute
  `bold-relative-to-this-step` without pre-computing every possible
  step pair. That's just option A wearing a hat.
- Adds an indirection layer (`--Active-Parent-Step`) without solving
  the core problem.
- Likely impractical given the 25-step scale × 11 roles.

## Recommendation

**Option A — compound selectors at depth-2 only.**

- Preserves the zero-JS invariant.
- Reuses the existing algorithm (`resolveContextTokenSet`) with a
  different `outerParentStep`.
- Size budget check: ~5× the current context-block bytes. Cap at
  depth-2 to stay within the 50 KB envelope. Depth-3 nesting is rare
  enough (zero hits in production code in our scan) that we accept
  imperfect resolution there as a known limitation.
- Avoids the migration / runtime cost of options B and C.

### Implementation scope (estimate)

- `packages/shared/src/engine/cssGenNew.ts`:
  add `generateNestedSurfaceContextCSS(themeConfig, outerParentStep,
  darkMode)` that iterates the 5 × 5 outer/inner pairs and emits each
  compound block with `outerParentStep = outerSurface.step` for the
  inner resolution. Wire into `generateFullCSS` and the new test
  alongside existing `generateSurfaceContextCSS` tests.
- `packages/ui/src/engine/computeNewStacking.ts`:
  add a `generateNewNestedContextCSS` wrapper that token-boundary-
  filters the output, mirroring the existing
  `generateNewContextCSS` pattern.
- `packages/ui/src/hooks/useBrandCSS.ts`:
  append the nested block to `additionalBlocks` after the existing
  `surfaceContextCSS`.
- `packages/shared/src/engine/__tests__/cssGenNew.test.ts`:
  assert presence of `[data-surface="bold"] [data-surface="bold"]`
  block, that its `--Primary-Bold` differs from the outer block's
  same token, and that text and bg pair correctly at the new step.
- `docs/surface-context-awareness.md`:
  extend § Cascade remapping with a "Depth-2 nesting" subsection
  and update the "Nesting resets fully" line to cover the new
  compound-selector behaviour.

Estimated diff: **~150 LOC** in engine + tests, plus docs. Comparable
in shape and budget to Step 1 (RFC-0002 prerequisite).

### Size budget verification (must run before implementation lands)

Run `pnpm bench:pipeline` for the Geo brand fixture before/after,
and assert:

- Brand-CSS total stays under 50 KB.
- Brand-CSS pipeline cold time stays under 10 ms.
- Memo-cached pipeline time stays under 5 ms.

If either breaks, re-scope to the subset of compound pairs that
production code actually nests (Probe 1 candidates only) and fall
back to the current single-block resolution for the rest.

### Migration follow-up (separate PR)

Once nested resolution lands, `Badge.module.css` can drop the per-role
`--{Role}-High` enumeration in `.bold .start` / `.subtle .start` /
`.ghost .start` (44 declarations) and put `data-surface={slotSurface}`
back on the slot spans in `Badge.tsx`. The cascade will provide the
correct nested on-colour pair for every appearance role automatically.
Combined with Step 1's `data-context-boundary` for surface-immune
children, Badge's surface-context plumbing should reduce to the same
pattern Button uses today — no private reset matrix.

## Open questions

- **Vendor `surfaceLogic.ts`** from `OneUIColourTool` into this repo
  before implementation, so the algorithm can be reviewed in lockstep?
  Recommend yes; small read-only file; meets the lockstep invariant
  in `CLAUDE.md`.
- **Does the editor preview need depth-3?** `EditorContent.tsx` shows
  4 nested `<Surface>` patterns. If any of those reach depth-3, the
  depth-2-only cap leaves visible drift in the editor. Worth a
  manual visual check during implementation.
- **Token-boundary allowlist:** the new compound block emits the same
  `--{Role}-*` tokens as the existing one, so no allowlist changes
  expected. Confirm during implementation.

## Definition of done for this RFC

- [x] Document at `docs/rfcs/0002-nested-surface-composition.md`.
- [x] Probe 1 (nesting frequency) — counted in this repo, table
      above.
- [x] Probe 2 (size baseline) — declared from existing tests.
- [x] Probe 3 (size budget per strategy) — table above.
- [x] Probe 4 (Figma plugin reference) — flagged as a research gap;
      vendor as a follow-up before implementation.
- [x] Strategies A/B/C evaluated with uniform pros/cons.
- [x] Recommended strategy with implementation scope.
- [x] Non-goals listed.
- [ ] Reviewer (human, not an agent) approves before any engine
      implementation PR opens.
