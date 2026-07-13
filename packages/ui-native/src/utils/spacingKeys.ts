/**
 * Native-only spacing key helpers.
 *
 * Web/React uses CSS `var(--Spacing-*)` and Convex may still return legacy
 * t-shirt labels in brand config. Native layout code should use numeric keys
 * from `@oneui/tokens` (`tokens.spacing['4']`, not `tokens.dimension['f0']`).
 *
 * Use this map only when translating stored brand spacing ids for RN theme
 * builders — do not import from `@oneui/shared` into web packages.
 */

import type { NativeSpacing } from '@oneui/shared/engine';

/** Canonical numeric spacing key (`NativeSpacing` record keys). */
export type NativeSpacingKey = keyof NativeSpacing;

/** Legacy t-shirt spacing id → canonical numeric spacing key (Figma scale). */
export const LEGACY_SPACING_TO_NATIVE_KEY: Record<string, NativeSpacingKey> = {
  None: '0',
  '6XS': '0-5',
  '5XS': '1',
  '4XS': '1-5',
  '3XS': '2',
  '2XS': '2-5',
  XS: '3',
  S: '3-5',
  M: '4',
  L: '4-5',
  XL: '5',
  '2XL': '6',
  '3XL': '7',
  '4XL': '8',
  '5XL': '9',
  '6XL': '10',
  '7XL': '12',
  '8XL': '14',
  '9XL': '16',
  '10XL': '18',
  '11XL': '20',
  '12XL': '24',
  '13XL': '28',
  '14XL': '32',
  '15XL': '40',
};

/** Resolve a stored spacing token id to a native `tokens.spacing` key. */
export function toNativeSpacingKey(token: string, fStep?: string): NativeSpacingKey | undefined {
  const raw = token.startsWith('Spacing-') ? token.slice('Spacing-'.length) : token;
  if (raw in LEGACY_SPACING_TO_NATIVE_KEY) {
    return LEGACY_SPACING_TO_NATIVE_KEY[raw];
  }
  if (/^\d/.test(raw) || raw.includes('-')) {
    return raw as NativeSpacingKey;
  }
  if (fStep) {
    const FSTEP_TO_KEY: Record<string, NativeSpacingKey> = {
      'f-8': '0',
      'f-7': '0-5',
      'f-6': '1',
      'f-5': '1-5',
      'f-4': '2',
      'f-3': '2-5',
      'f-2': '3',
      'f-1': '3-5',
      f0: '4',
      f1: '4-5',
      f2: '5',
      'f2-5': '5-5',
      f3: '6',
      f4: '7',
      f5: '8',
      f6: '9',
      f7: '10',
      f8: '12',
      f9: '14',
      f10: '16',
      f11: '18',
      f12: '20',
      f13: '24',
      f14: '28',
      f15: '32',
      f16: '40',
    };
    const step = fStep.replace(/^Dimension-/, '');
    return FSTEP_TO_KEY[step];
  }
  return undefined;
}
