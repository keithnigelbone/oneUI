/**
 * Input (native) barrel.
 *
 * Prop contract, state resolver, and accessibility helpers live in
 * `interface.ts` (no `@oneui/ui` import). Component / showcase import the
 * same file — never the web shared module.
 */

export { Input } from './Input.native';
export type {
  InputProps,
  InputNativeProps,
  InputAppearance,
  InputAttention,
  InputShape,
  InputSize,
  InputNumericSize,
  InputLabelSize,
  InputKeyboardType,
  InputFocusEvent,
  InputState,
  InputAccessibilityProps,
  ResolvedTextInputTypeOptions,
} from './interface';
export {
  INPUT_APPEARANCES,
  INPUT_SIZES,
  INPUT_NUMERIC_SIZES,
  INPUT_ATTENTIONS,
  resolveInputSize,
  inputSizeToLabelSize,
  resolveTextInputType,
  useInputState,
  getInputAccessibilityProps,
} from './interface';
