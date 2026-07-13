# Cleaning up the "6 colored cards" dashboard

## What's wrong

Your dashboard feels busy and loud for one structural reason, not six small ones:

**You're using color to separate cards, when color in OneUI is meant to signal *attention* — not grouping.**

When every card has its own background color, every card is competing for the eye at the same volume. The user has no idea where to look first, because nothing is louder than anything else. This is the core failure mode the design system is built to prevent:

> When everything is highlighted, nothing is.

Concretely, here's what's happening:

1. **Tinted surfaces are being used as decoration, not meaning.** In OneUI a non-default surface (`bold`, `subtle`, `brand-bg`, etc.) is a *decision about attention* — "look here, this is a promo / an alert / a thing floating above the page." A dashboard tile that just shows a metric isn't any of those. It's standard content, so it should sit on the **default neutral surface**.

2. **Six competing attention surfaces = zero focal points.** A well-composed screen has *at most one* non-default surface carrying a real moment. Six means the screen has no hierarchy at all — it's a patchwork.

3. **Hierarchy is being expressed in the wrong layer.** The separation, grouping, and "this card matters more" signals you actually want should come from **layout, spacing, type scale, weight, and a single primary action** — not from tinted boxes. Color is the most expensive tool for the job and you've spent it on all six.

4. **(Likely) the colors are also hardcoded.** If those backgrounds are raw `style={{ background: ... }}` or `var(--...)` on a `<div>`, they're *outside* the surface cascade — so the text and any components inside them don't auto-adapt their contrast. That's a second, quieter bug riding along.

This is a textbook case of "patchwork of colored cards" — the exact thing to collapse back to default and rebuild with structure.

## The fix, in one sentence

**Put all six cards on the default neutral surface. Rebuild the hierarchy with a section heading, spacing, and the type scale. Reserve color for the one thing (if any) that's genuinely an alert or a promo — and let `<Surface>` compute the contrast for you.**

## Before (the busy version)

```tsx
// WRONG — every card a different hardcoded background.
// All six shout equally; nothing adapts; no focal point.
<div className="dashboard-grid">
  <div style={{ background: 'var(--Primary-Subtle)' }}>   <Metric label="Revenue"  value="$42k" /></div>
  <div style={{ background: 'var(--Sparkle-Subtle)' }}>   <Metric label="Users"    value="1,204" /></div>
  <div style={{ background: 'var(--Positive-Subtle)' }}>  <Metric label="Uptime"   value="99.9%" /></div>
  <div style={{ background: 'var(--Warning-Subtle)' }}>   <Metric label="Errors"   value="37" /></div>
  <div style={{ background: 'var(--Informative-Subtle)'}}><Metric label="Latency"  value="120ms" /></div>
  <div style={{ background: 'var(--Secondary-Subtle)' }}> <Metric label="Sessions" value="8,990" /></div>
</div>
```

## After (calm, scannable)

All cards default. Hierarchy comes from the section heading, the grid spacing, and the type scale inside each card. No card needs a tint to be a card — the spacing and the metric's own type *are* the structure.

```tsx
// CORRECT — neutral default cards. Hierarchy from layout + type, not color.
<section className="dashboard">
  <h2 className="dashboard__heading">Overview</h2>

  <div className="dashboard__grid">
    <Card>
      <span className="metric__label">Revenue</span>
      <span className="metric__value">$42k</span>
    </Card>
    <Card>
      <span className="metric__label">Users</span>
      <span className="metric__value">1,204</span>
    </Card>
    <Card>
      <span className="metric__label">Uptime</span>
      <span className="metric__value">99.9%</span>
    </Card>
    <Card>
      <span className="metric__label">Errors</span>
      <span className="metric__value">37</span>
    </Card>
    <Card>
      <span className="metric__label">Latency</span>
      <span className="metric__value">120ms</span>
    </Card>
    <Card>
      <span className="metric__label">Sessions</span>
      <span className="metric__value">8,990</span>
    </Card>
  </div>
</section>
```

```css
.dashboard__heading {
  font-family: var(--Typography-Font-Primary);
  font-size: var(--Title-M-FontSize);
  line-height: var(--Title-M-LineHeight);
  font-weight: var(--Title-M-FontWeight);
  color: var(--Text-High);
  margin-block-end: var(--Spacing-4);
}

.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--Spacing-4);          /* spacing separates the cards — not color */
}

.metric__label {
  font-family: var(--Typography-Font-Primary);
  font-size: var(--Label-S-FontSize);
  line-height: var(--Label-S-LineHeight);
  font-weight: var(--Label-FontWeight-Medium);
  color: var(--Text-Medium);      /* quieter — it's the supporting line */
}

.metric__value {
  font-family: var(--Typography-Font-Primary);
  font-size: var(--Headline-M-FontSize);
  line-height: var(--Headline-M-LineHeight);
  font-weight: var(--Headline-M-FontWeight);
  color: var(--Text-High);        /* the number is the hero of each card */
}
```

Notice the hierarchy is now real and free: the **number is big and high-contrast**, the **label is small and medium-contrast**, the **section heading sits above the grid**, and **spacing** does all the separating. The screen reads instantly because there's nothing fighting it.

## When color *is* allowed back in

Color earns its place when a card carries genuine *meaning*, not decoration. Use it for **one** card at a time, and use `<Surface>` so contrast is computed automatically:

```tsx
{/* One alert that actually needs attention — e.g. error spike. */}
<Surface mode="bold" appearance="negative">
  <span className="metric__label">Errors (spiking)</span>
  <span className="metric__value">37 ↑</span>     {/* text auto-flips to readable */}
  <Button variant="bold">Investigate</Button>
</Surface>
```

Rules for this:

- **Only one** non-default surface on the dashboard at a time. If two things both "need attention," they don't — pick the one that matters most.
- A *semantic state* is a valid reason: `negative` for an error spike, `warning` for a threshold breach, `positive` for a goal hit. A plain metric is **not** a reason.
- Always wrap it in `<Surface mode="...">`, never a `style={{ background }}` div. The Surface is what makes the text, strokes, and any nested buttons adapt their contrast automatically — and it removes the hardcoded color.
- The fill *is* the boundary — don't add a decorative border on top of it.

## Summary

| | Before | After |
|---|---|---|
| Card backgrounds | 6 different tints | All default neutral |
| Source of hierarchy | Color | Heading + spacing + type scale |
| Focal points | 6 (so: none) | 1 (the number in each card, plus at most 1 alert) |
| Contrast / adaptation | Hardcoded, doesn't adapt | Auto-computed via `<Surface>` |
| Feel | Busy, loud, hard to scan | Calm, structured, instantly readable |

The dashboard doesn't need color to look designed — it needs structure. Color is the budget you spend on the *one* thing that genuinely needs the user's eye.
