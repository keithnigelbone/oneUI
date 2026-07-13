# Available Tokens on Surface mode="bg-subtle"

> Analysis of what tokens are available when a component is placed inside `<Surface mode="bg-subtle">` and how they differ from the `default` surface.

---

## Background: What is bg-subtle?

The `bg-subtle` surface is step **2300** in light theme (step **400** in dark theme). It produces a noticeably tinted background, 2 steps away from the default surface. It belongs to the **on-subtle** on-colour context, which determines how all its on-colour tokens are computed.

```tsx
<Surface mode="bg-subtle">
  {/* Components inside see bg-subtle's on-colour tokens */}
</Surface>
```

The Surface component renders:

```html
<div data-surface="bg-subtle"
     style="background-color: var(--Primary-BG-Subtle, var(--Surface-BG-Subtle, var(--Surface-Subtle)))">
```

---

## On-Colour Context: on-subtle vs on-default

The key architectural difference between `bg-subtle` and `default` is their **on-colour context**:

| Surface Mode | On-Colour Context | Description |
|-------------|------------------|-------------|
| `default` | **on-default** | Standard light/dark surface (step 2500 light, 200 dark) |
| `bg-subtle` | **on-subtle** | Tinted surface (step 2300 light, 400 dark) |

This context affects three computation parameters:

| Parameter | on-default | on-subtle |
|-----------|-----------|-----------|
| Stroke offset | +8 steps from surface | +10 steps from surface |
| State layer alpha | 0.16 hover / 0.24 pressed | 0.16 hover / 0.24 pressed |
| Accent A11y | Walk from base toward contrasting end until 4.5:1 | Light contrast dir: use step 2500 directly; Dark contrast dir: walk from base toward dark until 4.5:1 |

---

## Available Tokens Per Appearance Role

When inside `bg-subtle`, the following tokens are available for each appearance role (`{Role}` = Primary, Secondary, Neutral, Sparkle, etc.):

### 1. Text Colors (9 tokens per role)

| Token | Purpose | How Computed on bg-subtle | Difference from Default |
|-------|---------|--------------------------|------------------------|
| `--{Role}-Default-High` | Primary text | Contrasting step (200 or 2500, i.e., near-black or near-white) | Same contrasting endpoint; but bg-subtle's tinted background may produce different contrast direction for mid-range palettes |
| `--{Role}-Default-Medium-Text` | Secondary text | Midpoint alpha between `high` and `lowText`, applied to contrasting color | Higher stroke offset (+10 vs +8) can affect the alpha midpoint indirectly through context |
| `--{Role}-Default-Low-Text` | Tertiary text | Minimum alpha of contrasting color to achieve 4.5:1 contrast | Alpha is computed against bg-subtle's hex (step 2300/400), so the required alpha differs from default (step 2500/200) |
| `--{Role}-Default-Accent` | Accent decoration | Bold scale walk from base step at 3.0:1 minimum | Computed against bg-subtle background; may resolve to a different step than on default |
| `--{Role}-Default-Accent-A11y` | Accessible accent (text-safe) | **Key difference**: On on-subtle with light contrast direction, uses step 2500 directly (near-white). On on-subtle with dark contrast direction, walks from base toward dark until 4.5:1 | On on-default, always walks from base toward contrasting end. This asymmetric logic is the biggest behavioral difference |

### 2. Border / Stroke Colors (2 tokens per role)

| Token | Purpose | How Computed on bg-subtle | Difference from Default |
|-------|---------|--------------------------|------------------------|
| `--{Role}-Default-Medium-Stroke` | Standard borders | Stroke source at **+10 steps** from surface step, at 40% alpha | Default uses +8 step offset; bg-subtle uses +10, producing a stroke source further from the surface in the palette |
| `--{Role}-Default-Low-Stroke` | Subtle borders | Stroke source at **+10 steps** from surface step, at 20% alpha | Same +10 vs +8 offset difference |

### 3. State Layer Colors (2 tokens per role)

| Token | Purpose | How Computed on bg-subtle | Difference from Default |
|-------|---------|--------------------------|------------------------|
| `--{Role}-Default-Hover` | Hover overlay | Stroke source at +10 steps, at 16% alpha blended onto bg-subtle | Different base surface color and different stroke source step |
| `--{Role}-Default-Pressed` | Press overlay | Stroke source at +10 steps, at 24% alpha blended onto bg-subtle | Same difference pattern |

### 4. Surface Fill Tokens (available from root CSS, not remapped by context)

| Token | Value on bg-subtle |
|-------|--------------------|
| `--{Role}-BG-Subtle` | The bg-subtle surface fill hex (step 2300 light / 400 dark) |
| `--{Role}-FG-Bold` | Unchanged from root (the role's fg-bold fill) |
| `--{Role}-FG-Bold-High` | Unchanged from root |

### 5. Legacy / Backward-Compat Tokens

When `[data-surface="bg-subtle"]` is active in the CSS cascade, these legacy tokens are remapped:

| Token | Value on bg-subtle | Value on Default |
|-------|-------------------|-----------------|
| `--Text-High` | bg-subtle's on.high.hex | default's on.high.hex |
| `--Text-Medium` | bg-subtle's on.mediumText.hex | default's on.mediumText.hex |
| `--Text-Low` | bg-subtle's on.lowText.hex | default's on.lowText.hex |
| `--Text-Medium-Stroke` | bg-subtle's on.mediumStroke.hex | default's on.mediumStroke.hex |
| `--Text-Low-Stroke` | bg-subtle's on.lowStroke.hex | default's on.lowStroke.hex |
| `--Surface-Bold` | Unchanged (fg-bold fill) | Unchanged (fg-bold fill) |
| `--Text-OnBold-High` | Unchanged (fg-bold on.high) | Unchanged (fg-bold on.high) |

---

## Complete Token Inventory for bg-subtle Context

For each appearance role, the `[data-surface="bg-subtle"]` CSS block generates **16 tokens**:

```
Per role (9 Default on-colours + 4 FG-Bold + 3 BG-Subtle):
  --{Role}-Default-High
  --{Role}-Default-Medium-Text
  --{Role}-Default-Low-Text
  --{Role}-Default-Medium-Stroke
  --{Role}-Default-Low-Stroke
  --{Role}-Default-Accent
  --{Role}-Default-Accent-A11y
  --{Role}-Default-Hover
  --{Role}-Default-Pressed
  --{Role}-FG-Bold                 (keeps original fg-bold fill, NOT inverted)
  --{Role}-FG-Bold-High            (keeps original on-bold high)
  --{Role}-FG-Bold-Hover           (keeps original on-bold hover)
  --{Role}-FG-Bold-Pressed         (keeps original on-bold pressed)
  --{Role}-BG-Subtle               (remapped to state-layer tint)
  --{Role}-BG-Subtle-Hover         (remapped to state-layer pressed)
  --{Role}-BG-Subtle-Pressed       (remapped to state-layer pressed)

Plus backward-compat aliases (from Primary role):
  --Text-High, --Text-Medium, --Text-Low
  --Text-Medium-Stroke, --Text-Low-Stroke
  --Surface-Bold, --Surface-Bold-Hover, --Surface-Bold-Pressed
  --Text-OnBold-High
```

---

## Key Differences Summary: bg-subtle vs default

### 1. On-Colour Context

| Aspect | Default (on-default) | BG-Subtle (on-subtle) |
|--------|---------------------|----------------------|
| Surface step (light) | 2500 (lightest) | 2300 (2 steps darker) |
| Surface step (dark) | 200 (darkest) | 400 (2 steps lighter) |
| Stroke source offset | +8 steps | +10 steps |
| Accent A11y computation | Walk from base toward contrast | Asymmetric: step 2500 directly (light dir) or walk (dark dir) |

### 2. BG-Subtle Fill Token Remapping

This is a critical behavioral difference for button rendering:

| Context | `--{Role}-BG-Subtle` resolves to |
|---------|----------------------------------|
| On **default** surface | The actual bg-subtle surface hex (e.g., step 2300 tint) |
| On **bg-subtle** surface | `on.stateLayerHover.hex` (state-layer tint from bg-subtle's on-colours) |

**Why?** If BG-Subtle kept its original fill value when a component is placed on a bg-subtle surface, a subtle button would be invisible (same fill as background). The system remaps it to a state-layer tint for contrast.

This is generated by `generateModeContextDeclarations()` in `cssGenV4.ts` (line 333-337):

```typescript
// For bg-subtle context (neither default nor fg-bold):
d.push(`--${label}-BG-Subtle: ${on.stateLayerHover.hex};`);
d.push(`--${label}-BG-Subtle-Hover: ${on.stateLayerPressed.hex};`);
d.push(`--${label}-BG-Subtle-Pressed: ${on.stateLayerPressed.hex};`);
```

### 3. FG-Bold Tokens (No Inversion)

On bg-subtle, FG-Bold tokens are NOT inverted (no brand bold inversion). They keep their original values:

| Token | On Default | On BG-Subtle | On FG-Bold |
|-------|-----------|-------------|-----------|
| `--{Role}-FG-Bold` | Original fg-bold fill | Original fg-bold fill | Brand bold inversion hex |
| `--{Role}-FG-Bold-High` | Original on-bold high | Original on-bold high | Brand bold inversion accentA11y |

Brand bold inversion only activates on `fg-bold` surfaces. On `bg-subtle`, bold buttons still use the standard fg-bold fill and text.

### 4. Button Variant Behavior

| Variant | On Default | On BG-Subtle |
|---------|-----------|-------------|
| **Bold** | Fill = `fgBoldMode.hex` (accent), Text = `onBold.high` (white/black) | Same as default (no inversion) |
| **Subtle** | Fill = `bgSubtleMode.hex` (tinted), Text = `on.accentA11y` | Fill = `on.stateLayerHover.hex` (state-layer), Text = `on.accentA11y` |
| **Ghost** | Fill = transparent, Text = `on.accentA11y`, Border = `on.lowStroke` | Fill = transparent, Text = `on.accentA11y` (recomputed for bg-subtle bg), Border = `on.lowStroke` (recomputed) |

---

## CSS Cascade Support Status

| Mode | CSS Cascade (`[data-surface]`) Support | Notes |
|------|--------------------------------------|-------|
| `default` | Yes (reset block generated) | Full token reset for nesting |
| `fg-bold` | Yes (full inversion block) | Brand bold inversion + all remaps |
| **`bg-subtle`** | **Yes (context block generated)** | Generated by `generateSurfaceContextCSSV4()` which includes `bg-subtle` in its default modes list |
| `bg-minimal` | Yes | Same on-subtle context |
| `fg-minimal` | Yes | Same on-subtle context |
| `fg-subtle` | Yes | Same on-subtle context |
| `elevated` | Yes | On-default context (same as default) |

The `generateSurfaceContextCSSV4()` function generates blocks for all non-default modes by default: `['bg-minimal', 'bg-subtle', 'elevated', 'fg-minimal', 'fg-subtle', 'fg-bold']`.

**Important caveat from the docs:** While the CSS cascade generates `[data-surface="bg-subtle"]` blocks, the `surface-aware-components.md` guide notes that for full button adaptation on bg-subtle you should also use inline vars via `generateSurfaceAwareButtonVarsV4(modes, 'bg-subtle')`. The CSS cascade handles the 9 Default on-colours + FG-Bold + BG-Subtle remapping, but inline vars give finer control over component-level override variables (like `--Button-backgroundColor-subtle`).

---

## Usage Pattern for Components on bg-subtle

### Basic (CSS cascade only)

```tsx
<Surface mode="bg-subtle">
  <h2>Section Title</h2>           {/* Uses --Text-High, remapped for bg-subtle */}
  <p>Description text</p>          {/* Uses --Text-Medium, remapped */}
  <Button variant="bold">Action</Button>   {/* Bold fill unchanged */}
  <Button variant="ghost">Cancel</Button>  {/* Accent text + border adapt */}
</Surface>
```

### Full adaptation with inline vars (recommended for buttons)

```tsx
const vars = generateSurfaceAwareButtonVarsV4(primaryModesV4, 'bg-subtle');
<Surface mode="bg-subtle" style={{ ...vars }}>
  <Button variant="subtle">Adapted subtle fill</Button>
</Surface>
```

### Environment tokens (Layer 2 abstraction)

The `surfaceEnvironment.ts` maps `container` level to `bg-subtle`:

```typescript
// SurfaceLevel → V4 Mode mapping:
'container' → 'bg-subtle'
```

This means `resolveSurfaceEnvironment(tokens, { appearance: 'primary', level: 'container', theme: 'light' })` resolves `--env-*` tokens from the bg-subtle on-colours:

| Env Token | Source |
|-----------|--------|
| `--env-bg` | `Primary-BG-Subtle` fill hex |
| `--env-fg` | `Primary-BG-Subtle-High` (high emphasis text) |
| `--env-fg-muted` | `Primary-BG-Subtle-Medium-Text` |
| `--env-fg-subtle` | `Primary-BG-Subtle-Low-Text` |
| `--env-border` | `Primary-BG-Subtle-Medium-Stroke` |
| `--env-border-subtle` | `Primary-BG-Subtle-Low-Stroke` |
| `--env-accent` | `Primary-BG-Subtle-Accent` |
| `--env-accent-a11y` | `Primary-BG-Subtle-Accent-A11y` |
| `--env-state-layer-hover` | `Primary-BG-Subtle-Hover` |
| `--env-state-layer-pressed` | `Primary-BG-Subtle-Pressed` |

---

## Source Files Referenced

| File | Role |
|------|------|
| `packages/shared/src/engine/surfaceV4.ts` | V4 surface computation, on-colour contexts, stroke offsets |
| `packages/shared/src/engine/cssGenV4.ts` | CSS generation for `[data-surface]` blocks, context remapping |
| `packages/shared/src/engine/surfaceEnvironment.ts` | Layer 2 env tokens, container -> bg-subtle mapping |
| `packages/shared/src/engine/resolvedThemeTokens.ts` | Platform-neutral token flattening |
| `packages/ui/src/components/Surface/Surface.tsx` | Surface component (sets data-surface attribute) |
| `packages/ui/src/components/Surface/Surface.module.css` | Background color per mode |
| `packages/ui/src/components/Button/buttonSurfaceVars.ts` | Button surface-aware inline var generation |
| `packages/ui/src/components/Button/Button.module.css` | Button CSS with intermediate vars and appearance classes |
| `docs/surface-context-awareness.md` | Surface context system documentation |
| `docs/surface-aware-components.md` | Component authoring guide for surface awareness |
