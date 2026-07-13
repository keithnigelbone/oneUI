/**
 * Shared-only entry for design-system Icon.
 *
 * Native and other non-DOM consumers import from
 * `@oneui/ui/components/Icon/shared` so types and `ICON_SIZES` are
 * available without pulling `Icon.tsx` (web resolver + icon loaders).
 */

export { useIconState, ICON_SIZES } from './Icon.shared';
export type {
  IconProps,
  IconSize,
  IconAppearance,
  IconEmphasis,
} from './Icon.shared';
