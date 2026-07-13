/**
 * FontPreviewCard.tsx
 * Individual font preview card with sample text and selection state
 */

import { memo } from 'react';
import type { FontMetadata } from './fonts';
import { buildFontFamilyString } from './fonts';
import styles from './Typography.module.css';

export interface FontPreviewCardProps {
  /** Font metadata */
  font: FontMetadata;
  /** Whether this font is selected */
  isSelected: boolean;
  /** Whether the font is loaded */
  isLoaded: boolean;
  /** Whether the font is currently loading */
  isLoading: boolean;
  /** Selection type indicator (for dual mode) */
  selectionType?: 'primary' | 'secondary' | null;
  /** Click handler */
  onClick: () => void;
  /** Whether the card is disabled */
  disabled?: boolean;
}

/**
 * FontPreviewCard - Displays a font preview with sample text
 */
export const FontPreviewCard = memo(function FontPreviewCard({
  font,
  isSelected,
  isLoaded,
  isLoading,
  selectionType,
  onClick,
  disabled = false,
}: FontPreviewCardProps) {
  const fontFamily = isLoaded ? buildFontFamilyString(font) : 'inherit';

  return (
    <button
      type="button"
      className={styles.fontCard}
      data-selected={isSelected}
      data-loading={isLoading}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-pressed={isSelected}
      aria-label={`Select ${font.name} font`}
    >
      {/* Selection badge */}
      {isSelected && selectionType && (
        <span className={styles.fontSelectionBadge} data-type={selectionType}>
          {selectionType === 'primary' ? 'P' : 'S'}
        </span>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <span className={styles.fontLoadingIndicator} aria-label="Loading font">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={styles.fontLoadingSpinner}
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="32"
              strokeDashoffset="24"
            />
          </svg>
        </span>
      )}

      {/* Font name */}
      <span className={styles.fontCardName}>{font.name}</span>

      {/* Variable indicator */}
      {font.isVariable && (
        <span className={styles.fontVariableBadge}>VAR</span>
      )}

      {/* Sample text preview */}
      <span
        className={styles.fontCardSample}
        style={{ fontFamily }}
      >
        Aa Bb
      </span>

      {/* Secondary info */}
      <span className={styles.fontCardInfo}>
        {font.weights.length} weights
      </span>
    </button>
  );
});
