/**
 * TypeScaleEditor.tsx
 * Modular type scale configuration with live preview
 */

'use client';

import { useMemo, useState } from 'react';
import { generateTypeScale, SCALE_FACTOR_PRESETS } from '@oneui/shared';
import { SliderControl } from '../shared/SliderControl';
import styles from './Typography.module.css';
import type { TypeScaleEditorProps } from './Typography.shared';
import { SCALE_FACTOR_LABELS } from './Typography.shared';
import { getFontById, buildFontFamilyString } from './fonts';

// Zoom levels for preview
const ZOOM_LEVELS = [
  { value: 1, label: '100%' },
  { value: 0.5, label: '50%' },
  { value: 0.25, label: '25%' },
  { value: 0.125, label: '12.5%' },
] as const;

// Font type options for preview
type FontType = 'primary' | 'secondary' | 'script';

const FONT_TYPE_OPTIONS: { value: FontType; label: string }[] = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'script', label: 'Script' },
];

export const TypeScaleEditor: React.FC<TypeScaleEditorProps> = ({
  baseSize,
  scaleFactor,
  onBaseSizeChange,
  onScaleFactorChange,
  fontSelection,
  loadedFonts,
  disabled = false,
}) => {
  // Zoom state for preview (for large typography like outdoor signage)
  const [zoomLevel, setZoomLevel] = useState(1);
  // Font type for preview
  const [previewFontType, setPreviewFontType] = useState<FontType>('primary');

  // Get the selected font family for preview
  const previewFontFamily = useMemo(() => {
    if (!fontSelection) return 'inherit';

    let fontId: string | null = null;
    if (previewFontType === 'primary') {
      fontId = fontSelection.primaryFontId;
    } else if (previewFontType === 'secondary') {
      fontId = fontSelection.secondaryFontId;
    } else if (previewFontType === 'script') {
      fontId = fontSelection.fallbackFontIds?.[0] || null;
    }

    if (!fontId) return 'inherit';
    if (!loadedFonts?.has(fontId)) return 'inherit';

    const font = getFontById(fontId);
    return font ? buildFontFamilyString(font) : 'inherit';
  }, [fontSelection, previewFontType, loadedFonts]);

  // Get available font types (only show options that have fonts selected)
  const availableFontTypes = useMemo(() => {
    if (!fontSelection) return [];
    return FONT_TYPE_OPTIONS.filter(opt => {
      if (opt.value === 'primary') return !!fontSelection.primaryFontId;
      if (opt.value === 'secondary') return !!fontSelection.secondaryFontId;
      if (opt.value === 'script') return (fontSelection.fallbackFontIds?.length || 0) > 0;
      return false;
    });
  }, [fontSelection]);

  // Generate the type scale for preview
  const typeScale = useMemo(() => {
    return generateTypeScale(baseSize, scaleFactor);
  }, [baseSize, scaleFactor]);

  // Determine if we need zoom controls (largest size > 100px)
  const largestSize = useMemo(() => {
    let max = 0;
    typeScale.forEach(size => {
      if (size > max) max = size;
    });
    return max;
  }, [typeScale]);

  const needsZoom = largestSize > 100;

  // Auto-suggest zoom level based on largest size
  const suggestedZoom = useMemo(() => {
    if (largestSize > 400) return 0.125;
    if (largestSize > 200) return 0.25;
    if (largestSize > 100) return 0.5;
    return 1;
  }, [largestSize]);

  // Scale factor preset values
  const scaleFactorPresets = Object.entries(SCALE_FACTOR_PRESETS);

  return (
    <div className={styles.typeScaleContainer}>
      {/* Controls - Base size takes more space, Scale Factor on the right */}
      <div className={styles.scaleControls} style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Base size control - takes more space */}
        <div className={styles.scaleControl}>
          <SliderControl
            label="Base Size"
            value={baseSize}
            min={12}
            max={200}
            step={1}
            unit="px"
            onChange={onBaseSizeChange}
            disabled={disabled}
          />
          <span className={styles.controlDescription}>
            The base font size for Body-M and Label-M styles
          </span>
        </div>

        {/* Scale factor control - compact on the right */}
        <div className={styles.scaleControl}>
          <span className={styles.controlLabel}>Scale Factor</span>
          <div className={styles.scaleFactorButtons} style={{ flexWrap: 'wrap' }}>
            {scaleFactorPresets.map(([name, value]) => (
              <button
                key={name}
                type="button"
                className={styles.scaleFactorButton}
                data-selected={Math.abs(scaleFactor - value) < 0.001}
                onClick={() => onScaleFactorChange(value)}
                disabled={disabled}
              >
                {SCALE_FACTOR_LABELS[value] || name}
              </button>
            ))}
          </div>
          <span className={styles.controlDescription}>
            Multiplier between each step in the scale
          </span>
        </div>
      </div>

      {/* Divider between controls and preview */}
      <div className={styles.sectionDivider} />

      {/* Preview controls bar - full width, font on left, zoom on right */}
      {(availableFontTypes.length > 0 || needsZoom) && (
        <div className={styles.previewControlsBar}>
          {/* Font type selector - left side */}
          {availableFontTypes.length > 0 && (
            <div className={styles.previewControlGroup}>
              <span className={styles.previewControlLabel}>Preview Font</span>
              <div className={styles.zoomButtons}>
                {availableFontTypes.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={styles.zoomButton}
                    data-selected={previewFontType === value}
                    onClick={() => setPreviewFontType(value)}
                    disabled={disabled}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Zoom controls - right side */}
          {needsZoom && (
            <div className={styles.previewControlGroup}>
              <span className={styles.previewControlLabel}>
                Zoom ({largestSize}px max)
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
        </div>
      )}

      {/* Type scale preview - with zoom only on text, not on reference */}
      <div className={styles.scalePreviewTable}>
        {Array.from(typeScale.entries()).map(([name, size]) => (
          <div key={name} className={styles.scalePreviewRow}>
            {/* Fixed reference column - not affected by zoom */}
            <div className={styles.scalePreviewRef}>
              <span className={styles.scalePreviewName}>{name}</span>
              <span className={styles.scalePreviewSize}>{size}px</span>
            </div>
            {/* Preview column - affected by zoom and font */}
            <div className={styles.scalePreviewTextContainer}>
              <span
                className={styles.scalePreviewText}
                style={{
                  fontSize: `${size * zoomLevel}px`,
                  lineHeight: 1.2,
                  fontFamily: previewFontFamily,
                }}
              >
                The quick brown fox
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
