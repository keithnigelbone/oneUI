# Images

`Image` has **no `shape` prop** — its API is `src`, `alt` (both required), `aspectRatio`, `fit`/`objectFit`, `objectPosition`, `interactive`, `loading`, `srcSet`/`sizes`. Confirm with `get_component_info Image`.

## Images are always rounded, never square

Imagery should never read as a hard square. Because there's no `shape` prop, rounding comes from the wrapper / a recipe token — and it must be applied; don't rely on a default that may render sharp corners. Radius scales with the image's footprint (small thumb → small radius; large hero → larger). Avatars are circular (use `Avatar`).

**Incorrect:**
```tsx
<img src="/p.jpg" />                                  {/* raw img, square, no alt */}
<Image src="/p.jpg" alt="Product" />                   {/* relies on an unknown default radius */}
```

**Correct:**
```tsx
<Image src="/thumb.jpg" alt="Thumbnail" aspectRatio="1:1" className="radius-sm" />
<Image src="/hero.jpg" alt="Campaign hero" aspectRatio="16:9" className="radius-lg" />
<Avatar src="/user.jpg" alt="Jane Doe" />              {/* circular */}
```

Why: the rounded-corner language is a OneUI convention (cards use `Shape-3`–`Shape-10`, avatars are circular). Apply the rounding token that matches the image size via the wrapper; verify the exact recipe class/token with `get_component_info Image` for the installed version.

## Always set `alt` and an `aspectRatio`

`src` and `alt` are required; an explicit `aspectRatio` prevents layout shift. `fit` defaults to `cover`.

**Incorrect:**
```tsx
<Image src="/banner.jpg" />                            {/* missing alt + aspectRatio */}
```

**Correct:**
```tsx
<Image src="/banner.jpg" alt="Summer sale banner" aspectRatio="21:9" fit="cover" />
```

## `interactive` only for clickable media

`interactive` adds a state-layer overlay + focus ring and renders the image as a button. Use it for tappable media, not for decoration.

```tsx
<Image src="/product.jpg" alt="Open product" aspectRatio="1:1" interactive />
```

## On-media controls — see surface discipline

Buttons/labels over an image must not paint an opaque block over it; use `contained={false}` for a lone CTA or a transparent-material Surface for clusters. See `rules/surface-discipline.md` → "On media".
