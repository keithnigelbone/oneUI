/**
 * Minimal JDS-shaped glyphs for Button showcase only — paths copied from
 * `@jds/core-icons--react-native` IcFavorite / IcAdd (v0.0.5) so ui-native
 * does not depend on that package.
 *
 * Use via the design-system Icon:
 *   `<Icon icon={IcFavoriteGlyph} appearance='neutral' />` — color is
 *   derived from `appearance` × surrounding surface context.
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconComponent } from '@oneui/shared';

/** @jds/core-icons--react-native — IcFavorite */
const IC_FAVORITE_PATH =
  'M15.6 4A5.6 5.6 0 0012 5.46 5.6 5.6 0 008.4 4 5.36 5.36 0 003 9.44c0 3.37 2.63 6.43 7.16 10.56l.49.45a2 2 0 002.7 0l.49-.44C18.37 15.86 21 12.8 21 9.44A5.36 5.36 0 0015.6 4z';

/** @jds/core-icons--react-native — IcAdd */
const IC_ADD_PATH =
  'M20 11h-7V4a1 1 0 00-2 0v7H4a1 1 0 000 2h7v7a1 1 0 002 0v-7h7a1 1 0 000-2z';

export const IcFavoriteGlyph: IconComponent = ({ size = 24, color = 'currentColor', fill }) => (
  <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
    <Path d={IC_FAVORITE_PATH} fill={fill ?? color} />
  </Svg>
);

export const IcAddGlyph: IconComponent = ({ size = 24, color = 'currentColor', fill }) => (
  <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
    <Path d={IC_ADD_PATH} fill={fill ?? color} />
  </Svg>
);
