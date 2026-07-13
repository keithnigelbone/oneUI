/**
 * InspectCanvasControls.tsx
 *
 * Floating toggle panel for Inspect mode that opens a compact
 * control panel with all preview options + surface background selector.
 * Uses ToggleGroup for all segmented selectors (consistent with foundation pages).
 *
 * Uses a simple positioned div instead of Popover to avoid
 * focus-trap conflicts with Select portals.
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SlidersHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import { ToggleGroup } from '@oneui/ui-internal/components/ToggleGroup/ToggleGroup';
import { ATTENTION_LABELS, SIZE_LABELS } from './constants';
import type { SurfaceToken } from '@oneui/shared/engine';
import styles from './InspectCanvasControls.module.css';

/** Surface mode options for the inspector — canonical tokens except ghost, which is omitted from this UI. */
const SURFACE_OPTIONS: Array<{ value: SurfaceToken; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'bold', label: 'Bold' },
  { value: 'elevated', label: 'Elevated' },
  { value: 'blend', label: 'Blend' },
];

/** Surface compositing material — solid (default) vs transparent/glass over media. */
const SURFACE_MATERIAL_OPTIONS = [
  { value: 'solid', label: 'Solid' },
  { value: 'transparent', label: 'Transparent' },
];

/** Media context behind a transparent surface (drives the rgba composite tint). */
const MEDIA_CONTEXT_OPTIONS = [
  { value: 'dynamic', label: 'Dynamic' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];

export interface InspectCanvasControlsProps {
  /** Currently selected variant (attention level) */
  selectedVariant?: string;
  /** Callback when variant changes */
  onVariantChange?: (variant: string) => void;
  /** Currently selected size */
  selectedSize?: string;
  /** Callback when size changes */
  onSizeChange?: (size: string) => void;
  /** Selected accent role */
  selectedAccentRole?: string;
  /** Callback when accent role changes */
  onAccentRoleChange?: (role: string) => void;
  /** Available accent role options */
  accentRoleOptions?: Array<{ value: string; label: string; color?: string }> | null;
  /** Selected metallic material for the active state (e.g. CPI arc) */
  selectedMaterial?: string;
  /** Callback when material changes — when provided, the Material control renders */
  onMaterialChange?: (material: string) => void;
  /** Available material options (None + active metals) */
  materialOptions?: Array<{ value: string; label: string; color?: string }> | null;
  /** Surface compositing mode (solid vs transparent/glass) for the whole preview. */
  previewSurfaceMaterial?: 'solid' | 'transparent';
  /** Callback when surface material changes — when provided, the control renders. */
  onPreviewSurfaceMaterialChange?: (material: 'solid' | 'transparent') => void;
  /** Media context for transparent compositing (shown only when transparent). */
  previewMediaContext?: 'dynamic' | 'dark' | 'light';
  /** Callback when media context changes. */
  onPreviewMediaContextChange?: (context: 'dynamic' | 'dark' | 'light') => void;
  /** Whether to show left icon */
  showLeftIcon?: boolean;
  /** Callback when left icon toggle changes */
  onLeftIconChange?: (show: boolean) => void;
  /** Whether to show right icon */
  showRightIcon?: boolean;
  /** Callback when right icon toggle changes */
  onRightIconChange?: (show: boolean) => void;
  /** Whether to show condensed layout */
  showCondensed?: boolean;
  /** Callback when condensed toggle changes */
  onShowCondensedChange?: (show: boolean) => void;
  /** Whether to show full width */
  showFullWidth?: boolean;
  /** Callback when full width toggle changes */
  onShowFullWidthChange?: (show: boolean) => void;
  /** Whether button is disabled */
  showDisabled?: boolean;
  /** Callback when disabled toggle changes */
  onShowDisabledChange?: (show: boolean) => void;
  /** Selected inspect surface (V4 mode name) */
  selectedInspectSurface?: SurfaceToken;
  /** Callback when inspect surface changes */
  onInspectSurfaceChange?: (surface: SurfaceToken) => void;
  /** Whether surface selector is available (requires stacking data) */
  hasSurfaceStacking?: boolean;
  /** Override attention labels (component-specific — default: Button's bold/subtle/ghost) */
  attentionLabelOverrides?: Record<string, string>;
  /** Override size labels (component-specific — default: Button's f-step sizes) */
  sizeLabelOverrides?: Record<string, string>;
}

export function InspectCanvasControls({
  selectedVariant,
  onVariantChange,
  selectedSize,
  onSizeChange,
  selectedAccentRole,
  onAccentRoleChange,
  accentRoleOptions,
  selectedMaterial,
  onMaterialChange,
  materialOptions,
  previewSurfaceMaterial,
  onPreviewSurfaceMaterialChange,
  previewMediaContext,
  onPreviewMediaContextChange,
  showLeftIcon,
  onLeftIconChange,
  showRightIcon,
  onRightIconChange,
  showCondensed,
  onShowCondensedChange,
  showFullWidth,
  onShowFullWidthChange,
  showDisabled,
  onShowDisabledChange,
  selectedInspectSurface,
  onInspectSurfaceChange,
  hasSurfaceStacking,
  attentionLabelOverrides,
  sizeLabelOverrides,
}: InspectCanvasControlsProps) {
  const effectiveAttentionLabels = attentionLabelOverrides || ATTENTION_LABELS;
  const effectiveSizeLabels = sizeLabelOverrides || SIZE_LABELS;
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close panel when clicking outside (but not when a Select dropdown is open)
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't close if click is inside the panel or trigger
    if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
    // Don't close if a Select listbox popup is currently in the DOM
    // (click was on the Select's backdrop/positioner which is portaled outside)
    if (document.querySelector('[role="listbox"]')) return;
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen, handleClickOutside]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        data-active={isOpen || undefined}
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Inspector controls"
        aria-expanded={isOpen}
      >
        <SlidersHorizontal size={28} />
      </button>
      {isOpen && (
        <div ref={panelRef} className={styles.panel}>
          {/* Surface selector */}
          {hasSurfaceStacking && onInspectSurfaceChange && (
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Surface</span>
              <Select
                value={selectedInspectSurface || 'default'}
                onChange={onInspectSurfaceChange}
                options={SURFACE_OPTIONS}
                size="sm"
                aria-label="Surface background"
              />
            </div>
          )}
          {/* Appearance / Accent Role */}
          {onAccentRoleChange && (
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Appearance</span>
              <Select
                value={selectedAccentRole || 'primary'}
                onChange={onAccentRoleChange}
                options={accentRoleOptions && accentRoleOptions.length > 0
                  ? accentRoleOptions
                  : [{ value: 'primary', label: 'Primary' }]}
                size="sm"
              />
            </div>
          )}

          {/* Material / Metal — repaints the active state with a brand metal */}
          {onMaterialChange && (
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Material</span>
              <Select
                value={selectedMaterial || 'none'}
                onChange={onMaterialChange}
                options={materialOptions && materialOptions.length > 0
                  ? materialOptions
                  : [{ value: 'none', label: 'None' }]}
                size="sm"
                aria-label="Active-state material"
              />
            </div>
          )}

          {/* Surface material (solid vs transparent) — wraps the preview in a
              <Surface material="transparent"> so role tokens composite over media. */}
          {onPreviewSurfaceMaterialChange && (
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Surface material</span>
              <Select
                value={previewSurfaceMaterial || 'solid'}
                onChange={(v) => onPreviewSurfaceMaterialChange(v as 'solid' | 'transparent')}
                options={SURFACE_MATERIAL_OPTIONS}
                size="sm"
                aria-label="Surface compositing material"
              />
            </div>
          )}
          {onPreviewSurfaceMaterialChange
            && previewSurfaceMaterial === 'transparent'
            && onPreviewMediaContextChange && (
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Media context</span>
              <Select
                value={previewMediaContext || 'dynamic'}
                onChange={(v) => onPreviewMediaContextChange(v as 'dynamic' | 'dark' | 'light')}
                options={MEDIA_CONTEXT_OPTIONS}
                size="sm"
                aria-label="Transparent media context"
              />
            </div>
          )}

          {/* Attention (variant) */}
          {onVariantChange && (
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Attention</span>
              <ToggleGroup
                value={[selectedVariant || 'bold']}
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
                {Object.entries(effectiveAttentionLabels).map(([variant, label]) => (
                  <ToggleGroup.Item key={variant} value={variant} aria-label={label}>
                    {label}
                  </ToggleGroup.Item>
                ))}
              </ToggleGroup>
            </div>
          )}

          {/* Size */}
          {onSizeChange && (
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Size</span>
              <ToggleGroup
                value={[selectedSize || '10']}
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
                {Object.entries(effectiveSizeLabels).map(([value, label]) => (
                  <ToggleGroup.Item key={value} value={value} aria-label={label}>
                    {label}
                  </ToggleGroup.Item>
                ))}
              </ToggleGroup>
            </div>
          )}

          {/* Slots */}
          {(onLeftIconChange || onRightIconChange) && (
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Slots</span>
              <ToggleGroup
                value={[
                  ...(showLeftIcon ? ['left'] : []),
                  ...(showRightIcon ? ['right'] : []),
                ]}
                onValueChange={(values) => {
                  const arr = Array.isArray(values) ? values : [values];
                  onLeftIconChange?.(arr.includes('left'));
                  onRightIconChange?.(arr.includes('right'));
                }}
                toggleMultiple
                size="compact"
                fullWidth
              >
                {onLeftIconChange && (
                  <ToggleGroup.Item value="left" aria-label="Toggle start slot">
                    <ArrowLeft size={14} />
                    <span>Start</span>
                  </ToggleGroup.Item>
                )}
                {onRightIconChange && (
                  <ToggleGroup.Item value="right" aria-label="Toggle end slot">
                    <span>End</span>
                    <ArrowRight size={14} />
                  </ToggleGroup.Item>
                )}
              </ToggleGroup>
            </div>
          )}

          {/* Layout */}
          {(onShowCondensedChange || onShowFullWidthChange) && (
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Layout</span>
              <ToggleGroup
                value={[
                  ...(showCondensed ? ['condensed'] : []),
                  ...(showFullWidth ? ['fullWidth'] : []),
                ]}
                onValueChange={(values) => {
                  const arr = Array.isArray(values) ? values : [values];
                  onShowCondensedChange?.(arr.includes('condensed'));
                  onShowFullWidthChange?.(arr.includes('fullWidth'));
                }}
                toggleMultiple
                size="compact"
                fullWidth
              >
                {onShowCondensedChange && (
                  <ToggleGroup.Item value="condensed">
                    Condensed
                  </ToggleGroup.Item>
                )}
                {onShowFullWidthChange && (
                  <ToggleGroup.Item value="fullWidth">
                    Full Width
                  </ToggleGroup.Item>
                )}
              </ToggleGroup>
            </div>
          )}

          {/* State */}
          {onShowDisabledChange && (
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>State</span>
              <ToggleGroup
                value={showDisabled ? ['disabled'] : []}
                onValueChange={(values) => {
                  const arr = Array.isArray(values) ? values : [values];
                  onShowDisabledChange(arr.includes('disabled'));
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
        </div>
      )}
    </>
  );
}

/**
 * PreviewControlsContent — embeddable content for EditorPanelRouter.
 * Same control groups as InspectCanvasControls, without the trigger/panel wrapper.
 */
export function PreviewControlsContent({
  selectedVariant,
  onVariantChange,
  selectedSize,
  onSizeChange,
  selectedAccentRole,
  onAccentRoleChange,
  accentRoleOptions,
  selectedMaterial,
  onMaterialChange,
  materialOptions,
  previewSurfaceMaterial,
  onPreviewSurfaceMaterialChange,
  previewMediaContext,
  onPreviewMediaContextChange,
  showLeftIcon,
  onLeftIconChange,
  showRightIcon,
  onRightIconChange,
  showCondensed,
  onShowCondensedChange,
  showFullWidth,
  onShowFullWidthChange,
  showDisabled,
  onShowDisabledChange,
  selectedInspectSurface,
  onInspectSurfaceChange,
  hasSurfaceStacking,
  attentionLabelOverrides,
  sizeLabelOverrides,
}: InspectCanvasControlsProps) {
  const effectiveAttentionLabels = attentionLabelOverrides || ATTENTION_LABELS;
  const effectiveSizeLabels = sizeLabelOverrides || SIZE_LABELS;

  return (
    <>
      {hasSurfaceStacking && onInspectSurfaceChange && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Surface</span>
          <Select
            value={selectedInspectSurface || 'default'}
            onChange={onInspectSurfaceChange}
            options={SURFACE_OPTIONS}
            size="sm"
            aria-label="Surface background"
          />
        </div>
      )}
      {onAccentRoleChange && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Appearance</span>
          <Select
            value={selectedAccentRole || 'primary'}
            onChange={onAccentRoleChange}
            options={accentRoleOptions && accentRoleOptions.length > 0
              ? accentRoleOptions
              : [{ value: 'primary', label: 'Primary' }]}
            size="sm"
          />
        </div>
      )}
      {onMaterialChange && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Material</span>
          <Select
            value={selectedMaterial || 'none'}
            onChange={onMaterialChange}
            options={materialOptions && materialOptions.length > 0
              ? materialOptions
              : [{ value: 'none', label: 'None' }]}
            size="sm"
            aria-label="Active-state material"
          />
        </div>
      )}
      {/* Surface material (solid vs transparent) — wraps the preview in a
          <Surface material="transparent"> so role tokens composite over media. */}
      {onPreviewSurfaceMaterialChange && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Surface material</span>
          <Select
            value={previewSurfaceMaterial || 'solid'}
            onChange={(v) => onPreviewSurfaceMaterialChange(v as 'solid' | 'transparent')}
            options={SURFACE_MATERIAL_OPTIONS}
            size="sm"
            aria-label="Surface compositing material"
          />
        </div>
      )}
      {onPreviewSurfaceMaterialChange
        && previewSurfaceMaterial === 'transparent'
        && onPreviewMediaContextChange && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Media context</span>
          <Select
            value={previewMediaContext || 'dynamic'}
            onChange={(v) => onPreviewMediaContextChange(v as 'dynamic' | 'dark' | 'light')}
            options={MEDIA_CONTEXT_OPTIONS}
            size="sm"
            aria-label="Transparent media context"
          />
        </div>
      )}
      {onVariantChange && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Attention</span>
          <ToggleGroup
            value={[selectedVariant || 'bold']}
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
            {Object.entries(effectiveAttentionLabels).map(([variant, label]) => (
              <ToggleGroup.Item key={variant} value={variant} aria-label={label}>
                {label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </div>
      )}
      {onSizeChange && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Size</span>
          <ToggleGroup
            value={[selectedSize || '10']}
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
            {Object.entries(effectiveSizeLabels).map(([value, label]) => (
              <ToggleGroup.Item key={value} value={value} aria-label={label}>
                {label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </div>
      )}
      {(onLeftIconChange || onRightIconChange) && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Slots</span>
          <ToggleGroup
            value={[
              ...(showLeftIcon ? ['left'] : []),
              ...(showRightIcon ? ['right'] : []),
            ]}
            onValueChange={(values) => {
              const arr = Array.isArray(values) ? values : [values];
              onLeftIconChange?.(arr.includes('left'));
              onRightIconChange?.(arr.includes('right'));
            }}
            toggleMultiple
            size="compact"
            fullWidth
          >
            {onLeftIconChange && (
              <ToggleGroup.Item value="left" aria-label="Toggle start slot">
                <ArrowLeft size={14} />
                <span>Start</span>
              </ToggleGroup.Item>
            )}
            {onRightIconChange && (
              <ToggleGroup.Item value="right" aria-label="Toggle end slot">
                <span>End</span>
                <ArrowRight size={14} />
              </ToggleGroup.Item>
            )}
          </ToggleGroup>
        </div>
      )}
      {(onShowCondensedChange || onShowFullWidthChange) && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Layout</span>
          <ToggleGroup
            value={[
              ...(showCondensed ? ['condensed'] : []),
              ...(showFullWidth ? ['fullWidth'] : []),
            ]}
            onValueChange={(values) => {
              const arr = Array.isArray(values) ? values : [values];
              onShowCondensedChange?.(arr.includes('condensed'));
              onShowFullWidthChange?.(arr.includes('fullWidth'));
            }}
            toggleMultiple
            size="compact"
            fullWidth
          >
            {onShowCondensedChange && (
              <ToggleGroup.Item value="condensed">
                Condensed
              </ToggleGroup.Item>
            )}
            {onShowFullWidthChange && (
              <ToggleGroup.Item value="fullWidth">
                Full Width
              </ToggleGroup.Item>
            )}
          </ToggleGroup>
        </div>
      )}
      {onShowDisabledChange && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>State</span>
          <ToggleGroup
            value={showDisabled ? ['disabled'] : []}
            onValueChange={(values) => {
              const arr = Array.isArray(values) ? values : [values];
              onShowDisabledChange(arr.includes('disabled'));
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
    </>
  );
}

export default InspectCanvasControls;
