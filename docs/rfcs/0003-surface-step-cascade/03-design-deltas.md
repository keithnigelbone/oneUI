# Surface Algorithm — Deltas vs `OneUIColourTool`

> Designer-side reference repo:
> `/Users/aaditya.khedekar/try/layersOG/layers-web/OneUI libs/OneUIColourTool/packages/core/src/surfaceLogic.ts`
>
> Studio-side engine:
> `packages/shared/src/engine/surfaceNew.ts`
>
> The two were ported from the same algorithm. This document records historical
> deltas found during the RFC work; resolved items below are kept as context.

## Delta 1 — Dark-mode default surface step

**Reference** (`surfaceLogic.ts:203`):

```ts
case 'default': return darkMode ? 200 : 2500
```

**Studio** (`surfaceNew.ts:217-218`) now matches the reference:

```ts
case 'default':
  return darkMode ? 200 : 2500;
```

### What this controls

`default`'s resolved step anchors the page-root parent in dark mode.
Every depth-1 Surface inherits from this anchor, and that inheritance
flows into the calc-side dark fallback in the alternative buildtime
proposal too. A 100-step difference at the root cascaded through every
descendant: `subtle` from 200 walks to `400`; `subtle` from 100 walked
to `300`. Most depth-N values shifted by one step.

### Implications

- **Contrast headroom.** Step 100 is the absolute darkest in the scale,
  step 200 sits one notch lighter. Reference's choice gives `elevated`
  / `minimal` / `subtle` slightly more room before they hit the lower
  clamp at 100.
- **Visual luminance**. Brand scales typically render step 100 as
  near-pure-black (`oklch(~0.10 …)`). Step 200 is closer to a "deep
  surface" (`oklch(~0.16 …)`). Whether the page-level dark surface
  should be *the darkest tone in the scale* or *one notch up* is a
  design decision. The reference made the latter call.
- **Round-trip tests.** Engine drift tests (`engineDrift.test.ts`)
  now pin the dark root to step 200.

### Action needed

Resolved: Studio now uses `200` for dark root parity with
`OneUIColourTool`.

---

## Delta 2 — `differentAppearance` parameter for cross-role bold

**Reference** (`surfaceLogic.ts:199-222`):

```ts
export function resolveSurface(
  // …
  differentAppearance = false,
): number {
  switch (token) {
    case 'bold': {
      // Bold-on-different-appearance: when the child's appearance differs
      // from its parent's, treat the parent as if it were the rootStep
      // (2500 light, 200 dark). Brand stacking (e.g. negative-bold inside
      // sparkle-bold) should resolve to the child's brand anchor, not get
      // contrast-pulled by the parent's step. Same-appearance bold-on-bold
      // keeps the existing 7-step / 700-delta behaviour for visibility.
      const effectiveParent = differentAppearance ? (darkMode ? 200 : 2500) : parentStep
      const candidate = pinnedStep ?? (effectiveParent >= 1300 ? scale.base : scale.darkerBase)
      if (Math.abs(effectiveParent - candidate) / 100 >= 7) return candidate
      let result = effectiveParent - 700
      if (result < 500) result = effectiveParent + 700
      return clamp(result)
    }
  }
}
```

**Studio**: `resolveSurface` (`surfaceNew.ts:209-255`) takes no
`differentAppearance` parameter. All bold-on-bold falls through the
same-appearance path regardless of role.

### What this controls

Cross-role bold stacking. Two scenarios distinguished by the reference:

1. **Same-role bold-on-bold** (e.g. `<Surface mode="bold">` containing
   another `<Surface mode="bold">`, both default-appearance / primary).
   Reference: keeps the 7-step rescue, walks `parent ± 700` for
   visibility. Both repos agree.
2. **Cross-role bold-on-bold** (e.g. `<Surface appearance="negative"
   mode="bold">` inside `<Surface appearance="sparkle" mode="bold">`).
   Reference: treats parent as if it were root, so the inner negative
   anchors to its own brand baseStep instead of being contrast-walked
   away from sparkle's step. Studio: walks via the rescue, drifting the
   inner role away from its brand identity.

### Implications

- **Cross-role nests render wrong colours in Studio**. A negative-bold
  alert toast inside a sparkle-bold hero container should paint the
  brand's negative-bold (`scale.base` for negative — typically a red),
  not a 700-step shift away from sparkle's bold step.
- **Pattern frequency**. Real layouts: brand-tinted hero with embedded
  status bold (positive confirmation, warning callout, negative error)
  inside it. Material design and most brand systems treat these as
  preserving the inner role's identity. Reference matches that
  expectation.
- **Engine fix is small but threads through several call sites**. The
  parameter has to flow from `<Surface>` (which knows its own
  appearance) into the engine, and the engine's `resolveContextTokenSet`
  / `resolveTokenSet` need to pass it through too. Touches roughly five
  function signatures.

### Action needed

This is a **real bug** in the Studio engine, not a stylistic delta. The
reference repo's behaviour is the design spec. Two-step fix:

1. Add `differentAppearance?: boolean` parameter to `resolveSurface`
   (default `false`). Implement the same `effectiveParent` swap.
2. Plumb the flag through `resolveContextTokenSet` and into
   `generateSurfaceStepLookupCSS`. The lookup table currently emits
   one block per step — to support cross-role, it'd emit per `(step,
   differentAppearance)` pair, which doubles block count. Or:
   simpler — Studio's JSX (post-`BrandFoundationContext`) computes the
   step itself with `differentAppearance` known at render time, and
   the lookup table doesn't need to fork.

Tracking as a new pending-work item alongside § 1 (BrandFoundationContext);
the two solutions land together.

---

## Smaller alignments worth checking

Beyond the two named deltas, three places where the repos *agree* but
the alignment is implicit and worth confirming:

1. **`pinnedStep` (reference) vs `anchorBoldToBaseStep` (Studio)**.
   Same purpose — the brand-bg role pins bold to a specific authored
   step regardless of `parentStep >= 1300`. Reference takes a numeric
   `pinnedStep`; Studio uses a boolean flag plus `scale.baseStep`. Net
   behaviour identical. Naming divergence is fine but worth a note in
   `surfaceNew.ts` if anyone reads them side by side.
2. **`BOLD_FALLBACK_OFFSET = 700`** and **`BOLD_FALLBACK_MIN_STEP = 500`**.
   Studio names the constants; reference inlines them. Same values.
3. **`BOLD_MIN_DISTANCE = 7`** (Studio) vs `Math.abs(...) / 100 >= 7`
   inline (reference). Same.

## Action summary

| Item | Status | Owner / next step |
| --- | --- | --- |
| Delta 1 — dark default 100 vs 200 | Resolved | Studio now uses 200 |
| Delta 2 — `differentAppearance` cross-role bold | Real bug | Engine PR alongside `BrandFoundationContext` |
| Pinned-step naming alignment | Cosmetic | Add cross-reference comment in `surfaceNew.ts` |

Both deltas should be raised in the next foundations sync. Confirmation
or correction goes back into this doc.

## References

- `OneUIColourTool/packages/core/src/surfaceLogic.ts` — designer-side
  reference. Lines 199-223 for bold; 203 for default.
- `packages/shared/src/engine/surfaceNew.ts` — Studio engine. Lines
  209-255 for `resolveSurface`; 217-218 for default.
- `README.md` § 5 — original RFC, references `resolveSurface`
  without naming `differentAppearance`.
- `01-pending-work.md` — companion to RFC-0003.
- `05-deferred.md` items A and B — both deltas are tracked there as
  deferred (design-team confirmation pending).
