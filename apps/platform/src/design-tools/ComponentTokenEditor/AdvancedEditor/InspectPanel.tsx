/**
 * InspectPanel.tsx
 *
 * Read-only token inspection panel.
 * Single column. Each row shows the ACTUAL VALUE visually on the left
 * (color swatch, shape preview, stroke line, pixel number)
 * followed by token name + CSS variable.
 */

'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Palette, Move, Square, Type, Timer, Eye, Layers, Minus } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import { CATEGORY_ORDER, CATEGORY_LABELS } from './constants';
import { resolveTokenPixelValue } from './tokenValueResolvers';
import { useComponentTokenEditor } from '../ComponentTokenEditorContext';
import type { ComponentTokenManifest, TokenCategory } from '@oneui/shared';
import styles from './InspectPanel.module.css';

// Category icons for section headers only
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

/** CSS keywords that should be used directly, not wrapped in var() */
const CSS_KEYWORDS = new Set([
  'transparent', 'inherit', 'initial', 'unset', 'currentColor',
  'none', 'auto', 'normal',
]);

function tokenToCSS(value: string): string {
  if (!value) return 'transparent';
  if (CSS_KEYWORDS.has(value)) return value;
  if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('oklch')) return value;
  return `var(--${value})`;
}

export interface InspectPanelProps {
  manifest: ComponentTokenManifest;
  componentName: string;
  platformTokens?: Record<string, string>;
  previewDensity?: string;
  selectedVariant?: string;
  selectedSize?: string;
}

/* ── Visual value previews ─────────────────────────────── */

/** Color swatch — reads computed color to detect transparency */
function ColorPreview({ tokenValue }: { tokenValue: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [computedColor, setComputedColor] = useState<string | null>(null);
  const cssExpr = tokenToCSS(tokenValue);

  useEffect(() => {
    if (!ref.current) return;
    setComputedColor(getComputedStyle(ref.current).backgroundColor);
  }, [cssExpr]);

  const isTransparent = tokenValue === 'transparent' ||
    // INTENTIONAL-LITERAL: rgba(0, 0, 0, 0) is a browser-returned computed style string, not a design value
    computedColor === 'rgba(0, 0, 0, 0)' ||
    computedColor === 'transparent';

  return (
    <span
      ref={ref}
      className={styles.colorSwatch}
      data-transparent={isTransparent || undefined}
      style={{ backgroundColor: cssExpr }}
    />
  );
}

/** Shape preview — a small box with the actual border-radius applied via CSS var */
function ShapePreview({ resolvedValue }: { resolvedValue: string }) {
  if (!resolvedValue.startsWith('Shape-')) return null;
  return (
    <span
      className={styles.shapePreview}
      style={{ borderRadius: `var(--${resolvedValue})` }}
    />
  );
}

/** Stroke preview — a horizontal line with the actual thickness */
function StrokePreview({ pixelValue }: { pixelValue: string | null }) {
  if (!pixelValue) return null;
  return (
    <span
      className={styles.strokePreview}
      style={{ height: pixelValue }}
    />
  );
}

/** Pixel value shown as bold number — for spacing, typography size */
function PixelPreview({ value }: { value: string }) {
  return <span className={styles.pixelPreview}>{value}</span>;
}

/**
 * Decide what visual to show for a token row.
 * Returns null if the value can't be meaningfully visualised.
 */
function ValuePreview({
  category,
  resolvedValue,
  pixelValue,
}: {
  category: TokenCategory;
  resolvedValue: string;
  pixelValue: string | null;
}) {
  switch (category) {
    case 'color':
      return <ColorPreview tokenValue={resolvedValue} />;
    case 'spacing':
      return pixelValue ? <PixelPreview value={pixelValue} /> : null;
    case 'shape':
      return <ShapePreview resolvedValue={resolvedValue} />;
    case 'stroke':
      return <StrokePreview pixelValue={pixelValue} />;
    case 'typography':
      // Only show pixel preview for font-size tokens
      return pixelValue ? <PixelPreview value={pixelValue} /> : null;
    default:
      // motion, elevation, accessibility — no meaningful visual
      return null;
  }
}

/* ── Main component ────────────────────────────────────── */

export function InspectPanel({
  manifest,
  componentName,
  platformTokens,
  previewDensity,
  selectedVariant,
}: InspectPanelProps) {
  const { getResolvedToken } = useComponentTokenEditor();

  const groupedTokens = useMemo(() => {
    const groups: Partial<Record<TokenCategory, Array<[string, typeof manifest.tokens[string]]>>> = {};
    for (const [tokenName, definition] of Object.entries(manifest.tokens)) {
      const cat = definition.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat]!.push([tokenName, definition]);
    }
    return groups;
  }, [manifest.tokens]);

  const cssPrefix = componentName.charAt(0).toUpperCase() + componentName.slice(1);

  return (
    <div className={styles.panel}>
      {CATEGORY_ORDER.map((category, index) => {
        const tokens = groupedTokens[category];
        if (!tokens || tokens.length === 0) return null;

        const showDivider = index > 0 && CATEGORY_ORDER.slice(0, index).some(c => groupedTokens[c]?.length);

        return (
          <React.Fragment key={category}>
            {showDivider && (
              <div className={styles.sectionDivider} aria-hidden="true" />
            )}
            <CollapsibleSection
              title={CATEGORY_LABELS[category]}
              count={tokens.length}
              icon={CATEGORY_ICONS[category]}
              defaultOpen={false}
            >
              <div className={styles.tokenList}>
                {tokens.map(([tokenName, definition]) => {
                  const hasVariants = definition.variants && Object.keys(definition.variants).length > 0;
                  const effectiveVariant = hasVariants ? (selectedVariant || 'bold') : undefined;
                  const resolved = getResolvedToken(
                    tokenName,
                    manifest,
                    effectiveVariant ? { variant: effectiveVariant } : undefined
                  );
                  const resolvedValue = resolved.value || definition.defaultToken;
                  const source = resolved.source;
                  const pixelValue = resolveTokenPixelValue(
                    resolvedValue,
                    category,
                    platformTokens,
                    previewDensity
                  );
                  const cssVarName = `--${cssPrefix}-${tokenName}`;

                  const preview = (
                    <ValuePreview
                      category={category}
                      resolvedValue={resolvedValue}
                      pixelValue={pixelValue}
                    />
                  );

                  return (
                    <div key={tokenName} className={styles.row}>
                      {/* Value preview on the left — the actual value rendered */}
                      {preview && (
                        <div className={styles.valuePreview}>
                          {preview}
                        </div>
                      )}

                      {/* Token info */}
                      <div className={styles.tokenInfo}>
                        <span className={styles.tokenName}>
                          {definition.description ?? tokenName}
                          {source === 'override' && (
                            <span className={styles.overrideDot} aria-label="Override" />
                          )}
                        </span>
                        <span className={styles.tokenValue}>{resolvedValue}</span>
                        <span className={styles.cssVar}>{cssVarName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default InspectPanel;
