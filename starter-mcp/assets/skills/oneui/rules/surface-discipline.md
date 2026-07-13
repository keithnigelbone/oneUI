# Surface Discipline

A surface is a choice about **meaning and attention**, not a color. You pick a mode and the engine resolves every fill, text, stroke, contrast, and state via `[data-surface]` token remapping. This file owns the *mechanics of using `<Surface>` correctly*; for **which** level a region earns, defer to the `surface` skill, and for the remapping internals, the `surface-context` skill.

The **7 surface modes** (one vocabulary for containers and component fills):
`default` · `ghost` · `minimal` · `subtle` · `moderate` · `bold` · `elevated`.

## Start at `default`; escalate only for a named purpose

Most of a screen is the `default` page surface. Reach for a higher mode only when a region has a reason (guidance, promotion, separation, elevation, a brand moment).

**Incorrect:**
```tsx
<Surface mode="subtle"><Section /></Surface>   {/* "subtle everywhere" — muddies hierarchy */}
<Surface mode="subtle"><Section /></Surface>
<Surface mode="bold"><Section /></Surface>
```

**Correct:**
```tsx
<>
  <HeroSection />                               {/* default page surface */}
  <Surface mode="bold"><PromoBanner /></Surface> {/* one earned focal point */}
  <FeatureList />
</>
```

## A non-default background MUST be a `<Surface>`, never a styled `div`

This is the core of the design system. `<Surface mode>` (or `data-surface`) triggers the CSS token-remapping cascade for every child. A raw `<div style={{ background }}>` is *outside* that cascade — children won't remap and will render mis-contrasted or invisible.

**Incorrect:**
```tsx
<div style={{ background: 'var(--Primary-Bold)' }}>
  <Button attention="low">Dark text on dark = broken</Button>
</div>
```

**Correct:**
```tsx
<Surface mode="bold">
  <Button attention="high">Fill stays distinguishable</Button>
  <Button attention="low">Readable text, no fill</Button>
</Surface>
```

Why: inside a Surface, generic role tokens (`--Primary-Bold`, `--Text-High`, …) remap to the container's step automatically — no per-component "on-bold" handling.

## No decorative stroke/border on a tinted Surface

A tinted fill already provides the boundary. Adding a border duplicates the cue and fights the fill. (Exception: only when fill contrast vs the page is < ~1.5:1, which is rare.)

**Incorrect:**
```tsx
<Surface mode="subtle" style={{ border: '1px solid var(--Border-Subtle)' }}>…</Surface>
```

**Correct:**
```tsx
<Surface mode="subtle"><Card>Fill is the boundary.</Card></Surface>
```

## Pick the Surface's role by overriding the fill token — keep `data-surface` driving context

To render a Surface in a non-primary role (e.g. a secondary-tinted card) while keeping context remapping, override `--Surface-Fill-{Mode}` and set children's `appearance`.

**Correct:**
```tsx
<Surface mode="subtle" style={{ '--Surface-Fill-Subtle': 'var(--Secondary-Subtle)' }}>
  <Slider appearance="secondary" />
  <Checkbox appearance="secondary" />
</Surface>
```

## Use context-aware role tokens, not pinned aliases

Inside a Surface, reference generic role tokens (`--Primary-High`, `--Primary-TintedA11y`, `--Text-High`). Hard-coding a surface-specific alias pins the color and bypasses context awareness.

**Incorrect:** `color: var(--Text-OnBold-High)`  → pins to one surface.
**Correct:** `color: var(--Text-High)` → remaps per `[data-surface]`.

## On media (image/video), elements need a transparent treatment

Controls over media should not paint an opaque block that fights the image. A lone CTA can use `contained={false}` (link-style); a control cluster should sit in a transparent-material Surface (see `get_surface_guide` for `material="transparent"` + `mediaContext`).

```tsx
<div className="hero">
  <Image src="/hero.jpg" alt="" aspectRatio="16:9" />
  <Button contained={false}>Shop now</Button>   {/* doesn't block the media */}
</div>
```
