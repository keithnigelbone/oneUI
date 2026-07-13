/**
 * Spinner.showcase.tsx
 * Reusable showcase cells — shared between Storybook stories and the
 * platform documentation page for zero-duplication.
 */

import React from 'react';
import { Spinner } from './Spinner';
import { Surface } from '../Surface';
import type { SpinnerSize } from './Spinner.shared';

const cellStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--Spacing-3)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  color: 'var(--Text-Low)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--Spacing-6)',
  flexWrap: 'wrap',
};

const SIZES: SpinnerSize[] = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

/** All 10 sizes in a single row. */
export const SpinnerSizes: React.FC = () => (
  <div style={rowStyle}>
    {SIZES.map((size) => (
      <div key={size} style={cellStyle}>
        <Spinner size={size} label={`Loading ${size}`} />
        <span style={labelStyle}>{size}</span>
      </div>
    ))}
  </div>
);

const surfaceBoxStyle: React.CSSProperties = {
  padding: 'var(--Spacing-5)',
  borderRadius: 'var(--Shape-4)',
};

/**
 * Surface-context demo — the same Spinner on each surface mode.
 * Arc colors are role-scoped, so they follow [data-surface] token remapping.
 */
export const SpinnerSurfaceContext: React.FC = () => (
  <div style={{ ...rowStyle, gap: 'var(--Spacing-7)' }}>
    <div style={cellStyle}>
      <Spinner size="XL" />
      <span style={labelStyle}>Default surface</span>
    </div>

    <Surface mode="subtle" style={surfaceBoxStyle}>
      <div style={cellStyle}>
        <Spinner size="XL" />
        <span style={labelStyle}>bg-subtle</span>
      </div>
    </Surface>

    <Surface mode="bold" style={surfaceBoxStyle}>
      <div style={cellStyle}>
        <Spinner size="XL" />
        <span style={{ ...labelStyle, color: 'inherit', opacity: 0.75 }}>
          bg-bold (adapts)
        </span>
      </div>
    </Surface>
  </div>
);
