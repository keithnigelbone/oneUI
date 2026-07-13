# Carousel — React Native

Compound carousel micropattern. RN peer of `packages/ui/src/components/Carousel/*`
— uses a `ScrollView`-based paging engine instead of Embla, but the public API
matches web.

Structure:

```
Carousel (root)
├── Carousel.Item             — a slide; resolves its own surface context
│   ├── Carousel.SlideImage
│   ├── Carousel.SlideContent — headline / body / button group / badge row
├── Carousel.Controls
│   ├── Carousel.PrevButton
│   ├── Carousel.NextButton
│   ├── Carousel.PlayButton
│   └── Carousel.IndicatorList
└── Carousel.SelectionRail
```

## Props (root)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string` | — | Required accessible name for the carousel landmark. |
| `opts` | `CarouselOpts` | — | Embla-style options object (advanced). |
| `loop` | `boolean` | `false` | Prev/next + autoplay wrap from last slide to first. Takes precedence over `opts.loop`. |
| `autoPlay` | `number \| false` | `false` | Autoplay interval in ms, or disabled. |
| `fullWidth` | `boolean` | `false` | Slides stretch edge-to-edge. |
| `aspectRatio` | `CarouselImageAspectRatio` | default ratio | Shared media aspect ratio; `'flexible'` uses `height` instead. |
| `height` | `number` | — | Shared slide height in px when `aspectRatio="flexible"`. Per-slide `height` overrides. |
| `children` | `ReactNode` | — | One or more `Carousel.Item`, plus optional controls/rail. |
| `testID` | `string` | — | React Native test identifier. |
| `style` | `ViewStyle` | — | Root layout style. |

## Code examples

### Basic

```tsx
import { Carousel } from '@oneui/ui-native';

<Carousel aria-label="Featured content">
  <Carousel.Item>
    <Carousel.SlideImage src={require('./slide1.png')} alt="Slide 1" />
  </Carousel.Item>
  <Carousel.Item>
    <Carousel.SlideImage src={require('./slide2.png')} alt="Slide 2" />
  </Carousel.Item>
</Carousel>
```

### With controls and indicator dots

```tsx
<Carousel aria-label="Promotions" loop autoPlay={5000}>
  <Carousel.Item>
    <Carousel.SlideImage src={{ uri: 'https://example.com/a.jpg' }} alt="Promo A" />
    <Carousel.SlideContent>
      <Carousel.SlideButtonGroup>{/* CTA buttons */}</Carousel.SlideButtonGroup>
    </Carousel.SlideContent>
  </Carousel.Item>
  <Carousel.Controls>
    <Carousel.PrevButton />
    <Carousel.IndicatorList />
    <Carousel.NextButton />
    <Carousel.PlayButton />
  </Carousel.Controls>
</Carousel>
```

### Selection rail

```tsx
<Carousel aria-label="Browse categories">
  {/* Carousel.Item slides */}
  <Carousel.SelectionRail />
</Carousel>
```

## Accessibility

The root requires `aria-label` since there is no visual title implied by the
control. Slides expose position/label live-region updates
(`getCarouselTrackLiveRegionProps`, `formatCarouselSlidePosition`) as paging
occurs. Prev/Next/Play controls render as buttons with their own accessible
labels. Reduced-motion preference is honoured for autoplay and slide-scroll
animation.
