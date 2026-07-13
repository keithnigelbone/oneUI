/**
 * Shared-only entry for LinkButton.
 *
 * Native consumers (`@oneui/ui-native`) and any other non-DOM environment
 * import from `@oneui/ui/components/LinkButton/shared` so the type/prop
 * surface and the `useLinkButtonState` hook are reachable without pulling
 * in `LinkButton.tsx` and its CSS module dependency.
 */

export {
  useLinkButtonState,
  resolveLinkButtonSize,
} from './LinkButton.shared';
export type {
  LinkButtonProps,
  LinkButtonAppearance,
  LinkButtonVariant,
  LinkButtonSize,
  LinkButtonAttention,
} from './LinkButton.shared';
