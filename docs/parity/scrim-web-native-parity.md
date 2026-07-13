# Scrim — Native-only (no web peer)

There is **no** `packages/ui/src/components/Scrim/` — this is not a web↔native parity matrix. Native Scrim aligns with **Layers jdsScrim** / `.box.scrim` gradient reference.

`pnpm check:parity` does **not** gate Scrim — no web peer to compare.

**Implementation:** `packages/ui-native/src/components/Scrim/`

Decorative, non-interactive overlay (`pointerEvents='none'`). Fills **100% width and height of its parent**; parent must have explicit dimensions.

**Defaults:** `attention="medium"` · `size="XS"` · `position="bottom"` · `variant="gradient"`

---

## Platform status

| Area | Web | Native |
| --- | --- | --- |
| Component | _none_ | `Scrim.native.tsx` |
| Prop contract | — | `interface.ts` |
| Paint / opacity | — | `scrimPaint.ts` — `resolveScrimPaint` |
| Static geometry | — | `Scrim.styles.native.ts` |
| Showcase | — | `Scrim.showcase.native.tsx` (sample app) |
| Tests | — | `scrimLayout.test.ts`, `ScrimA11y.test.ts` |
| Usage examples | — | `scrim.usage.md` |

---

## Props

| Prop | Values | Default | Role |
| ---- | ------ | ------- | ---- |
| `attention` | `low` · `medium` · `high` | `medium` | Opacity strength |
| `size` | `XS` · `S` · `M` · `L` · `XL` · `full` | `XS` | Band size along fade axis (edge) or trigger full-coverage opacity |
| `position` | `top` · `bottom` · `start` · `end` · `center` | `bottom` | Which edge the fade anchors to |
| `variant` | `gradient` · `overlay` | `gradient` | Multi-stop SVG fade vs flat tint |
| `style` | `ViewStyle` | — | Root container |
| `testID` | `string` | — | Test hook |

---

## Layout — three-zone flex model

```
[ Zone 1 — transparent spacer ]
[ Band     — gradient SVG or overlay fill ]
[ Zone 2 — transparent spacer ]
```

Root is always transparent so spacer zones reveal content beneath (images, scroll areas).

### Band size (% of parent along fade axis)

Formula for **edge** positions (`top` / `bottom` / `start` / `end`) with **`variant="gradient"`**:

**Band % = `band / (zone + band)`**

| `size` | Flex ratio (zone : band) | Band % |
| ------ | ------------------------ | ------ |
| `XS` | 9 : 1 | **10%** |
| `S` | 8 : 2 | **20%** |
| `M` | 6 : 4 | **40%** |
| `L` | 4 : 6 | **60%** |
| `XL` | 2 : 8 | **80%** |
| `full` | spacers hidden | **100%** |

| Position | Fade axis | Band placement | Visible spacer |
| -------- | --------- | -------------- | -------------- |
| `bottom` | Height | Bottom edge | Zone 1 (top) |
| `top` | Height | Top edge | Zone 2 (bottom) |
| `start` | Width | Leading edge (LTR: left) | Zone 2 (trailing) |
| `end` | Width | Trailing edge (LTR: right) | Zone 1 (leading) |
| `center` | Height | Full height (both spacers hidden) | None |

Along the **perpendicular** axis the band always stretches to **100%** of the parent.

### Full-coverage layout (band = 100%)

Band covers the entire parent when **any** of these is true:

| Trigger | Layout effect |
| ------- | ------------- |
| `size="full"` | Both spacers hidden |
| `position="center"` | Both spacers hidden |
| `variant="overlay"` | Both spacers hidden (any size/position) |

> **Note:** `variant="overlay"` always uses full-area layout and the full/center opacity scale (17% / 33% / 50%), even with `size="XS"`.

---

## Tone (theme flip)

| App theme | Scrim tone | Gradient color source |
| --------- | ---------- | --------------------- |
| Light (`darkMode: false`) | `dark` | Neutral palette step **200** (fallback: `tokens.surface.bold`) |
| Dark (`darkMode: true`) | `light` | Neutral palette step **2500** (fallback: `tokens.surface.default`) |

Resolved by `resolveScrimTone(theme.darkMode)`.

### Token / color sources

| Concern | Native source |
| --- | --- |
| Root | Transparent — spacer zones reveal content beneath |
| Edge gradient color | `theme.themeConfig.appearances.neutral.palette[200\|2500]` |
| Full-coverage flat tint | `rgba(0,0,0,α)` / `rgba(255,255,255,α)` at 17% / 33% / 50% |
| Dark-theme flip | `resolveScrimTone(theme.darkMode)` |

---

## Two paint modes (one flag)

Full-coverage **flat tint** activates when **any** of:

```ts
position === 'center' || size === 'full' || variant === 'overlay'
```

(`isScrimFullCoverageMode()` — same flag drives layout and paint.)

Otherwise: **edge gradient** only (XS–XL on top/bottom/start/end).

| `attention` | Edge gradient (25% / 50% / 95% peak) | Full-coverage flat (17% / 33% / 50%) |
| ----------- | ------------------------------------ | ------------------------------------ |
| `low` | **25%** | **17%** |
| `medium` | **50%** | **33%** |
| `high` | **95%** | **50%** |

Full-coverage mode is always a **uniform** `rgba` fill — no SVG gradient, regardless of `variant`.

---

## Edge mode: `gradient` (default, XS–XL edges)

Renders a **7-stop** SVG `LinearGradient` matching Layers `.box.scrim`:

```css
/* Reference curve (black alphas, direction flipped per position) */
linear-gradient(to top,
  black 0%,
  rgba(0,0,0,0.3) 50%,
  rgba(0,0,0,0.15) 65%,
  rgba(0,0,0,0.08) 75%,
  rgba(0,0,0,0.04) 83%,
  rgba(0,0,0,0.02) 88%,
  rgba(0,0,0,0) 100%
);
```

Base curve multipliers (before attention scale):

| Stop offset | Base opacity |
| ----------- | ------------ |
| 0% | 1.0 |
| 50% | 0.3 |
| 65% | 0.15 |
| 75% | 0.08 |
| 83% | 0.04 |
| 88% | 0.02 |
| 100% | 0 |

**Final stop opacity = base × edge attention scale** (25% / 50% / 95% peak).

### Gradient stop opacities — edge scale (25% / 50% / 95%)

| Offset | `low` (×0.25) | `medium` (×0.50) | `high` (×0.95) |
| ------ | ------------- | ---------------- | -------------- |
| 0% | 0.250 | 0.500 | 0.950 |
| 50% | 0.075 | 0.150 | 0.285 |
| 65% | 0.0375 | 0.075 | 0.1425 |
| 75% | 0.020 | 0.040 | 0.076 |
| 83% | 0.010 | 0.020 | 0.038 |
| 88% | 0.005 | 0.010 | 0.019 |
| 100% | 0 | 0 | 0 |

### Gradient direction per `position` (edge mode only)

| `position` | SVG direction | CSS equivalent |
| ---------- | ------------- | -------------- |
| `bottom` | y 100% → 0% | `to top` (strong at bottom) |
| `top` | y 0% → 100% | `to bottom` (strong at top) |
| `start` | x 0% → 100% | `to right` (strong at leading) |
| `end` | x 100% → 0% | `to left` (strong at trailing) |
| `center` | y 0% → 100% | `to bottom` (strong at top of band) |

Peak opacity (offset `0%` in SVG) sits at the **anchored edge** of the band.

---

## Full-coverage mode: flat tint

When `isScrimFullCoverageMode` is true — **uniform** fill, **100%** band:

| `attention` | Dark tone | Light tone |
| ----------- | --------- | ---------- |
| `low` | `rgba(0, 0, 0, 0.17)` | `rgba(255, 255, 255, 0.17)` |
| `medium` | `rgba(0, 0, 0, 0.33)` | `rgba(255, 255, 255, 0.33)` |
| `high` | `rgba(0, 0, 0, 0.5)` | `rgba(255, 255, 255, 0.5)` |

Applies equally for `variant="overlay"`, `size="full"`, or `position="center"` (any other props).

---

## Master combination matrix

### Edge gradient (`variant="gradient"`, edge position, XS–XL)

| `position` | `size` | Band % | Paint |
| ---------- | ------ | ------ | ----- |
| `bottom` | `XS`–`XL` | 10%–80% | 7-stop edge gradient |
| `top` / `start` / `end` | `XS`–`XL` | 10%–80% | 7-stop edge gradient |

### Full-coverage flat (any trigger: `center` \| `full` \| `overlay`)

| Trigger example | Band % | Paint |
| --------------- | ------ | ----- |
| `size="full"` + `gradient` + `bottom` | 100% | Flat rgba |
| `position="center"` + `XS` + `gradient` | 100% | Flat rgba |
| `variant="overlay"` + any position/size | 100% | Flat rgba |

---

## Common recipes

| Scenario | Props |
| -------- | ----- |
| Bottom caption fade | `position="bottom"` `size="L"` `attention="high"` |
| Scroll top hint | `position="top"` `size="S"` `attention="low"` |
| Carousel leading fade | `position="start"` `size="M"` `attention="medium"` |
| Modal dimmer | `variant="overlay"` `position="center"` `size="full"` `attention="medium"` |
| Full-screen flat dimmer | `position="bottom"` `size="full"` `attention="high"` |
| Image bottom fade (subtle) | `position="bottom"` `size="XS"` `attention="low"` |

---

## Behaviour

- Non-interactive (`pointerEvents='none'`), decorative a11y (`accessible={false}`).
- Three-zone flex layout; edge mode uses `react-native-svg` `LinearGradient` (7 stops); full-coverage mode uses flat `backgroundColor`.
- Parent must have explicit `width` / `height` — scrim fills 100% of parent.
- Pair with Modal / Sheet for dismiss and focus management.

---

## Accessibility

| Property | Value |
| -------- | ----- |
| `accessible` | `false` |
| `aria-hidden` | `true` |
| `importantForAccessibility` | `no-hide-descendants` |

---

## Native showcase sections

| Section | Coverage |
| --- | --- |
| `ScrimDefault` | Default props (bottom / XS / medium / gradient) |
| `ScrimGradientPositions` | Quick S / medium per edge |
| `ScrimSizeBottom` … `ScrimSizeEnd` | XS → XL per edge (medium) |
| `ScrimAttentionBottom` … `ScrimAttentionEnd` | low / medium / high per edge (size L, edge scale) |
| `ScrimSizeFullBottom` … `ScrimSizeFullCenter` | low / medium / high flat tint at `size=full` |
| `ScrimAttention` | XL bottom — edge scale comparison |
| `ScrimOverlay` | Modal-style `variant="overlay"` |
| `ScrimOverImage` | Scrim over `<Image>` |
| `ScrimSurfaceContext` | Inside `<Surface mode>` boundaries |

---

## Implementation map

| Concern | File |
| ------- | ---- |
| Props & layout flex | `interface.ts` — `resolveScrimLayout`, `SIZE_FLEX`, `GRADIENT_DIRECTION` |
| Full-coverage flag | `interface.ts` — `isScrimFullCoverageMode` |
| Paint / opacity | `scrimPaint.ts` — `resolveScrimPaint` (`flatColor` vs `gradientStops`) |
| Render | `Scrim.native.tsx` — flat fill or SVG gradient |
| Tests | `scrimLayout.test.ts`, `ScrimA11y.test.ts` |
| Showcase | `Scrim.showcase.native.tsx` |

All paths under `packages/ui-native/src/components/Scrim/`.

---

## Quick decision tree

```
position=center OR size=full OR variant=overlay?
├── yes → 100% band · flat rgba · opacity 17% / 33% / 50%
└── no  → band 10%–80% by size · 7-stop SVG gradient · opacity 25% / 50% / 95%
```

---

## Related web (not parity)

Web has no Scrim component. Closest analogue:

- **Carousel slide scrim** — `packages/ui/src/components/Carousel/Carousel.module.css` (`.scrim`): CSS 2-stop `linear-gradient`, not the native 7-stop API.

Do not treat Carousel CSS as a web peer for `check:parity` or prop alignment.
