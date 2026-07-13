/**
 * FontSelector.tsx
 * Font selection grid with scope toggle and category filtering
 */

import { memo, useMemo, useCallback } from 'react';
import type { FontCategory, FontScope, FontSelection, FontMetadata } from './fonts';
import { getFontsByCategory, STYLE_FONT_MAPPING, DEFAULT_FONT_SELECTION } from './fonts';
import { FontPreviewCard } from './FontPreviewCard';
import { FontScopeToggle } from './FontScopeToggle';
import styles from './Typography.module.css';

export interface FontSelectorProps {
  /** Current font category tab */
  activeCategory: FontCategory;
  /** Current font selection state */
  fontSelection: FontSelection;
  /** Set of loaded font IDs */
  loadedFonts: Set<string>;
  /** Set of currently loading font IDs */
  loadingFonts: Set<string>;
  /** Handler for scope change */
  onScopeChange: (scope: FontScope) => void;
  /** Handler for primary font selection */
  onPrimaryFontChange: (fontId: string) => void;
  /** Handler for secondary font selection */
  onSecondaryFontChange: (fontId: string) => void;
  /** Handler to load a font */
  onLoadFont: (font: FontMetadata) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * FontSelector - Grid-based font selection with primary/secondary support
 */
export const FontSelector = memo(function FontSelector({
  activeCategory,
  fontSelection: fontSelectionProp,
  loadedFonts,
  loadingFonts,
  onScopeChange,
  onPrimaryFontChange,
  onSecondaryFontChange,
  onLoadFont,
  disabled = false,
}: FontSelectorProps) {
  // Ensure fontSelection always has a value (backward compatibility)
  const fontSelection = fontSelectionProp || DEFAULT_FONT_SELECTION;

  const fonts = useMemo(
    () => getFontsByCategory(activeCategory),
    [activeCategory]
  );

  // Handle font card click
  const handleFontClick = useCallback(
    (font: FontMetadata, isPrimarySelection: boolean) => {
      // Load the font if not already loaded
      if (!loadedFonts.has(font.id) && !loadingFonts.has(font.id)) {
        onLoadFont(font);
      }

      // Update selection
      if (fontSelection.scope === 'single' || isPrimarySelection) {
        onPrimaryFontChange(font.id);
      } else {
        onSecondaryFontChange(font.id);
      }
    },
    [fontSelection.scope, loadedFonts, loadingFonts, onLoadFont, onPrimaryFontChange, onSecondaryFontChange]
  );

  // Get selection state for a font
  const getSelectionType = useCallback(
    (fontId: string): 'primary' | 'secondary' | null => {
      if (fontSelection.primaryFontId === fontId) return 'primary';
      if (fontSelection.scope === 'dual' && fontSelection.secondaryFontId === fontId) {
        return 'secondary';
      }
      return null;
    },
    [fontSelection]
  );

  return (
    <div className={styles.fontSelectorContainer}>
      {/* Scope toggle */}
      <FontScopeToggle
        scope={fontSelection.scope}
        onScopeChange={onScopeChange}
        disabled={disabled}
      />

      {/* Primary font section */}
      <div className={styles.fontSelectorSection}>
        <div className={styles.fontSelectorSectionHeader}>
          <span className={styles.fontSelectorSectionTitle}>
            {fontSelection.scope === 'single'
              ? 'Select Font'
              : 'Primary Font'}
          </span>
          <span className={styles.fontSelectorSectionDescription}>
            {fontSelection.scope === 'single'
              ? 'Applied to all typography styles'
              : `Applied to ${STYLE_FONT_MAPPING.primary.join(', ')}`}
          </span>
        </div>

        <div className={styles.fontGrid}>
          {fonts.map((font) => (
            <FontPreviewCard
              key={font.id}
              font={font}
              isSelected={fontSelection.primaryFontId === font.id}
              isLoaded={loadedFonts.has(font.id)}
              isLoading={loadingFonts.has(font.id)}
              selectionType={getSelectionType(font.id)}
              onClick={() => handleFontClick(font, true)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Secondary font section (only in dual mode) */}
      {fontSelection.scope === 'dual' && (
        <div className={styles.fontSelectorSection}>
          <div className={styles.fontSelectorSectionHeader}>
            <span className={styles.fontSelectorSectionTitle}>
              Secondary Font
            </span>
            <span className={styles.fontSelectorSectionDescription}>
              Applied to {STYLE_FONT_MAPPING.secondary.join(', ')}
            </span>
          </div>

          <div className={styles.fontGrid}>
            {fonts.map((font) => (
              <FontPreviewCard
                key={font.id}
                font={font}
                isSelected={fontSelection.secondaryFontId === font.id}
                isLoaded={loadedFonts.has(font.id)}
                isLoading={loadingFonts.has(font.id)}
                selectionType={getSelectionType(font.id)}
                onClick={() => handleFontClick(font, false)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
