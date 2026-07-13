# Carousel Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Multi-brand carousel micropattern. Wraps Embla Carousel under a compound API (Root / Viewport / Track / Slide / Controls / IndicatorList / Prev/Next/PlayButton). Slides are layered compositions: image + scrim + content (badge / headline / body / button group) + corner slots. Surface-context-aware so content remaps tokens on tinted or dark slides.
- **Task contexts**: 
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: image, content, cornerStart, cornerEnd, controls
- **Forbids**: 

## Variant Logic

- **below**: use when Controls below
- **onMedia**: use when Controls on media

## Relationships and Dependencies

- **Related**: 
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: 
- **Health**: a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |


## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `image` | image, video | `slideRadius` |
| `content` | headline, body, badge, buttonGroup | `contentPaddingBlockStart`, `contentPaddingBlockEnd`, `contentPaddingInline`, `contentGap`, `contentOuterGap` |
| `cornerStart` | badge, iconButton, custom | `cornerPadding` |
| `cornerEnd` | badge, iconButton, playButton, custom | `cornerPadding` |

## Code Snippets

### Basic Usage

```tsx
import { Carousel } from '@oneui/ui';

<Carousel />
```
