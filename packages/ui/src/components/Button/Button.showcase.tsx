/**
 * Button.showcase.tsx
 *
 * Shared variant display components for Button.
 * Imported by both Storybook stories and the platform documentation page —
 * keeping them in sync with a single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

import React from 'react';
import { Button } from './Button';
import { Surface } from '../Surface';
import { Icon } from '../../icons/Icon';
import { SurfaceLadder } from '../../showcase';

// ─── Shared layout helpers ────────────────────────────────────────────────────

const row: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--Spacing-3-5)',
  alignItems: 'center',
};

const column: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4)',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  color: 'var(--Text-Low)',
};

const labeledItem: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3)',
  alignItems: 'center',
};

const SlotIcon = () => <Icon name="heart" aria-hidden={true} />;

// ─── Exported showcase components ─────────────────────────────────────────────

/**
 * High / Medium / Low attention levels
 */
export function ButtonAttentionLevels() {
  return (
    <div style={row}>
      <Button attention="high">High</Button>
      <Button attention="medium">Medium</Button>
      <Button attention="low">Low</Button>
    </div>
  );
}

/**
 * Attention levels across light and dark themes.
 * Each theme block uses data-mode to trigger CSS token remapping.
 */
export function ButtonThemes() {
  return (
    <div style={column}>
      {(['light', 'dark'] as const).map((theme) => (
        <div
          key={theme}
          data-mode={theme}
          style={{
            backgroundColor: 'var(--Surface-Main)',
            padding: 'var(--Spacing-4)',
            borderRadius: 'var(--Shape-4)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 'var(--Spacing-4)',
          }}
        >
          <span
            style={{
              ...labelStyle,
              minWidth: '80px',
              color: 'var(--Text-High)',
              fontWeight: 'var(--Label-FontWeight-Medium)',
            }}
          >
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </span>
          <div style={row}>
            <Button attention="high">High</Button>
            <Button attention="medium">Medium</Button>
            <Button attention="low">Low</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * XS / S / M / L sizes with usage labels
 */
export function ButtonSizes() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-4)', alignItems: 'flex-end' }}>
      <div style={labeledItem}>
        <Button size="xs">Extra Small</Button>
        <span style={labelStyle}>Dense inline</span>
      </div>
      <div style={labeledItem}>
        <Button size="s">Small</Button>
        <span style={labelStyle}>Compact UI</span>
      </div>
      <div style={labeledItem}>
        <Button size="m">Medium</Button>
        <span style={labelStyle}>Default</span>
      </div>
      <div style={labeledItem}>
        <Button size="l">Large</Button>
        <span style={labelStyle}>Touch targets</span>
      </div>
    </div>
  );
}

/**
 * Default vs condensed mode — same typography, reduced height + padding
 */
export function ButtonCondensed() {
  const labeledRow = (label: string, condensed?: boolean) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 'var(--Spacing-4)',
        width: '100%',
      }}
    >
      <span style={{ ...labelStyle, minWidth: '80px', fontWeight: 'var(--Label-FontWeight-Medium)' }}>
        {label}
      </span>
      <div style={row}>
        <Button size="xs" condensed={condensed}>Extra Small</Button>
        <Button size="s" condensed={condensed}>Small</Button>
        <Button size="m" condensed={condensed}>Medium</Button>
        <Button size="l" condensed={condensed}>Large</Button>
      </div>
    </div>
  );

  return (
    <div style={column}>
      {labeledRow('Default')}
      {labeledRow('Condensed', true)}
    </div>
  );
}

/**
 * Default, disabled, and loading states
 */
export function ButtonStates() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-4)', alignItems: 'flex-end' }}>
      <div style={labeledItem}>
        <Button>Default</Button>
        <span style={labelStyle}>Normal</span>
      </div>
      <div style={labeledItem}>
        <Button disabled>Disabled</Button>
        <span style={labelStyle}>Not available</span>
      </div>
      <div style={labeledItem}>
        <Button loading>Loading</Button>
        <span style={labelStyle}>In progress</span>
      </div>
    </div>
  );
}

/**
 * Start and end icon slot combinations
 */
export function ButtonWithSlots() {
  return (
    <div style={row}>
      <Button start={<SlotIcon />}>Back</Button>
      <Button end={<SlotIcon />}>Next</Button>
      <Button start={<SlotIcon />} end={<SlotIcon />}>Create</Button>
    </div>
  );
}

/**
 * Full-width layout variant
 */
export function ButtonFullWidth() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)', width: '100%' }}>
      <Button fullWidth attention="high">High Full Width</Button>
      <Button fullWidth attention="medium">Medium Full Width</Button>
      <Button fullWidth attention="low">Low Full Width</Button>
    </div>
  );
}

/**
 * All 9 multi-accent appearance roles × 3 attention levels.
 * Use this for generic documentation. The platform page shows only
 * brand-configured roles with accurate per-role surface token data.
 */
export function ButtonAppearances() {
  const roles = [
    'primary', 'secondary', 
    'neutral', 'sparkle', 'brand-bg',
    'positive', 'negative', 'warning', 'informative',
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {roles.map((role) => (
        <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={{ ...labelStyle, textTransform: 'capitalize' }}>{role}</span>
          <div style={row}>
            <Button appearance={role} attention="high">High</Button>
            <Button appearance={role} attention="medium">Medium</Button>
            <Button appearance={role} attention="low">Low</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Idle vs keyboard-focused state — uses data-force-state="focus" to render
 * the focus ring without requiring actual keyboard navigation in Storybook.
 */
export function ButtonFocusState() {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'flex-end' }}>
      <div style={labeledItem}>
        <Button attention="high">Default</Button>
        <span style={labelStyle}>Idle</span>
      </div>
      <div style={labeledItem}>
        <div data-force-state="focus" style={{ display: 'inline-flex' }}>
          <Button attention="high">Focused</Button>
        </div>
        <span style={labelStyle}>Focus</span>
      </div>
    </div>
  );
}

/**
 * The full surface ladder — the three attention levels rendered on every
 * surface mode (default → minimal → subtle → moderate → bold → elevated).
 * This is the canonical "Variants on Surfaces" section shared by the platform
 * docs and Storybook, built on the shared `SurfaceLadder` primitive so both
 * render identically.
 */
export function ButtonSurfaceShowcase() {
  return (
    <SurfaceLadder>
      <Button attention="high">Bold</Button>
      <Button attention="medium">Subtle</Button>
      <Button attention="low">Ghost</Button>
    </SurfaceLadder>
  );
}

/**
 * Buttons on standard and brand-tinted BG surfaces.
 * Demonstrates how buttons adapt via Surface context.
 */
export function ButtonSurfaceContext() {
  const sectionLabel: React.CSSProperties = {
    fontSize: 'var(--Label-S-FontSize)',
    lineHeight: 'var(--Label-S-LineHeight)',
    color: 'var(--Text-Low)',
  };
  const cellStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--Spacing-4)',
    padding: 'var(--Spacing-5)',
    borderRadius: 'var(--Shape-4)',
  };

  const surfaceModes = [
    { mode: 'default' as const, label: 'default', desc: 'page background' },
    { mode: 'subtle' as const, label: 'subtle', desc: 'medium tint' },
    { mode: 'bold' as const, label: 'bold', desc: 'full accent colour' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {surfaceModes.map(({ mode, label, desc }) => (
        <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={sectionLabel}>{label} — {desc}</span>
          <Surface mode={mode} style={cellStyle}>
            <Button attention="high" start={<SlotIcon />}>High</Button>
            <Button attention="medium" start={<SlotIcon />}>Medium</Button>
            <Button attention="low" end={<SlotIcon />}>Low</Button>
          </Surface>
        </div>
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <span style={sectionLabel}>
          bold + focus + leading/trailing icons — focus halo must stay readable on bold
        </span>
        <Surface mode="bold" style={cellStyle}>
          {(['high', 'medium', 'low'] as const).map(attention => (
            <div key={attention} data-force-state="focus" style={{ display: 'inline-flex' }}>
              <Button attention={attention} start={<SlotIcon />} end={<SlotIcon />}>
                {attention[0].toUpperCase() + attention.slice(1)} focused
              </Button>
            </div>
          ))}
        </Surface>
      </div>
    </div>
  );
}
