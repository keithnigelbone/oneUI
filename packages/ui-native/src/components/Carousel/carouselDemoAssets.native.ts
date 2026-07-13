/**
 * Bundled carousel demo images — peers of Storybook `public/carousel-demo/*`.
 * Assets live in `apps/native-components-sample/assets/carousel-demo/` and are
 * resolved here when the sample app bundles `@oneui/ui-native/showcase/Carousel`.
 * Keep filenames in sync with `Carousel.showcase.tsx` (`slide-1.jpg` … `slide-5.jpg`).
 */

import type { ImageSourcePropType } from 'react-native';

export const CAROUSEL_DEMO_IMAGE_SOURCES: readonly ImageSourcePropType[] = [
  require('../../../../../apps/native-components-sample/assets/carousel-demo/slide-1.jpg'),
  require('../../../../../apps/native-components-sample/assets/carousel-demo/slide-2.jpg'),
  require('../../../../../apps/native-components-sample/assets/carousel-demo/slide-3.jpg'),
  require('../../../../../apps/native-components-sample/assets/carousel-demo/slide-4.jpg'),
  require('../../../../../apps/native-components-sample/assets/carousel-demo/slide-5.jpg'),
] as const;
