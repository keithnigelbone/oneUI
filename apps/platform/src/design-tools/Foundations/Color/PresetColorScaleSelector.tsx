/**
 * PresetColorScaleSelector
 *
 * Component for selecting preset color scales from uploaded collections.
 * Brands can select multiple scales to use in their design system.
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { PresetColorScaleSelectorProps, PresetScale } from './PresetColorScaleSelector.shared';
import styles from './PresetColorScaleSelector.module.css';

/**
 * Parse OkLCH string to get components
 */
function parseOklch(oklch: string): { l: number; c: number; h: number } | null {
  const match = oklch.match(/oklch\((\d+(?:\.\d+)?)[%\s]+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\)/);
  if (!match) return null;
  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
  };
}

/**
 * Simple OkLCH to hex conversion (approximate)
 */
function oklchToHex(l: number, c: number, h: number): string {
  const L = l / 100;
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  let linearR = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let linearG = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let linearB = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  linearR = Math.max(0, Math.min(1, linearR));
  linearG = Math.max(0, Math.min(1, linearG));
  linearB = Math.max(0, Math.min(1, linearB));

  const r = linearR <= 0.0031308 ? 12.92 * linearR : 1.055 * Math.pow(linearR, 1 / 2.4) - 0.055;
  const g = linearG <= 0.0031308 ? 12.92 * linearG : 1.055 * Math.pow(linearG, 1 / 2.4) - 0.055;
  const bVal = linearB <= 0.0031308 ? 12.92 * linearB : 1.055 * Math.pow(linearB, 1 / 2.4) - 0.055;

  const toHex = (val: number) => Math.round(Math.max(0, Math.min(1, val)) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(bVal)}`;
}

/**
 * Get hex color from OkLCH string
 */
function getHexFromOklchString(oklch: string): string {
  const parsed = parseOklch(oklch);
  // INTENTIONAL-LITERAL: neutral fallback hex for OkLCH parse failure in color math — not CSS styling
  if (!parsed) return '#808080';
  return oklchToHex(parsed.l, parsed.c, parsed.h);
}

/**
 * Get contrasting text color
 */
function getContrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // INTENTIONAL-LITERAL: WCAG reference black/white for on-color text contrast calculation
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function PresetColorScaleSelector({
  collections,
  selectedCollectionId: initialCollectionId,
  selectedScales: initialSelectedScales = [],
  selectedCollectionScales = [],
  isLoading = false,
  onSelectionChange,
  onSaveSelection,
  onSwitchToCustom,
  disabled = false,
  showCollectionSelector = true,
}: PresetColorScaleSelectorProps) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(initialCollectionId || null);
  const [localSelectedScales, setLocalSelectedScales] = useState<string[]>(initialSelectedScales);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize selection from props
  useEffect(() => {
    if (initialCollectionId) {
      setSelectedCollectionId(initialCollectionId);
    }
    setLocalSelectedScales(initialSelectedScales);
  }, [initialCollectionId, initialSelectedScales]);

  // Auto-select first collection when there's only one and none selected
  useEffect(() => {
    if (!selectedCollectionId && collections.length > 0) {
      const firstCollection = collections.find(c => c.isDefault) || collections[0];
      setSelectedCollectionId(firstCollection._id);
      onSelectionChange?.(firstCollection._id, []);
    }
  }, [collections, selectedCollectionId, onSelectionChange]);

  // Get scales to display
  const scales = useMemo(() => {
    if (selectedCollectionScales.length > 0) {
      return selectedCollectionScales;
    }
    // Find scales from the selected collection
    const collection = collections.find(c => c._id === selectedCollectionId);
    return collection?.scales || [];
  }, [selectedCollectionScales, collections, selectedCollectionId]);

  // Handle collection change
  const handleCollectionChange = useCallback((collectionId: string) => {
    setSelectedCollectionId(collectionId);
    setLocalSelectedScales([]);
    onSelectionChange?.(collectionId, []);
  }, [onSelectionChange]);

  // Handle scale toggle
  const handleScaleToggle = useCallback((scaleName: string) => {
    if (disabled) return;

    setLocalSelectedScales(prev => {
      const newSelection = prev.includes(scaleName)
        ? prev.filter(s => s !== scaleName)
        : [...prev, scaleName];
      return newSelection;
    });
  }, [disabled]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!selectedCollectionId || localSelectedScales.length === 0 || !onSaveSelection) return;

    setIsSaving(true);
    try {
      await onSaveSelection(selectedCollectionId, localSelectedScales);
      onSelectionChange?.(selectedCollectionId, localSelectedScales);
    } catch (error) {
      console.error('Failed to save scale selection:', error);
    } finally {
      setIsSaving(false);
    }
  }, [selectedCollectionId, localSelectedScales, onSaveSelection, onSelectionChange]);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        Loading color scale collections...
      </div>
    );
  }

  // No collections available
  if (collections.length === 0) {
    return (
      <div className={styles.emptyState}>
        No preset color scale collections available.
        <br />
        Upload a JSON color scale file to create one.
      </div>
    );
  }

  const hasUnsavedChanges = JSON.stringify(localSelectedScales.sort()) !==
    JSON.stringify(initialSelectedScales.sort()) ||
    selectedCollectionId !== initialCollectionId;

  return (
    <div className={styles.container}>
      {/* Header with switch to custom option */}
      <div className={styles.header}>
        <span className={styles.title}>Select Preset Color Scales</span>
        {onSwitchToCustom && (
          <button
            type="button"
            className={styles.switchButton}
            onClick={onSwitchToCustom}
            disabled={disabled}
          >
            Use custom scales instead
          </button>
        )}
      </div>

      {/* Collection selector - show tabs for multiple collections, or collection name for single */}
      {showCollectionSelector && collections.length > 0 && (
        <div className={styles.collectionSelector}>
          {collections.length === 1 ? (
            // Single collection - just show the name
            <div className={`${styles.collectionButton} ${styles.selected}`}>
              {collections[0].name}
              {collections[0].isDefault && (
                <span className={styles.defaultBadge}>Default</span>
              )}
            </div>
          ) : (
            // Multiple collections - show tabs
            collections.map((collection) => (
              <button
                key={collection._id}
                type="button"
                className={`${styles.collectionButton} ${selectedCollectionId === collection._id ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
                onClick={() => handleCollectionChange(collection._id)}
                disabled={disabled}
              >
                {collection.name}
                {collection.isDefault && (
                  <span className={styles.defaultBadge}>Default</span>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Scales list */}
      {scales.length > 0 && (
        <div className={styles.scalesSection}>
          <div className={styles.sectionTitle}>
            Available scales ({scales.length})
          </div>
          <div className={styles.scalesList}>
            {scales.map((scale) => {
              const isSelected = localSelectedScales.includes(scale.name);
              const baseStep = scale.steps.find(s => s.step === scale.baseStep);
              // INTENTIONAL-LITERAL: neutral fallback hex when base step OkLCH is unavailable — used for swatch rendering
              const baseHex = baseStep ? getHexFromOklchString(baseStep.oklch) : '#808080';
              const textColor = getContrastText(baseHex);

              return (
                <div
                  key={scale._id}
                  className={`${styles.scaleChip} ${isSelected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
                  style={{ backgroundColor: baseHex, color: textColor }}
                  onClick={() => handleScaleToggle(scale.name)}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={disabled ? -1 : 0}
                >
                  {/* Mini scale strip */}
                  <div className={styles.scaleStrip}>
                    {scale.steps.filter((_, i) => i % 5 === 0).map((step) => (
                      <div
                        key={step.step}
                        className={styles.scaleStripStep}
                        style={{ backgroundColor: getHexFromOklchString(step.oklch) }}
                      />
                    ))}
                  </div>

                  {/* Scale info */}
                  <div className={styles.scaleInfo}>
                    <span className={styles.scaleName}>{scale.name}</span>
                    <span className={styles.scaleBase}>base @{scale.baseStep}</span>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className={styles.selectedIndicator}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selection summary */}
      {localSelectedScales.length > 0 && (
        <div className={styles.selectionSummary}>
          Selected: {localSelectedScales.join(', ')}
        </div>
      )}

      {/* Actions */}
      {hasUnsavedChanges && onSaveSelection && (
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.secondary}`}
            onClick={() => {
              setLocalSelectedScales(initialSelectedScales);
              setSelectedCollectionId(initialCollectionId || null);
            }}
            disabled={isSaving}
          >
            Reset
          </button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.primary}`}
            onClick={handleSave}
            disabled={localSelectedScales.length === 0 || isSaving}
          >
            {isSaving ? 'Saving...' : 'Apply Selection'}
          </button>
        </div>
      )}
    </div>
  );
}

export type { PresetColorScaleSelectorProps };
