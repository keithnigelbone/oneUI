---
version: alpha
oneui-version: 1
name: OneUI / Jio Base
description: >-
  The OneUI design-system constitution — a portable, single-file reference for AI
  coding agents and external teams. OneUI is a MULTI-BRAND, fully TOKENISED system:
  every value below is a CSS custom property (`var(--Token)`), never a baked literal.
  Colours resolve to whichever brand theme is active (26 sub-brands, see `themes`);
  spacing, shape, typography, and elevation tokens are shared across all brands.
  Choose meaning (role, surface level, type role) and the engine resolves exact,
  accessible values per brand, platform, density, and theme.
colors:
  # TOKENS, never literals. Every value is a CSS custom property that resolves to the
  # ACTIVE brand theme's OkLCH-generated colour (see `themes` below). Switch the brand
  # and every token re-resolves — design.md carries no baked hex.
  primary-bold: "var(--Primary-Bold)"
  primary-subtle: "var(--Primary-Subtle)"
  primary-bold-hover: "var(--Primary-Bold-Hover)"
  on-primary-bold: "var(--Primary-Bold-High)"
  on-primary-subtle: "var(--Primary-TintedA11y)"
  secondary: "var(--Secondary-Bold)"
  neutral-page: "var(--Surface-Fill-Default)"
  neutral-bold: "var(--Neutral-Bold)"
  text-high: "var(--Text-High)"
  text-medium: "var(--Text-Medium)"
  text-low: "var(--Text-Low)"
  text-on-bold-high: "var(--Text-OnBold-High)"
  # Semantic roles — fixed OkLCH hue/chroma across all brands (only the scale differs):
  positive: "var(--Positive-Bold)"        # success — hue 145, chroma 0.18
  warning: "var(--Warning-Bold)"          # caution — hue 45,  chroma 0.18
  negative: "var(--Negative-Bold)"        # error   — hue 25,  chroma 0.22
  informative: "var(--Informative-Bold)"  # info    — hue 250, chroma 0.15
typography:
  # All token references. Sizes/line-heights are f-step aliases that cascade per
  # platform and density; weights are role tokens. The brand theme can override the
  # font family via --Typography-Font-Primary.
  display-l:  { fontFamily: "var(--Typography-Font-Primary)", fontSize: "var(--Display-L-FontSize)",  fontWeight: "var(--Display-L-FontWeight)",  lineHeight: "var(--Display-L-LineHeight)" }
  display-m:  { fontFamily: "var(--Typography-Font-Primary)", fontSize: "var(--Display-M-FontSize)",  fontWeight: "var(--Display-M-FontWeight)",  lineHeight: "var(--Display-M-LineHeight)" }
  headline-l: { fontFamily: "var(--Typography-Font-Primary)", fontSize: "var(--Headline-L-FontSize)", fontWeight: "var(--Headline-L-FontWeight)", lineHeight: "var(--Headline-L-LineHeight)" }
  headline-m: { fontFamily: "var(--Typography-Font-Primary)", fontSize: "var(--Headline-M-FontSize)", fontWeight: "var(--Headline-M-FontWeight)", lineHeight: "var(--Headline-M-LineHeight)" }
  title-m:    { fontFamily: "var(--Typography-Font-Primary)", fontSize: "var(--Title-M-FontSize)",    fontWeight: "var(--Title-M-FontWeight)",    lineHeight: "var(--Title-M-LineHeight)" }
  title-s:    { fontFamily: "var(--Typography-Font-Primary)", fontSize: "var(--Title-S-FontSize)",    fontWeight: "var(--Title-S-FontWeight)",    lineHeight: "var(--Title-S-LineHeight)" }
  body-m:     { fontFamily: "var(--Typography-Font-Primary)", fontSize: "var(--Body-M-FontSize)",     fontWeight: "var(--Body-FontWeight-Low)",    lineHeight: "var(--Body-M-LineHeight)" }
  body-s:     { fontFamily: "var(--Typography-Font-Primary)", fontSize: "var(--Body-S-FontSize)",     fontWeight: "var(--Body-FontWeight-Low)",    lineHeight: "var(--Body-S-LineHeight)" }
  label-m:    { fontFamily: "var(--Typography-Font-Primary)", fontSize: "var(--Label-M-FontSize)",    fontWeight: "var(--Label-FontWeight-Medium)", lineHeight: "var(--Label-M-LineHeight)" }
  label-s:    { fontFamily: "var(--Typography-Font-Primary)", fontSize: "var(--Label-S-FontSize)",    fontWeight: "var(--Label-FontWeight-Medium)", lineHeight: "var(--Label-S-LineHeight)" }
  code-m:     { fontFamily: "var(--Typography-Font-Code)",    fontSize: "var(--Code-M-FontSize)",     fontWeight: "var(--Code-FontWeight-Low)",    lineHeight: "var(--Code-M-LineHeight)" }
rounded:
  none: "var(--Shape-0)"     # 0px
  sm: "var(--Shape-1)"       # 4px  — inputs, chips, selects
  md: "var(--Shape-2)"       # 8px
  lg: "var(--Shape-4)"       # 16px — standard cards
  xl: "var(--Shape-6)"       # 24px — large containers
  2xl: "var(--Shape-8)"      # 32px
  pill: "var(--Shape-Pill)"  # 9999px — buttons, avatars, icon buttons
spacing:
  # Numeric scale; suffix ≈ N×4px at base. Full scale: --Spacing-0 … --Spacing-40.
  "1": "var(--Spacing-1)"        # 4px
  "2": "var(--Spacing-2)"        # 8px
  "4": "var(--Spacing-4)"        # 16px — standard padding
  "6": "var(--Spacing-6)"        # 24px
  "8": "var(--Spacing-8)"        # 32px
  "12": "var(--Spacing-12)"      # 48px
  margin: "var(--Spacing-Margin)" # page edge, adapts per platform
  gutter: "var(--Spacing-Gutter)" # column gutter, adapts per platform
elevation:
  "0": "var(--Elevation-0)"
  "1": "var(--Elevation-1)"
  "2": "var(--Elevation-2)"
  "3": "var(--Elevation-3)"
  "4": "var(--Elevation-4)"
  "5": "var(--Elevation-5)"
components:
  button-bold:
    backgroundColor: "{colors.primary-bold}"
    textColor: "{colors.on-primary-bold}"
    rounded: "{rounded.pill}"
    padding: "var(--Spacing-3) var(--Spacing-6)"
    typography: "{typography.label-m}"
  button-bold-hover:
    backgroundColor: "{colors.primary-bold-hover}"
  button-subtle:
    backgroundColor: "{colors.primary-subtle}"
    textColor: "{colors.on-primary-subtle}"
    rounded: "{rounded.pill}"
    padding: "var(--Spacing-3) var(--Spacing-6)"
    typography: "{typography.label-m}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.on-primary-subtle}"
    rounded: "{rounded.pill}"
    padding: "var(--Spacing-3) var(--Spacing-6)"
  card-default:
    backgroundColor: "{colors.neutral-page}"
    rounded: "{rounded.lg}"
    padding: "var(--Spacing-4)"
  input-field:
    backgroundColor: "{colors.neutral-page}"
    rounded: "{rounded.sm}"
    padding: "var(--Spacing-2-5) var(--Spacing-4)"
    typography: "{typography.body-m}"
  chip:
    rounded: "{rounded.pill}"
    typography: "{typography.label-s}"
themes:
  # Selectable brand themes. Picking one re-resolves every COLOUR token to that
  # brand's OkLCH palette; spacing / shape / typography / elevation tokens stay shared
  # across all brands. The active brand is set on the platform, not baked into output.
  default: "One UI Theme"
  brands:
    - Jio
    - MyJio
    - JioAICloud
    - JioAllianz
    - JioBlackRock
    - JioBusiness
    - JioCX
    - JioFinance
    - JioFit
    - JioGames
    - JioHealthHub
    - JioHome
    - JioMart
    - JioMessages
    - JioMobile
    - JioNews
    - JioPC
    - JioSaavn
    - JioSarthi
    - JioStar
    - JioThings
    - JioTranslate
    - JioTV
    - JioWave
    - JioWorkspace
    - Tira
---

# OneUI / Jio Base — Design System Constitution

> A single, portable reference an AI agent can read to generate on-brand OneUI UI.
> The frontmatter above is the machine-readable **token map** — every value is a
> `var(--Token)` reference, not a baked literal. This body explains *why* and *when*.
> OneUI is multi-brand: pick a brand theme (`themes` block — 26 sub-brands) and every
> colour token re-resolves to that brand's OkLCH palette; spacing, shape, type, and
> elevation stay shared. Your job is to choose **meaning** (which role, which surface
> level, which type role) — the engine computes exact colours, contrast, and states.
> **Never hard-code a visual value; always reference a token.**

This file mirrors the structure OneUI's own per-brand `design.md` exporter emits
(`serializeBrandToDesignMd`): the canonical Google `design.md` sections, followed by
OneUI extension sections (`## Surfaces`, `## Surface Context`, `## Attention
Hierarchy`, `## Contexts`, `## Skills`).

---

## Overview

OneUI's first principle: **the interface should be quiet so the content can lead.**
It draws on Apple's cinematic minimalism, Airbnb's photography-first canvas, and
Uber's confident restraint — adapted to Jio's brand. Five beliefs drive every
decision:

1. **Content is the hero.** Most of every screen (≈80–90%) is the neutral `default`
   surface. White (or near-black in dark mode) space lets imagery, text, and data
   breathe. This is not the absence of design — it *is* the design.
2. **Attention is a budget.** Each screen has finite user attention; spend it on
   what matters. Distribute emphasis like a pyramid (see *Attention Hierarchy*).
   When everything shouts, nothing is heard.
3. **Brand expression through restraint.** Jio's colour appears in deliberate
   moments — one bold button on a calm page has more impact than a page drenched in
   brand colour.
4. **Tokens, never literals.** Every visual value comes from a design token
   (`var(--Token-Name)`). Zero hard-coded colours, pixels, or font names. This is
   what makes the system brand-portable and responsive. Enforced by
   `pnpm check:literals`.
5. **Default-first, surface-as-meaning.** Start every region on `default`. Reach
   for a non-default surface only when an area carries a real moment (hero, promo,
   alert, floating element). A surface is a choice about *attention*, not colour.

---

## Colors

OneUI colour is built on **OkLCH** (perceptual colour space), **25-step scales**
(steps 100 = darkest → 2500 = lightest), with a per-brand base chroma lock. Each
brand defines `primaryHue` and `primaryChroma`; the engine generates the full scale
and every role token automatically. **Do not hard-code hex — reference role tokens
and let the engine resolve them per brand and per surface.**

### The 9 appearance roles

| Role | CSS prefix | Use it for |
|------|-----------|------------|
| **primary** | `--Primary-` | The action colour: primary buttons, links, active navigation, logo, progress, pagination. One primary CTA per viewport section. |
| **secondary** | `--Secondary-` | Accent for non-primary moments: selected checkboxes/radios/toggles, chips, segmented controls. Never equal weight to primary. Not a "secondary button". |
| **neutral** | `--Neutral-` | Achromatic chrome: dividers, tertiary actions, de-emphasised icons. Always present. |
| **sparkle** | `--Sparkle-` | Celebration, reward, delight, promo highlights. Keep rare (1–2 per viewport). |
| **brand-bg** | `--Brand-Bg-` | Brand background identity for marketing/promo/campaign sections only. Never standard product UI. |
| **positive** | `--Positive-` | Success / confirmation (semantic). |
| **negative** | `--Negative-` | Error / destructive (semantic). |
| **warning** | `--Warning-` | Caution / attention (semantic). |
| **informative** | `--Informative-` | Neutral information / status (semantic). Also drives focus rings. |

Brand roles express identity; semantic roles signal status. **Never use a semantic
role for brand expression, or a brand role for status.**

### Role token families (what you actually reference)

Every role emits a consistent, role-explicit family. For `--Primary-*` (same shape
for all roles):

- **Surface fills:** `--Primary-Default` · `-Minimal` · `-Subtle` · `-Moderate` · `-Bold` · `-Elevated`
- **Content (text / accent):** `--Primary-High` (full-opacity, auto black/white) · `-Medium` · `-Low` (min opacity for 4.5:1 AA) · `-Tinted` · `-TintedA11y` (accessible accent)
- **Strokes:** `--Primary-Stroke-Medium` · `-Stroke-Low`
- **On-bold content** (text *on* a bold fill): `--Primary-Bold-High` · `-Bold-Medium` · `-Bold-TintedA11y` (a full text hierarchy exists on bold, not just High)
- **States:** `--Primary-Hover` · `-Pressed` · `-Bold-Hover` · `-Bold-Pressed` · `-Subtle-Hover` · `-Subtle-Pressed`

This is the **complete pattern** — every one of the 9 roles emits this exact family
(`--Secondary-Bold`, `--Positive-High`, `--Sparkle-Bold-Medium`, …). If you can name
the role and the slot, the token exists; you don't need it spelled out here.

Write the role-explicit name (`--Primary-Bold`, `--Primary-High`). Legacy aliases
(`--Text-High`, `--Surface-Bold`, `--Primary-FG-Bold`) are still emitted for
backward compatibility but must not be authored in new code.

### Brand themes resolve the colours

The frontmatter `colors` block holds **token references, not values**. Which colours
those tokens resolve to depends on the **active brand theme** (`themes` block — see
*## Themes*). The default is the One UI Theme; selecting any of the 26 sub-brands
(Jio, JioMart, JioSaavn, JioStar, Tira, …) re-resolves `--Primary-*`, `--Secondary-*`,
and every accent token to that brand's OkLCH palette — without changing any markup.
The **semantic anchors stay fixed across brands**: positive (hue 145), warning
(hue 45), negative (hue 25), informative (hue 250). This is why you never hard-code a
colour: the same token is correct for every brand.

---

## Typography

A **relational f-step system**: every size is an alias to a dimension f-step
(`--Display-L-FontSize: var(--Dimension-f7)`), so platform and density shift the
whole scale at once. **6 roles, 27 sizes.**

| Role | Use | Representative token | Weight |
|------|-----|----------------------|--------|
| **Display** (L/M/S) | Hero / splash headlines | `--Display-L-FontSize` (40px) | 900 |
| **Headline** (L/M/S) | Page titles, section headings | `--Headline-L-FontSize` (28px) | 900 / 900 / 850 |
| **Title** (L/M/S) | Card titles, component titles | `--Title-M-FontSize` (16px) | 800 / 800 / 750 |
| **Body** (2XL…2XS) | Paragraphs, descriptions | `--Body-M-FontSize` (16px) | High 700 / Medium 500 / Low 400 |
| **Label** (2XL…3XS) | Buttons, nav, inputs, badges | `--Label-S-FontSize` (14px) | High 700 / Medium 500 / Low 400 |
| **Code** (M/S/XS) | Monospace / code | `--Code-M-FontSize` (16px) | High 700 / Medium 500 / Low 400 |

**Every role × size has three sibling tokens** following one pattern:
`--{Role}-{Size}-FontSize`, `--{Role}-{Size}-LineHeight`, and a weight token. Fixed-
weight roles use `--{Role}-{Size}-FontWeight` (Display/Headline/Title); emphasis roles
use shared weight tokens `--{Role}-FontWeight-{High|Medium|Low}` (Body/Label/Code, e.g.
`--Body-FontWeight-Low`, `--Label-FontWeight-Medium`). The tables show representatives;
the full set is generated — name the role, size, and slot and the token exists.

**Font slots:** `--Typography-Font-Primary` (UI + body; defaults to Inter, JioType
Var for the Jio brand), `--Typography-Font-Secondary`, `--Typography-Font-Script`
(multi-script: Devanagari, Tamil, …), `--Typography-Font-Code` (JetBrains Mono).

### Mandatory typography rules

1. **Every text element uses a role token** (`--Body-M-FontSize`, `--Label-S-FontSize`).
   No hard-coded font sizes, weights, or line-heights.
2. **Always pair `font-size` with its matching `line-height` token** — line-height
   drives the relational spacing system (`--Body-M-FontSize` + `--Body-M-LineHeight`).
3. **Always include `font-family: var(--Typography-Font-Primary)`** on text elements,
   so brand font customisation cascades.
4. **No legacy `--Typography-Size-*` / `--Typography-Weight-*`** in new code — use
   the role-explicit names above.

---

## Layout

Spacing and shape derive from a **26-step f-scale** (f-8 → f16, 0–160px at the S
base). All values are responsive per breakpoint (`data-Breakpoint`) × density
(`data-6-Density`) via the dimension cascade — never write media queries in
component CSS.

**Spacing tokens are numeric** — the suffix ≈ N×4px at base. Full scale:
`--Spacing-0`, `--Spacing-0-5`, `--Spacing-1` … `--Spacing-40`. There are **no
T-shirt names** (no `--Spacing-M`, `--Spacing-XL`).

| Use | Token | px (base) |
|-----|-------|-----------|
| Micro gap (icon→text) | `--Spacing-1` | 4 |
| Between chips | `--Spacing-2` | 8 |
| Standard padding | `--Spacing-4` | 16 |
| Between components | `--Spacing-4-5`–`--Spacing-6` | 18–24 |
| Between card groups | `--Spacing-7`–`--Spacing-8` | 28–32 |
| Section gap | `--Spacing-9`–`--Spacing-12` | 36–48 |
| Page margin / gutter | `--Spacing-Margin` / `--Spacing-Gutter` | adapts per platform |

**Grid per breakpoint** (margin / gutter / columns): S 16/8/4 · M 24/12/8 ·
L 32/16/12. Touch targets
≥ 44×44 on mobile, 24×24 on desktop. **Density** (compact/default/open) shifts every
f-step by −1/0/+1. Whitespace philosophy: when in doubt, add more — the calm,
Apple-like feel comes from breathing room, not tight packing.

**Structural layout literals are allowed.** The no-literals rule targets *visual*
values (colour, spacing, shape, font, line-height). Structural CSS used purely for
layout geometry — `display:grid`, `1fr`, `repeat(3, 1fr)`, `aspect-ratio`, `100%`,
`0`, and a readability `max-width` on a page container (e.g. `max-width: 1024px` on a
wide-screen content column) — is fine and expected. Use `--Spacing-Margin` for page
edges; cap content width with a `max-width` for readability where the grid doesn't.

---

## Elevation & Depth

Elevation is a **two-shadow formula**, levels 0–5 (`--Elevation-0` … `--Elevation-5`).

- **Prefer surface differentiation over shadows.** Use `<Surface mode="minimal">` or
  `"subtle"` to separate sections before reaching for a shadow.
- **Most UI lives at `--Elevation-0`** (flat). Shadows are for *functional* hierarchy
  (floating elements: popovers, dialogs, sheets), not decoration.
- **Dark mode** uses a 1px stroke in place of a shadow (the theme handles this).

**Motion** uses token families — never hard-code ms. Durations:
`--Motion-Duration-{XS…XL}` (+ `--Motion-Duration-Subtle-*` for
`prefers-reduced-motion`). Easings: `--Motion-Easing-{Entrance,Exit,Transition,
Bounce}-{Moderate,Subtle}`. Distances: `--Motion-Distance-{Micro…XLarge}`. Offsets
(stagger): `--Motion-Offset-{S,M,L}`.

---

## Shapes

Shape tokens are **numeric** (`--Shape-0` … `--Shape-10`, same N×4px convention) plus
the standalone constant `--Shape-Pill` (9999px). The numeric tokens are responsive
(f-step aliases); `--Shape-Pill` is a fixed constant. **No T-shirt names** (no
`--Shape-M`, `--Shape-L`).

| Element | Token | Jio default | Reason |
|---------|-------|-------------|--------|
| Buttons, icon buttons, chips, avatars | `--Shape-Pill` | 9999px | Pill = friendliness, Jio identity; circular for touch |
| Inputs, selects | `--Shape-2` | 8px | Subtle container feel |
| Standard cards | `--Shape-4` | 16px | Moderate rounding |
| Large containers, modals | `--Shape-4-5`–`--Shape-6` | 18–24px | Soft corners |
| Dividers, full-bleed | `--Shape-0` | 0px | Sharp |

Each component sets its own default via `--ComponentName-borderRadius`, overridable
per brand. Never mix shape scales on one screen.

---

## Components

OneUI is a **registry of real components** (web + React Native), built on Base UI
primitives (never forked). Compose with what exists — don't hand-roll from raw divs.
Import web components from **`@oneui/ui`** (e.g. `import { Surface, Button, Chip } from
'@oneui/ui'`); React Native from **`@oneui/ui-native`**. The `<Surface>` component
accepts `mode`, `appearance`, and a `style` passthrough (it renders its own background
from the resolved surface step).

**Buttons** come in three attention levels that map directly to surface modes:
`bold` (high) → `subtle` (medium) → `ghost` (low). Inside a `<Surface mode="bold">`
the same three tokens automatically remap for contrast — never swap colours manually.

| Need | Component | Notes |
|------|-----------|-------|
| Primary CTA | `Button` variant `bold`, appearance `primary` | One per viewport section |
| Secondary action | `Button` variant `subtle` | |
| Tertiary / cancel | `Button` variant `ghost`, appearance `neutral` | |
| Toggleable filter | `Chip` | Default appearance `secondary`; `bold` when selected |
| Boolean / choice | `Switch` / `Radio` / `Checkbox` | `secondary` role |
| Status | `Badge` | Semantic roles only |
| Identity | `Avatar` | Always pill (circular) |

### Navigation

Real nav components: **Tabs** (in-screen view switching), **BottomNavigation**
(mobile top-level destinations, 2–5), **WebHeader** (`.PrimaryNav` / `.SecondaryNav`
/ `.Item`, responsive, collapses to `MobileDrawer`), **NavigationMenu**, **Menu**,
**Pagination**, **ToggleGroup** (a view-mode switch, *not* navigation), **Link** /
**LinkButton**.

**Does not exist — compose, don't hallucinate:** Breadcrumb (build from `Link` +
separators), Sidebar / NavRail (compose from vertical `Tabs` or a `Link` column),
AppBar (use `WebHeader`). And **`Stepper` is a numeric input, not a step indicator.**

Navigation fundamentals: swap the shell by breakpoint (BottomNavigation on mobile,
WebHeader on desktop — never both at once); active = `primary` role + `aria-current`;
nav is None/Low attention chrome on the `default` surface; nav labels use the `Label`
role; ≤ 5 top-level destinations.

---

## Do's and Don'ts

**Do**
- Start every screen on the `default` neutral surface; build hierarchy with spacing,
  type, and one primary action.
- Wrap any non-default background in `<Surface mode="...">` and let children inherit.
- Use one primary CTA per viewport section; keep at most one bold surface.
- Use semantic roles (positive/negative/warning/informative) for status only.
- Use the `Label` role for all interactive text; pair every size token with its
  line-height token; include `--Typography-Font-Primary`.
- Reach for the role-explicit tokens (`--Primary-Bold`, `--Primary-High`).

**Don't**
- Set `background` on a raw `<div>` and expect child colours to adapt — they won't
  (it's outside the surface cascade; text breaks).
- Add decorative strokes to a tinted surface — the fill is already the boundary.
- Tint default backgrounds, text, or strokes without a semantic/contextual reason.
- Use brand-bg or sparkle on standard product UI; use `secondary` for active nav.
- Hard-code colours, pixels (except `0`, `9999px`, `100%`), or font names.
- Build tinted dark mode — dark surfaces are neutral and calm.
- Invent components (Breadcrumb/Sidebar/AppBar) or use `Stepper` as a wizard.

---

## Surfaces

*(OneUI extension — not part of canonical `design.md`; preserved by the linter.)*

Seven surface tokens, each resolved **relative to its parent's step** on the 25-step
scale. You choose a level; the engine computes the fill, text, stroke, contrast, and
states automatically (always WCAG-safe).

| Level | Resolution | Attention | Use for |
|-------|-----------|-----------|---------|
| `default` | step 2500 light / **200 dark** (ignores parent) | base / calm | Page bg, standard cards, lists, forms, product UI (70–80%) |
| `ghost` | same step as parent | none (still triggers remapping) | Participate in the cascade without changing colour |
| `minimal` | parent + 1 step toward contrast | very low | Tiny nested separation (component-level only) |
| `subtle` | parent + 2 steps | low | Gentle local distinction (component-level only) |
| `moderate` | parent + 3 steps | medium | A component state needing visibility |
| `bold` | role's base step (brand accent; 7-step min jump) | high | Alerts, toasts, promo banners, hero moments. ≤ 1 per viewport |
| `elevated` | parent + 1 step toward lighter (capped 2500) | spatial | Floating: popovers, dialogs, sheets, menus |

The numeric levels (minimal/subtle/moderate) are **component-level only** — never
page or large-section backgrounds. `bold` jumps to the brand's base step with a
guaranteed minimum contrast, so it always reads as distinct from its parent.

---

## Surface Context

*(OneUI extension.)*

Components adapt automatically via CSS token remapping when placed inside
`<Surface mode="...">`: the engine emits `[data-surface="..."] { ... }` blocks inside
`@layer brand` that re-resolve every role token at the new surface's step. A button's
`var(--Primary-High)` reads dark on a white page and white on a bold surface — **zero
JavaScript, zero manual overrides.**

A raw `<div>` with `background:` is **outside** this cascade by design — tokens inside
it do not remap, and components render with broken contrast (dark text on a dark bold
fill). **Always use `<Surface>` (or set `data-surface`) for non-default backgrounds.**

Three things travel together on any tinted/coloured/dark area: (1) use `<Surface>`,
not a styled `<div>`; (2) don't add a decorative border — the fill is the boundary;
(3) reference generic role tokens (`--Primary-High`, `--Text-High`), not hard-coded
surface-specific aliases.

---

## Attention Hierarchy

*(OneUI extension.)*

Per viewport, aim for: **5%** high-attention (one bold element), **10%**
medium-attention (2–3 subtle tints), **25%** low-attention (chrome, links), **60%**
no-attention (page, body, whitespace). If two elements compete for "high", the page
is already broken — demote one. Solve hierarchy with spacing, type, and layout
*before* reaching for a surface.

---

## Contexts

*(OneUI extension.)*

OneUI output adapts to context: `mobile-app`, `web-app`, `marketing-page`,
`social-post`, `print`, `outdoor`. Each applies different layout constraints,
spacing, touch targets, and typography. When generating, pick the context closest to
the target surface, and respect its density and reach (e.g. larger touch targets and
bottom-nav shells on `mobile-app`; generous margins and header nav on `web-app`).

---

## Themes (Sub-Brands)

*(OneUI extension.)*

OneUI is multi-brand. A **brand theme** is a selectable identity — it sets
`primaryHue` / `primaryChroma` (and optional secondary/accent anchors), and the engine
regenerates the full 25-step OkLCH scales and every `--{Role}-*` colour token from
those. **Selecting a brand changes only the colour resolution** — spacing, shape,
typography, elevation, and motion tokens are shared across all brands, so the same
markup is correct everywhere.

**26 brand themes** ship today (default: **One UI Theme**):

> Jio · MyJio · JioAICloud · JioAllianz · JioBlackRock · JioBusiness · JioCX ·
> JioFinance · JioFit · JioGames · JioHealthHub · JioHome · JioMart · JioMessages ·
> JioMobile · JioNews · JioPC · JioSaavn · JioSarthi · JioStar · JioThings ·
> JioTranslate · JioTV · JioWave · JioWorkspace · Tira

Brands are also **created dynamically** in the platform (stored in Convex), so this
list grows — treat `themes.brands` as the current roster, not a fixed enum. When
generating UI, **never bake a brand's colour** — reference the role token
(`--Primary-Bold`) and let the active theme resolve it. To preview a specific brand,
select it as the active theme; the tokens do the rest.

Each brand may also override foundation knobs (Display/Headline f-steps, line-height
offsets, font slots like `--Typography-Font-Primary`, component border-radii, and
layout personality), but always within the shared token vocabulary above.

## Skills

*(OneUI extension.)*

Three companion skills carry the deep, situational design wisdom. When a request
matches one, compose through it rather than from these rules alone. (In a OneUI
workspace these are installed Claude skills; the summaries below make this file
self-sufficient on its own.)

### surface — surface-level choice
**When:** choosing a section/card/hero/banner background or attention level; placing
components on coloured/dark/brand areas; "what surface should I use?"; auditing
busy/loud UI.
**Essence:** a surface is a choice about *meaning and attention*, not colour. Default
first; escalate only for a real moment (hero/promo → `bold`/`brand-bg`; floating →
`elevated`; genuine local separation type/spacing can't solve → `minimal`/`subtle`/
`moderate`). One loud surface per viewport. The engine computes every colour, so your
only decision is the level. **Authority on surface choice.**

### oneui-design-composition — whole-page composition
**When:** composing pages, layouts, navigation/app structure, choosing components,
applying colour roles, typography, spacing, shape, elevation.
**Essence:** content-first, attention-as-budget, brand restraint, tokens-not-literals.
Owns layout, grid, navigation fundamentals, component selection, and the type/spacing/
shape systems. Hands surface-level choice to `surface`. **Authority on holistic
composition.**

### surface-context — the adaptation mechanism
**When:** building surface-aware components, working with `[data-surface]` token
remapping, debugging invisible components on bold surfaces, understanding token
naming.
**Essence:** how the CSS-only auto-adaptation works under the hood — the intermediate
variable pattern, on-bold content tokens, bold inversion. **Authority on the engine
mechanism.**

---

*OneUI is multi-brand and self-adapting. Choose meaning — the right role, the right
surface level, the right type role — and the engine resolves the rest, accessibly,
across every brand, platform, density, and theme. When in doubt: default surface,
neutral text, one focal point, tokens only.*
