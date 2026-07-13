/**
 * SingleTextButton (native) barrel.
 *
 * Prop contract, state resolver, and a11y helpers live in `interface.ts`.
 */

export { SingleTextButton } from './SingleTextButton.native';
export type {
  SingleTextButtonProps,
  SingleTextButtonAppearance,
  SingleTextButtonAttention,
  SingleTextButtonVariant,
  SingleTextButtonSize,
} from './interface';
export {
  useSingleTextButtonState,
  getSingleTextButtonAccessibilityProps,
} from './interface';
