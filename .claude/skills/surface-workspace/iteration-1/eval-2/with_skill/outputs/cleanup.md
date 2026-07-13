# Cleaning up the loud dashboard

## What's wrong

Six cards, each with a different background color, is the textbook "patchwork" problem. Here's the actual mechanism behind why it feels busy:

**Attention is a budget, and you've spent it on everything.** A colored background is a signal that says "look here." When six cards all say "look here," none of them do. The eye has no entry point, no path, no resting place — so the whole thing reads as noise. When everything is highlighted, nothing is.

Three specific issues:

1. **Color is doing a job it's bad at — separation.** You're using six different tints to tell the cards apart. But cards on a dashboard don't need *color* to be distinct; they need *space* and *labels*. Color should mean something (this is a promo, this is an alert, this is a reward), not just "this is a different card than the one above it."

2. **No focal point.** A good dashboard has one thing that matters most right now — a primary action, an alert, a key metric. With six competing colors, there's nothing for the layout to elevate, because everything is already maxed out.

3. **Likely hardcoded / off-system.** Six arbitrary background colors usually means raw `<div style={{ background: '...' }}>`. In OneUI that's a double problem: it's a hardcoded value (zero-tolerance rule), and a raw background sits *outside* the surface cascade — so anything inside it (text, buttons, icons) doesn't auto-adapt its contrast. That's how you get the subtle "some cards are slightly harder to read" feeling on top of the loudness.

## The fix, in one sentence

**Make all six cards the default neutral surface, and rebuild the hierarchy with spacing, headings, and grouping instead of color.** Then, if and only if one card is genuinely a promo or an alert, give *that one* a non-default surface.

This isn't a downgrade. Default is the correct surface for standard dashboard content — metrics, lists, stats, status. The "designed" feeling comes back through type scale, weight, whitespace, and a single clear primary action, not tinted boxes.

## Before

```tsx
// Six cards, six backgrounds. Every card shouts; nothing leads.
<div className="dashboard">
  <div style={{ background: '#EEF2FF' }}><Stat label="Revenue" value="₹4.2L" /></div>
  <div style={{ background: '#FEF3C7' }}><Stat label="Orders" value="1,284" /></div>
  <div style={{ background: '#DCFCE7' }}><Stat label="Active users" value="9,310" /></div>
  <div style={{ background: '#FCE7F3' }}><Stat label="Refunds" value="₹12K" /></div>
  <div style={{ background: '#E0E7FF' }}><Stat label="Conversion" value="3.4%" /></div>
  <div style={{ background: '#F3E8FF' }}><Stat label="Avg. session" value="4m 12s" /></div>
</div>
```

## After

Everything neutral and on-system. Hierarchy comes from layout, not color. Cards just need to *be cards* — group them in a grid with consistent spacing; the page's default surface already separates them visually through whitespace and (optionally) elevation.

```tsx
// Calm by default. The grid + spacing + headings carry the structure.
<section className="dashboard">
  <header className="dashboard__head">
    <Heading>Overview</Heading>           {/* type scale + weight = the hierarchy */}
    <Button variant="bold">Export report</Button>  {/* ONE clear primary action */}
  </header>

  <div className="dashboard__grid">       {/* CSS grid, consistent gap = separation */}
    <Card><Stat label="Revenue" value="₹4.2L" /></Card>
    <Card><Stat label="Orders" value="1,284" /></Card>
    <Card><Stat label="Active users" value="9,310" /></Card>
    <Card><Stat label="Refunds" value="₹12K" /></Card>
    <Card><Stat label="Conversion" value="3.4%" /></Card>
    <Card><Stat label="Avg. session" value="4m 12s" /></Card>
  </div>
</section>
```

```css
/* All token-driven — no hardcoded values. */
.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--Spacing-4);
}
.dashboard__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--Spacing-6);
}
```

A standard `Card` on the default page already has its own neutral container treatment, so you get clean separation with zero tint. If you want the cards to feel slightly lifted off the page, that's what `elevated` is for — but use it consistently across all six (it communicates "these float above the page," not "look at me"), not as six different colors.

## When color *is* allowed back in

Color earns its place when it carries meaning, not decoration. On a dashboard, the legitimate cases are:

- **One promo / upsell card** (e.g. "Upgrade to Pro") → wrap that single card in `<Surface mode="bold">` or, if it's a marketing/celebration moment, `brand-bg` / `sparkle`. The other five stay default.
- **One alert** (e.g. "3 payments failed") → a `bold` surface or a semantic role (`negative` / `warning`). Again, just that one.
- **Semantic deltas inside a card** — a metric's up/down indicator can use `positive` / `negative` text. That's color-as-meaning, scoped to a tiny element, not a whole card background.

The rule of thumb: **at most one non-default surface on the screen**, and it should name a real reason ("this is the alert," "this is the promo"). If you can't name the reason in a phrase, the card stays default.

## Two things to do *with* the Surface, never separately

If you do promote one card to a non-default surface:

1. Use `<Surface mode="...">`, **not** a styled `<div>`. The Surface triggers OneUI's token-remapping cascade, so the text, button, and icon inside it auto-adapt to readable contrast. A raw background div does not — that's how content goes invisible on colored cards.
2. **Don't add a border to it.** The tinted fill *is* the boundary. A stroke on top of a Surface fill duplicates the cue and muddies the hierarchy.

## TL;DR

The dashboard feels loud because six colors are competing for attention that should belong to one place. Strip all six back to the **default neutral surface**, rebuild structure with **grid + spacing + headings + one primary action**, and reintroduce a non-default surface only for the *single* card that is genuinely a promo or an alert. Calm by default; color only where it means something.
