# Surface Context Awareness

> CSS-only, zero-JS-runtime system that makes components automatically adapt when placed on colored/bold surfaces. The engine mirrors the reference `OneUIColourTool/packages/core/src/surfaceLogic.ts`; behaviour should stay in lockstep with it.

## Model

A surface is any container that holds components. Every surface resolves its fill, its content (text/icons/strokes), and its interaction states **relative to the step of the surface it sits inside**. There is no pre-computed mode matrix — each value is computed on demand from the parent step plus a contrasting direction.

The primary consequence: **no BG/FG distinction**. The same 7 tokens work for a section background and for a button fill. Whether a surface acts as "container" or "component fill" is a usage concern, not a token concern.

## The 7 surface tokens

Each resolves to a step on the parent role's 25-step scale. Steps run 100 (darkest) → 2500 (lightest).

| Token      | Resolution                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------- |
| `default`  | Always 2500 in light mode, always 200 in dark mode. Ignores parent.                            |
| `ghost`    | Same step as parent (visually identical; still triggers context remapping if nested).          |
| `minimal`  | parent + 1 step toward contrasting direction                                                   |
| `subtle`   | parent + 2 steps                                                                               |
| `moderate` | parent + 3 steps                                                                               |
| `bold`     | `baseStep` if parent ≥ 1300 else `darkerBaseStep`. If that candidate is < 7 steps from parent, offset by 10 steps in contrasting direction (flipped if out of bounds). |
| `elevated` | parent + 1 step **always toward lighter** (capped at 2500). Ignores contrasting direction.     |

Results are clamped to [100, 2500]. For the Brand-Bg role, `anchorBoldToBaseStep: true` pins `bold` to `baseStep` regardless of parent, so the authored brand background colour is not offset by the page step.

> **Parity note (Track B in the surface-logic refactor plan).** The reference uses a **±700** offset and direction-flip threshold `< 500`; current engine uses **±1000** / `< 400`. These will be reconciled as part of the planned engine-parity work. See `surfaceNew.ts:246-264`.

## Contrasting direction

The direction is a single `+1` (toward lighter / 2500) or `-1` (toward darker / 200), computed once from the parent step via WCAG contrast of scale step 2500 vs scale step 200 against the parent colour (`computeContrastDir` in `surfaceNew.ts`).

**Critical rule:** the direction is computed at the **parent step** and reused for surface, content, and interaction tokens at that level. It is never recomputed at the resolved surface step. This keeps deltas stable across the 1200/1300 boundary where the direction would otherwise flip.

## The 7 content tokens

Resolved against the parent surface (or a target surface — see *on-bold / on-subtle* below):

| Token           | Rule                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| `high`          | Contrasting extreme — pure white (dir=+1) or pure black (dir=-1). Opacity 1.                          |
| `medium`        | Same colour as `high`. Opacity = midpoint between `low`'s solved opacity and 1.                       |
| `low`           | Same colour as `high`. Opacity solved by binary search (24 iterations in sRGB) for exactly 4.5:1 WCAG. |
| `tinted`        | Walk from `baseStep`/`darkerBaseStep` toward contrasting direction until ≥ 3.0:1 contrast. Opacity 1.  |
| `tintedA11y`    | Same walk, threshold 4.5:1. If walk goes > 500 steps from base in light direction, snap to step 2500 for guaranteed contrast. Opacity 1. |
| `strokeMedium`  | Offset from parent (+1400 light / -1800 dark) at fixed opacity (0.32 light / 0.24 dark), clamped.     |
| `strokeLow`     | Same step rule, opacity 0.16 light / 0.12 dark.                                                       |

Text tokens (`high`/`medium`/`low`) deliberately use neutral black/white, not the role's palette extreme, so text doesn't pick up a tint from saturated brand scales.

## On-bold and on-subtle content

Content placed on a bold or subtle fill uses a separately-resolved set, because the bold/subtle step has its **own** contrasting direction that often differs from the page's direction. `ResolvedTokenSet` exposes:

- `content` — text/strokes for components sitting **on the parent surface**
- `onBoldContent` — text/strokes for content inside the `bold` fill (e.g. bold-variant button labels)
- `onSubtleContent` — text/strokes for content inside the `subtle` fill (e.g. subtle-variant button labels)

This is how a bold button label stays readable: `--{Role}-Bold-High` reads `onBoldContent.high`, not `content.high`.

## Interaction states

Studio emits two compatible interaction models:

- Solid state tokens (`--{Role}-Hover`, `--{Role}-Pressed`, etc.) remain for components that still replace `background-color`.
- State-layer tokens (`--{Role}-Hover-Layer`, `--{Role}-Pressed-Layer`, etc.) mirror the plugin/Figma model: a translucent overlay painted on top of the current fill. The overlay colour is resolved from the active parent surface step; bold mode only switches to the stronger bold opacity pair.

Solid state tokens are step offsets from a base surface in the **parent's** contrasting direction. Three pairs:

| Token                      | Base step        | Offset       |
| -------------------------- | ---------------- | ------------ |
| `hover` / `pressed`        | parent           | ±1 / ±2      |
| `boldHover` / `boldPressed`| `bold`           | ±3 / ±5      |
| `subtleHover` / `subtlePressed` | `subtle`    | ±1 / ±2      |

State layers resolve overlay colour at `surfaceStep + dir * 800`, clamped to `200..2000`. Opacity is `0.16` hover / `0.24` pressed for normal surfaces and `0.24` hover / `0.32` pressed for bold. `Button` and `IconButton` paint these through a pseudo-element so the base fill stays stable.

## Focus ring

`--Focus-Outline` is sourced from the **informative** role's `tintedA11y` content token, with fallbacks to primary then neutral when informative is unavailable. The root value is emitted in `cssGenNew.ts` `generateRootCSS()`; per-surface values are re-resolved inside every `[data-surface]` block by `generateSurfaceContextCSS()` — the walk runs against the **actual visible surface fill** (the surface role's resolved bold/subtle/etc. step), not against informative's own bold step, which keeps the result tinted instead of collapsing to pure white/black on saturated brands.

Components draw the canonical 2-layer halo via the `--Focus-Halo` semantic token (defined in `packages/tokens/src/css/semantic.css`): inner gap from `--Surface-Halo-Gap` (auto-remapped per surface to `--Surface-Fill-{Mode}`) plus outer ring from `--Focus-Outline`. Reference pattern: `Button.module.css:691-695`. The semantic.css default (`--Focus-Outline: var(--Informative-TintedA11y, var(--Text-High))`) covers first paint before brand CSS injects.

## CSS output

Per appearance role (9 roles: neutral, primary, secondary, sparkle, brand-bg, positive, negative, warning, informative), `cssGenNew.ts` emits:

**34 canonical declarations per role:**

```
Surfaces (7):   --{Role}-Default, --{Role}-Ghost, --{Role}-Minimal,
                --{Role}-Subtle, --{Role}-Moderate, --{Role}-Bold, --{Role}-Elevated
Content (7):    --{Role}-High, --{Role}-Medium-Text, --{Role}-Low,
                --{Role}-Tinted, --{Role}-TintedA11y,
                --{Role}-Stroke-Medium, --{Role}-Stroke-Low
On-Bold (4):    --{Role}-Bold-High, --{Role}-Bold-Medium,
                --{Role}-Bold-Tinted, --{Role}-Bold-TintedA11y
On-Subtle (4):  --{Role}-Subtle-High, --{Role}-Subtle-Medium,
                --{Role}-Subtle-Tinted, --{Role}-Subtle-TintedA11y
States (6):     --{Role}-Hover, --{Role}-Pressed,
                --{Role}-Bold-Hover, --{Role}-Bold-Pressed,
                --{Role}-Subtle-Hover, --{Role}-Subtle-Pressed
State Layers(6): --{Role}-Hover-Layer, --{Role}-Pressed-Layer,
                --{Role}-Bold-Hover-Layer, --{Role}-Bold-Pressed-Layer,
                --{Role}-Subtle-Hover-Layer, --{Role}-Subtle-Pressed-Layer
```

**Root-only fill tokens** (never remapped inside `[data-surface]` blocks, so the `<Surface>` component can read its own background without the cascade looping back on itself):

```
--{Role}-Fill-{Mode}       (per role × 5 modes)
--Surface-Fill-{Mode}      (default from primary or neutral)
--Surface-Halo-Gap          (remapped per context → current surface fill)
```

**Backward-compat aliases** emitted from primary (or neutral fallback):

```
--Surface-*, --Text-*, --Border-*
```

**V4 per-role aliases** (`--{Role}-FG-Bold`, `--{Role}-BG-Subtle`, `--{Role}-Default-High`, etc.) are still emitted by `generateV4RoleAliases()` for components that haven't been swept onto the unified names. These are scheduled for removal (Track C of the surface-logic refactor plan) once the 50 affected component CSS modules adopt the new names as primary.

## Cascade remapping

For each of `minimal`, `subtle`, `moderate`, `bold`, `elevated`, the engine emits a `[data-surface="<token>"]` block that re-resolves every role's token set at the container's step. When components are nested inside these containers they read the remapped values via the CSS cascade — no JS. See `generateSurfaceContextCSS()` and `resolveContextTokenSet()`.

Nesting resets fully — each `[data-surface]` block replaces the parent's values rather than merging. A nested `<Surface mode="default">` returns to root tokens.

## Context boundaries

Sometimes a child element must keep its **own** appearance role's colour rather than adapt to the outer surface — for example a negative `IndicatorBadge` (red dot) inside a bold `Badge` should stay red, not flip to the badge's on-bold tinted value. For that case the engine emits a single `[data-context-boundary]` block alongside the `[data-surface]` cascade:

```css
@layer brand {
  [data-context-boundary] {
    /* every role's surface-context-remappable tokens are pinned to
       their root-only Fill-* equivalents */
    --Primary-Bold:        var(--Primary-Fill-Bold);
    --Primary-Bold-High:   var(--Primary-Fill-Bold-High);
    --Primary-Subtle:      var(--Primary-Fill-Subtle);
    --Primary-TintedA11y:  var(--Primary-Fill-Subtle-TintedA11y);
    /* …same four declarations for every other role… */

    /* slot-level -High icon remap is reverted so component CSS
       like .bold .start { --Primary-High: ... } doesn't reach
       inside the boundary */
    --Primary-High: revert-layer;
    --Text-High:    revert-layer;
    --Text-Medium:  revert-layer;
  }
}
```

`Fill-*` tokens are emitted at `:root` only by `generateMultiRoleRootCSS` and never touched by `[data-surface]` blocks, so they're always the original root value regardless of cascade depth.

**Component-side usage:**

```tsx
// Inside Badge.tsx — wrap children whose appearance must not adapt
<span data-context-boundary>
  <CounterBadge appearance="negative" />   {/* stays red on a bold Badge */}
</span>
```

**When to use `data-context-boundary` vs `data-surface="default"`:**

| Need | Attribute |
|---|---|
| Reset to "as if at page root" — keep child's own role colour | `data-context-boundary` |
| Establish a new surface (own background + child tokens adapt to it) | `data-surface="default"` (page surface) |

Only one component should reach for `data-context-boundary` per use case. Don't wrap arbitrary subtrees — it's a targeted composition primitive, not a styling escape hatch. If many components need the same reset, that's a sign the cascade design needs revisiting.

Implementation: `generateContextBoundaryCSS()` in `cssGenNew.ts`. The block iterates `themeConfig.appearances`, so adding a new role to a brand automatically extends the boundary block.

## Surface component

```tsx
import { Surface } from '@oneui/ui';

<Surface mode="bold">
  <Button variant="bold">Adapts automatically</Button>
  <Button variant="subtle">Also adapts</Button>
  <Button variant="ghost">And this</Button>
</Surface>
```

The `<Surface>` component sets `data-surface={mode}` on the rendered element and uses `--{Role}-Fill-{Mode}` for its own background. Legacy V4 mode names (`'fg-bold'`, `'bg-subtle'`, `'bg-bold'`, `'fg-minimal'`, `'fg-subtle'`, `'bg-minimal'`) are still accepted and normalised to the canonical form via `normalizeSurfaceMode()`. These are scheduled for removal once all callers migrate.

**Rule of thumb for composition:**

1. Whenever placing components on a non-default background, use `<Surface mode="...">` — never `<div style={{ background: '...' }}>`. A raw div is outside the cascade; tokens inside don't remap.
2. Don't add decorative borders on top of a tinted Surface; the fill already provides the boundary.
3. Reference generic role tokens (`--Primary-High`, `--Primary-TintedA11y`, `--Text-High`) inside components — let the cascade remap them per surface. Don't hard-code surface-specific aliases.

## Transparent material

`<Surface material="transparent" mediaContext="dynamic|dark|light">` composites over images/video/unknown media. The engine emits `[data-material="transparent"][data-media="..."]` blocks that remap the existing surface, content, focus, solid state, and state-layer tokens to rgba values. This keeps components on the same token API; the caller only chooses the media context.

## Metallic material assignments → component consumption

The Materials foundation (Metals tab) defines metallic presets; the Appearance page assigns an **active** metal to appearance roles. For each assigned role the engine emits (root-only, never remapped inside `[data-surface]` blocks):

- `--{Role}-Material-Fill` — gradient image for the role's bold fill
- `--{Role}-Material-Text` — readable solid colour on that fill (the metal's shadow stop)
- `--{Role}-Material-Stroke` / `--{Role}-Material-StrokeColor` — gradient stroke image + solid fallback

**Component pattern** (Button, Badge, Avatar, Chip, SelectableButton, SelectableIconButton, SelectableSingleTextButton): each appearance class adds two intermediates next to its bold chain —

```css
.appearanceSecondary {
  --_btn-material-fill: var(--Secondary-Material-Fill);
  --_btn-material-text: var(--Secondary-Material-Text);
}
```

and the **bold/high-attention/selected-bold** variant consumes them between the editor override and the standard token:

```css
background: var(--Button-backgroundColor-bold, var(--_btn-material-fill, var(--_btn-bold)));
color: var(--Button-textColor-bold, var(--_btn-material-text, var(--_btn-bold-high)));
```

Invariants:

1. **Guaranteed-invalid fallback** — when no metal is assigned the `--{Role}-Material-*` token doesn't exist, the intermediate resolves to the guaranteed-invalid value, and `var()` falls through to the standard chain. Brands without assignments are pixel-identical.
2. **`background`, never `background-color`** — the fill is a gradient image; `background-color` silently ignores it.
3. **States stay stable** — hover/pressed keep the same material fill (no flat-colour swap over the gradient); feedback comes from tap-scale/decoration channels.
4. **Editor overrides win** — `--Component-backgroundColor-*`/`--Component-textColor-*` (and per-state variants) sit above the material in every chain. The default-appearance path also exposes `--Component-roleMaterialFill`/`--Component-roleMaterialText` hooks.
5. **Subtle/ghost/medium/low variants are untouched** — material is a high-attention fill treatment only. Button additionally chains `--{Role}-Material-Stroke` as the last fallback of every `--_btn-stroke-image` chain (renders only when a border width is configured).
6. **Native parity TODO** — React Native has no CSS fallback chains; `@oneui/ui-native` equivalents need JS-side material resolution from the same assignment config before `check:parity` can claim material coverage.

Simulating an assignment in Storybook (see the "Metallic Material" stories): set `--Primary-Material-Fill: var(--Material-Metallic-Gold-Fill)` and `--Primary-Material-Text: var(--Material-Metallic-Gold-Text)` on a wrapper.

## Dark mode

The engine resolves a full token set per theme. `useBrandCSSNew`'s Memo 2 depends on `theme`; the `@layer brand` CSS regenerates atomically, and `useInsertionEffect` injects it before React paints. `previousCSSRef` bridges during the swap to prevent FOUC.

## Validation

`validateBrandCSS()` runs over the generated CSS:

- **Token boundary** — only the 24 allowlisted prefix families may appear (enforced by `tokenBoundary.ts`, sourced from `tokenManifest.ts`). Anything outside is filtered before injection.
- **Soft limits** — 50KB / 800 tokens for root CSS; separate limits for surface context blocks. Breach emits a warning; doesn't block injection.

## Files

| File                                              | Role                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/shared/src/engine/surfaceNew.ts`        | Core algorithm — `resolveSurface`, `resolveContent`, `resolveState`, `resolveTokenSet`, `resolveContextTokenSet` |
| `packages/shared/src/engine/cssGenNew.ts`         | CSS generation — `generateRoleCSS`, `generateMultiRoleRootCSS`, `generateSurfaceContextCSS`, `generateFullCSS` |
| `packages/shared/src/engine/tokenManifest.ts`     | Prefix family registry (24 families)                                   |
| `packages/shared/src/engine/tokenBoundary.ts`     | Allowlist filter used by `validateBrandCSS`                            |
| `packages/shared/src/engine/colorMath.ts`         | Hex/RGB conversion, WCAG contrast, alpha blending, palette pre-parse    |
| `packages/ui/src/engine/computeNewStacking.ts`    | Bridge from Convex data → `ThemeConfig`                                |
| `packages/ui/src/hooks/useBrandCSSNew.ts`         | React hook — composes surface CSS + typography + motion + validation    |
| `packages/ui/src/hooks/useSurfaceTokenVarsNew.ts` | Per-surface inline-style vars for editor previews                       |
| `packages/ui/src/components/Surface/Surface.tsx`  | `<Surface>` component; writes `data-surface` attribute                  |

## Reference

The canonical spec this engine tracks lives in the OneUIColourTool repo: `packages/core/src/surfaceLogic.ts` and its companion Surface Logics design note. See `docs/surface-reference.md` for context on how the two repos stay in sync.
