/**
 * PropertyPanel.tsx
 *
 * Main panel for the Component Token Editor.
 * Contains brand selector, category tabs, token list, preview, and actions.
 * Supports variant-specific token editing (bold/subtle/ghost).
 * Uses Base UI components for all interactive elements.
 */

'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { X, RotateCcw, Download, Save, Lock } from 'lucide-react';
import { useComponentTokenEditor } from '../ComponentTokenEditorContext';
import { generateBrandCSS, overridesToArray } from '../utils/cssExporter';
import { getAvailableTokensForDefinition } from '@oneui/shared';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { ToggleGroup } from '@oneui/ui-internal/components/ToggleGroup/ToggleGroup';
import type { ComponentTokenManifest, TokenCategory, TokenDefinition } from '@oneui/shared';
import type { PropertyPanelProps, CategoryTab } from '../types';
import styles from './PropertyPanel.module.css';

// Brand options - in production these would come from Convex
const BRAND_OPTIONS = [
  { value: '', label: 'Select brand...' },
  { value: 'jio-default', label: 'Jio Default' },
  { value: 'jiocinema', label: 'JioCinema' },
  { value: 'jiomart', label: 'JioMart' },
  { value: 'jiohotstar', label: 'JioHotstar' },
];

// Variant labels for display
const VARIANT_LABELS: Record<string, string> = {
  bold: 'Bold (High)',
  subtle: 'Subtle (Medium)',
  ghost: 'Ghost (Low)',
};

/**
 * Token Row with Variant Support
 */
interface TokenRowProps {
  tokenName: string;
  definition: TokenDefinition;
  manifest: ComponentTokenManifest;
  componentName: string;
  onTokenChange: (tokenName: string, selectedToken: string, variant?: string) => void;
  onTokenReset: (tokenName: string, variant?: string) => void;
  getResolvedToken: (tokenName: string, manifest: ComponentTokenManifest, options?: { variant?: string }) => { value: string; source: 'override' | 'default' };
}

function TokenRow({
  tokenName,
  definition,
  manifest,
  componentName,
  onTokenChange,
  onTokenReset,
  getResolvedToken,
}: TokenRowProps) {
  const hasVariants = definition.variants && Object.keys(definition.variants).length > 0;
  const [selectedVariant, setSelectedVariant] = useState<string | null>(hasVariants ? 'bold' : null);
  const isLocked = definition.locked === true;

  // Get available tokens for selection
  const tokenOptions = useMemo(() => {
    const availableTokens = getAvailableTokensForDefinition(definition);
    return availableTokens.map((opt) => ({
      value: opt.token,
      label: opt.label,
    }));
  }, [definition]);

  // Get resolved value for current context (with or without variant)
  const resolved = getResolvedToken(tokenName, manifest, selectedVariant ? { variant: selectedVariant } : undefined);
  const isOverridden = resolved.source === 'override';

  // Handle variant tab click
  const handleVariantClick = (variant: string) => {
    setSelectedVariant(variant);
  };

  // Handle token change
  const handleChange = (value: string) => {
    onTokenChange(tokenName, value, selectedVariant || undefined);
  };

  // Handle reset
  const handleReset = () => {
    onTokenReset(tokenName, selectedVariant || undefined);
  };

  // Get the current default for display
  const getCurrentDefault = () => {
    if (selectedVariant && definition.variants?.[selectedVariant]) {
      return definition.variants[selectedVariant];
    }
    return definition.defaultToken;
  };

  return (
    <div
      className={styles.tokenRow}
      data-locked={isLocked}
      data-overridden={isOverridden}
    >
      {/* Header */}
      <div className={styles.tokenHeader}>
        <span className={styles.tokenName}>
          {isLocked && <Lock size={12} className={styles.lockIcon} />}
          {tokenName}
        </span>
        <span className={styles.sourceBadge} data-source={resolved.source}>
          {resolved.source}
        </span>
      </div>

      {/* Description */}
      {definition.description && (
        <p className={styles.tokenDescription}>{definition.description}</p>
      )}

      {/* Lock Reason for locked tokens */}
      {isLocked && definition.lockReason && (
        <p className={styles.lockReason}>{definition.lockReason}</p>
      )}

      {/* Variant Selector (only for tokens with variants) */}
      {hasVariants && !isLocked && (
        <ToggleGroup
          value={[selectedVariant || 'bold']}
          onValueChange={(values) => {
            const val = Array.isArray(values) ? values[0] : values;
            if (val) handleVariantClick(val);
          }}
          size="compact"
          fullWidth
        >
          {Object.keys(definition.variants!).map((variant) => (
            <ToggleGroup.Item key={variant} value={variant}>
              {VARIANT_LABELS[variant] || variant}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      )}

      {/* Token Selector */}
      {!isLocked ? (
        <div className={styles.tokenControls}>
          <Select
            value={resolved.value}
            onChange={handleChange}
            options={tokenOptions}
            disabled={isLocked}
            size="sm"
            className={styles.tokenSelect}
            aria-label={`Select value for ${tokenName}${selectedVariant ? ` (${selectedVariant})` : ''}`}
          />
          <button
            className={styles.resetButton}
            onClick={handleReset}
            disabled={!isOverridden}
            aria-label={`Reset ${tokenName} to default`}
            title="Reset to default"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      ) : (
        <div className={styles.tokenControls}>
          <div
            style={{
              flex: 1,
              padding: 'var(--Spacing-3) var(--Spacing-3-5)',
              backgroundColor: 'var(--Surface-Main)',
              borderRadius: 'var(--Shape-Pill)',
              fontSize: 'var(--Typography-Size-XS)',
              color: 'var(--Text-Medium)',
            }}
          >
            {getCurrentDefault()} (locked)
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * PropertyPanel Component
 *
 * Panel for editing component tokens per brand.
 */
export function PropertyPanel({
  componentName,
  manifest,
  onClose,
  className,
  renderPreview,
}: PropertyPanelProps) {
  const {
    isOpen,
    selectedBrandId,
    selectedCategory,
    selectedMode,
    draftOverrides,
    isDirty,
    isSaving,
    selectBrand,
    selectCategory,
    selectMode,
    setTokenOverride,
    resetTokenOverride,
    resetAllOverrides,
    getResolvedToken,
  } = useComponentTokenEditor();

  // Build category tabs from manifest
  const categoryTabs = useMemo<CategoryTab[]>(() => {
    const categories = manifest.categories || {};
    const total = Object.values(categories).reduce((sum, count) => sum + (count || 0), 0);

    const tabs: CategoryTab[] = [
      { id: 'all', label: 'All', count: total },
    ];

    const categoryOrder: TokenCategory[] = [
      'color',
      'spacing',
      'shape',
      'typography',
      'motion',
      'accessibility',
      'decoration',
    ];

    for (const cat of categoryOrder) {
      const count = categories[cat];
      if (count && count > 0) {
        tabs.push({
          id: cat,
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          count,
        });
      }
    }

    return tabs;
  }, [manifest.categories]);

  // Filter tokens by selected category
  const filteredTokens = useMemo(() => {
    return Object.entries(manifest.tokens).filter(([, def]) => {
      if (selectedCategory === 'all') return true;
      return def.category === selectedCategory;
    });
  }, [manifest.tokens, selectedCategory]);

  // Group tokens by category for display
  const groupedTokens = useMemo(() => {
    const groups: Record<string, Array<[string, typeof manifest.tokens[string]]>> = {};

    for (const [name, def] of filteredTokens) {
      const category = def.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push([name, def]);
    }

    return groups;
  }, [filteredTokens]);

  // Handle brand change
  const handleBrandChange = useCallback(
    (value: string) => {
      if (value) {
        selectBrand(value);
      }
    },
    [selectBrand]
  );

  // Handle token change with optional variant
  const handleTokenChange = useCallback(
    (tokenName: string, selectedToken: string, variant?: string) => {
      setTokenOverride(tokenName, selectedToken, variant ? { variant } : undefined);
    },
    [setTokenOverride]
  );

  // Handle token reset with optional variant
  const handleTokenReset = useCallback(
    (tokenName: string, variant?: string) => {
      // For now, reset the base token - we could extend this to reset variant-specific overrides
      resetTokenOverride(tokenName);
    },
    [resetTokenOverride]
  );

  // Handle export CSS
  const handleExportCSS = useCallback(() => {
    const css = generateBrandCSS({
      brandSlug: selectedBrandId || 'custom',
      componentName,
      overrides: overridesToArray(draftOverrides),
      includeComments: true,
    });

    // Create download
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentName.toLowerCase()}-${selectedBrandId || 'custom'}-overrides.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [componentName, selectedBrandId, draftOverrides]);

  // Handle save (placeholder - will connect to Convex)
  const handleSave = useCallback(async () => {
    // TODO: Implement Convex save mutation
  }, [draftOverrides]);

  // Generate preview styles
  const previewStyles = useMemo(() => {
    const styleObj: Record<string, string> = {};
    for (const [, override] of draftOverrides) {
      styleObj[`--${componentName}-${override.tokenName}`] = `var(--${override.selectedToken})`;
    }
    return styleObj;
  }, [componentName, draftOverrides]);

  return (
    <div
      className={`${styles.panel} ${className || ''}`}
      data-open={isOpen}
      role="dialog"
      aria-label={`${componentName} Token Editor`}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h2 className={styles.title}>{componentName} Tokens</h2>
          <p className={styles.subtitle}>{manifest.totalTokens} customizable tokens</p>
        </div>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close panel"
        >
          <X size={20} />
        </button>
      </div>

      {/* Brand & Mode Selector */}
      <div className={styles.brandModeSection}>
        <div className={styles.brandSelector}>
          <label className={styles.selectorLabel}>Brand</label>
          <Select
            value={selectedBrandId || ''}
            onChange={handleBrandChange}
            options={BRAND_OPTIONS}
            placeholder="Select brand..."
            size="sm"
            className={styles.brandSelect}
            aria-label="Select brand"
          />
        </div>
        <div className={styles.modeSelector}>
          <label className={styles.selectorLabel}>Mode</label>
          <ToggleGroup
            value={[selectedMode]}
            onValueChange={(values) => {
              const val = Array.isArray(values) ? values[0] : values;
              if (val === 'light' || val === 'dark') selectMode(val);
            }}
            size="compact"
          >
            <ToggleGroup.Item value="light">Light</ToggleGroup.Item>
            <ToggleGroup.Item value="dark">Dark</ToggleGroup.Item>
          </ToggleGroup>
        </div>
      </div>

      {/* Preview Section - At top, always visible */}
      <div className={styles.previewSection}>
        <div className={styles.previewTitle}>Live Preview</div>
        <div
          className={styles.previewContainer}
          style={previewStyles}
          data-mode={selectedMode}
        >
          {renderPreview ? (
            renderPreview(previewStyles)
          ) : (
            <span style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
              Preview not available
            </span>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className={styles.categoryTabs} role="tablist">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            className={styles.categoryTab}
            data-active={selectedCategory === tab.id}
            onClick={() => selectCategory(tab.id)}
            role="tab"
            aria-selected={selectedCategory === tab.id}
          >
            {tab.label}
            <span className={styles.categoryCount}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Token List - Scrollable */}
      <div className={styles.content}>
        {Object.entries(groupedTokens).map(([category, tokens]) => (
          <div key={category} className={styles.tokenGroup}>
            {selectedCategory === 'all' && (
              <h3 className={styles.tokenGroupTitle}>{category}</h3>
            )}
            <div className={styles.tokenList}>
              {tokens.map(([tokenName, definition]) => (
                <TokenRow
                  key={tokenName}
                  tokenName={tokenName}
                  definition={definition}
                  manifest={manifest}
                  componentName={componentName}
                  onTokenChange={handleTokenChange}
                  onTokenReset={handleTokenReset}
                  getResolvedToken={getResolvedToken}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Always visible at bottom */}
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          {isDirty && (
            <span className={styles.dirtyIndicator}>
              Unsaved changes
            </span>
          )}
        </div>
        <div className={styles.footerRight}>
          <Button
            attention="low"
            size="s"
            onPress={resetAllOverrides}
            disabled={!isDirty}
            leftIcon={<RotateCcw size={14} />}
          >
            Reset All
          </Button>
          <Button
            attention="medium"
            size="s"
            onPress={handleExportCSS}
            disabled={draftOverrides.size === 0}
            leftIcon={<Download size={14} />}
          >
            Export CSS
          </Button>
          <Button
            attention="high"
            size="s"
            onPress={handleSave}
            disabled={!isDirty || isSaving}
            leftIcon={<Save size={14} />}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
