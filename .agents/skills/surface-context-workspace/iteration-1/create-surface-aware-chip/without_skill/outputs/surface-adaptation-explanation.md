# Chip Component: Surface Adaptation Explanation

## Intermediate Variable Pattern

The Chip CSS module follows the same **role-agnostic intermediate variable** pattern established by Button and Avatar in the OneUI design system. The pattern has three layers:

### Layer 1: Intermediate Variables (`--_chip-*`)

The `.chip` root class defines 13 intermediate CSS custom properties, defaulting to the **Primary** appearance role:

```css
.chip {
  --_chip-fg-bold: var(--Primary-FG-Bold, var(--Surface-Bold));
  --_chip-fg-bold-high: var(--Primary-FG-Bold-High, var(--Text-OnBold-High));
  --_chip-bg-subtle: var(--Primary-BG-Subtle, var(--Surface-Subtle));
  --_chip-default-accent-a11y: var(--Primary-Default-Accent-A11y, var(--Surface-Bold));
  --_chip-default-low-stroke: var(--Primary-Default-Low-Stroke, var(--Surface-Bold));
  /* ... 8 more */
}
```

Each intermediate variable points to a role-qualified foundation token (e.g. `--Primary-FG-Bold`) with a generic fallback (e.g. `--Surface-Bold`) for environments without brand CSS.

### Layer 2: Appearance Remapping

Adding a new appearance role is a single CSS class that remaps all 13 intermediates:

```css
.appearanceNeutral {
  --_chip-fg-bold: var(--Neutral-FG-Bold, var(--Surface-Bold));
  --_chip-fg-bold-high: var(--Neutral-FG-Bold-High, var(--Text-OnBold-High));
  /* ... same 13 remappings for the Neutral role */
}
```

This is purely mechanical -- each new role is 13 lines with the role prefix swapped. The Chip supports primary (default), neutral, and negative. More can be added by copying the pattern.

### Layer 3: Variant Selectors

Variants consume only intermediate variables -- they never reference role-specific tokens directly:

| Variant | Emphasis | Background | Text | Border |
|---------|----------|------------|------|--------|
| `filled` | High | `--_chip-fg-bold` (solid accent) | `--_chip-fg-bold-high` (white on bold) | None |
| `tinted` | Medium | `--_chip-bg-subtle` (translucent tint) | `--_chip-default-accent-a11y` (accessible accent) | None |
| `outlined` | Low | `transparent` | `--_chip-default-accent-a11y` (accessible accent) | `--_chip-default-low-stroke` |

This means variant code is written **once** and works with all appearance roles without duplication.

## How Surface Adaptation Works

### The Mechanism: Zero Component CSS Changes

When a Chip is placed inside `<Surface mode="fg-bold">`, it adapts **automatically** without any Chip-specific CSS changes. Here is the full chain:

```
1. <Surface mode="fg-bold"> sets data-surface="fg-bold" on the wrapper div
2. Brand CSS (injected via useBrandCSS at @layer brand) contains:
   [data-surface="fg-bold"] {
     --Primary-FG-Bold: #8584fc;        /* brand bold inversion */
     --Primary-FG-Bold-High: ...;       /* text on brand bold */
     --Primary-BG-Subtle: rgba(R,G,B,0.24); /* brand bold @ 24% */
     --Primary-Default-High: #ffffff;   /* white text */
     --Primary-Default-Accent-A11y: ... /* light accent */
     --Primary-Default-Low-Stroke: ...  /* visible border on dark */
     --Text-High: #ffffff;              /* backward compat */
     ...
   }
3. CSS custom property inheritance carries these remapped values
   down to the Chip's --_chip-* intermediates
4. The intermediates resolve to the new, surface-aware values
5. Variants read the intermediates and display correctly
```

### What Changes Per Variant on FG-Bold Surface

| Variant | Default Surface | FG-Bold Surface |
|---------|----------------|-----------------|
| **filled** | Solid accent fill (e.g. purple `#3900ad`), white text | Brand bold inversion fill (e.g. tinted accent `#8584fc`), text = `accentA11y` on that fill |
| **tinted** | Translucent tinted fill (e.g. `rgba(163,167,255,0.24)`), dark accent text | Brand bold @ 24% alpha fill, white/light accent text |
| **outlined** | Transparent bg, dark accent text, subtle dark stroke | Transparent bg, white/light text, light stroke visible on dark |

### Why It Works Without Component Changes

The key insight is that the Chip's CSS **never references absolute color values**. Every visual property resolves through this chain:

```
Variant selector
  -> reads --_chip-* intermediate
    -> points to --{Role}-* foundation token
      -> resolved by @layer brand CSS (which includes [data-surface] overrides)
```

When the Chip is a descendant of `[data-surface="fg-bold"]`, the `--{Role}-*` tokens are remapped by the surface context CSS block. The intermediates and variant selectors don't change -- they just inherit different resolved values.

### The Brand Bold Inversion Rule

On an fg-bold surface, a filled chip's background would normally match the surface color (both use `--{Role}-FG-Bold`). The V4 engine solves this with **brand bold inversion**:

- The surface context CSS remaps `--{Role}-FG-Bold` to a **tinted accent** color (base step + 8, clamped 400-2200)
- The filled chip's fill becomes visually distinguishable from the surface
- `--{Role}-FG-Bold-High` remaps to the `accentA11y` color computed on this inverted surface
- Result: the filled chip is visible and readable on the bold surface

### Supported Surface Modes

| Mode | Chip Behavior |
|------|--------------|
| `default` | Standard appearance (no remapping) |
| `fg-bold` | Full token inversion for dark/colored backgrounds |
| `bg-subtle` | Subtle tint adjustments (future) |
| `elevated` | Standard with elevated surface tokens |

### Nesting

Surface contexts fully replace (not merge). A Chip inside nested surfaces sees only the innermost context:

```html
<Surface mode="fg-bold">           <!-- dark surface -->
  <Chip variant="outlined" />      <!-- light text, light stroke -->
  <Surface mode="default">         <!-- reset to standard -->
    <Chip variant="outlined" />    <!-- dark text, dark stroke -->
  </Surface>
</Surface>
```

## Component Override Tokens

Every visual property can be overridden per-brand via `--Chip-*` component tokens injected through `@layer brand`:

| Token | Controls | Default |
|-------|----------|---------|
| `--Chip-borderRadius` | Shape | `--Shape-Pill` |
| `--Chip-paddingVertical` | Vertical padding | `--Spacing-6XS` |
| `--Chip-paddingHorizontal` | Horizontal padding | `--Spacing-XS` |
| `--Chip-fontSize` | Text size | `--Label-XS-FontSize` |
| `--Chip-fontWeight` | Text weight | `--Label-FontWeight-Medium` |
| `--Chip-minHeight` | Minimum height | `--Spacing-2XL` |
| `--Chip-iconSize` | Leading icon size | `--Spacing-S` |
| `--Chip-dismissSize` | Dismiss button size | `--Spacing-S` |
| `--Chip-backgroundColor-filled` | Filled variant bg | `--_chip-fg-bold` |
| `--Chip-textColor-filled` | Filled variant text | `--_chip-fg-bold-high` |
| `--Chip-borderWidth-outlined` | Outlined border width | `--Border-Width-Hairline` |
| `--Chip-borderColor-outlined` | Outlined border color | `--_chip-default-low-stroke` |

These follow the established pattern: `--ComponentName-property` for base, `--ComponentName-property-variant` for variant-specific, `--ComponentName-property-size` for size-specific.

## Adding More Appearance Roles

To add a new role (e.g. `positive`), create one CSS class with 13 remappings:

```css
.appearancePositive {
  --_chip-fg-bold: var(--Positive-FG-Bold, var(--Surface-Bold));
  --_chip-fg-bold-high: var(--Positive-FG-Bold-High, var(--Text-OnBold-High));
  /* ... 11 more, swapping "Positive" prefix */
}
```

No variant CSS changes needed. The new role automatically gets surface adaptation because `--Positive-*` tokens are remapped by the same `[data-surface]` CSS blocks.
