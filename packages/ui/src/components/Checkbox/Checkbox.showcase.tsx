/**
 * Checkbox.showcase.tsx
 *
 * Shared variant display components for Checkbox.
 * Imported by both Storybook stories and the platform documentation page —
 * keeping them in sync with a single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

import React from 'react';
import { Checkbox } from './Checkbox';
import { Surface } from '../Surface';

// ─── Shared layout helpers ────────────────────────────────────────────────────

const column: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4-5)',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-XS)',
  color: 'var(--Text-Low)',
};

// ─── Shared table styles ──────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-XS)',
  color: 'var(--Text-Low)',
  fontWeight: 'var(--Typography-Weight-Medium)',
  textAlign: 'left',
  padding: 'var(--Spacing-3)',
};

const thCenter: React.CSSProperties = { ...thStyle, textAlign: 'center' };

const tdLabel: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-S)',
  fontWeight: 'var(--Typography-Weight-Medium)',
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

const tableStyle: React.CSSProperties = {
  borderCollapse: 'separate',
  borderSpacing: 'var(--Spacing-4) var(--Spacing-3-5)',
};

// ─── Exported showcase components ─────────────────────────────────────────────

/**
 * S / M / L sizes × unchecked, checked, indeterminate
 */
export function CheckboxSizes() {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Size</th>
          <th style={thCenter}>Unchecked</th>
          <th style={thCenter}>Checked</th>
          <th style={thCenter}>Indeterminate</th>
        </tr>
      </thead>
      <tbody>
        {(['s', 'm', 'l'] as const).map((size) => (
          <tr key={size}>
            <td style={tdLabel}>{size.toUpperCase()}</td>
            <td style={tdCenter}>
              <Checkbox size={size} checked={false} aria-label={`${size} size, unchecked`} />
            </td>
            <td style={tdCenter}>
              <Checkbox size={size} checked aria-label={`${size} size, checked`} />
            </td>
            <td style={tdCenter}>
              <Checkbox size={size} indeterminate aria-label={`${size} size, indeterminate`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * All visual states — unchecked, checked, indeterminate, disabled, read-only
 */
export function CheckboxStates() {
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
          { label: 'Unchecked', el: <Checkbox checked={false} label="Label" /> },
          { label: 'Checked', el: <Checkbox checked label="Label" /> },
          { label: 'Indeterminate', el: <Checkbox indeterminate label="Label" /> },
          { label: 'Disabled (unchecked)', el: <Checkbox disabled checked={false} label="Label" /> },
          { label: 'Disabled (checked)', el: <Checkbox disabled checked label="Label" /> },
          { label: 'Read-only (unchecked)', el: <Checkbox readOnly checked={false} label="Label" /> },
          { label: 'Read-only (checked)', el: <Checkbox readOnly checked label="Label" /> },
        ].map(({ label, el }) => (
          <tr key={label}>
            <td style={tdLabel}>{label}</td>
            <td style={{ padding: 'var(--Spacing-3)', verticalAlign: 'middle' }}>{el}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Primary, secondary, sparkle — each as a full **`appearance`** (border + fill).
 */
export function CheckboxAccents() {
  const roles = ['primary', 'secondary', 'sparkle'] as const;

  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)' }}>
      {roles.map((role) => (
        <div key={role} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
          <span style={labelStyle}>{role}</span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)' }}>
            <Checkbox appearance={role} aria-label={`${role} appearance, unchecked`} />
            <Checkbox appearance={role} checked aria-label={`${role} appearance, checked`} />
            <Checkbox appearance={role} indeterminate aria-label={`${role} appearance, indeterminate`} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Switch **`appearance`** to change both border context and checked fill (no separate fill API).
 */
export function CheckboxAccentOverride() {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Appearance</th>
          <th style={thStyle}>Preview (checked)</th>
        </tr>
      </thead>
      <tbody>
        {[
          { label: 'Neutral', app: 'neutral' as const },
          { label: 'Secondary', app: 'secondary' as const },
          { label: 'Sparkle', app: 'sparkle' as const },
        ].map(({ label, app }) => (
          <tr key={label}>
            <td style={tdLabel}>{label}</td>
            <td style={{ padding: 'var(--Spacing-3)', verticalAlign: 'middle' }}>
              <Checkbox appearance={app} checked label={`${label} fill`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * S / M / L sizes × read-only unchecked/checked
 */
export function CheckboxReadOnly() {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Size</th>
          <th style={thCenter}>Unchecked</th>
          <th style={thCenter}>Checked</th>
          <th style={thCenter}>Indeterminate</th>
        </tr>
      </thead>
      <tbody>
        {(['s', 'm', 'l'] as const).map((size) => (
          <tr key={size}>
            <td style={tdLabel}>{size.toUpperCase()}</td>
            <td style={tdCenter}>
              <Checkbox size={size} readOnly checked={false} aria-label={`${size} size read-only, unchecked`} />
            </td>
            <td style={tdCenter}>
              <Checkbox size={size} readOnly checked aria-label={`${size} size read-only, checked`} />
            </td>
            <td style={tdCenter}>
              <Checkbox
                size={size}
                readOnly
                indeterminate
                aria-label={`${size} size read-only, indeterminate`}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Surface context — how Checkbox adapts on 5 surface modes using secondary appearance.
 * Replicates the Storybook SurfaceContext story exactly (split pattern, same tokens).
 */
export function CheckboxSurfaceContext() {
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
          <Surface mode={mode} style={{ ...surfaceStyle, ...secondarySurfaceFills as React.CSSProperties }}>
            <Checkbox appearance="secondary" checked label="Checked" />
            <Checkbox appearance="secondary" label="Unchecked" />
            <Checkbox appearance="secondary" indeterminate label="Indeterminate" />
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
export function CheckboxFocusState() {
  const labeledItem: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--Spacing-3)',
    alignItems: 'center',
  };
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div style={labeledItem}>
        <Checkbox checked={false} aria-label="Idle unchecked" />
        <span style={labelStyle}>Idle unchecked</span>
      </div>
      <div style={labeledItem}>
        <Checkbox checked aria-label="Idle checked" />
        <span style={labelStyle}>Idle checked</span>
      </div>
      <div style={labeledItem}>
        <div data-force-state="focus" style={{ display: 'inline-flex' }}>
          <Checkbox checked={false} aria-label="Focus unchecked" />
        </div>
        <span style={labelStyle}>Focus unchecked</span>
      </div>
      <div style={labeledItem}>
        <div data-force-state="focus" style={{ display: 'inline-flex' }}>
          <Checkbox checked aria-label="Focus checked" />
        </div>
        <span style={labelStyle}>Focus checked</span>
      </div>
    </div>
  );
}

/**
 * Short, medium, and long label text — demonstrates alignment behaviour
 */
export function CheckboxWithLabel() {
  return (
    <div style={{ ...column, maxWidth: 'var(--Spacing-40)' }}>
      <Checkbox checked label="Short label" />
      <Checkbox label="A medium-length label for a checkbox option" />
      <Checkbox
        checked
        label="A longer label that demonstrates how the checkbox aligns with multi-line text content that wraps to the next line"
      />
      <Checkbox size="s" label="Small checkbox with label" />
      <Checkbox size="l" label="Large checkbox with label" />
      <Checkbox
        size="s"
        label="Small checkbox"
        description="Compact body description to verify font size"
      />
      <Checkbox
        size="l"
        label="Large checkbox"
        description="Inline supplementary description renders below the label."
      />
    </div>
  );
}
