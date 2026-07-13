# Streaming Bundle Promo Hero

A top-of-home promotional hero on a dark branded background, with a heading and a Subscribe button. Built with OneUI's `<Surface>` so all child colors auto-adapt to the dark/branded context — no manual color overrides on text or buttons.

## TSX

```tsx
import { Surface } from '@oneui/ui';
import { Button } from '@oneui/ui';

export function StreamingBundleHero() {
  return (
    <Surface
      mode="brand-bg"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 'var(--Spacing-4)',
        padding: 'var(--Spacing-8)',
        borderRadius: 'var(--Shape-6)',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Label-S-FontSize)',
          lineHeight: 'var(--Label-S-LineHeight)',
          fontWeight: 'var(--Label-FontWeight-Medium)',
          color: 'var(--Text-Medium)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        New
      </p>

      <h2
        style={{
          margin: 0,
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Headline-L-FontSize)',
          lineHeight: 'var(--Headline-L-LineHeight)',
          fontWeight: 'var(--Headline-L-FontWeight)',
          color: 'var(--Text-High)',
          maxWidth: '32ch',
        }}
      >
        Stream everything in one bundle
      </h2>

      <p
        style={{
          margin: 0,
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Body-M-FontSize)',
          lineHeight: 'var(--Body-M-LineHeight)',
          fontWeight: 'var(--Body-FontWeight-Low)',
          color: 'var(--Text-Medium)',
          maxWidth: '48ch',
        }}
      >
        Movies, live sport, and exclusive shows — all under a single subscription.
      </p>

      <Button variant="bold" appearance="primary" size="large">
        Subscribe
      </Button>
    </Surface>
  );
}
```

## Design choices

- **`<Surface mode="brand-bg">` is the container.** This is the core OneUI rule: a promo hero on a dark/branded background must be a `<Surface>`, never a `<div style={{ background }}>`. The Surface emits a `[data-surface]` block so every child token (`--Text-High`, the Button's fill/text) remaps to resolve correctly against the branded step. A raw div would leave children rendering with page-context colors — dark text on a dark background.

- **`brand-bg`** sets the hero to the brand background surface, giving the "dark branded" look the task asks for. The brand CSS engine handles the exact color per active brand, so the hero follows whatever brand is themed.

- **Context-aware tokens only.** Text uses generic `--Text-High` (heading) and `--Text-Medium` (eyebrow/subcopy). These are remapped by the Surface to stay legible on the branded fill. No hardcoded or surface-specific color aliases — that would pin the color and break context adaptation.

- **`<Button variant="bold" appearance="primary">`** is the high-attention action appropriate for a hero CTA. Nested in the Surface, its `--Primary-Bold` fill and `--Primary-Bold-High` text remap automatically so the button stays distinguishable and readable against the branded background — no "on-dark" button variant needed.

- **No decorative stroke/border.** The Surface fill already defines the hero boundary; adding a border would duplicate the cue and muddy hierarchy.

- **Typography tokens throughout.** `--Headline-L-*` for the page-level heading, `--Body-M-*` for supporting copy, `--Label-S-*` for the "New" eyebrow — each pairs a font-size with its line-height token and includes `font-family: var(--Typography-Font-Primary)` for brand font customization. No literal font sizes, weights, or line-heights.

- **Spacing and shape via tokens.** Padding/gap use `--Spacing-*`; the hero corner uses `--Shape-6` (a non-interactive container radius derived from the dimension scale, responsive to platform/density).
```
