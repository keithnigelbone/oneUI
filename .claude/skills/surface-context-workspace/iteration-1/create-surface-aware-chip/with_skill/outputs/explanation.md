# Chip Component: Surface Adaptation Explained

## Overview

The `Chip.module.css` file implements a surface-aware Chip component using the OneUI **intermediate variable pattern**. This is the same architecture used by the Button component -- the most thoroughly validated surface-aware component in the system.

The component supports:
- **3 variants**: `filled` (high emphasis), `tinted` (medium emphasis), `outlined` (low emphasis)
- **3 appearance roles**: `primary` (default), `neutral`, `negative`
- **Automatic surface adaptation**: correct colors on both default and `fg-bold` surfaces, with zero runtime JavaScript

---

## The Intermediate Variable Pattern

### How It Works

The pattern has four layers:

```
Layer 1: Intermediate variables (--_chip-*)        ← role-agnostic
Layer 2: Appearance role classes remap intermediates ← role-specific V4 tokens
Layer 3: Variant classes consume intermediates       ← no duplication
Layer 4: [data-surface] CSS remaps the V4 tokens    ← automatic surface adaptation
```

### Layer 1: Intermediate Variables

The `.chip` root class declares 12 intermediate CSS custom properties, all prefixed `--_chip-` (the underscore signals they are private/internal). By default, they point to the **Primary** role's V4 surface tokens:

```css
.chip {
  --_chip-fg-bold: var(--Primary-FG-Bold, var(--Surface-Bold));
  --_chip-fg-bold-high: var(--Primary-FG-Bold-High, var(--Text-OnBold-High));
  --_chip-bg-subtle: var(--Primary-BG-Subtle, var(--Surface-Subtle));
  --_chip-default-accent-a11y: var(--Primary-Default-Accent-A11y, var(--Surface-Bold));
  --_chip-default-low-stroke: var(--Primary-Default-Low-Stroke, var(--Border-Subtle));
  /* ...plus hover, pressed, and other on-colour intermediates */
}
```

Each intermediate has **two fallback layers**:
1. The V4 role token (e.g., `--Primary-FG-Bold`) -- resolved by the brand CSS engine
2. A legacy backward-compat token (e.g., `--Surface-Bold`) -- works even before brand CSS loads

### Layer 2: Appearance Role Remapping

Each appearance role class overrides the same 12 intermediates to point at a different role's tokens:

```css
.appearanceNeutral {
  --_chip-fg-bold: var(--Neutral-FG-Bold, var(--Surface-Bold));
  --_chip-fg-bold-high: var(--Neutral-FG-Bold-High, var(--Text-OnBold-High));
  /* ...all 12 variables remapped to Neutral role... */
}

.appearanceNegative {
  --_chip-fg-bold: var(--Negative-FG-Bold, var(--Surface-Bold));
  /* ...all 12 variables remapped to Negative role... */
}
```

Adding a new role (e.g., `positive`, `warning`, `informative`) requires exactly **one new class with 12 remappings** -- no changes to variant styles.

### Layer 3: Variant Consumption

Variant classes consume the intermediates without knowing which role is active:

| Variant | Background | Text Color | Border |
|---------|-----------|------------|--------|
| `filled` | `--_chip-fg-bold` (bold surface) | `--_chip-fg-bold-high` (on-bold text) | none |
| `tinted` | `--_chip-bg-subtle` (tinted surface) | `--_chip-default-accent-a11y` (accessible accent) | none |
| `outlined` | `transparent` | `--_chip-default-accent-a11y` (accessible accent) | `--_chip-default-low-stroke` |

This maps cleanly to the Figma attention-level model:

| Figma Attention | Chip Variant | Emphasis |
|-----------------|-------------|----------|
| High | `filled` | Bold fill, maximum visual weight |
| Medium | `tinted` | Tinted background, moderate weight |
| Low | `outlined` | Transparent fill, border only |

### Layer 4: Automatic Surface Adaptation

This is where the system becomes powerful. **The component CSS itself does nothing special for surface adaptation.** It happens entirely through the brand CSS engine's generated `[data-surface]` blocks.

---

## Surface Adaptation Walkthrough

### Default Surface (white/light page)

On a default surface, V4 tokens resolve to their standard values:

```
--Primary-FG-Bold         → #6C5CE7 (brand purple)
--Primary-FG-Bold-High    → #ffffff (white, for text on purple)
--Primary-BG-Subtle       → rgba(108,92,231,0.08) (light purple tint)
--Primary-Default-Accent-A11y → #4A3DBD (darker purple, 4.5:1 contrast)
--Primary-Default-Low-Stroke  → rgba(11,0,52,0.20) (subtle border)
```

Result:
- **filled chip**: Purple fill, white text
- **tinted chip**: Light purple tint fill, dark purple text
- **outlined chip**: Transparent fill, subtle border, dark purple text

### FG-Bold Surface (dark/brand-colored section)

When the chip is placed inside `<Surface mode="fg-bold">`, the `[data-surface="fg-bold"]` CSS block (injected by the brand CSS engine at `@layer brand` precedence) remaps the underlying V4 tokens:

```css
[data-surface="fg-bold"] {
  --Primary-FG-Bold: #8a7de8;           /* brand bold inversion (tinted accent) */
  --Primary-FG-Bold-High: #ffffff;       /* still white */
  --Primary-BG-Subtle: rgba(138,125,232,0.24); /* alpha-blended tint on dark */
  --Primary-Default-Accent-A11y: #c8b6ff; /* lighter accent (meets 4.5:1 on dark) */
  --Primary-Default-Low-Stroke: rgba(255,255,255,0.20); /* white at 20% alpha */
  --Primary-Default-High: #ffffff;        /* text flips to white */
}
```

The chip's intermediate variables (`--_chip-*`) resolve through the **remapped** V4 tokens automatically. Result:

| Variant | On Default Surface | On FG-Bold Surface |
|---------|-------------------|-------------------|
| **filled** | Purple fill, white text | Tinted accent fill (brand inversion), white text |
| **tinted** | Light purple tint, dark accent text | 24% alpha tint on dark, white/light accent text |
| **outlined** | Transparent, dark border+text | Transparent, white border+text |

### Why Filled Chips Don't Disappear on Bold Surfaces

The bold inversion rule prevents the "invisible chip" problem. On a default surface, `--Primary-FG-Bold` is the full brand color (e.g., `#6C5CE7`). If the chip sits on a `fg-bold` surface that is also `#6C5CE7`, a filled chip would be invisible.

The brand CSS engine solves this by remapping `--Primary-FG-Bold` inside `[data-surface="fg-bold"]` to a **brand bold inversion** color -- a tinted accent computed as base step + 8 f-steps in the contrast direction. This gives the filled chip a visible fill that contrasts with the surface background, without any component-level code.

---

## Token Flow Diagram

```
Component CSS              Appearance Class           Brand CSS Engine
============               ================           ================

.chip {                    .appearanceNeutral {       :root {
  --_chip-fg-bold:           --_chip-fg-bold:            --Primary-FG-Bold: #6C5CE7;
    var(--Primary-FG-Bold)     var(--Neutral-FG-Bold)    --Neutral-FG-Bold: #374151;
}                          }                          }

                                                      [data-surface="fg-bold"] {
                                                        --Primary-FG-Bold: #8a7de8;
                                                        --Neutral-FG-Bold: #9CA3AF;
                                                      }
```

The CSS cascade resolves the chain:
1. Variant reads `--_chip-fg-bold`
2. Intermediate resolves to role-specific token (e.g., `--Primary-FG-Bold` or `--Neutral-FG-Bold`)
3. Role token resolves via `:root` (default) or `[data-surface]` (surface context)

No JavaScript involved at any step.

---

## Brand Overridability

Every visual property has a `--Chip-*` override hook:

```css
background-color: var(--Chip-backgroundColor-filled, var(--_chip-fg-bold));
color: var(--Chip-textColor-filled, var(--_chip-fg-bold-high));
border-radius: var(--Chip-borderRadius, var(--Shape-3XS));
```

Brands can inject overrides via `@layer brand` to customize the chip's appearance without modifying the component CSS:

```css
@layer brand {
  :root {
    --Chip-borderRadius: var(--Shape-Pill);   /* Jio: pill-shaped chips */
    --Chip-fontSize: var(--Label-XS-FontSize); /* Smaller chip text */
  }
}
```

---

## Adding More Appearance Roles

To add support for, say, `positive` and `warning`:

```css
.appearancePositive {
  --_chip-fg-bold: var(--Positive-FG-Bold, var(--Surface-Bold));
  --_chip-fg-bold-high: var(--Positive-FG-Bold-High, var(--Text-OnBold-High));
  --_chip-fg-bold-hover: var(--Positive-FG-Bold-Hover, var(--Surface-Bold-Hover));
  --_chip-fg-bold-pressed: var(--Positive-FG-Bold-Pressed, var(--Surface-Bold-Pressed));
  --_chip-bg-subtle: var(--Positive-BG-Subtle, var(--Surface-Subtle));
  --_chip-bg-subtle-hover: var(--Positive-BG-Subtle-Hover, var(--Surface-Subtle-Hover));
  --_chip-bg-subtle-pressed: var(--Positive-BG-Subtle-Pressed, var(--Surface-Subtle-Pressed));
  --_chip-default-high: var(--Positive-Default-High, var(--Text-High));
  --_chip-default-accent-a11y: var(--Positive-Default-Accent-A11y, var(--Surface-Bold));
  --_chip-default-low-stroke: var(--Positive-Default-Low-Stroke, var(--Border-Subtle));
  --_chip-default-hover: var(--Positive-Default-Hover, var(--Surface-Minimal));
  --_chip-default-pressed: var(--Positive-Default-Pressed, var(--Surface-Subtle));
}
```

The variant styles (`.filled`, `.tinted`, `.outlined`) require zero changes -- they already consume the intermediates.

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `--_chip-` prefix (underscore) | Signals private/internal scope; CSS Modules prevents external access |
| 12 intermediate variables | Covers fill, text, border, hover, and pressed for all 3 variant patterns |
| Legacy fallbacks on every intermediate | Ensures the chip renders correctly before brand CSS loads (FOUC prevention) |
| `--Chip-*` override hooks | Enables brand-level customization without touching component CSS |
| `Shape-3XS` default radius | Follows the "interactive element = subtle radius" convention (not Pill, which is Button-specific) |
| `Label-S` typography | Chips are compact labels; uses the Label role (same as Button) |
| No `@media` queries | Responsive behavior comes from the dimension token cascade, not component CSS |
