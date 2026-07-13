/**
 * Shared-only entry for Avatar.
 *
 * Native consumers (`@oneui/ui-native`) import from
 * `@oneui/ui/components/Avatar/shared` so types and `useAvatarState` are
 * reachable without pulling `Avatar.tsx` and its CSS module.
 */

export { useAvatarState, getInitials, resolveAvatarSize } from './Avatar.shared';
export type {
  AvatarProps,
  AvatarSize,
  AvatarContent,
  AvatarAttention,
  AvatarAppearance,
} from './Avatar.shared';
