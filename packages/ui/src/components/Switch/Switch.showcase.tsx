/**
 * Switch.showcase.tsx
 *
 * Shared variant display components for Switch.
 * Imported by both Storybook stories and the platform documentation page —
 * keeping them in sync with a single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

import React from 'react';
import { Switch } from './Switch';
import type { SwitchAppearance } from './Switch.shared';
import { Surface } from '../Surface';

// ─── Shared layout helpers ────────────────────────────────────────────────────

const column: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4-5)',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  color: 'var(--Text-Low)',
};

// ─── Shared table styles ──────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-Low)',
  textAlign: 'left',
  padding: 'var(--Spacing-3)',
};

const thCenter: React.CSSProperties = { ...thStyle, textAlign: 'center' };

const tdLabel: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-High)',
  padding: 'var(--Spacing-3)',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

const tdCenter: React.CSSProperties = {
  textAlign: 'center',
  padding: 'var(--Spacing-3)',
  verticalAlign: 'middle',
};

const tdDefault: React.CSSProperties = {
  padding: 'var(--Spacing-3)',
  verticalAlign: 'middle',
};

const tableStyle: React.CSSProperties = {
  borderCollapse: 'separate',
  borderSpacing: 'var(--Spacing-4) var(--Spacing-3-5)',
};

/** Read-only matrix: one row per appearance so border + knob pick up role High tokens. */
const READONLY_DEMO_APPEARANCES: readonly SwitchAppearance[] = [
  'primary',
  'neutral',
  'secondary',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
];

// ─── Exported showcase components ─────────────────────────────────────────────

/**
 * S / M / L sizes × unchecked and checked
 */
export function SwitchSizes() {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Size</th>
          <th style={thCenter}>Unchecked</th>
          <th style={thCenter}>Checked</th>
        </tr>
      </thead>
      <tbody>
        {(['s', 'm', 'l'] as const).map((size) => (
          <tr key={size}>
            <td style={tdLabel}>{size.toUpperCase()}</td>
            <td style={tdCenter}><Switch size={size} checked={false} /></td>
            <td style={tdCenter}><Switch size={size} checked={true} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * All visual states — unchecked, checked, disabled, read-only
 */
export function SwitchStates() {
  return (
    <table style={{ ...tableStyle, width: '100%' }}>
      <thead>
        <tr>
          <th style={thStyle}>State</th>
          <th style={thStyle}>Preview</th>
        </tr>
      </thead>
      <tbody>
        {[
          { label: 'Unchecked', el: <Switch checked={false}>Label</Switch> },
          { label: 'Checked', el: <Switch checked={true}>Label</Switch> },
          { label: 'Disabled (unchecked)', el: <Switch disabled checked={false}>Label</Switch> },
          { label: 'Disabled (checked)', el: <Switch disabled checked={true}>Label</Switch> },
          { label: 'Read-only (unchecked)', el: <Switch readOnly checked={false}>Label</Switch> },
          { label: 'Read-only (checked)', el: <Switch readOnly checked={true}>Label</Switch> },
        ].map(({ label, el }) => (
          <tr key={label}>
            <td style={tdLabel}>{label}</td>
            <td style={tdDefault}>{el}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Three accent fill colors — primary, secondary, sparkle
 */
export function SwitchAccents() {
  const accents = ['primary', 'secondary', 'sparkle'] as const;

  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)' }}>
      {accents.map((accent) => (
        <div key={accent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
          <span style={labelStyle}>{accent}</span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)' }}>
            <Switch accent={accent} />
            <Switch accent={accent} checked />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Accent override — appearance controls context, accent overrides checked fill
 */
export function SwitchAccentOverride() {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Accent</th>
          <th style={thStyle}>Preview</th>
        </tr>
      </thead>
      <tbody>
        {[
          { label: 'None (neutral)', accent: undefined },
          { label: 'Primary', accent: 'primary' as const },
          { label: 'Secondary', accent: 'secondary' as const },
          { label: 'Sparkle', accent: 'sparkle' as const },
        ].map(({ label, accent }) => (
          <tr key={label}>
            <td style={tdLabel}>{label}</td>
            <td style={tdDefault}>
              <Switch appearance="neutral" accent={accent} checked={true}>{label} fill</Switch>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * All appearance roles × read-only unchecked / checked (size M).
 */
export function SwitchReadOnly() {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Appearance</th>
          <th style={thCenter}>Unchecked</th>
          <th style={thCenter}>Checked</th>
        </tr>
      </thead>
      <tbody>
        {READONLY_DEMO_APPEARANCES.map((appearance) => (
          <tr key={appearance}>
            <td style={tdLabel}>{appearance}</td>
            <td style={tdCenter}>
              <Switch readOnly appearance={appearance} checked={false} />
            </td>
            <td style={tdCenter}>
              <Switch readOnly appearance={appearance} checked />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Surface context — how Switch adapts on surface modes using secondary appearance.
 * Each row: interactive checked / unchecked, then read-only unchecked / checked (same role).
 * Fill overrides map Surface fills to Secondary role tokens; switches use `appearance="secondary"`.
 */
export function SwitchSurfaceContext() {
  const surfaceModes = [
    { mode: 'default' as const, label: 'default', desc: 'page background' },
    { mode: 'minimal' as const, label: 'minimal', desc: 'light tint' },
    { mode: 'subtle' as const, label: 'subtle', desc: 'medium tint' },
    { mode: 'moderate' as const, label: 'moderate', desc: 'heavier tint' },
    { mode: 'bold' as const, label: 'bold', desc: 'full accent colour' },
    { mode: 'elevated' as const, label: 'elevated', desc: 'floating card / popover' },
  ];

  // Override Surface container fills with Secondary role tokens
  const secondarySurfaceFills: Record<string, string> = {
    '--Surface-Fill-Minimal': 'var(--Secondary-Fill-Minimal)',
    '--Surface-Fill-Subtle': 'var(--Secondary-Fill-Subtle)',
    '--Surface-Fill-Moderate': 'var(--Secondary-Fill-Moderate)',
    '--Surface-Fill-Bold': 'var(--Secondary-Fill-Bold)',
  };

  const surfaceStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--Spacing-4-5)',
    padding: 'var(--Spacing-4-5)',
    borderRadius: 'var(--Shape-4)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {surfaceModes.map(({ mode, label, desc }) => (
        <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={labelStyle}>{label} — {desc}</span>
          <Surface
            mode={mode}
            appearance="secondary"
            style={{ ...surfaceStyle, ...secondarySurfaceFills as React.CSSProperties }}
          >
            <Switch appearance="secondary" checked>Checked</Switch>
            <Switch appearance="secondary">Unchecked</Switch>
            <Switch appearance="secondary" readOnly checked={false} />
            <Switch appearance="secondary" readOnly checked />
          </Surface>
        </div>
      ))}
    </div>
  );
}

/**
 * Idle vs keyboard-focused state — uses data-force-state="focus" to render
 * the Informative focus ring without requiring actual keyboard navigation.
 */
export function SwitchFocusState() {
  const labeledItem: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--Spacing-3)',
    alignItems: 'center',
  };
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div style={labeledItem}>
        <Switch checked={false} />
        <span style={labelStyle}>Idle unchecked</span>
      </div>
      <div style={labeledItem}>
        <Switch checked={true} />
        <span style={labelStyle}>Idle checked</span>
      </div>
      <div style={labeledItem}>
        <div data-force-state="focus" style={{ display: 'inline-flex' }}>
          <Switch checked={false} />
        </div>
        <span style={labelStyle}>Focus unchecked</span>
      </div>
      <div style={labeledItem}>
        <div data-force-state="focus" style={{ display: 'inline-flex' }}>
          <Switch checked={true} />
        </div>
        <span style={labelStyle}>Focus checked</span>
      </div>
    </div>
  );
}

/**
 * Motion review — manual interaction only (no autoplay).
 * Mirrors the docs preview layout exactly so motion behavior is inspected
 * in the same rendering path as docs.
 */
export function SwitchMotion() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4-5)',
        alignItems: 'center',
      }}
    >
      <Surface
        mode="default"
        appearance="neutral"
        style={{
          display: 'flex',
          gap: 'var(--Spacing-4-5)',
          padding: 'var(--Spacing-4)',
          borderRadius: 'var(--Shape-4)',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--Spacing-3)',
            padding: 'var(--Spacing-3-5)',
          }}
        >
          <Switch checked={false} />
          <span style={{ fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Label-XS-FontSize)', lineHeight: 'var(--Label-XS-LineHeight)', color: 'var(--Text-Low)' }}>Off</span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--Spacing-3)',
            padding: 'var(--Spacing-3-5)',
          }}
        >
          <Switch checked />
          <span style={{ fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Label-XS-FontSize)', lineHeight: 'var(--Label-XS-LineHeight)', color: 'var(--Text-Low)' }}>On</span>
        </div>
      </Surface>
    </div>
  );
}

/**
 * Short, medium, and long label text — demonstrates alignment behaviour
 */
export function SwitchWithLabel() {
  return (
    <div style={{ ...column, maxWidth: 'var(--Spacing-40)' }}>
      <Switch checked>Short label</Switch>
      <Switch>A medium-length label for a switch option</Switch>
      <Switch checked>
        A longer label that demonstrates how the switch aligns with multi-line text content that wraps to the next line
      </Switch>
      <Switch size="s">Small switch with label</Switch>
      <Switch size="l">Large switch with label</Switch>
    </div>
  );
}
