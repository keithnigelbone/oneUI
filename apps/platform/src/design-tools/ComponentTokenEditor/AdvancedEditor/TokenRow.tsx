/**
 * TokenRow.tsx
 *
 * A single token editing row with label, dropdown selector,
 * reset button, pixel value badge, and override indicator.
 *
 * Size-aware SPACING tokens render a per-size cell grid (all sizes visible at
 * once) instead of a single select — editing a cell writes a per-size override
 * so the component's size ramp can never be flattened by accident.
 */

'use client';

import React, { useMemo } from 'react';
import { Lock, RotateCcw } from 'lucide-react';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import { Tooltip } from '@oneui/ui-internal/components/Tooltip';
import {
  getAvailableTokensForDefinition,
  getComponentThemeFamiliesForComponent,
  resolveComponentThemeToOverrides,
} from '@oneui/shared';
import type { ComponentTokenManifest, TokenCategory, TokenDefinition, TokenState } from '@oneui/shared';
import { useComponentTokenEditor, generateTokenOptionsFromFoundation } from '../ComponentTokenEditorContext';
import { resolveTokenPixelValue } from './tokenValueResolvers';
import { capitalize } from './constants';
import styles from './TokenRow.module.css';

/** F-step and t-shirt size keys → short display labels for the cell grid. */
const SIZE_CELL_LABELS: Record<string, string> = {
  '6': 'xs',
  '8': 's',
  '10': 'm',
  '12': 'l',
};

type TokenValueSource = 'manual' | 'recipe' | 'theme' | 'default';

const SOURCE_LABELS: Record<TokenValueSource, string> = {
  manual: 'Custom',
  recipe: 'Recipe',
  theme: 'Global theme',
  default: 'Default',
};

export interface TokenRowProps {
  tokenName: string;
  definition: TokenDefinition;
  manifest: ComponentTokenManifest;
  getResolvedToken: (tokenName: string, manifest: ComponentTokenManifest, options?: { variant?: string; state?: TokenState; size?: string }) => { value: string; source: 'override' | 'default' };
  onTokenChange: (tokenName: string, selectedToken: string, variant?: string, size?: string) => void;
  onTokenReset: (tokenName: string, variant?: string) => void;
  /** Currently selected variant from preview */
  selectedVariant?: string;
  /** Currently selected size from preview */
  selectedSize?: string;
  /** Callback when variant changes */
  onVariantChange?: (variant: string) => void;
  /** Platform dimension token overrides for showing resolved pixel values */
  platformTokens?: Record<string, string>;
  /** Current density mode for density-aware pixel value display */
  previewDensity?: string;
  /** V4 appearance role for role-aware color token generation */
  selectedAppearanceRole?: string;
  /** When true, token requires a scope selection (variant/size) before editing */
  scopeLocked?: boolean;
  /** Message explaining why the token is scope-locked */
  scopeLockMessage?: string;
  /** V4 role surface CSS vars for resolving color swatches (key → computed value) */
  colorVars?: Record<string, string>;
}

export function TokenRow({
  tokenName,
  definition,
  manifest,
  getResolvedToken,
  onTokenChange,
  onTokenReset,
  selectedVariant: externalSelectedVariant,
  selectedSize: externalSelectedSize,
  onVariantChange,
  platformTokens,
  previewDensity,
  selectedAppearanceRole,
  scopeLocked = false,
  scopeLockMessage,
  colorVars,
}: TokenRowProps) {
  // Get foundation data from context for dynamic token options
  const { foundationData, draftOverrides, recipeOwnedKeys, componentThemeSelections } =
    useComponentTokenEditor();

  const hasVariants = definition.variants && Object.keys(definition.variants).length > 0;
  const hasSizes = definition.sizes && Object.keys(definition.sizes).length > 0;
  // Use external variant if provided; 'all' means global (no variant/size scoping)
  const effectiveVariant = hasVariants ? (externalSelectedVariant && externalSelectedVariant !== 'all' ? externalSelectedVariant : null) : null;
  const effectiveSize = hasSizes ? (externalSelectedSize && externalSelectedSize !== 'all' ? externalSelectedSize : null) : null;
  const isLocked = definition.locked === true;

  // Spacing tokens with sizes edit per-size (all cells visible at once); one
  // value fanned to every size flattens the ramp, so that gesture is retired.
  const perSizeSpacing = hasSizes && definition.category === 'spacing' && !isLocked && !hasVariants;

  // Check token category for color swatches
  const isColorToken = definition.category === 'color';

  // Token keys owned by the Global Component Theme for this component (used
  // for provenance badges).
  const themeOwnedKeys = useMemo(() => {
    const componentName = manifest.componentName;
    const keys = new Set<string>();
    for (const family of getComponentThemeFamiliesForComponent(componentName)) {
      const selections = componentThemeSelections[family.id];
      if (!selections) continue;
      for (const override of resolveComponentThemeToOverrides(family, selections)) {
        if (override.componentName === componentName) keys.add(override.tokenName);
      }
    }
    return keys;
  }, [manifest.componentName, componentThemeSelections]);

  const getValueSource = React.useCallback(
    (key: string): TokenValueSource => {
      if (draftOverrides.has(key)) {
        return recipeOwnedKeys.has(key) ? 'recipe' : 'manual';
      }
      if (themeOwnedKeys.has(key)) return 'theme';
      return 'default';
    },
    [draftOverrides, recipeOwnedKeys, themeOwnedKeys]
  );

  // Get available tokens for selection - prefer dynamic tokens from foundation
  const tokenOptions = useMemo(() => {
    // Try to get dynamic tokens from foundation data
    // Pass tokenName + appearance role for V4-aware generation
    const dynamicTokens = generateTokenOptionsFromFoundation(
      foundationData, definition.category, tokenName, selectedAppearanceRole
    );

    // Use dynamic tokens if available, otherwise fall back to static tokens
    const availableTokens = dynamicTokens.length > 0
      ? dynamicTokens
      : getAvailableTokensForDefinition(definition);

    return availableTokens.map((opt) => {
      // Resolve pixel value for non-color tokens (density-aware)
      const pxValue = resolveTokenPixelValue(opt.token, definition.category, platformTokens, previewDensity);
      // For color tokens, resolve actual computed value from colorVars (V4 tokens aren't in global CSS)
      // Only show swatch when we have a resolved value — unresolved var() strings won't render
      // in the panel context (outside the canvas where inline styles define V4 tokens)
      let swatchColor: string | undefined;
      if (isColorToken) {
        swatchColor = colorVars?.[`--${opt.token}`];
      }
      return {
        value: opt.token,
        label: pxValue ? `${opt.label} (${pxValue})` : opt.label,
        color: swatchColor,
      };
    });
  }, [definition, isColorToken, foundationData, tokenName, platformTokens, previewDensity, selectedAppearanceRole, colorVars]);

  // Get resolved value for current context
  const resolveOptions: { variant?: string; size?: string } = {};
  if (effectiveVariant) resolveOptions.variant = effectiveVariant;
  if (effectiveSize) resolveOptions.size = effectiveSize;
  const resolved = getResolvedToken(tokenName, manifest, Object.keys(resolveOptions).length > 0 ? resolveOptions : undefined);
  const isOverridden = resolved.source === 'override';

  const rowSource = useMemo<TokenValueSource>(() => {
    const keys = perSizeSpacing
      ? [tokenName, ...Object.keys(definition.sizes ?? {}).map((size) => `${tokenName}.${size}`)]
      : [
          tokenName,
          ...(effectiveVariant || effectiveSize
            ? [
                `${tokenName}.${[effectiveVariant, effectiveSize]
                  .filter(Boolean)
                  .join('.')}`,
              ]
            : []),
        ];
    const priority: TokenValueSource[] = ['manual', 'recipe', 'theme'];
    for (const source of priority) {
      if (keys.some((key) => getValueSource(key) === source)) return source;
    }
    return 'default';
  }, [perSizeSpacing, tokenName, definition.sizes, effectiveVariant, effectiveSize, getValueSource]);

  const handleVariantClick = (variant: string) => {
    // Call external handler if provided
    if (onVariantChange) {
      onVariantChange(variant);
    }
  };
  void handleVariantClick;

  const handleChange = (value: string) => {
    onTokenChange(tokenName, value, effectiveVariant || undefined, effectiveSize || undefined);
  };

  const handleReset = () => {
    onTokenReset(tokenName, effectiveVariant || undefined);
  };

  const getCurrentDefault = () => {
    if (effectiveVariant && definition.variants?.[effectiveVariant]) {
      return definition.variants[effectiveVariant];
    }
    return definition.defaultToken;
  };

  const rowHasOverride = isOverridden || rowSource === 'manual' || rowSource === 'recipe';

  return (
    <div
      className={styles.tokenRow}
      data-locked={isLocked}
      data-overridden={rowHasOverride}
      data-scope-locked={scopeLocked || undefined}
    >
      {/* Header */}
      <div className={styles.tokenHeader}>
        <span className={styles.tokenName}>
          {isLocked && <Lock size={10} className={styles.lockIcon} />}
          {capitalize(tokenName)}
          {rowHasOverride && <span className={styles.overrideDot} aria-label="Has override" />}
        </span>
        <span className={styles.sourceBadge} data-source={rowSource}>
          {SOURCE_LABELS[rowSource]}
        </span>
        {rowHasOverride && !isLocked && (
          <button
            className={styles.resetButton}
            onClick={handleReset}
            aria-label={`Reset ${tokenName} to default`}
            title="Reset to default"
          >
            <RotateCcw size={10} />
          </button>
        )}
      </div>

      {/* Description */}
      {definition.description && (
        <p className={styles.tokenDescription}>{definition.description}</p>
      )}

      {/* Lock Reason */}
      {isLocked && definition.lockReason && (
        <p className={styles.lockReason}>{definition.lockReason}</p>
      )}

      {/* Token Selector */}
      {perSizeSpacing ? (
        <div className={styles.sizeCells} onClick={(e) => e.stopPropagation()}>
          {Object.keys(definition.sizes!).map((size) => {
            const cellResolved = getResolvedToken(tokenName, manifest, { size });
            const cellSource = getValueSource(`${tokenName}.${size}`);
            return (
              <div key={size} className={styles.sizeCell} data-source={cellSource}>
                <span className={styles.sizeCellLabel}>{SIZE_CELL_LABELS[size] ?? size}</span>
                <Select
                  value={cellResolved.value}
                  onChange={(value) => onTokenChange(tokenName, value, undefined, size)}
                  options={tokenOptions}
                  size="sm"
                  className={styles.tokenSelect}
                  aria-label={`${tokenName} for size ${SIZE_CELL_LABELS[size] ?? size}`}
                />
              </div>
            );
          })}
        </div>
      ) : !isLocked ? (
        <div className={styles.tokenControls} onClick={(e) => e.stopPropagation()}>
          {scopeLocked && scopeLockMessage ? (
            <Tooltip content={scopeLockMessage} position="top" sideOffset={6} maxWidth={220}>
              <div className={styles.tokenSelectWrapper}>
                <Select
                  value={resolved.value}
                  onChange={handleChange}
                  options={tokenOptions}
                  disabled
                  size="sm"
                  className={styles.tokenSelect}
                  aria-label={`Select value for ${tokenName}${effectiveVariant ? ` (${effectiveVariant})` : ''}`}
                />
              </div>
            </Tooltip>
          ) : (
            <Select
              value={resolved.value}
              onChange={handleChange}
              options={tokenOptions}
              disabled={isLocked || scopeLocked}
              size="sm"
              className={styles.tokenSelect}
              aria-label={`Select value for ${tokenName}${effectiveVariant ? ` (${effectiveVariant})` : ''}`}
            />
          )}
        </div>
      ) : (
        <div className={styles.tokenControls}>
          <div className={styles.lockedValue}>
            {getCurrentDefault()} (locked)
          </div>
        </div>
      )}
    </div>
  );
}

export default TokenRow;
