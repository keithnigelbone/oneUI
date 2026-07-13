---
version: alpha
oneui-version: 1
name: One UI Theme
description: Platform default theme — configure component tokens for the baseline One UI look.
colors:
  primary: "#868686"
  primary-bold: "#5D5D5D"
  primary-subtle: "#DEDEDE"
  primary-bold-hover: "#4D4D4D"
  on-primary-bold: "#FFFFFF"
  on-primary-subtle: "#5D5D5D"
  secondary: "#868686"
  neutral-page: "#FFFFFF"
  neutral-bold: "#000000"
  text-high: "#000000"
  text-medium: "#1C1C1C"
  text-low: "#474747"
  text-on-bold-high: "{colors.on-primary-bold}"
typography:
  display-l:
    fontFamily: Inter
    fontSize: 2.5rem
    fontWeight: 900
    lineHeight: 2.5rem
  display-m:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: 900
    lineHeight: 2.25rem
  headline-l:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: 900
    lineHeight: 1.75rem
  headline-m:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: 900
    lineHeight: 1.25rem
  title-m:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 800
    lineHeight: 1.125rem
  title-s:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 750
    lineHeight: 0.875rem
  body-m:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5rem
  body-s:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.25rem
  label-m:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1rem
  label-s:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 0.875rem
  code-m:
    fontFamily: JetBrains Mono
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.25rem
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 24px
  2xl: 32px
  pill: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-bold:
    backgroundColor: "{colors.primary-bold}"
    textColor: "{colors.on-primary-bold}"
    rounded: "{rounded.pill}"
    padding: 12px
    typography: "{typography.label-m}"
  button-bold-hover:
    backgroundColor: "{colors.primary-bold-hover}"
  button-subtle:
    backgroundColor: "{colors.primary-subtle}"
    textColor: "{colors.on-primary-subtle}"
    rounded: "{rounded.pill}"
    padding: 12px
    typography: "{typography.label-m}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.on-primary-subtle}"
    rounded: "{rounded.pill}"
    padding: 12px
  card-default:
    backgroundColor: "{colors.neutral-page}"
    rounded: "{rounded.lg}"
    padding: 16px
---

## Overview

Platform default theme — configure component tokens for the baseline One UI look.

Apply by brand vertical:
- **E-commerce**: Product grids, image-first cards, one CTA per card, sticky cart bar
- **Entertainment**: Immersive imagery, dark mode, horizontal scroll thumbnails
- **Finance**: Data-dense, tables, trust signals, conservative spacing, form-heavy
- **Governance**: Formal, high readability, conservative color, accessibility-first
- **Farm**: Simple, large touch targets, icon-heavy, offline-friendly
- **IoT**: Dashboard widgets, real-time data, compact density, color-coded states
- **Telecom**: Plan comparison, usage meters, promo heroes

## Colors

Primary (`#868686`) is the single interaction driver. Use `primary-bold` only on the top-attention element per viewport; `primary-subtle` is the medium-attention fill. `secondary` is chrome, not decoration. Positive / negative / warning / informative are reserved for status signalling only.

4 brand color roles:
- **Primary**: Action color. Buttons, nav indicators, links. One primary action per viewport.
- **Secondary**: Accent. Checkboxes, toggles, chips. Complements primary.
- **Sparkle**: Celebration. Rare — max 1-2 per viewport.
- **Neutral**: Chrome. Gray buttons, dividers, tertiary actions.

Semantic roles (never for brand expression):
- positive: success (green)
- negative: error/destructive (red)
- warning: caution (amber)
- informative: info (blue)

## Typography

Inter carries the full hierarchy; JetBrains Mono is reserved for code surfaces. Weights follow the emphasis system: display/headline/title are always 800+; body defaults to 400 (low emphasis); label uses 500 (medium) for UI chrome. Line heights are relational — generated from dimension f-steps so platform and density can shift the whole scale at once. Always pair a size token with its matching line-height token.

All typography sizes alias to dimension f-steps. Always include font-family: var(--Typography-Font-Primary) on every text element.

Context → role mapping:
- Hero/splash headline: Display L/M (f7/f5, weight 900)
- Page title: Headline L/M (f4/f2, weight 900)
- Section heading: Title L/M (f1/f0, weight 800)
- Card title: Title M/S (f0/f-1, weight 800/750)
- Body paragraph: Body M (f0, weight 400 low)
- Helper/caption: Body S/XS (f-1/f-2, weight 400)
- Button label: Label M/S (f0/f-1, weight 700 high)
- Input label: Label S/XS (f-1/f-2, weight 500 medium)
- Badge text: Label XS/2XS (f-2/f-3, weight 500)

Always pair a line-height token with every font-size token. Use role-specific tokens (--Body-M-FontSize) not legacy (--Typography-Size-M).

## Text colour rules (readability on default surface)

Secondary / supporting text on a default (white) card MUST use
`var(--Primary-Default-Medium-Text)` or `var(--Text-Medium)`. NEVER use
`--Text-Low` or `--Primary-Default-Low-Text` for copy the user is expected
to read (subtitles, field labels, helper text, SSO row labels).

Low-emphasis tokens are reserved for:
- Placeholder text already supplied by the component (don't restate).
- Disabled states only.
- Timestamps or metadata beside a primary label (never the primary line itself).

When in doubt: prefer Medium over Low. Washed-out copy reads as broken.

## Case rules (Jio brand)
- NEVER use UPPERCASE for section labels, badges, chips, table headers, or tab labels.
- NEVER apply CSS `text-transform: uppercase` or wide `letter-spacing` for "caps" effects.
- NEVER write headings in all caps ("ORDERS & DELIVERY" is wrong — use "Orders & delivery").
- Use Sentence case for section headings and card titles ("Orders and delivery", not "Orders And Delivery").
- Only proper nouns retain capitalisation (JioMart, JioCinema, Diwali).
- Button labels use Sentence case: "Enable notifications", not "ENABLE NOTIFICATIONS".
- Badge text uses lowercase or Sentence case: "new", "Featured", never "NEW".

## Layout

Mobile-first scale (4 / 8 / 16 / 24 / 32 / 48 px). Touch targets ≥ 44×44 on mobile, 24×24 on desktop. Use `spacing.md` between related items, `spacing.xl`–`spacing.2xl` between major sections. Never mix spacing scales within a single view.

Every screen should have clear sections. Use element nodes as section containers:

1. **Header section** — Avatar + title, or Image hero, or just a heading area
2. **Content section** — The main interactive area (forms, lists, cards)
3. **Action section** — Primary CTA at bottom, secondary actions above

Layout patterns for element nodes:
- **Vertical stack**: { "display": "flex", "flexDirection": "column", "gap": "var(--Spacing-4)" }
- **Horizontal row**: { "display": "flex", "flexDirection": "row", "gap": "var(--Spacing-4)", "alignItems": "center" }
- **Space between row**: { "display": "flex", "justifyContent": "space-between", "alignItems": "center" }
- **Centered content**: { "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "var(--Spacing-4-5)" }

Use the spacing token hierarchy consistently:
- Between major sections: var(--Spacing-5) or var(--Spacing-6)
- Between related items: var(--Spacing-4)
- Between tightly coupled elements: var(--Spacing-3-5) or var(--Spacing-3)
- Micro gap (icon to text): var(--Spacing-1)
- Small gap (between chips): var(--Spacing-2)
- Standard padding: var(--Spacing-4)
- Between card groups: var(--Spacing-7) to var(--Spacing-8)
- Section gap: var(--Spacing-9) to var(--Spacing-12)
- Page margins: var(--Spacing-Margin)
- Grid gutters: var(--Spacing-Gutter)

Whitespace philosophy: When in doubt, add more whitespace. The spacious, Apple-like aesthetic comes from generous breathing room between elements.

Grid: Mobile 4col, Tablet 8col, Desktop 12col.
Use var(--Spacing-Margin) and var(--Spacing-Gutter) — they auto-adapt.

Column transitions: 1 (mobile/focused), 2 (tablet/comparison), 3+ (desktop/grids).

## Elevation & Depth

Elevation is a two-shadow formula (levels 0–5). Dark mode uses a 1 px stroke in place of a shadow. Prefer elevation 0 on content cards — the surface tint already conveys grouping. Motion durations follow a discreet (quick) / expressive (emphatic) timing split; never hardcode ms values.

Motion: Discreet (quick, functional) for UI, Expressive (noticeable, branded) for emphasis.
Elevation: 0 (flat default), 1-2 (cards/dropdowns), 3 (dialogs), 4-5 (rare dramatic overlays).
Use elevation sparingly. Most elements level 0.

## Shapes

Buttons are pill-shaped (`rounded.pill`). Inputs, chips, selects use `rounded.sm` (4 px). Cards use `rounded.lg` (16 px). Avatars are fully circular. Never mix shape scales on a single screen.

## Components

Buttons come in three attention levels that map directly to surface modes: `bold` (high), `subtle` (medium), `ghost` (low). Inside a `<Surface mode="bold">` container the same three tokens automatically remap for contrast — never swap colours manually.

Common micro-patterns:

**Setting row** (label + switch):
{ kind: "element", tag: "div", props: { "style": { "display": "flex", "justifyContent": "space-between", "alignItems": "center" } },
  children: [text, Switch] }

**Button pair** (primary + secondary):
Vertical: high CTA (fullWidth) on top, low LinkButton below. Gap: var(--Spacing-3-5).

**Profile header** (avatar + text):
Horizontal row with Avatar (xl) + text stack. Gap: var(--Spacing-4).

Action component selection (Figma attention level → Button variant):
- High attention / Primary CTA: variant="bold" appearance="primary" (one per viewport)
- Medium attention / Secondary: variant="subtle" appearance="primary" or "secondary"
- Low attention / Tertiary: variant="ghost" appearance="neutral"
- Icon-only: IconButton with aria-label
- Navigation: LinkButton
- Destructive: variant="bold" or "subtle" appearance="negative"

## Do's and Don'ts

**Do:** wrap branded heroes in `<Surface mode="bold">`. Let buttons inside inherit. Stay on the token scale.

**Don't:** set `background` on a raw `<div>` and expect child colours to adapt — they won't. Don't add decorative strokes to tinted cards: the fill is the boundary. Don't skip typography tokens for "just one" micro-copy — the brand font-family cascade will silently drop.

- Focus order follows visual reading order
- Touch targets: 44×44px mobile, 24×24px desktop minimum
- Color never the only way to convey information
- WCAG AA contrast (4.5:1 normal text, 3:1 large text)
- Sequential heading hierarchy (h1 → h2 → h3)
- Images need meaningful alt text
- IconButton needs aria-label
- Use semantic HTML (section, header, main, nav)

Headers always use default background.

Mobile: Bottom tab bar (4-5 items), stack navigation, sheet/modal for contextual actions.
Web: WebHeader component, sidebar for deep hierarchies, breadcrumbs, tab groups.

Navigation should never compete with content for attention.

## Surfaces

*(OneUI extension — not part of canonical `design.md`. Preserved by the linter.)*

Seven surface tokens, each resolved relative to the parent's step:

- `default` — page surface; step 2500 light / 100 dark.
- `ghost` — same step as parent (still triggers context remapping).
- `minimal` — parent + 1 step toward contrast.
- `subtle` — parent + 2 steps.
- `moderate` — parent + 3 steps.
- `bold` — role's baseStep; dramatic.
- `elevated` — parent + 1 step toward lighter; floating panels.

## Surface Context

*(OneUI extension.)*

Components adapt automatically via CSS token remapping when placed inside `<Surface mode="...">`. A raw `<div>` with `background:` is outside this cascade and will leave child components with broken contrast (e.g. dark text on a dark bold surface). **Always use `<Surface>` for non-default backgrounds.**

80-90% of any screen should be default surface. Content shines against a neutral backdrop.

Surface mode decision tree (one vocabulary, no BG/FG split):
- Page background → default
- Card or panel → default (content is hero)
- Alternating rows / sidebar → minimal
- Grouped section with boundary → subtle
- Stronger emphasis without going bold → moderate
- Hero or branded moment → bold
- Floating element (menu, popover, sheet) → elevated

To fill a Surface with a specific role colour, override --Surface-Fill-{Mode} inline:
`<Surface mode="subtle" style={{ '--Surface-Fill-Subtle': 'var(--Secondary-Subtle)' }}>`
Children with appearance="secondary" then resolve correctly via the [data-surface] cascade.

Bold surface is an event, not a default. ALWAYS use <Surface mode="..."> for non-default backgrounds. Never set background-color manually on containers with interactive children — tokens inside a raw div do not remap.

## Attention Hierarchy

*(OneUI extension.)*

Per viewport, aim for: **5 %** high-attention (one bold element), **10 %** medium-attention (2–3 subtle tints), **25 %** low-attention (chrome, links), **60 %** no-attention (page, body, whitespace). If two elements compete for "high", the page is already broken — demote one.

Distribute visual emphasis like a pyramid:
- **High (5%)** — Primary CTA, hero branded moment. ONE per screen.
- **Medium (10%)** — Secondary CTAs, active states, emphasis cards
- **Low (25%)** — Cards with subtle fills, secondary actions
- **None (60%)** — Body text, lists, tables, navigation, headers

One focal point per viewport section. Never let two bold elements compete.

Appearances: primary for main actions, neutral for settings, positive for success, negative for destructive.

