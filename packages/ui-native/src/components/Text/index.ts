/**
 * Text (native) barrel.
 *
 * Prop contract, state resolver, and accessibility helpers live in
 * `interface.ts`. Component / showcase imports the same file — never the
 * web `@oneui/ui` shared module.
 */

export { Text } from './Text.native';
export type {
  TextProps,
  TextNativeProps,
  TextVariant,
  TextSize,
  TextSizeStep,
  TextSizeBody,
  TextSizeLabel,
  TextSizeCode,
  TextSizeDisplay,
  TextSizeTitle,
  TextSizeHeadline,
  TextWeight,
  TextAttention,
  TextAppearance,
  TextAlign,
  TextLanguage,
  TextScript,
  TextScriptMode,
  TextAccessibilityProps,
} from './interface';
export {
  BODY_VALID_ORDER,
  TEXT_APPEARANCES,
  TEXT_ATTENTIONS,
  TEXT_SIZE_OPTIONS,
  TEXT_SIZE_ORDER,
  TEXT_VARIANTS,
  TEXT_WEIGHTS,
  getTextAccessibilityProps,
  resolveTextAccessibilityLabel,
  resolveTextSize,
  useTextState,
} from './interface';
