---
name: surface-context
description: "OneUI surface context awareness system — how components automatically adapt colors when placed on different background surfaces via CSS-only token remapping. Use this skill whenever working with: surface tokens, the <Surface> component, data-surface attributes, surface modes (default/ghost/minimal/subtle/moderate/bold/elevated), on-colour tokens, bold inversion, content tokens (high/medium/low/tinted/tintedA11y/strokeMedium/strokeLow), state tokens, component surface adaptation, creating surface-aware components, or the intermediate variable CSS pattern. Also use when placing components on colored/dark/brand backgrounds, debugging invisible components on bold surfaces, understanding token naming (--Role-Bold, --Role-TintedA11y), or building showcase pages with Surface context sections."
---

# OneUI Surface Context Awareness

## What This System Does

Components in OneUI automatically adapt their colors when placed on different background surfaces. A Button on a white page has dark text; the same Button on a bold purple surface has white text. No extra props, no manual overrides — it happens through CSS custom property remapping via `[data-surface]` attribute selectors.

This matches how Figma handles it: components reference generic color tokens, and the variable mode determines what values those tokens resolve to. The web implementation mirrors this via CSS cascade.

**Origin**: The algorithm was ported from `OneUIColourTool/packages/core/src/surfaceLogic.ts` (Figma plugin) and adapted to use hex-based `colorMath.ts` utilities instead of culori/OkLCH.

## Core Architecture

### The 7 Unified Surface Tokens

The system uses **7 surface tokens** that resolve relative to their parent step on a 25-step color scale (100-2500). No BG/FG distinction in the core — that's a legacy naming convention kept for backward compatibility.

| Token | Offset Rule | Purpose |
|-------|------------|---------|
| `default` | 2500 (light) or 200 (dark) | Page background |
| `ghost` | Same as parent | Transparent overlay |
| `minimal` | parent + dir * 100 | Minimal shift |
| `subtle` | parent + dir * 200 | Noticeable tint |
| `moderate` | parent + dir * 300 | Medium emphasis |
| `bold` | Scale's base step (smart selection) | Full brand accent |
| `elevated` | parent + 100 (capped at 2500) | Floating elements |

**Key insight**: `dir` (contrast direction) is computed dynamically — toward lighter (2500) or darker (200) for maximum contrast against the parent. Bold uses the scale's `baseStep` or `darkerBaseStep` depending on whether the parent is in the light or dark half of the scale (threshold: step 1300).

### The 7 Content Tokens

Content tokens determine text, accent, and stroke colors relative to a parent surface. All guarantee WCAG compliance:

| Token | Purpose | Value |
|-------|---------|-------|
| `high` | Primary text | Full-opacity contrasting extreme (black or white) |
| `medium` | Secondary text | Midpoint between `low` opacity and 1.0 |
| `low` | Tertiary text | Minimum opacity for 4.5:1 WCAG AA |
| `tinted` | Accent color | Walk from base step until 3:1 contrast |
| `tintedA11y` | Accessible accent | Walk from base step until 4.5:1 contrast |
| `strokeMedium` | Standard border | Fixed offset, 24-32% opacity |
| `strokeLow` | Subtle border | Fixed offset, 12-16% opacity |

**Neutral text rule**: `high`, `medium`, `low` always use pure white or pure black (not the role's tinted palette extreme). This prevents colored text on brands with saturated scales.

### The 6 State Tokens + 6 State Layers

The engine emits solid state tokens for backwards compatibility and plugin-style translucent state-layer tokens for components that paint states as overlays.

| Token | Base Surface | Offset |
|-------|-------------|--------|
| `hover` | parent | +1 step |
| `pressed` | parent | +2 steps |
| `boldHover` | bold | +3 steps |
| `boldPressed` | bold | +5 steps |
| `subtleHover` | subtle | +1 step |
| `subtlePressed` | subtle | +2 steps |

State-layer tokens append `-Layer` to the solid token name, for example `--Primary-Hover-Layer` and `--Primary-Bold-Pressed-Layer`. They resolve to `rgba(...)` from the active parent step plus `dir * 800`, clamped to `200..2000`; normal surfaces use 0.16/0.24 hover/pressed opacity, bold uses 0.24/0.32. This matches the plugin tokenator: bold changes opacity, not the overlay colour reference step.

### Token Resolution: 3 Contexts Per Role

For each appearance role, the system resolves content tokens at **3 different surfaces**:

| Context | Resolved At | Used For |
|---------|------------|----------|
| `content` | Parent step | Text/icons on the page surface |
| `onBoldContent` | Bold surface step | Text/icons on bold fills (Button bold variant) |
| `onSubtleContent` | Subtle surface step | Text/icons on subtle fills |

This is why a bold Button can have white text — its text color reads from `onBoldContent.high`, which was resolved at the dark bold step where the contrast direction flips to white.

---

## Token Naming

### New System (Current)

Tokens follow `--{Role}-{Token}` for surface fills and `--{Role}-{ContentToken}` for content:

```
--Primary-Bold           → Primary bold surface fill
--Primary-High           → High-emphasis text (resolved at parent)
--Primary-TintedA11y     → Accessible accent (resolved at parent)
--Primary-Stroke-Medium  → Standard border
--Primary-Bold-High      → Text on bold fill (resolved at bold step)
--Primary-Bold-TintedA11y → Accent on bold fill
--Primary-Hover          → Hover state on default surface
--Primary-Bold-Hover     → Hover state on bold fill
--Primary-Hover-Layer    → Plugin-style hover overlay for default/ghost states
--Primary-Bold-Hover-Layer → Plugin-style hover overlay for bold fill
```

### V4 Aliases (Backward Compat)

Generated alongside new tokens for components not yet migrated:

```
--Primary-FG-Bold         → same as --Primary-Bold
--Primary-BG-Subtle       → same as --Primary-Subtle
--Primary-Default-High    → same as --Primary-High (content at parent)
--Primary-Default-Accent-A11y → same as --Primary-TintedA11y
--Primary-Default-Low-Stroke  → same as --Primary-Stroke-Low
--Primary-FG-Bold-High    → same as --Primary-Bold-High
```

### Legacy Aliases

Mapped from Primary (or Neutral fallback):

```
--Surface-Bold    → --Primary-Bold
--Surface-Subtle  → --Primary-Subtle
--Text-High       → --Primary-High
--Text-OnBold-High → --Primary-Bold-High
--Border-Default  → from Neutral strokes
--Border-Subtle   → from Neutral strokes
```

### Appearance Roles

| Role | CSS Prefix | Description |
|------|-----------|-------------|
| `primary` | `--Primary-` | Main brand accent |
| `secondary` | `--Secondary-` | Second accent |
| `tertiary` | `--Tertiary-` | Third accent |
| `quaternary` | `--Quaternary-` | Fourth accent |
| `neutral` | `--Neutral-` | Achromatic (always present) |
| `sparkle` | `--Sparkle-` | Highlight/premium |
| `brand-bg` | `--Brand-Bg-` | Brand background |
| `positive` | `--Positive-` | Success semantic |
| `negative` | `--Negative-` | Error semantic |
| `warning` | `--Warning-` | Warning semantic |
| `informative` | `--Informative-` | Info semantic |

---

## Using the `<Surface>` Component

Surface sets a background color AND the `data-surface` attribute, triggering CSS token remapping for all children.

```tsx
import { Surface } from '@oneui/ui/components/Surface';

// Basic — children auto-adapt
<Surface mode="bold">
  <Button variant="bold">Fill inverts to tinted accent</Button>
  <Button variant="ghost">Text and border become white</Button>
</Surface>

// Nesting resets context
<Surface mode="bold">
  <p>White text</p>
  <Surface mode="default">
    <p>Dark text — context reset</p>
  </Surface>
</Surface>

// Legacy mode names still work (normalized internally)
<Surface mode="fg-bold">  {/* → normalized to "bold" */}
<Surface mode="bg-subtle"> {/* → normalized to "subtle" */}
```

### Mode Normalization

The Surface component normalizes legacy V4 mode names to unified tokens:

| Input | Normalized To |
|-------|--------------|
| `fg-bold` / `bg-bold` | `bold` |
| `fg-subtle` / `bg-subtle` | `subtle` |
| `fg-minimal` / `bg-minimal` | `minimal` |
| All others | Pass through |

### When to Use `<Surface>`

`<Surface>` is for **containers** that hold child components. Components like buttons and chips use FG tokens directly as their fill.

| Scenario | Surface? | Mode |
|----------|----------|------|
| Hero section with bold accent background | Yes | `bold` |
| Card with subtle tinted background | Yes | `subtle` |
| Slightly tinted section | Yes | `minimal` |
| Content on white/default page | No | Already default |
| Reset context inside a surface | Yes | `default` |
| Floating card/popover | Yes | `elevated` |

### Anti-Patterns

```tsx
// WRONG — no data-surface means no token remapping
<div style={{ background: 'var(--Primary-Bold)' }}>
  <Button variant="ghost">Dark text on dark bg = BROKEN</Button>
</div>

// CORRECT — Surface triggers the cascade
<Surface mode="bold">
  <Button variant="ghost">White text and border</Button>
</Surface>
```

### Surface Fill Tokens (Root-Only)

The Surface component reads `--Surface-Fill-*` tokens for its own background, NOT the standard role tokens. These are defined at `:root` only and **never remapped** in `[data-surface]` context blocks. This prevents the self-referential issue where a bold Surface element reads the inverted value from its own `[data-surface="bold"]` context.

```css
/* Surface.module.css */
.surface[data-surface="bold"] {
  background-color: var(--Surface-Fill-Bold, var(--Surface-Bold));
}
/* ^^^ reads Fill token → always gets the actual bold color, not the inverted one */
```

---

## CSS Mechanism

### How Context Remapping Works

The brand CSS injection pipeline generates `[data-surface]` blocks inside `@layer brand`:

```css
@layer brand {
  :root {
    --Primary-Bold: #6C5CE7;
    --Primary-High: #0b0034;
    --Primary-TintedA11y: #5b4cdb;
    /* ... all tokens at default (page surface) values ... */
  }

  [data-surface="bold"] {
    /* All tokens re-resolved at the bold surface step */
    --Primary-High: #ffffff;           /* text flips to white */
    --Primary-TintedA11y: #c8b6ff;     /* accent lightens */
    --Primary-Bold: #8a7de8;           /* bold fill inverts */
    --Primary-Subtle: rgba(138,125,232,0.24);
    /* + V4 aliases + legacy aliases */
  }

  [data-surface="subtle"] { /* ... tokens at subtle step ... */ }
  [data-surface="moderate"] { /* ... */ }
  [data-surface="minimal"] { /* ... */ }
  [data-surface="elevated"] { /* ... */ }
}
```

**5 context blocks** are generated: minimal, subtle, moderate, bold, elevated. (`default` and `ghost` don't need remapping — default IS the base context, ghost is identical to parent.)

Because CSS cascade respects specificity and layer order, when `<Surface mode="bold">` wraps a Button, the Button's `var(--Primary-High)` resolves to white. Zero JavaScript at runtime.

### Bold Inversion

When a bold component sits on a bold surface, both use `--Primary-Bold` — making the component invisible. The system solves this: inside `[data-surface="bold"]`, `--Primary-Bold` is remapped to a **tinted accent** computed from `baseStep + 8 steps` in the contrast direction (clamped 400-2200).

| Variant | On Default | On Bold Surface |
|---------|-----------|----------------|
| **Bold** | Brand color fill, white text | Tinted accent fill, white text |
| **Subtle** | Tinted bg, accent text | Alpha tint, white text |
| **Ghost** | Transparent, accent text/border | Transparent, white text/border |

---

## Creating a Surface-Aware Component

### Step 1: Define Intermediate Variables with 3-Fallback Chain

Use role-agnostic intermediate variables (`--_comp-*`) with a 3-level fallback: new token → V4 alias → legacy token:

```css
/* MyComponent.module.css */
.root {
  /* New → V4 alias → Legacy */
  --_mc-bold: var(--Primary-Bold, var(--Primary-FG-Bold, var(--Surface-Bold)));
  --_mc-bold-high: var(--Primary-Bold-High, var(--Primary-FG-Bold-High, var(--Text-OnBold-High)));
  --_mc-subtle: var(--Primary-Subtle, var(--Primary-BG-Subtle, var(--Surface-Subtle)));
  --_mc-tinted-a11y: var(--Primary-TintedA11y, var(--Primary-Default-Accent-A11y, var(--Surface-Bold)));
  --_mc-stroke-low: var(--Primary-Stroke-Low, var(--Primary-Default-Low-Stroke, var(--Surface-Bold)));
  --_mc-hover: var(--Primary-Hover, var(--Primary-Default-Hover));
  --_mc-pressed: var(--Primary-Pressed, var(--Primary-Default-Pressed));
}
```

### Step 2: Use Intermediates in Variants

```css
.bold {
  background-color: var(--_mc-bold);
  color: var(--_mc-bold-high);
}

.subtle {
  background-color: var(--_mc-subtle);
  color: var(--_mc-tinted-a11y);
}

.ghost {
  background-color: transparent;
  color: var(--_mc-tinted-a11y);
  border: var(--Stroke-M) solid var(--_mc-stroke-low);
}
```

### Step 3: Add Appearance Role Classes

For each supported role, remap intermediates:

```css
.appearanceNeutral {
  --_mc-bold: var(--Neutral-Bold, var(--Neutral-FG-Bold, var(--Surface-Bold)));
  --_mc-bold-high: var(--Neutral-Bold-High, var(--Neutral-FG-Bold-High, var(--Text-OnBold-High)));
  --_mc-subtle: var(--Neutral-Subtle, var(--Neutral-BG-Subtle, var(--Surface-Subtle)));
  --_mc-tinted-a11y: var(--Neutral-TintedA11y, var(--Neutral-Default-Accent-A11y, var(--Surface-Bold)));
  --_mc-stroke-low: var(--Neutral-Stroke-Low, var(--Neutral-Default-Low-Stroke, var(--Surface-Bold)));
  --_mc-hover: var(--Neutral-Hover, var(--Neutral-Default-Hover));
  --_mc-pressed: var(--Neutral-Pressed, var(--Neutral-Default-Pressed));
}

.appearanceSecondary {
  --_mc-bold: var(--Secondary-Bold, var(--Secondary-FG-Bold, var(--Surface-Bold)));
  /* ... same pattern for all intermediates ... */
}

/* Repeat for: Tertiary, Quaternary, Sparkle, Brand-Bg, Positive, Negative, Warning, Informative */
```

### Step 4: Slot Content Remapping (If Component Has Slots)

When a bold variant contains child components (icons, counter badges), those children read `--Neutral-Default-High` for their color. Override this so slot content matches the variant's text color:

```css
/* Bold: slot children use on-bold-high (white) */
.bold .slotContext {
  --Neutral-Default-High: var(--_mc-bold-high);
  --Text-High: var(--_mc-bold-high);
}

/* Subtle/Ghost: slot children use accent color */
.subtle .slotContext,
.ghost .slotContext {
  --Neutral-Default-High: var(--_mc-tinted-a11y);
  --Text-High: var(--_mc-tinted-a11y);
}
```

### Step 5: Surface Adaptation Is Automatic

Because your component reads `--Primary-Bold`, `--Primary-High`, etc., and the `[data-surface]` CSS blocks remap those tokens, your component adapts with zero extra code. The `<Surface>` component handles everything.

**No JavaScript surface detection needed.** The entire mechanism is CSS cascade.

---

## Showcase Pages — Surface Context Section

Every component showcase page should include a "Surface Context" section showing the component on all 7 surface modes. Standard pattern:

```tsx
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@oneui/ui/components/Foundations/shared';

const SURFACE_MODE_LABELS: Array<{
  mode: 'default' | 'minimal' | 'subtle' | 'moderate' | 'bold' | 'elevated';
  label: string;
}> = [
  { mode: 'default', label: 'Default' },
  { mode: 'minimal', label: 'Minimal' },
  { mode: 'subtle', label: 'Subtle' },
  { mode: 'moderate', label: 'Moderate' },
  { mode: 'bold', label: 'Bold' },
  { mode: 'elevated', label: 'Elevated' },
];

// Inside the page component:
<FoundationCard
  title="Surface Context"
  description="Component adapts when placed on different surface backgrounds."
>
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-S)' }}>
    {SURFACE_MODE_LABELS.map(({ mode, label }) => (
      <Surface
        key={mode}
        mode={mode}
        style={{
          padding: 'var(--Spacing-M)',
          borderRadius: 'var(--Shape-4)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 'var(--Spacing-M)',
          width: '100%',
        }}
      >
        <span style={{
          color: 'var(--Text-High)',
          minWidth: '100px',
          margin: 0,
          fontWeight: 'var(--Typography-Weight-Medium)',
          fontSize: 'var(--Typography-Size-S)',
        }}>
          {label}
        </span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-S)', flexWrap: 'wrap' }}>
          {/* Component variants go here */}
          <MyComponent variant="bold">Bold</MyComponent>
          <MyComponent variant="subtle">Subtle</MyComponent>
          <MyComponent variant="ghost">Ghost</MyComponent>
        </div>
      </Surface>
    ))}
  </div>
</FoundationCard>
```

Note: Labels inside `<Surface>` use `var(--Text-High)` which auto-adapts. Ghost mode is excluded from the showcase array (visually identical to parent — nothing to demonstrate).

---

## Algorithm Details

### Relative Step Computation

The core insight: every surface resolves **relative to its parent step**, not from a pre-computed matrix. This eliminates the old BG/FG distinction, brand mode switch, and succession exception detection.

```
Page (step 2500, light)
  └─ Surface mode="subtle" → step 2500 + dir(-1) * 200 = 2300
       └─ Surface mode="bold" → scale.baseStep (e.g., 700)
            └─ Button bold variant → reads --Primary-Bold → 700's hex
               Button text → reads --Primary-Bold-High → white (contrast computed at step 700)
```

### Bold Token Rules

Bold is special — it jumps to the scale's `baseStep` (designer-chosen brand color) rather than offsetting:

1. If `parentStep >= 1300`: use `scale.baseStep`
2. If `parentStep < 1300`: use `scale.darkerBaseStep`
3. If the chosen candidate is < 7 steps away from parent → offset by 700 steps instead (with direction flip fallback)

`darkerBaseStep` is computed as `baseStep + offset` where offset = 0 (base >= 1900), 100 (>= 1300), 200 (>= 700), 300 (< 700).

### Content Resolution — Opacity Solving

For `medium` and `low` text tokens, the system uses 24-iteration binary search to find the minimum opacity of white/black over the parent surface that achieves 4.5:1 WCAG AA contrast. This gives precise, perceptually correct text hierarchy without fixed opacity values.

### Context Block Generation

For each of the 5 context surfaces (minimal, subtle, moderate, bold, elevated):
1. Resolve the container's step from the outer parent step
2. Resolve ALL tokens relative to the container step (new parent)
3. Emit a `[data-surface="<token>"]` CSS block with the remapped values

This is why nesting works — each Surface becomes the "parent" for its children's token resolution.

---

## Key Files

| File | Purpose |
|------|---------|
| `packages/ui/src/components/Surface/Surface.tsx` | `<Surface>` component (normalizes mode, sets `data-surface`) |
| `packages/ui/src/components/Surface/Surface.module.css` | Surface fill backgrounds via `--Surface-Fill-*` tokens |
| `packages/shared/src/engine/surfaceNew.ts` | Core algorithm: `resolveSurface()`, `resolveContent()`, `resolveTokenSet()`, `resolveContextTokenSet()` |
| `packages/shared/src/engine/cssGenNew.ts` | CSS generation: `generateRoleCSS()`, `generateSurfaceContextCSS()`, `generateFullCSS()` |
| `packages/shared/src/engine/colorMath.ts` | Hex/RGB conversion, WCAG contrast, alpha blending, binary search |
| `packages/ui/src/hooks/useBrandCSS.ts` | React hook: engine → injectable `<style>` tag |
| `packages/shared/src/engine/wrapCSS.ts` | Wraps CSS in `@layer brand { :root {} [data-surface] {} }` |
| `docs/surface-context-awareness.md` | Full system documentation |

For the complete token reference, see `references/token-reference.md`.
