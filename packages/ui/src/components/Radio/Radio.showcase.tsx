/**
 * Radio.showcase.tsx
 *
 * Shared variant display components for Radio.
 * Imported by both Storybook stories and the platform documentation page —
 * keeping them in sync with a single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

import React from 'react';
import { Radio, RadioGroup } from './Radio';
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

// ─── Shared table / grid styles ───────────────────────────────────────────────

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
  textTransform: 'capitalize',
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

// ─── Exported showcase components ─────────────────────────────────────────────

/**
 * S / M / L sizes × unchecked and checked
 */
export function RadioSizes() {
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
            <td style={tdCenter}>
              <RadioGroup value="" aria-label={`${size} unchecked`}>
                <Radio size={size} value="x" />
              </RadioGroup>
            </td>
            <td style={tdCenter}>
              <RadioGroup value="x" aria-label={`${size} checked`}>
                <Radio size={size} value="x" />
              </RadioGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * All visual states — unchecked, checked, disabled, read-only
 */
export function RadioStates() {
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
          { label: 'Unchecked', el: <RadioGroup value="" aria-label="Unchecked"><Radio value="x" label="Label" /></RadioGroup> },
          { label: 'Checked', el: <RadioGroup value="x" aria-label="Checked"><Radio value="x" label="Label" /></RadioGroup> },
          { label: 'Disabled (unchecked)', el: <RadioGroup value="" disabled aria-label="Disabled unchecked"><Radio value="x" label="Label" /></RadioGroup> },
          { label: 'Disabled (checked)', el: <RadioGroup value="x" disabled aria-label="Disabled checked"><Radio value="x" label="Label" /></RadioGroup> },
          { label: 'Read-only (unchecked)', el: <RadioGroup value="" readOnly aria-label="Readonly unchecked"><Radio value="x" label="Label" /></RadioGroup> },
          { label: 'Read-only (checked)', el: <RadioGroup value="x" readOnly aria-label="Readonly checked"><Radio value="x" label="Label" /></RadioGroup> },
        ].map(({ label, el }) => (
          <tr key={label}>
            <td style={{ ...tdLabel, textTransform: 'none' as const }}>{label}</td>
            <td style={tdDefault}>{el}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Primary, secondary, sparkle — each as a full **`appearance`** (border + fill).
 */
export function RadioAccents() {
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
        {(['primary', 'secondary', 'sparkle'] as const).map((app) => (
          <tr key={app}>
            <td style={tdLabel}>{app}</td>
            <td style={tdCenter}>
              <RadioGroup value="" aria-label={`${app} unchecked`}>
                <Radio value="x" appearance={app} />
              </RadioGroup>
            </td>
            <td style={tdCenter}>
              <RadioGroup value="x" aria-label={`${app} checked`}>
                <Radio value="x" appearance={app} />
              </RadioGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Switch **`appearance`** to change both border context and checked fill (no separate fill API).
 */
export function RadioAccentOverride() {
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
            <td style={{ ...tdLabel, textTransform: 'none' as const }}>{label}</td>
            <td style={tdDefault}>
              <RadioGroup value="x" aria-label={`${label} checked`}>
                <Radio appearance={app} value="x" label={`${label} fill`} />
              </RadioGroup>
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
export function RadioReadOnly() {
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
            <td style={tdCenter}>
              <RadioGroup value="" readOnly aria-label={`${size} readonly unchecked`}>
                <Radio size={size} value="x" />
              </RadioGroup>
            </td>
            <td style={tdCenter}>
              <RadioGroup value="x" readOnly aria-label={`${size} readonly checked`}>
                <Radio size={size} value="x" />
              </RadioGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Surface context — how Radio adapts on 5 surface modes using secondary appearance.
 * Replicates the Storybook SurfaceContext story exactly (split pattern, same tokens).
 */
export function RadioSurfaceContext() {
  const surfaceModes = [
    { mode: 'default' as const, label: 'default', desc: 'page background' },
    { mode: 'minimal' as const, label: 'minimal', desc: 'light tint' },
    { mode: 'subtle' as const, label: 'subtle', desc: 'medium tint' },
    { mode: 'moderate' as const, label: 'moderate', desc: 'heavier tint' },
    { mode: 'bold' as const, label: 'bold', desc: 'full accent colour' },
    { mode: 'elevated' as const, label: 'elevated', desc: 'floating card / popover' },
  ];

  const surfaceStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--Spacing-4-5)',
    padding: 'var(--Spacing-4-5)',
    borderRadius: 'var(--Shape-4)',
    width: '100%',
  };

  // Radio's default appearance resolves to `secondary`, so render the Surface
  // with `appearance="secondary"` too. That picks the brand's secondary scale
  // for step resolution and makes useSurfaceAppearance() return "secondary",
  // which the Radio's unchecked stroke override then follows automatically.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {surfaceModes.map(({ mode, label, desc }) => (
        <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={labelStyle}>{label} — {desc}</span>
          <Surface mode={mode} appearance="secondary" style={surfaceStyle}>
            <RadioGroup defaultValue="a" orientation="horizontal" aria-label={`${label} surface`}>
              <Radio value="a" appearance="secondary" label="Checked" />
              <Radio value="b" appearance="secondary" label="Unchecked" />
            </RadioGroup>
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
export function RadioFocusState() {
  const labeledItem: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--Spacing-3)',
    alignItems: 'center',
  };
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div style={labeledItem}>
        <RadioGroup value="" aria-label="Idle unchecked">
          <Radio value="x" />
        </RadioGroup>
        <span style={labelStyle}>Idle unchecked</span>
      </div>
      <div style={labeledItem}>
        <RadioGroup value="x" aria-label="Idle checked">
          <Radio value="x" />
        </RadioGroup>
        <span style={labelStyle}>Idle checked</span>
      </div>
      <div style={labeledItem}>
        <div data-force-state="focus" style={{ display: 'inline-flex' }}>
          <RadioGroup value="" aria-label="Focus unchecked">
            <Radio value="x" />
          </RadioGroup>
        </div>
        <span style={labelStyle}>Focus unchecked</span>
      </div>
      <div style={labeledItem}>
        <div data-force-state="focus" style={{ display: 'inline-flex' }}>
          <RadioGroup value="x" aria-label="Focus checked">
            <Radio value="x" />
          </RadioGroup>
        </div>
        <span style={labelStyle}>Focus checked</span>
      </div>
    </div>
  );
}

/**
 * Label length examples — short, medium, long, with size variants
 */
export function RadioWithLabel() {
  return (
    <div style={{ width: 420 }}>
      <RadioGroup defaultValue="terms" aria-label="Label examples">
        <Radio value="terms" label="Accept terms and conditions" />
        <Radio value="updates" label="Subscribe to weekly product updates" />
        <Radio value="marketing" label="Receive marketing communications and offers" />
      </RadioGroup>
    </div>
  );
}

/**
 * Functional radio group — notification preferences
 */
export function RadioGroupExample() {
  return (
    <div style={column}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <span style={{ ...labelStyle, fontWeight: 'var(--Typography-Weight-Medium)' }}>
          Notification preference
        </span>
        <RadioGroup defaultValue="newsletter" aria-label="Notification preference">
          <Radio value="newsletter" label="Subscribe to newsletter" />
          <Radio value="updates" label="Product updates only" />
          <Radio value="none" label="No notifications" />
        </RadioGroup>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <span style={{ ...labelStyle, fontWeight: 'var(--Typography-Weight-Medium)' }}>
          Shipping speed
        </span>
        <RadioGroup defaultValue="standard" aria-label="Shipping speed">
          <Radio value="standard" label="Standard (5-7 days)" />
          <Radio value="express" label="Express (2-3 days)" />
          <Radio value="overnight" label="Overnight" />
        </RadioGroup>
      </div>
    </div>
  );
}
