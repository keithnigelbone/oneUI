# Tokens Available on `bg-subtle` Surface

This document explains what text, border, and accent tokens are available when a component is placed inside `<Surface mode="bg-subtle">`, and how they differ from the default surface.

## Background: `bg-subtle` in the Surface System

`bg-subtle` is a **background-category** surface (light tints, used for depth). It sits one step away from the page background and is typically used for cards, content sections, and panels.

| Property | Default Surface | bg-subtle Surface |
|----------|----------------|-------------------|
| **Light theme step** | 2500 (lightest) | 2300 |
| **Dark theme step** | 200 (darkest) | 400 |
| **On-colour context** | `on-default` | `on-subtle` |
| **Purpose** | Page background | Card/section background |
| **Background token** | `--Primary-Default` | `--Primary-BG-Subtle` |
| **CSS selector** | (root, no selector) | `[data-surface="bg-subtle"]` |

## On-Colour Context: `on-subtle` vs `on-default`

This is the most important architectural difference. The `bg-subtle` surface uses the **`on-subtle`** on-colour context (shared with `bg-minimal`, `fg-minimal`, and `fg-subtle`), whereas the default surface uses `on-default`.

The key difference between these two contexts:

| Parameter | `on-default` (default surface) | `on-subtle` (bg-subtle surface) |
|-----------|-------------------------------|--------------------------------|
| **Stroke offset** | +8 steps from surface | +10 steps from surface |
| **State layer type** | Alpha-based (0.16 / 0.24) | Alpha-based (0.16 / 0.24) |
| **High text computation** | Standard contrast walk | Standard contrast walk |
| **Accent-A11y computation** | Walk from base toward contrasting end until 4.5:1 | Light contrast direction: use step 2500 directly; Dark contrast direction: walk from base toward dark until 4.5:1 |

The stroke offset difference (+10 vs +8) means borders on `bg-subtle` are computed from a step further away from the surface, ensuring they remain visible against the slightly tinted background.

## Available Tokens on `bg-subtle`

### 1. Text Colour Tokens (3 tokens)

These 9 tokens are generated for every role. Below shows the Primary role; replace `Primary` with any configured role name (Neutral, Secondary, etc.).

| Token | Purpose | Contrast | Notes |
|-------|---------|----------|-------|
| `--Primary-BG-Subtle-High` | Primary text / headings | 4.5:1 WCAG AA | Near-black (light) or near-white (dark) -- the contrasting extreme step (200 or 2500) |
| `--Primary-BG-Subtle-Medium-Text` | Secondary/body text | 4.5:1 WCAG AA | Midpoint alpha between high and low-text, blended against the bg-subtle surface |
| `--Primary-BG-Subtle-Low-Text` | Captions / tertiary text | 4.5:1 WCAG AA | Minimum alpha that still achieves 4.5:1 contrast against the bg-subtle surface |

**Difference from default:** The values are computed against the bg-subtle surface hex (step 2300 in light theme) rather than the default surface hex (step 2500). Since bg-subtle is slightly darker/more tinted, the alpha blending produces marginally different hex values, but the contrast targets remain the same (4.5:1 AA).

### 2. Border / Stroke Tokens (2 tokens)

| Token | Purpose | Opacity | Notes |
|-------|---------|---------|-------|
| `--Primary-BG-Subtle-Medium-Stroke` | Standard borders, dividers | 40% alpha | Stroke source is +10 steps from surface step in contrast direction |
| `--Primary-BG-Subtle-Low-Stroke` | Subtle borders, separators | 20% alpha | Same stroke source, lower opacity |

**Difference from default:** Two changes:
1. The **stroke source step** is further away (+10 steps instead of +8 for `on-default`). This compensates for the tinted bg-subtle surface -- borders need more contrast offset to remain visible against a non-white/non-black background.
2. The **blending target** is the bg-subtle surface hex rather than the default surface hex, so the resulting blended color reflects the tinted background.

### 3. Accent Colour Tokens (2 tokens)

| Token | Purpose | Contrast | Notes |
|-------|---------|----------|-------|
| `--Primary-BG-Subtle-Accent` | Accent decorations, icons | 3.0:1 minimum | Walks from base step toward contrasting direction until 3:1 achieved |
| `--Primary-BG-Subtle-Accent-A11y` | Accent text (links, labels) | 4.5:1 WCAG AA | Uses asymmetric logic (see below) |

**Accent-A11y difference from default (significant):**

On `on-default` context (default surface), `Accent-A11y` simply walks from the base step toward the contrasting extreme until 4.5:1 is reached.

On `on-subtle` context (bg-subtle surface), the computation is **asymmetric**:
- **Light contrast direction** (dark surfaces): Uses step 2500 (near-white) directly, since it reliably exceeds 4.5:1 against dark surfaces.
- **Dark contrast direction** (light surfaces): Walks from base toward dark until 4.5:1 is achieved.

In practice, for a light-theme bg-subtle surface, the `Accent-A11y` value is computed by walking from base toward dark. The resulting color may differ from the default surface's `Accent-A11y` because the target contrast is measured against a different surface hex.

### 4. State Layer Tokens (2 tokens)

| Token | Purpose | Opacity | Notes |
|-------|---------|---------|-------|
| `--Primary-BG-Subtle-Hover` | Hover interaction overlay | 16% alpha | Stroke source blended at 16% against bg-subtle surface |
| `--Primary-BG-Subtle-Pressed` | Pressed interaction overlay | 24% alpha | Stroke source blended at 24% against bg-subtle surface |

**Difference from default:** Same alpha values (0.16 / 0.24), but blended against the bg-subtle surface hex and using the `on-subtle` stroke source (+10 step offset). The visual result is a slightly different tint that harmonizes with the bg-subtle background.

## Full Token List Per Role

For any role `{Role}` (Primary, Neutral, Secondary, Sparkle, etc.):

```
--{Role}-BG-Subtle                     (surface fill)
--{Role}-BG-Subtle-High                (primary text)
--{Role}-BG-Subtle-Medium-Text         (secondary text)
--{Role}-BG-Subtle-Low-Text            (tertiary text)
--{Role}-BG-Subtle-Medium-Stroke       (standard border)
--{Role}-BG-Subtle-Low-Stroke          (subtle border)
--{Role}-BG-Subtle-Accent              (accent decoration, 3:1)
--{Role}-BG-Subtle-Accent-A11y         (accent text, 4.5:1)
--{Role}-BG-Subtle-Hover               (hover state layer)
--{Role}-BG-Subtle-Pressed             (pressed state layer)
```

That is **10 tokens per role** (1 fill + 9 on-colours).

## How Surface Context Remapping Works on bg-subtle

When `<Surface mode="bg-subtle">` wraps components, the generated CSS includes a `[data-surface="bg-subtle"]` block that **remaps Default-context tokens** to the bg-subtle on-colours:

```css
[data-surface="bg-subtle"] {
    /* Default on-colours remapped to bg-subtle on-colours */
    --Primary-Default-High: <bg-subtle High value>;
    --Primary-Default-Medium-Text: <bg-subtle Medium-Text value>;
    --Primary-Default-Low-Text: <bg-subtle Low-Text value>;
    --Primary-Default-Medium-Stroke: <bg-subtle Medium-Stroke value>;
    --Primary-Default-Low-Stroke: <bg-subtle Low-Stroke value>;
    --Primary-Default-Accent: <bg-subtle Accent value>;
    --Primary-Default-Accent-A11y: <bg-subtle Accent-A11y value>;
    --Primary-Default-Hover: <bg-subtle Hover value>;
    --Primary-Default-Pressed: <bg-subtle Pressed value>;

    /* FG-Bold tokens preserved (non-inverted, since bg-subtle is NOT a bold surface) */
    --Primary-FG-Bold: <original fg-bold hex>;
    --Primary-FG-Bold-High: <original on-bold High>;

    /* BG-Subtle tokens use state-layer tint from target on-colours */
    --Primary-BG-Subtle: <bg-subtle hover hex>;
    --Primary-BG-Subtle-Hover: <bg-subtle pressed hex>;
    --Primary-BG-Subtle-Pressed: <bg-subtle pressed hex>;

    /* Legacy backward-compat aliases */
    --Text-High: <bg-subtle High>;
    --Text-Medium: <bg-subtle Medium-Text>;
    --Text-Low: <bg-subtle Low-Text>;
}
```

### Key Remapping Behaviors on bg-subtle

1. **Default-context tokens are remapped** -- `--{Role}-Default-High`, `--{Role}-Default-Medium-Text`, etc. all resolve to the `bg-subtle` on-colour values. Components that read `--Primary-Default-High` (as most do) automatically get the correct contrast-safe text color.

2. **FG-Bold tokens are NOT inverted** -- Unlike `fg-bold` surfaces, bg-subtle does NOT trigger brand bold inversion. Bold buttons keep their original brand-color fill. This is because bg-subtle is a light/tinted surface, not a dark/colored one, so bold fills remain visible.

3. **BG-Subtle tokens remap to state-layer tints** -- Since the component is already ON a bg-subtle surface, the `--{Role}-BG-Subtle` token (used by subtle/medium-emphasis buttons) is remapped to the hover state-layer hex. This provides a visible step above the current surface.

4. **Legacy tokens adapt** -- `--Text-High`, `--Text-Medium`, `--Text-Low`, `--Surface-Bold`, etc. all remap correctly for backward compatibility.

## Practical Usage

```tsx
import { Surface } from '@oneui/ui/components/Surface';

// Card on a bg-subtle surface
<Surface mode="bg-subtle">
  {/* Text automatically gets correct contrast against bg-subtle background */}
  <h3>Card Title</h3>  {/* reads --Text-High or --Primary-Default-High */}
  <p>Description</p>   {/* reads --Text-Medium or --Primary-Default-Medium-Text */}
  <span>Caption</span> {/* reads --Text-Low or --Primary-Default-Low-Text */}

  {/* Borders automatically adjust */}
  <hr />               {/* reads --Border-Default or --Primary-Default-Medium-Stroke */}

  {/* Buttons fully adapt */}
  <Button variant="bold">Bold</Button>     {/* Brand-color fill, white text -- unchanged */}
  <Button variant="subtle">Subtle</Button> {/* Tinted fill adjusted for bg-subtle context */}
  <Button variant="ghost">Ghost</Button>   {/* Transparent, accent text -- accent recomputed */}

  {/* Links and accent text use recomputed accent */}
  <a href="#">Link</a> {/* reads --Primary-Default-Accent-A11y */}
</Surface>
```

## Summary of Differences: Default vs bg-subtle

| Aspect | Default Surface | bg-subtle Surface |
|--------|----------------|-------------------|
| **Background** | Pure white (light) / near-black (dark) | Slightly tinted (light step 2300 / dark step 400) |
| **On-colour context** | `on-default` | `on-subtle` |
| **Stroke offset** | +8 steps | +10 steps (more contrast needed) |
| **Text colors** | Same 4.5:1 targets, computed against white/black | Same 4.5:1 targets, computed against tinted surface |
| **Accent-A11y** | Walk from base toward contrast | Asymmetric (light dir: use 2500; dark dir: walk from base) |
| **State layers** | 16% / 24% alpha against default bg | 16% / 24% alpha against bg-subtle bg |
| **Bold inversion** | N/A (default context) | NO inversion (bg-subtle is a light surface) |
| **BG-Subtle button fill** | Uses bg-subtle fill directly | Remapped to state-layer hover tint (one step above) |
| **Visual impact** | Baseline | Subtle -- slightly different tints due to different blend target |

## Environment Token Mapping

When using the `--env-*` abstraction layer, `bg-subtle` maps to the `container` level:

```typescript
const env = resolveSurfaceEnvironment(resolvedTokens, {
  appearance: 'primary',
  level: 'container',  // maps to bg-subtle mode
  theme: 'light',
});
```

This returns:

| Env Token | Source |
|-----------|--------|
| `--env-bg` | `Primary-BG-Subtle` fill |
| `--env-fg` | `Primary-BG-Subtle-High` |
| `--env-fg-muted` | `Primary-BG-Subtle-Medium-Text` |
| `--env-fg-subtle` | `Primary-BG-Subtle-Low-Text` |
| `--env-border` | `Primary-BG-Subtle-Medium-Stroke` |
| `--env-border-subtle` | `Primary-BG-Subtle-Low-Stroke` |
| `--env-accent` | `Primary-BG-Subtle-Accent` |
| `--env-accent-a11y` | `Primary-BG-Subtle-Accent-A11y` |
| `--env-state-layer-hover` | `Primary-BG-Subtle-Hover` |
| `--env-state-layer-pressed` | `Primary-BG-Subtle-Pressed` |
| `--env-ghost` | `transparent` |
| `--env-focus-ring` | Same as `--env-accent-a11y` |
| `--env-focus-ring-offset` | Same as `--env-bg` |
