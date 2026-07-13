/**
 * TypographyStyleEditor.tsx
 * Editor for individual typography style properties
 */

'use client';

import React, { useCallback, useMemo, useState } from 'react';
import type { TypographyStyle } from '@oneui/shared';
import { getStyleCategory } from '@oneui/shared';
import { Select, type SelectOption } from '@oneui/ui-internal/components/Select';
import styles from './Typography.module.css';
import type { TypographyStyleEditorProps } from './Typography.shared';
import {
  type FontSelection,
  getFontForStyleCategory,
  getFontById,
  buildFontFamilyString,
  STYLE_FONT_MAPPING,
  FONT_COLLECTION,
} from './fonts';

// Zoom levels for preview
const ZOOM_LEVELS = [
  { value: 1, label: '100%' },
  { value: 0.5, label: '50%' },
  { value: 0.25, label: '25%' },
  { value: 0.125, label: '12.5%' },
] as const;

// Group styles by category
function groupStylesByCategory(
  styleList: TypographyStyle[]
): Record<string, TypographyStyle[]> {
  const groups: Record<string, TypographyStyle[]> = {
    Display: [],
    Headline: [],
    Title: [],
    Label: [],
    Body: [],
  };

  for (const style of styleList) {
    const category = getStyleCategory(style.name);
    if (groups[category]) {
      groups[category].push(style);
    }
  }

  return groups;
}

export const TypographyStyleEditor: React.FC<TypographyStyleEditorProps> = ({
  styles: typographyStyles,
  onChange,
  fontSelection,
  loadedFonts,
  perStyleFonts = {},
  onPerStyleFontChange,
  disabled = false,
}) => {
  // Zoom state for preview column
  const [zoomLevel, setZoomLevel] = useState(1);

  // Group styles by category
  const groupedStyles = useMemo(
    () => groupStylesByCategory(typographyStyles),
    [typographyStyles]
  );

  // Calculate largest font size to determine if zoom is needed
  const largestSize = useMemo(() => {
    return Math.max(...typographyStyles.map(s => s.fontSize), 0);
  }, [typographyStyles]);

  const needsZoom = largestSize > 60;

  // Auto-suggest zoom level
  const suggestedZoom = useMemo(() => {
    if (largestSize > 200) return 0.125;
    if (largestSize > 100) return 0.25;
    if (largestSize > 60) return 0.5;
    return 1;
  }, [largestSize]);

  // Handle style property change
  const handleStyleChange = useCallback(
    (
      styleName: string,
      property: keyof TypographyStyle,
      value: number
    ) => {
      const updatedStyles = typographyStyles.map((style) => {
        if (style.name !== styleName) return style;
        return { ...style, [property]: value };
      });
      onChange(updatedStyles);
    },
    [typographyStyles, onChange]
  );

  // Weight options for Select component
  const weightOptions: SelectOption<number>[] = useMemo(() => [
    { value: 100, label: '100' },
    { value: 200, label: '200' },
    { value: 300, label: '300' },
    { value: 400, label: '400' },
    { value: 500, label: '500' },
    { value: 600, label: '600' },
    { value: 700, label: '700' },
    { value: 800, label: '800' },
    { value: 900, label: '900' },
  ], []);

  // Line height options for Select component
  const lineHeightOptions: SelectOption<number>[] = useMemo(() => [
    { value: 100, label: '100%' },
    { value: 110, label: '110%' },
    { value: 120, label: '120%' },
    { value: 130, label: '130%' },
    { value: 140, label: '140%' },
    { value: 150, label: '150%' },
    { value: 160, label: '160%' },
  ], []);

  // Get font info for a style (checks per-style override first, then category default)
  const getFontInfo = useCallback(
    (styleName: string) => {
      // Check for per-style override first
      const overrideFontId = perStyleFonts[styleName];
      if (overrideFontId) {
        const font = getFontById(overrideFontId);
        if (font) {
          return {
            fontId: overrideFontId,
            font,
            isOverride: true,
            isPrimary: false,
            fontFamily: loadedFonts?.has(overrideFontId) ? buildFontFamilyString(font) : 'inherit',
          };
        }
      }

      // Fall back to category-based font selection
      if (!fontSelection) return null;

      const category = getStyleCategory(styleName);
      const fontId = getFontForStyleCategory(category, fontSelection);
      if (!fontId) return null;

      const font = getFontById(fontId);
      if (!font) return null;

      const isPrimary = STYLE_FONT_MAPPING.primary.includes(
        category as (typeof STYLE_FONT_MAPPING.primary)[number]
      );

      return {
        fontId,
        font,
        isOverride: false,
        isPrimary,
        fontFamily: loadedFonts?.has(fontId) ? buildFontFamilyString(font) : 'inherit',
      };
    },
    [fontSelection, loadedFonts, perStyleFonts]
  );

  // Handle per-style font change
  const handleFontChange = useCallback(
    (styleName: string, fontId: string) => {
      if (onPerStyleFontChange) {
        // Empty string means "use default"
        onPerStyleFontChange(styleName, fontId || null);
      }
    },
    [onPerStyleFontChange]
  );

  // Get available fonts for dropdown - only show brand-defined fonts (primary, secondary, script/fallbacks)
  const availableFonts = useMemo(() => {
    if (!fontSelection) return [];

    const brandFontIds = new Set<string>();

    // Add primary font
    if (fontSelection.primaryFontId) {
      brandFontIds.add(fontSelection.primaryFontId);
    }

    // Add secondary font (only relevant in dual mode)
    if (fontSelection.scope === 'dual' && fontSelection.secondaryFontId) {
      brandFontIds.add(fontSelection.secondaryFontId);
    }

    // Add script/fallback fonts
    if (fontSelection.fallbackFontIds) {
      for (const fontId of fontSelection.fallbackFontIds) {
        brandFontIds.add(fontId);
      }
    }

    // Filter to only brand-defined fonts that are loaded
    return FONT_COLLECTION.filter(
      (font) => brandFontIds.has(font.id) && (font.category !== 'script' || loadedFonts?.has(font.id))
    );
  }, [fontSelection, loadedFonts]);

  // Check if we should show the font column
  const showFontColumn = !!fontSelection;

  return (
    <div className={styles.styleEditorContainer}>
      {/* Zoom controls for large typography */}
      {needsZoom && (
        <div className={styles.zoomControls}>
          <span className={styles.zoomLabel}>
            Preview Zoom (largest: {largestSize}px)
          </span>
          <div className={styles.zoomButtons}>
            {ZOOM_LEVELS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={styles.zoomButton}
                data-selected={zoomLevel === value}
                data-suggested={suggestedZoom === value && zoomLevel !== value}
                onClick={() => setZoomLevel(value)}
                disabled={disabled}
              >
                {label}
                {suggestedZoom === value && zoomLevel !== value && (
                  <span className={styles.zoomSuggested}>*</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <table className={styles.styleTable}>
        <thead className={styles.styleTableHeader}>
          <tr>
            <th className={styles.styleTableHeaderCell}>Style</th>
            {showFontColumn && (
              <th className={styles.styleTableHeaderCell}>Font</th>
            )}
            <th className={styles.styleTableHeaderCell}>Size</th>
            <th className={styles.styleTableHeaderCell}>Weight</th>
            <th className={styles.styleTableHeaderCell}>Line Height</th>
            <th className={styles.styleTableHeaderCell}>Letter Spacing</th>
            <th className={styles.styleTableHeaderCell}>Preview</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedStyles).map(([category, categoryStyles]) => (
            <React.Fragment key={category}>
              {/* Category header */}
              <tr>
                <td colSpan={showFontColumn ? 7 : 6} className={styles.categoryHeader}>
                  {category}
                </td>
              </tr>
              {/* Styles in category */}
              {categoryStyles.map((style) => {
                const fontInfo = getFontInfo(style.name);
                return (
                <tr key={style.name} className={styles.styleTableRow}>
                  <td className={styles.styleTableCell}>
                    <span className={styles.styleName}>{style.name}</span>
                  </td>
                  {showFontColumn && (
                    <td className={styles.styleTableCell}>
                      {onPerStyleFontChange ? (
                        <Select
                          value={perStyleFonts[style.name] || ''}
                          onChange={(value) => handleFontChange(style.name, value)}
                          options={[
                            {
                              value: '',
                              label: fontInfo && !fontInfo.isOverride
                                ? `${fontInfo.font.name} (${fontInfo.isPrimary ? 'Primary' : 'Secondary'})`
                                : 'Default',
                            },
                            ...availableFonts.map((font) => ({
                              value: font.id,
                              label: font.name,
                            })),
                          ]}
                          disabled={disabled}
                          size="sm"
                          aria-label={`Font for ${style.name}`}
                        />
                      ) : fontInfo ? (
                        <span className={`${styles.fontCell} ${fontInfo.isPrimary ? styles.fontCellPrimary : ''}`}>
                          {fontInfo.font.name}
                          <span className={styles.fontCellBadge}>
                            {fontInfo.isPrimary ? 'P' : 'S'}
                          </span>
                        </span>
                      ) : (
                        <span className={styles.fontCell}>—</span>
                      )}
                    </td>
                  )}
                  <td className={styles.styleTableCell}>
                    <input
                      type="number"
                      className={styles.styleInput}
                      value={style.fontSize}
                      min={8}
                      max={2000}
                      onChange={(e) =>
                        handleStyleChange(
                          style.name,
                          'fontSize',
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      disabled={disabled}
                    />
                  </td>
                  <td className={styles.styleTableCell}>
                    <Select
                      value={style.fontWeight}
                      onChange={(value) =>
                        handleStyleChange(style.name, 'fontWeight', value)
                      }
                      options={weightOptions}
                      disabled={disabled}
                      size="sm"
                      aria-label={`Font weight for ${style.name}`}
                    />
                  </td>
                  <td className={styles.styleTableCell}>
                    <Select
                      value={style.lineHeight}
                      onChange={(value) =>
                        handleStyleChange(style.name, 'lineHeight', value)
                      }
                      options={lineHeightOptions}
                      disabled={disabled}
                      size="sm"
                      aria-label={`Line height for ${style.name}`}
                    />
                  </td>
                  <td className={styles.styleTableCell}>
                    <input
                      type="number"
                      className={styles.styleInput}
                      value={style.letterSpacing}
                      min={-5}
                      max={20}
                      step={0.5}
                      onChange={(e) =>
                        handleStyleChange(
                          style.name,
                          'letterSpacing',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={disabled}
                    />
                  </td>
                  <td className={`${styles.styleTableCell} ${styles.stylePreviewCell}`}>
                    <span
                      className={styles.stylePreviewText}
                      style={{
                        fontSize: `${style.fontSize * zoomLevel}px`,
                        fontWeight: style.fontWeight,
                        lineHeight: `${style.lineHeight}%`,
                        letterSpacing: `${style.letterSpacing / 100}em`,
                        fontFamily: fontInfo?.fontFamily || 'inherit',
                        display: 'block',
                      }}
                    >
                      Aa
                    </span>
                  </td>
                </tr>
              );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
