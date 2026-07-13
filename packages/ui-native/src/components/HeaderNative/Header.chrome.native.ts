/**
 * Header.chrome.native.ts — shared surface/token paint for Header chrome.
 */

import type { NativeRoleTokens } from '../../theme';
import type { HeaderItemAttention } from './interface';

export interface HeaderChromePaint {
  background: string;
  textHigh: string;
  textMedium: string;
  textLow: string;
  accent: string;
  subtle: string;
  hover: string;
  pressed: string;
  indicator: string;
}

export function resolveHeaderChromePaint(
  neutral: NativeRoleTokens,
  primary: NativeRoleTokens
): HeaderChromePaint {
  return {
    background: neutral.surfaces.default,
    textHigh: neutral.content.high,
    textMedium: neutral.content.medium,
    textLow: neutral.content.low,
    accent: primary.content.tintedA11y,
    subtle: primary.surfaces.subtle,
    hover: primary.states.hover,
    pressed: primary.states.pressed,
    indicator: primary.content.tinted,
  };
}

/** Figma Header.Item — inactive: content/low; active low: content/high; active medium/high: accent. */
export function headerItemLabelColor(
  attention: HeaderItemAttention,
  active: boolean,
  paint: HeaderChromePaint
): string {
  if (!active) return paint.textLow;
  if (attention === 'low') return paint.textHigh;
  return paint.accent;
}
