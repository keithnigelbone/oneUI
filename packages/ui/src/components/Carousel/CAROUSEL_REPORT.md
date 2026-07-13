# OneUI React Carousel — Implementation Report

> **Status:** Sign-off ready (pending Chromatic baseline)  
> **Location:** `packages/ui/src/components/Carousel/`  
> **Storybook:** `Components/Navigation/Carousel/{Docs|Desktop|Tablet|Mobile}` — autodocs per folder (Badge pattern, no custom MDX)  
> **Engine:** Embla Carousel (`embla-carousel-react` ^8.5.2)  
> **Primary API:** `Carousel.Desktop` / `Carousel.Tablet` / `Carousel.Mobile` (compound namespace)

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [Figma references](#2-figma-references)
3. [Architecture](#3-architecture)
4. [Folder and file inventory](#4-folder-and-file-inventory)
5. [Public API](#5-public-api)
6. [Types and presets](#6-types-and-presets)
7. [Figma → React property mapping](#7-figma--react-property-mapping)
8. [Engine and behaviour](#8-engine-and-behaviour)
9. [Styling and tokens](#9-styling-and-tokens)
10. [Accessibility](#10-accessibility)
11. [Storybook](#11-storybook)
12. [Tests](#12-tests)
13. [Exports and package entrypoints](#13-exports-and-package-entrypoints)
14. [Migration from prior API](#14-migration-from-prior-api)
15. [Native parity reference](#15-native-parity-reference)
16. [Known gaps and pending work](#16-known-gaps-and-pending-work)
17. [Usage examples](#17-usage-examples)

---

## 1. Executive summary

The OneUI **Carousel** is a compound micropattern for hero banners, product rails, and promotional content. It was **extended in place** — not replaced — to align with the latest Figma micropattern spec (OneUI Micropatterns file).

### What was built

| Area | Detail |
|------|--------|
| **Pattern** | Single shared engine + compound subcomponents + three thin preset wrappers |
| **Wrappers** | `Carousel.Desktop`, `Carousel.Tablet`, `Carousel.Mobile` |
| **New controls** | `Pagination`, `PaginationOnMedia`, `SelectionRail`, `SelectionRailOnMedia` |
| **State** | Controlled / uncontrolled `activePage` on `Carousel.Root` |
| **Presets** | `carousel.presets.ts` with Figma defaults per design variant |
| **Stories** | 28 canvas stories + autodocs pages under `Components/Navigation/Carousel` (Badge pattern) |
| **Tests** | 19 unit tests (17 component + 2 layout helper), all passing |

### Key decisions

- **One code folder** — not three separate component folders. Desktop / Tablet / Mobile are **design presets**, not user-agent detection.
- **Embla retained** on web (existing convention). Native uses `ScrollView` paging; APIs are aligned at the prop layer.
- **Backward compatible** — existing `Carousel.Root` / `Viewport` / `Track` / `Slide` / `IndicatorList` usage unchanged.

---

## 2. Figma references

| Frame | Node ID | Purpose |
|-------|---------|---------|
| Carousel Desktop / Tablet | `4485:32652`, `4485:32657` | Desktop & tablet variant matrix |
| Carousel Mobile | `4149:75557`, `4149:75575` | Mobile variant matrix |
| Main examples page | `2391:10581` | All meaningful carousel examples & states |

**File key:** `y4r5eCoZhqvPw1U1bm2qfw` (❖ OneUI Micropatterns)

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Public entry: Carousel (compound object)                        │
│  ├── Carousel.Desktop / .Tablet / .Mobile  (preset wrappers)    │
│  ├── Carousel.Root                       (context + region)      │
│  ├── Carousel.Viewport / .Track / .Slide   (media rail)          │
│  ├── Carousel.Controls                     (chrome shell)        │
│  ├── Carousel.Pagination / .PaginationOnMedia                  │
│  ├── Carousel.SelectionRail / .SelectionRailOnMedia              │
│  └── Carousel.PrevButton / .NextButton / .PlayButton             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  useCarouselContext (Embla hook)  ←→  CarouselContext          │
│  carousel.presets.ts              ←→  Platform wrappers          │
│  carouselSelectionRailLayout.ts   ←→  SelectionRail geometry     │
│  carouselControlsParts.ts         ←→  Control child ordering     │
│  Carousel.shared.ts               ←→  Shared types & helpers     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Carousel.module.css (token-only)                                │
│  Carousel.tokens.ts / Carousel.recipe.ts / Carousel.meta.ts      │
└─────────────────────────────────────────────────────────────────┘
```

### Slide composition model

Each slide is a **layered composition**:

```
Carousel.Slide
├── Carousel.Slide.Image     (media + optional scrim gradient)
├── Carousel.Slide.Corner    (badge / play button slots — start | end)
└── Carousel.Slide.Content   (alignment + width + text + ButtonGroup)
```

Slides default to `surface="bold"` so on-media text and buttons get correct token remapping inside `[data-surface]`.

---

## 4. Folder and file inventory

All files live under **`packages/ui/src/components/Carousel/`**.

```
Carousel/
├── index.ts, Carousel.tsx, Carousel.module.css, Carousel.meta.ts
├── Carousel.recipe.ts, Carousel.tokens.ts, Carousel.shared.ts
├── carousel.presets.ts, MIGRATION.md, CAROUSEL_REPORT.md
├── core/          — CarouselRoot, Viewport, Track, Slide, context, useCarouselContext
├── controls/      — Controls, Pagination, SelectionRail, Prev/Next/Play, carouselControlsParts
├── variants/      — CarouselPlatformWrappers (Desktop / Tablet / Mobile)
├── utils/         — carouselSelectionRailLayout (+ test)
├── stories/       — Carousel.stories.tsx, platform stories, showcase, shared helpers
└── __tests__/     — Carousel.test.tsx
```

### Core compound components (`core/`)

| File | Role |
|------|------|
| `Carousel.tsx` | Compound export object wiring all subcomponents |
| `core/CarouselRoot.tsx` | Region root, context provider, layout props (`aspectRatio`, `loop`, `activePage`, …) |
| `core/CarouselViewport.tsx` | Embla overflow container (`emblaRef`) |
| `core/CarouselTrack.tsx` | Slide list; injects positional `aria-label` per slide |
| `core/CarouselSlide.tsx` | Slide shell + sub-parts: `Image`, `Content`, `Corner`, `ButtonGroup` |

### Controls (`controls/`)

| File | Role |
|------|------|
| `controls/CarouselControls.tsx` | Controls shell (`placement`, `layout`, `paginationAlign`); orders children |
| `controls/CarouselIndicatorList.tsx` | Pagination dots via `PaginationDots` |
| `controls/CarouselPagination.tsx` | Semantic alias for `IndicatorList` |
| `controls/CarouselPaginationOnMedia.tsx` | On-media pagination preset wrapper |
| `controls/CarouselSelectionRail.tsx` | Thumbnail selection rail + `CarouselSelectionRailList` |
| `controls/CarouselSelectionRailOnMedia.tsx` | On-media rail preset wrapper |
| `controls/CarouselPrevButton.tsx` | Previous nav (`IconButton`) |
| `controls/CarouselNextButton.tsx` | Next nav (`IconButton`) |
| `controls/CarouselPlayButton.tsx` | Autoplay toggle; hidden when `autoPlay` disabled |
| `controls/carouselControlsParts.ts` | Symbol-tagged control parts for layout ordering |

### Platform variants (`variants/`)

| File | Role |
|------|------|
| `variants/CarouselPlatformWrappers.tsx` | `CarouselDesktop`, `CarouselTablet`, `CarouselMobile` |

### State, types, layout helpers

| File | Role |
|------|------|
| `Carousel.context.tsx` | React context type + `useCarousel()` hook |
| `useCarouselContext.tsx` | Embla integration, controlled `activePage`, autoplay |
| `Carousel.shared.ts` | Shared types, aspect-ratio maps, height/loop helpers |
| `carousel.presets.ts` | Figma platform presets + `controlsType` resolvers |
| `carouselSelectionRailLayout.ts` | Rail geometry (sizes, peek inset, on-media height) |
| `carouselControlsParts.ts` | Symbol-tagged control parts for layout ordering |

### Styling, metadata, docs

| File | Role |
|------|------|
| `Carousel.module.css` | All component styles (token-only via `--Carousel-*` + semantic fallbacks) |
| `Carousel.tokens.ts` | Brand-overridable `--Carousel-*` token manifest |
| `Carousel.recipe.ts` | Component recipe definition for brand customization |
| `Carousel.meta.ts` | Catalog metadata (props, slots, preview matrix) |
| `MIGRATION.md` | Short migration notes for consumers |
| `CAROUSEL_REPORT.md` | This document |

### Showcase, stories, tests

| File | Role |
|------|------|
| `stories/Carousel.showcase.tsx` | Shared demo helpers (`DemoCarousel`, `DemoSlide`, `CarouselAdoptionMatrix`) — no Storybook imports |
| `Carousel.stories.tsx` | Root autodocs entry (`tags: ['autodocs']`, overview + platform presets) |
| `CarouselDesktop.stories.tsx` | Desktop variant stories |
| `CarouselTablet.stories.tsx` | Tablet variant stories |
| `CarouselMobile.stories.tsx` | Mobile variant stories |
| `stories/Carousel.stories.shared.tsx` | Shared helpers (`getCarouselStoryOptions`, `PresetCarousel`, …) |
| `__tests__/Carousel.test.tsx` | 17 component unit tests |
| `utils/carouselSelectionRailLayout.test.ts` | 2 pure layout helper tests |
| `index.ts` | Component-level public exports |

### Related code outside this folder

| Location | Relationship |
|----------|--------------|
| `packages/ui-native/src/components/Carousel/` | Native implementation; engine uses ScrollView, API mirrors web |
| `apps/qa-playground/src/components/carousel/CarouselQaShowcase.tsx` | QA playground showcase (may lag new API) |
| `packages/ui/src/index.ts` | Package barrel — **partially updated** (see [§16](#16-known-gaps-and-pending-work)) |

---

## 5. Public API

### Compound object (`Carousel`)

```ts
import { Carousel } from '@oneui/ui/components/Carousel';
// or: import { Carousel } from '@oneui/ui';  // subset exported today

Carousel.Root
Carousel.Viewport
Carousel.Track
Carousel.Slide          // + .Image, .Content, .Corner, .ButtonGroup
Carousel.Controls
Carousel.IndicatorList  // legacy name, still supported
Carousel.Pagination     // alias for IndicatorList
Carousel.PaginationOnMedia
Carousel.SelectionRail  // list wrapper (CarouselSelectionRailList)
Carousel.SelectionRailOnMedia
Carousel.PrevButton
Carousel.NextButton
Carousel.PlayButton
Carousel.Desktop
Carousel.Tablet
Carousel.Mobile
```

### Standalone named exports (`index.ts`)

```ts
export { CarouselDesktop, CarouselTablet, CarouselMobile } from './CarouselPlatformWrappers';
export { CarouselSelectionRail } from './CarouselSelectionRail';
export { useCarousel } from './Carousel.context';
export { CAROUSEL_DESKTOP_PRESET, CAROUSEL_TABLET_PRESET, CAROUSEL_MOBILE_PRESET, ... } from './carousel.presets';
```

### `Carousel.Root` props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `aria-label` | `string` | — | **Required.** Region label |
| `opts` | `CarouselOpts` | — | Embla options subset |
| `loop` | `boolean` | `false` | Wins over `opts.loop` |
| `autoPlay` | `number \| false` | `false` | Delay in ms; off by default |
| `fullWidth` | `boolean` | `false` | Edge-to-edge viewport |
| `aspectRatio` | `CarouselImageAspectRatio` | `'16:9'` | Shared slide default |
| `height` | `string` | — | CSS length when not aspect-driven |
| `followsAspectRatio` | `boolean` | `true` | Figma `height=followsAspectRatio` |
| `activePage` | `number` | — | Controlled slide index (0-based) |
| `defaultActivePage` | `number` | `0` | Uncontrolled initial index |
| `onActivePageChange` | `(index: number) => void` | — | Slide change callback |
| `className` / `style` | — | — | Root overrides |

### `CarouselOpts` (Embla subset)

| Option | Type | Default |
|--------|------|---------|
| `loop` | `boolean` | `false` |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` |
| `dragFree` | `boolean` | `false` |
| `slidesToScroll` | `number \| 'auto'` | `1` |
| `watchDrag` | `boolean` | `true` |
| `direction` | `'ltr' \| 'rtl'` | `'ltr'` |
| `peek` | `'none' \| 'prev' \| 'next' \| 'both'` | `'none'` |
| `slidesPerView` | `number` | — |

### Platform wrapper props (`Carousel.Desktop` / `.Tablet` / `.Mobile`)

Extends `CarouselRootProps` minus `children`, plus:

| Prop | Type | Notes |
|------|------|-------|
| `controlsType` | `CarouselControlsType` | Platform default: `'pagination'` |
| `items` | `readonly T[]` | Simple API data |
| `renderItem` | `(item, index) => ReactNode` | Simple API renderer |
| `children` | `ReactNode` | Composable alternative to `items` |
| `selectionRailItems` | `CarouselSelectionRailItemData[]` | Thumbnails for rail controls |
| `showNav` | `boolean` | Default `true` |
| `splitControls` | `boolean` | Default `true` (split below layout) |

### `Carousel.Slide` sub-parts

**`Slide.Image`:** `src`, `alt`, `scrim?: boolean`, `aspectRatio?`

**`Slide.Content`:** `alignment?`, `width?` (`fill | s | m | l`)

**`Slide.Corner`:** `placement: 'start' | 'end'`

**`Slide.ButtonGroup`:** `orientation?`, `width?` (`hug | wide`)

### `Carousel.Controls`

| Prop | Type | Default |
|------|------|---------|
| `placement` | `'below' \| 'onMedia'` | `'below'` |
| `layout` | `'center' \| 'split'` | `'center'` |
| `paginationAlign` | `'start' \| 'middle' \| 'end'` | — (on-media only) |

### `Carousel.SelectionRail`

| Prop | Type | Notes |
|------|------|-------|
| `items` | `{ src, alt }[]` | Required on list wrapper |
| `size` | `'s' \| 'm' \| 'l' \| 'xl' \| '2xl'` | Below-media only for `xl`/`2xl` |
| `onMedia` | `boolean` | Injected by `Controls` from `placement` |
| `aria-label` | `string` | Rail accessible name |

### `useCarousel()` context value

```ts
{
  emblaRef, selectedIndex, activePage, slideCount,
  canScrollPrev, canScrollNext, isPlaying, autoPlayEnabled,
  loop, opts, viewportWidth, slideWidth, peekColumnWidthPx,
  play, pause, scrollTo, scrollPrev, scrollNext,
  ariaLabel, aspectRatio, height, followsAspectRatio,
}
```

---

## 6. Types and presets

### Aspect ratios

**Desktop / Tablet** (`CAROUSEL_DESKTOP_ASPECT_RATIOS`):

`1:1`, `4:3`, `5:3`, `16:9`, `2:1`, `21:9`

**Mobile** (`CAROUSEL_MOBILE_ASPECT_RATIOS`):

`9:16`, `3:4`, `1:1`, `4:3`, `5:3`, `16:9`, `2:1`

**Shared full set** (`CAROUSEL_IMAGE_ASPECT_RATIOS`):

`1:2`, `9:16`, `3:4`, `1:1`, `4:3`, `5:3`, `16:9`, `2:1`, `21:9`, `flexible`

### Platform presets (`carousel.presets.ts`)

| Preset | Platform | Default aspect | Default controls | Reference width |
|--------|----------|--------------|------------------|-----------------|
| `CAROUSEL_DESKTOP_PRESET` | `desktop` | `16:9` | `pagination` (below) | 1440px |
| `CAROUSEL_TABLET_PRESET` | `tablet` | `16:9` | `pagination` (below) | 768px |
| `CAROUSEL_MOBILE_PRESET` | `mobile` | `3:4` | `pagination` (below) | 360px |

### Controls type → placement

| `controlsType` | `Carousel.Controls` placement |
|----------------|-------------------------------|
| `pagination` | `below` |
| `selectionRail` | `below` |
| `paginationOnMedia` | `onMedia` |
| `selectionRailOnMedia` | `onMedia` |
| `none` | (no controls rendered) |

### Content alignment

`startBottom` · `startMiddle` · `middleBottom` · `middleMiddle` · `middleTop`

### Height constants

| Constant | Value | Source |
|----------|-------|--------|
| `CAROUSEL_FLEXIBLE_HEIGHT_DEFAULT` | `480` | Figma mobile frame |
| `CAROUSEL_FLEXIBLE_HEIGHT_MIN` | `300` | Figma minimum |

---

## 7. Figma → React property mapping

| Figma property | React API | Notes |
|----------------|-----------|-------|
| `followsAspectRatio` | `followsAspectRatio={true}` (default) | `false` → use `height` |
| `aspectRatio` | `aspectRatio` on Root / Slide / Slide.Image | Per-platform supported sets in presets |
| `height` (custom) | `height` + `followsAspectRatio={false}` | Min 300px enforced in helpers |
| `fullWidth` | `fullWidth` on Root | |
| `controls` | Omit `Controls` or `controlsType="none"` | |
| `controlsType` | `controlsType` on platform wrappers | |
| `loop` | `loop` on Root (overrides `opts.loop`) | |
| `activePage` | `activePage` / `defaultActivePage` | 0-based in React (Figma 1-based in spec — mapped at story level) |
| `scrim` | `Slide.Image scrim={true}` | Bottom gradient via CSS |
| `contentAlignment` | `Slide.Content alignment` | |
| `contentWidth` | `Slide.Content width` | `fill \| s \| m \| l` |
| `badgesStart/End` | `Slide.Corner placement` | |
| `playButton` | `Carousel.PlayButton` in corner | |
| `buttonOrientation/Width` | `Slide.ButtonGroup` | |
| `autoplay` | `autoPlay={ms}` on Root | Off by default |
| Selection rail `size` | `SelectionRail size` | |
| Selection rail `itemCount` | Length of `items` array | |
| Mobile rail `overflow` | CSS `overflow-x: auto` on rail | Auto when items exceed container |

---

## 8. Engine and behaviour

### Scroll engine

- **Web:** [Embla Carousel](https://www.embla-carousel.com/) via `embla-carousel-react`
- **Plugins:** `embla-carousel-autoplay` when `autoPlay` is set
- **Autoplay:** `stopOnInteraction: true`, `stopOnMouseEnter: true`
- **Not used:** Native CSS `scroll-snap` as primary engine (original spec preference; Embla kept as existing repo convention)

### Navigation

| Action | Mechanism |
|--------|-----------|
| Prev / Next buttons | `emblaApi.scrollPrev()` / `scrollNext()` |
| Pagination dots | `scrollTo(index)` |
| Selection rail | `scrollTo(index)` per thumbnail |
| Drag / swipe | Embla default drag |
| Keyboard | Embla focusable viewport |
| Loop | Embla `loop: true`; disables prev/next at ends when `false` |

### Controlled state flow

```
activePage prop → useCarouselContext → emblaApi.scrollTo(page)
Embla select event → setSelectedIndex → onActivePageChange(index)
```

### Peek mode

`opts.peek` sets `data-peek` on viewport. Adjacent slides partially visible. Selection rail below-media aligns to active slide left edge via `peekAlignInset` + `ResizeObserver`.

### Reduced motion

Autoplay respects Embla plugin behaviour. Storybook `ReducedMotion` story injects CSS to preview no-transition state. True `prefers-reduced-motion` requires OS/browser setting.

---

## 9. Styling and tokens

### CSS module classes (selected)

| Class | Purpose |
|-------|---------|
| `.root` | Carousel region |
| `.viewport` / `.track` / `.slide` | Rail structure |
| `.slide[data-aspect='…']` | Aspect-ratio variants |
| `.image` / `.scrim` | Media layer |
| `.content[data-align]` / `[data-width]` | Overlay content positioning |
| `.cornerStart` / `.cornerEnd` | Badge / play slots |
| `.buttonGroup` | CTA cluster |
| `.controls[data-placement]` | Below vs on-media chrome |
| `.selectionRail` / `.selectionRailItem` | Thumbnail rail |

### Brand-overridable tokens (`--Carousel-*`)

| Token | Default | Category |
|-------|---------|----------|
| `slideRadius` | `Shape-3` | shape |
| `slideGap` | `Spacing-3-5` | spacing |
| `contentPaddingBlockStart` | `Spacing-4-5` | spacing |
| `contentPaddingBlockEnd` | `Spacing-6` | spacing |
| `contentPaddingInline` | `Spacing-4-5` | spacing |
| `contentGap` | `Spacing-2-5` | spacing |
| `contentOuterGap` | `Spacing-3-5` | spacing |
| `cornerPadding` | `Spacing-3-5` | spacing |
| `controlsGap` | `Spacing-3-5` | spacing |
| `controlsPaddingBlock` | `Spacing-3` | spacing |
| `motionDuration` | `Motion-Duration-Expressive-M` | motion |
| `motionEasing` | `Motion-Easing-Transition-Expressive` | motion |

Selection rail item sizes map to spacing tokens: `Spacing-16` (s) through `Spacing-28` (2xl).

### Known token mismatch

Slide body copy uses `--Body-FontWeight-Low`; Figma specifies medium (500) weight for some promo text. Documented in adoption matrix; not yet changed to avoid breaking existing consumers.

---

## 10. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Carousel region name | `aria-label` on `Carousel.Root` → `role="region"` + `aria-roledescription="carousel"` |
| Slide semantics | `role="group"` + `aria-roledescription="slide"` + positional label (`N of M`) |
| Control buttons | Real `<button>` elements (nav, pagination, rail thumbnails) |
| Play / pause | `PlayButton` with dynamic label when autoplay enabled |
| Focus trap | **Not used** — normal tab order preserved |
| Autoplay | Off by default; pauses on hover / interaction |
| Hidden slides | Off-screen slides remain in DOM (Embla); not `aria-hidden` per slide |

---

## 11. Storybook

### Sidebar structure (consumer-oriented, Badge-style autodocs)

```txt
Components / Navigation / Carousel / Docs          ← autodocs (Carousel.stories.tsx)
  ├── Overview · Platform Presets · Adoption Matrix

Components / Navigation / Carousel / Desktop / Docs
  ├── Default · Pagination · Pagination On Media
  ├── Selection Rail · Selection Rail On Media
  ├── Full Width · Aspect Ratios

Components / Navigation / Carousel / Tablet / Docs
  └── (same canvas stories as Desktop)

Components / Navigation / Carousel / Mobile / Docs
  └── (same as Desktop + Selection Rail Overflow)
```

No custom MDX — docs pages are generated via `tags: ['autodocs']` like Badge. Composition, states, and edge-case guidance belong in story descriptions or the root Docs autodocs page.

### Source layout

```txt
Carousel/
├── index.ts, Carousel.tsx, Carousel.module.css, …
├── core/          Root, Viewport, Track, Slide, context
├── controls/      Pagination, rails, nav buttons, …
├── variants/      CarouselPlatformWrappers (Desktop/Tablet/Mobile)
├── utils/         carouselSelectionRailLayout (+ test)
├── stories/       Carousel.stories.tsx, variant stories, showcase, shared
└── __tests__/     Carousel.test.tsx
```

### Story files

| File | Role |
|------|------|
| `Carousel.stories.tsx` | Root autodocs + overview stories |
| `CarouselDesktop.stories.tsx` | Desktop variant stories |
| `CarouselTablet.stories.tsx` | Tablet variant stories |
| `CarouselMobile.stories.tsx` | Mobile variant stories |
| `stories/Carousel.stories.shared.tsx` | Shared helpers + `createCarouselMeta` |
| `stories/Carousel.showcase.tsx` | DemoCarousel, adoption matrix |

### Showcase helpers (`stories/Carousel.showcase.tsx`)

| Export | Purpose |
|--------|---------|
| `DemoCarousel` | Configurable demo carousel (aspect, controls, peek, autoplay, …) |
| `DemoSlide` | Single demo slide with image + content |
| `CarouselAdoptionMatrix` | Visual Figma parity matrix |
| `DEMO_SLIDES` | Shared demo image data |

### Running Storybook

```bash
pnpm storybook
# Navigate to: Components → Navigation → Carousel
```

---

## 12. Tests

### Test files

| File | Tests | Focus |
|------|-------|-------|
| `Carousel.test.tsx` | 27 | Compound API, ARIA, pagination, rail, controlled state, platform wrappers, navigation, edge cases |
| `carouselSelectionRailLayout.test.ts` | 2 | Pure geometry helpers |

### Run command

```bash
pnpm --filter @oneui/ui test -- Carousel.test carouselSelectionRailLayout.test
```

**Result:** 29/29 passing

### Test suites (`Carousel.test.tsx`)

| Suite | Cases |
|-------|-------|
| Rendering & ARIA | Region label, slide groups, context guard, nav aria-labels |
| IndicatorList | PaginationDots delegation, click navigation |
| Autoplay | PlayButton pause label |
| Slide composition | Corner, content attrs, surface remapping, `middleTop`, aspect attrs |
| Pagination alias | `Carousel.Pagination` renders dots |
| SelectionRail | Thumbnail buttons wired to context |
| Controlled activePage | `onActivePageChange` on indicator click |
| Platform wrappers | `Carousel.Desktop` region + controls |
| PlayButton visibility | Hidden when autoplay off |

### Test infrastructure note

`IconButton` is **mocked** in `Carousel.test.tsx` because `@base-ui/react` ESM pulls a duplicate React instance in vitest, causing invalid hook calls. This is a **test-only workaround** — not a production change.

---

## 13. Exports and package entrypoints

### Component `index.ts` (complete)

Exports: `Carousel`, all prop types, `useCarousel`, presets, `CarouselDesktop`/`Tablet`/`Mobile`, `CarouselSelectionRail`, token/meta/recipe constants.

### Package root `packages/ui/src/index.ts`

Updated to export full public API: `CarouselDesktop`/`Tablet`/`Mobile`, selection rail types, presets, `CarouselControlsType`, `CarouselImageAspectRatio`, etc.

---

## 14. Migration from prior API

See also [`MIGRATION.md`](./MIGRATION.md).

| Before | After | Breaking? |
|--------|-------|-----------|
| `Carousel.IndicatorList` | Still works; `Carousel.Pagination` is alias | No |
| `opts.loop` only | `loop` on Root wins | No |
| Per-slide aspect only | Root `aspectRatio` shared default | No |
| No selection rail | `Carousel.SelectionRail` | Additive |
| No platform wrappers | `Carousel.Desktop` / `.Tablet` / `.Mobile` | Additive |
| `CarouselAspectRatio` type | Deprecated → `CarouselImageAspectRatio` | Soft deprecation |
| `PlayButton` always rendered | Returns `null` without `autoPlay` | Minor visual change |

---

## 15. Native parity reference

Native lives at `packages/ui-native/src/components/Carousel/`.

| Concern | Web | Native |
|---------|-----|--------|
| Engine | Embla | `ScrollView` pager + pure math helpers in `interface.ts` |
| API surface | `Carousel.shared.ts` + wrappers | `interface.ts` mirrors web types |
| Selection rail layout | `carouselSelectionRailLayout.ts` | `carouselSelectionRailLayout.native.ts` |
| Presets | `carousel.presets.ts` | `carouselRecipe.native.ts` |
| Showcase | `Carousel.showcase.tsx` | `Carousel.showcase.native.tsx` |
| Usage doc | — | `Carousel.usage.md` |

Web selection rail geometry was **ported from native** with token equivalents.

---

## 16. Known gaps and pending work

| Item | Priority | Notes |
|------|----------|-------|
| Chromatic visual regression | Medium | Run `pnpm chromatic` and bless baselines for new story groups |
| Generated platform docs | Low | `apps/platform/src/generated/design-md/*` — regenerate via platform pipeline |
| Slide body font weight | Low | `--Body-FontWeight-Low` vs Figma medium — documented, intentional |
| Global IconButton vitest fix | Low | Carousel uses test-only mock |
| Embla nav in jsdom | Low | Prev/next scroll selection not asserted in unit tests (layout-less env) |
| `Slide.Image` full Scrim props | Low | Use `<Scrim>` component for overlay/attention; `scrim={true}` is gradient shortcut |

### Uncommitted changes

All Carousel work is local modifications + new files under `packages/ui/src/components/Carousel/`. Not yet committed to git.

---

## 17. Usage examples

### Compound API (full control)

```tsx
import { Carousel } from '@oneui/ui/components/Carousel';

<Carousel.Root
  aria-label="Featured shows"
  aspectRatio="16:9"
  loop
  activePage={page}
  onActivePageChange={setPage}
>
  <Carousel.Viewport>
    <Carousel.Track>
      {slides.map((slide) => (
        <Carousel.Slide key={slide.id} surface="bold">
          <Carousel.Slide.Image src={slide.src} alt={slide.alt} scrim />
          <Carousel.Slide.Content alignment="startBottom" width="m">
            <h3>{slide.title}</h3>
            <p>{slide.description}</p>
            <Carousel.Slide.ButtonGroup orientation="horizontal" width="hug">
              <Button attention="high">Watch</Button>
            </Carousel.Slide.ButtonGroup>
          </Carousel.Slide.Content>
        </Carousel.Slide>
      ))}
    </Carousel.Track>
  </Carousel.Viewport>

  <Carousel.Controls placement="below" layout="split">
    <Carousel.Pagination />
    <Carousel.PrevButton />
    <Carousel.NextButton />
  </Carousel.Controls>
</Carousel.Root>
```

### Simple API (platform preset)

```tsx
<Carousel.Desktop
  aria-label="Hero carousel"
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

### Selection rail on media

```tsx
<Carousel.Root aria-label="Products" fullWidth aspectRatio="16:9">
  <Carousel.Viewport>
    <Carousel.Track>{/* slides */}</Carousel.Track>
    <Carousel.Controls placement="onMedia" layout="split">
      <Carousel.SelectionRailOnMedia items={thumbnails} />
      <Carousel.PrevButton />
      <Carousel.NextButton />
    </Carousel.Controls>
  </Carousel.Viewport>
</Carousel.Root>
```

### Controlled vs uncontrolled

```tsx
// Controlled
<Carousel.Root aria-label="…" activePage={page} onActivePageChange={setPage}>…</Carousel.Root>

// Uncontrolled (starts at slide 2)
<Carousel.Root aria-label="…" defaultActivePage={2}>…</Carousel.Root>
```

---

## Appendix: dependency versions

```json
{
  "embla-carousel": "^8.5.2",
  "embla-carousel-autoplay": "^8.5.2",
  "embla-carousel-react": "^8.5.2"
}
```

---

*Generated for the OneUI Studio React (`@oneui/ui`) Carousel micropattern. For migration details see [MIGRATION.md](./MIGRATION.md). For native usage see `packages/ui-native/src/components/Carousel/Carousel.usage.md`.*
