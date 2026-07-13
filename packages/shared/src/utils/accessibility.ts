/**
 * accessibility.ts
 *
 * WCAG accessibility utilities for contrast checking and validation.
 * Supports OkLCH color space for perceptually uniform calculations.
 */

import { parseOkLCH } from './colorScale';

/**
 * WCAG 2.1 contrast requirements
 */
export const WCAG_REQUIREMENTS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
} as const;

/**
 * Touch target requirements (in pixels)
 */
export const TOUCH_TARGET_REQUIREMENTS = {
  MOBILE_MIN: 44,
  MOBILE_RECOMMENDED: 48,
  DESKTOP_MIN: 24,
} as const;

export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAALarge: boolean;
  passesAAA: boolean;
  passesAAALarge: boolean;
}

export interface AccessibilityAuditResult {
  foreground: string;
  background: string;
  contrast: ContrastResult;
  recommendation: string;
}

/**
 * Convert OkLCH lightness to approximate relative luminance
 * OkLCH L is perceptually uniform, so we approximate sRGB luminance
 * Note: This is an approximation. For precise results, convert through sRGB.
 */
export function oklchToRelativeLuminance(oklchColor: string): number {
  const parsed = parseOkLCH(oklchColor);
  if (!parsed) {
    throw new Error(`Invalid OkLCH color: ${oklchColor}`);
  }

  // OkLCH L is 0-100, but we need to handle the perceptual curve
  // L in OkLCH is already perceptually linear, so we can approximate
  const l = parsed.lightness / 100;

  // Apply approximate gamma correction for relative luminance
  // This approximation works well for contrast calculations
  return Math.pow(l, 2.2);
}

/**
 * Calculate WCAG contrast ratio between two colors
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 > L2
 */
export function getContrastRatio(
  foreground: string,
  background: string
): number {
  const l1 = oklchToRelativeLuminance(foreground);
  const l2 = oklchToRelativeLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check contrast against WCAG requirements
 */
export function checkContrast(
  foreground: string,
  background: string
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  const roundedRatio = Math.round(ratio * 10) / 10;

  return {
    ratio: roundedRatio,
    passesAA: ratio >= WCAG_REQUIREMENTS.AA_NORMAL,
    passesAALarge: ratio >= WCAG_REQUIREMENTS.AA_LARGE,
    passesAAA: ratio >= WCAG_REQUIREMENTS.AAA_NORMAL,
    passesAAALarge: ratio >= WCAG_REQUIREMENTS.AAA_LARGE,
  };
}

/**
 * Get a recommendation based on contrast result
 */
export function getContrastRecommendation(result: ContrastResult): string {
  if (result.passesAAA) {
    return 'Excellent contrast - passes AAA for all text sizes';
  }
  if (result.passesAAALarge) {
    return 'Good contrast - passes AAA for large text, AA for normal text';
  }
  if (result.passesAA) {
    return 'Acceptable contrast - passes AA for all text sizes';
  }
  if (result.passesAALarge) {
    return 'Limited contrast - only suitable for large text (18pt+ or 14pt+ bold)';
  }
  return 'Insufficient contrast - does not meet WCAG requirements';
}

/**
 * Perform a full accessibility audit on a color pair
 */
export function auditColorPair(
  foreground: string,
  background: string
): AccessibilityAuditResult {
  const contrast = checkContrast(foreground, background);
  const recommendation = getContrastRecommendation(contrast);

  return {
    foreground,
    background,
    contrast,
    recommendation,
  };
}

/**
 * Generate an accessibility matrix for a set of colors
 * Tests all foreground/background combinations
 */
export function generateAccessibilityMatrix(
  foregroundColors: Array<{ name: string; value: string }>,
  backgroundColors: Array<{ name: string; value: string }>
): Array<{
  foreground: { name: string; value: string };
  background: { name: string; value: string };
  contrast: ContrastResult;
}> {
  const matrix: Array<{
    foreground: { name: string; value: string };
    background: { name: string; value: string };
    contrast: ContrastResult;
  }> = [];

  for (const fg of foregroundColors) {
    for (const bg of backgroundColors) {
      matrix.push({
        foreground: fg,
        background: bg,
        contrast: checkContrast(fg.value, bg.value),
      });
    }
  }

  return matrix;
}

/**
 * Find the minimum contrast step for a given background
 * Useful for finding the darkest/lightest text that meets requirements
 */
export function findMinimumContrastStep(
  backgroundValue: string,
  colorSteps: Array<{ step: number; oklch: string }>,
  requirement: keyof typeof WCAG_REQUIREMENTS = 'AA_NORMAL'
): { step: number; oklch: string; ratio: number } | null {
  const minRatio = WCAG_REQUIREMENTS[requirement];

  // Sort by step to find the minimum that meets requirements
  const sortedSteps = [...colorSteps].sort((a, b) => a.step - b.step);

  for (const step of sortedSteps) {
    const ratio = getContrastRatio(step.oklch, backgroundValue);
    if (ratio >= minRatio) {
      return { ...step, ratio: Math.round(ratio * 10) / 10 };
    }
  }

  // Try from the other end (darker steps)
  const reversedSteps = [...colorSteps].sort((a, b) => b.step - a.step);

  for (const step of reversedSteps) {
    const ratio = getContrastRatio(step.oklch, backgroundValue);
    if (ratio >= minRatio) {
      return { ...step, ratio: Math.round(ratio * 10) / 10 };
    }
  }

  return null;
}

/**
 * Check if a touch target size meets requirements
 */
export function checkTouchTarget(
  width: number,
  height: number,
  platform: 'mobile' | 'desktop' = 'mobile'
): {
  meetsMinimum: boolean;
  meetsRecommended: boolean;
  minRequired: number;
  recommendedSize: number;
} {
  const minSize = Math.min(width, height);

  if (platform === 'mobile') {
    return {
      meetsMinimum: minSize >= TOUCH_TARGET_REQUIREMENTS.MOBILE_MIN,
      meetsRecommended: minSize >= TOUCH_TARGET_REQUIREMENTS.MOBILE_RECOMMENDED,
      minRequired: TOUCH_TARGET_REQUIREMENTS.MOBILE_MIN,
      recommendedSize: TOUCH_TARGET_REQUIREMENTS.MOBILE_RECOMMENDED,
    };
  }

  return {
    meetsMinimum: minSize >= TOUCH_TARGET_REQUIREMENTS.DESKTOP_MIN,
    meetsRecommended: minSize >= TOUCH_TARGET_REQUIREMENTS.DESKTOP_MIN,
    minRequired: TOUCH_TARGET_REQUIREMENTS.DESKTOP_MIN,
    recommendedSize: TOUCH_TARGET_REQUIREMENTS.DESKTOP_MIN,
  };
}

/**
 * Format contrast ratio for display
 */
export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`;
}

/**
 * Get WCAG level badge text
 */
export function getWCAGBadge(result: ContrastResult): {
  level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  color: 'success' | 'warning' | 'error';
} {
  if (result.passesAAA) {
    return { level: 'AAA', color: 'success' };
  }
  if (result.passesAA) {
    return { level: 'AA', color: 'success' };
  }
  if (result.passesAALarge) {
    return { level: 'AA Large', color: 'warning' };
  }
  return { level: 'Fail', color: 'error' };
}
