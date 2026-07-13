/**
 * InputDynamicText (native) barrel.
 *
 * Prop contract, state resolver, and accessibility helpers live in
 * `interface.ts`.
 */

export { InputDynamicText } from './InputDynamicText.native';
export type {
  InputDynamicTextProps,
  InputDynamicTextNativeProps,
  InputDynamicTextSize,
  InputDynamicTextAriaLive,
} from './interface';
export {
  useInputDynamicTextState,
  getInputDynamicTextAccessibilityProps,
  resolveAccessibilityLiveRegion,
} from './interface';
