/**
 * Divider.showcase.tsx
 *
 * Shared variant display components for Divider.
 * Imported by both Storybook stories and the platform documentation page —
 * keeping them in sync with a single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

import React from 'react';
import { Divider } from './Divider';
import { Icon } from '../Icon/Icon';

// ─── Shared layout helpers ────────────────────────────────────────────────────

const column: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-5)',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  color: 'var(--Text-Medium)',
  fontSize: 'var(--Typography-Size-XS)',
  fontWeight: 'var(--Typography-Weight-Medium)',
};

const labeledRow: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3)',
  width: '100%',
};

// ─── Exported showcase components ─────────────────────────────────────────────

/**
 * Three stroke widths: S (hairline), M (thin), L (medium)
 */
export function DividerSizes() {
  return (
    <div style={column}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <div key={size} style={labeledRow}>
          <span style={{ ...labelStyle, textTransform: 'uppercase' }}>Size {size.toUpperCase()}</span>
          <Divider size={size} />
        </div>
      ))}
    </div>
  );
}

/**
 * High / Medium / Low attention levels
 */
export function DividerAttentionLevels() {
  return (
    <div style={column}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <div key={attention} style={labeledRow}>
          <span style={{ ...labelStyle, textTransform: 'capitalize' }}>{attention}</span>
          <Divider attention={attention} />
        </div>
      ))}
    </div>
  );
}

/**
 * Three attention levels rendered with icon centre content.
 * Shows how the centre Icon's emphasis tracks `attention`
 * (high → high, medium → medium, low → low).
 */
export function DividerAttentionWithIcon() {
  return (
    <div style={column}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <div key={attention} style={labeledRow}>
          <span style={{ ...labelStyle, textTransform: 'capitalize' }}>{attention}</span>
          <Divider attention={attention}>
            <Icon icon="star" aria-hidden />
          </Divider>
        </div>
      ))}
    </div>
  );
}

/**
 * Three attention levels rendered with plain-text centre content.
 * Plain strings are auto-styled as Label XS Medium; their attention
 * tracks the divider's `attention` prop.
 */
export function DividerAttentionWithText() {
  return (
    <div style={column}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <div key={attention} style={labeledRow}>
          <span style={{ ...labelStyle, textTransform: 'capitalize' }}>{attention}</span>
          <Divider attention={attention}>
            Section
          </Divider>
        </div>
      ))}
    </div>
  );
}

/**
 * Icon centre content — start, center, and end alignment
 */
export function DividerWithIcon() {
  return (
    <div style={column}>
      {(['start', 'center', 'end'] as const).map((align) => (
        <div key={align} style={labeledRow}>
          <span style={{ ...labelStyle, textTransform: 'capitalize' }}>{align}</span>
          <Divider contentAlign={align} attention="medium">
            <Icon icon="star" aria-hidden />
          </Divider>
        </div>
      ))}
    </div>
  );
}

/**
 * Text centre content — start, center, and end alignment.
 * Plain string children are auto-wrapped in a Label XS Medium Text.
 */
export function DividerWithLabel() {
  return (
    <div style={column}>
      {(['start', 'center', 'end'] as const).map((align) => (
        <div key={align} style={labeledRow}>
          <span style={{ ...labelStyle, textTransform: 'capitalize' }}>{align}</span>
          <Divider contentAlign={align} attention="medium">
            Section
          </Divider>
        </div>
      ))}
    </div>
  );
}

/**
 * Vertical orientation — inline separation between sibling elements
 */
export function DividerVertical() {
  return (
    <div style={column}>
      {/* Breadcrumb-style inline nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)', height: 'var(--Spacing-7)' }}>
        <span style={{ color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>Home</span>
        <Divider orientation="vertical" />
        <span style={{ color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>Products</span>
        <Divider orientation="vertical" />
        <span style={{ color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>About</span>
        <Divider orientation="vertical" />
        <span style={{ color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>Contact</span>
      </div>
      {/* Section dividers with varying attention */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4-5)', height: 'var(--Spacing-9)' }}>
        <span style={{ color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>Section A</span>
        <Divider orientation="vertical" attention="high" size="l" />
        <span style={{ color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>Section B</span>
        <Divider orientation="vertical" attention="medium" />
        <span style={{ color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>Section C</span>
      </div>
    </div>
  );
}

/**
 * Sharp vs round caps — with and without text content
 */
export function DividerRoundCaps() {
  return (
    <div style={column}>
      <div style={labeledRow}>
        <span style={labelStyle}>Sharp (default)</span>
        <Divider size="l" attention="high" />
      </div>
      <div style={labeledRow}>
        <span style={labelStyle}>Round caps</span>
        <Divider size="l" attention="high" roundCaps />
      </div>
      <div style={labeledRow}>
        <span style={labelStyle}>Round caps with text</span>
        <Divider size="l" attention="high" roundCaps>
          Section
        </Divider>
      </div>
    </div>
  );
}
