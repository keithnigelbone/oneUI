/**
 * ColorScaleRow
 *
 * Horizontal 25-step color scale row with selection state.
 * Shows full scale strip with base color indicator.
 *
 * Performance: Memoized to prevent re-renders when parent state changes
 */

'use client';

import { useMemo, memo, useCallback } from 'react';
import type { ColorScaleRowProps } from './ColorScaleRow.shared';
import styles from './ColorScaleRow.module.css';

/**
 * Parse OKLCH string to values
 * e.g., "oklch(75.61% 0.0925 57.06)" -> { l: 0.7561, c: 0.0925, h: 57.06 }
 */
function parseOklch(oklch: string): { l: number; c: number; h: number } | null {
  const match = oklch.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\s*\)/i);
  if (!match) return null;

  let l = parseFloat(match[1]);
  // If value > 1, it's a percentage
  if (l > 1) l = l / 100;

  return {
    l,
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
  };
}

/**
 * Convert OKLCH to linear sRGB
 * Based on https://bottosson.github.io/posts/oklab/
 */
function oklchToLinearRgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
  // Convert to OKLab
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLab to linear sRGB
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  return {
    r: +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    g: -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    b: -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  };
}

/**
 * Convert linear RGB to sRGB (apply gamma)
 */
function linearToSrgb(value: number): number {
  if (value <= 0.0031308) {
    return 12.92 * value;
  }
  return 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

/**
 * Convert OKLCH to sRGB hex
 */
function oklchToHex(oklch: string): string | null {
  const parsed = parseOklch(oklch);
  if (!parsed) return null;

  const linear = oklchToLinearRgb(parsed.l, parsed.c, parsed.h);

  const r = Math.round(Math.max(0, Math.min(1, linearToSrgb(linear.r))) * 255);
  const g = Math.round(Math.max(0, Math.min(1, linearToSrgb(linear.g))) * 255);
  const b = Math.round(Math.max(0, Math.min(1, linearToSrgb(linear.b))) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance per WCAG 2.1
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Get luminance from OKLCH or hex color
 */
function getLuminanceFromColor(color: string): number {
  // Try OKLCH first
  if (color.startsWith('oklch')) {
    const hex = oklchToHex(color);
    if (hex) {
      const rgb = hexToRgb(hex);
      if (rgb) return getRelativeLuminance(rgb.r, rgb.g, rgb.b);
    }
  }

  // Fall back to hex
  const rgb = hexToRgb(color);
  if (rgb) return getRelativeLuminance(rgb.r, rgb.g, rgb.b);

  return 0;
}

/**
 * Calculate contrast ratio between two colors (OKLCH or hex)
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminanceFromColor(color1);
  const l2 = getLuminanceFromColor(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get WCAG compliance level for a contrast ratio
 */
function getWcagLevel(ratio: number): { aa: boolean; aaa: boolean; aaLarge: boolean; aaaLarge: boolean } {
  return {
    aa: ratio >= 4.5,       // Normal text AA
    aaa: ratio >= 7,        // Normal text AAA
    aaLarge: ratio >= 3,    // Large text AA
    aaaLarge: ratio >= 4.5, // Large text AAA
  };
}

function ColorScaleRowInner({
  name,
  steps,
  baseStep,
  isSelected = false,
  isActive = false,
  onSelect,
  onEdit,
  onDelete,
  showCheckbox = false,
  showActions = false,
  disabled = false,
  showStepNumbers = true,
  compact = false,
}: ColorScaleRowProps) {
  // Normalize baseStep to string for comparison
  const baseStepStr = baseStep?.toString();

  // Key step labels to show
  const stepLabels = useMemo(() => {
    if (steps.length === 0) return [];
    // Show labels at regular intervals: first, quarter points, last
    const indices = [0, 6, 12, 18, 24].filter(i => i < steps.length);
    return indices.map(i => {
      const step = steps[i];
      return {
        label: typeof step.step === 'number' ? step.step : parseInt(step.step as string, 10),
        index: i,
      };
    });
  }, [steps]);

  const handleClick = useCallback(() => {
    if (!disabled && onSelect) {
      onSelect();
    }
  }, [disabled, onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && onSelect) {
      e.preventDefault();
      onSelect();
    }
  }, [disabled, onSelect]);

  return (
    <div
      className={`${styles.row} ${isSelected ? styles.selected : ''} ${isActive ? styles.active : ''} ${disabled ? styles.disabled : ''} ${compact ? styles.compact : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={showCheckbox ? 'checkbox' : 'button'}
      aria-checked={showCheckbox ? isSelected : undefined}
      tabIndex={disabled ? -1 : 0}
    >
      {/* Checkbox */}
      {showCheckbox && (
        <div className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`}>
          {isSelected && <span className={styles.checkmark}>✓</span>}
        </div>
      )}

      {/* Scale name and info — fixed-width column keeps every strip the same size */}
      <div className={styles.nameSection}>
        <span className={styles.name} title={name}>{name}</span>
        {baseStep && (
          <span className={styles.baseLabel}>Base: {baseStep}</span>
        )}
      </div>

      {/* Scale strip */}
      <div className={styles.scaleContainer}>
        <div className={styles.scaleStrip}>
          {steps.map((step, index) => {
            const stepStr = step.step.toString();
            const isBase = step.isBase || stepStr === baseStepStr;
            // Use OKLCH directly when available for accurate color representation
            // Fall back to hex only when OKLCH is not provided
            const bgColor = step.oklch || step.hex;

            // Calculate contrast ratios using OKLCH when available for accuracy
            const colorForContrast = step.oklch || step.hex;
            // INTENTIONAL-LITERAL: WCAG reference white for contrast ratio calculation per WCAG 2.1 spec
            const whiteContrast = getContrastRatio(colorForContrast, '#FFFFFF');
            // INTENTIONAL-LITERAL: WCAG reference black for contrast ratio calculation per WCAG 2.1 spec
            const blackContrast = getContrastRatio(colorForContrast, '#000000');
            const whiteLevel = getWcagLevel(whiteContrast);
            const blackLevel = getWcagLevel(blackContrast);

            // Get computed hex from OKLCH for display
            const computedHex = step.oklch ? oklchToHex(step.oklch) : step.hex;

            return (
              <div
                key={stepStr}
                className={styles.step}
                style={{ backgroundColor: bgColor }}
              >
                {isBase && <div className={styles.baseIndicator} />}
                {showStepNumbers && (
                  <div className={styles.detailedTooltip}>
                    {/* Header with step number */}
                    <div className={styles.tooltipHeader}>
                      <span className={styles.tooltipStep}>Step {stepStr}</span>
                      {isBase && <span className={styles.tooltipBase}>BASE</span>}
                    </div>

                    {/* Color values */}
                    <div className={styles.tooltipValues}>
                      {step.oklch && (
                        <div className={styles.tooltipRow}>
                          <span className={styles.tooltipLabel}>OKLCH</span>
                          <span className={styles.tooltipValue}>{step.oklch}</span>
                        </div>
                      )}
                      <div className={styles.tooltipRow}>
                        <span className={styles.tooltipLabel}>HEX</span>
                        <span className={styles.tooltipValue}>{(computedHex || step.hex).toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Accessibility section */}
                    <div className={styles.tooltipA11y}>
                      <div className={styles.tooltipA11yTitle}>Accessibility</div>

                      {/* White text on this color */}
                      <div className={styles.tooltipContrastRow}>
                        {/* INTENTIONAL-LITERAL: preview shows literal white text on color swatch for accessibility demo */}
                        <div className={styles.tooltipContrastPreview} style={{ backgroundColor: bgColor, color: '#FFFFFF' }}>
                          Aa
                        </div>
                        <div className={styles.tooltipContrastInfo}>
                          <span className={styles.tooltipContrastLabel}>White text</span>
                          <span className={`${styles.tooltipContrastRatio} ${!whiteLevel.aa ? styles.fail : ''}`}>{whiteContrast.toFixed(2)}:1</span>
                        </div>
                        <div className={styles.tooltipBadges}>
                          {whiteLevel.aa && (
                            <span className={`${styles.tooltipBadge} ${styles.pass}`}>
                              AA
                            </span>
                          )}
                          {whiteLevel.aaa && (
                            <span className={`${styles.tooltipBadge} ${styles.pass}`}>
                              AAA
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Black text on this color */}
                      <div className={styles.tooltipContrastRow}>
                        {/* INTENTIONAL-LITERAL: preview shows literal black text on color swatch for accessibility demo */}
                        <div className={styles.tooltipContrastPreview} style={{ backgroundColor: bgColor, color: '#000000' }}>
                          Aa
                        </div>
                        <div className={styles.tooltipContrastInfo}>
                          <span className={styles.tooltipContrastLabel}>Black text</span>
                          <span className={`${styles.tooltipContrastRatio} ${!blackLevel.aa ? styles.fail : ''}`}>{blackContrast.toFixed(2)}:1</span>
                        </div>
                        <div className={styles.tooltipBadges}>
                          {blackLevel.aa && (
                            <span className={`${styles.tooltipBadge} ${styles.pass}`}>
                              AA
                            </span>
                          )}
                          {blackLevel.aaa && (
                            <span className={`${styles.tooltipBadge} ${styles.pass}`}>
                              AAA
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step labels */}
        {!compact && stepLabels.length > 0 && (
          <div className={styles.stepLabels}>
            {stepLabels.map(({ label }) => (
              <span key={label} className={styles.stepLabel}>
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className={styles.actions}>
          {onEdit && (
            <button
              type="button"
              className={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className={`${styles.actionButton} ${styles.delete}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Memoized ColorScaleRow to prevent re-renders in lists
 * This is critical for performance when displaying many color scales
 */
export const ColorScaleRow = memo(ColorScaleRowInner);
ColorScaleRow.displayName = 'ColorScaleRow';

export type { ColorScaleRowProps };
