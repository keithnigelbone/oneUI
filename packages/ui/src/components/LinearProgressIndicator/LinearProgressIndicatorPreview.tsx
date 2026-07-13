'use client';

import React from 'react';
import { LinearProgressIndicator } from './LinearProgressIndicator';
import { Surface } from '../Surface';
import type { LinearProgressIndicatorAppearance } from './LinearProgressIndicator.shared';

export interface LinearProgressIndicatorPreviewProps {
  tokens?: Record<string, string>;
  appearance?: LinearProgressIndicatorAppearance;
  showAllVariations?: boolean;
}

export function LinearProgressIndicatorPreview({
  tokens,
  appearance = 'primary',
  showAllVariations = false,
}: LinearProgressIndicatorPreviewProps) {
  const wrapperStyle = tokens ? ({ ...tokens } as React.CSSProperties) : undefined;

  if (!showAllVariations) {
    return (
      <div style={{ width: 'var(--Spacing-40)', ...wrapperStyle }}>
        <LinearProgressIndicator
          type="determinate"
          value={60}
          appearance={appearance}
          aria-label="Task progress"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4)',
        width: 'var(--Spacing-40)',
        ...wrapperStyle,
      }}
    >
      <LinearProgressIndicator value={40} appearance={appearance} aria-label="Determinate" />
      <LinearProgressIndicator type="indeterminate" appearance={appearance} aria-label="Loading" />
      <Surface mode="subtle">
        <LinearProgressIndicator value={70} appearance={appearance} aria-label="On subtle surface" />
      </Surface>
    </div>
  );
}
