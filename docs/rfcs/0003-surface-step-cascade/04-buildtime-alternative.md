# Surface Step — Alternative Build-Time CSS Approach

> Background note for future maintainers. RFC-0003 ships a JSX-driven
> step cascade (React reads parent step from context, computes own step,
> writes `data-surface-step="N"`). This doc captures the *other* viable
> approach — pure CSS step propagation via `calc()` — and explains why
> we didn't pick it for the web spike, why it might still be useful for
> ReactNative or non-React consumers, and what the trade-offs are.

## 1. Current shipped approach (recap)

```
React tree
  <Surface mode="bold">         // step = approxResolveStep(...) → 700
    <Surface mode="subtle">      // step = approxResolveStep('subtle', 700) → 900
      <Button />                 // reads --Primary-Bold from parent's [data-surface-step="900"] block
```

- JSX bridge (`Surface.tsx`) writes `data-surface-step` per element.
- Engine (`generateSurfaceStepLookupCSS`) emits 25 lookup blocks per
  theme, one per scale step.
- Children read role tokens off CSS cascade — depth-N safe.

**Where this falls short**:

- Requires a React (or React-equivalent) host that runs `useContext` +
  `useMemo` per Surface. Every consumer pays a small render-time cost.
- Static HTML pages that mount raw `<div data-surface="bold">` get no
  step adaptation — `data-surface-step` is never written.
- ReactNative has no DOM and no `data-*` selectors. The lookup model
  doesn't transfer; native needs a JS-context equivalent (already
  flagged as deferred Item I in `05-deferred.md`).

## 2. Pure-CSS alternative — the `calc()` cascade

Originally documented in `00-analysis.md` § 3 (Solution C
and the cascade portion of Solution D). Idea: let CSS itself propagate
the step via a numeric custom property that redefines itself relative
to its inherited value.

```css
:root { --parent-step: 2500; }                       /* light root */
[data-theme="dark"] :root { --parent-step: 100; }    /* dark root */

[data-surface="ghost"]    { /* unchanged — keep parent --parent-step */ }
[data-surface="elevated"] { --parent-step: min(calc(var(--parent-step) + 100), 2500); }
[data-surface="minimal"]  { --parent-step: max(calc(var(--parent-step) - 100), 100); }
[data-surface="subtle"]   { --parent-step: max(calc(var(--parent-step) - 200), 100); }
[data-surface="moderate"] { --parent-step: max(calc(var(--parent-step) - 300), 100); }

/* Bold and default break the relative pattern — they're absolute resets. */
[data-surface="default"]  { --parent-step: 2500; }
[data-surface="bold"]     { --parent-step: 700;  }   /* canonical, see § 4 */
```

The descendant selector for the lookup table also keys off
`--parent-step` instead of an attribute:

```css
/* Won't actually work directly — see § 5. */
[--parent-step="700"] { --Primary-Bold: …; }
```

…and that's where the approach hits a wall in CSS today.

## 3. Why we didn't pick this for the web spike

Three blockers:

1. **CSS attribute selectors can't match on custom property values.**
   You can't write `[--parent-step="700"] { … }`. Custom properties
   exist in computed style, not in the structural attribute namespace
   that selectors index. A polyfill via `attr()` is theoretical and
   not yet shipping cross-browser. So the lookup table still needs a
   real attribute (`data-surface-step`), and once you're writing one,
   the calc cascade becomes redundant — JSX may as well write the step
   directly.

2. **Bold needs absolute reset with brand-aware fallback.** The engine's
   `resolveSurface('bold', parentStep, scale, ...)` picks `scale.baseStep`
   vs `scale.darkerBaseStep` based on parent step, then applies the
   7-step minimum-distance rescue with `parent ± 700` reversal at step
   500. That can't be expressed in CSS `calc()` — there's no scale
   palette inside CSS, no conditional logic. So bold has to be either
   (a) hardcoded to a canonical step (loses brand fidelity) or
   (b) JSX-computed and written as an attribute. Either way, JSX is
   back in the picture.

3. **Dark-mode contrast direction flips.** In light mode, `subtle`
   walks `parentStep − 200`. In dark mode, `parentStep + 200`. The
   sign depends on whether the parent sits on the dark or light half
   of the scale (engine: `computeContrastDir(parentRgb, rgbPalette)`).
   You can approximate with `[data-theme="dark"]` overrides flipping
   the sign for every surface mode, but the cross-over case
   (`parent at step 1300` — neither side dominates) needs the engine's
   palette luminance check, which CSS doesn't have.

So: the calc cascade *can* express minimal/subtle/moderate/elevated in
isolation, but as soon as bold + dark-mode + brand baseStep enter the
picture, you're either approximating (drifts off-brand) or back to a
JSX bridge. The web spike chose the bridge.

## 4. Where the approach is still attractive

Two contexts where the calc cascade would be a win, and a third where
it's the only option:

### 4.1 Static HTML / non-React consumers

A consumer mounting raw markup like
`<div data-surface="bold"><div data-surface="subtle">…</div></div>`
gets *zero* step adaptation today (no JSX writes
`data-surface-step`). If the engine *also* emitted the calc cascade
into the brand stylesheet, those raw consumers would get
mostly-correct adaptation for minimal/subtle/moderate/elevated, with
bold pinned to canonical. That's the "decorative cascade" RFC-0003 § 3
mentions as optional. Cheap to add — six rules, no extra blocks.

### 4.2 Build-time pre-rendering (SSG, email templates)

When the runtime is a static HTML output (Next.js export, MJML email,
documentation site), the React-side `data-surface-step` write happens
at build time and bakes into the HTML — fine. But during *partial*
hydration windows or with frameworks that don't hydrate every node,
the calc cascade gives you a pure-CSS fallback that still produces
plausible step values without JS.

### 4.3 ReactNative — different shape entirely

Native has no CSS, so neither the lookup table nor the calc cascade
directly applies. But the *structural model* of the calc cascade —
"each surface knows only its own offset; the runtime composes the
chain" — is what `useNativeTheme()` should mirror. A native
`SurfaceStepContext` provides parent step; native components compute
own step via the JS equivalent of `approxResolveStep` (or, post-§1
fix, the real `resolveSurface`); StyleSheet objects index a per-step
table the engine produces at brand-CSS export time.

If you adopt the build-time approach for native, the engine's
`generateSurfaceStepLookupCSS` should grow a sibling
`buildNativeStepLookup()` that returns a JS object keyed by step,
suitable for `StyleSheet.create()` consumption. That's the cleanest
parity story.

## 5. Recommendation

- **Web**: keep the JSX-bridge + `data-surface-step` lookup we ship
  today. Don't add the calc cascade as a primary path — it's
  redundant once the attribute is written.
- **Web fallback for raw `<div data-surface>` markup**: add the calc
  cascade *additionally* (six rules, ~200 bytes) so non-React
  consumers get approximate adaptation. Bold still wrong, but
  minimal/subtle/moderate/elevated are correct. File as a small
  follow-up if the use-case shows up.
- **ReactNative**: build the JS-context analogue of the JSX bridge
  (`useNativeSurfaceStep` → resolved step → indexes a build-time
  step→tokens object). The calc cascade has nothing useful to offer
  here. Tracked as deferred Item I in `05-deferred.md`.
- **Build-time brand CSS export** (`scripts/export-brand-css.ts`,
  pending-work § 8): emit the same lookup table the runtime uses;
  consumers get a static `<link rel="stylesheet">` per brand. Works
  without React. The calc cascade can ride along inside that
  stylesheet for raw-markup adaptation.

## 6. Why this isn't pursued right now

The web spike landed without it because:
- Coverage gain is marginal (only raw-markup consumers benefit).
- Bold can't be done correctly in pure CSS, so we'd ship a partial
  adaptation that designers might mistake for the real fix.
- Adding it after `BrandFoundationContext` lands is trivial — two
  blocks of static CSS appended to `generateSurfaceStepLookupCSS`'s
  output. Worth doing as part of `05-deferred.md` Item H (static
  brand CSS export) cleanup, not earlier.

## 7. References

- `00-analysis.md` § 3 — original four-solution analysis.
- `README.md` § 3 — calc cascade described as "optional decorative"
  in the RFC.
- `05-deferred.md` Items G (calc cascade) and I (RN parity).
- `packages/shared/src/engine/cssGenNew.ts` — where the additional six
  rules would land.
- `packages/ui-native/` — destination for the JS-context analogue.
