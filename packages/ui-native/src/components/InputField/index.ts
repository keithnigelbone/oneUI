/**
 * InputField (native) barrel.
 *
 * Prop contract, state resolver, and accessibility helpers live in
 * `interface.ts` (no `@oneui/ui` import). Component / showcase import the
 * same file — never the web shared module.
 */

export { InputField } from './InputField.native';
export type {
  InputFieldProps,
  InputFieldNativeProps,
  InputFieldState,
  InputFieldAccessibilityProps,
  InputAppearance,
  InputAttention,
  InputShape,
  InputSize,
  InputNumericSize,
  InputLabelSize,
} from './interface';
export { useInputFieldState, getInputFieldAccessibilityProps } from './interface';
