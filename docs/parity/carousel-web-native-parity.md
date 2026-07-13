# Carousel — Web ↔ Native parity

| Area | Web | Native |
|------|-----|--------|
| Component | [packages/ui/src/components/Carousel/](../../packages/ui/src/components/Carousel/) | [packages/ui-native/src/components/Carousel/](../../packages/ui-native/src/components/Carousel/) |
| Static visuals | `Carousel.module.css` | `Carousel.styles.native.ts` |
| Prop contract | `Carousel.shared.ts` + subcomponent props | `interface.ts` (locally owned) |
| Stories / showcase | `Carousel.stories.tsx` | `Carousel.showcase.native.tsx` |
| Engine | Embla Carousel + Autoplay plugin | Horizontal `ScrollView` pager + `setInterval` autoplay |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|-----------|----------------|--------|
| 1 | `Default` | `CarouselDefault` | **Aligned** |
| 2 | `AspectRatios` | `CarouselAspectRatios` | **Aligned** |
| 3 | `Alignments` | `CarouselAlignments` | **Aligned** |
| 3b | Content widths (startBottom) | `CarouselContentWidthsStartBottom` | **Aligned** — fill / l / m / s |
| 4 | `Controls` | `CarouselControlsShowcase` | **Aligned** — below / onMedia / none |
| 5 | `ContentCompositions` | `CarouselContentCompositions` | **Aligned** |
| 6 | `Peek` | `CarouselPeek` | **Aligned** |
| 7 | `AutoPlay` | `CarouselAutoPlay` | **Aligned** — interval autoplay + play button |
| 8 | `SurfaceContext` | `CarouselSurfaceContext` | **Aligned** |
| 9 | `Centered` | `CarouselCentered` | **Aligned** |
| 10 | `AdoptionMatrix` | `CarouselAdoptionMatrix` | **Aligned** |
| 11 | `Interactive` | _intentionally skipped_ | **Web-only** — Storybook play + axe smoke |

## Compound API parity

| Part | Web | Native | Notes |
|------|:-:|:-:|-------|
| `Carousel` | yes | yes | `aria-label`, `opts`, `autoPlay`, `fullWidth` |
| `Carousel.Viewport` | yes | yes | `peek` data-attr → snap interval |
| `Carousel.Rail` | yes | yes | Injects `"N of M"` slide labels |
| `Carousel.Item` | yes | yes | Web: `aspectRatio`, `surface`, `height` on slide. Native: `surface`, `height` only — ratio on `Slide.Image` |
| `Carousel.Item.Image` | yes | yes | `src`, `alt`, `scrim` (`true` or `ScrimProps`) |
| `Carousel.Item.Content` | yes | yes | `alignment`, `width`; ButtonGroup split |
| `Carousel.Item.BadgeRow` | yes | yes | `placement` start/end |
| `Carousel.Item.ButtonGroup` | yes | yes | `orientation`, `width` |
| `Carousel.Controls` | yes | yes | `placement`, `layout` |
| `Carousel.IndicatorList` | yes | yes | Delegates to `PaginationDots` (`count` prop) |
| `Carousel.PrevButton` | yes | yes | `chevronLeft` IconButton |
| `Carousel.NextButton` | yes | yes | `chevronRight` IconButton |
| `Carousel.PlayButton` | yes | yes | Hidden unless `autoPlay` set on Root |

## Behaviour gaps / follow-ups

| Topic | Web | Native |
|-------|-----|--------|
| Scroll engine | Embla drag physics, `dragFree`, `slidesToScroll` | `ScrollView` paging; `dragFree` / `slidesToScroll` accepted in `opts` but not yet wired |
| Loop wrap | Embla true circular wrap (seamless, no reverse-scroll) | **At parity** — circular buffer renders `[clone(last), …real, clone(first)]`, animates the wrap forward/back into a clone, then realigns onto the real slide with `animated: false` (invisible: clone shows identical content). Logic in `resolveCarouselLoopClonePadding` / `resolveCarouselScrollOffset` / `resolveCarouselLoopSettle`; single-slide loops fall back to no clones |
| RTL | `opts.direction: 'rtl'` | Not yet wired — LTR only |
| `slidesPerView` | CSS flex-basis | Not yet wired — one slide per view |
| Autoplay pause on hover | `stopOnMouseEnter` | No pointer-enter equivalent — manual play/pause only |
| Recipe tokens | `CAROUSEL_RECIPE_DEFINITION` CSS vars | `resolveCarouselSlideRadius` + `resolveCarouselContentSpacing` from `useComponentRecipe('carousel')` |
| Slide placeholder bg | `--Surface-Subtle` | `useSurfaceTokens('primary').surfaces.subtle` |
| Scrim | `--Neutral-Bold` 70% color-mix (2-stop CSS gradient) | `<Scrim position="bottom" size="XL" attention="high" />` via `CAROUSEL_SLIDE_SCRIM_PROPS` — shared `Scrim` component (7-stop edge band; see note³) |
| Button group on imagery | CSS Fill re-anchoring on `.buttonGroup` | `RootSurfaceProvider` resets `SurfaceContext` to `theme.rootRoles` |
| onMedia controls | `data-surface="bold"` without fill | `<Surface mode="bold">` + `surfaceOverlayStyle` (transparent) |
| Demo assets | `/carousel-demo/slide-*.jpg` in Storybook `public/` | Same files bundled under `packages/ui-native/assets/carousel-demo/` |

## Accessibility

- Root requires `aria-label` on both platforms.
- Track sets `aria-live="polite"` when autoplay is off; native uses `accessibilityLiveRegion`.
- Prev/Next disable at ends unless `opts.loop` is true.
- Indicator list uses `PaginationDots` tab semantics on native.

³ **Scrim model difference:** Web carousel uses a full-bleed 2-stop linear gradient (`Neutral-Bold` @ 70% → transparent). Native delegates to the shared `Scrim` component, which renders a bottom-anchored multi-stop edge band (`size="XL"`, `attention="high"`). Figma node `2775:11233` toggles `scrim={true}` as a masked full-slide overlay — visually closer to web than `Scrim` size `XS`, but not pixel-identical to the CSS 2-stop mix. Tune `CAROUSEL_SLIDE_SCRIM_PROPS` if design QA requests a stronger/weaker fade.
