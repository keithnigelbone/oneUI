import type { CSSProperties } from 'react';

/**
 * Breakpoint keys matching the unified S/M/L model in `data-Breakpoint`.
 *
 * S → mobile (< 620px)
 * M → tablet (620–990px)
 * L → desktop (≥ 991px)
 */
export type Breakpoint = 'S' | 'M' | 'L';

export const BREAKPOINTS: readonly Breakpoint[] = ['S', 'M', 'L'];

/**
 * A value that either applies to all breakpoints or varies per-breakpoint.
 * Omitted breakpoints inherit from the next smaller one (mobile-first cascade).
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

/**
 * Convert a ResponsiveValue into inline CSS custom properties consumed by
 * the Grid/Column CSS modules. A bare value sets the fallback var; an object
 * sets one var per breakpoint key.
 *
 * @example
 *   responsiveToCSSVars(6, '--col-span')
 *     → { '--col-span': '6' }
 *   responsiveToCSSVars({ S: 4, L: 6 }, '--col-span')
 *     → { '--col-span-s': '4', '--col-span-l': '6' }
 */
export function responsiveToCSSVars<T extends number | string>(
  value: ResponsiveValue<T> | undefined,
  prefix: string,
): CSSProperties {
  if (value === undefined || value === null) return {};
  if (typeof value === 'number' || typeof value === 'string') {
    return { [prefix]: String(value) } as CSSProperties;
  }
  const out: Record<string, string> = {};
  for (const bp of BREAKPOINTS) {
    const v = value[bp];
    if (v !== undefined) {
      out[`${prefix}-${bp.toLowerCase()}`] = String(v);
    }
  }
  return out as CSSProperties;
}
