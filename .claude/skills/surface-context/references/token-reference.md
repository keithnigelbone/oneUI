# Surface Token Reference

## Table of Contents

1. [Per-Role Token Matrix](#per-role-token-matrix)
2. [Surface Fill Tokens (7 per role)](#surface-fill-tokens)
3. [Content Tokens (7 per role)](#content-tokens)
4. [On-Bold / On-Subtle Content (3 each)](#on-bold--on-subtle-content)
5. [State Tokens (6 per role)](#state-tokens)
6. [V4 Per-Role Aliases (~25 per role)](#v4-per-role-aliases)
7. [Legacy Backward-Compat Aliases](#legacy-backward-compat-aliases)
8. [Surface Fill Tokens (Root-Only)](#surface-fill-tokens-root-only)
9. [Border Tokens](#border-tokens)
10. [Bold Inversion Details](#bold-inversion-details)
11. [Context Block Token Remapping](#context-block-token-remapping)
12. [Token Boundary Allowlist](#token-boundary-allowlist)

---

## Per-Role Token Matrix

Each appearance role generates per token set:
- **7 surface fills** + **7 content** + **3 on-bold content** + **6 states** + **~25 V4 aliases** = ~48 tokens per role

With 11 possible roles (9 configured + neutral always present), maximum ~528 tokens for surfaces at :root, plus context blocks.

### Roles

| Role | CSS Prefix | Description |
|------|-----------|-------------|
| `primary` | `--Primary-` | Main brand accent |
| `secondary` | `--Secondary-` | Second accent |
| `tertiary` | `--Tertiary-` | Third accent |
| `quaternary` | `--Quaternary-` | Fourth accent |
| `neutral` | `--Neutral-` | Achromatic (always present) |
| `sparkle` | `--Sparkle-` | Highlight/premium |
| `brand-bg` | `--Brand-Bg-` | Brand background |
| `positive` | `--Positive-` | Success/confirm semantic |
| `negative` | `--Negative-` | Error/destructive semantic |
| `warning` | `--Warning-` | Warning semantic |
| `informative` | `--Informative-` | Info semantic |

---

## Surface Fill Tokens

7 tokens per role — the actual color at each surface level:

| Token | Example | Resolved From |
|-------|---------|---------------|
| `--Primary-Default` | `#ffffff` (light) | Step 2500 (light) or 100 (dark) |
| `--Primary-Ghost` | Same as parent | Parent step |
| `--Primary-Minimal` | Slight shift | Parent + dir * 100 |
| `--Primary-Subtle` | Tinted | Parent + dir * 200 |
| `--Primary-Moderate` | Medium | Parent + dir * 300 |
| `--Primary-Bold` | `#6C5CE7` | Scale's baseStep |
| `--Primary-Elevated` | Lighter | Parent + 100 (max 2500) |

---

## Content Tokens

7 tokens per role — text, accent, and stroke colors resolved at the parent surface:

| Token | Example | Contrast Guarantee |
|-------|---------|-------------------|
| `--Primary-High` | `#000000` or `#ffffff` | Full opacity contrasting extreme |
| `--Primary-Medium-Text` | `rgba(0,0,0,0.72)` | Midpoint between low and 1.0 |
| `--Primary-Low` | `rgba(0,0,0,0.45)` | Minimum for 4.5:1 WCAG AA |
| `--Primary-Tinted` | `#7c6fd4` | Walk from base until 3:1 |
| `--Primary-TintedA11y` | `#5b4cdb` | Walk from base until 4.5:1 |
| `--Primary-Stroke-Medium` | `rgba(...)` | 24-32% opacity, fixed offset |
| `--Primary-Stroke-Low` | `rgba(...)` | 12-16% opacity, fixed offset |

**Note**: `High`, `Medium-Text`, `Low` use neutral black/white (not tinted palette extremes) to prevent colored text on saturated brand scales.

---

## On-Bold / On-Subtle Content

3 key content tokens resolved at the bold and subtle surface steps (for text ON those fills):

### On-Bold (for text on bold fills)

| Token | Example | Used By |
|-------|---------|---------|
| `--Primary-Bold-High` | `#ffffff` | Button bold text |
| `--Primary-Bold-Medium` | `rgba(255,255,255,0.72)` | Secondary text on bold |
| `--Primary-Bold-TintedA11y` | `#c8b6ff` | Accent on bold |

### On-Subtle (for text on subtle fills)

| Token | Example | Used By |
|-------|---------|---------|
| `--Primary-BG-Subtle-High` | V4 alias format | Text on subtle surface |
| `--Primary-BG-Subtle-Hover` | State layer | Hover on subtle |
| `--Primary-BG-Subtle-Pressed` | State layer | Pressed on subtle |

---

## State Tokens

6 tokens per role — interaction state surfaces:

| Token | Base | Offset |
|-------|------|--------|
| `--Primary-Hover` | Parent | +1 step toward contrast |
| `--Primary-Pressed` | Parent | +2 steps toward contrast |
| `--Primary-Bold-Hover` | Bold | +1 step |
| `--Primary-Bold-Pressed` | Bold | +2 steps |
| `--Primary-Subtle-Hover` | Subtle | +1 step |
| `--Primary-Subtle-Pressed` | Subtle | +2 steps |

---

## V4 Per-Role Aliases

Generated for backward compatibility with components using V4 token names:

### Surface Aliases
```
--Primary-BG-Minimal  → same hex as --Primary-Minimal
--Primary-BG-Subtle   → same hex as --Primary-Subtle
--Primary-BG-Bold     → same hex as --Primary-Bold
--Primary-FG-Minimal  → same hex as --Primary-Minimal
--Primary-FG-Subtle   → same hex as --Primary-Subtle
--Primary-FG-Bold     → same hex as --Primary-Bold
```

### Default Context On-Colours
```
--Primary-Default-High           → --Primary-High
--Primary-Default-Medium-Text    → --Primary-Medium-Text
--Primary-Default-Low-Text       → --Primary-Low
--Primary-Default-Medium-Stroke  → --Primary-Stroke-Medium
--Primary-Default-Low-Stroke     → --Primary-Stroke-Low
--Primary-Default-Accent         → --Primary-Tinted
--Primary-Default-Accent-A11y    → --Primary-TintedA11y
--Primary-Default-Hover          → --Primary-Hover
--Primary-Default-Pressed        → --Primary-Pressed
```

### FG-Bold On-Colours
```
--Primary-FG-Bold-High    → --Primary-Bold-High
--Primary-FG-Bold-Hover   → --Primary-Bold-Hover
--Primary-FG-Bold-Pressed → --Primary-Bold-Pressed
```

### BG-Subtle On-Colours
```
--Primary-BG-Subtle-High    → on-subtle high
--Primary-BG-Subtle-Hover   → --Primary-Subtle-Hover
--Primary-BG-Subtle-Pressed → --Primary-Subtle-Pressed
```

---

## Legacy Backward-Compat Aliases

Generated from Primary role (or Neutral fallback) — these are the oldest token names:

| Legacy Token | New Source |
|-------------|-----------|
| `--Surface-Default` | `--Primary-Default` |
| `--Surface-Main` | `--Primary-Default` |
| `--Surface-Minimal` | `--Primary-Minimal` |
| `--Surface-Ghost` | `--Primary-Ghost` |
| `--Surface-Subtle` | `--Primary-Subtle` |
| `--Surface-Bold` | `--Primary-Bold` |
| `--Surface-Elevated` | `--Primary-Elevated` |
| `--Surface-BG-Minimal` | `--Primary-Minimal` |
| `--Surface-BG-Subtle` | `--Primary-Subtle` |
| `--Surface-BG-Bold` | `--Primary-Bold` |
| `--Surface-FG-Minimal` | `--Primary-Minimal` |
| `--Surface-FG-Subtle` | `--Primary-Subtle` |
| `--Surface-FG-Bold` | `--Primary-Bold` |
| `--Surface-Bold-Hover` | `--Primary-Bold-Hover` |
| `--Surface-Bold-Pressed` | `--Primary-Bold-Pressed` |
| `--Surface-Subtle-Hover` | `--Primary-Subtle-Hover` |
| `--Surface-Subtle-Pressed` | `--Primary-Subtle-Pressed` |
| `--Surface-Minimal-Hover` | `--Primary-Hover` |
| `--Surface-Minimal-Pressed` | `--Primary-Pressed` |
| `--Surface-Ghost-Hover` | `--Primary-Hover` |
| `--Text-High` | `--Primary-High` |
| `--Text-Medium` | `--Primary-Medium-Text` |
| `--Text-Low` | `--Primary-Low` |
| `--Text-Medium-Stroke` | `--Primary-Stroke-Medium` |
| `--Text-Low-Stroke` | `--Primary-Stroke-Low` |
| `--Text-OnBold-High` | `--Primary-Bold-High` |

---

## Surface Fill Tokens (Root-Only)

These are **only defined at :root** and **never remapped** in `[data-surface]` context blocks. The Surface component reads these for its own background to avoid the self-referential issue.

Generated for all roles plus Primary/Neutral default aliases:

```
--Primary-Fill-Minimal   (per-role)
--Primary-Fill-Subtle
--Primary-Fill-Moderate
--Primary-Fill-Bold
--Primary-Fill-Elevated

--Surface-Fill-Default   (from Primary/Neutral)
--Surface-Fill-Minimal
--Surface-Fill-Subtle
--Surface-Fill-Moderate
--Surface-Fill-Bold
--Surface-Fill-Elevated
```

---

## Border Tokens

Derived from Neutral role's content tokens, theme-adaptive:

| Token | Light Theme Source | Dark Theme Source |
|-------|-------------------|-------------------|
| `--Border-Subtle` | `Neutral strokeLow` | `Neutral strokeMedium` |
| `--Border-Default` | `Neutral strokeMedium` | `Neutral low (text)` |

Dark theme uses higher-opacity values because low-opacity strokes are invisible on dark backgrounds.

---

## Bold Inversion Details

### The Problem

When a bold button (`--Primary-Bold`) sits on a bold surface (`[data-surface="bold"]`), both resolve to the same color — the button is invisible.

### The Solution

Inside `[data-surface="bold"]`, the context block resolves `--Primary-Bold` at the **container's bold step**, which is the bold fill step itself (e.g., step 700). From step 700, the contrast direction flips toward light, and the bold token resolves to the scale's `darkerBaseStep` offset to create a visible tinted accent.

The key is that `resolveContextTokenSet()` re-resolves everything at the container step, and `resolveSurface('bold', containerStep, ...)` produces a different step than the outer bold — giving the nested bold button a contrasting fill.

### Per-Variant Behavior on Bold Surface

| Variant | Fill | Text |
|---------|------|------|
| **Bold** | Tinted accent (different from surface) | White |
| **Subtle** | Surface subtle step (lighter tint) | Accessible accent |
| **Ghost** | Transparent | White text, white border |

---

## Context Block Token Remapping

5 `[data-surface]` blocks are generated. Each re-resolves all tokens at the container's step:

| Block | Container Step | Contrast Dir |
|-------|---------------|-------------|
| `[data-surface="minimal"]` | outerParent + dir * 100 | Recomputed |
| `[data-surface="subtle"]` | outerParent + dir * 200 | Recomputed |
| `[data-surface="moderate"]` | outerParent + dir * 300 | Recomputed |
| `[data-surface="bold"]` | scale.baseStep | Usually flipped |
| `[data-surface="elevated"]` | outerParent + 100 | Recomputed |

`default` and `ghost` don't need context blocks (default IS the base, ghost is transparent).

Each block contains: all role tokens (new + V4 aliases) + backward-compat legacy aliases.

---

## Token Boundary Allowlist

Only these prefix families pass through the token boundary filter into brand CSS:

| Category | Prefixes |
|----------|----------|
| Surface (compat) | `--Surface-` |
| Text (compat) | `--Text-` |
| Appearance roles | `--Primary-`, `--Secondary-`, `--Tertiary-`, `--Quaternary-`, `--Neutral-`, `--Sparkle-`, `--Brand-Bg-`, `--Positive-`, `--Negative-`, `--Warning-`, `--Informative-` |
| Typography | `--Typography-Font-`, `--Typography-Weight-`, `--Typography-Size-`, `--Display-`, `--Headline-`, `--Title-`, `--Body-`, `--Label-`, `--Code-` |
| Border | `--Border-` |
| Ornament | `--Button-ornament-` |
| Environment | `--env-` |

**Blocked**: `--Shape-*`, `--Spacing-*`, `--Dimension-*`, `--Motion-*`, `--Elevation-*` — structural tokens that brands cannot override.
