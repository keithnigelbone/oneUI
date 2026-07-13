/**
 * AccessibilityBadge.shared.ts
 * Shared types for WCAG accessibility badge
 */

export type WCAGLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail';
export type BadgeVariant = 'success' | 'warning' | 'error';

export interface AccessibilityBadgeProps {
  contrastRatio: number;
  size?: 'small' | 'medium';
  showRatio?: boolean;
}

export interface BadgeState {
  level: WCAGLevel;
  variant: BadgeVariant;
  passesAA: boolean;
  passesAALarge: boolean;
  passesAAA: boolean;
}

export function calculateBadgeState(contrastRatio: number): BadgeState {
  const passesAAA = contrastRatio >= 7;
  const passesAA = contrastRatio >= 4.5;
  const passesAALarge = contrastRatio >= 3;

  let level: WCAGLevel;
  let variant: BadgeVariant;

  if (passesAAA) {
    level = 'AAA';
    variant = 'success';
  } else if (passesAA) {
    level = 'AA';
    variant = 'success';
  } else if (passesAALarge) {
    level = 'AA Large';
    variant = 'warning';
  } else {
    level = 'Fail';
    variant = 'error';
  }

  return {
    level,
    variant,
    passesAA,
    passesAALarge,
    passesAAA,
  };
}

export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`;
}
