---
name: oneui-design-composition
visibility: public
description: >
  OneUI/Jio design composition philosophy and UI authoring guide — the holistic
  layer that decides how a whole page or screen hangs together. Teaches layout and
  grid, navigation and app structure, component selection, typography, color roles,
  spacing, shape, elevation, motion, and the content-first / attention-as-budget
  philosophy of the OneUI design system. Use this skill when composing pages, building
  layouts, structuring screens, designing navigation (tabs, bottom nav, headers, app
  shell), selecting which component fits a need, applying color roles, picking
  typography styles, deciding spacing or grid, or creating any UI that should follow
  OneUI/Jio conventions. Trigger when the user says "design", "layout", "compose",
  "page structure", "visual hierarchy", "navigation", "nav", "tab bar", "bottom nav",
  "header", "app structure", "which component", "typography", "color role", "spacing",
  "whitespace", "card design", "hero section", "product grid", or asks about
  Apple-like simplicity, content-first design, or Jio brand conventions.
  Even a plain "build a page" / "create a screen" / "add a section" should pull this
  skill in for composition decisions. For the specific decision of WHICH surface
  level to use and WHEN (default vs minimal/subtle/moderate/bold/elevated/brand-bg,
  restraint, tinting rules), defer to the dedicated `surface` skill — this skill
  references it rather than duplicating it. Do NOT use this skill for engine
  internals (the [data-surface] remapping mechanism, CSS generation pipeline, Convex
  schema, brand CSS injection) — use `surface-context` for those.
metadata:
  author: OneUI Studio
  version: 1.2.0
  category: design-composition
---

# OneUI Design Composition Guide

This skill teaches how to compose UI within the OneUI design system. It covers the design philosophy, composition rules, and practical guidance for building pages, screens, and sections that feel simple, content-first, and brand-appropriate.

## When to Load References

- Laying out a specific page type (product listing, settings, dashboard) -> read `references/composition-patterns.md`
- Structuring navigation, app shell, headers, tabs, or bottom nav -> read `references/navigation-patterns.md`
- Need exact token names or values -> read `references/token-quick-reference.md`
- Deciding attention levels for a complex layout -> read `references/attention-level-mapping.md`
- **Deciding WHICH surface level to use and WHEN (default vs bold vs subtle..., restraint, tinting rules) -> use the `surface` skill** (it owns surface-choice judgment; this guide only covers how surfaces fit into overall composition)
- Working with surface token mechanics or `[data-surface]` CSS (the remapping engine) -> use the `surface-context` skill instead
- Working with brand CSS injection, recipes, or multi-brand architecture -> OneUI Studio platform-internal, out of scope for building apps with the published package

---

## 1. Design Philosophy


**Core beliefs:**

1. **Content is hero.** Every pixel exists to serve the content, not to decorate. Default surface (surface = ghost) backgrounds dominate because they let imagery, text, and data breathe. Surface = default (white) remains the outermost wrapper.
2. **Simplicity is the key rule.** If a design feels complex, remove elements until it doesn't. The best interface is the one users never notice.
3. **Brand expression through restraint.** Jio's brand color appears in specific, purposeful moments -- not everywhere. A single bold button on a white page has more impact than a page saturated with color.
4. **Attention is a budget.** Every screen has limited user attention. Spend it on what matters most. Most elements should blend (attention = None/Low). Reserve emphasis for the moments that genuinely matter.
5. **Tokens, never literals.** All visual values come from design tokens (`var(--Token-Name)`). Zero hard-coded colors, pixels, or font names. This ensures brand portability and responsive adaptation.

---

## 2. Composition Principles

### The White Canvas Rule

80-90% of any screen should be `default` surface (white in light mode, near-black in dark mode). This is not absence of design -- it IS the design. Content shines against a neutral backdrop.

### The Attention Pyramid

Distribute visual emphasis like a pyramid. Most elements should be quiet; very few should be loud.

```
         /\
        /  \   High (5%) -- Primary CTA, hero branded moment
       /    \
      /Medium\  (10%) -- Secondary CTAs, active states, emphasis cards
     /________\
    /   Low    \ (25%) -- Cards with subtle fills, secondary actions
   /____________\
  /    None      \ (60%) -- Body text, lists, tables, navigation, headers
 /________________\
```

When this pyramid inverts (everything is bold/colored), the page screams and nothing stands out.

### Composition Rules

1. **One focal point per viewport section.** One primary CTA, one hero element. Never let two bold elements compete.
2. **Headers always use default background.** The header's job is navigation, not brand expression. Keep it clean.
3. **Product/content cards use default background.** Card content (imagery, text, prices) is the hero. Card backgrounds never compete with what's inside them.
4. **Bold surface is an event, not a default.** Use `<Surface mode="bold">` for hero sections, celebration moments, or key brand statements. If everything is bold, nothing is.
5. **Progressive brand disclosure.** Users encounter brand color as they go deeper: default -> subtle -> bold. The homepage is mostly white with strategic accent moments. A detail page might have a bold hero.
6. **Generous whitespace.** The Apple/Airbnb aesthetic comes from breathing room, not tight packing. When in doubt, add more space between sections.

### Choosing a Surface Level → defer to the `surface` skill

Picking *which* surface level a region gets (default vs minimal/subtle/moderate/bold/
elevated/brand-bg), and *when* a non-default surface is even justified, is its own
discipline — the **`surface` skill owns that judgment** (default-first, restraint,
tinting rules, attention budget) and is grounded in the real engine math. From a
composition standpoint you only need the one-line version:

> Start every region on `default`. Escalate to a non-default surface only for a real
> moment — a hero/promo (`bold`/`brand-bg`), a floating element (`elevated`), or
> genuine local separation type/spacing can't solve (`minimal`/`subtle`/`moderate`).
> One loud surface per viewport, max. For anything beyond this, use the `surface` skill.

To fill a Surface with a specific role colour (e.g. a secondary-tinted card instead of the primary-tinted default subtle), override `--Surface-Fill-{Mode}` inline:

```tsx
<Surface
  mode="subtle"
  style={{ '--Surface-Fill-Subtle': 'var(--Secondary-Subtle)' }}
>
  <Slider appearance="secondary" />
</Surface>
```

---

## 3. Surface Usage Guide

> **The `surface` skill is the authority on surface-level choice.** The table below is a
> quick composition-context reference; for any real decision about whether a region
> earns a non-default surface and which level it should be, use that skill. What stays
> firmly in *this* guide is the **mandatory `<Surface>` wrapper rule** below — it's a
> composition safety rule that prevents broken child adaptation.

### 7 Surface Tokens — Quick Reference

One vocabulary, no BG/FG split. Every surface is resolved relative to its parent step.

| Mode | Resolution | Use Case | Example | Frequency |
|------|------------|----------|---------|-----------|
| `default` | Page surface (2500 light / 200 dark) | Page bg, cards, headers, product grids | Main layout, product cards | 70-80% |
| `ghost` | Same step as parent | Same fill as parent but still triggers context remapping | Trigger inversion without visual change | Rare |
| `minimal` | Parent + 1 step toward contrast | Minimal differentiation | Alternating rows, sidebar bg | 5-10% |
| `subtle` | Parent + 2 steps | Section grouping, card backgrounds | Settings section, feature group | 5-10% |
| `moderate` | Parent + 3 steps | Stronger tint without going bold | Promotional card, callout | 2-5% |
| `bold` | Role baseStep (or darkerBaseStep on dark parents) | Brand accent surface, hero, celebration | Hero banner, CTA area, primary button fill | Rare (1-5%) |
| `elevated` | Parent + 1 step toward lighter (capped 2500) | Floating elements | Popover, dropdown, dialog, sheet | Context-dependent |

The same `bold` token is used whether the surface is a hero section or a primary button's fill — context-awareness happens automatically because every surface resolves against its parent step.

### Mandatory Surface Rule

When placing components on ANY non-default background, wrap with `<Surface mode="...">`. Never set background-color manually on a container that holds interactive children — tokens inside a raw `<div>` do not remap.

```tsx
// CORRECT -- Surface triggers [data-surface] token remapping for all children.
<Surface mode="bold">
  <Button variant="bold">Fill stays distinguishable</Button>
  <Button variant="subtle">Tinted fill, readable text</Button>
  <Button variant="ghost">Readable text, no fill</Button>
</Surface>

// WRONG -- children don't adapt, dark text on dark background
<div style={{ background: 'var(--Primary-Bold)' }}>
  <Button variant="ghost">BROKEN: invisible text</Button>
</div>
```

### How `bold` Stays Distinguishable Inside a Bold Surface

On a `<Surface mode="bold">`, an inner `variant="bold"` button would normally be invisible (same fill as surface). Because every surface is resolved relative to its parent step, `--{Role}-Bold` on the inner button resolves at the outer bold container's step, so the inner fill stays distinguishable. `--{Role}-Bold-High` flips to the contrasting extreme of the inner step. No per-component inversion logic, no separate "on-bold" token family at the API boundary.

| Figma attention | Variant | Fill | Text |
|-----------------|---------|------|------|
| High | `bold` | `--{Role}-Bold` | `--{Role}-Bold-High` |
| Medium | `subtle` | `--{Role}-Subtle` | `--{Role}-TintedA11y` |
| Low | `ghost` | transparent | `--{Role}-TintedA11y` |

---

## 4. Color Role Semantics

### The 4 Brand Color Roles (Jio)

Each Jio sub-brand assigns 4 color roles. These roles determine which appearance to use on components.

**Primary (Action Color)**
- Purpose: Orients the customer, directs towards action, signals the brand
- Used on: Logo, primary buttons, navigation indicators, pagination, tab bar active state, progress bars, links
- Default appearance for: `Button`, `FAB`, `IconButton`, `Link`, progress components
- Rule: One primary action per viewport section. Primary color = "this is the thing to do"

**Secondary (Accent Color)**
- Purpose: Communicates priority, accents selective moments, reinforces non-primary CTAs
- Used on: Checkbox/radio/toggle selected states, chips, accordion active, list item indicators, segmented control
- Default appearance for: `Chip`, `Checkbox`, `Radio`, `Switch`
- Rule: Complements primary. Never equal visual weight. Secondary says "here's something worth noting"

**Sparkle (Celebration Color)**
- Purpose: Signals success, promotion, happy outcomes. Spreads joy.
- Used on: Achievement badges, confetti, promotional banners, "gift unlocked" cards, status icons for positive outcomes
- Rule: **Keep rare.** Sparkle loses all meaning if overused. Maximum 1-2 sparkle elements per viewport. Sparkle says "something special happened"

**Brand Surface**
- Purpose: Brand background identity color for branded sections
- Used on: Full-section brand washes, brand identity backgrounds
- Rule: Used for container backgrounds, not individual component fills

### Semantic Roles (Status Communication)

| Role | Purpose | Component Example |
|------|---------|-------------------|
| `positive` | Success, confirmation | Green badge, success toast |
| `negative` | Error, destructive action | Red badge, delete button |
| `warning` | Caution, attention needed | Amber badge, warning banner |
| `informative` | Neutral information | Blue badge, info tooltip |
| `neutral` | De-emphasized, chrome | Gray icon buttons, dividers, tertiary actions |

Never use semantic roles for brand expression. They communicate system status, not brand identity.

---

## 5. Typography Guide

### 6 Roles, 27 Sizes

All typography sizes alias to dimension f-steps: `--Display-L-FontSize: var(--Dimension-f7)`. When platform or density changes, typography cascades automatically.

| Context | Role | Size | Weight | Token Example |
|---------|------|------|--------|---------------|
| Hero/splash headline | Display | L/M | 900 | `--Display-L-FontSize` (f7 = 40px) |
| Page title | Headline | L/M | 900 | `--Headline-L-FontSize` (f4 = 28px) |
| Section heading | Headline S / Title L | S or L | 850/800 | `--Headline-S-FontSize` (f0 = 16px) |
| Card title | Title | M/S | 800/750 | `--Title-M-FontSize` (f0 = 16px) |
| Body paragraph | Body | M | 400 (low) | `--Body-M-FontSize` (f0 = 16px) |
| Emphasized body | Body | M | 700 (high) | `--Body-FontWeight-High` |
| Helper/caption text | Body | S/XS | 400 | `--Body-S-FontSize` (f-1 = 14px) |
| Button label | Label | M/S | 700 (high) | `--Label-M-FontSize` (f0 = 16px) |
| Input label | Label | S/XS | 500 (medium) | `--Label-S-FontSize` (f-1 = 14px) |
| Tab/nav label | Label | M/S | 500 (medium) | `--Label-M-FontSize` |
| Badge text | Label | XS/2XS | 500 | `--Label-XS-FontSize` (f-2 = 12px) |
| Code snippet | Code | M/S | 500 | `--Code-M-FontSize` (f0 = 16px) |

### Key Typography Rules

- **Jio brand**: Always use JioType Var as primary font (`--Typography-Font-Primary`)
- **Display text**: Use negative letter-spacing (`--Typography-LetterSpacing-Tight: -0.02em`) for cinematic headlines
- **Line height offsets**: Display/Headline = tight (offset 0), Title = +1, Body = +3 (relaxed reading), Label = 0 (compact UI), Code = +2
- **Weight hierarchy** (Body/Label/Code): High (700) for emphasis, Medium (500) for default, Low (400) for de-emphasis
- **Fixed weights** (Display/Headline/Title): Per-size assignments (900, 850, 800, 750) -- not emphasis-based
- **Optical sizing**: Enabled on Headline-S and Title-S for better rendering at smaller sizes

---

## 6. Spacing and Layout

### Grid System Per Breakpoint

| Breakpoint | Width | Margin | Gutter | Columns |
|----------|-----------|--------|--------|---------|
| S (Mobile) | 360px | `var(--Grid-Margin)` = 16px | `var(--Grid-Gutter)` = 8px | 4 |
| M (Tablet) | 768px | 24px | 12px | 8 |
| L (Desktop) | 1440px | 32px | 16px | 12 |

Use `var(--Spacing-Margin)` and `var(--Spacing-Gutter)` for page-level margins and gutters -- they automatically adapt to the active platform.

### Spacing Selection Guide

Spacing tokens are **numeric** — the suffix is the value in quarter-units (`--Spacing-N` ≈ N×4px at base density). There are no T-shirt names.

| Use Case | Token | Mobile Default |
|----------|-------|----------------|
| Micro gap (icon to text) | `--Spacing-1` (f-6) | 4px |
| Small gap (between chips) | `--Spacing-2` (f-4) | 8px |
| Tight padding (compact button) | `--Spacing-2-5` (f-3) | 10px |
| Standard padding | `--Spacing-4` (f0) | 16px |
| Between components | `--Spacing-4-5` to `--Spacing-6` | 18-24px |
| Between card groups | `--Spacing-7` to `--Spacing-8` | 28-32px |
| Section gap | `--Spacing-9` to `--Spacing-12` | 36-48px |
| Major page separator | `--Spacing-14` to `--Spacing-18` | 56-72px |

### Whitespace Philosophy

When in doubt, add more whitespace. The spacious, Apple-like aesthetic comes from generous breathing room between elements. Tight packing signals density and complexity -- avoid it unless the use case genuinely demands it (data tables, compact toolbars).

---

## 7. Navigation and App Structure

Navigation is the skeleton of a composition — get it wrong and nothing else lands. The fundamentals below cover the whole-page structure; the full inventory, breakpoint shell model, and worked patterns live in `references/navigation-patterns.md` (read it when building real nav).

### Use the navigation components that exist

OneUI ships these — compose with them, don't hand-roll nav from raw divs (you'd lose `aria-current`, focus, and touch targets):

| Need | Component | Notes |
|------|-----------|-------|
| Switch views *within one screen* | `Tabs` | Compound; horizontal/vertical; active = role accent + sliding indicator. NOT for top-level app destinations |
| Top-level destinations on **mobile** | `BottomNavigation` + `BottomNavItem` | 2–5 destinations; active = content `high`, inactive = `low` |
| Top app bar + nav on **larger screens** | `WebHeader` (`.PrimaryNav` / `.SecondaryNav` / `.Item`) | Responsive; collapses to `MobileDrawer` at small breakpoints |
| Dropdown / grouped link nav | `NavigationMenu` | Compound mega-menu |
| Overflow / context actions | `Menu` | Not primary navigation |
| View-mode / filter switch | `ToggleGroup` | A toggle, not navigation (grid vs list) |
| Paged results | `Pagination` | `attention` + `appearance` props |
| Inline / standalone text nav | `Link` (`<a>`) / `LinkButton` (`<button>`) | |

**Does not exist — compose, don't hallucinate:** Breadcrumb (build from `Link` + separators), Sidebar/NavRail (compose from vertical `Tabs` or a `Link` column), AppBar (use `WebHeader`). And `Stepper` is a numeric input, **not** a step indicator.

### The fundamentals (apply every time)

1. **Swap the shell by breakpoint.** One primary navigation per breakpoint: `BottomNavigation` on mobile (S), `WebHeader.PrimaryNav` on desktop (L). Never show a bottom nav *and* a full header nav at once — that's two competing maps.
2. **Active = `primary` role; inactive = neutral.** Mark the current location with the primary accent + `aria-current="page"`. Never use `secondary` to signal active nav. One unambiguous "you are here" per surface.
3. **Navigation is None/Low attention.** Users look *through* the nav to reach content. It sits at the bottom of the attention pyramid — don't spend bold surfaces or brand color on the chrome.
4. **Headers stay on the `default` surface.** A header is wayfinding, not brand expression. (For any non-default header/nav surface question, the `surface` skill is the authority — but the default answer for nav chrome is `default`.)
5. **Nav labels use the `Label` role** at Medium weight — never Body or Display.
6. **2–5 top-level destinations.** More than that means the information architecture is too flat — group and use overflow, don't cram.

For the breakpoint shell table, active-state details, accessibility specifics, and worked TSX (mobile shell, in-screen tabs, composed breadcrumb), see `references/navigation-patterns.md`.

## 8. Component Selection Guide

### Action Components

| Need | Component | Variant | Appearance | Notes |
|------|-----------|---------|------------|-------|
| Primary CTA | `Button` | `bold` | `primary` | One per viewport section |
| Secondary action | `Button` | `subtle` | `primary` or `secondary` | |
| Tertiary/cancel | `Button` | `ghost` | `neutral` | |
| Icon-only (toolbar) | `IconButton` | `high`/`medium`/`low` | `neutral` | Always provide `aria-label` |
| Floating action | `FAB` | `primary`/`secondary` | `primary` | Position fixed/sticky |
| Text navigation | `Link` / `LinkButton` | `default` | -- | Inline or standalone |
| Destructive action | `Button` | `bold` or `subtle` | `negative` | Red accent signals danger |
| Success confirmation | `Button` | `bold` | `positive` | Green accent |

### Selection & Filter Components

| Need | Component | Notes |
|------|-----------|-------|
| Toggleable filter | `Chip` | Default appearance = `secondary`. Use `bold` for selected state |
| Category selector | `Chip` group | Horizontal scroll on mobile |
| Status indicator | `Badge` | Use semantic roles (`positive`/`negative`/`warning`) |
| Count | `CounterBadge` | Numeric content only |
| User identity | `Avatar` | `image`/`icon`/`text` content modes, 2xs-2xl sizes |

### Form Components

| Need | Component | Notes |
|------|-----------|-------|
| Boolean toggle | `Switch` | Secondary color role |
| Single choice (few options) | `Radio` | Secondary color role |
| Multi choice (few options) | `Checkbox` | Secondary color role |
| Numeric adjustment | `Stepper` | Small +/- controls |

### Content Components

| Need | Component |
|------|-----------|
| Section divider | `Divider` |
| Brand mark | `Logo` |
| Media display | `Image` |
| Content card layout | `ContentBlock` |

---

## 9. Shape System

Shape tokens derive from dimension f-steps, so they respond to platform and density automatically.

Shape tokens are **numeric** (`--Shape-0` … `--Shape-10`, same N×4px convention) plus the standalone `--Shape-Pill` (9999px). There are no T-shirt names.

| Element Type | Token | Jio Default | Reason |
|-------------|-------|-------------|--------|
| Buttons | `var(--Shape-Pill)` | 9999px | Pill = maximum friendliness, Jio identity |
| Icon buttons | `var(--Shape-Pill)` | 9999px | Circular for tappability |
| Chips | `var(--Shape-Pill)` | 9999px | Pill for filter chips |
| Avatars | `var(--Shape-Pill)` | 9999px | Always circular |
| Inputs, selects | `var(--Shape-2)` (f-4) | 8px | Subtle rounding, container feel |
| Small cards | `var(--Shape-4)` (f0) | 16px | Moderate rounding |
| Large containers | `var(--Shape-4-5)` to `--Shape-6` | 18-24px | Gentle rounding |
| FAB | `var(--Shape-4)` (f0) | 16px | Rounded square, not pill |
| Modals/sheets | `var(--Shape-4-5)` or larger | 18px+ | Soft corners |
| Sharp edges | `var(--Shape-0)` | 0px | Dividers, full-bleed sections |

Rule: Components define their default shape via `--ComponentName-borderRadius`, overridable per brand. `--Shape-Pill` is a standalone constant — NOT part of the numeric scale.

---

## 10. Elevation and Depth

Prefer surface differentiation over shadows. Shadows are for functional hierarchy (floating elements), not decoration.

| Level | Token | Use Case |
|-------|-------|----------|
| 0 | `--Elevation-0` (none) | Default state, flat UI (80%+ of elements) |
| 1 | `--Elevation-1` | Subtle lift: sticky header, card hover |
| 2 | `--Elevation-2` | Medium lift: floating card, tooltip |
| 3 | `--Elevation-3` | FAB, popover, dropdown menu |
| 4 | `--Elevation-4` | FAB hover, emphasized floating |
| 5 | `--Elevation-5` | Modal overlay, bottom sheet |

**Rules:**
- Use `<Surface mode="minimal">` or `<Surface mode="subtle">` to visually separate sections before reaching for shadows
- Most UI lives at Elevation-0. Apple-like flat design uses surface color differences, not shadows
- Dark mode: elevation uses slightly lighter surface (the system handles this via theme tokens)
- Two-shadow formula per level: sharp key light + soft ambient light

---

## 11. Responsive Behavior

The system uses **discrete platform breakpoints** (not fluid clamp). All dimensions, spacing, typography, and shape adapt via the f-step cascade.

| Breakpoint | Base Scale (f0) | Touch Target | Key Layout Change |
|----------|----------------|--------------|-------------------|
| S | 16px | 44px | 4-col grid, stacked layouts, full-bleed |
| M | 18px | 44px | 8-col grid, sidebar navigation |
| L | 18px | 44px | 12-col grid, full desktop, generous whitespace |

**Density** (compact/default/open) shifts all f-step values by -1/0/+1 step. Compact = tighter UI for power users. Open = roomier UI for content-focused experiences.

All responsive adaptation happens through CSS tokens -- no media query breakpoints in component CSS. The `[data-Breakpoint]` and `[data-6-Density]` attributes on `<html>` control which dimension values are active.

---

## 12. CSS Token Pattern

All component CSS follows the **role-agnostic intermediate variable** pattern, using the unified role-explicit tokens (`--{Role}-Bold`, `--{Role}-Subtle`, `--{Role}-Bold-High`, etc.):

```css
.component {
  /* 1. Intermediate vars -- default = Primary role */
  --_comp-fill: var(--Primary-Bold);
  --_comp-text: var(--Primary-Bold-High);

  /* 2. Consume intermediates */
  background-color: var(--_comp-fill);
  color: var(--_comp-text);
  border-radius: var(--Shape-Pill);
  padding: var(--Spacing-2-5) var(--Spacing-5);
  font-size: var(--Label-M-FontSize);
  font-weight: var(--Label-FontWeight-High);
}

/* 3. Appearance classes remap intermediates to other roles */
.appearanceNeutral {
  --_comp-fill: var(--Neutral-Bold);
  --_comp-text: var(--Neutral-Bold-High);
}

/* 4. Variant selectors consume intermediates -- zero duplication */
.bold { background-color: var(--_comp-fill); }
.subtle { background-color: var(--Primary-Subtle); }
.ghost { background-color: transparent; }
```

### Zero Literals Rule

No hex colors, no pixel values (except `0`, `9999px`, `100%`), no font names directly in CSS. Everything via `var(--Token-Name)`. Enforced by `pnpm check:literals`.

<!-- INTENTIONAL-LEGACY-VOCAB: this section names legacy aliases so the model
     knows them as deprecated. Do NOT use them in new generation. -->
### Token Naming

Reach for the role-explicit unified tokens first: `--Primary-Bold`, `--Primary-Subtle`, `--Primary-High`, `--Primary-Bold-High`, `--Primary-TintedA11y`, etc. Legacy aliases (`--Primary-FG-Bold`, `--Surface-Bold`, `--Text-High`) are still emitted for backward compatibility but new code should not reach for them as primaries.

---

## 13. Do's and Don'ts

### Do

- Use `<Surface>` for any non-default background containing interactive children
- Use `default` surface for most UI: headers, cards, product grids, lists
- Follow the attention pyramid: None (60%) > Low (25%) > Medium (10%) > High (5%)
- Use one primary CTA per viewport section
- Use semantic color roles (`positive`/`negative`/`warning`/`informative`) for status -- not brand roles
- Use `Label` role for all interactive element text (buttons, chips, tabs, nav items)
- Use generous whitespace between sections -- more is almost always better
- Use `var(--Spacing-Margin)` and `var(--Spacing-Gutter)` for page margins and gutters
- Keep Sparkle rare -- maximum 1-2 elements per viewport
- Let content (imagery, text, data) be the hero on product cards

### Don't

- Use bold surfaces everywhere -- it makes nothing stand out
- Put brand color on headers -- headers are for navigation
- Use Display or Headline roles for button text -- buttons use Label role
- Use elevation when surface differentiation (`minimal`/`subtle`) suffices
- Hard-code colors, sizes, or fonts -- use tokens exclusively
- Use Sparkle role for common UI elements -- reserve for celebration moments
- Compete with content -- if photography is hero, reduce surrounding UI chrome
- Use `bold` without a `<Surface>` wrapper -- breaks child adaptation
- Use more than 3 different surface modes on the same page -- keep it simple
- Set `background-color` manually on containers with interactive children
<!-- INTENTIONAL-LEGACY-VOCAB: this Don't-list rule names legacy aliases so the
     model can recognise and avoid them. -->
- Reach for legacy `--*-FG-Bold`, `--*-BG-Subtle`, `--Surface-Bold`, `--Text-High` tokens in new code -- use the unified `--{Role}-Bold`, `--{Role}-Subtle`, `--{Role}-High`, `--{Role}-Bold-High` instead

---

## 14. Cross-Skill Integration

There are three distinct surface-related skills — keep their jobs separate:

- **`surface`** — *when/which/why* a surface level is used (design judgment, restraint). The authority on surface choice.
- **`surface-context`** — *how* surfaces work under the hood (the `[data-surface]` token-remapping engine, building surface-aware components, debugging invisible elements).
- **`oneui-design-composition`** (this skill) — *how surfaces fit into the whole page* alongside layout, type, spacing, components.

| Working On | Use This Skill | Plus |
|------------|---------------|------|
| Page layout, overall UI composition | `oneui-design-composition` | -- |
| Which surface level / when to use a non-default surface | `surface` (primary) | This for how it fits the page |
| Surface token mechanics, `[data-surface]` CSS, surface-aware component CSS | `surface-context` (primary) | -- |
| Debugging surface adaptation (invisible element on bold) | `surface-context` (primary) | -- |
| Brand theming, recipe system, CSS injection | This for visual guidelines | platform-internal (out of scope) |
| Component CSS internals | This for conventions | Read the component's `.module.css` directly |
| Brand CSS injection pipeline | -- | platform-internal (out of scope) |
