/**
 * Shared-only entry for IconButton.
 *
 * Native consumers import from `@oneui/ui/components/IconButton/shared` so
 * types and `useIconButtonState` are reachable without `IconButton.tsx`.
 */

export { useIconButtonState, resolveIconButtonSize } from './IconButton.shared';
export type {
  IconButtonProps,
  IconButtonAppearance,
  IconButtonVariant,
  IconButtonSize,
  IconButtonAttention,
  IconButtonLayout,
} from './IconButton.shared';
