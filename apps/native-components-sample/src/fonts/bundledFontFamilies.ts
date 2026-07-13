import {
  JIO_TYPE_BUNDLED_STATIC_WEIGHT_FAMILIES,
  type StaticWeightFamilyMap,
} from '@oneui/shared/engine';
import type { FontFamilyOverrides } from '@oneui/ui-native';

/**
 * Expo `useFonts` keys for bundled JioType cuts under `assets/fonts/JioType/`.
 *
 * CSS weight stops without a matching file snap to the nearest bundled cut
 * (e.g. 200 → Hairline, 600 → Medium) so `useTypographyTokens` always resolves
 * to a registered family.
 */
export const BUNDLED_JIOTYPE_WEIGHT_FAMILIES: StaticWeightFamilyMap =
  JIO_TYPE_BUNDLED_STATIC_WEIGHT_FAMILIES;

/** Expo `useFonts` keys for bundled JetBrains Mono variable cuts (code role only). */
export const BUNDLED_JETBRAINS_MONO_FONT_FILES = {
  JetBrainsMono: require('../../assets/fonts/JioType/JetBrainsMono-VariableFont_wght.ttf'),
  'JetBrainsMono-Italic': require('../../assets/fonts/JioType/JetBrainsMono-Italic-VariableFont_wght.ttf'),
} as const;

/** Registered Expo family name for `variant="code"` typography. */
export const BUNDLED_CODE_FONT_FAMILY = 'JetBrainsMono' as const;

/** Pass to `OneUIBrandProvider` `fontFamilyOverrides` — stable module-scope reference. */
export const SAMPLE_JIOTYPE_FONT_OVERRIDES: FontFamilyOverrides = {
  primary: BUNDLED_JIOTYPE_WEIGHT_FAMILIES,
  secondary: BUNDLED_JIOTYPE_WEIGHT_FAMILIES,
  codeFontFamily: BUNDLED_CODE_FONT_FAMILY,
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

// ---------------------------------------------------------------------------
// Noto Sans script fonts
// ---------------------------------------------------------------------------

/**
 * All Noto Sans India-core script `.ttf` files.
 * Register these keys via `expo-font` `useFonts` in your app entry point.
 * The weight → family-name mapping is handled automatically by `@oneui/ui-native`
 * (`DEFAULT_NOTO_SCRIPT_WEIGHT_FAMILIES`) — no additional configuration needed.
 */
export const NOTO_SCRIPT_BUNDLED_FONT_FILES = {
  // Devanagari (Hindi, Marathi) — reading + UI
  'NotoSansDevanagari-Thin':       require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagari-Thin.ttf'),
  'NotoSansDevanagari-ExtraLight': require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagari-ExtraLight.ttf'),
  'NotoSansDevanagari-Light':      require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagari-Light.ttf'),
  'NotoSansDevanagari-Regular':    require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagari-Regular.ttf'),
  'NotoSansDevanagari-Medium':     require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagari-Medium.ttf'),
  'NotoSansDevanagari-SemiBold':   require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagari-SemiBold.ttf'),
  'NotoSansDevanagari-Bold':       require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagari-Bold.ttf'),
  'NotoSansDevanagari-ExtraBold':  require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagari-ExtraBold.ttf'),
  'NotoSansDevanagari-Black':      require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagari-Black.ttf'),
  'NotoSansDevanagariUI-Thin':       require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagariUI-Thin.ttf'),
  'NotoSansDevanagariUI-ExtraLight': require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagariUI-ExtraLight.ttf'),
  'NotoSansDevanagariUI-Light':      require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagariUI-Light.ttf'),
  'NotoSansDevanagariUI-Regular':    require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagariUI-Regular.ttf'),
  'NotoSansDevanagariUI-Medium':     require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagariUI-Medium.ttf'),
  'NotoSansDevanagariUI-SemiBold':   require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagariUI-SemiBold.ttf'),
  'NotoSansDevanagariUI-Bold':       require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagariUI-Bold.ttf'),
  'NotoSansDevanagariUI-ExtraBold':  require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagariUI-ExtraBold.ttf'),
  'NotoSansDevanagariUI-Black':      require('../../assets/fonts/Noto Sans Devanagari/NotoSansDevanagariUI-Black.ttf'),
  // Bengali (Bengali, Assamese) — reading + UI
  'NotoSansBengali-Thin':       require('../../assets/fonts/Noto Sans Bengali/NotoSansBengali-Thin.ttf'),
  'NotoSansBengali-ExtraLight': require('../../assets/fonts/Noto Sans Bengali/NotoSansBengali-ExtraLight.ttf'),
  'NotoSansBengali-Light':      require('../../assets/fonts/Noto Sans Bengali/NotoSansBengali-Light.ttf'),
  'NotoSansBengali-Regular':    require('../../assets/fonts/Noto Sans Bengali/NotoSansBengali-Regular.ttf'),
  'NotoSansBengali-Medium':     require('../../assets/fonts/Noto Sans Bengali/NotoSansBengali-Medium.ttf'),
  'NotoSansBengali-SemiBold':   require('../../assets/fonts/Noto Sans Bengali/NotoSansBengali-SemiBold.ttf'),
  'NotoSansBengali-Bold':       require('../../assets/fonts/Noto Sans Bengali/NotoSansBengali-Bold.ttf'),
  'NotoSansBengali-ExtraBold':  require('../../assets/fonts/Noto Sans Bengali/NotoSansBengali-ExtraBold.ttf'),
  'NotoSansBengali-Black':      require('../../assets/fonts/Noto Sans Bengali/NotoSansBengali-Black.ttf'),
  'NotoSansBengaliUI-Thin':       require('../../assets/fonts/Noto Sans Bengali/NotoSansBengaliUI-Thin.ttf'),
  'NotoSansBengaliUI-ExtraLight': require('../../assets/fonts/Noto Sans Bengali/NotoSansBengaliUI-ExtraLight.ttf'),
  'NotoSansBengaliUI-Light':      require('../../assets/fonts/Noto Sans Bengali/NotoSansBengaliUI-Light.ttf'),
  'NotoSansBengaliUI-Regular':    require('../../assets/fonts/Noto Sans Bengali/NotoSansBengaliUI-Regular.ttf'),
  'NotoSansBengaliUI-Medium':     require('../../assets/fonts/Noto Sans Bengali/NotoSansBengaliUI-Medium.ttf'),
  'NotoSansBengaliUI-SemiBold':   require('../../assets/fonts/Noto Sans Bengali/NotoSansBengaliUI-SemiBold.ttf'),
  'NotoSansBengaliUI-Bold':       require('../../assets/fonts/Noto Sans Bengali/NotoSansBengaliUI-Bold.ttf'),
  'NotoSansBengaliUI-ExtraBold':  require('../../assets/fonts/Noto Sans Bengali/NotoSansBengaliUI-ExtraBold.ttf'),
  'NotoSansBengaliUI-Black':      require('../../assets/fonts/Noto Sans Bengali/NotoSansBengaliUI-Black.ttf'),
  // Gujarati — reading + UI
  'NotoSansGujarati-Thin':       require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujarati-Thin.ttf'),
  'NotoSansGujarati-ExtraLight': require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujarati-ExtraLight.ttf'),
  'NotoSansGujarati-Light':      require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujarati-Light.ttf'),
  'NotoSansGujarati-Regular':    require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujarati-Regular.ttf'),
  'NotoSansGujarati-Medium':     require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujarati-Medium.ttf'),
  'NotoSansGujarati-SemiBold':   require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujarati-SemiBold.ttf'),
  'NotoSansGujarati-Bold':       require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujarati-Bold.ttf'),
  'NotoSansGujarati-ExtraBold':  require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujarati-ExtraBold.ttf'),
  'NotoSansGujarati-Black':      require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujarati-Black.ttf'),
  'NotoSansGujaratiUI-Thin':       require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujaratiUI-Thin.ttf'),
  'NotoSansGujaratiUI-ExtraLight': require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujaratiUI-ExtraLight.ttf'),
  'NotoSansGujaratiUI-Light':      require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujaratiUI-Light.ttf'),
  'NotoSansGujaratiUI-Regular':    require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujaratiUI-Regular.ttf'),
  'NotoSansGujaratiUI-Medium':     require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujaratiUI-Medium.ttf'),
  'NotoSansGujaratiUI-SemiBold':   require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujaratiUI-SemiBold.ttf'),
  'NotoSansGujaratiUI-Bold':       require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujaratiUI-Bold.ttf'),
  'NotoSansGujaratiUI-ExtraBold':  require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujaratiUI-ExtraBold.ttf'),
  'NotoSansGujaratiUI-Black':      require('../../assets/fonts/Noto Sans Gujarati/NotoSansGujaratiUI-Black.ttf'),
  // Gurmukhi (Punjabi) — reading + UI
  'NotoSansGurmukhi-Thin':       require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhi-Thin.ttf'),
  'NotoSansGurmukhi-ExtraLight': require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhi-ExtraLight.ttf'),
  'NotoSansGurmukhi-Light':      require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhi-Light.ttf'),
  'NotoSansGurmukhi-Regular':    require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhi-Regular.ttf'),
  'NotoSansGurmukhi-Medium':     require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhi-Medium.ttf'),
  'NotoSansGurmukhi-SemiBold':   require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhi-SemiBold.ttf'),
  'NotoSansGurmukhi-Bold':       require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhi-Bold.ttf'),
  'NotoSansGurmukhi-ExtraBold':  require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhi-ExtraBold.ttf'),
  'NotoSansGurmukhi-Black':      require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhi-Black.ttf'),
  'NotoSansGurmukhiUI-Thin':       require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhiUI-Thin.ttf'),
  'NotoSansGurmukhiUI-ExtraLight': require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhiUI-ExtraLight.ttf'),
  'NotoSansGurmukhiUI-Light':      require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhiUI-Light.ttf'),
  'NotoSansGurmukhiUI-Regular':    require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhiUI-Regular.ttf'),
  'NotoSansGurmukhiUI-Medium':     require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhiUI-Medium.ttf'),
  'NotoSansGurmukhiUI-SemiBold':   require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhiUI-SemiBold.ttf'),
  'NotoSansGurmukhiUI-Bold':       require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhiUI-Bold.ttf'),
  'NotoSansGurmukhiUI-ExtraBold':  require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhiUI-ExtraBold.ttf'),
  'NotoSansGurmukhiUI-Black':      require('../../assets/fonts/Noto Sans Gurmukhi/NotoSansGurmukhiUI-Black.ttf'),
  // Kannada — reading + UI
  'NotoSansKannada-Thin':       require('../../assets/fonts/Noto Sans Kannada/NotoSansKannada-Thin.ttf'),
  'NotoSansKannada-ExtraLight': require('../../assets/fonts/Noto Sans Kannada/NotoSansKannada-ExtraLight.ttf'),
  'NotoSansKannada-Light':      require('../../assets/fonts/Noto Sans Kannada/NotoSansKannada-Light.ttf'),
  'NotoSansKannada-Regular':    require('../../assets/fonts/Noto Sans Kannada/NotoSansKannada-Regular.ttf'),
  'NotoSansKannada-Medium':     require('../../assets/fonts/Noto Sans Kannada/NotoSansKannada-Medium.ttf'),
  'NotoSansKannada-SemiBold':   require('../../assets/fonts/Noto Sans Kannada/NotoSansKannada-SemiBold.ttf'),
  'NotoSansKannada-Bold':       require('../../assets/fonts/Noto Sans Kannada/NotoSansKannada-Bold.ttf'),
  'NotoSansKannada-ExtraBold':  require('../../assets/fonts/Noto Sans Kannada/NotoSansKannada-ExtraBold.ttf'),
  'NotoSansKannada-Black':      require('../../assets/fonts/Noto Sans Kannada/NotoSansKannada-Black.ttf'),
  'NotoSansKannadaUI-Thin':       require('../../assets/fonts/Noto Sans Kannada/NotoSansKannadaUI-Thin.ttf'),
  'NotoSansKannadaUI-ExtraLight': require('../../assets/fonts/Noto Sans Kannada/NotoSansKannadaUI-ExtraLight.ttf'),
  'NotoSansKannadaUI-Light':      require('../../assets/fonts/Noto Sans Kannada/NotoSansKannadaUI-Light.ttf'),
  'NotoSansKannadaUI-Regular':    require('../../assets/fonts/Noto Sans Kannada/NotoSansKannadaUI-Regular.ttf'),
  'NotoSansKannadaUI-Medium':     require('../../assets/fonts/Noto Sans Kannada/NotoSansKannadaUI-Medium.ttf'),
  'NotoSansKannadaUI-SemiBold':   require('../../assets/fonts/Noto Sans Kannada/NotoSansKannadaUI-SemiBold.ttf'),
  'NotoSansKannadaUI-Bold':       require('../../assets/fonts/Noto Sans Kannada/NotoSansKannadaUI-Bold.ttf'),
  'NotoSansKannadaUI-ExtraBold':  require('../../assets/fonts/Noto Sans Kannada/NotoSansKannadaUI-ExtraBold.ttf'),
  'NotoSansKannadaUI-Black':      require('../../assets/fonts/Noto Sans Kannada/NotoSansKannadaUI-Black.ttf'),
  // Malayalam — reading + UI
  'NotoSansMalayalam-Thin':       require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalam-Thin.ttf'),
  'NotoSansMalayalam-ExtraLight': require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalam-ExtraLight.ttf'),
  'NotoSansMalayalam-Light':      require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalam-Light.ttf'),
  'NotoSansMalayalam-Regular':    require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalam-Regular.ttf'),
  'NotoSansMalayalam-Medium':     require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalam-Medium.ttf'),
  'NotoSansMalayalam-SemiBold':   require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalam-SemiBold.ttf'),
  'NotoSansMalayalam-Bold':       require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalam-Bold.ttf'),
  'NotoSansMalayalam-ExtraBold':  require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalam-ExtraBold.ttf'),
  'NotoSansMalayalam-Black':      require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalam-Black.ttf'),
  'NotoSansMalayalamUI-Thin':       require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalamUI-Thin.ttf'),
  'NotoSansMalayalamUI-ExtraLight': require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalamUI-ExtraLight.ttf'),
  'NotoSansMalayalamUI-Light':      require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalamUI-Light.ttf'),
  'NotoSansMalayalamUI-Regular':    require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalamUI-Regular.ttf'),
  'NotoSansMalayalamUI-Medium':     require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalamUI-Medium.ttf'),
  'NotoSansMalayalamUI-SemiBold':   require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalamUI-SemiBold.ttf'),
  'NotoSansMalayalamUI-Bold':       require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalamUI-Bold.ttf'),
  'NotoSansMalayalamUI-ExtraBold':  require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalamUI-ExtraBold.ttf'),
  'NotoSansMalayalamUI-Black':      require('../../assets/fonts/Noto Sans Malayalam/NotoSansMalayalamUI-Black.ttf'),
  // Oriya — reading only (4 cuts, no UI variant)
  'NotoSansOriya-Thin':    require('../../assets/fonts/Noto Sans Oriya/NotoSansOriya-Thin.ttf'),
  'NotoSansOriya-Regular': require('../../assets/fonts/Noto Sans Oriya/NotoSansOriya-Regular.ttf'),
  'NotoSansOriya-Bold':    require('../../assets/fonts/Noto Sans Oriya/NotoSansOriya-Bold.ttf'),
  'NotoSansOriya-Black':   require('../../assets/fonts/Noto Sans Oriya/NotoSansOriya-Black.ttf'),
  // Tamil — reading + UI
  'NotoSansTamil-Thin':       require('../../assets/fonts/Noto Sans Tamil/NotoSansTamil-Thin.ttf'),
  'NotoSansTamil-ExtraLight': require('../../assets/fonts/Noto Sans Tamil/NotoSansTamil-ExtraLight.ttf'),
  'NotoSansTamil-Light':      require('../../assets/fonts/Noto Sans Tamil/NotoSansTamil-Light.ttf'),
  'NotoSansTamil-Regular':    require('../../assets/fonts/Noto Sans Tamil/NotoSansTamil-Regular.ttf'),
  'NotoSansTamil-Medium':     require('../../assets/fonts/Noto Sans Tamil/NotoSansTamil-Medium.ttf'),
  'NotoSansTamil-SemiBold':   require('../../assets/fonts/Noto Sans Tamil/NotoSansTamil-SemiBold.ttf'),
  'NotoSansTamil-Bold':       require('../../assets/fonts/Noto Sans Tamil/NotoSansTamil-Bold.ttf'),
  'NotoSansTamil-ExtraBold':  require('../../assets/fonts/Noto Sans Tamil/NotoSansTamil-ExtraBold.ttf'),
  'NotoSansTamil-Black':      require('../../assets/fonts/Noto Sans Tamil/NotoSansTamil-Black.ttf'),
  'NotoSansTamilUI-Thin':       require('../../assets/fonts/Noto Sans Tamil/NotoSansTamilUI-Thin.ttf'),
  'NotoSansTamilUI-ExtraLight': require('../../assets/fonts/Noto Sans Tamil/NotoSansTamilUI-ExtraLight.ttf'),
  'NotoSansTamilUI-Light':      require('../../assets/fonts/Noto Sans Tamil/NotoSansTamilUI-Light.ttf'),
  'NotoSansTamilUI-Regular':    require('../../assets/fonts/Noto Sans Tamil/NotoSansTamilUI-Regular.ttf'),
  'NotoSansTamilUI-Medium':     require('../../assets/fonts/Noto Sans Tamil/NotoSansTamilUI-Medium.ttf'),
  'NotoSansTamilUI-SemiBold':   require('../../assets/fonts/Noto Sans Tamil/NotoSansTamilUI-SemiBold.ttf'),
  'NotoSansTamilUI-Bold':       require('../../assets/fonts/Noto Sans Tamil/NotoSansTamilUI-Bold.ttf'),
  'NotoSansTamilUI-ExtraBold':  require('../../assets/fonts/Noto Sans Tamil/NotoSansTamilUI-ExtraBold.ttf'),
  'NotoSansTamilUI-Black':      require('../../assets/fonts/Noto Sans Tamil/NotoSansTamilUI-Black.ttf'),
  // Telugu — reading + UI
  'NotoSansTelugu-Thin':       require('../../assets/fonts/Noto Sans Telugu/NotoSansTelugu-Thin.ttf'),
  'NotoSansTelugu-ExtraLight': require('../../assets/fonts/Noto Sans Telugu/NotoSansTelugu-ExtraLight.ttf'),
  'NotoSansTelugu-Light':      require('../../assets/fonts/Noto Sans Telugu/NotoSansTelugu-Light.ttf'),
  'NotoSansTelugu-Regular':    require('../../assets/fonts/Noto Sans Telugu/NotoSansTelugu-Regular.ttf'),
  'NotoSansTelugu-Medium':     require('../../assets/fonts/Noto Sans Telugu/NotoSansTelugu-Medium.ttf'),
  'NotoSansTelugu-SemiBold':   require('../../assets/fonts/Noto Sans Telugu/NotoSansTelugu-SemiBold.ttf'),
  'NotoSansTelugu-Bold':       require('../../assets/fonts/Noto Sans Telugu/NotoSansTelugu-Bold.ttf'),
  'NotoSansTelugu-ExtraBold':  require('../../assets/fonts/Noto Sans Telugu/NotoSansTelugu-ExtraBold.ttf'),
  'NotoSansTelugu-Black':      require('../../assets/fonts/Noto Sans Telugu/NotoSansTelugu-Black.ttf'),
  'NotoSansTeluguUI-Thin':       require('../../assets/fonts/Noto Sans Telugu/NotoSansTeluguUI-Thin.ttf'),
  'NotoSansTeluguUI-ExtraLight': require('../../assets/fonts/Noto Sans Telugu/NotoSansTeluguUI-ExtraLight.ttf'),
  'NotoSansTeluguUI-Light':      require('../../assets/fonts/Noto Sans Telugu/NotoSansTeluguUI-Light.ttf'),
  'NotoSansTeluguUI-Regular':    require('../../assets/fonts/Noto Sans Telugu/NotoSansTeluguUI-Regular.ttf'),
  'NotoSansTeluguUI-Medium':     require('../../assets/fonts/Noto Sans Telugu/NotoSansTeluguUI-Medium.ttf'),
  'NotoSansTeluguUI-SemiBold':   require('../../assets/fonts/Noto Sans Telugu/NotoSansTeluguUI-SemiBold.ttf'),
  'NotoSansTeluguUI-Bold':       require('../../assets/fonts/Noto Sans Telugu/NotoSansTeluguUI-Bold.ttf'),
  'NotoSansTeluguUI-ExtraBold':  require('../../assets/fonts/Noto Sans Telugu/NotoSansTeluguUI-ExtraBold.ttf'),
  'NotoSansTeluguUI-Black':      require('../../assets/fonts/Noto Sans Telugu/NotoSansTeluguUI-Black.ttf'),
} as const;

/** Rows for the font-weights preview screen (one bundled cut per row). */
export const JIOTYPE_WEIGHT_SHOWCASE_ROWS = [
  { weight: 100, label: 'Hairline', fontFamily: 'JioType-Hairline' },
  { weight: 300, label: 'Light', fontFamily: 'JioType-Light' },
  { weight: 400, label: 'Regular', fontFamily: 'JioType' },
  { weight: 500, label: 'Medium', fontFamily: 'JioType-Medium' },
  { weight: 700, label: 'Bold', fontFamily: 'JioType-Bold' },
  { weight: 800, label: 'ExtraBlack', fontFamily: 'JioType-ExtraBlack' },
  { weight: 900, label: 'Black', fontFamily: 'JioType-Black' },
] as const;
