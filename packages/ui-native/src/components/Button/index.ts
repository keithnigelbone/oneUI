/**
 * Button (native) barrel.
 *
 * Prop contract and state helpers live in `interface.ts`.
 */

export { Button } from './Button.native';
export type {
  ButtonProps,
  ButtonNativeProps,
  ButtonAppearance,
  ButtonAttention,
  ButtonVariant,
  ButtonSize,
} from './interface';
export { resolveSize, useButtonState } from './interface';
