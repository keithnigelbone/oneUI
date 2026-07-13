# Carousel — Figma variant × token matrix

Reference design: [OneUI Micropatterns — Carousel](https://www.figma.com/design/y4r5eCoZhqvPw1U1bm2qfw/%E2%9D%96-OneUI-Micropatterns?node-id=2775-10888&m=dev)

| Field | Value |
|-------|-------|
| Figma file key | `y4r5eCoZhqvPw1U1bm2qfw` |
| Carousel page | `2391:10581` — `🟢 ↳ Carousel` |
| Linked node (user URL) | `2775:10888` — `.Carousel/heightFollowsAspectRatio` variant `⛔️⛔️⛔️=360, controlsPosition=none, controlsType=none` |
| Code reference (read-only) | `packages/ui/src/components/Carousel/` · `Carousel.module.css` · `Carousel.tokens.ts` · `Carousel.recipe.ts` |

This document maps **every combination modelled in Figma** to the **design tokens** that govern each visual decision. No code changes — specification only.

---

## 1. Figma component inventory

The Carousel page is organised as nested component sets. Each set below lists its variant axes and symbol count.

### 1.1 Root carousel shells

| Component set | Node | Variant axes | Variants |
|---------------|------|--------------|----------|
| `[WIP] Carousel` | `2775:11923` | `height` | `followsAspectRatio`, `custom` |
| `.Carousel/heightFollowsAspectRatio` | `2775:10887` | screen width × `controlsPosition` × `controlsType` | **25** |
| `.Carousel/heightCustom` | `2775:10923` | screen width × `controlsPosition` × `controlsType` | **25** |

**Screen width axis** (`⛔️⛔️⛔️` in Figma — maps to `data-7-Platform` breakpoints):

| Figma value | Typical platform |
|-------------|------------------|
| `360` | Mobile |
| `768` | Tablet portrait |
| `1024` | Tablet landscape / small desktop |
| `1440` | Desktop |
| `1920` | Large desktop |

**`controlsPosition`:**

| Figma | OneUI prop | Notes |
|-------|------------|-------|
| `none` | omit `Carousel.Controls` | No navigation chrome |
| `below` | `placement="below"` | Controls row under the viewport |
| `onMedia` | `placement="onMedia"` | Controls overlaid on slide image |

**`controlsType`:**

| Figma | OneUI equivalent | Shipped? |
|-------|------------------|----------|
| `none` | — | yes (no controls) |
| `pagination` | `Carousel.IndicatorList` + `PrevButton` + `NextButton` | yes |
| `selectionRail` | thumbnail rail below/on media | **not yet** in `@oneui/ui` |

### 1.2 Rail (slide track + peek + alignment)

| Component set | Node | Variant axes |
|---------------|------|--------------|
| `.Rail/heightFollowsAspectRatio/controlsOnMediaFalse/mobileTrue` | `2775:11158` | `fullWidth` × `alignment` |
| `.Rail/heightFollowsAspectRatio/controlsOnMediaTrue/mobileTrue` | `2775:11249` | `fullWidth` × `alignment` |
| `.Rail/heightFollowsAspectRatio/controlsOnMediaFalse/mobileFalse` | `2775:11647` | `fullWidth` × `alignment` |
| `.Rail/heightFollowsAspectRatio/controlsOnMediaTrue/mobileFalse` | `2775:11546` | `fullWidth` × `alignment` |
| `.Rail/heightCustom/controlsOnMediaFalse/mobileTrue` | `2775:10959` | `fullWidth` × `alignment` |
| `.Rail/heightCustom/controlsOnMediaTrue/mobileTrue` | `2775:11050` | `fullWidth` × `alignment` |
| `.Rail/heightCustom/controlsOnMediaFalse/mobileFalse` | `2775:11354` | `fullWidth` × `alignment` |
| `.Rail/heightCustom/controlsOnMediaTrue/mobileFalse` | `2775:11445` | `fullWidth` × `alignment` |
| `.Rail/*/selectionRailOnMediaTrue/*` | several | `fullWidth` × `alignment` (selection-rail layouts only) |

**`fullWidth`:**

| Figma | OneUI | Tokens |
|-------|-------|--------|
| `false` | `fullWidth={false}` (default) | Slide sits inside page margin; peek uses `ItemPrev` / `ItemNext` gutters |
| `true` | `fullWidth={true}` | `--Spacing-Margin` negative inset on root: `margin-inline: calc(var(--Spacing-Margin) * -1)` |

**`alignment` (content anchor on slide):**

| Figma | OneUI `Slide.Content alignment` | Shipped? |
|-------|-----------------------------------|----------|
| `startBottom` | `startBottom` | yes |
| `startMiddle` | `startMiddle` | yes |
| `middleBottom` | `middleBottom` | yes |
| `middleMiddle` | `middleMiddle` | yes |
| `middleTop` | `middleTop` | native yes; web pending |

### 1.3 Slide image aspect ratios

| Symbol | Node | Figma ratio | OneUI (native `Slide.Image aspectRatio`) | Shipped? |
|--------|------|-------------|---------------------|----------|
| `.CarouselImage/1:2` | `2802:43549` | 1:2 | `1:2` | yes |
| `.CarouselImage/9:16` | `2775:10381` | 9:16 | `9:16` | yes |
| `.CarouselImage/3:4` | `2775:10379` | 3:4 | `3:4` | yes (**native default**) |
| `.CarouselImage/1:1` | `2775:10383` | 1:1 | `1:1` | yes |
| `.CarouselImage/4:3` | `2775:10385` | 4:3 | `4:3` | yes |
| `.CarouselImage/5:3` | `2832:19238` | 5:3 | `5:3` | yes |
| `.CarouselImage/16:9` | `2775:10387` | 16:9 | `16:9` | yes |
| `.CarouselImage/2:1` | `2775:10389` | 2:1 | `2:1` | yes |
| `.CarouselImage/21:9` | `2775:10391` | 21:9 | `21:9` | yes |
| `.CarouselImage/auto` | `2775:10393` | auto height | `flexible` | yes |

**Height mode interaction:**

| `[WIP] Carousel height` | Behaviour | Tokens |
|-------------------------|-----------|--------|
| `followsAspectRatio` | Slide height follows image media frame | Native: `aspectRatio` on `Slide.Image`; web: `aspectRatio` on `Slide` (`data-aspect` on `.slide`) |
| `custom` | Fixed slide height per breakpoint (e.g. 480 @ 360, 600 @ 768) | `Slide height` prop / custom CSS — Figma uses explicit frame heights |

### 1.4 Content block

Five alignment-specific sets, each with four width variants:

| Set | Node | `contentWidth` variants |
|-----|------|-------------------------|
| `.ContentBlock/startBottom` | `2775:11738` | `fill`, `l`, `m`, `s` |
| `.ContentBlock/startMiddle` | `2775:11775` | `fill`, `l`, `m`, `s` |
| `.ContentBlock/middleBottom` | `2775:11816` | `fill`, `l`, `m`, `s` |
| `.ContentBlock/middleMiddle` | `2775:11853` | `fill`, `l`, `m`, `s` |
| `.ContentBlock/middleTop` | `2775:11890` | `fill`, `l`, `m`, `s` |

| Figma `contentWidth` | OneUI `width` | Max-width rule |
|----------------------|---------------|----------------|
| `fill` | `fill` | `inset-inline: 0` (100%) |
| `s` | `s` | `max-width: 33%` |
| `m` | `m` | `max-width: 50%` (canonical default) |
| `l` | `l` | `max-width: 66%` |

### 1.5 Button group

| Component set | Node | Variants |
|---------------|------|----------|
| `.ButtonGroup` | `2775:10360` | `buttonWidth` × `buttonOrientation` |

| Figma | OneUI | Tokens |
|-------|-------|--------|
| `buttonWidth=hug` | `width="hug"` | Buttons size to content |
| `buttonWidth=wide` | `width="wide"` | Children `flex: 1 1 0` |
| `buttonOrientation=horizontal` | `orientation="horizontal"` | `gap: --Spacing-2-5` |
| `buttonOrientation=vertical` | `orientation="vertical"` | `flex-direction: column; align-items: stretch` |

### 1.6 Controls chrome

| Component set | Node | Variants |
|---------------|------|----------|
| `.CarouselControls/below/mobileFalse` | `2775:10863` | `autoplay=false\|true` |
| `.CarouselControls/below/mobileTrue` | `2775:10878` | `autoplay=false\|true` |
| `.CarouselControls/onMedia/FullWidthTrue/paginationDotsStart` | `2775:10762` | `autoplay` × `paginationDots` position |
| `.CarouselControls/onMedia/FullWidthFalse/paginationDotsStart` | `2775:10827` | same |
| `.CarouselControls/onMedia/*/paginationDotsMiddle` | `2775:10716`, `2775:10798` | dots centred between arrows |
| `.CarouselControls/onMedia/mobileTrue` | `2775:10745` | compact 40px-tall on-media row |

**Pagination dot position (Figma only — partial OneUI mapping):**

| Figma `paginationDots` | Figma layout | OneUI `layout` | Shipped default |
|------------------------|--------------|----------------|-----------------|
| `start` | dots left, arrows right | `split` | **yes** (canonical) |
| `end` | dots right | — | no |
| `middle` | dots centred, arrows at ends | — | no (intentionally not default) |
| `none` | arrows only | — | partial (omit `IndicatorList`) |

### 1.7 Selection rail (Figma-only control type)

| Component set | Node | Variants |
|---------------|------|----------|
| `.CarouselSelectionRail.Item/1:1` | `2801:40275` | `active` × `surface` (`opaque` / `transparent`) |
| `.CarouselSelectionRail/onMediaTrue/mobileTrue` | `2818:50556` | layout for on-media thumbnail strip |
| `.CarouselSelectionRail/onMediaFalse/mobileTrue` | `2818:52549` | layout for below-media thumbnail strip |
| `.CarouselSelectionRail/onMediaTrue/mobileFalse` | `2824:57207` | desktop on-media |
| `.CarouselSelectionRail/onMediaFalse/mobileFalse` | `2824:57226` | desktop below |

---

## 2. Master combination matrix (`.Carousel/*` shells)

Both `heightFollowsAspectRatio` and `heightCustom` share the same **25-variant** cross-product:

```
screenWidth ∈ {360, 768, 1024, 1440, 1920}
controlsPosition ∈ {none, below, onMedia}
controlsType ∈ {none, pagination, selectionRail}
```

Valid combinations (controlsType=`none` only pairs with `controlsPosition=none`):

| # | Screen | Position | Type | Figma example node |
|---|--------|----------|------|-------------------|
| 1 | 360 | none | none | `2775:10888` |
| 2 | 768 | none | none | `2775:10890` |
| 3 | 1024 | none | none | `2775:10902` |
| 4 | 1440 | none | none | `2775:10909` |
| 5 | 1920 | none | none | `2775:10916` |
| 6 | 360 | below | pagination | `2775:10892` |
| 7 | 768 | below | pagination | `2775:10897` |
| 8 | 1024 | below | pagination | `2775:10904` |
| 9 | 1440 | below | pagination | `2775:10911` |
| 10 | 1920 | below | pagination | `2775:10918` |
| 11 | 360 | onMedia | pagination | `2775:10895` |
| 12 | 768 | onMedia | pagination | `2775:10900` |
| 13 | 1024 | onMedia | pagination | `2775:10907` |
| 14 | 1440 | onMedia | pagination | `2775:10914` |
| 15 | 1920 | onMedia | pagination | `2775:10921` |
| 16 | 360 | below | selectionRail | `2818:53153` |
| 17 | 768 | below | selectionRail | `2825:60139` |
| 18 | 1024 | below | selectionRail | `2827:17961` |
| 19 | 1440 | below | selectionRail | `2827:18284` |
| 20 | 1920 | below | selectionRail | `2827:18509` |
| 21 | 360 | onMedia | selectionRail | `2818:53440` |
| 22 | 768 | onMedia | selectionRail | `2825:60428` |
| 23 | 1024 | onMedia | selectionRail | `2827:22971` |
| 24 | 1440 | onMedia | selectionRail | `2834:19807` |
| 25 | 1920 | onMedia | selectionRail | `2834:20055` |

Each shell composes further with **Rail** variants (peek via `ItemPrev`/`ItemNext`, alignment, fullWidth), **CarouselImage** ratio, **ContentBlock** width, and optional slots (badges, PlayButton, ButtonGroup).

---

## 3. Token map by layer

### 3.1 Viewport & track

| Visual property | Figma variable | OneUI CSS token | Default |
|---------------|--------------|-----------------|---------|
| Viewport corner radius | `dimensions/shape/3` | `--Carousel-Viewport-borderRadius` → `--Carousel-Slide-borderRadius` → `--Shape-3` | `Shape-3` (12px @ mobile) |
| Slide corner radius | `dimensions/shape/3` | `--Carousel-Slide-borderRadius` → `--Shape-3` | `Shape-3` |
| Inter-slide gap | `dimensions/spacings/3-5` (track) | `--Carousel-Slide-Gap` → `--Spacing-3-5` | `Spacing-3-5` |
| Peek inset (adjacent slide visible) | `dimensions/grid/gutter` (8) × 2 = 16px rail gutters | `flex-basis: calc(100% - var(--Spacing-12))` when `data-peek` set | `Spacing-12` offset |
| Full-bleed breakout | `dimensions/grid/margin` | `margin-inline: calc(var(--Spacing-Margin) * -1)` on `[data-fullwidth=true]` | `Spacing-Margin` (16) |
| Slide transition | — | `--Carousel-Motion-Duration` → `--Motion-Duration-Expressive-M` | expressive M |
| Slide easing | — | `--Carousel-Motion-Easing` → `--Motion-Easing-Transition-Expressive` | expressive transition |

**Brand recipe (`slideShape`):**

| Recipe option | Token emitted | Value |
|---------------|---------------|-------|
| `soft` (default) | `slideRadius` | `Shape-3` |
| `roomy` | `slideRadius` | `Shape-4-5` |
| `sharp` | `slideRadius` | `Shape-0` |

### 3.2 Slide image & scrim

| Visual property | Figma variable | OneUI CSS token | Default |
|---------------|--------------|-----------------|---------|
| Image fit | — | `object-fit: cover` | — |
| Image alt (a11y, hidden) | `label/XS/medium` | `Label-XS` typography on sr-only alt layer | — |
| Scrim direction | gradient to top | `--Carousel-Scrim-Direction` | `to top` |
| Scrim from colour | neutral bold @ 70% | `--Carousel-Scrim-FromColor` → `color-mix(in oklch, var(--Neutral-Bold) 70%, transparent)` | `--Neutral-Bold` |
| Scrim to colour | transparent | `--Carousel-Scrim-ToColor` | `transparent` |
| Slide fallback fill | — | `background-color: var(--Surface-Subtle)` | `--Surface-Subtle` |

### 3.3 Content overlay (`ContentBlock` / `Slide.Content`)

Measured on node `2775:11167` and `2775:11739` (mobile @ 360):

| Visual property | Figma variable | OneUI CSS token | Default (balanced recipe) |
|---------------|--------------|-----------------|---------------------------|
| Wrapper padding (all sides) | `dimensions/spacings/4` (16) | `--Carousel-Content-PaddingInline` / block start | `Spacing-4-5` (18) — see note¹ |
| Bottom content inset | `dimensions/spacings/6` (24) | `--Carousel-Content-PaddingBlockEnd` | `Spacing-6` |
| Top content inset | — | `--Carousel-Content-PaddingBlockStart` | `Spacing-4-5` |
| Title cluster inner gap (badge → headline → body) | `dimensions/spacings/2` (8) | `--Carousel-Content-Gap` | `Spacing-2-5` |
| Title cluster ↔ button group gap | `dimensions/spacings/3` (12) + button `pt` Spacing-2 | `buttonGroupPaddingTop` | `Spacing-2` |
| Badges row ↔ content wrapper | `dimensions/spacings/3` (12) | `badgesToContentGap` | `Spacing-3` |
| On-image text colour | `colour/content/high` (#fff) | `--Carousel-Slide-OnImage-Color` → `--Text-On-Bold-High` | `Text-On-Bold-High` |

**Typography (shared across alignments — hierarchy from size/weight, not colour):**

| Element | Figma text style | OneUI tokens |
|---------|------------------|--------------|
| Headline | `headline/L` (Black 900, 28/28) | `--Headline-L-FontSize`, `--Headline-L-LineHeight`, `--Headline-L-FontWeight`, `--Headline-FontFamily` |
| Body | `body/M/medium` (500, 16/22) | `--Body-M-FontSize`, `--Body-M-LineHeight`, `--Body-FontWeight-Low`² |
| Button label | `label/M/high` (Bold 700, 16/16) | Button internal `--Label-M-*` via `Button` component |
| Image alt | `label/XS/medium` | `--Label-XS-*` |

² Figma uses Medium (500) for body on slides; OneUI implementation uses `--Body-FontWeight-Low` — verify against brand parity if matching Figma exactly.

**Brand recipe (`contentRhythm`):**

| Recipe | `contentPaddingBlockStart` | `contentPaddingBlockEnd` | `contentPaddingInline` | `contentGap` | `contentOuterGap` |
|--------|---------------------------|-------------------------|------------------------|--------------|-------------------|
| `compact` | `Spacing-4` | `Spacing-4-5` | `Spacing-4` | `Spacing-2` | `Spacing-3` |
| `balanced` (default) | `Spacing-4-5` | `Spacing-6` | `Spacing-4-5` | `Spacing-2-5` | `Spacing-3-5` |
| `spacious` | `Spacing-6` | `Spacing-8` | `Spacing-6` | `Spacing-3-5` | `Spacing-4-5` |

### 3.4 Corner slots (`badgesStart` / `badgesEnd` / PlayButton)

| Visual property | Figma variable | OneUI CSS token | Default |
|---------------|--------------|-----------------|---------|
| Corner padding | `dimensions/spacings/3-5` | `--Carousel-Corner-Padding` → `--Spacing-3-5` | `Spacing-3-5` |
| Corner item gap | `dimensions/spacings/2-5` | `gap: var(--Spacing-2-5)` | `Spacing-2-5` |
| Play button size | 48×48 | `IconButton` default touch target | platform min 44 |

### 3.5 Button group on slide

Buttons sit on **imagery**, not a coloured surface — OneUI re-anchors role tokens to root-only Fill variants:

| Button variant | Figma fill | OneUI override on `.buttonGroup` |
|----------------|------------|----------------------------------|
| Bold (primary CTA) | `colour/surface/surface` (Primary Bold) | `--Primary-Bold` → `--Primary-Fill-Bold`; text `--Button-textColor-bold` → `--Text-On-Bold-High` |
| Subtle (secondary) | tinted subtle surface | `--Primary-Subtle` → `--Primary-Fill-Subtle`; text `--Button-textColor-subtle` → `--Primary-Fill-Bold` |
| Ghost (icon share) | transparent | `--Button-textColor-ghost` → `--Text-On-Bold-High` |
| Button shape | `dimensions/shape/pill` | `--Button-borderRadius` → `--Shape-Pill` |
| Button min height | `dimensions/spacings/10` (40) | Button size tokens |
| Horizontal gap | 8px | `--Spacing-2-5` |

### 3.6 Controls row

#### Below placement (`controlsPosition=below`)

| Visual property | Figma variable (node `2775:10892`) | OneUI CSS token | Default |
|---------------|-----------------------------------|-----------------|---------|
| Row gap | `dimensions/spacings/3` | `--Carousel-Controls-Gap` → `--Spacing-3-5` | `Spacing-3-5` |
| Block padding (top + bottom) | `dimensions/spacings/3` (mobile) / `1-5` (6) desktop | `--Carousel-Controls-PaddingBlock` → `--Spacing-3` | `Spacing-3` |
| Layout | dots start, arrows end | `layout="split"` | `split` |
| Control height | 40px | `IconButton` 32px + vertical centre | — |
| Autoplay | play/pause `IconButton` | `Carousel.PlayButton` | shown when `autoPlay` set |

#### On-media placement (`controlsPosition=onMedia`)

| Visual property | Figma variable (node `2775:10762`) | OneUI CSS token | Default |
|---------------|-----------------------------------|-----------------|---------|
| Bottom inset | `dimensions/spacings/6` (24) | shares `--Carousel-Content-PaddingBlockEnd` | `Spacing-6` |
| Inline inset | `dimensions/spacings/4` (16) | `--Carousel-Content-PaddingInline` | `Spacing-4-5` |
| Spacer reserved for controls | `spacerOnMediaControls` height 40 | absolute controls row at bottom | 40px |
| Split layout centre trick | dots absolutely centred | `[data-layout=split] > :first-child` centred | `split` |
| Pagination dots | `PaginationDots` component | `Carousel.IndicatorList` | — |
| Prev / Next | `IconButton` chevrons | `Carousel.PrevButton` / `NextButton` | ghost on media |

**On-media icon colours (Figma node `2775:10762`):**

| Element | Figma variable | Maps to |
|---------|--------------|---------|
| Dot active | `colour/content [surface]/bold` | `--Primary-Bold` |
| Dot inactive | `colour/content [surface]/subtle` @ 45% | `--Primary-Subtle` |
| Arrow buttons | ghost on scrim | `IconButton variant="ghost"` + on-image tokens |

---

## 4. Combination → token quick reference

Use this when picking a Figma variant and needing the token stack.

### 4.1 Canonical mobile hero (user-linked node `2775:10888`)

```
height=followsAspectRatio
screenWidth=360
controlsPosition=none
controlsType=none
aspectRatio=3:4 (image 360×480)
fullWidth=false (peek: ItemPrev 16px + ItemCurrent 328px + ItemNext 16px)
alignment=startBottom
contentWidth=m
```

| Layer | Tokens |
|-------|--------|
| Slide shape | `--Shape-3` |
| Track gap | `--Spacing-3-5` |
| Peek gutter | `--Spacing-Gutter` (8) padding on ItemPrev/Next |
| Scrim | `--Neutral-Bold` @ 70% → transparent, `to top` |
| Headline / body | `--Headline-L-*`, `--Body-M-*`, `--Text-On-Bold-High` |
| Content padding | `--Spacing-4-5` inline, `--Spacing-4-5` top, `--Spacing-6` bottom |
| Content gaps | `--Spacing-2-5` inner, `--Spacing-3-5` outer |
| CTA button | `--Primary-Fill-Bold` fill, `--Text-On-Bold-High` text, `--Shape-Pill` |

### 4.2 Below controls + pagination (desktop split)

```
controlsPosition=below
controlsType=pagination
layout=split (paginationDots=start)
autoplay=false
```

| Layer | Tokens |
|-------|--------|
| Controls padding | `--Spacing-3` block |
| Controls gap | `--Spacing-3-5` |
| Indicators | `PaginationDots` (uses `--Primary-*` role tokens) |
| Arrows | `IconButton` on page surface (not on-image overrides) |

### 4.3 On-media controls + pagination

```
controlsPosition=onMedia
controlsType=pagination
fullWidth=false
spacerOnMediaControls=40
```

| Layer | Tokens |
|-------|--------|
| Controls position | `bottom: --Spacing-6`, `inset-inline: --Spacing-4-5` |
| Dots (split) | centred via absolute positioning |
| Arrows | `justify-content: flex-end` cluster |

### 4.4 Centred promo slide

```
alignment=middleMiddle
contentWidth=m
+ Badge + headline + body + ButtonGroup (hug, horizontal)
```

| Layer | Tokens |
|-------|--------|
| Content alignment | `align-items: center`, `text-align: center` |
| Button group | `justify-content: center` when horizontal + middle alignment |
| All text | same `--Text-On-Bold-High` (no separate subtitle colour) |

### 4.5 Full-width edge-to-edge

```
fullWidth=true
```

| Layer | Tokens |
|-------|--------|
| Root | `margin-inline: calc(var(--Spacing-Margin) * -1)` |
| Slide | bleeds to viewport edge; shape tokens still apply unless editorial sharp layout |

### 4.6 Selection rail (Figma only — not in OneUI Carousel yet)

```
controlsType=selectionRail
```

| Layer | Tokens (from Figma) |
|-------|---------------------|
| Thumbnail item | 1:1 aspect, `Shape-3` radius |
| Active state | `active=true` — stroke / elevation from selection rail item set |
| Surface | `opaque` vs `transparent` thumbnail backgrounds |
| Rail gap | `dimensions/spacings/3` between items |

---

## 5. Figma variable → OneUI token translation table

| Figma variable path | Resolved example | OneUI token |
|--------------------|------------------|---------------|
| `dimensions/shape/3` | 12 | `--Shape-3` |
| `dimensions/shape/pill` | 9999 | `--Shape-Pill` |
| `dimensions/shape/0` | 0 | `--Shape-0` |
| `dimensions/spacings/0` | 0 | `--Spacing-0` |
| `dimensions/spacings/1` | 4 | `--Spacing-1` |
| `dimensions/spacings/2` | 8 | `--Spacing-2` |
| `dimensions/spacings/3` | 12 | `--Spacing-3` |
| `dimensions/spacings/4` | 16 | `--Spacing-4` |
| `dimensions/spacings/5` | 20 | `--Spacing-5` |
| `dimensions/spacings/6` | 24 | `--Spacing-6` |
| `dimensions/spacings/8` | 32 | `--Spacing-8` |
| `dimensions/spacings/9` | 36 | `--Spacing-9` |
| `dimensions/spacings/10` | 40 | `--Spacing-10` |
| `dimensions/grid/gutter` | 8 | `--Spacing-Gutter` |
| `dimensions/grid/margin` | 16 | `--Spacing-Margin` |
| `dimensions/grid/screenWidth` | 360 | platform breakpoint (mobile) |
| `dimensions/strokes/S` | 0.5 | `--Stroke-S` |
| `dimensions/strokes/2XL` | 3 | `--Stroke-2XL` |
| `colour/content/high` | #ffffff | `--Text-On-Bold-High` (on image) |
| `colour/content/tintedA11y` | role-dependent | `--Primary-Bold-High` / button text |
| `colour/surface/surface` | Primary bold fill | `--Primary-Fill-Bold` / `--Primary-Bold` |
| `typography/fontFamily/headline` | JioType Var | `--Headline-FontFamily` / `--Typography-Font-Primary` |
| `typography/fontSize/headline/L` | 28 | `--Headline-L-FontSize` |
| `typography/lineHeight/headline/L` | 28 | `--Headline-L-LineHeight` |
| `typography/fontWeight/headline/L` | 900 | `--Headline-L-FontWeight` |
| `typography/fontSize/body/M` | 16 | `--Body-M-FontSize` |
| `typography/lineHeight/body/M` | 22 | `--Body-M-LineHeight` |
| `typography/fontSize/label/M` | 16 | `--Label-M-FontSize` (buttons) |
| `typography/fontSize/label/XS` | 12 | `--Label-XS-FontSize` (image alt) |
| `interaction/focusRing/*` | 4px spread | `--Focus-Outline-Width`, `--Focus-Outline`, `--Surface-Halo-Gap` |

---

## 6. OneUI `--Carousel-*` override surface

All brand-customisable carousel tokens (from `Carousel.tokens.ts`) and their CSS custom property names:

| Token key | CSS variable | Category |
|-----------|--------------|----------|
| `slideRadius` | `--Carousel-Slide-borderRadius` | shape |
| `slideGap` | `--Carousel-Slide-Gap` | spacing |
| `contentPaddingBlockStart` | `--Carousel-Content-PaddingBlockStart` | spacing |
| `contentPaddingBlockEnd` | `--Carousel-Content-PaddingBlockEnd` | spacing |
| `contentPaddingInline` | `--Carousel-Content-PaddingInline` | spacing |
| `contentGap` | `--Carousel-Content-Gap` | spacing |
| `contentOuterGap` | `--Carousel-Content-OuterGap` | spacing |
| `cornerPadding` | `--Carousel-Corner-Padding` | spacing |
| `controlsGap` | `--Carousel-Controls-Gap` | spacing |
| `controlsPaddingBlock` | `--Carousel-Controls-PaddingBlock` | spacing |
| `slideOnImageColor` | `--Carousel-Slide-OnImage-Color` | color |
| `scrimDirection` | `--Carousel-Scrim-Direction` | color |
| `scrimFromColor` | `--Carousel-Scrim-FromColor` | color |
| `scrimToColor` | `--Carousel-Scrim-ToColor` | color |
| `motionDuration` | `--Carousel-Motion-Duration` | motion |
| `motionEasing` | `--Carousel-Motion-Easing` | motion |
| (viewport inherits slide) | `--Carousel-Viewport-borderRadius` | shape |

---

## 7. Figma ↔ OneUI coverage gaps

| Figma combination | OneUI status |
|-------------------|--------------|
| `controlsType=selectionRail` | Not implemented |
| `alignment=middleTop` | Native only (`middleTop`); web `CarouselAlignment` pending |
| `paginationDots=middle\|end` centred layouts | Not default; split/start only |
| Aspect ratios `1:2`, `5:3`, `2:1`, `21:9` | Native only — `Slide.Image` + `CarouselImageAspectRatio`; web union unchanged |
| `height=custom` fixed heights per breakpoint | Partial (`aspectRatio=custom` exists; fixed heights need explicit `height` prop) |
| `ContentBlock` badge slots (`badgesStart` / `badgesEnd`) | Supported via `Item.BadgeRow` + content badge |
| Autoplay pause on hover | Web yes (Embla); native manual only |

---

## 8. Notes

¹ **Spacing-4 vs Spacing-4-5:** Figma `ContentBlockWrapper` uses `dimensions/spacings/4` (16px) on the canonical 360 variant. OneUI defaults to `--Spacing-4-5` (18px) for content padding — a deliberate f-step alignment with the dimension cascade. Use the `contentRhythm` recipe or `--Carousel-Content-PaddingInline` override to match Figma pixel-exact if needed.

² **Body weight:** Figma slide body uses Medium (500); OneUI `Carousel.module.css` applies `--Body-FontWeight-Low`. Confirm with design if parity should switch to `--Body-FontWeight-Medium`.

---

## 9. Related docs

- [carousel-web-native-parity.md](./carousel-web-native-parity.md) — shipped web/native story map
- Figma libraries: `Core/JioPatterns` → `Carousel` component set (`componentKey: 30186433…`)
- Storybook: `Components/Navigation/Carousel [WIP]`
