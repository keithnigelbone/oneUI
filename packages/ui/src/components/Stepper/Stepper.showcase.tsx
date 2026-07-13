/**
 * Stepper.showcase.tsx
 *
 * Shared variant display components for Stepper.
 * Imported by both Storybook stories and the platform documentation page —
 * keeping them in sync with a single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

import React from 'react';
import { Stepper } from './Stepper';

// ─── Shared layout helpers ────────────────────────────────────────────────────

const row: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--Spacing-5)',
  alignItems: 'center',
};

const column: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4)',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary, inherit)',
  fontSize: 'var(--Body-S-FontSize, var(--Typography-Size-XS))',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium, var(--Typography-Weight-Medium))',
  color: 'var(--Text-Low)',
};

const labeledItem: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--Spacing-3)',
};

// ─── Exported showcase components ─────────────────────────────────────────────

/**
 * S / M / L sizes with usage labels
 */
export function StepperSizes() {
  return (
    <div style={row}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <div key={size} style={labeledItem}>
          <Stepper size={size} defaultValue={5} />
          <span style={labelStyle}>{size.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * High / Medium / Low attention levels
 */
export function StepperAttentionLevels() {
  return (
    <div style={row}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <div key={attention} style={labeledItem}>
          <Stepper attention={attention} defaultValue={5} />
          <span style={labelStyle}>{attention.charAt(0).toUpperCase() + attention.slice(1)}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Default, disabled, read-only, and error states
 */
export function StepperStates() {
  return (
    <div style={row}>
      <div style={labeledItem}>
        <Stepper defaultValue={5} />
        <span style={labelStyle}>Default</span>
      </div>
      <div style={labeledItem}>
        <Stepper defaultValue={5} disabled />
        <span style={labelStyle}>Disabled</span>
      </div>
      <div style={labeledItem}>
        <Stepper defaultValue={5} readOnly />
        <span style={labelStyle}>Read Only</span>
      </div>
      <div style={labeledItem}>
        <Stepper defaultValue={5} error />
        <span style={labelStyle}>Error</span>
      </div>
    </div>
  );
}

/**
 * Interactive states preview — idle + focus side by side.
 * Focus row uses [data-force-state="focus"] on the group slot so the halo
 * renders without requiring real keyboard focus (matches Slider's pattern).
 * Demonstrates the Informative-colored focus halo described in the Figma spec.
 */
export function StepperInteractiveStates() {
  const states: Array<{ forceState?: 'focus'; label: string }> = [
    { forceState: undefined, label: 'Idle' },
    { forceState: 'focus', label: 'Focus' },
  ];

  return (
    <div style={row}>
      {states.map(({ forceState, label }) => (
        <div key={label} style={labeledItem}>
          <Stepper
            defaultValue={5}
            partProps={
              forceState
                ? { root: { 'data-force-state': forceState } as React.ComponentPropsWithRef<'div'> }
                : undefined
            }
          />
          <span style={labelStyle}>{label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Default vs condensed mode — same typography, reduced height
 */
export function StepperCondensed() {
  const labeledRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 'var(--Spacing-4)',
    width: '100%',
  };
  const rowLabelStyle: React.CSSProperties = {
    ...labelStyle,
    minWidth: '80px',
    margin: 0,
    fontWeight: 'var(--Typography-Weight-Medium)',
  };

  return (
    <div style={column}>
      <div style={labeledRowStyle}>
        <span style={rowLabelStyle}>Default</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', alignItems: 'center' }}>
          <Stepper size="s" defaultValue={5} />
          <Stepper size="m" defaultValue={5} />
          <Stepper size="l" defaultValue={5} />
        </div>
      </div>
      <div style={labeledRowStyle}>
        <span style={rowLabelStyle}>Condensed</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', alignItems: 'center' }}>
          <Stepper size="s" condensed defaultValue={5} />
          <Stepper size="m" condensed defaultValue={5} />
          <Stepper size="l" condensed defaultValue={5} />
        </div>
      </div>
    </div>
  );
}
