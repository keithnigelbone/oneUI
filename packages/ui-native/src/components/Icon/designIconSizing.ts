/**
 * Maps design-system Icon sizes (spacing indices) to native theme spacing px.
 * Mirrors `Icon.module.css` data-size → `--Spacing-*` (e.g. 32 → Spacing-32).
 */

import type { NativeSpacing } from '@oneui/shared/engine';
import type { DesignIconSize } from './interface';

function designIconSizeToSpacingKey(size: DesignIconSize): keyof NativeSpacing {
  return size.replace('.', '-') as keyof NativeSpacing;
}

export function designIconSizePx(size: DesignIconSize, spacing: NativeSpacing): number {
  return spacing[designIconSizeToSpacingKey(size)];
}
