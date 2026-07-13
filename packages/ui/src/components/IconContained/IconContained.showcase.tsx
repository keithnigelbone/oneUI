/**
 * IconContained.showcase.tsx
 *
 * Shared variant display components for IconContained.
 * Imported by both Storybook stories and the platform documentation page —
 * keeping them in sync with a single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

import React from 'react';
import { IconContained } from './IconContained';
import type { IconContainedSize } from './IconContained.shared';

// ─── Shared layout helpers ────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-XS)',
  fontWeight: 'var(--Typography-Weight-Medium)',
  color: 'var(--Text-Low)',
};

const labeledItem: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--Spacing-3)',
};

const SIZES: IconContainedSize[] = ['xs', 's', 'm', 'l', 'xl'];

const SIZE_LABELS: Record<string, string> = {
  xs: 'XS',
  s: 'S',
  m: 'M',
  l: 'L',
  xl: 'XL',
};

// ─── Exported showcase components ─────────────────────────────────────────────

/**
 * High (solid bold fill) and Medium (subtle tinted fill) attention levels.
 */
export function IconContainedAttentionLevels() {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', alignItems: 'center' }}>
      {(['high', 'medium'] as const).map((attention) => (
        <div key={attention} style={labeledItem}>
          <IconContained icon="heart" attention={attention} aria-label={attention} />
          <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-2XS)', textTransform: 'capitalize' }}>{attention}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * All 5 size presets (XS–XL) at both attention levels in a table layout.
 */
export function IconContainedSizes() {
  return (
    <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4) var(--Spacing-3-5)', width: '100%' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'start', color: 'var(--Text-Medium)', fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)', paddingBottom: 'var(--Spacing-3)' }}>Attention</th>
          {SIZES.map((size) => (
            <th key={size} style={{ textAlign: 'center', color: 'var(--Text-Medium)', fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)', paddingBottom: 'var(--Spacing-3)' }}>
              {SIZE_LABELS[size]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(['high', 'medium'] as const).map((attention) => (
          <tr key={attention}>
            <td style={{ color: 'var(--Text-High)', fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)', textTransform: 'capitalize' }}>
              {attention}
            </td>
            {SIZES.map((size) => (
              <td key={size} style={{ textAlign: 'center' }}>
                <IconContained icon="home" attention={attention} size={size} aria-label={`${attention} ${SIZE_LABELS[size]}`} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Enabled and disabled states at both attention levels.
 */
export function IconContainedStates() {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'center' }}>
      <div style={labeledItem}>
        <IconContained icon="home" attention="high" size="m" aria-label="High enabled" />
        <span style={labelStyle}>High</span>
      </div>
      <div style={labeledItem}>
        <IconContained icon="home" attention="high" size="m" disabled aria-label="High disabled" />
        <span style={labelStyle}>High Disabled</span>
      </div>
      <div style={labeledItem}>
        <IconContained icon="home" attention="medium" size="m" aria-label="Medium enabled" />
        <span style={labelStyle}>Medium</span>
      </div>
      <div style={labeledItem}>
        <IconContained icon="home" attention="medium" size="m" disabled aria-label="Medium disabled" />
        <span style={labelStyle}>Medium Disabled</span>
      </div>
    </div>
  );
}

/**
 * Multiple semantic icons at both attention levels.
 */
export function IconContainedWithIcons() {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', alignItems: 'center' }}>
      <IconContained icon="heart" aria-label="Heart" />
      <IconContained icon="check" aria-label="Check" />
      <IconContained icon="star" aria-label="Star" />
      <IconContained icon="heart" attention="medium" aria-label="Heart medium" />
      <IconContained icon="check" attention="medium" aria-label="Check medium" />
      <IconContained icon="star" attention="medium" aria-label="Star medium" />
    </div>
  );
}
