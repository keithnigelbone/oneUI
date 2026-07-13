# Diagnosis: Invisible Button on FG-Bold Background

## The Problem

You have a hero section with a purple background using `var(--Primary-FG-Bold)` and a Button inside it, but the button text is invisible because it is the same color as the background. You are **not** using the `<Surface>` component.

## Root Cause

The Button component's default (bold) variant sets its **background** to `var(--Primary-FG-Bold)` and its **text** to `var(--Primary-FG-Bold-High)`. On a standard page (white/light background), this renders as a purple button with white text -- correct.

However, when you place the Button on a container that **also** uses `var(--Primary-FG-Bold)` as its background, two things go wrong:

1. **Bold variant**: The button fill (`--Primary-FG-Bold`) is identical to the container background (`--Primary-FG-Bold`). The button becomes invisible against its parent -- same purple on same purple.

2. **Ghost/subtle variants**: The text color resolves to `--Primary-Default-Accent-A11y`, which is a dark accent color designed for readability on a light background. On a dark purple surface, dark text on dark background = invisible.

The core issue is that **without `data-surface="fg-bold"` on the container**, the CSS custom property cascade does not know the button is sitting on a colored surface. The `[data-surface="fg-bold"]` selector blocks in `@layer brand` never activate, so the "bold inversion" tokens are never applied. The button continues to use the default-context token values, which assume a light/white page background.

### What the Surface system does that raw `<div>` does not

The brand CSS injection pipeline generates `[data-surface="fg-bold"] { ... }` blocks inside `@layer brand` that remap critical tokens:

| Token | Default Context | Inside `[data-surface="fg-bold"]` |
|-------|----------------|-----------------------------------|
| `--Primary-FG-Bold` | `#3900ad` (accent fill) | `#8584fc` (brand bold inversion -- a lighter tinted accent) |
| `--Primary-FG-Bold-High` | white (text on accent) | `accentA11y` on the inverted surface |
| `--Primary-Default-High` | `#1a1a1a` (dark text) | `#ffffff` (white text) |
| `--Primary-Default-Accent-A11y` | `#3900ad` (dark accent) | `#ffffff` (white) |
| `--Primary-BG-Subtle` | `rgba(163,167,255,0.24)` (tinted fill) | `rgba(brandBold, 0.24)` (translucent overlay) |
| `--Text-High` | dark | white |

Without the `data-surface` attribute, **none of these remappings happen**. Every token resolves to its default-context value, designed for a light background.

## The Fix

Wrap the hero section contents with the `<Surface>` component using `mode="fg-bold"`:

### Before (broken)

```tsx
// WRONG -- no surface context, button tokens are not remapped
<div style={{ background: 'var(--Primary-FG-Bold)' }}>
  <h1>Hero Title</h1>
  <Button variant="bold">Get Started</Button>   {/* Invisible fill */}
  <Button variant="ghost">Learn More</Button>    {/* Invisible text */}
</div>
```

### After (correct)

```tsx
import { Surface } from '@oneui/ui';

// CORRECT -- Surface sets data-surface="fg-bold" + applies the background
<Surface mode="fg-bold">
  <h1>Hero Title</h1>
  <Button variant="bold">Get Started</Button>   {/* Inverted accent fill, readable */}
  <Button variant="ghost">Learn More</Button>    {/* White text, visible */}
</Surface>
```

### Alternative: raw HTML attribute (no Surface component)

If you cannot use the `<Surface>` component, you can set the `data-surface` attribute manually:

```tsx
<div data-surface="fg-bold" style={{ background: 'var(--Primary-FG-Bold)' }}>
  <h1>Hero Title</h1>
  <Button variant="bold">Get Started</Button>
  <Button variant="ghost">Learn More</Button>
</div>
```

This activates the same `[data-surface="fg-bold"]` CSS cascade and remaps all descendant tokens. The `<Surface>` component is preferred because it automatically sets both the `data-surface` attribute and the correct background color from the token system, reducing the chance of mismatches.

## How Each Button Variant Behaves After the Fix

| Variant | On Default Surface | On FG-Bold Surface (with `<Surface>`) |
|---------|--------------------|---------------------------------------|
| **bold** | Purple fill, white text | Tinted accent fill (brand bold inversion), readable text |
| **subtle** | Light tinted fill, dark accent text | Semi-transparent overlay fill (24% alpha), white text |
| **ghost** | Transparent, dark accent text + subtle border | Transparent, white text + light accent border |

## Key Files Referenced

| File | Role |
|------|------|
| `packages/ui/src/components/Surface/Surface.tsx` | Surface component -- sets `data-surface` attribute |
| `packages/ui/src/components/Surface/Surface.module.css` | Background color per surface mode |
| `packages/ui/src/components/Button/Button.module.css` | Button intermediate variable architecture |
| `packages/shared/src/engine/cssGenV4.ts` | Generates `[data-surface]` CSS blocks with token remappings |
| `packages/shared/src/engine/surfaceV4.ts` | Computes brand bold inversion values |
| `docs/surface-context-awareness.md` | Full documentation of the surface context system |

## Project Rule

From the project's CLAUDE.md -- this is a mandatory rule:

> **RULE: Whenever placing components on a non-default background (dark sections, colored cards, hero areas), ALWAYS use `<Surface mode="...">` as the container. Never set background color manually on a div containing interactive components.**

This rule exists precisely to prevent this class of bug.
