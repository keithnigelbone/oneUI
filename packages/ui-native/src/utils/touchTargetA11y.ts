/**
 * WCAG 2.1 AA touch-target helpers (44×44 default via `@oneui/tokens`).
 */

import { touchTarget } from '@oneui/tokens';
import type { Insets } from 'react-native';

/** Expand Pressable hit area when visual size is below `touchTarget.min`. */
export function resolvePressableHitSlop(
  width: number | undefined,
  height: number,
  minSize: number = touchTarget.min,
): Insets | undefined {
  const effectiveWidth = width ?? height;
  const padH = Math.max(0, Math.ceil((minSize - effectiveWidth) / 2));
  const padV = Math.max(0, Math.ceil((minSize - height) / 2));
  if (padH === 0 && padV === 0) {
    return undefined;
  }
  return { top: padV, bottom: padV, left: padH, right: padH };
}
