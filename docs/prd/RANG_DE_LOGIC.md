# Rang De - Color Scale Logic Documentation

A comprehensive guide to the color scale generation system, surface stacking logic, and WCAG-compliant contrast algorithms.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [The Step System](#the-step-system)
4. [Scale Types](#scale-types)
5. [Surface Stacking Logic](#surface-stacking-logic)
6. [WCAG Compliance](#wcag-compliance)
7. [Color Algorithms](#color-algorithms)
8. [State Management](#state-management)
9. [Data Flow](#data-flow)
10. [Implementation Reference](#implementation-reference)

---

## Overview

Rang De is a WCAG 2.1-compliant color scale generator that creates accessible design system palettes. It generates **8 scale types** across **24 color steps** (200-2500) while ensuring accessibility standards.

### Key Features
- 24-step color palette system (200 to 2500)
- 8 automatically generated scale types per step
- WCAG 2.1 AA/AAA compliance checking
- Alpha blending for precise contrast targets
- Surface stacking visualization for UI state management

---

## Core Concepts

### Terminology

| Term | Definition |
|------|------------|
| **Surface** | The background color on which other colors are placed. Each step (200-2500) can be used as a surface. |
| **Contrasting Color (CC)** | The color used for text/elements on a surface. Automatically determined based on surface lightness. |
| **Dark CC** | When surface is light (contrast vs white < 4.5:1), uses dark colors (toward step 200) for contrast. |
| **Light CC** | When surface is dark (contrast vs white >= 4.5:1), uses light colors (toward step 2500) for contrast. |
| **Base/Primary Step** | User-selected step (default: 600) used as starting point for Bold calculations. |
| **Step** | A position in the color scale (200-2500). Step 200 is darkest, step 2500 is lightest. |
| **Alpha** | Transparency value (0-1). Used to blend contrasting color with surface to achieve specific contrast ratios. |
| **Truncation (Floor)** | The rounding method used for contrast checks. Ratios are always cut off at 2 decimal places (e.g., 4.499 becomes 4.49) to ensure strict compliance. |

### Light vs Dark Surface Detection

```typescript
// A surface is considered "light" if it has LOW contrast against white
function isLightSurface(surfaceHex: string): boolean {
  const contrastVsWhite = getContrastRatio(surfaceHex, "#ffffff");
  return contrastVsWhite < 4.5;
}

// Determines which direction to go for contrasting colors
function getContrastDirection(surfaceHex: string): 'dark' | 'light' {
  return isLightSurface(surfaceHex) ? 'dark' : 'light';
}
```

- **Light Surface** (contrast vs white < 4.5:1) → Uses **Dark CC** (step 200)
- **Dark Surface** (contrast vs white >= 4.5:1) → Uses **Light CC** (step 2500)

---

## The Step System

### Step Values

The palette uses 24 discrete steps ranging from 200 (darkest) to 2500 (lightest):

```typescript
const STEPS = [
  200, 300, 400, 500, 600, 700, 800, 900, 1000,
  1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000,
  2100, 2200, 2300, 2400, 2500
] as const;
```

### Step Navigation

```typescript
// Get the index of a step in the array
function getStepIndex(step: Step): number {
  return STEPS.indexOf(step);
}

// Get step from index (with bounds checking)
function getStepFromIndex(index: number): Step | undefined {
  return STEPS[index];
}
```

---

## Scale Types

For each surface step, 8 scales are generated:

### 1. Surface
**Purpose:** The base background color
**Logic:**
- The palette color at the current step
- All other scales are calculated relative to this

```typescript
surface: createScaleResult(surfaceHex, surfaceHex, undefined, surfaceStep)
```

---

### 2. High
**Target:** Maximum contrast
**Logic:**
- Uses the contrasting color at 100% opacity (no transparency)
- Light surface → uses step 200 (darkest)
- Dark surface → uses step 2500 (lightest)

```typescript
function generateHigh(surfaceHex, palette, contrastDir): ScaleResult {
  // Step 200 = darkest, Step 2500 = lightest
  const targetStep = contrastDir === 'dark' ? 200 : 2500;
  const hex = palette[targetStep];
  return createScaleResult(hex, surfaceHex, undefined, targetStep);
}
```

**Examples:**
- Surface 2400 (light) → High = step 200
- Surface 200 (dark) → High = step 2500

---

### 3. Medium
**Target:** Between High and Low contrast
**Logic:**
- Uses same contrasting color as High
- Alpha = midpoint between 1.0 (High) and Low's alpha
- Formula: `alpha = round((1.0 + lowAlpha) / 2)`

```typescript
function generateMedium(surfaceHex, palette, contrastDir, lowAlpha): ScaleResult {
  const targetStep = contrastDir === 'dark' ? 200 : 2500;
  const ccHex = palette[targetStep];

  // Midpoint between 100% and Low's alpha
  const alpha = Math.round(((1.0 + lowAlpha) / 2) * 100) / 100;
  const blendedHex = blendWithAlpha(ccHex, surfaceHex, alpha);

  return createScaleResult(hexToRgba(ccHex, alpha), surfaceHex, alpha, targetStep, blendedHex);
}
```

**Examples:**
- Surface 2400, Low alpha = 0.56 → Medium = step 200 at 78% opacity
- Surface 200, Low alpha = 0.55 → Medium = step 2500 at 77% opacity

---

### 4. Low
**Target:** >= 4.5:1 contrast (WCAG AA for normal text)
**Logic:**
- Uses the High contrasting color (step 200 or 2500)
- Finds the **lowest** alpha that achieves >= 4.5:1 contrast
- Linear search from 1% to 100%
- If full opacity contrast < 4.5:1, searches for a palette step instead

```typescript
function generateLow(surfaceHex, palette, contrastDir): ScaleResult {
  const targetStep = contrastDir === 'dark' ? 200 : 2500;
  const ccHex = palette[targetStep];
  const fullContrast = getContrastRatio(ccHex, surfaceHex);

  // If full contrast < 4.5, find a better step
  if (fullContrast < 4.5) {
    for (const step of STEPS) {
      const hex = palette[step];
      const contrast = getContrastRatio(hex, surfaceHex);
      if (contrast >= 4.5) {
        return createScaleResult(hex, surfaceHex, 1, step, hex);
      }
    }
  }

  // Find minimum alpha for >= 4.5:1
  const alpha = findAlphaForContrast(ccHex, surfaceHex, 4.5, true);
  const blendedHex = blendWithAlpha(ccHex, surfaceHex, alpha);

  return createScaleResult(hexToRgba(ccHex, alpha), surfaceHex, alpha, targetStep, blendedHex);
}
```

**Examples:**
- Surface 2400 → Low = step 200 at 56% opacity (4.5:1 contrast)
- Surface 200 → Low = step 2500 at 55% opacity (4.5:1 contrast)

---

### 5. Bold
**Target:** >= 3.0:1 contrast (WCAG AA for large text/graphics)
**Logic:**
- Starts from user-selected base step (default: 600)
- Walks toward contrasting color until contrast >= 3.0:1
- For dark backgrounds, applies step offset based on base value

```typescript
// Step offset for dark backgrounds
function getBoldStepOffset(baseStep: Step): number {
  if (baseStep >= 1900) return 0;
  if (baseStep >= 1300) return 1;
  if (baseStep >= 700) return 2;
  return 3;
}

function generateBold(surfaceStep, surfaceHex, palette, contrastDir, primaryStep): ScaleResult {
  const ccStep = contrastDir === 'dark' ? 200 : 2500;
  let currentIndex = getStepIndex(primaryStep);

  // Apply offset for dark backgrounds (light CC)
  if (contrastDir === 'light') {
    const offset = getBoldStepOffset(primaryStep);
    currentIndex = Math.min(STEPS.length - 1, currentIndex + offset);
  }

  // Direction: toward CC
  const direction = contrastDir === 'dark' ? -1 : 1;

  // Walk until contrast >= 3.0:1
  while (currentIndex >= 0 && currentIndex < STEPS.length) {
    const step = getStepFromIndex(currentIndex);
    const hex = palette[step];
    const contrast = getContrastRatio(hex, surfaceHex);

    if (contrast >= 3.0) {
      return createScaleResult(hex, surfaceHex, undefined, step);
    }
    currentIndex += direction;
  }

  // Fallback to CC
  return createScaleResult(palette[ccStep], surfaceHex, undefined, ccStep);
}
```

**Examples:**
- Base 600, Surface 2400 → 600 passes (3.2:1) → Bold = 600
- Base 600, Surface 200 → walks to 1000 (3.51:1) → Bold = 1000

---

### 6. Bold A11Y
**Target:** >= 4.5:1 contrast (WCAG AA for normal text)
**Logic:**
- Same as Bold, but requires 4.5:1 instead of 3.0:1
- Ensures WCAG AA compliance for all text sizes

```typescript
function generateBoldA11Y(surfaceStep, surfaceHex, palette, contrastDir, primaryStep): ScaleResult {
  // Same logic as Bold but with 4.5:1 threshold
  // ...
  while (currentIndex >= 0 && currentIndex < STEPS.length) {
    const contrast = getContrastRatio(hex, surfaceHex);
    if (contrast >= 4.5) {
      return createScaleResult(hex, surfaceHex, undefined, step);
    }
    currentIndex += direction;
  }
}
```

**Examples:**
- Base 600, Surface 2400 → walks to step 200 (4.5:1)
- Base 600, Surface 200 → walks to step 1200 (4.79:1)

---

### 7. Heavy
**Target:** High contrast emphasis
**Logic:**
- **Dark CC (light surface):** Midpoint between Bold step and step 200, capped at 800
- **Light CC (dark surface):** Same as BoldA11Y, or step 2500 if >3 steps away

```typescript
function generateHeavy(surfaceStep, surfaceHex, palette, contrastDir, boldResult, boldA11YResult, primaryStep): ScaleResult {
  if (contrastDir === 'dark') {
    // Dark CC: Average of Bold and 200, capped at 800
    const boldStep = boldResult.sourceStep;
    const rawMid = (boldStep + 200) / 2;
    const targetStepValue = Math.ceil(rawMid / 100) * 100;

    let bestStep = /* find closest valid step */;
    if (bestStep > 800) bestStep = 800; // Cap at 800

    return createScaleResult(palette[bestStep], surfaceHex, undefined, bestStep);
  } else {
    // Light CC: Same as BoldA11Y, or 2500 if >3 steps away
    const boldA11YStep = boldA11YResult.sourceStep;
    const offset = getBoldStepOffset(primaryStep);
    const newBaseIndex = getStepIndex(primaryStep) + offset;
    const distance = Math.abs(getStepIndex(boldA11YStep) - newBaseIndex);

    if (distance > 3) {
      return createScaleResult(palette[2500], surfaceHex, undefined, 2500);
    }
    return { ...boldA11YResult };
  }
}
```

**Examples:**
- Surface 2400, Bold = 600 → Heavy = (600 + 200) / 2 = 400
- Surface 200, BoldA11Y = 1200 → Heavy = 1200

---

### 8. Minimal
**Target:** Low contrast (decorative only)
**Logic:**
- Moves **away** from the contrasting color by 2 steps
- Dark CC (High = 200): Subtract 200 from surface
- Light CC (High = 2500): Add 200 to surface

```typescript
function generateMinimal(surfaceStep, surfaceHex, palette, contrastDir): ScaleResult {
  const surfaceIndex = getStepIndex(surfaceStep);

  // Move away from contrasting color
  let targetIndex;
  if (contrastDir === 'dark') {
    // Dark CC → subtract 2 indices (move lighter)
    targetIndex = surfaceIndex - 2;
  } else {
    // Light CC → add 2 indices (move darker)
    targetIndex = surfaceIndex + 2;
  }

  const clampedIndex = Math.max(0, Math.min(STEPS.length - 1, targetIndex));
  const targetStep = getStepFromIndex(clampedIndex);

  return createScaleResult(palette[targetStep], surfaceHex, undefined, targetStep);
}
```

**Examples:**
- Surface 2400 (CC = 200) → Minimal = 2200 (2400 - 200)
- Surface 200 (CC = 2500) → Minimal = 400 (200 + 200)

---

## Surface Stacking Logic

Surface stacking defines how UI elements layer on top of each other with different visual states (idle, hover, pressed, focus).

### Surface Columns

For **Light Mode** (background step 2500):
| Column | Surface Step |
|--------|-------------|
| Default | 2500 |
| Minimal | 2400 |
| Subtle | 2300 |
| Bold | primaryStep |
| Elevated | 2500 (with shadow) |

For **Dark Mode** (background step 200):
| Column | Surface Step |
|--------|-------------|
| Default | 200 |
| Minimal | 300 |
| Subtle | 400 |
| Bold | adjustedPrimaryStep |
| Elevated | 300 (with shadow) |

### Button State Types

Each surface has 4 button types with different visual emphasis:

#### 1. Ghost Button
```typescript
// Ghost: Starts at surface, moves toward contrast direction
ghostIdle = surfaceStep;
ghostHover = getStep(getIndex(ghostIdle) + dir);
ghostPressed = getStep(getIndex(ghostIdle) + (dir * 2));
```

#### 2. Minimal Button
```typescript
// Minimal: One step from surface
minimalIdle = getStep(getIndex(surfaceStep) + dir);
minimalHover = getStep(getIndex(minimalIdle) + dir);
minimalPressed = getStep(getIndex(minimalIdle) + (dir * 2));
```

#### 3. Subtle Button
```typescript
// Subtle: Two steps from surface
subtleIdle = getStep(getIndex(surfaceStep) + (dir * 2));
subtleHover = getStep(getIndex(subtleIdle) + dir);
subtlePressed = getStep(getIndex(subtleIdle) + (dir * 2));
```

#### 4. Bold Button
```typescript
// Bold: Uses adjusted base step with contrast check
boldIdle = getBoldStepWithContrast(surfaceStep, adjustedBase);
boldHover = getStep(getIndex(boldIdle) - 1);
boldPressed = getStep(getIndex(boldHover) - 1);
```

### Special Logic for Bold Surface Column

When the surface itself is the Bold/primary color:

```typescript
if (col.name === "Bold") {
  // Determine contrast direction dynamically
  const contrast2500 = getContrastRatio(palette[2500], surfaceHex);
  const contrast200 = getContrastRatio(palette[200], surfaceHex);
  const contrastDir = contrast2500 > contrast200 ? 1 : -1;

  ghostIdle = surfaceStep;
  ghostHover = getStep(getIndex(ghostIdle) + contrastDir);
  ghostPressed = getStep(getIndex(ghostHover) + contrastDir);

  // Bold button: large shift based on surface position
  // When bold is 100-1100: +7 steps
  // When bold is 1200-2500: -7 steps
  const boldShift = surfaceStep <= 1100 ? 7 : -7;
  boldIdle = getStep(getIndex(surfaceStep) + boldShift);
  boldHover = getStep(getIndex(boldIdle) - 1);
  boldPressed = getStep(getIndex(boldHover) - 1);
}
```

### Focus State

Focus states use the Bold color as an outline:
```typescript
focusBorderHex = palette[boldIdle];
// Applied as: outline: 2px solid ${focusBorderHex}; outlineOffset: 2px;
```

---

## WCAG Compliance

### Contrast Requirements

| Content Type | Level | Ratio | Description |
|-------------|-------|-------|-------------|
| Normal Text | AA | >= 4.5:1 | Text < 18pt (or < 14pt bold) |
| Normal Text | AAA | >= 7.0:1 | Enhanced contrast |
| Large Text | AA | >= 3.0:1 | Text >= 18pt (or >= 14pt bold) |
| Large Text | AAA | >= 4.5:1 | Enhanced for large text |
| Graphics/UI | AA | >= 3.0:1 | Icons, borders, form controls |

### Scale to WCAG Mapping

| Scale | Minimum Contrast | Use Case |
|-------|-----------------|----------|
| High | Maximum available | Primary text, critical info |
| Medium | Variable | Secondary text |
| Low | 4.5:1 | Body text, labels |
| Bold | 3.0:1 | Large text, UI components |
| Bold A11Y | 4.5:1 | Any text size |
| Heavy | High | Strong emphasis |
| Minimal | Low | Decorative elements only |

---

## Color Algorithms

### Contrast Ratio Calculation (WCAG 2.1)

```typescript
function getContrastRatio(color1: string, color2: string): number {
  const c1 = colord(color1).toRgb();
  const c2 = colord(color2).toRgb();

  const l1 = getRelativeLuminance(c1.r, c1.g, c1.b);
  const l2 = getRelativeLuminance(c2.r, c2.g, c2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  // WCAG formula with TRUNCATION (not rounding)
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.floor(ratio * 100) / 100; // 4.499 → 4.49
}
```

### Relative Luminance

```typescript
function sRgbToLinearRgb(value: number): number {
  const normalized = value / 255;
  if (normalized <= 0.03928) {
    return normalized / 12.92;
  }
  return Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const rLinear = sRgbToLinearRgb(r);
  const gLinear = sRgbToLinearRgb(g);
  const bLinear = sRgbToLinearRgb(b);
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}
```

### Alpha Blending

```typescript
// True alpha compositing: result = fg * alpha + bg * (1 - alpha)
function blendWithAlpha(fgHex: string, bgHex: string, alpha: number): string {
  const fg = colord(fgHex).toRgb();
  const bg = colord(bgHex).toRgb();

  const r = Math.round(fg.r * alpha + bg.r * (1 - alpha));
  const g = Math.round(fg.g * alpha + bg.g * (1 - alpha));
  const b = Math.round(fg.b * alpha + bg.b * (1 - alpha));

  return colord({ r, g, b }).toHex();
}
```

### Finding Alpha for Target Contrast

```typescript
function findAlphaForContrast(fgHex: string, bgHex: string, targetContrast: number): number {
  // Linear search from 1% to 100%
  for (let alpha = 0.01; alpha <= 1.00; alpha += 0.01) {
    const cleanAlpha = Math.round(alpha * 100) / 100;
    const blended = blendWithAlpha(fgHex, bgHex, cleanAlpha);
    const contrast = getContrastRatio(blended, bgHex);

    if (contrast >= targetContrast) {
      return cleanAlpha;
    }
  }
  return 1;
}
```

### OKLCH to Hex Conversion

```typescript
function oklchToHex(oklchString: string): string {
  // Parse oklch(L% C H)
  const match = oklchString.match(/oklch\(([^)]+)\)/);
  const parts = match[1].split(/\s+/);

  const L = parseFloat(parts[0].replace('%', '')) / 100;
  const C = parseFloat(parts[1]);
  const H = parseFloat(parts[2]) * Math.PI / 180; // to radians

  // OKLCH → OKLab
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);

  // OKLab → Linear RGB (via matrix multiplication)
  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.2914855480 * b;

  // Cube the intermediate values
  const l_3 = l * l * l;
  const m_3 = m * m * m;
  const s_3 = s * s * s;

  // Linear RGB
  const r_linear = +4.0767416621 * l_3 - 3.3077115913 * m_3 + 0.2309699292 * s_3;
  const g_linear = -1.2684380046 * l_3 + 2.6097574011 * m_3 - 0.3413193965 * s_3;
  const b_linear = -0.0041960863 * l_3 - 0.7034186147 * m_3 + 1.7076147010 * s_3;

  // Apply gamma correction and convert to hex
  // ...
}
```

---

## State Management

### Zustand Store Structure

```typescript
interface PaletteState {
  // Data
  palettes: Palette[];
  activePaletteId: string | null;
  generatedScales: GeneratedScalesMap | null;
  viewMode: 'palette' | 'how-it-works' | 'surface-stacking';
  isFullscreen: boolean;

  // Actions
  createPalette: (name: string) => void;
  deletePalette: (id: string) => void;
  renamePalette: (id: string, name: string) => void;
  reorderPalettes: (startIndex: number, endIndex: number) => void;
  setActivePalette: (id: string) => void;
  updatePaletteStep: (paletteId: string, step: Step, hex: string) => void;
  updatePrimaryStep: (paletteId: string, step: Step) => void;
  regenerateScales: () => void;
  getActivePalette: () => Palette | null;
  duplicatePalette: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleFullscreen: () => void;
}
```

### Palette Interface

```typescript
interface Palette {
  id: string;
  name: string;
  steps: PaletteSteps;  // Record<Step, string>
  primaryStep: Step;     // Default: 600
  createdAt: number;
}
```

### Generated Scales Map

```typescript
type GeneratedScalesMap = Record<Step, StepScales | null>;

interface StepScales {
  surface: ScaleResult;
  high: ScaleResult;
  medium: ScaleResult;
  low: ScaleResult;
  heavy: ScaleResult;
  bold: ScaleResult;
  boldA11Y: ScaleResult;
  minimal: ScaleResult;
}

interface ScaleResult {
  hex: string;
  blendedHex?: string;
  alpha?: number;
  contrastRatio: number;
  wcag: WCAGCompliance;
  sourceStep?: Step;
}
```

### Persistence

```typescript
// localStorage with SSR-safe adapter
persist(
  (set, get) => ({ /* state */ }),
  {
    name: "rangule-palettes",
    storage: createJSONStorage(() => safeStorage),
    partialize: (state) => ({
      palettes: state.palettes,
      activePaletteId: state.activePaletteId
    })
  }
)
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      User Input                              │
│              (Palette Editor, Color Picker)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            updatePaletteStep(paletteId, step, hex)          │
│            updatePrimaryStep(paletteId, step)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Zustand Store                              │
│                  (usePaletteStore)                           │
│  • Updates palette.steps[step] = hex                         │
│  • Triggers scale regeneration                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│        generateAllScales(palette.steps, primaryStep)         │
│                  (scale-generator.ts)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           For each step (200-2500):                          │
│           generateScalesForStep(step, palette, primaryStep)  │
│                                                              │
│  1. Get surface hex                                          │
│  2. Determine contrast direction (dark/light)                │
│  3. Generate all 8 scales:                                   │
│     • surface (base color)                                   │
│     • high (max contrast)                                    │
│     • low (4.5:1 with alpha)                                 │
│     • medium (midpoint alpha)                                │
│     • bold (3.0:1 solid)                                     │
│     • boldA11Y (4.5:1 solid)                                 │
│     • heavy (enhanced contrast)                              │
│     • minimal (subtle variation)                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 color-utils.ts                               │
│  • getContrastRatio() - WCAG formula                         │
│  • blendWithAlpha() - alpha compositing                      │
│  • findAlphaForContrast() - binary search                    │
│  • createScaleResult() - WCAG compliance check               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            Generated Scales Map                              │
│      Record<Step, StepScales | null>                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
┌─────────────────────┐        ┌─────────────────────┐
│    ScalePreview     │        │  SurfaceStacking    │
│  (Grid/List View)   │        │   (UI States)       │
└─────────────────────┘        └─────────────────────┘
            │                             │
            └──────────────┬──────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Export                                  │
│           JSON | CSS | SVG | Text                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    localStorage                              │
│                  (persistence)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/color-utils.ts` | WCAG contrast, alpha blending, color validation |
| `src/lib/scale-generator.ts` | All 8 scale generation algorithms |
| `src/store/palette-store.ts` | Zustand state management, persistence |
| `src/components/surface-stacking.tsx` | Surface stacking visualization |
| `src/components/scale-preview.tsx` | Scale grid/list display |
| `src/constants/steps.ts` | Step definitions, WCAG thresholds |
| `src/types/palette.ts` | TypeScript interfaces |

### Quick Reference - Light Surface

```
Surface: step 2400 (light)
Contrast vs white: < 4.5:1
Contrasting color: Dark (step 200)

High:     step 200 at 100%
Low:      step 200 at ~56% (exactly 4.5:1)
Medium:   step 200 at ~78% (midpoint)
Bold:     Base → walk toward 200 until >= 3.0:1
BoldA11Y: Base → walk toward 200 until >= 4.5:1
Heavy:    Midpoint(Bold, 200), max 800
Minimal:  Surface - 200 (2400 → 2200)
```

### Quick Reference - Dark Surface

```
Surface: step 400 (dark)
Contrast vs white: >= 4.5:1
Contrasting color: Light (step 2500)

High:     step 2500 at 100%
Low:      step 2500 at ~55% (exactly 4.5:1)
Medium:   step 2500 at ~77% (midpoint)
Bold:     (Base + offset) → walk toward 2500 until >= 3.0:1
BoldA11Y: (Base + offset) → walk toward 2500 until >= 4.5:1
Heavy:    Same as BoldA11Y (or 2500 if >3 steps away)
Minimal:  Surface + 200 (400 → 600)
```

### Bold Step Offset (Dark Backgrounds)

```typescript
if (baseStep >= 1900) offset = 0;
if (baseStep >= 1300) offset = 1;
if (baseStep >= 700)  offset = 2;
else                  offset = 3;
```

---

## Export Formats

### CSS Variables

```css
:root {
  --color-indigo-200: #0b0034;
  --color-indigo-300: #170054;
  /* ... all 24 steps */
  --color-indigo-2500: #ffffff;
}
```

### JSON Structure

```json
{
  "id": "palette_123",
  "name": "Indigo",
  "steps": {
    "200": "#0b0034",
    "300": "#170054",
    "2500": "#ffffff"
  },
  "primaryStep": 600,
  "createdAt": 1234567890
}
```

---

## Usage in Other Projects

To implement this color system in your project:

1. **Copy the core utilities:**
   - `color-utils.ts` - contrast calculation and alpha blending
   - `scale-generator.ts` - scale generation algorithms

2. **Define your steps and palette:**
   ```typescript
   const STEPS = [200, 300, 400, ..., 2500];
   const palette = { 200: "#hex", 300: "#hex", ... };
   ```

3. **Generate scales:**
   ```typescript
   const scales = generateAllScales(palette, primaryStep);
   ```

4. **Use the results:**
   ```typescript
   // For surface step 1500
   const surface1500 = scales[1500];
   const textColor = surface1500.high.hex;      // Max contrast text
   const bodyText = surface1500.low.hex;        // 4.5:1 compliant
   const buttonBg = surface1500.bold.hex;       // 3.0:1 for large UI
   const dividerColor = surface1500.minimal.hex; // Subtle decorative
   ```

---

*Generated from Rang De codebase analysis*
