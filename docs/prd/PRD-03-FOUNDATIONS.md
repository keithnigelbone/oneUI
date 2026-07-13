# One UI Studio — Foundations PRD

> **Version**: 1.0.0  
> **Last Updated**: January 2026  
> **Status**: Draft  
> **Parent**: [Platform Overview PRD](./PRD-01-PLATFORM-OVERVIEW.md)

---

## Overview

The Foundations section provides visual configuration tools for all design token categories. Each foundation follows scientific principles (DIN 1450 for typography, OkLCH for color) and outputs mathematically precise, accessible token values. Changes here cascade throughout the entire design system.

### User Stories

- As a **Design System Lead**, I want to configure typography scales so they're scientifically optimized for readability
- As a **Designer**, I want to adjust brand colors while maintaining accessibility compliance
- As a **Developer**, I want to understand the mathematical relationships between tokens
- As an **Accessibility Lead**, I want to verify all color combinations meet WCAG AA

---

## Navigation Structure

```
Foundations
├── Color           ← Palette generation, surfaces, accessibility
├── Typography      ← Type scale, DIN 1450 calculations
├── Spacing         ← Spacing scale, density modes
├── Shapes          ← Corner radius, interactive vs non-interactive
├── Elevation       ← Shadow formula, surface levels
└── Motion          ← Timing, easing, duration tokens
```

---

## F1: Color Foundation

### F1.1 Color Generator

**Purpose**: Generate 25-step OkLCH color scales from base hue/chroma.

```
┌─────────────────────────────────────────────────────────────────┐
│  Color Scale Generator                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Base Color Configuration                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Hue          [=======●==========]  340°                │   │
│  │  Chroma       [====●==============]  0.18               │   │
│  │  Base Step    [===========●=======]  500                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Preview: oklch(50% 0.18 340)  [████████████████████]          │
│                                                                 │
│  ┌─ Generated Scale ────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  0    [██] oklch(99% 0.02 340)                           │  │
│  │  50   [██] oklch(97% 0.04 340)                           │  │
│  │  100  [██] oklch(94% 0.06 340)                           │  │
│  │  200  [██] oklch(88% 0.09 340)                           │  │
│  │  300  [██] oklch(78% 0.12 340)                           │  │
│  │  400  [██] oklch(65% 0.15 340)                           │  │
│  │  500  [██] oklch(50% 0.18 340)  ← Base                   │  │
│  │  600  [██] oklch(42% 0.16 340)                           │  │
│  │  700  [██] oklch(35% 0.14 340)                           │  │
│  │  800  [██] oklch(28% 0.12 340)                           │  │
│  │  900  [██] oklch(22% 0.10 340)                           │  │
│  │  1000 [██] oklch(18% 0.08 340)                           │  │
│  │  1100 [██] oklch(14% 0.06 340)                           │  │
│  │  1200 [██] oklch(10% 0.04 340)                           │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ⚠️ Base Chroma Lock: No step exceeds base chroma (0.18)       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Scientific Formula**:
```typescript
interface ColorScaleConfig {
  hue: number;           // 0-360
  chroma: number;        // 0-0.4 (base chroma lock)
  baseStep: number;      // 500 default
  steps: number[];       // [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200]
}

// Lightness curve (perceptually uniform)
function getLightness(step: number): number {
  // Step 0 = 99%, Step 1200 = 10%
  return 99 - (step / 1200) * 89;
}

// Chroma curve (respects base chroma lock)
function getChroma(step: number, baseChroma: number, baseStep: number): number {
  // Peak at base step, never exceeds baseChroma
  const distance = Math.abs(step - baseStep);
  const falloff = distance / 600;  // 600 steps to zero
  return baseChroma * Math.max(0, 1 - falloff * 0.8);
}
```

### F1.2 Surface Tokens

**Purpose**: Map color steps to semantic surface tokens.

```
┌─────────────────────────────────────────────────────────────────┐
│  Surface Tokens                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Token            │ Light Mode    │ Dark Mode     │ Dim Mode   │
│  ─────────────────┼───────────────┼───────────────┼────────────│
│  Surface-Default  │ Neutral 2500  │ Neutral 200   │ Primary 200│
│  Surface-Subtle   │ Primary 50    │ Primary 1100  │ Primary 300│
│  Surface-Bold     │ Primary 500   │ Primary 600   │ Primary 500│
│  Surface-Ghost    │ transparent   │ transparent   │ transparent│
│                                                                 │
│  [Edit Mappings]                                                │
└─────────────────────────────────────────────────────────────────┘
```

### F1.3 Text Tokens

```
┌─────────────────────────────────────────────────────────────────┐
│  Text Tokens                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Token            │ Light Mode    │ Dark Mode     │ Contrast   │
│  ─────────────────┼───────────────┼───────────────┼────────────│
│  Text-High        │ Neutral 200   │ Neutral 2400  │ 12.5:1 ✓  │
│  Text-Medium      │ Neutral 600   │ Neutral 2000  │ 7.2:1 ✓   │
│  Text-Low         │ Neutral 1000  │ Neutral 1500  │ 4.5:1 ✓   │
│  Text-OnBold-High │ Neutral 2500  │ Neutral 2500  │ 8.1:1 ✓   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F1.4 Accessibility Checker

**Purpose**: Real-time WCAG contrast validation.

```
┌─────────────────────────────────────────────────────────────────┐
│  Accessibility Matrix                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Background: Surface-Default (Light)                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Text Token     │ Ratio │ AA Normal │ AA Large │ AAA     │  │
│  │  ────────────────┼───────┼───────────┼──────────┼─────────│  │
│  │  Text-High      │ 12.5  │ ✓ Pass    │ ✓ Pass   │ ✓ Pass  │  │
│  │  Text-Medium    │ 7.2   │ ✓ Pass    │ ✓ Pass   │ ✓ Pass  │  │
│  │  Text-Low       │ 4.5   │ ✓ Pass    │ ✓ Pass   │ ✗ Fail  │  │
│  │  Primary-500    │ 3.8   │ ✗ Fail    │ ✓ Pass   │ ✗ Fail  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Check All Combinations]  [Export Report]                      │
└─────────────────────────────────────────────────────────────────┘
```

### F1.5 Status Colors

**Purpose**: Configure universal status colors (non-themeable).

```
┌─────────────────────────────────────────────────────────────────┐
│  Status Colors (Universal)                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⚠️ Status colors are not brand-themeable                       │
│                                                                 │
│  Success    [████] oklch(55% 0.18 145)   Hue: 145° (Green)     │
│  Warning    [████] oklch(70% 0.18 85)    Hue: 85° (Amber)      │
│  Error      [████] oklch(55% 0.22 25)    Hue: 25° (Red)        │
│  Info       [████] oklch(55% 0.15 250)   Hue: 250° (Blue)      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## F2: Typography Foundation

### F2.1 DIN 1450 Calculator

**Purpose**: Calculate optimal base font size using scientific viewing distance formula.

```
┌─────────────────────────────────────────────────────────────────┐
│  Typography Scale Calculator (DIN 1450)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Platform Presets                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Mobile ●]  [Tablet]  [Desktop]  [TV]  [Custom]        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Parameters                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Viewing Distance    [========●====]  30 cm             │   │
│  │  Screen PPI          [==●==========]  458               │   │
│  │  Pixel Density       [=====●=======]  3x                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Formula:                                                       │
│  baseSize = tan(0.00582°) × 30cm × 458ppi / (2.54 × 0.53 × 3)  │
│                                                                 │
│  Calculated Base Size: 16px                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F2.2 Type Scale

**Purpose**: Configure modular scale for all typography styles.

```
┌─────────────────────────────────────────────────────────────────┐
│  Type Scale                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Scale Factor                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Compact: 1.10   Default: 1.125   Open: 1.15            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─ Scale Preview (Default Density) ────────────────────────┐  │
│  │                                                           │  │
│  │  Display L   ████████████████████████████████   66px     │  │
│  │  Display M   ██████████████████████████         55px     │  │
│  │  Display S   ████████████████████               47px     │  │
│  │  ─────────────────────────────────────────────────────   │  │
│  │  Headline L  ███████████████████                39px     │  │
│  │  Headline M  ██████████████                     28px     │  │
│  │  ─────────────────────────────────────────────────────   │  │
│  │  Title L     █████████████                      24px     │  │
│  │  Title M     ███████████                        20px     │  │
│  │  Title S     █████████                          17px     │  │
│  │  ─────────────────────────────────────────────────────   │  │
│  │  Label L     ███████████                        20px     │  │
│  │  Label M     █████████                          16px     │  │
│  │  Label S     ███████                            14px     │  │
│  │  ─────────────────────────────────────────────────────   │  │
│  │  Body L      ███████████                        20px     │  │
│  │  Body M      █████████                          16px     │  │
│  │  Body S      ███████                            14px     │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F2.3 Typography Style Editor

```
┌─────────────────────────────────────────────────────────────────┐
│  Edit Style: Headline L                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Font Family      JioType Variable                              │
│  Font Size        39px (f4 on scale)                            │
│  Font Weight      [===●===] 900 (Black)                         │
│  Line Height      [●======] 100%                                │
│  Letter Spacing   [==●====] 0%                                  │
│  Optical Size     [===●===] 20                                  │
│                                                                 │
│  Preview:                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  The quick brown fox jumps over                         │   │
│  │  the lazy dog                                            │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Reset to Default]                                    [Save]   │
└─────────────────────────────────────────────────────────────────┘
```

### F2.4 Weight Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│  Weight System                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Semantic Weight  │ Numeric │ Usage                            │
│  ─────────────────┼─────────┼────────────────────────────────── │
│  Low              │ 400     │ Body text, descriptions          │
│  Medium           │ 500     │ Labels, interactive elements     │
│  High             │ 700     │ Emphasis, titles                 │
│  Black            │ 900     │ Display, headlines               │
│                                                                 │
│  ⚠️ Only these 4 weights are permitted in the system           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## F3: Spacing Foundation

### F3.1 Spacing Scale

**Purpose**: Configure 13-step spacing scale with responsive interpolation.

```
┌─────────────────────────────────────────────────────────────────┐
│  Spacing Scale                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Density Mode: [Compact] [Default ●] [Open]                     │
│                                                                 │
│  ┌─ Scale ──────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  5XS  [█]                              0px                │  │
│  │  4XS  [██]                             2px                │  │
│  │  3XS  [███]                            4px                │  │
│  │  2XS  [████]                           6px                │  │
│  │  XS   [█████]                          8px                │  │
│  │  S    [██████]                         12px               │  │
│  │  M    [████████]                       16px  ← Base       │  │
│  │  L    [██████████]                     20px               │  │
│  │  XL   [████████████]                   26px               │  │
│  │  2XL  [████████████████]               32px               │  │
│  │  3XL  [████████████████████]           41px               │  │
│  │  4XL  [████████████████████████████]   58px               │  │
│  │  5XL  [████████████████████████████████████] 66px         │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F3.2 Responsive Interpolation

```
┌─────────────────────────────────────────────────────────────────┐
│  Responsive Spacing                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Viewport Range                                                 │
│  Min: 360px  ════════════════════════════════  Max: 1920px     │
│                                                                 │
│  Example: Spacing-5                                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  45px ─────────────────────────────────●                 │  │
│  │       ╱                                                   │  │
│  │      ╱                                                    │  │
│  │  26px ●                                                   │  │
│  │       360px                        1920px                 │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  CSS Output:                                                    │
│  clamp(26px, calc(26px + (45 - 26) * ((100vw - 360px) /        │
│  (1920 - 360))), 45px)                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## F4: Shapes Foundation

### F4.1 Shape Scale

```
┌─────────────────────────────────────────────────────────────────┐
│  Shape Scale                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⚠️ CRITICAL: Interactive elements ALWAYS use Pill (999px)      │
│                                                                 │
│  ┌─ Interactive Shapes ─────────────────────────────────────┐  │
│  │                                                           │  │
│  │  Shape-Pill   [████████████████████████████]   999px      │  │
│  │               Used by: Button, Input, Chip, Toggle        │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Non-Interactive Shapes ─────────────────────────────────┐  │
│  │                                                           │  │
│  │  Shape-0-5    [█]                          2px            │  │
│  │  Shape-1      [██]                         4px            │  │
│  │  Shape-2      [████]                       8px            │  │
│  │  Shape-3      [██████]                     12px           │  │
│  │  Shape-4      [████████]                   16px           │  │
│  │  Shape-5      [██████████]                 20px           │  │
│  │  Shape-6      [████████████]               24px           │  │
│  │  Shape-8      [██████████████]             32px           │  │
│  │  Shape-10     [████████████████]           40px           │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F4.2 Shape Usage Guide

```
┌─────────────────────────────────────────────────────────────────┐
│  Shape Usage Guidelines                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Element Type      │ Required Shape │ Rationale                │
│  ──────────────────┼────────────────┼────────────────────────── │
│  Button            │ Pill (999px)   │ Signals clickability     │
│  Input             │ Pill (999px)   │ Signals interactivity    │
│  Chip              │ Pill (999px)   │ Signals selectability    │
│  Toggle            │ Pill (999px)   │ Signals togglability     │
│  Link Button       │ Pill (999px)   │ Signals clickability     │
│  ──────────────────┼────────────────┼────────────────────────── │
│  Card              │ M-XL (8-16px)  │ Content container        │
│  Badge             │ S-M (4-8px)    │ Status indicator         │
│  Image             │ S-L (4-12px)   │ Media container          │
│  Container         │ M-2XL (8-20px) │ Layout structure         │
│  Modal             │ L-XL (12-16px) │ Overlay container        │
│                                                                 │
│  ⚠️ Violation: Using non-Pill shapes on interactive elements   │
│     breaks the visual language of interactivity.               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## F5: Elevation Foundation

### F5.1 Elevation Levels

```
┌─────────────────────────────────────────────────────────────────┐
│  Elevation System                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⚠️ Most components use Level 0 (no elevation)                  │
│                                                                 │
│  ┌─ Elevation Levels ───────────────────────────────────────┐  │
│  │                                                           │  │
│  │  Level 0   ░░░░░░░░░░░░░░░░   No shadow (default)        │  │
│  │  Level 1   ▒░░░░░░░░░░░░░░░   Card hover, subtle lift    │  │
│  │  Level 2   ▓▒░░░░░░░░░░░░░░   Elevated cards             │  │
│  │  Level 3   █▓▒░░░░░░░░░░░░░   Dropdowns, popovers        │  │
│  │  Level 4   ██▓▒░░░░░░░░░░░░   Modals, dialogs            │  │
│  │  Level 5   ███▓▒░░░░░░░░░░░   Toast, notifications       │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F5.2 Shadow Formula

```
┌─────────────────────────────────────────────────────────────────┐
│  Two-Shadow Formula                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Each elevation level uses two shadows:                         │
│                                                                 │
│  Key Light (Primary)                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Y-offset: f(level) × 0.5                                │   │
│  │  Blur:     f(level)                                      │   │
│  │  Color:    Step 200 of appearance color                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Soft Light (Ambient)                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Y-offset: f(level) × 0.25                               │   │
│  │  Blur:     f(level + 6)                                  │   │
│  │  Color:    Step 200 of appearance color                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Opacity by Surface:                                            │
│  • Low surface (light bg):    8%                               │
│  • Medium surface:            12%                              │
│  • High surface (dark bg):    16%                              │
│                                                                 │
│  Example (Level 2, Low Surface):                                │
│  box-shadow:                                                    │
│    0 3px 6px rgba(0,0,0,0.08),   /* Key light */               │
│    0 1.5px 12px rgba(0,0,0,0.08); /* Soft light */             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F5.3 Dark Mode Elevation

```
┌─────────────────────────────────────────────────────────────────┐
│  Dark Mode Adjustments                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  In dark mode, shadows are less visible. Add:                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  White Stroke:  1px solid rgba(255, 255, 255, 0.1)      │   │
│  │  Shadow Color:  Use step 100 instead of 200             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Preview:                                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  [Card with white stroke on dark background]            │    │
│  │   ○───────────────────────────────────────────────○     │    │
│  │   │                                               │     │    │
│  │   │         Elevated Card (Dark Mode)             │     │    │
│  │   │                                               │     │    │
│  │   ○───────────────────────────────────────────────○     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## F6: Motion Foundation

### F6.1 Duration Tokens

```
┌─────────────────────────────────────────────────────────────────┐
│  Motion Durations                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ Discreet (Small, focused animations) ───────────────────┐  │
│  │                                                           │  │
│  │  Discreet-Micro     50ms    Button press, icon swap      │  │
│  │  Discreet-Short    100ms    Hover states, focus          │  │
│  │  Discreet-Medium   150ms    Checkbox, toggle             │  │
│  │  Discreet-Long     200ms    Tooltip appear               │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Expressive (Large, dramatic animations) ────────────────┐  │
│  │                                                           │  │
│  │  Expressive-Short  250ms    Dropdown open                │  │
│  │  Expressive-Medium 350ms    Modal enter                  │  │
│  │  Expressive-Long   500ms    Page transition              │  │
│  │  Expressive-XLong  700ms    Complex choreography         │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F6.2 Easing Curves

```
┌─────────────────────────────────────────────────────────────────┐
│  Easing Curves                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Standard (most common)                                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ╭─────────────╮                                        │    │
│  │  │             ╲                                        │    │
│  │  │              ╲                                       │    │
│  │  ╱               ╰──────────────────                    │    │
│  └────────────────────────────────────────────────────────┘    │
│  cubic-bezier(0.4, 0, 0.2, 1)                                  │
│                                                                 │
│  Enter (elements appearing)                                     │
│  cubic-bezier(0, 0, 0.2, 1) — Decelerating                     │
│                                                                 │
│  Exit (elements leaving)                                        │
│  cubic-bezier(0.4, 0, 1, 1) — Accelerating                     │
│                                                                 │
│  Emphasized (expressive moments)                                │
│  cubic-bezier(0.4, 0, 0, 1) — Dramatic deceleration            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F6.3 Motion Presets

```
┌─────────────────────────────────────────────────────────────────┐
│  Animation Presets                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Preset          │ Duration │ Easing    │ Preview              │
│  ────────────────┼──────────┼───────────┼──────────────────────│
│  Fade In         │ 150ms    │ Enter     │ [▶ Play]             │
│  Fade Out        │ 100ms    │ Exit      │ [▶ Play]             │
│  Scale Up        │ 200ms    │ Standard  │ [▶ Play]             │
│  Scale Down      │ 150ms    │ Exit      │ [▶ Play]             │
│  Slide In        │ 250ms    │ Enter     │ [▶ Play]             │
│  Slide Out       │ 200ms    │ Exit      │ [▶ Play]             │
│  Modal Enter     │ 350ms    │ Emphasized│ [▶ Play]             │
│  Modal Exit      │ 250ms    │ Exit      │ [▶ Play]             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Convex Schema (Foundations)

```typescript
// Foundation configurations
foundations: defineTable({
  brandId: v.id('brands'),
  type: v.union(
    v.literal('color'),
    v.literal('typography'),
    v.literal('spacing'),
    v.literal('shape'),
    v.literal('elevation'),
    v.literal('motion')
  ),
  config: v.any(),  // Type-specific configuration
  version: v.number(),
  updatedAt: v.number(),
  updatedBy: v.id('users'),
}),

// Color scale configurations
colorScales: defineTable({
  brandId: v.id('brands'),
  name: v.string(),           // "primary", "secondary", "neutral"
  hue: v.number(),
  chroma: v.number(),
  baseStep: v.number(),
  generatedSteps: v.array(v.object({
    step: v.number(),
    lightness: v.number(),
    chroma: v.number(),
    oklch: v.string(),
  })),
}),

// Typography configurations
typographyConfig: defineTable({
  brandId: v.id('brands'),
  platform: v.string(),
  viewingDistance: v.number(),
  ppi: v.number(),
  density: v.number(),
  calculatedBaseSize: v.number(),
  scaleFactor: v.number(),
}),
```

---

## Success Criteria

1. **Color generation**: 25-step scale in < 100ms
2. **Accessibility**: 100% of color pairs validated
3. **Typography calculation**: DIN 1450 formula accurate to 0.5px
4. **Real-time preview**: Changes reflect in < 50ms
5. **Export accuracy**: Generated CSS matches preview exactly

---

## Open Questions

1. Should we allow custom scale factors outside the predefined range?
2. How do we handle brand-specific typography exceptions?
3. What's the migration path for existing hardcoded values?
