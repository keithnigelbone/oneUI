# Surface Nesting — Analysis & Solution Paths

> Why the current `[data-surface]` cascade caps at depth-1, what breaks at depth-2+, and four concrete paths forward (with the CSS each one emits).

## 1. Current architecture (depth-1 only)

The brand CSS engine emits one block per contextual surface mode. The right-hand values are computed once against a **fixed root parent step** (`outerParentStep` — `2500` in light, `200` in dark).

**File:** `packages/shared/src/engine/cssGenNew.ts:376` (`generateSurfaceContextCSS`)

### What gets emitted today

```css
:root {
  /* root step = 2500 (lightest). Tokens computed against it. */
  --Primary-Bold:        oklch(...);  /* baseStep, e.g. step 600 */
  --Primary-Subtle:      oklch(...);  /* root - 2 steps = 2300 */
  --Primary-Bold-High:   oklch(...);  /* contrast extreme of bold */
  --Primary-TintedA11y:  oklch(...);
  /* …11 roles × ~26 tokens each */
}

[data-surface="minimal"] {
  --Primary-Bold:        /* re-resolved against root, parent = 2500 */
  --Primary-Subtle:      /* parent 2500 → step 2300 */
  /* … */
}

[data-surface="subtle"]  { /* same: parent assumed = 2500 */ }
[data-surface="moderate"]{ /* same */ }
[data-surface="bold"]    { /* same */ }
[data-surface="elevated"]{ /* same */ }
```

Five contextual blocks (`CONTEXT_SURFACE_TOKENS`), each ~286 declarations. Total ≈ 1 430 declarations.

## 2. Where it breaks

The right-hand values bake in a single assumption: *my parent is the page root*. When you nest, that assumption is wrong.

### Failing example (depth-2)

```tsx
<Surface mode="bold">           {/* resolved step ≈ 600  */}
  <Surface mode="subtle">        {/* SHOULD resolve relative to 600 */}
    <Button variant="bold" />    {/* SHOULD read --Primary-Bold remapped for inner step */}
  </Surface>
</Surface>
```

**What the CSS actually does:**

```css
[data-surface="subtle"] {
  /* This block is keyed only on the subtle attribute.
     It sets --Primary-Bold using parentStep = 2500 (root).
     It DOES NOT KNOW that its actual parent is a bold surface
     whose resolved step is 600. */
  --Primary-Bold: <value-resolved-against-2500>;
}
```

**Result:** the inner `<Surface mode="subtle">` paints itself as if sitting on the page root, not on the bold surface. The button inside reads `--Primary-Bold` with values that contrast against root, not against its actual parent. Visually: wrong fill, low/zero contrast on bold backgrounds, broken hierarchy.

### Why the engine can't fix it by adding more selectors

Every additional nesting depth multiplies selector count by 5 (the number of contextual modes):

| Depth | Selectors | Declarations | KB (~) | Within 50 KB budget? |
|------:|----------:|-------------:|-------:|:---------------------|
| 1     | 5         | 1 430        | ~10    | Yes (current)        |
| 2     | 25        | 7 150        | ~50    | Borderline (RFC-0002)|
| 3     | 125       | 35 750       | ~250   | **No**               |
| 4     | 625       | 178 750      | ~1 250 | **No**               |

So mode-tuple selectors are a one-step fix, not a depth-N fix.

## 3. Solution paths

Four candidates, ordered by complexity. The same depth-2 example is shown rendered for each.

---

### Solution A — Mode-tuple selectors (RFC-0002, depth-2 only)

Pre-compute every `(outer, inner)` pair. Stops at depth-2 because depth-3 blows the size budget.

**CSS emitted:**

```css
[data-surface="bold"] {
  --Primary-Bold:   /* resolved against root (2500) */;
  --Primary-Subtle: /* resolved against root */;
}

[data-surface="bold"] [data-surface="subtle"] {
  --Primary-Bold:   /* resolved against bold's step (600) */;
  --Primary-Subtle: /* resolved against bold's step */;
}

[data-surface="bold"] [data-surface="moderate"] { /* … */ }
[data-surface="bold"] [data-surface="minimal"]  { /* … */ }
/* …25 compound blocks total at depth-2 */
```

**JSX:** unchanged. `<Surface>` keeps writing `data-surface="<mode>"` only.

**Trade-offs:** zero JS, zero runtime, but hard cap at depth-2. Depth-3 nesting still silently wrong.

---

### Solution B — Parent-step selectors (reference library: `react-4/layers-ui`)

Linearise nesting. Every `<Surface>` resolves its own step (1 of 25), then writes `data-parent-step="N"` on itself. Children read pre-baked tokens for "parent at step N." Block count is **constant regardless of depth**.

**CSS emitted (per role × parent step):**

```css
:root { --parent-step: 2500; }    /* default page root */

/* one block per (role, parent-step). 11 roles × 25 steps ≈ 275 blocks */

[data-parent-step="600"][data-appearance="primary"] {
  /* When my parent is at step 600, my tokens look like this: */
  --Primary-Bold:        /* resolved with parentStep = 600 */;
  --Primary-Subtle:      /* parent 600 → step 800 (or wherever) */;
  --Primary-Bold-High:   /* contrast extreme at this step */;
  --Primary-TintedA11y:  /* … */;
}

[data-parent-step="800"][data-appearance="primary"] { /* … */ }
[data-parent-step="2300"][data-appearance="primary"] { /* … */ }
/* …one per occupied step */
```

**JSX provider change** (`packages/ui/src/components/Surface/Surface.tsx`):

```tsx
import { createContext, useContext, useMemo } from 'react';
import { resolveSurface } from '@oneui/shared/engine';

const SurfaceStepContext = createContext<number>(2500); // page root

export function Surface({ mode = 'default', appearance = 'primary', children, ...rest }) {
  const parentStep = useContext(SurfaceStepContext);
  const myStep = useMemo(
    () => resolveSurface({ parentStep, mode, role: appearance }),
    [parentStep, mode, appearance],
  );

  return (
    <SurfaceStepContext.Provider value={myStep}>
      <div
        data-surface={mode}
        data-parent-step={myStep}      // children select pre-baked block via this
        data-appearance={appearance}
        {...rest}
      >
        {children}
      </div>
    </SurfaceStepContext.Provider>
  );
}
```

**Why depth-N works:** each Surface only needs *its own* parent's step, not the chain. Recursion is local.

**Trade-offs:**
- ✅ Arbitrary depth, bounded CSS (~50–80 KB per theme), per-brand themes lazy-loadable as separate files.
- ⚠️ Tiny render-time JS at each Surface (one `useContext` + one DOM attribute). No observers, no layout reads.
- ⚠️ Requires migrating all components from `[data-surface="<mode>"]` selectors to role-token reads.

---

### Solution C — Pure CSS via `calc()`-cascading numeric step + OkLCH

Use the fact that CSS custom properties **can redefine themselves relative to their inherited value**:

```css
:root { --parent-step: 2500; }

[data-surface="ghost"]    { /* unchanged */ }
[data-surface="minimal"]  { --parent-step: calc(var(--parent-step) - 100); }
[data-surface="subtle"]   { --parent-step: calc(var(--parent-step) - 200); }
[data-surface="moderate"] { --parent-step: calc(var(--parent-step) - 300); }
[data-surface="elevated"] { --parent-step: calc(var(--parent-step) + 100); }
[data-surface="default"]  { --parent-step: 2500; }   /* absolute reset */
[data-surface="bold"]     { --parent-step: 600;  }   /* absolute snap to baseStep */
```

Then derive colours from the cascading step using `oklch()`:

```css
:root {
  --primary-H: 230;             /* brand hue */
  --primary-C: 0.18;             /* base chroma */
  /* L is a function of parent-step. 25 steps mapped onto 0–100% */
  --primary-L: calc((var(--parent-step) / 2500) * 100%);
}

* {
  background: oklch(var(--primary-L) var(--primary-C) var(--primary-H));
}
```

**JSX:** zero changes. No provider, no context.

**Trade-offs:**
- ✅ Truly zero runtime. Infinite depth.
- ❌ Loses fidelity in the **base-chroma-locked region** of the OneUI scale (chroma is non-linear there).
- ❌ `bold` becomes an absolute snap with no fallback for "parent already near baseStep" — the engine's `darkerBaseStep` rescue path can't be expressed in CSS.
- ❌ State tokens (`Hover`, `Pressed`), `TintedA11y`, contrast-pair extremes are not simple L offsets — they need lookup, which CSS can't do from a numeric value.

**Verdict:** elegant for backgrounds only. Insufficient for the full 26-token role set.

---

### Solution D — Hybrid: numeric step cascade + selector lookup (recommended)

Combine B's lookup table with C's cascading step. Step propagates via `calc()`; the JSX bridge writes the resolved step as an attribute so the lookup block matches.

**CSS emitted:**

```css
:root { --parent-step: 2500; }

/* Step cascade — pure CSS, no JS needed for these */
[data-surface="ghost"]    { /* same as parent */ }
[data-surface="minimal"]  { --parent-step: calc(var(--parent-step) - 100); }
[data-surface="subtle"]   { --parent-step: calc(var(--parent-step) - 200); }
[data-surface="moderate"] { --parent-step: calc(var(--parent-step) - 300); }
[data-surface="elevated"] { --parent-step: calc(var(--parent-step) + 100); }
[data-surface="default"]  { --parent-step: 2500; }

/* Bold needs absolute reset + fallback. JSX writes data-surface-step explicitly. */
/* …emitted as data-surface-step="<resolved>" by Surface component */

/* Lookup blocks (one per occupied step × role) */
[data-surface-step="600"][data-appearance="primary"] {
  --Primary-Bold:       /* … */;
  --Primary-Subtle:     /* … */;
  --Primary-Bold-High:  /* … */;
  /* …full role set */
}

[data-surface-step="800"][data-appearance="primary"] { /* … */ }
[data-surface-step="2300"][data-appearance="primary"]{ /* … */ }
/* …275 blocks per theme (constant) */
```

**JSX provider change:**

```tsx
import { createContext, useContext, useMemo } from 'react';
import { resolveSurface } from '@oneui/shared/engine';

const SurfaceStepContext = createContext<number>(2500);

export function Surface({ mode = 'default', appearance = 'primary', children, ...rest }) {
  const parentStep = useContext(SurfaceStepContext);

  // resolveSurface handles bold's baseStep snap + darkerBaseStep fallback
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

**Why this is the recommended path:**
- ✅ Arbitrary depth.
- ✅ Bounded CSS (~275 blocks/theme).
- ✅ Brand themes lazy-loadable (mirrors `react-4/layers-ui/dist/themes/*.css`).
- ✅ Preserves engine fidelity (chroma lock, `bold` fallback, all 26 role tokens).
- ✅ Runtime cost ≈ `aria-label` write — one `useContext` + one attribute per Surface.
- ⚠️ Requires migrating component CSS from `[data-surface="<mode>"]` to role-token reads (`var(--Primary-Bold)` etc.). The role tokens already exist; this is a search-and-replace, not a redesign.

## 4. Comparison

| Property                          | A: Mode-tuple | B: Parent-step | C: Pure CSS | D: Hybrid (recommended) |
| --------------------------------- | :------------ | :------------- | :---------- | :---------------------- |
| Max nesting depth                 | 2             | ∞              | ∞           | ∞                       |
| CSS size                          | ~50 KB        | ~80 KB         | ~5 KB       | ~80 KB                  |
| Runtime JS at Surface boundary    | None          | useContext+attr | None       | useContext+attr         |
| Preserves chroma lock fidelity    | ✅            | ✅             | ❌          | ✅                      |
| Preserves `bold` fallback         | ✅            | ✅             | ❌          | ✅                      |
| State tokens (Hover/Pressed/…)    | ✅            | ✅             | ❌          | ✅                      |
| Per-brand lazy theme files        | ⚠️ awkward    | ✅             | ✅          | ✅                      |
| Component CSS migration required  | None          | Yes            | Yes         | Yes                     |

## 5. Migration path (if going with D)

1. **Engine change** — `cssGenNew.ts:376`: replace the `for (contextSurface of CONTEXT_SURFACE_TOKENS)` loop with a `for (step of OCCUPIED_STEPS)` loop. Emit one `[data-surface-step="N"][data-appearance="role"]` block per pair.
2. **Add cascade rules** — emit the 6 `[data-surface="<mode>"] { --parent-step: ...; }` blocks once per stylesheet (not per brand).
3. **Surface component** — add `SurfaceStepContext`, call `resolveSurface()` at render, write `data-surface-step` on the element.
4. **Component CSS sweep** — every `[data-surface="<mode>"] .myComponent { … }` rule becomes a plain class rule reading role tokens (`var(--Primary-Bold)`, etc.). Already the recommended pattern in `CLAUDE.md` § Surface Context.
5. **Validation gate** — extend `validateBrandCSS` to assert: 275 blocks emitted, no orphaned `[data-surface="<mode>"]` token-remapping rules left in component modules.
6. **Spike first** — wire `Primary` role only, prove a depth-3 Storybook story renders correctly, then mechanical-roll the rest.

## 6. References

- Reference implementation: `/Users/aaditya.khedekar/try/layersOG/layers-web/layers-web/libs/react-4/layers-ui/src/lib/buildTimeComponentsV4/surface.css`
- Reference lazy-loaded brand themes: `/Users/aaditya.khedekar/try/layersOG/layers-web/layers-web/libs/react-4/layers-ui/dist/themes/*.css`
- Current engine: `packages/shared/src/engine/cssGenNew.ts:376` (`generateSurfaceContextCSS`)
- Surface algorithm: `packages/shared/src/engine/surfaceNew.ts:246` (`resolveSurface`)
- RFC-0002 (depth-2 attempt): `docs/rfcs/0002-*.md` if present
