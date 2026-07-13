# Attention Level Mapping

The attention level system connects surface modes, component variants, typography, and color into a unified hierarchy. Every UI element falls into one of four attention levels.

---

## The Attention Pyramid

```
                 ┌──────────┐
                 │   HIGH   │  5% of elements
                 │  (bold)  │  Primary CTA, hero branded moment
                 ├──────────┤
                 │  MEDIUM  │  10% of elements
                 │ (subtle) │  Secondary CTAs, active states, emphasis cards
              ┌──┴──────────┴──┐
              │      LOW       │  25% of elements
              │   (minimal)    │  Cards with subtle fills, secondary actions
           ┌──┴────────────────┴──┐
           │        NONE          │  60% of elements
           │     (default)        │  Body text, lists, tables, nav, headers
           └──────────────────────┘
```

This pyramid represents the ideal distribution on any given screen. If more than ~10% of elements have High attention, the hierarchy is broken and nothing stands out.

---

## Attention Level Matrix

### None (60% of elements)

The quiet foundation. Most UI lives here -- readable, functional, invisible.

| Dimension | Choice |
|-----------|--------|
| **Surface** | `default` |
| **Component variants** | No fill (bare text), `ghost` neutral buttons, plain lists |
| **Typography role** | Body (M/S for text), Label (M/S for nav items) |
| **Typography weight** | Low (400) or Medium (500) |
| **Color** | `--Text-High`, `--Text-Medium`, `--Text-Low` (neutral text colors) |
| **Border** | `--Border-Subtle` or none |
| **Elevation** | `--Elevation-0` (flat) |

**Examples in Jio apps:**
- Page headers (navigation bar)
- Body text and descriptions
- Data tables and lists
- Price text on product cards
- Navigation labels (tab bar, sidebar)
- Timestamps, helper text, captions

---

### Low (25% of elements)

Gentle differentiation. Visible but not attention-grabbing.

| Dimension | Choice |
|-----------|--------|
| **Surface** | `default` or `bg-minimal` |
| **Component variants** | `ghost` primary/secondary, cards with subtle border |
| **Typography role** | Title (M/S), Label (M with Medium weight) |
| **Typography weight** | Medium (500) |
| **Color** | Neutral or secondary appearance, `--Text-High` |
| **Border** | `--Border-Default` or `--Border-Subtle` |
| **Elevation** | `--Elevation-0` or `--Elevation-1` on hover |

**Examples in Jio apps:**
- Product cards (default bg, content-focused, subtle border)
- Search bar input
- Category chips (ghost variant, secondary appearance)
- Accordion sections
- Settings rows
- Secondary navigation tabs
- Form labels

---

### Medium (10% of elements)

Active emphasis. These elements draw the eye after the High-attention items.

| Dimension | Choice |
|-----------|--------|
| **Surface** | `default`, `bg-subtle`, or `fg-subtle` |
| **Component variants** | `subtle` primary/secondary buttons, `bold` chips (selected state) |
| **Typography role** | Title (L/M) with higher weight, Headline (S) |
| **Typography weight** | High (700) for labels, 800+ for titles |
| **Color** | Primary or secondary appearance with accent color visible |
| **Border** | Accent-colored or none (fill provides differentiation) |
| **Elevation** | `--Elevation-1` to `--Elevation-2` |

**Examples in Jio apps:**
- Info banners ("Shop with confidence, your security is our promise")
- Selected filter chips (bold variant, secondary appearance)
- Heart points / progress cards
- Secondary CTA buttons (subtle primary)
- Active tab indicators
- Status cards with tinted fills
- Toggle switches (selected state)

---

### High (5% of elements)

Maximum emphasis. The focal point. Use sparingly -- this is the budget breaker.

| Dimension | Choice |
|-----------|--------|
| **Surface** | `fg-bold` (via `<Surface>`) or direct `bold` variant |
| **Component variants** | `bold` primary button, brand hero section |
| **Typography role** | Display (L/M), Headline (L/M) |
| **Typography weight** | 900 (Display/Headline fixed) |
| **Color** | Primary appearance, `--Primary-FG-Bold` fill |
| **Border** | None (fill is the statement) |
| **Elevation** | `--Elevation-0` (bold fills don't need shadows) or `--Elevation-3` (FAB) |

**Examples in Jio apps:**
- "Buy Now" / "Recharge" primary CTA button
- Hero banner section (fg-bold surface with Display typography)
- Data balance card (5.8GB bold display)
- "Explore now" primary CTA on landing page
- FAB for primary action
- Promotional banner (rare, brand-colored)

---

## Decision Flowchart

Use this to determine attention level for any element:

```
Is this the PRIMARY user action on this screen?
  → YES: High (bold primary button)
  → NO: Continue...

Is this an active/selected state or secondary CTA?
  → YES: Medium (subtle primary/secondary)
  → NO: Continue...

Does this element group content or provide secondary interaction?
  → YES: Low (ghost, subtle border, or bg-minimal)
  → NO: None (body text, flat, no fill)
```

---

## Attention Budget Audit

When reviewing a layout, count elements at each level:

| Check | Healthy | Warning |
|-------|---------|---------|
| High elements per viewport | 1-2 | 3+ means hierarchy is broken |
| Medium elements per viewport | 2-5 | 6+ means too much emphasis |
| Bold surfaces per page | 0-1 | 2+ means surface overuse |
| Sparkle role elements per viewport | 0-2 | 3+ means celebration fatigue |
| Different surface modes per page | 1-3 | 4+ means unnecessary complexity |

---

## Common Mistakes

**Mistake: Everything is Medium**
If most elements are subtle-filled buttons and tinted cards, nothing has emphasis. Reset to None, then selectively promote elements.

**Mistake: Multiple High elements competing**
Two bold primary buttons in the same viewport = attention split. Demote one to subtle.

**Mistake: Headers with brand color**
Headers are navigation infrastructure (None attention). Putting brand color on headers wastes attention budget on something users look through, not at.

**Mistake: All cards with bg-subtle**
If every card has a tinted background, the differentiation is lost. Use default for most cards, bg-subtle only when grouping related cards together.

**Mistake: Sparkle on common actions**
Sparkle is for rare celebration. Using it on regular badges or common status indicators dilutes its specialness. Use neutral for common indicators, sparkle only for "gift unlocked" or "achievement completed" moments.
