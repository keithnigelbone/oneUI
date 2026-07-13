# Carousel — Web API migration notes

## Summary

The web Carousel was **extended**, not replaced. Existing compound usage continues to work unchanged.

**Primary public API:** compound namespace — `Carousel.Desktop`, `Carousel.Tablet`, `Carousel.Mobile`.

**Secondary exports:** `CarouselDesktop`, `CarouselTablet`, `CarouselMobile` (same components, named export style).

## Active page indexing (Figma-aligned)

Public API uses **1-based** pages (Figma `activePage` / `pageCount`):

```tsx
defaultActivePage={1} // first slide
defaultActivePage={3} // third slide
onActivePageChange={(page) => setPage(page)} // page is 1-based
```

`useCarousel()` exposes `activePage` and `pageCount` (alias for `slideCount`) on the same 1-based scale. Internal Embla indices remain 0-based via `selectedIndex` / `scrollTo(index)`.

## Embla engine decision

Web retains **Embla Carousel** (`embla-carousel` ^8.5.2):

| Question | Answer |
|----------|--------|
| Already in repo? | Yes — predates this Figma alignment work |
| Accepted dependency? | Yes — listed in `@oneui/ui` package.json |
| Duplicate engines? | No — single web engine; native uses ScrollView |
| A11y | Region + slide groups + real buttons; no focus trap |
| RTL | Supported via `opts.direction` |
| Reduced motion | CSS suppresses transitions; autoplay respects plugin + hover/focus pause |
| Controlled state | `activePage` synced with Embla `scrollTo` |
| Autoplay plugin | Loaded only when `autoPlay` is a number |

Native parity is at the **API layer**, not the scroll implementation.

## Additions (non-breaking)

| Addition | Purpose |
|----------|---------|
| `Carousel.Pagination` | Semantic alias for `Carousel.IndicatorList` |
| `Carousel.PaginationOnMedia` | On-media pagination preset |
| `Carousel.SelectionRail` | Thumbnail rail |
| `Carousel.SelectionRailOnMedia` | On-media rail preset |
| `Carousel.Desktop` / `.Tablet` / `.Mobile` | Design-variant preset wrappers |
| `carousel.presets.ts` | `CAROUSEL_*_PRESET` constants |
| `activePage` / `defaultActivePage` / `onActivePageChange` | Controlled/uncontrolled index |
| `followsAspectRatio` | Figma `height=followsAspectRatio` vs custom height (`followAspectRatio` deprecated alias) |
| `controls` | Boolean on platform wrappers — default `false`; `controlsType` applies only when `true` |
| `contentAlignment` / `contentWidth` | Figma slide content props (`alignment` / `width` deprecated aliases) |
| `buttonWidth` | Includes mobile `fill` alias for `wide` |
| `scrim` | `boolean | ScrimProps` on `Slide.Image` |
| `badgesStart` / `badgesEnd` / `badgesMiddle` | Figma visibility toggles |
| `autoplay` | Boolean on `Carousel.Pagination` — shows play/pause when root autoplay enabled |
| `aspectRatio` on Root | Shared default for slides |
| `loop` on Root | Overrides `opts.loop` |
| `middleTop` alignment | New content alignment |
| Expanded aspect ratios | `1:2`, `5:3`, `2:1`, `21:9`, etc. |

## Intentional React deviations from Figma defaults

| Topic | Figma default | React behaviour |
|-------|---------------|-----------------|
| `defaultActivePage` / `activePage` | `5` (1-based) | Defaults to **first slide** (`1`) — more useful for real carousels |
| `pageCount` | `5` (static prop) | **Derived at runtime** from slide/item count via `useCarousel().pageCount` |
| `followsAspectRatio` | JSON name | Canonical React prop; `followAspectRatio` kept as deprecated alias |
| `controls` + `controlsType` | `controlsType` only when `controls=true` | Same gate — `resolveCarouselControlsGate` / `resolveCarouselWrapperControlsType` |
| `selectionRailOnMedia` | Requires `fullWidth=true` | Falls back to `selectionRail` + dev warning when `fullWidth` is false |
| Platform content defaults | Per-platform in Figma | `carousel.presets.ts` — desktop/tablet `startBottom/s/hug`, mobile `middleBottom/fill/wide` |
| Slide visibility toggles | Figma defaults vary | `badgesStart`, `badgesEnd`, `badgesMiddle`, `playButton`, `content` default **`false`** |
| `contentWidth` | `fill \| s \| m \| l` | Grid values `12/10/8/6` removed — not in Figma JSON |

## Renames / aliases

- `CarouselAspectRatio` → deprecated; use `CarouselImageAspectRatio`
- `Carousel.IndicatorList` → still supported; prefer `Carousel.Pagination` in new code
- `activePage` in context === `selectedIndex` (0-based)

## Behaviour changes (minor)

- `Carousel.PlayButton` returns `null` when `autoPlay` is not set
- `Carousel.IndicatorList` `loop` defaults to root `loop`
- `Carousel.Controls` injects `onMedia` on SelectionRail from `placement` — do not set manually inside Controls
- `controlsType="none"` on preset wrappers hides all controls (prefer over omitting Controls in compound API)

## Controls precedence

| API surface | How to hide controls |
|-------------|---------------------|
| Preset wrappers | `controlsType="none"` |
| Compound | Omit `Carousel.Controls` entirely |

Do not combine conflicting patterns without reason.

## Height prop

```tsx
followsAspectRatio={false}
height="480px"   // or height={480} coerced via resolveCarouselFlexibleSlideHeight helpers
```

Minimum height: **300px** (`CAROUSEL_FLEXIBLE_HEIGHT_MIN`). Default flexible height: **480px**.

## Recommended adoption

### Compound (full control)

```tsx
<Carousel.Root aria-label="Featured" aspectRatio="16:9" activePage={page} onActivePageChange={setPage}>
  <Carousel.Viewport>
    <Carousel.Track>{slides}</Carousel.Track>
  </Carousel.Viewport>
  <Carousel.Controls placement="below" layout="split">
    <Carousel.Pagination />
    <Carousel.PrevButton />
    <Carousel.NextButton />
  </Carousel.Controls>
</Carousel.Root>
```

### Design-variant preset (preferred for Figma defaults)

```tsx
<Carousel.Desktop
  aria-label="Hero"
  controlsType="selectionRail"
  selectionRailItems={thumbnails}
  items={slides}
  renderItem={(slide) => (
    <Carousel.Slide>
      <Carousel.Slide.Image src={slide.src} alt={slide.alt} scrim />
    </Carousel.Slide>
  )}
/>
```

### Migrating to selection rail

1. Replace `Carousel.Pagination` with `Carousel.SelectionRail` + `items` prop
2. Or use `Carousel.Desktop controlsType="selectionRail" selectionRailItems={...}`
3. For on-media: `controlsType="selectionRailOnMedia"` + `fullWidth`

### Migrating to on-media pagination

```tsx
<Carousel.Controls placement="onMedia" layout="split">
  <Carousel.PaginationOnMedia />
  <Carousel.PrevButton />
  <Carousel.NextButton />
</Carousel.Controls>
```

## Scrim

| Figma | React |
|-------|-------|
| Gradient (default) | `Carousel.Slide.Image scrim` or `scrim={true}` — uses `buildCarouselDefaultScrimProps(contentAlignment)` |
| Gradient position | Derived from `contentAlignment` via `resolveGradientScrimPositionFromContentAlignment` |
| Overlay | `scrim={{ variant: 'overlay', attention: 'high' }}` or `<Scrim variant="overlay" />` inside slide |
| Figma position tokens | `start` / `end` / `centre` mapped to Scrim `left` / `right` / `center` via `mapCarouselScrimPositionToScrimProps` |

Full Scrim props (`attention`, `position`, `variant`, `size`) live on the `Scrim` component. `Slide.Image scrim={true}` is the simplified alignment-aware gradient preset (attention `medium`, variant `gradient`).

## Storybook

Stories are grouped under:

```txt
Components / Navigation / Carousel / Overview
Components / Navigation / Carousel / Desktop / …
Components / Navigation / Carousel / Tablet / …
Components / Navigation / Carousel / Mobile / …
Components / Navigation / Carousel / Composition / …
Components / Navigation / Carousel / States / …
Components / Navigation / Carousel / Edge Cases / …
```

## Known follow-ups

- Generated platform docs (`apps/platform/src/generated/design-md/*`) may lag — regenerate when platform doc pipeline runs
- Slide body weight uses `--Body-FontWeight-Low`; some Figma promo text uses medium — intentional until typography audit
- Chromatic baseline not yet blessed for new story structure
