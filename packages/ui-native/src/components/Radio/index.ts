/**
 * Radio (native) barrel.
 *
 * Prop contract and helpers live in `interface.ts`. Multi-option
 * orchestration lives in `RadioField` — Radio itself is a self-contained
 * controlled/uncontrolled leaf.
 */

export { Radio } from './Radio.native';
export type {
  RadioProps,
  RadioNativeProps,
  RadioAppearance,
  RadioAccent,
  RadioSize,
  RadioState,
} from './interface';
export {
  useRadioState,
  getRadioAccessibilityProps,
  resolveSize,
  radioSizeToLabelSize,
} from './interface';
