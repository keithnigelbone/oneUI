/**
 * Foundations / Appearance
 *
 * Read-only visualization of the 9 multi-accent appearance roles, focused
 * on **background surface tokens** only (the `BG-*` family). Foreground
 * fills and on-colour content tokens were removed from this story — they
 * belong in the Surfaces / component stories, not in the appearance grid.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { APPEARANCE_ROLES } from '@oneui/shared/engine';
import { Button } from '@oneui/ui/components/Button';

const meta: Meta = {
  title: 'Foundations/Appearance',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'All 9 multi-accent appearance roles. The Background Grid shows ' +
          'every role × BG token combination; Buttons By Role renders each ' +
          "role via the Button's `appearance` prop so you can see the full " +
          'cascade in a real component context.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const codeStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Code)',
  fontSize: 'var(--Label-XS-FontSize)',
  color: 'var(--Text-Low)',
};

function labelForRole(role: string): string {
  if (role === 'brand-bg') return 'Brand-Bg';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

const BG_VARIANTS = ['Minimal', 'Subtle', 'Bold'] as const;

function Swatch({ token }: { token: string }) {
  return (
    <div
      style={{
        height: 56,
        borderRadius: 'var(--Shape-2-5)',
        background: `var(${token}, var(--Surface-Subtle))`,
        border: '1px solid var(--Border-Subtle, transparent)',
      }}
      title={`var(${token})`}
    />
  );
}

export const BackgroundGrid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every appearance role paired with its three BG surface tokens ' +
          '(Minimal / Subtle / Bold). Unconfigured roles fall back to ' +
          '`--Surface-Subtle` so empty cells are still visible.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <header>
        <h2
          style={{
            margin: 0,
            fontSize: 'var(--Title-M-FontSize)',
            lineHeight: 'var(--Title-M-LineHeight)',
            color: 'var(--Text-High)',
          }}
        >
          Background surfaces by role
        </h2>
        <p
          style={{
            margin: 'var(--Spacing-2-5) 0 0',
            fontSize: 'var(--Body-S-FontSize)',
            color: 'var(--Text-Medium)',
          }}
        >
          Container background tokens for each appearance role. Switch
          Brand / Theme in the toolbar to see the cascade react.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(3, 1fr)',
          gap: 'var(--Spacing-3-5)',
          alignItems: 'center',
        }}
      >
        <div />
        {BG_VARIANTS.map((v) => (
          <code key={v} style={{ ...codeStyle, textAlign: 'center' }}>{v}</code>
        ))}
        {APPEARANCE_ROLES.map((role) => (
          <React.Fragment key={role}>
            <code style={codeStyle}>{role}</code>
            {BG_VARIANTS.map((variant) => (
              <Swatch
                key={`${role}-${variant}`}
                token={`--${labelForRole(role)}-${variant}`}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  ),
};

export const ButtonsByRole: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The Button component rendered with each appearance role, for ' +
          'all three variants. Verifies the multi-accent cascade ' +
          'end-to-end — role tokens resolve through the same pipeline ' +
          'components consume.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <header>
        <h2
          style={{
            margin: 0,
            fontSize: 'var(--Title-M-FontSize)',
            color: 'var(--Text-High)',
          }}
        >
          Buttons × appearance
        </h2>
        <p
          style={{
            margin: 'var(--Spacing-2-5) 0 0',
            fontSize: 'var(--Body-S-FontSize)',
            color: 'var(--Text-Medium)',
          }}
        >
          The <code>appearance</code> prop drives role token resolution at
          render time.
        </p>
      </header>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(3, auto)',
          gap: 'var(--Spacing-3-5)',
          alignItems: 'center',
        }}
      >
        <div />
        <code style={{ ...codeStyle, textAlign: 'center' }}>bold</code>
        <code style={{ ...codeStyle, textAlign: 'center' }}>subtle</code>
        <code style={{ ...codeStyle, textAlign: 'center' }}>ghost</code>
        {APPEARANCE_ROLES.map((role) => (
          <React.Fragment key={role}>
            <code style={codeStyle}>{role}</code>
            {(['bold', 'subtle', 'ghost'] as const).map((variant) => (
              <Button
                key={`${role}-${variant}`}
                variant={variant}
                appearance={role as never}
                size="small"
              >
                {labelForRole(role)}
              </Button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  ),
};
