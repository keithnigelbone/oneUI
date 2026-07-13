/**
 * LinkButton.showcase.tsx
 *
 * Shared variant display components for LinkButton.
 * Imported by both Storybook stories and the platform documentation page —
 * keeping them in sync with a single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

import React from 'react';
import { LinkButton } from './LinkButton';

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
  fontWeight: 'var(--Typography-Weight-Medium)',
};

// Generic placeholder for icon slot demos — size controlled by LinkButton's CSS
const SlotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M14 3v2H5v14h14v-9h2v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h10zm7 0v6h-2V6.413l-7.293 7.294-1.414-1.414L17.585 5H15V3h6z"
      fill="currentColor"
    />
  </svg>
);

// ─── Exported showcase components ─────────────────────────────────────────────

/**
 * High / Medium / Low attention levels
 */
export function LinkButtonAttentionLevels() {
  return (
    <div style={row}>
      <LinkButton attention="high">High</LinkButton>
      <LinkButton attention="medium">Medium</LinkButton>
      <LinkButton attention="low">Low</LinkButton>
    </div>
  );
}

/**
 * S / M / L sizes across all attention levels
 */
export function LinkButtonSizes() {
  return (
    <div style={column}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={labelStyle}>{size.toUpperCase()}</span>
          <div style={row}>
            <LinkButton size={size} attention="high">High</LinkButton>
            <LinkButton size={size} attention="medium">Medium</LinkButton>
            <LinkButton size={size} attention="low">Low</LinkButton>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Default, disabled, and loading states
 */
export function LinkButtonStates() {
  return (
    <div style={row}>
      <LinkButton attention="high">Default</LinkButton>
      <LinkButton attention="high" disabled>Disabled</LinkButton>
      <LinkButton attention="high" loading>Loading</LinkButton>
    </div>
  );
}

/**
 * Start and end icon slot combinations
 */
export function LinkButtonWithSlots() {
  return (
    <div style={column}>
      <div>
        <span style={{ ...labelStyle, display: 'block', marginBottom: 'var(--Spacing-3)' }}>Start slot</span>
        <div style={row}>
          <LinkButton size="s" attention="high" start={<SlotIcon />}>Small</LinkButton>
          <LinkButton size="m" attention="high" start={<SlotIcon />}>Medium</LinkButton>
          <LinkButton size="l" attention="high" start={<SlotIcon />}>Large</LinkButton>
        </div>
      </div>
      <div>
        <span style={{ ...labelStyle, display: 'block', marginBottom: 'var(--Spacing-3)' }}>End slot</span>
        <div style={row}>
          <LinkButton size="s" attention="high" end={<SlotIcon />}>Small</LinkButton>
          <LinkButton size="m" attention="high" end={<SlotIcon />}>Medium</LinkButton>
          <LinkButton size="l" attention="high" end={<SlotIcon />}>Large</LinkButton>
        </div>
      </div>
      <div>
        <span style={{ ...labelStyle, display: 'block', marginBottom: 'var(--Spacing-3)' }}>Both slots (M size)</span>
        <div style={row}>
          <LinkButton attention="high" start={<SlotIcon />} end={<SlotIcon />}>High</LinkButton>
          <LinkButton attention="medium" start={<SlotIcon />} end={<SlotIcon />}>Medium</LinkButton>
          <LinkButton attention="low" start={<SlotIcon />} end={<SlotIcon />}>Low</LinkButton>
        </div>
      </div>
    </div>
  );
}

/**
 * Idle vs keyboard-focused state — uses data-force-state="focus" to render
 * the focus ring without requiring actual keyboard navigation.
 */
export function LinkButtonFocusState() {
  const labeledItem: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--Spacing-3)',
    alignItems: 'center',
  };
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'flex-end' }}>
      <div style={labeledItem}>
        <LinkButton attention="high">Link Button</LinkButton>
        <span style={labelStyle}>Idle</span>
      </div>
      <div style={labeledItem}>
        <div data-force-state="focus" style={{ display: 'inline-flex' }}>
          <LinkButton attention="high">Link Button</LinkButton>
        </div>
        <span style={labelStyle}>Focus</span>
      </div>
    </div>
  );
}

/**
 * All 9 multi-accent appearance roles × 3 attention levels.
 * Use for generic documentation. The platform page shows only brand-configured roles.
 */
export function LinkButtonAppearances() {
  const roles = [
    'primary', 'secondary', 
    'neutral', 'sparkle', 'brand-bg',
    'positive', 'negative', 'warning', 'informative',
  ] as const;

  return (
    <div style={column}>
      {roles.map((role) => (
        <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={{ ...labelStyle, textTransform: 'capitalize' }}>{role}</span>
          <div style={row}>
            <LinkButton appearance={role} attention="high">High</LinkButton>
            <LinkButton appearance={role} attention="medium">Medium</LinkButton>
            <LinkButton appearance={role} attention="low">Low</LinkButton>
          </div>
        </div>
      ))}
    </div>
  );
}
