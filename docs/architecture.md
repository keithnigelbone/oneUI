# One UI Studio -- Architecture

> How global foundation decisions cascade through the system to shape every component.

## System Overview

One UI Studio is a multi-brand design system platform where **every visual property of a component** is determined by a cascade of global decisions. No component contains hard-coded colors, sizes, or spacing. Instead, components consume CSS custom properties (`var(--Token-Name)`) that resolve dynamically based on:

1. **Which brand** is selected
2. **Which platform** the brand targets (web, mobile, TV)
3. **Which viewport breakpoint** the user is viewing at
4. **Which density mode** is active (compact, default, open)
5. **Which theme** is applied (light, dark, dim)

These five axes combine to produce a unique set of resolved token values for any given context.

---

## The Cascade: Brand to Pixel

```
Brand Selection
  │
  ├─► Color Foundation ─► Color Scales (25-step OkLCH) ─► Surface Stacking
  │                                                           │
  │   Appearance Config ─► Multi-Accent Roles ────────────────┤
  │                                                           │
  │                                                           ▼
  │                                                    Surface + Text CSS
  │                                                    (--Surface-Bold, --Text-High, etc.)
  │
  ├─► Typography Foundation ─► Font Family + Weights ─► Typography CSS
  │                                                    (--Typography-Font-Primary, etc.)
  │
  ├─► Platform Foundation ─► Breakpoints + Density Configs
  │       │                        │
  │       │                        ▼
  │       │                  Dimension Scale (f-scale)
  │       │                  (--Dimension-f0 through f12)
  │       │                        │
  │       │                        ▼
  │       │                  Spacing Tokens
  │       │                  (--Spacing-4 = var(--Dimension-f0))
  │       │                        │
  │       ▼                        ▼
  │   Viewport Interpolation    Density Remapping
  │   (clamp() or fixed px)    (compact shifts down, open shifts up)
  │
  └─► Theme (light/dark/dim) ─► Surface colors recomputed per theme
                                (same stacking algorithm, different background step)

  All tokens cascade into ──► :root { CSS Custom Properties }
                                        │
                                        ▼
                              Components read via var(--Token-Name)
                              (Button, Input, Card, Dialog, etc.)
```

---

## Role of Each Tool

### Convex (Real-Time Backend)

Convex is the single source of truth for all brand and foundation data. It provides:

- **Real-time subscriptions** -- When a designer changes a foundation value in the platform app, every connected client (including Storybook) sees the update instantly via `useQuery()` subscriptions.
- **Schema-enforced types** -- All foundation configs are validated at the database level (`packages/convex/convex/schema.ts`).
- **Key tables**: `brands`, `foundations`, `colorScales`, `appearanceConfigs`, `presetColorScaleCollections`, `brandPresetScaleSelections`, `dimensionConfigs`.
- **Key queries**:
  - `brands:list` -- All brands
  - `foundations:getBrandOverviewData` -- All foundation configs for a brand in one query
  - `presetColorScales:getBrandSelection` -- Which preset color scales a brand uses
  - `appearanceConfigs:getByBrand` -- Multi-accent configuration

### Base UI (Headless Primitives)

Base UI (`@base-ui/react`) provides unstyled, accessible component primitives. Components never fork Base UI behavior -- they wrap it and apply token-based CSS Modules on top. This ensures accessibility (keyboard nav, ARIA, focus management) comes from a maintained upstream library.

### CSS Modules (Scoped Styling)

All component styles use CSS Modules (`.module.css`). No Tailwind, no CSS-in-JS. Styles consume tokens exclusively via `var()`:

```css
.button {
  background-color: var(--Button-backgroundColor, var(--Surface-Bold));
  color: var(--Button-textColor, var(--Text-OnBold-High));
  border-radius: var(--Shape-4);
  padding: var(--Spacing-4) var(--Spacing-4-5);
}
```

The two-level fallback pattern (`--Component-prop, --Semantic-Token`) allows component-level overrides while defaulting to the global foundation value.

### Storybook (Component Documentation + Testing)

Storybook provides an isolated environment where every component can be previewed under any combination of brand, platform, breakpoint, density, and theme. It connects to the same Convex backend as the platform app.

### React Native (Cross-Platform)

Mobile components consume the same token values via a TypeScript token object (`tokens.surface.bold`, `tokens.spacing.m`) mirroring the CSS custom property names.

---

## Foundation Layers

Each brand has up to 11 foundation types stored in Convex:

| Foundation | Purpose | Key Config |
|------------|---------|------------|
| **Color** | 25-step OkLCH color scales | Preset or custom base color, chroma lock |
| **Surfaces** | Surface emphasis stacking | Automatic (from scale) or manual |
| **Appearance** | Multi-accent role assignment | 1-4 accents, each mapped to a color scale |
| **Typography** | Font family, weights, size scale | Primary/secondary font, weight mapping |
| **Platforms** | Target platforms + breakpoints | Web, mobile, TV; each with breakpoints |
| **Dimension** | Unified f-scale system | Base size + scale factor per density |
| **Shape** | Border radius tokens | XS-5XL + interactive (M) + pill |
| **Elevation** | Shadow stacking | Levels 0-5, two-shadow formula |
| **Motion** | Duration + easing | Discreet (micro) vs Expressive (macro) |
| **Materials** | Translucent/frosted/glass | Backdrop blur + opacity presets |
| **Icons** | Icon set + default size | Lucide, Tabler, Phosphor, etc. |

---

## Color System

### OkLCH and the 25-Step Scale

Every color in the system is defined in the OkLCH color space (perceptually uniform lightness, chroma, hue). Each color scale has 25 steps from 100 (near-black) to 2500 (near-white):

```
Step:      100   200   300   400   500   ...  1300  ...  2000  2100  ...  2500
Lightness:  0%    4%    8%   12%   16%  ...   50%  ...   80%   84%  ...  100%
```

**Generation** (`packages/shared/src/utils/colorScale.ts`):
1. User provides a hex color (e.g., `#FF5500`)
2. System extracts OkLCH values (lightness, chroma, hue)
3. Auto-detects which step matches the base lightness
4. Generates 25 steps with smooth lightness interpolation
5. **Chroma lock**: No step ever exceeds the base color's chroma -- this prevents oversaturated extremes

**Preset vs Custom**: Brands can use curated preset scales (shared across brands) or generate custom scales from any base color.

### Surface Stacking

Surface stacking computes 5 emphasis levels from a color palette:

| Surface | Purpose | Example |
|---------|---------|---------|
| **Default/Main** | Page background | White (light) / Near-black (dark) |
| **Minimal/Ghost** | Transparent interactive | Clear with subtle hover |
| **Subtle** | Secondary containers | Light tint |
| **Bold** | Primary actions, CTAs | Brand accent color |
| **Elevated** | Floating elements | Slightly lifted |

For each surface, the system also computes:
- **Text colors** (high/medium/low contrast) using WCAG 2.1 contrast ratios
- **Interaction states** (hover, pressed) using alpha blending on the palette
- **Theme variants** (light, dark, dim) using different background steps

**Single-accent path** (`computeFullSurfaceStackingWithText`): One color scale drives all surfaces.

**Multi-accent path** (`computeMultiAccentStacking`): Up to 4 brand accent roles (primary, secondary, sparkle, brand-bg), each from a different color scale. Primary maps to backward-compatible `--Surface-*` tokens; others get role-prefixed tokens (`--Secondary-Bold`, `--Sparkle-Subtle`, etc.).

---

## Platform & Density System

### Platforms

Each brand configures which platforms it targets. A platform defines:

- **Breakpoints** -- Named viewport widths (Mobile 360px, Tablet 768px, Desktop 1440px, etc.)
- **Viewport range** -- Min/max for responsive interpolation
- **Density configs** -- Base size + scale factor per density mode per endpoint (mobile/desktop)
- **Viewing distance** -- Used in DIN 1450 formula for scientific base size calculation

Platform types: `web`, `mobile-native`, `tablet-native`, `desktop-native`, `tv-native`, `outdoor`, `print`.

### Density

Density shifts the entire spacing system up or down by remapping which f-scale step each spacing token points to:

```
              Compact         Default         Open
Spacing-4  →  f-1 (smaller)   f0 (base)      f1 (larger)
Spacing-4-5→  f0              f1             f2
Spacing-5  →  f1              f2             f3
```

This is implemented purely in CSS via `[data-density]` selectors -- no JavaScript recalculation needed:

```css
/* Default */
.platform-scope { --Spacing-4: var(--Dimension-f0); }

/* Compact: shift everything down 1 step */
.platform-scope[data-density='compact'] { --Spacing-4: var(--Dimension-f-1); }

/* Open: shift everything up 1 step */
.platform-scope[data-density='open'] { --Spacing-4: var(--Dimension-f1); }
```

---

## Dimension Scale (F-Scale)

The f-scale is a 21-step modular scale (f-8 to f12) that underpins all sizing:

```
Step:   f-8   f-7   f-6   ...   f-1    f0     f1    f2    ...   f12
                                       (base)
        tiny  ───────────────►  small  medium  large ──────────► huge
```

**Calculation**: `value = baseSize * scaleFactor^step`

At default density, mobile endpoint:
- f0 = 16px (base)
- f1 = 16 * 1.125 = 18px
- f-1 = 16 / 1.125 = 14.2px

**Responsive values are discrete, not interpolated**: Each f-step has a separate value per breakpoint. The active column is selected by the `data-Breakpoint` attribute on `<html>` (set from the toolbar), which toggles between 3 breakpoint columns (`S`, `M`, `L`) declared in `packages/tokens/src/css/dimensions/scale.css`. No CSS `clamp()` is used — values switch instantly at breakpoint change rather than interpolating with viewport width.

```css
/* illustrative — scale.css switches on [data-Breakpoint="..."] */
:root[data-Breakpoint="S"] { --Dimension-f0: 16px; }
:root[data-Breakpoint="L"] { --Dimension-f0: 20px; }
```

**Breakpoint locking**: Selecting a specific breakpoint in the toolbar just sets `data-Breakpoint` to that column; there is no interpolation bypass because there is no interpolation.

---

## Token Resolution Chain

When a component reads `var(--Spacing-4)`, here is the full resolution order (highest precedence first):

```
1. Component override     style={{ '--Button-padding': '...' }}
                              ↓ (not set? fall through)
2. Brand CSS injection    :root { --Surface-Bold: #FF5500 }
   (FoundationStyleProvider)
                              ↓
3. Breakpoint override    style={{ '--Dimension-f0': '17px' }}
   (locks responsive value to specific viewport)
                              ↓
4. Density remapping      [data-density="compact"] { --Spacing-4: var(--Dimension-f-1) }
                              ↓
5. Semantic defaults      semantic.css: --Spacing-4: var(--Dimension-f0)
                              ↓
6. Primitive values       primitives.css: --Dimension-f0: clamp(16px, calc(...), 20px)
```

---

## CSS Injection Architecture

### Platform App (`FoundationStyleProvider`)

Located at `apps/platform/src/components/FoundationStyleProvider.tsx`. This React component:

1. Reads the current brand from `PlatformContext`
2. Subscribes to Convex queries for all foundation data (real-time)
3. Builds color palettes from scales
4. Computes surface stacking (single or multi-accent)
5. Generates CSS declarations via shared utility functions
6. Injects via `<style id="oneui-foundation-tokens">` with `:root { ... }`

```
PlatformContext.currentBrand
  → useQuery(api.foundations.getBrandOverviewData)
  → useQuery(api.presetColorScales.getBrandSelection)
  → useQuery(api.appearanceConfigs.getByBrand)
  → buildPaletteFromScale()
  → computeFullSurfaceStackingWithText() or computeMultiAccentStacking()
  → generateSurfaceCSS() + generateTypographyFontCSS()
  → <style> injection at :root
```

### Storybook (`manager.tsx` + `BrandStyleDecorator.tsx` + `preview.ts`)

Storybook mirrors the same architecture with three cooperating files:

**`manager.tsx`** (toolbar addon -- runs in Storybook's manager frame):
- Fetches brands via Convex HTTP API (not React hooks -- manager has no ConvexProvider)
- Renders unified toolbar: Brand | Platform | Viewport | Density
- Brand selection drives cascading dropdowns
- Writes selections to Storybook globals via `useGlobals()`
- Falls back to `DEFAULT_PLATFORMS_CONFIG` when brand has no saved platforms

**`BrandStyleDecorator.tsx`** (preview-side -- runs inside story iframe):
- `BrandStyleInjector` component reads `brandId` from Storybook globals
- Uses `useQuery()` hooks (inside ConvexProvider) to fetch same foundation data
- Identical computation: palette → stacking → CSS generation → `<style>` injection
- Detects current mode via `MutationObserver` on `data-mode` attribute

**`preview.ts`** (decorator chain):
- `withConvex` -- Wraps stories in `ConvexProvider`
- `withBrandStyle` -- Renders `BrandStyleInjector` when a brand is selected
- `withPlatformAndDensity` -- Applies `data-density` attribute + dimension overrides
- `withThemeByDataAttribute` -- Light/dark/dim via `data-mode` on `<html>`
- `withIcons` -- Wraps in `IconProvider`

**Manager vs Preview builds**: The manager uses esbuild (no Vite), so environment variables are injected via a `<script>` tag in `managerHead`. The preview uses Vite, so it reads `import.meta.env.VITE_CONVEX_URL`.

---

## Data Flows

### Flow A: Brand Change

```
User selects brand "Tira" in toolbar
  → updateGlobals({ brand: 'tira-id' })
  → preview decorator reads context.globals.brand
  → BrandStyleInjector mounts with brandId="tira-id"
  → useQuery(api.foundations.getBrandOverviewData, { brandId })
  → Convex returns Tira's foundations (color scales, typography, surfaces)
  → buildPaletteFromScale(tiraScale) → ColorPalette
  → computeMultiAccentStacking(palettes, accentConfig)
  → generateMultiAccentSurfaceCSS(stacking, 'light')
  → <style> injects: :root { --Surface-Bold: #E91E63; --Text-OnBold-High: #FFF; ... }
  → All components re-render with Tira's colors (no prop changes needed)
```

### Flow B: Density Change

```
User selects "Compact" in toolbar
  → updateGlobals({ density: 'compact' })
  → withPlatformAndDensity sets data-density="compact" on wrapper div
  → CSS rule activates: [data-density='compact'] { --Spacing-4: var(--Dimension-f-1); }
  → --Spacing-4 resolves to smaller value (f-1 instead of f0)
  → Button padding shrinks, card margins tighten -- all automatic
```

### Flow C: Breakpoint Change

```
User selects "Tablet 768px" in toolbar
  → updateGlobals({ breakpoint: '768' })
  → withPlatformAndDensity calls computeDimensionOverridesRaw(768, mobile, desktop, range)
  → Interpolation: t = (768-360)/(1920-360) = 0.26
  → baseSize = 16 + 0.26*4 = 17.04px, scaleFactor = 1.125 + 0.26*0.06 = 1.141
  → Generates: { '--Dimension-f0': '17px', '--Dimension-f1': '19.4px', ... }
  → Story wrapper gets inline styles with fixed values
  → clamp() bypassed -- tokens lock to tablet-sized values
```

### Flow D: Theme Change

```
User toggles to "Dark" theme
  → addon-themes sets data-mode="dark" on <html>
  → dark.css activates: [data-mode='dark'] { --Surface-Main: oklch(15% 0 0); ... }
  → BrandStyleInjector detects theme change via MutationObserver
  → Recomputes: generateSurfaceCSS(stacking, 'dark')
  → Surface stacking uses dark background step (step 200 instead of 2500)
  → <style> updates with dark-mode surface colors
  → Components automatically adapt
```

---

## Shared Packages

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@oneui/tokens` | Static CSS token files | `primitives.css`, `semantic.css`, theme/density CSS |
| `@oneui/shared` | Cross-platform utilities | `computeDimensionOverridesRaw`, `generateColorScale`, `oklchToHex` |
| `@oneui/ui` | Components + foundation logic | All components, `generateSurfaceCSS`, `buildPaletteFromScale`, `computeMultiAccentStacking` |
| `@oneui/convex` | Convex schema + API | `api.brands`, `api.foundations`, `api.appearanceConfigs` |

### CSS Generation Functions (`packages/ui/src/utils/foundationCSS.ts`)

Shared between the platform app and Storybook:

- `generateTypographyFontCSS(config)` -- Font family + weight declarations (safe for global use)
- `generateTypographyCSS(config)` -- Full typography including size scale
- `generateSurfaceCSS(stacking, theme)` -- Single-accent surface + text + interaction state tokens
- `generateMultiAccentSurfaceCSS(stacking, theme)` -- Per-accent-role tokens + backward-compatible `--Surface-*` aliases

---

## Architectural Contracts

| Contract | Consequence |
|----------|------------|
| **No literals** | Every visual value comes from a token. `check:literals` enforces this. |
| **Shape-2 for interactive** | Buttons, inputs, chips always use `var(--Shape-2)` (8px). |
| **Base chroma lock** | No color step exceeds the base color's chroma. Prevents oversaturation. |
| **F-scale single source** | Spacing and typography both derive from the same f-scale. |
| **Density = CSS remapping** | Density changes which f-step a spacing token points to, not the f-step values themselves. |
| **Responsive via clamp()** | No media queries for sizing. Steps f-1+ use CSS `clamp()` for fluid scaling. |
| **Convex real-time** | `useQuery()` subscriptions auto-update when designers change foundations. |
| **Declarative injection** | Brand styles injected as CSS custom properties. Components never compute colors. |
| **Mode via data attribute** | `[data-mode='dark']` selectors handle light/dark. No JavaScript mode switching in components. |
| **Platform-agnostic tokens** | Same token names on web (`var(--Spacing-4)`) and native (`tokens.spacing[4]`). |

---

## File Map

```
packages/
├── convex/convex/
│   ├── schema.ts                          # All table definitions
│   ├── brands.ts                          # Brand CRUD + list
│   ├── foundations.ts                      # Foundation queries (getBrandOverviewData)
│   ├── appearanceConfigs.ts               # Multi-accent config per brand
│   └── presetColorScales.ts               # Curated color scale collections
│
├── shared/src/
│   ├── utils/colorScale.ts                # 25-step OkLCH scale generation
│   ├── utils/dimension.ts                 # F-scale calculation + clamp formulas
│   ├── utils/platform-config.ts           # Platform presets + density configs
│   └── types/platforms.ts                 # PlatformEntry, Breakpoint types
│
├── tokens/src/css/
│   ├── primitives.css                     # Raw f-scale values (clamp formulas)
│   ├── semantic.css                       # Spacing-4 → Dimension-f0 mappings
│   ├── light.css / dark.css / dim.css     # Theme overrides
│   └── density/compact.css / open.css     # Density remappings
│
└── ui/src/
    ├── utils/foundationCSS.ts             # CSS generation (shared)
    ├── components/Foundations/Surfaces/    # Surface stacking algorithms
    ├── components/Foundations/Typography/  # Font family builder
    └── components/Button/Button.module.css # Example: token consumption

apps/
├── platform/src/
│   ├── components/FoundationStyleProvider.tsx  # CSS injection (platform app)
│   └── lib/foundationCSS.ts                   # Re-exports from @oneui/ui
│
└── storybook/.storybook/
    ├── main.ts                            # Storybook config + Convex URL injection
    ├── manager.tsx                         # Toolbar addon (Brand → Platform → Density)
    ├── BrandStyleDecorator.tsx             # CSS injection (Storybook preview)
    ├── preview.ts                          # Decorator chain + global types
    └── preview.css                         # Density remapping for Storybook
```
