/**
 * chipPaint.ts
 *
 * Pure paint utilities for Chip — no hooks, no React.
 * Extracted so they can be imported by both the component render and
 * the testable `resolveChipStyle` pure function.
 */

import { tokens } from '@oneui/tokens';
import type { NativeRoleTokens, ResolvedMetallicGradient } from '../../theme';
import type { ChipVariant } from './interface';

export interface ChipPaint {
  bg: string;
  text: string;
  borderColor: string;
  borderWidth: number;
  bgGradient?: ResolvedMetallicGradient | null;
}

export function getBasePaint(
  variant: ChipVariant,
  selected: boolean,
  role: NativeRoleTokens,
  neutral: NativeRoleTokens,
): ChipPaint {
  const hairline = tokens.borderWidth.hairline;
  switch (variant) {
    case 'bold':
      if (selected) {
        return {
          bg: role.surfaces.bold,
          text: role.onBoldContent.high,
          borderColor: role.surfaces.bold,
          borderWidth: hairline,
        };
      }
      return {
        bg: neutral.surfaces.minimal,
        text: neutral.content.high,
        borderColor: 'transparent',
        borderWidth: hairline,
      };
    case 'subtle':
      if (selected) {
        return {
          bg: role.surfaces.subtle,
          text: role.content.high,
          borderColor: 'transparent',
          borderWidth: hairline,
        };
      }
      return {
        bg: 'transparent',
        text: neutral.content.high,
        borderColor: neutral.content.strokeMedium,
        borderWidth: hairline,
      };
    case 'ghost':
    default:
      if (selected) {
        return {
          bg: 'transparent',
          text: role.content.high,
          borderColor: role.content.tintedA11y,
          borderWidth: hairline,
        };
      }
      return {
        bg: 'transparent',
        text: neutral.content.high,
        borderColor: 'transparent',
        borderWidth: hairline,
      };
  }
}

export function getPressedPaint(
  variant: ChipVariant,
  selected: boolean,
  role: NativeRoleTokens,
  neutral: NativeRoleTokens,
): ChipPaint {
  const hairline = tokens.borderWidth.hairline;
  switch (variant) {
    case 'bold':
      if (selected) {
        return {
          bg: role.states.boldPressed,
          text: role.onBoldContent.high,
          borderColor: role.states.boldPressed,
          borderWidth: hairline,
        };
      }
      return {
        bg: neutral.states.pressed,
        text: neutral.content.high,
        borderColor: 'transparent',
        borderWidth: hairline,
      };
    case 'subtle':
      if (selected) {
        return {
          bg: role.states.subtlePressed,
          text: role.content.high,
          borderColor: 'transparent',
          borderWidth: hairline,
        };
      }
      return {
        bg: neutral.states.pressed,
        text: neutral.content.high,
        borderColor: neutral.content.strokeMedium,
        borderWidth: hairline,
      };
    case 'ghost':
    default:
      if (selected) {
        return {
          bg: role.states.subtleHover,
          text: role.content.high,
          borderColor: role.content.tintedA11y,
          borderWidth: hairline,
        };
      }
      return {
        bg: neutral.states.pressed,
        text: neutral.content.high,
        borderColor: 'transparent',
        borderWidth: hairline,
      };
  }
}
