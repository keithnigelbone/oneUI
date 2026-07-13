/**
 * PreviewPanel.tsx
 *
 * Preview configuration controls for the component editor.
 * Includes accent role selector, size buttons, icon slot toggles,
 * layout toggles, and surface selection controls.
 * Uses ToggleGroup for all segmented selectors (consistent with foundation pages).
 */

'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import { ToggleGroup } from '@oneui/ui-internal/components/ToggleGroup/ToggleGroup';
import { SurfaceSelectionControls } from './SurfaceSelectionControls';
import { SIZE_LABELS as DEFAULT_SIZE_LABELS, ATTENTION_LABELS } from './constants';
import type { SurfaceToken } from '@oneui/shared/engine';
import styles from './PreviewPanel.module.css';

export interface PreviewPanelProps {
  /** Currently selected size */
  selectedSize?: string;
  /** Callback when size changes */
  onSizeChange?: (size: string) => void;
  /** Currently selected attention level (maps to variant internally) */
  selectedVariant?: string;
  /** Callback when attention level changes */
  onVariantChange?: (variant: string) => void;
  /** Selected accent role */
  selectedAccentRole?: string;
  /** Callback when accent role changes */
  onAccentRoleChange?: (role: string) => void;
  /** Available accent role options */
  accentRoleOptions?: Array<{ value: string; label: string; color?: string }> | null;
  /** Whether to show left icon in preview */
  showLeftIcon?: boolean;
  /** Whether to show right icon in preview */
  showRightIcon?: boolean;
  /** Callback when left icon toggle changes */
  onLeftIconToggle?: (show: boolean) => void;
  /** Callback when right icon toggle changes */
  onRightIconToggle?: (show: boolean) => void;
  /** Whether to show condensed variant */
  showCondensed?: boolean;
  /** Callback when condensed toggle changes */
  onCondensedToggle?: (show: boolean) => void;
  /** Whether to show full width */
  showFullWidth?: boolean;
  /** Callback when full width toggle changes */
  onFullWidthToggle?: (show: boolean) => void;
  /** Whether to show disabled state */
  showDisabled?: boolean;
  /** Callback when disabled toggle changes */
  onDisabledToggle?: (show: boolean) => void;
  /** Set of enabled surfaces for preview */
  enabledSurfaces?: Set<SurfaceToken>;
  /** Callback when a surface is toggled */
  onSurfaceToggle?: (surface: SurfaceToken) => void;
  /** Currently selected surface for dropdown */
  selectedSurface?: SurfaceToken;
  /** Callback when surface dropdown selection changes */
  onSurfaceSelect?: (surface: SurfaceToken) => void;
  /** Current preview mode */
  previewMode?: string;
  /** Selected typography font */
  selectedTypographyFont?: string;
  /** Callback when typography font changes */
  onTypographyFontChange?: (font: string) => void;
  /** Available typography font options */
  typographyFontOptions?: Array<{ value: string; label: string }> | null;
  /** Override size labels (derived from manifest for single source of truth) */
  sizeLabels?: Record<string, string>;
}

export function PreviewPanel({
  selectedVariant,
  onVariantChange,
  selectedSize,
  onSizeChange,
  selectedAccentRole,
  onAccentRoleChange,
  accentRoleOptions,
  showLeftIcon,
  showRightIcon,
  onLeftIconToggle,
  onRightIconToggle,
  showCondensed,
  onCondensedToggle,
  showFullWidth,
  onFullWidthToggle,
  showDisabled,
  onDisabledToggle,
  enabledSurfaces,
  onSurfaceToggle,
  selectedSurface,
  onSurfaceSelect,
  previewMode,
  selectedTypographyFont,
  onTypographyFontChange,
  typographyFontOptions,
  sizeLabels: sizeLabelsOverride,
}: PreviewPanelProps) {
  const sizeLabels = sizeLabelsOverride || DEFAULT_SIZE_LABELS;
  return (
    <div className={styles.panel}>
      {/* Appearance / Accent Role Selector */}
      {onAccentRoleChange && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Appearance</span>
          <Select
            value={selectedAccentRole || 'primary'}
            onChange={onAccentRoleChange}
            options={accentRoleOptions && accentRoleOptions.length > 0
              ? accentRoleOptions
              : [{ value: 'primary', label: 'Primary', color: 'var(--Surface-Bold)' }]}
            size="sm"
          />
        </div>
      )}

      {/* Attention Selector (All / High / Medium / Low) */}
      {onVariantChange && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Attention</span>
          <ToggleGroup
            value={[selectedVariant || 'all']}
            onValueChange={(values) => {
              const val = Array.isArray(values) ? values[0] : values;
              if (val) onVariantChange(val);
            }}
            size="compact"
            fullWidth
          >
            <ToggleGroup.Item value="all" aria-label="All attention levels">
              All
            </ToggleGroup.Item>
            {Object.entries(ATTENTION_LABELS).map(([variant, label]) => (
              <ToggleGroup.Item key={variant} value={variant} aria-label={label}>
                {label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </div>
      )}

      {/* Size Selector (All / S / M / L) */}
      {onSizeChange && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Size</span>
          <ToggleGroup
            value={[selectedSize || 'all']}
            onValueChange={(values) => {
              const val = Array.isArray(values) ? values[0] : values;
              if (val) onSizeChange(val);
            }}
            size="compact"
            fullWidth
          >
            <ToggleGroup.Item value="all" aria-label="All sizes">
              All
            </ToggleGroup.Item>
            {Object.entries(sizeLabels).map(([value, label]) => (
              <ToggleGroup.Item key={value} value={value} aria-label={label}>
                {label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </div>
      )}

      {/* Slot Toggles (Figma: start/end) */}
      {(onLeftIconToggle || onRightIconToggle) && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Slots</span>
          <ToggleGroup
            value={[
              ...(showLeftIcon ? ['left'] : []),
              ...(showRightIcon ? ['right'] : []),
            ]}
            onValueChange={(values) => {
              const arr = Array.isArray(values) ? values : [values];
              onLeftIconToggle?.(arr.includes('left'));
              onRightIconToggle?.(arr.includes('right'));
            }}
            toggleMultiple
            size="compact"
            fullWidth
          >
            {onLeftIconToggle && (
              <ToggleGroup.Item value="left" aria-label="Toggle start slot">
                <ArrowLeft size={14} />
                <span>Start</span>
              </ToggleGroup.Item>
            )}
            {onRightIconToggle && (
              <ToggleGroup.Item value="right" aria-label="Toggle end slot">
                <span>End</span>
                <ArrowRight size={14} />
              </ToggleGroup.Item>
            )}
          </ToggleGroup>
        </div>
      )}

      {/* Layout Toggles */}
      {(onCondensedToggle || onFullWidthToggle) && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Layout</span>
          <ToggleGroup
            value={[
              ...(showCondensed ? ['condensed'] : []),
              ...(showFullWidth ? ['fullWidth'] : []),
            ]}
            onValueChange={(values) => {
              const arr = Array.isArray(values) ? values : [values];
              onCondensedToggle?.(arr.includes('condensed'));
              onFullWidthToggle?.(arr.includes('fullWidth'));
            }}
            toggleMultiple
            size="compact"
            fullWidth
          >
            {onCondensedToggle && (
              <ToggleGroup.Item value="condensed">
                Condensed
              </ToggleGroup.Item>
            )}
            {onFullWidthToggle && (
              <ToggleGroup.Item value="fullWidth">
                Full Width
              </ToggleGroup.Item>
            )}
          </ToggleGroup>
        </div>
      )}

      {/* State Toggle: Disabled */}
      {onDisabledToggle && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>State</span>
          <ToggleGroup
            value={showDisabled ? ['disabled'] : []}
            onValueChange={(values) => {
              const arr = Array.isArray(values) ? values : [values];
              onDisabledToggle(arr.includes('disabled'));
            }}
            toggleMultiple
            size="compact"
            fullWidth
          >
            <ToggleGroup.Item value="disabled">
              Disabled
            </ToggleGroup.Item>
          </ToggleGroup>
        </div>
      )}

      {/* Typography Font Selector */}
      {typographyFontOptions && typographyFontOptions.length > 1 && onTypographyFontChange && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Font family</span>
          <Select
            value={selectedTypographyFont || typographyFontOptions[0]?.value || ''}
            onChange={onTypographyFontChange}
            options={typographyFontOptions}
            size="sm"
          />
        </div>
      )}

      {/* Surface Selection */}
      {previewMode === 'surfaces' && enabledSurfaces && onSurfaceToggle && (
        <div className={styles.surfaceControlsWrapper}>
          <SurfaceSelectionControls
            enabledSurfaces={enabledSurfaces}
            onSurfaceToggle={onSurfaceToggle}
            selectedSurface={selectedSurface}
            onSurfaceSelect={onSurfaceSelect}
          />
        </div>
      )}
    </div>
  );
}

export default PreviewPanel;
