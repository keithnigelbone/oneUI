/**
 * SurfaceNewPreview.tsx
 *
 * Surfaces foundation preview — shows one appearance role at a time.
 * Sections:
 *  1. Surface Strip — 8 surface fill swatches
 *  2. Token Inspector — content, strokes, states (via ToggleGroup)
 *  3. Nesting Demo — surfaces stacking on each other
 *  4. Component Preview — buttons on each surface context
 */

'use client';

import React, { useMemo, useState } from 'react';
import {
  resolveTokenSet,
  resolveContextTokenSet,
  CONTEXT_SURFACE_TOKENS,
  type ScaleDefinition,
  type ResolvedTokenSet,
  type SurfaceToken,
  type ContentToken,
  type StateToken,
} from '@oneui/shared/engine';
import { getReadableTextColor, hexToRgbTuple } from '@oneui/shared/engine';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { ToggleGroup } from '@oneui/ui-internal/components/ToggleGroup/ToggleGroup';
import { Tabs } from '@oneui/ui/components/Tabs';
import styles from './SurfaceNewPreview.module.css';

// ============================================================================
// Types
// ============================================================================

export interface SurfaceNewPreviewProps {
  roleName: string;
  scaleName: string;
  tokenSet: ResolvedTokenSet;
  scaleDefinition: ScaleDefinition;
  darkMode: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const SURFACE_TOKENS: SurfaceToken[] = ['default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend'];

const SURFACE_LABELS: Record<SurfaceToken, string> = {
  default: 'Default', ghost: 'Ghost', minimal: 'Minimal',
  subtle: 'Subtle', moderate: 'Moderate', bold: 'Bold', elevated: 'Elevated',
  blend: 'Blend',
};

const CONTENT_LABELS: Record<ContentToken, string> = {
  high: 'High', medium: 'Medium', low: 'Low',
  tinted: 'Tinted', tintedA11y: 'Tinted A11y',
  strokeMedium: 'Stroke Medium', strokeLow: 'Stroke Low',
};

const STATE_LABELS: Record<StateToken, string> = {
  hover: 'Hover', pressed: 'Pressed',
  boldHover: 'Bold Hover', boldPressed: 'Bold Pressed',
  subtleHover: 'Subtle Hover', subtlePressed: 'Subtle Pressed',
};

function formatStateLayer(layer: ResolvedTokenSet['stateLayers'][StateToken]): string {
  if (layer.opacity <= 0) return 'transparent';
  if (layer.opacity >= 1) return layer.hex;
  const [r, g, b] = hexToRgbTuple(layer.hex);
  return `rgba(${r}, ${g}, ${b}, ${layer.opacity.toFixed(3).replace(/\.?0+$/, '')})`;
}

/** Content tokens WITHOUT strokes (shown as fill swatches) */
const FILL_CONTENT_TOKENS: ContentToken[] = ['high', 'medium', 'low', 'tinted', 'tintedA11y'];

/** Stroke tokens (shown as border previews) */
const STROKE_TOKENS: ContentToken[] = ['strokeMedium', 'strokeLow'];

const STATE_TOKENS: StateToken[] = ['hover', 'pressed', 'boldHover', 'boldPressed', 'subtleHover', 'subtlePressed'];

type TokenTab = 'content' | 'strokes' | 'states' | 'onSurface';

// ============================================================================
// Section 1: Surface Strip
// ============================================================================

function SurfaceStrip({ tokenSet }: { tokenSet: ResolvedTokenSet }) {
  return (
    <div className={styles.surfaceStepList}>
      {SURFACE_TOKENS.map(token => {
        const surface = tokenSet.surfaces[token];
        const textColor = getReadableTextColor(surface.hex);
        return (
          <div key={token} className={styles.surfaceStepRow}>
            <div
              className={styles.surfaceStepColor}
              style={{ backgroundColor: surface.hex, color: textColor }}
            >
              {surface.step}
            </div>
            <div className={styles.surfaceStepMeta}>
              <span className={styles.swatchName}>{SURFACE_LABELS[token]}</span>
              <span className={styles.swatchHex}>{surface.hex}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Token swatch (reusable, matches surface strip style)
// ============================================================================

function TokenSwatch({ hex, label, meta }: {
  hex: string;
  label: string;
  meta: string;
}) {
  const textColor = getReadableTextColor(hex);
  return (
    <div className={styles.surfaceSwatch}>
      <div
        className={styles.swatchColor}
        style={{ backgroundColor: hex, color: textColor }}
      >
        Aa
      </div>
      <div className={styles.surfaceStepMeta}>
        <span className={styles.swatchName}>{label}</span>
        <span className={styles.swatchHex}>{meta}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Stroke preview (rendered as actual borders)
// ============================================================================

function StrokePreview({ tokenSet, parentHex }: {
  tokenSet: ResolvedTokenSet;
  parentHex: string;
}) {
  return (
    <div className={styles.strokeGrid}>
      {STROKE_TOKENS.map(token => {
        const ct = tokenSet.content[token];
        const label = token === 'strokeMedium' ? 'Medium Stroke' : 'Low Stroke';
        return (
          <div key={token} className={styles.strokeCard}>
            <div
              className={styles.strokePreviewBox}
              style={{
                backgroundColor: parentHex,
                borderColor: ct.blendedHex,
              }}
            >
              <div className={styles.strokeInnerBox} style={{
                borderColor: ct.blendedHex,
                color: getReadableTextColor(parentHex),
              }}>
                Aa
              </div>
            </div>
            <div className={styles.surfaceStepMeta}>
              <span className={styles.swatchName}>{label}</span>
              <span className={styles.swatchHex}>
                {ct.blendedHex}
                {ct.opacity < 1 && ` @ ${Math.round(ct.opacity * 100)}%`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Section 2: Token Inspector (ToggleGroup tabs)
// ============================================================================

function TokenInspector({ tokenSet }: { tokenSet: ResolvedTokenSet }) {
  const [activeTab, setActiveTab] = useState<TokenTab>('content');

  const renderContentGrid = (tokens: Record<ContentToken, { blendedHex: string; step: number; opacity: number }>) => (
    <>
      <div className={styles.surfaceStrip}>
        {FILL_CONTENT_TOKENS.map(token => {
          const ct = tokens[token];
          return (
            <TokenSwatch
              key={token}
              hex={ct.blendedHex}
              label={CONTENT_LABELS[token]}
              meta={`${ct.blendedHex}${ct.opacity < 1 ? ` @ ${Math.round(ct.opacity * 100)}%` : ''}`}
            />
          );
        })}
      </div>
    </>
  );

  return (
    <div className={styles.tokenSection}>
      <div className={styles.tokenTabsRow}>
        <Tabs.Root
          value={activeTab}
          onValueChange={(value) => setActiveTab((value as TokenTab) ?? 'content')}
        >
          <Tabs.List className={styles.tokenTabsList}>
            <Tabs.Item value="content">Content</Tabs.Item>
            <Tabs.Item value="strokes">Strokes</Tabs.Item>
            <Tabs.Item value="states">States</Tabs.Item>
            <Tabs.Item value="onSurface">On Bold / Subtle</Tabs.Item>
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs.Root>
      </div>

      <div className={styles.tokenPanel}>
        {activeTab === 'content' && renderContentGrid(tokenSet.content)}

        {activeTab === 'strokes' && (
          <StrokePreview tokenSet={tokenSet} parentHex={tokenSet.parentHex} />
        )}

        {activeTab === 'states' && (
          <div className={styles.surfaceStrip}>
            {STATE_TOKENS.map(token => {
              const st = tokenSet.states[token];
              return (
                <TokenSwatch
                  key={token}
                  hex={st.hex}
                  label={STATE_LABELS[token]}
                  meta={st.hex}
                />
              );
            })}
          </div>
        )}

        {activeTab === 'onSurface' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
            <div>
              <h4 className={styles.sectionHeader}>On Bold Surface (step {tokenSet.surfaces.bold.step})</h4>
              {renderContentGrid(tokenSet.onBoldContent)}
              <div style={{ marginTop: 'var(--Spacing-3-5)' }}>
                <StrokePreview
                  tokenSet={{ ...tokenSet, content: tokenSet.onBoldContent } as ResolvedTokenSet}
                  parentHex={tokenSet.surfaces.bold.hex}
                />
              </div>
            </div>
            <div>
              <h4 className={styles.sectionHeader}>On Subtle Surface (step {tokenSet.surfaces.subtle.step})</h4>
              {renderContentGrid(tokenSet.onSubtleContent)}
              <div style={{ marginTop: 'var(--Spacing-3-5)' }}>
                <StrokePreview
                  tokenSet={{ ...tokenSet, content: tokenSet.onSubtleContent } as ResolvedTokenSet}
                  parentHex={tokenSet.surfaces.subtle.hex}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Section 3: Nesting Demo (surface modes stacking)
// ============================================================================

function NestingDemo({ scale, darkMode }: {
  scale: ScaleDefinition;
  darkMode: boolean;
}) {
  const [stacked, setStacked] = useState(false);
  const outerParentStep = darkMode ? 200 : 2500;
  const rootTokenSet = resolveTokenSet(scale, outerParentStep, darkMode);

  // Build context data for all surface modes
  const nestingData = useMemo(() => {
    const surfaces: SurfaceToken[] = ['minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend'];
    return surfaces.map(token => {
      const ctx = resolveContextTokenSet(scale, token, outerParentStep, darkMode);
      return { token, tokenSet: ctx };
    });
  }, [scale, darkMode, outerParentStep]);

  // Build stacked nesting data (each surface nests inside the previous)
  const stackedData = useMemo(() => {
    const surfaces: SurfaceToken[] = ['minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend'];
    let parentStep = outerParentStep;
    return surfaces.map(token => {
      const ctx = resolveContextTokenSet(scale, token, parentStep, darkMode);
      parentStep = ctx.parentStep;
      return { token, tokenSet: ctx };
    });
  }, [scale, darkMode, outerParentStep]);

  return (
    <div>
      <div className={styles.nestingControls}>
        <h4 className={styles.sectionHeader} style={{ margin: 0 }}>Surface Stacking</h4>
        <ToggleGroup
          value={[stacked ? 'stacked' : 'flat']}
          onValueChange={(value) => {
            const values = Array.isArray(value) ? value : [value];
            if (values[0]) setStacked(values[0] === 'stacked');
          }}
          variant="subtool"
          size="small"
        >
          <ToggleGroup.Item value="flat">Flat</ToggleGroup.Item>
          <ToggleGroup.Item value="stacked">Stacked</ToggleGroup.Item>
        </ToggleGroup>
      </div>

      {!stacked ? (
        /* Flat mode: each surface as a separate row */
        <div className={styles.nestingContainer} style={{ backgroundColor: rootTokenSet.surfaces.default.hex }}>
          <div className={styles.nestingLabel} style={{ color: rootTokenSet.content.high.blendedHex }}>
            Page (Default)
            <span className={styles.nestingMeta}>step {outerParentStep}</span>
          </div>
          {nestingData.map(({ token, tokenSet: ctx }) => (
            <div
              key={token}
              className={styles.nestingLevel}
              style={{ backgroundColor: ctx.parentHex }}
            >
              <div className={styles.nestingLabel} style={{ color: ctx.content.high.blendedHex }}>
                {SURFACE_LABELS[token]}
                <span className={styles.nestingMeta}>step {ctx.parentStep}</span>
              </div>
              <div className={styles.nestingText} style={{ color: ctx.content.medium.blendedHex }}>
                Medium text on {SURFACE_LABELS[token].toLowerCase()} surface
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Stacked mode: surfaces nested inside each other */
        <div className={styles.stackedNesting} style={{ backgroundColor: rootTokenSet.surfaces.default.hex }}>
          <div className={styles.nestingLabel} style={{ color: rootTokenSet.content.high.blendedHex }}>
            Page (Default)
            <span className={styles.nestingMeta}>step {outerParentStep}</span>
          </div>
          {stackedData.reduceRight<React.ReactElement>(
            (inner, { token, tokenSet: ctx }) => (
              <div
                className={styles.nestingLevel}
                style={{ backgroundColor: ctx.parentHex }}
              >
                <div className={styles.nestingLabel} style={{ color: ctx.content.high.blendedHex }}>
                  {SURFACE_LABELS[token]}
                  <span className={styles.nestingMeta}>step {ctx.parentStep}</span>
                </div>
                <div className={styles.nestingText} style={{ color: ctx.content.medium.blendedHex }}>
                  Medium text adapts automatically
                </div>
                {inner}
              </div>
            ),
            <React.Fragment key="leaf" />,
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Section 4: Component Preview
// ============================================================================

function ComponentPreview({ scale, darkMode }: {
  scale: ScaleDefinition;
  darkMode: boolean;
}) {
    const outerParentStep = darkMode ? 200 : 2500;

  const buildInlineVars = (ts: ResolvedTokenSet): Record<string, string> => ({
    '--Primary-Bold': ts.surfaces.bold.hex,
    '--Primary-Subtle': ts.surfaces.subtle.hex,
    '--Primary-Minimal': ts.surfaces.minimal.hex,
    '--Primary-Default': ts.surfaces.default.hex,
    '--Primary-High': ts.content.high.blendedHex,
    '--Primary-TintedA11y': ts.content.tintedA11y.blendedHex,
    '--Primary-Tinted': ts.content.tinted.blendedHex,
    '--Primary-Stroke-Low': ts.content.strokeLow.blendedHex,
    '--Primary-Bold-High': ts.onBoldContent.high.blendedHex,
    '--Primary-Bold-TintedA11y': ts.onBoldContent.tintedA11y.blendedHex,
    '--Primary-Hover': ts.states.hover.hex,
    '--Primary-Pressed': ts.states.pressed.hex,
    '--Primary-Bold-Hover': ts.states.boldHover.hex,
    '--Primary-Bold-Pressed': ts.states.boldPressed.hex,
    '--Primary-Subtle-Hover': ts.states.subtleHover.hex,
    '--Primary-Subtle-Pressed': ts.states.subtlePressed.hex,
    '--Primary-Hover-Layer': formatStateLayer(ts.stateLayers.hover),
    '--Primary-Pressed-Layer': formatStateLayer(ts.stateLayers.pressed),
    '--Primary-Bold-Hover-Layer': formatStateLayer(ts.stateLayers.boldHover),
    '--Primary-Bold-Pressed-Layer': formatStateLayer(ts.stateLayers.boldPressed),
    '--Primary-Subtle-Hover-Layer': formatStateLayer(ts.stateLayers.subtleHover),
    '--Primary-Subtle-Pressed-Layer': formatStateLayer(ts.stateLayers.subtlePressed),
    '--Surface-Bold-Hover-Layer': formatStateLayer(ts.stateLayers.boldHover),
    '--Surface-Bold-Pressed-Layer': formatStateLayer(ts.stateLayers.boldPressed),
    '--Surface-Subtle-Hover-Layer': formatStateLayer(ts.stateLayers.subtleHover),
    '--Surface-Subtle-Pressed-Layer': formatStateLayer(ts.stateLayers.subtlePressed),
    '--Surface-Minimal-Hover-Layer': formatStateLayer(ts.stateLayers.hover),
    '--Surface-Minimal-Pressed-Layer': formatStateLayer(ts.stateLayers.pressed),
    '--Surface-Bold': ts.surfaces.bold.hex,
    '--Surface-Subtle': ts.surfaces.subtle.hex,
    '--Text-High': ts.content.high.blendedHex,
    '--Text-OnBold-High': ts.onBoldContent.high.blendedHex,
  });

  const contextPreviews = useMemo(() => {
    const root = resolveTokenSet(scale, outerParentStep, darkMode);
    const previews: Array<{ label: string; ts: ResolvedTokenSet }> = [
      { label: 'Default', ts: root },
    ];
    for (const token of ['subtle', 'bold', 'elevated'] as SurfaceToken[]) {
      const ctx = resolveContextTokenSet(scale, token, outerParentStep, darkMode);
      previews.push({ label: SURFACE_LABELS[token], ts: ctx });
    }
    return previews;
  }, [scale, darkMode, outerParentStep]);

  return (
    <div className={styles.componentRow}>
      {contextPreviews.map(({ label, ts }) => (
        <div
          key={label}
          className={styles.componentPreview}
          style={{
            backgroundColor: ts.parentHex,
            ...buildInlineVars(ts) as React.CSSProperties,
          }}
        >
          <div className={styles.componentLabel} style={{ color: ts.content.high.blendedHex }}>
            {label}
          </div>
          <div className={styles.componentButtons}>
            <Button attention="high" size="small">Bold</Button>
            <Button attention="medium" size="small">Subtle</Button>
            <Button attention="low" size="small">Ghost</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Export
// ============================================================================

export function SurfaceNewPreview({
  roleName,
  scaleName,
  tokenSet,
  scaleDefinition,
  darkMode,
}: SurfaceNewPreviewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      <SurfaceStrip tokenSet={tokenSet} />
      <TokenInspector tokenSet={tokenSet} />
      <NestingDemo scale={scaleDefinition} darkMode={darkMode} />
      <ComponentPreview scale={scaleDefinition} darkMode={darkMode} />
    </div>
  );
}
