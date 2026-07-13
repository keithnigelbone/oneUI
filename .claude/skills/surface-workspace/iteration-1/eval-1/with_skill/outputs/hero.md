# Streaming-bundle promo hero

## TSX

```tsx
import { Surface } from '@oneui/ui/components/Surface';
import { Text } from '@oneui/ui/components/Text';
import { Button } from '@oneui/ui/components/Button';

export function StreamingBundlePromoHero() {
  return (
    <Surface
      mode="bold"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4)',
        padding: 'var(--Spacing-8)',
        borderRadius: 'var(--Shape-5)',
      }}
    >
      <Text as="h1" variant="headline" size="L">
        All your streaming, one bundle
      </Text>

      <Button variant="bold" size="l" onClick={() => {/* start subscribe flow */}}>
        Subscribe
      </Button>
    </Surface>
  );
}
```

Drop `<StreamingBundlePromoHero />` in as the first child of the home screen,
above the rest of the (default-surface) content.

## Why these surface choices

**The hero earns a non-default surface — most things don't.** The default rule
is: start every screen on the neutral default surface and only break from it when
an area carries a real *moment*. A new-product promo at the very top of the home
screen is exactly that moment (promotion/marketing), so a non-default surface is
justified here. The rest of the home screen below it stays default.

**Dark branded background → `mode="bold"`, not a styled div.** "Dark branded" is
a request for attention + brand color, which is precisely what the `bold` level
means. `bold` jumps to the brand's base color step, so the fill *is* the dark
brand color — I never pick a hex. Critically, I wrap the content in
`<Surface mode="bold">` rather than `<div style={{ background: ... }}>`: the
Surface puts the heading and button inside the token-remapping cascade, so the
engine auto-resolves the heading to readable (white) text and the button to a
fill/label that stay legible on the dark brand fill. A raw background div would
sit *outside* that cascade and the text would break (dark on dark).

**One focal action → one bold button.** The Subscribe button uses
`variant="bold"`, the high-attention button variant. On a bold Surface its fill
remaps so it stays distinguishable against the hero background, and its label
flips to a readable on-fill color automatically. There's a single primary action
and a single heading — one clear focal point, no competing attention.

**No decoration, no hardcoded color, generic tokens only.** No border on the
Surface (the fill is already the boundary), no tinted text, no surface-specific
color aliases. The heading is the design-system `Text` headline (neutral,
auto-adapted by the surface), and all spacing/shape come from tokens. The brand
CSS engine handles every fill, text, stroke, contrast, and hover/pressed state —
my only real decision was the *level* (`bold`), which carries the right meaning:
"this is the promotional moment."

**Light/dark safe for free.** Because `bold` resolves relative to its context,
this hero stays a legible branded surface in both light and dark mode with no
extra code — I didn't write any dark-mode branch.
