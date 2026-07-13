/**
 * Badge (native) barrel.
 */

export { Badge } from './Badge.native';
export type {
  BadgeProps,
  BadgeNativeProps,
  BadgeAppearance,
  BadgeAttention,
  BadgeVariant,
  BadgeSize,
} from './interface';
export {
  useBadgeState,
  getBadgeAccessibilityProps,
  getBadgeRootAccessibilityProps,
  getBadgeSlotWrapAccessibilityProps,
  getBadgeVisibleTextAccessibilityProps,
  getBadgeElementContentAccessibilityProps,
  badgeChildrenArePlainText,
  badgeChildrenExposeAccessibility,
  badgeSlotNodeExposesAccessibility,
  badgeSlotsExposeAccessibility,
  shouldExposeOffscreenBadgeLabel,
  resolveBadgeAccessibilityLabel,
} from './interface';
