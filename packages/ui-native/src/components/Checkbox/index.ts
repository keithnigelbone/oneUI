/**
 * Checkbox (native) barrel.
 *
 * Prop contract and state helpers live in `interface.ts`.
 */

export { Checkbox } from './Checkbox.native';
export type {
  CheckboxProps,
  CheckboxNativeProps,
  CheckboxAppearance,
  CheckboxAccent,
  CheckboxSize,
} from './interface';
export {
  useCheckboxState,
  getCheckboxAccessibilityProps,
  resolveSize,
} from './interface';
