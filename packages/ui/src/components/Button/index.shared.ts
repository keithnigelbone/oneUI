/**
 * Shared-only entry for Button.
 *
 * Native consumers (`@oneui/ui-native`) and any other non-DOM environment
 * import from `@oneui/ui/components/Button/shared` so the type/prop
 * surface and the `useButtonState` hook are reachable without pulling in
 * `Button.tsx` and its CSS module dependency.
 */

export {
  useButtonState,
  resolveSize,
} from './Button.shared';
export type {
  ButtonProps,
  ButtonAppearance,
  ButtonVariant,
  ButtonSize,
  ButtonAttention,
} from './Button.shared';
