---
name: oneui-design-composition
description: >
  OneUI/Jio design composition philosophy and UI authoring guide. Teaches how to
  compose layouts, select components, apply surfaces, use typography, color roles,
  spacing, shape, elevation, and motion correctly within the OneUI design system.
  Use this skill when composing pages, building layouts, making visual design
  decisions, selecting components, choosing surface modes, applying color roles,
  picking typography styles, deciding on spacing or grid, determining attention
  levels, or creating any UI that should follow OneUI/Jio design conventions. Also
  trigger when user says "design", "layout", "compose", "page structure", "visual
  hierarchy", "attention level", "which component", "which surface", "which
  typography", "color role", "spacing", "whitespace", "card design", "hero section",
  "product grid", or asks about Apple-like simplicity, content-first design, or Jio
  brand design conventions. Even if the user just asks to "build a page" or "create
  a screen" or "add a section", use this skill to guide composition decisions. Do
  NOT use for engine internals (CSS generation pipeline, Convex schema, brand CSS
  injection mechanics) -- use surface-context or oneui-multi-brand skills for those.
metadata:
  author: OneUI Studio
  version: 1.0.0
  category: design-composition
---

# OneUI Design Composition Guide

This skill teaches how to compose UI within the OneUI design system. It covers the design philosophy, composition rules, and practical guidance for building pages, screens, and sections that feel simple, content-first, and brand-appropriate.

## When to Load References

- Laying out a specific page type (product listing, settings, dashboard) -> read `references/composition-patterns.md`
- Need exact token names or values -> read `references/token-quick-reference.md`
- Deciding attention levels for a complex layout -> read `references/attention-level-mapping.md`
- Working with surface token mechanics or `[data-surface]` CSS -> use the `surface-context` skill instead
- Working with brand CSS injection, recipes, or multi-brand architecture -> use the `oneui-multi-brand` skill instead

---

## 1. Design Philosophy

The OneUI design language is built on a simple principle: **the interface should be invisible so the content can shine.** This draws from three design traditions:

- **Apple**: Cinematic minimalism. Product reverence. The UI retreats until it becomes invisible.
- **Airbnb**: Photography-first. White canvas with warm, singular accent moments.
- **Uber**: Confident restraint. Pill shapes everywhere. Zero gradients. Transit-map efficiency.

**Core beliefs:**

1. **Content is hero.** Every pixel exists to serve the content, not to decorate. Default (white) backgrounds dominate because they let imagery, text, and data breathe.
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
4. **Bold surface is an event, not a default.** Use `fg-bold` or `bg-bold` for hero sections, celebration moments, or key brand statements. If everything is bold, nothing is.
5. **Progressive brand disclosure.** Users encounter brand color as they go deeper: default -> subtle -> bold. The homepage is mostly white with strategic accent moments. A detail page might have a bold hero.
6. **Generous whitespace.** The Apple/Airbnb aesthetic comes from breathing room, not tight packing. When in doubt, add more space between sections.

### Surface Mode Decision Tree

```
Is this a page background?
  -> default

Is this a card or panel?
  -> default (most cases -- content is hero)
  -> bg-minimal (alternating rows or sidebar needing subtle differentiation)
  -> bg-subtle (grouped section needing clear visual boundary)

Is this a hero or branded moment?
  -> Use <Surface mode="fg-bold"> (brand accent background + child component adaptation)
  -> Use <Surface mode="bg-bold"> (brand-colored container section)

Is this a floating element (popover, dialog, dropdown)?
  -> elevated

Does a container need minimal/subtle tint?
  -> bg-minimal (barely visible, grouping)
  -> bg-subtle (noticeable tint, card fill)
```

---

## 3. Surface Usage Guide

### 8 Surface Modes — When to Use Each

| Mode | Category | Use Case | Example | Frequency |
|------|----------|----------|---------|-----------|
| `default` | BG | Page bg, cards, headers, product grids | Main layout, product cards | 70-80% |
| `bg-minimal` | BG | Minimal differentiation | Alternating rows, sidebar bg | 5-10% |
| `bg-subtle` | BG | Section grouping, card backgrounds | Settings section, feature group | 5-10% |
| `bg-bold` | BG | Brand-colored container sections | Hero banner, brand section | Rare (1-3%) |
| `elevated` | BG | Floating elements | Popover, dropdown, dialog, sheet | Context-dependent |
| `fg-minimal` | FG | Minimal component fill | Tag bg, subtle indicator | Rare |
| `fg-subtle` | FG | Medium component fill | Active tab bg, chip fill | Rare |
| `fg-bold` | FG | Bold accent container or fill | Hero section, CTA area, celebration | Rare (2-5%) |

### Mandatory Surface Rule

When placing components on ANY non-default background, wrap with `<Surface mode="...">`. Never set background-color manually on a container that holds interactive children.

```tsx
// CORRECT -- Surface triggers [data-surface] token remapping for all children
<Surface mode="fg-bold">
  <Button variant="bold">Tinted accent fill (bold inversion)</Button>
  <Button variant="ghost">White text + visible border</Button>
</Surface>

// WRONG -- children don't adapt, dark text on dark background
<div style={{ background: 'var(--Primary-FG-Bold)' }}>
  <Button variant="ghost">BROKEN: invisible text</Button>
</div>
```

### Bold Inversion

On `fg-bold` or `bg-bold` surfaces, a bold button would normally be invisible (same fill as surface). The system automatically applies **brand bold inversion**: the button fill shifts to a tinted accent (base color + 8 steps), and text shifts to the inversion's on-colour. No manual overrides needed.

| Button Variant | On Default Surface | On FG-Bold Surface |
|---------------|-------------------|-------------------|
| `bold` | Brand accent fill, white text | Tinted accent fill, contrasting text |
| `subtle` | Pastel tint fill, accent text | Semi-transparent white fill, white text |
| `ghost` | Transparent, accent text | Transparent, white text + light border |

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

| Use Case | Token | Mobile Default |
|----------|-------|----------------|
| Micro gap (icon to text) | `--Spacing-5XS` (f-6) | 4px |
| Small gap (between chips) | `--Spacing-3XS` (f-4) | 8px |
| Tight padding (compact button) | `--Spacing-2XS` (f-3) | 10px |
| Standard padding | `--Spacing-M` (f0) | 16px |
| Between components | `--Spacing-L` to `--Spacing-2XL` | 18-24px |
| Between card groups | `--Spacing-3XL` to `--Spacing-4XL` | 28-32px |
| Section gap | `--Spacing-5XL` to `--Spacing-7XL` | 36-48px |
| Major page separator | `--Spacing-8XL` to `--Spacing-10XL` | 56-72px |

### Whitespace Philosophy

When in doubt, add more whitespace. The spacious, Apple-like aesthetic comes from generous breathing room between elements. Tight packing signals density and complexity -- avoid it unless the use case genuinely demands it (data tables, compact toolbars).

---

## 7. Component Selection Guide

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

## 8. Shape System

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

Rule: Components define their default shape via `--ComponentName-borderRadius`, overridable per brand.

---

## 9. Elevation and Depth

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
- Use `bg-minimal` or `bg-subtle` to visually separate sections before reaching for shadows
- Most UI lives at Elevation-0. Apple-like flat design uses surface color differences, not shadows
- Dark mode: elevation uses slightly lighter surface (the system handles this via theme tokens)
- Two-shadow formula per level: sharp key light + soft ambient light

---

## 10. Responsive Behavior

The system uses **discrete platform breakpoints** (not fluid clamp). All dimensions, spacing, typography, and shape adapt via the f-step cascade.

| Breakpoint | Base Scale (f0) | Touch Target | Key Layout Change |
|----------|----------------|--------------|-------------------|
| S | 16px | 44px | 4-col grid, stacked layouts, full-bleed |
| M | 18px | 44px | 8-col grid, sidebar navigation |
| L | 18px | 44px | 12-col grid, full desktop, generous whitespace |

**Density** (compact/default/open) shifts all f-step values by -1/0/+1 step. Compact = tighter UI for power users. Open = roomier UI for content-focused experiences.

All responsive adaptation happens through CSS tokens -- no media query breakpoints in component CSS. The `[data-Breakpoint]` and `[data-6-Density]` attributes on `<html>` control which dimension values are active.

---

## 11. CSS Token Pattern

All component CSS follows the **role-agnostic intermediate variable** pattern:

```css
.component {
  /* 1. Intermediate vars -- default = Primary role */
  --_comp-fill: var(--Primary-FG-Bold, var(--Surface-Bold));
  --_comp-text: var(--Primary-FG-Bold-High, var(--Text-OnBold-High));

  /* 2. Consume intermediates */
  background-color: var(--_comp-fill);
  color: var(--_comp-text);
  border-radius: var(--Shape-Pill);
  padding: var(--Spacing-5XS) var(--Spacing-XL);
  font-size: var(--Label-M-FontSize);
  font-weight: var(--Label-FontWeight-High);
}

/* 3. Appearance classes remap intermediates to other roles */
.appearanceNeutral {
  --_comp-fill: var(--Neutral-FG-Bold, var(--Surface-Bold));
  --_comp-text: var(--Neutral-FG-Bold-High, var(--Text-OnBold-High));
}

/* 4. Variant selectors consume intermediates -- zero duplication */
.bold { background-color: var(--_comp-fill); }
.subtle { background-color: var(--Primary-BG-Subtle, var(--Surface-Subtle)); }
.ghost { background-color: transparent; }
```

### Zero Literals Rule

No hex colors, no pixel values (except `0`, `9999px`, `100%`), no font names directly in CSS. Everything via `var(--Token-Name)`. Enforced by `pnpm check:literals`.

### Fallback Chain

Always include a legacy fallback: `var(--Primary-FG-Bold, var(--Surface-Bold))`. This ensures components render correctly even without brand CSS injection (Storybook, tests, bare renders).

---

## 12. Do's and Don'ts

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
- Use elevation when surface differentiation (`bg-minimal`/`bg-subtle`) suffices
- Hard-code colors, sizes, or fonts -- use tokens exclusively
- Use Sparkle role for common UI elements -- reserve for celebration moments
- Compete with content -- if photography is hero, reduce surrounding UI chrome
- Use `bg-bold` or `fg-bold` without a `<Surface>` wrapper -- breaks child adaptation
- Use more than 3 different surface modes on the same page -- keep it simple
- Set `background-color` manually on containers with interactive children

---

## 13. Cross-Skill Integration

| Working On | Use This Skill | Plus |
|------------|---------------|------|
| Page layout, UI composition | `oneui-design-composition` | -- |
| Surface token specifics, `[data-surface]` CSS | This for when/why | `surface-context` for how/mechanism |
| Brand theming, recipe system, CSS injection | This for visual guidelines | `oneui-multi-brand` for architecture |
| Component CSS internals | This for conventions | Read the component's `.module.css` directly |
| Debugging surface adaptation | -- | `surface-context` (primary) |
| Brand CSS injection pipeline | -- | `oneui-multi-brand` (primary) |
