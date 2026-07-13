/**
 * CircularProgressIndicatorPreview.tsx
 *
 * Single-source-of-truth preview for the CircularProgressIndicator, shared by
 * the docs page and the Advanced token editor canvas.
 *
 * Editor integration: the property panel exposes metallic "material fill"
 * options for the `indicatorColor` colour token (e.g. `Material-Metallic-Gold-
 * Fill`). A CSS gradient cannot paint an SVG stroke, so this preview acts as the
 * adapter — it detects a metallic token override and forwards it to the
 * component's `material` prop, which renders a real `<linearGradient>` arc.
 */

'use client';

import React from 'react';
import { CircularProgressIndicator } from './CircularProgressIndicator';
import { Surface } from '../Surface';
import {
  type CircularProgressIndicatorAppearance,
  type CircularProgressIndicatorMaterial,
} from './CircularProgressIndicator.shared';

export interface CircularProgressIndicatorPreviewProps {
  /** CSS custom property overrides to apply to the preview container. */
  tokens?: Record<string, string>;
  /** Appearance role to preview (drives the active arc colour). */
  appearance?: CircularProgressIndicatorAppearance;
  /** When true, shows determinate + indeterminate + labelled variations. */
  showAllVariations?: boolean;
  /** Whether to render in the disabled (dimmed) state. */
  disabled?: boolean;
  /** Explicit metallic material — overrides any detected from `tokens`. */
  material?: CircularProgressIndicatorMaterial;
}

export function CircularProgressIndicatorPreview({
  tokens,
  appearance,
  showAllVariations = false,
  disabled = false,
  material = 'none',
}: CircularProgressIndicatorPreviewProps) {
  // Colour + material reach the arc as solid CSS-variable overrides through
  // `tokens` (e.g. indicatorColor → var(--Material-Metallic-Gold-Base)), so the
  // preview and the live component render identically. The optional `material`
  // prop drives the SVG gradient only for code consumers that opt in directly.
  const wrapperTokens: Record<string, string> = { ...tokens };

  const resolvedAppearance =
    appearance && appearance !== 'auto' ? appearance : undefined;

  const cells: ReadonlyArray<{ key: string; label: string; node: React.ReactNode }> = [
    {
      key: 'determinate',
      label: 'Determinate',
      node: (
        <CircularProgressIndicator
          variant="determinate"
          value={67}
          size="2XL"
          appearance={resolvedAppearance}
          material={material}
          aria-label="Progress 67 percent"
        />
      ),
    },
    {
      key: 'indeterminate',
      label: 'Indeterminate',
      node: (
        <CircularProgressIndicator
          variant="indeterminate"
          size="2XL"
          appearance={resolvedAppearance}
          material={material}
          aria-label="Loading"
        />
      ),
    },
    ...(showAllVariations
      ? [
          {
            key: 'label',
            label: 'With label',
            node: (
              <CircularProgressIndicator
                variant="determinate"
                value={40}
                size="2XL"
                content="text"
                appearance={resolvedAppearance}
                material={material}
                aria-label="Progress 40 percent"
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <div style={{ ...wrapperTokens }} data-draggable="false">
      <Surface
        mode="default"
        appearance="neutral"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--Spacing-8)',
          alignItems: 'center',
          padding: 'var(--Spacing-6)',
          borderRadius: 'var(--Shape-4)',
          opacity: disabled ? 'var(--Disabled-Opacity)' : undefined,
        }}
      >
        {cells.map(({ key, label, node }) => (
          <div
            key={key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--Spacing-3)',
            }}
          >
            {node}
            <span
              style={{
                fontFamily: 'var(--Typography-Font-Primary)',
                fontSize: 'var(--Label-XS-FontSize)',
                lineHeight: 'var(--Label-XS-LineHeight)',
                fontWeight: 'var(--Label-FontWeight-Low)',
                color: 'var(--Text-Low)',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </Surface>
    </div>
  );
}

export default CircularProgressIndicatorPreview;
