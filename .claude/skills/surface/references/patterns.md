# Surface Playbook by UI Pattern

Concrete guidance per common pattern, plus worked before/after fixes. Read the row you're building; copy the fix shapes when repairing.

## Pattern → surface table

| Pattern | Use | Avoid |
|---------|-----|-------|
| **Page background** | default neutral | minimal/subtle/moderate/bold/brand/sparkle at page level |
| **Standard card** | default; `elevated` only if it floats | tinted card bg unless promo/guidance |
| **Promotional card** | `bold`, `brand-bg`, or `sparkle` (when promo/celebration is explicit) | promo surfaces on standard content |
| **Toast** | `bold` or a semantic role (positive/negative/warning/informative); context-aware foreground | decorative tinting, low-contrast text |
| **Banner** | `bold` for attention, `brand-bg` for marketing, `sparkle` for celebration | multiple competing banners on one screen |
| **List item** | default; interactive state only if actually clickable | tinted rows, unclear clickable surfaces, nested interactive surfaces |
| **Navigation** | `primary` for active/action, neutral for inactive; context-aware surface only when nav floats | `secondary` for active nav, tinted nav backgrounds without reason |
| **Finance / utility** | default neutral; `primary` for actions; `bold` only for critical alerts | promo tinting on analytical screens, tinted chart containers, tinted dark mode |
| **AI / creative / gallery** | default base (imagery carries the weight); `brand-bg`/`sparkle` only for creation/promo/celebration; `elevated` for floating controls | making every media section loud, brand bg behind normal galleries |
| **Game / entertainment** | default base; `bold`/`brand-bg`/`sparkle` for hero/reward/campaign; `primary` for play actions | competing attention around the main play card, `secondary` for main actions |

## Worked examples (before → after)

### 1. Tinted page background
**Before:** `<div style={{ background: 'var(--Primary-Subtle)' }}>` wrapping the whole screen "to feel branded."
**Problem:** Page backgrounds must be neutral; it bypasses the cascade (hardcoded) and gives the whole screen unfocused attention.
**After:** Page stays default. If a branded *moment* is wanted, make one `<Surface mode="bold">` or `brand-bg` promo card inside the otherwise-neutral page.

### 2. Patchwork of colored cards
**Before:** Six cards, each a different tinted surface, stacked down a settings screen.
**Problem:** Every card competes; no focal point; the screen feels loud and hard to scan.
**After:** All cards default. Rebuild hierarchy with section spacing, headings (type scale + weight), and grouping. Reserve a single non-default surface for the one card that's actually a promo or an alert, if any.

### 3. Invisible/again-hardcoded content on a dark hero
**Before:** `<div style={{ background: '#1a1140' }}><Button variant="ghost">Start</Button></div>` — button text is dark on dark.
**Problem:** A raw `<div>` background is outside the surface cascade, so nothing adapts and the text breaks.
**After:**
```tsx
<Surface mode="bold">
  <Heading>Your evening, upgraded</Heading>   {/* auto white */}
  <Button variant="ghost">Start</Button>      {/* auto white text/border */}
</Surface>
```

### 4. Bold competing with the primary action
**Before:** A `bold` promo banner directly above the primary "Pay now" button, both shouting.
**Problem:** Two focal points; the user's eye splits; the actual task (pay) loses.
**After:** Demote the promo to a `subtle`/default card, or move it away from the action. Keep `bold` for the moment that matters most on this screen — usually the task, not the promo.

### 5. brand-bg on product UI
**Before:** Account/transaction list rendered on a `brand-bg` surface.
**Problem:** brand-bg is for marketing/celebration; on product UI it hurts legibility and trust.
**After:** Default neutral list. If there's a cashback offer, that single offer card can be `brand-bg` or `sparkle` — the list around it stays default.

### 6. Decorative tinted text/stroke
**Before:** Section heading in `--Primary-Tinted`, card outlined in `--Primary-Stroke-Medium`, neither carrying meaning.
**Problem:** Color used as decoration; competes with real semantic color (links, states); muddies hierarchy.
**After:** Heading uses neutral `--Text-High`; hierarchy via size/weight/spacing. Drop the decorative border — if the card is on a tinted Surface the fill is already the boundary; if it's default and needs separation, use spacing.

### 7. Secondary appearance faking a "secondary button"
**Before:** A secondary action styled by wrapping it in `appearance="secondary"` surface color.
**Problem:** Button hierarchy is the button component's contract; expressing it via surface appearance is inconsistent and unpredictable.
**After:** Use the button component's own variant for the secondary action (which may render as the primary appearance per the spec). Leave surface appearance out of button hierarchy.

### 8. Tinted dark mode
**Before:** Dark theme built with a deep-purple-tinted page background and brand-colored cards.
**Problem:** Tinted dark backgrounds feel over-branded and reduce legibility; the system intends neutral dark surfaces.
**After:** Neutral dark default surfaces; depth via the elevated/contextual layering the engine already provides. Brand expression stays in contained promo moments only.

## The shape of a good screen

Most well-composed OneUI screens look like: a **neutral default page**, hierarchy built from **spacing + type + one primary action**, and **at most one** non-default surface that carries a real moment (an alert, a promo, a floating sheet). If your screen has more attention surfaces than that, walk back through `decision-tree.md` and demote until one focal point remains.
