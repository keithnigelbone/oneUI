/**
 * Bundled-font mapping for qa-native — mirrors
 * `apps/native-components-sample/src/fonts/bundledFontFamilies.ts`.
 *
 * Expo `useFonts` keys for the bundled JioType cuts under
 * `assets/fonts/JioType/`. CSS weight stops without a matching file snap
 * to the nearest bundled cut (e.g. 200 → Hairline, 600 → Bold) so
 * `useTypographyTokens` always resolves to a registered family.
 */

import type { StaticWeightFamilyMap } from '@oneui/shared/engine';

export const BUNDLED_JIOTYPE_WEIGHT_FAMILIES: StaticWeightFamilyMap = {
  100: 'JioType-Hairline',
  200: 'JioType-Hairline',
  300: 'JioType-Light',
  400: 'JioType',
  500: 'JioType-Medium',
  600: 'JioType-Bold',
  700: 'JioType-Bold',
  800: 'JioType-ExtraBlack',
  900: 'JioType-Black',
};

/** All bundled JioType `.ttf` files — pass to `expo-font` `useFonts`. */
export const JIOTYPE_BUNDLED_FONT_FILES = {
  JioType: require('../../assets/fonts/JioType/JioType.ttf'),
  'JioType-Hairline': require('../../assets/fonts/JioType/JioType-Hairline.ttf'),
  'JioType-HairlineItalic': require('../../assets/fonts/JioType/JioType-HairlineItalic.ttf'),
  'JioType-Light': require('../../assets/fonts/JioType/JioType-Light.ttf'),
  'JioType-LightItalic': require('../../assets/fonts/JioType/JioType-LightItalic.ttf'),
  'JioType-Italic': require('../../assets/fonts/JioType/JioType-Italic.ttf'),
  'JioType-Medium': require('../../assets/fonts/JioType/JioType-Medium.ttf'),
  'JioType-MediumItalic': require('../../assets/fonts/JioType/JioType-MediumItalic.ttf'),
  'JioType-Bold': require('../../assets/fonts/JioType/JioType-Bold.ttf'),
  'JioType-BoldItalic': require('../../assets/fonts/JioType/JioType-BoldItalic.ttf'),
  'JioType-Black': require('../../assets/fonts/JioType/JioType-Black.ttf'),
  'JioType-BlackItalic': require('../../assets/fonts/JioType/JioType-BlackItalic.ttf'),
  'JioType-ExtraBlack': require('../../assets/fonts/JioType/JioType-ExtraBlack.ttf'),
  'JioType-ExtraBlackItalic': require('../../assets/fonts/JioType/JioType-ExtraBlackItalic.ttf'),
} as const;
