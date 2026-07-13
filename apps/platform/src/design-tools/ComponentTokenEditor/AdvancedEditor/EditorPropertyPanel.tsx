/**
 * EditorPropertyPanel.tsx
 *
 * Figma-style right-side property panel for the Advanced Editor.
 * Uses collapsible sections instead of tabs.
 * Includes header with back button and actions.
 */

'use client';

import React, { useMemo } from 'react';
import { Palette, Move, Square, Type, Timer, Eye, Layers, Minus, ArrowLeft, ArrowRight } from 'lucide-react';

import { Select } from '@oneui/ui-internal/components/Select/Select';
import { ToggleGroup } from '@oneui/ui-internal/components/ToggleGroup/ToggleGroup';
import { CollapsibleSection } from './CollapsibleSection';
import { SurfaceSelectionControls } from './SurfaceSelectionControls';
import { TokenRow } from './TokenRow';
import { ActionsMenu } from './ActionsMenu';
import { CATEGORY_ORDER, CATEGORY_LABELS, deriveSizeLabels, isTwoColumn, defaultCollapsedState } from './constants';
import type { ComponentTokenManifest, TokenCategory } from '@oneui/shared';
import type { SurfaceToken } from '@oneui/shared/engine';
import styles from './EditorPropertyPanel.module.css';

// Category icons for visual identification
const CATEGORY_ICONS: Record<TokenCategory, React.ReactNode> = {
  color: <Palette size={12} />,
  spacing: <Move size={12} />,
  shape: <Square size={12} />,
  typography: <Type size={12} />,
  stroke: <Minus size={12} />,
  elevation: <Layers size={12} />,
  motion: <Timer size={12} />,
  accessibility: <Eye size={12} />,
  decoration: <Layers size={12} />,
  other: <Layers size={12} />,
};

export interface EditorPropertyPanelProps {
  /** Component token manifest */
  manifest: ComponentTokenManifest;
  /** Component name for header */
  componentName: string;
  /** Get resolved token value */
  getResolvedToken: (tokenName: string, manifest: ComponentTokenManifest, options?: { variant?: string; size?: string }) => { value: string; source: 'override' | 'default' };
  /** Callback when token changes */
  onTokenChange: (tokenName: string, selectedToken: string, variant?: string, size?: string) => void;
  /** Callback when token is reset */
  onTokenReset: (tokenName: string, variant?: string) => void;
  /** Platform dimension token overrides for showing resolved pixel values */
  platformTokens?: Record<string, string>;
  /** Current density mode for density-aware pixel value display */
  previewDensity?: string;
  /** Currently selected variant from preview */
  selectedVariant?: string;
  /** Callback when variant changes from panel */
  onVariantChange?: (variant: string) => void;
  /** Currently selected size from preview */
  selectedSize?: string;
  /** Callback when size changes from panel */
  onSizeChange?: (size: string) => void;
  /** Whether to show left icon in preview */
  showLeftIcon?: boolean;
  /** Callback when left icon toggle changes */
  onLeftIconChange?: (show: boolean) => void;
  /** Whether to show right icon in preview */
  showRightIcon?: boolean;
  /** Callback when right icon toggle changes */
  onRightIconChange?: (show: boolean) => void;
  /** Whether to show all variations in preview */
  showAllVariations?: boolean;
  /** Callback when show all variations toggle changes */
  onShowAllVariationsChange?: (show: boolean) => void;
  /** Whether there are unsaved changes (shows sync indicator) */
  isDirty: boolean;
  /** Whether there are any overrides (saved or unsaved) — enables Reset All */
  hasOverrides?: boolean;
  /** Whether auto-save is in progress */
  isSaving?: boolean;
  /** Callback when reset all is clicked */
  onResetAll: () => void;
  /** Callback when export CSS is clicked */
  onExportCSS: () => void;
  /** Whether surface preview is enabled */
  showSurfacePreview?: boolean;
  /** Callback when surface preview toggle changes */
  onShowSurfacePreviewChange?: (show: boolean) => void;
  /** Set of enabled surfaces for preview */
  enabledSurfaces?: Set<SurfaceToken>;
  /** Callback when a surface is toggled */
  onSurfaceToggle?: (surface: SurfaceToken) => void;
  /** Whether to show interaction states in surface preview */
  showInteractionStates?: boolean;
  /** Callback when interaction states toggle changes */
  onShowInteractionStatesChange?: (show: boolean) => void;
  /** Selected accent role */
  selectedAccentRole?: string;
  /** Callback when accent role changes */
  onAccentRoleChange?: (role: string) => void;
  /** Available accent role options */
  accentRoleOptions?: Array<{ value: string; label: string; color?: string }> | null;
  /** Current preview mode */
  previewMode?: 'surfaces' | 'variations' | 'inspector';
  /** Callback when preview mode changes */
  onPreviewModeChange?: (mode: 'surfaces' | 'variations' | 'inspector') => void;
  /** Whether to show condensed variant in preview */
  showCondensed?: boolean;
  /** Callback when condensed toggle changes */
  onShowCondensedChange?: (show: boolean) => void;
  /** Whether to show fullWidth button in preview */
  showFullWidth?: boolean;
  /** Callback when fullWidth toggle changes */
  onShowFullWidthChange?: (show: boolean) => void;
  /** Whether to show disabled state in preview */
  showDisabled?: boolean;
  /** Callback when disabled toggle changes */
  onShowDisabledChange?: (show: boolean) => void;
  /** Selected typography font ('primary', 'secondary', 'script') */
  selectedTypographyFont?: string;
  /** Callback when typography font changes */
  onTypographyFontChange?: (font: string) => void;
  /** Available typography font options */
  typographyFontOptions?: Array<{ value: string; label: string }> | null;
}

/**
 * EditorPropertyPanel Component
 */
export function EditorPropertyPanel({
  manifest,
  componentName,
  getResolvedToken,
  onTokenChange,
  onTokenReset,
  selectedVariant,
  onVariantChange,
  selectedSize,
  onSizeChange,
  showLeftIcon,
  onLeftIconChange,
  showRightIcon,
  onRightIconChange,
  showAllVariations,
  onShowAllVariationsChange,
  isDirty,
  hasOverrides,
  isSaving,
  onResetAll,
  onExportCSS,
  showSurfacePreview,
  onShowSurfacePreviewChange,
  enabledSurfaces,
  onSurfaceToggle,
  showInteractionStates,
  onShowInteractionStatesChange,
  selectedAccentRole,
  onAccentRoleChange,
  accentRoleOptions,
  previewMode,
  onPreviewModeChange,
  showCondensed,
  onShowCondensedChange,
  showFullWidth,
  onShowFullWidthChange,
  showDisabled,
  onShowDisabledChange,
  platformTokens,
  previewDensity,
  selectedTypographyFont,
  onTypographyFontChange,
  typographyFontOptions,
}: EditorPropertyPanelProps) {
  // Derive size labels from the manifest (single source of truth)
  const sizeLabels = useMemo(() => deriveSizeLabels(manifest.tokens), [manifest.tokens]);

  // Group tokens by category
  const groupedTokens = useMemo(() => {
    const groups: Record<TokenCategory, Array<[string, typeof manifest.tokens[string]]>> = {
      color: [],
      spacing: [],
      shape: [],
      stroke: [],
      typography: [],
      elevation: [],
      motion: [],
      accessibility: [],
      decoration: [],
      other: [],
    };

    for (const [name, def] of Object.entries(manifest.tokens)) {
      const category = def.category as TokenCategory;
      if (groups[category]) {
        groups[category].push([name, def]);
      }
    }

    return groups;
  }, [manifest.tokens]);

  return (
    <div className={styles.panel}>
      {/* Panel Header with component name and actions */}
      <div className={styles.panelHeader}>
        <div className={styles.headerTitle}>
          <span className={styles.componentName}>{componentName}</span>
        </div>
        {/* Auto-save status indicator */}
        {isSaving ? (
          <span className={styles.syncStatus} data-status="saving">Saving...</span>
        ) : isDirty ? (
          <span className={styles.syncStatus} data-status="dirty">•</span>
        ) : null}
        <ActionsMenu
          isDirty={isDirty}
          hasOverrides={hasOverrides}
          onResetAll={onResetAll}
          onExportCSS={onExportCSS}
        />
      </div>

      {/* Preview Configuration Section */}
      <React.Fragment>
        <CollapsibleSection
          title="Preview"
          icon={<Eye size={12} />}
          defaultOpen={true}
        >
          {/* Appearance / Accent Role Selector — always visible */}
          {onAccentRoleChange && (
            <div className={styles.previewControlGroup}>
              <span className={styles.previewControlLabel}>Appearance</span>
              <Select
                value={selectedAccentRole || 'primary'}
                onChange={onAccentRoleChange}
                options={accentRoleOptions && accentRoleOptions.length > 0
                  ? accentRoleOptions
                  : [{ value: 'primary', label: 'Primary', color: 'var(--Primary-Bold)' }]}
                size="sm"
              />
            </div>
          )}

          {/* Size Selector */}
          {onSizeChange && (
            <div className={styles.previewControlGroup}>
              <span className={styles.previewControlLabel}>Size</span>
              <ToggleGroup
                value={[selectedSize || 'medium']}
                onValueChange={(values) => {
                  const val = Array.isArray(values) ? values[0] : values;
                  if (val) onSizeChange(val);
                }}
                size="compact"
                fullWidth
              >
                {Object.entries(sizeLabels).map(([value, label]) => (
                  <ToggleGroup.Item key={value} value={value} aria-label={label}>
                    {label}
                  </ToggleGroup.Item>
                ))}
              </ToggleGroup>
            </div>
          )}

          {/* Slot Toggles (Figma: start/end) */}
          {(onLeftIconChange || onRightIconChange) && (
            <div className={styles.previewControlGroup}>
              <span className={styles.previewControlLabel}>Slots</span>
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

          {/* Layout Toggles: Condensed + FullWidth */}
          {(onShowCondensedChange || onShowFullWidthChange) && (
            <div className={styles.previewControlGroup}>
              <span className={styles.previewControlLabel}>Layout</span>
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

          {/* State Toggle: Disabled */}
          {onShowDisabledChange && (
            <div className={styles.previewControlGroup}>
              <span className={styles.previewControlLabel}>State</span>
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

          {/* Surface Selection - only when surfaces mode is active */}
          {previewMode === 'surfaces' && enabledSurfaces && onSurfaceToggle && (
            <div className={styles.surfaceControlsInline}>
              <SurfaceSelectionControls
                enabledSurfaces={enabledSurfaces}
                onSurfaceToggle={onSurfaceToggle}
              />
            </div>
          )}
        </CollapsibleSection>
        <div className={styles.sectionDivider} aria-hidden="true" />
      </React.Fragment>

      {/* Collapsible Sections by Category */}
      <div className={styles.content}>
        {CATEGORY_ORDER.map((category, index) => {
          const tokens = groupedTokens[category];
          if (!tokens || tokens.length === 0) return null;

          const twoColumn = isTwoColumn(category);

          // Check if this is not the first section (for divider)
          const showDivider = index > 0 && CATEGORY_ORDER.slice(0, index).some(c => groupedTokens[c]?.length > 0);

          return (
            <React.Fragment key={category}>
              {showDivider && (
                <div className={styles.sectionDivider} aria-hidden="true" />
              )}
              <CollapsibleSection
                title={CATEGORY_LABELS[category]}
                count={tokens.length}
                icon={CATEGORY_ICONS[category]}
                defaultOpen={defaultCollapsedState(category)}
              >
                {/* Typography font selector within the Typography section */}
                {category === 'typography' && typographyFontOptions && typographyFontOptions.length > 1 && onTypographyFontChange && (
                  <div className={styles.typographyFontInSection}>
                    <div className={styles.previewControlGroup}>
                      <span className={styles.previewControlLabel}>Font family</span>
                      <Select
                        value={selectedTypographyFont || typographyFontOptions[0]?.value || ''}
                        onChange={onTypographyFontChange}
                        options={typographyFontOptions}
                        size="sm"
                      />
                    </div>
                  </div>
                )}
                <div className={twoColumn ? styles.tokenListTwoColumn : styles.tokenList}>
                  {tokens.map(([tokenName, definition]) => (
                    <TokenRow
                      key={tokenName}
                      tokenName={tokenName}
                      definition={definition}
                      manifest={manifest}
                      getResolvedToken={getResolvedToken}
                      onTokenChange={onTokenChange}
                      onTokenReset={onTokenReset}
                      selectedVariant={selectedVariant}
                      selectedSize={selectedSize}
                      onVariantChange={onVariantChange}
                      platformTokens={platformTokens}
                      previewDensity={previewDensity}
                      selectedAppearanceRole={selectedAccentRole}
                    />
                  ))}
                </div>
              </CollapsibleSection>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default EditorPropertyPanel;
