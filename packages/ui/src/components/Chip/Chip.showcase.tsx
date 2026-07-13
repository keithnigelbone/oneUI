/**
 * Chip.showcase.tsx
 *
 * Shared variant display components for Chip.
 * Imported by both Storybook stories and the platform documentation page —
 * keeping them in sync with a single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

import React from 'react';
import { Chip } from './Chip';
import { Icon } from '../Icon/Icon';
import { Avatar } from '../Avatar/Avatar';
import { CounterBadge } from '../CounterBadge/CounterBadge';
import { IndicatorBadge } from '../IndicatorBadge/IndicatorBadge';
import { Surface } from '../Surface';

// ─── Shared layout helpers ────────────────────────────────────────────────────

const row: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--Spacing-4)',
  alignItems: 'center',
};

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
 * High / Medium / Low attention levels — selected and unselected
 */
export function ChipAttentionLevels() {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Attention</th>
          <th style={thCenter}>Selected</th>
          <th style={thCenter}>Unselected</th>
        </tr>
      </thead>
      <tbody>
        {(['high', 'medium', 'low'] as const).map((attention) => (
          <tr key={attention}>
            <td style={tdLabel}>{attention.charAt(0).toUpperCase() + attention.slice(1)}</td>
            <td style={tdCenter}>
              <Chip appearance="secondary" attention={attention} defaultSelected>
                {attention}
              </Chip>
            </td>
            <td style={tdCenter}>
              <Chip appearance="secondary" attention={attention} defaultSelected={false}>
                {attention}
              </Chip>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * S / M / L sizes — selected and unselected
 */
export function ChipSizes() {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Size</th>
          <th style={thCenter}>Selected</th>
          <th style={thCenter}>Unselected</th>
        </tr>
      </thead>
      <tbody>
        {(['s', 'm', 'l'] as const).map((size) => (
          <tr key={size}>
            <td style={tdLabel}>{size.toUpperCase()}</td>
            <td style={tdCenter}>
              <Chip size={size} appearance="secondary" attention="high" defaultSelected>
                {size.toUpperCase()}
              </Chip>
            </td>
            <td style={tdCenter}>
              <Chip size={size} appearance="secondary" attention="high" defaultSelected={false}>
                {size.toUpperCase()}
              </Chip>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Default, selected, disabled, and disabled-selected states
 */
export function ChipStates() {
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
          {
            label: 'Default (unselected)',
            el: (
              <Chip appearance="secondary" attention="high" defaultSelected={false}>
                Chip
              </Chip>
            ),
          },
          {
            label: 'Selected',
            el: (
              <Chip appearance="secondary" attention="high" defaultSelected>
                Chip
              </Chip>
            ),
          },
          {
            label: 'Disabled (unselected)',
            el: (
              <Chip appearance="secondary" attention="high" defaultSelected={false} disabled>
                Chip
              </Chip>
            ),
          },
          {
            label: 'Disabled (selected)',
            el: (
              <Chip appearance="secondary" attention="high" disabled defaultSelected>
                Chip
              </Chip>
            ),
          },
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
 * Start and end slot combinations — Icon, Avatar, CounterBadge, IndicatorBadge
 */
export function ChipWithSlots() {
  const sectionLabel: React.CSSProperties = {
    ...thStyle,
    display: 'block',
    marginTop: 0,
    marginBottom: 'var(--Spacing-3)',
  };

  return (
    <div style={column}>
      {/* Start — Icon */}
      <div>
        <p style={sectionLabel}>Start — Icon</p>
        <div style={row}>
          <Chip
            size="s"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<Icon icon="check" size="3" />}
          >
            S
          </Chip>
          <Chip
            size="m"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<Icon icon="check" size="4" />}
          >
            M
          </Chip>
          <Chip
            size="l"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<Icon icon="check" size="5" />}
          >
            L
          </Chip>
        </div>
      </div>

      {/* Start — Avatar */}
      <div>
        <p style={sectionLabel}>Start — Avatar</p>
        <div style={row}>
          <Chip
            size="s"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<Avatar size="xs" appearance="secondary" alt="JD" />}
          >
            S
          </Chip>
          <Chip
            size="m"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<Avatar size="s" appearance="secondary" alt="JD" />}
          >
            M
          </Chip>
          <Chip
            size="l"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<Avatar size="m" appearance="secondary" alt="JD" />}
          >
            L
          </Chip>
        </div>
      </div>

      {/* Start — CounterBadge */}
      <div>
        <p style={sectionLabel}>Start — CounterBadge</p>
        <div style={row}>
          <Chip
            size="s"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<CounterBadge value={3} size="xs" appearance="negative" aria-label="3" />}
          >
            S
          </Chip>
          <Chip
            size="m"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<CounterBadge value={3} size="xs" appearance="negative" aria-label="3" />}
          >
            M
          </Chip>
          <Chip
            size="l"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<CounterBadge value={3} size="s" appearance="negative" aria-label="3" />}
          >
            L
          </Chip>
        </div>
      </div>

      {/* Start — IndicatorBadge */}
      <div>
        <p style={sectionLabel}>Start — IndicatorBadge</p>
        <div style={row}>
          <Chip
            size="s"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<IndicatorBadge size="s" appearance="positive" aria-label="Online" />}
          >
            S
          </Chip>
          <Chip
            size="m"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<IndicatorBadge size="s" appearance="positive" aria-label="Online" />}
          >
            M
          </Chip>
          <Chip
            size="l"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<IndicatorBadge size="l" appearance="positive" aria-label="Online" />}
          >
            L
          </Chip>
        </div>
      </div>

      {/* End — Icon */}
      <div>
        <p style={sectionLabel}>End — Icon</p>
        <div style={row}>
          <Chip
            size="s"
            appearance="secondary"
            attention="high"
            defaultSelected
            end={<Icon icon="close" size="3" />}
          >
            S
          </Chip>
          <Chip
            size="m"
            appearance="secondary"
            attention="high"
            defaultSelected
            end={<Icon icon="close" size="4" />}
          >
            M
          </Chip>
          <Chip
            size="l"
            appearance="secondary"
            attention="high"
            defaultSelected
            end={<Icon icon="close" size="5" />}
          >
            L
          </Chip>
        </div>
      </div>

      {/* End — Avatar */}
      <div>
        <p style={sectionLabel}>End — Avatar</p>
        <div style={row}>
          <Chip
            size="s"
            appearance="secondary"
            attention="high"
            defaultSelected
            end={<Avatar size="xs" appearance="secondary" alt="JD" />}
          >
            S
          </Chip>
          <Chip
            size="m"
            appearance="secondary"
            attention="high"
            defaultSelected
            end={<Avatar size="s" appearance="secondary" alt="JD" />}
          >
            M
          </Chip>
          <Chip
            size="l"
            appearance="secondary"
            attention="high"
            defaultSelected
            end={<Avatar size="m" appearance="secondary" alt="JD" />}
          >
            L
          </Chip>
        </div>
      </div>

      {/* End — CounterBadge */}
      <div>
        <p style={sectionLabel}>End — CounterBadge</p>
        <div style={row}>
          <Chip
            size="s"
            appearance="secondary"
            attention="high"
            defaultSelected
            end={<CounterBadge value={5} size="xs" appearance="negative" aria-label="5" />}
          >
            S
          </Chip>
          <Chip
            size="m"
            appearance="secondary"
            attention="high"
            defaultSelected
            end={<CounterBadge value={5} size="xs" appearance="negative" aria-label="5" />}
          >
            M
          </Chip>
          <Chip
            size="l"
            appearance="secondary"
            attention="high"
            defaultSelected
            end={<CounterBadge value={5} size="s" appearance="negative" aria-label="5" />}
          >
            L
          </Chip>
        </div>
      </div>

      {/* End — IndicatorBadge */}
      <div>
        <p style={sectionLabel}>End — IndicatorBadge</p>
        <div style={row}>
          <Chip
            size="s"
            appearance="secondary"
            attention="high"
            defaultSelected
            end={<IndicatorBadge size="s" appearance="positive" aria-label="Active" />}
          >
            S
          </Chip>
          <Chip
            size="m"
            appearance="secondary"
            attention="high"
            defaultSelected
            end={<IndicatorBadge size="s" appearance="positive" aria-label="Active" />}
          >
            M
          </Chip>
          <Chip
            size="l"
            appearance="secondary"
            attention="high"
            defaultSelected
            end={<IndicatorBadge size="l" appearance="positive" aria-label="Active" />}
          >
            L
          </Chip>
        </div>
      </div>

      {/* Both Slots */}
      <div>
        <p style={sectionLabel}>Both Slots (M size)</p>
        <div style={row}>
          <Chip
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<Icon icon="check" size="4" />}
            end={<Icon icon="close" size="4" />}
          >
            Icon + Icon
          </Chip>
          <Chip
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<Avatar size="s" appearance="secondary" alt="JD" />}
            end={<Icon icon="close" size="4" />}
          >
            Avatar + Icon
          </Chip>
          <Chip
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<IndicatorBadge size="s" appearance="positive" aria-label="Status" />}
            end={<CounterBadge value={7} size="xs" appearance="negative" aria-label="7" />}
          >
            Indicator + Counter
          </Chip>
        </div>
      </div>
    </div>
  );
}

/**
 * All 9 multi-accent appearance roles × selected and unselected.
 * Use this for generic documentation. The platform page shows only
 * brand-configured roles with accurate per-role surface token data.
 */
export function ChipAppearances() {
  const roles = [
    'primary',
    'secondary',
    'neutral',
    'sparkle',
    'brand-bg',
    'positive',
    'negative',
    'warning',
    'informative',
  ] as const;

  return (
    <div style={column}>
      <div>
        <p style={{ ...labelStyle, marginBottom: 'var(--Spacing-3)' }}>Selected (High Attention)</p>
        <div style={row}>
          {roles.map((role) => (
            <Chip
              key={role}
              appearance={role}
              attention="high"
              defaultSelected
              aria-label={`${role} chip`}
            >
              {role}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p style={{ ...labelStyle, marginBottom: 'var(--Spacing-3)' }}>
          Unselected (Low Attention)
        </p>
        <div style={row}>
          {roles.map((role) => (
            <Chip key={role} appearance={role} attention="low" aria-label={`${role} chip`}>
              {role}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Idle vs keyboard-focused state — uses data-force-state="focus" to render
 * the focus ring without requiring actual keyboard navigation.
 */
export function ChipFocusState() {
  const labeledItem: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--Spacing-3)',
    alignItems: 'center',
  };
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'flex-end' }}>
      <div style={labeledItem}>
        <Chip>Filter</Chip>
        <span style={labelStyle}>Idle</span>
      </div>
      <div style={labeledItem}>
        <div data-force-state="focus" style={{ display: 'inline-flex' }}>
          <Chip>Filter</Chip>
        </div>
        <span style={labelStyle}>Focus</span>
      </div>
    </div>
  );
}

/**
 * Surface context — how Chip adapts on 6 surface modes.
 * Chip defaults to `appearance="secondary"`, so the surface backgrounds
 * are scoped to the secondary role. We use the `--Secondary-Fill-*`
 * root-only tokens (same primitive Surface.module.css consumes for
 * `--Surface-Fill-*`) so the container shows the TRUE unremapped
 * surface color. Using `--Secondary-Bold` would fail here because
 * `[data-surface="bold"]` remaps that token to the inverted tinted
 * accent — the chip's fill would collapse to the same value and
 * become invisible on its own background. Button's SurfaceContext
 * works for the exact same reason: it relies on `--Surface-Fill-Bold`
 * (root-only) for the container while the button body reads the
 * remapped `--Primary-Bold` token.
 */
const SECONDARY_SURFACE_BG: Record<string, string> = {
  default: 'var(--Surface-Default, var(--Surface-Main))',
  minimal: 'var(--Secondary-Fill-Minimal, var(--Surface-Minimal))',
  subtle: 'var(--Secondary-Fill-Subtle, var(--Surface-Subtle))',
  moderate: 'var(--Secondary-Fill-Moderate, var(--Surface-Subtle))',
  bold: 'var(--Secondary-Fill-Bold, var(--Surface-Bold))',
  elevated: 'var(--Secondary-Fill-Elevated, var(--Surface-Elevated))',
};

export function ChipSurfaceContext() {
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
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--Spacing-4)',
    padding: 'var(--Spacing-4-5)',
    borderRadius: 'var(--Shape-4)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {surfaceModes.map(({ mode, label, desc }) => (
        <div
          key={mode}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}
        >
          <span style={labelStyle}>
            {label} — {desc}
          </span>
          <Surface
            mode={mode}
            appearance="secondary"
            style={{ ...surfaceStyle, backgroundColor: SECONDARY_SURFACE_BG[mode] }}
          >
            <Chip appearance="secondary" attention="high" defaultSelected>
              Selected
            </Chip>
            <Chip
              appearance="secondary"
              attention="high"
              defaultSelected
              start={<Icon icon="check" size="4" />}
            >
              Icon
            </Chip>
            <Chip
              appearance="secondary"
              attention="high"
              defaultSelected
              start={<Avatar size="s" content="icon" appearance="secondary" alt="Profile" />}
            >
              Avatar
            </Chip>
            <Chip
              appearance="secondary"
              attention="high"
              defaultSelected
              start={<IndicatorBadge size="s" appearance="positive" aria-label="Online" />}
            >
              Indicator
            </Chip>
            <Chip
              appearance="secondary"
              attention="high"
              defaultSelected
              end={<CounterBadge value={5} size="xs" appearance="negative" aria-label="5 alerts" />}
            >
              Counter
            </Chip>
            <Chip appearance="secondary" attention="medium" defaultSelected>
              Medium
            </Chip>
            <Chip
              appearance="secondary"
              attention="medium"
              defaultSelected
              start={<Icon icon="check" size="4" />}
            >
              Medium Icon
            </Chip>
            <Chip appearance="secondary" attention="low">
              Low
            </Chip>
            <Chip
              appearance="secondary"
              attention="low"
              start={<Icon icon="check" size="4" />}
            >
              Low Icon
            </Chip>
          </Surface>
        </div>
      ))}
    </div>
  );
}
