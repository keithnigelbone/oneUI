/**
 * Foundations / Typography
 *
 * Read-only visualization of the current brand's resolved typography tokens.
 *
 * - Renders every role×size pair (27 tokens) using the live CSS cascade —
 *   each sample inherits from `--{Role}-{Size}-FontSize` / `-LineHeight` etc.
 *   so the preview reacts automatically to brand / platform / density /
 *   theme switches driven by the unified toolbar addon.
 * - Pulls the role→size mapping from `@oneui/shared` (the single source of
 *   truth used by the typography engine), so adding a new size in the data
 *   module immediately shows up here with no code changes.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  TYPOGRAPHY_ROLES,
  TYPOGRAPHY_SIZES,
  DEFAULT_FSTEP_ASSIGNMENTS,
  DEFAULT_LINE_HEIGHT_OFFSETS,
  type TypographyRole,
} from '@oneui/shared';

const meta: Meta = {
  title: 'Foundations/Typography',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Live visualization of all 25 typography tokens across 6 roles ' +
          '(Display / Headline / Title / Body / Label / Code). Every sample ' +
          'reads `--{Role}-{Size}-FontSize` etc. directly from the cascade ' +
          'so it always reflects the selected brand, platform, and density.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const ROLE_LABELS: Record<TypographyRole, string> = {
  display: 'Display',
  headline: 'Headline',
  title: 'Title',
  body: 'Body',
  label: 'Label',
  code: 'Code',
};

const ROLE_DESCRIPTIONS: Record<TypographyRole, string> = {
  display: 'Hero / marketing moments. Brand-customizable f-steps.',
  headline: 'Section introductions. Brand-customizable f-steps.',
  title: 'Sub-section titles with +1 line-height offset.',
  body: 'Long-form content. Emphasis weights, +3 line-height offset.',
  label: 'UI labels and captions. Eight sizes, including 3XS.',
  code: 'Monospace code samples. Uses `--Typography-Font-Code`.',
};

function ROLE_STYLE(role: TypographyRole): React.CSSProperties {
  if (role === 'code') {
    return { fontFamily: 'var(--Typography-Font-Code)' };
  }
  // Honour brand role-to-slot mapping: e.g. Reliance maps Display+Headline to
  // the Secondary slot so headlines render in Playfair Display while body stays
  // on Primary. Without these explicit fontFamily reads, the sample inherits
  // whatever ambient font-family is set, defeating per-role customisation.
  return { fontFamily: `var(--${ROLE_LABELS[role]}-FontFamily, var(--Typography-Font-Text))` };
}

function sampleText(role: TypographyRole, size: string): string {
  if (role === 'code') return `const { tokens } = useDesignSystem();`;
  return `${ROLE_LABELS[role]} ${size} — the quick brown fox`;
}

function RoleBlock({ role }: { role: TypographyRole }) {
  const sizes = TYPOGRAPHY_SIZES[role] as readonly string[];
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4-5)',
        paddingBottom: 'var(--Spacing-6)',
        borderBottom: '1px solid var(--Border-Subtle, var(--Surface-Subtle))',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <h2
          style={{
            margin: 0,
            fontSize: 'var(--Title-M-FontSize)',
            lineHeight: 'var(--Title-M-LineHeight)',
            fontWeight: 'var(--Title-M-FontWeight, 700)',
            color: 'var(--Text-High)',
          }}
        >
          {ROLE_LABELS[role]}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--Body-S-FontSize)',
            lineHeight: 'var(--Body-S-LineHeight)',
            color: 'var(--Text-Medium)',
          }}
        >
          {ROLE_DESCRIPTIONS[role]}
          {' '}Line-height offset: {DEFAULT_LINE_HEIGHT_OFFSETS[role]}.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        {sizes.map((size) => {
          const token = `--${ROLE_LABELS[role]}-${size}`;
          const fStep = DEFAULT_FSTEP_ASSIGNMENTS[role]?.[size] ?? '—';
          return (
            <div
              key={size}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                gap: 'var(--Spacing-4-5)',
                alignItems: 'baseline',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--Spacing-1-5)',
                  color: 'var(--Text-Low)',
                  fontSize: 'var(--Label-XS-FontSize)',
                  lineHeight: 'var(--Label-XS-LineHeight)',
                  fontFamily: 'var(--Typography-Font-Code)',
                }}
              >
                <span>{`${role}.${size}`}</span>
                <span style={{ opacity: 0.7 }}>{`${token}-FontSize`}</span>
                <span style={{ opacity: 0.7 }}>{`→ ${fStep}`}</span>
              </div>
              <div
                style={{
                  fontSize: `var(${token}-FontSize)`,
                  lineHeight: `var(${token}-LineHeight)`,
                  fontWeight:
                    role === 'display' || role === 'headline' || role === 'title'
                      ? `var(${token}-FontWeight, 700)`
                      : `var(--${ROLE_LABELS[role]}-FontWeight-High, 700)`,
                  color: 'var(--Text-High)',
                  ...ROLE_STYLE(role),
                }}
              >
                {sampleText(role, size)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export const AllRoles: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-7)' }}>
      {TYPOGRAPHY_ROLES.map((role) => (
        <RoleBlock key={role} role={role} />
      ))}
    </div>
  ),
};

export const Weights: Story = {
  render: () => {
    const rows: Array<{ role: 'Body' | 'Label' | 'Code'; emphasis: 'High' | 'Medium' | 'Low'; sample: string }> = [];
    (['Body', 'Label', 'Code'] as const).forEach((role) => {
      (['High', 'Medium', 'Low'] as const).forEach((emphasis) => {
        rows.push({
          role,
          emphasis,
          sample:
            role === 'Code'
              ? 'const value = resolveToken(name);'
              : 'The quick brown fox jumps over the lazy dog',
        });
      });
    });
    return (
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
            Font weights
          </h2>
          <p
            style={{
              fontSize: 'var(--Body-S-FontSize)',
              color: 'var(--Text-Medium)',
              margin: 'var(--Spacing-2-5) 0 0',
            }}
          >
            Body / Label / Code roles use High / Medium / Low emphasis
            weights, rendered one per row.
          </p>
        </header>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
          {rows.map(({ role, emphasis, sample }) => (
            <div
              key={`${role}-${emphasis}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                alignItems: 'baseline',
                gap: 'var(--Spacing-4-5)',
                padding: 'var(--Spacing-3-5) 0',
                borderBottom: '1px solid var(--Border-Subtle, var(--Surface-Subtle))',
              }}
            >
              <code
                style={{
                  fontFamily: 'var(--Typography-Font-Code)',
                  fontSize: 'var(--Label-XS-FontSize)',
                  color: 'var(--Text-Low)',
                }}
              >
                {`${role} / ${emphasis}`}
              </code>
              <span
                style={{
                  fontSize: 'var(--Body-L-FontSize)',
                  lineHeight: 'var(--Body-L-LineHeight)',
                  fontWeight: `var(--${role}-FontWeight-${emphasis})`,
                  color: 'var(--Text-High)',
                  fontFamily: role === 'Code' ? 'var(--Typography-Font-Code)' : undefined,
                }}
              >
                {sample}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const FontSlots: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      <header>
        <h2
          style={{
            margin: 0,
            fontSize: 'var(--Title-M-FontSize)',
            lineHeight: 'var(--Title-M-LineHeight)',
            color: 'var(--Text-High)',
          }}
        >
          Font slots
        </h2>
        <p
          style={{
            fontSize: 'var(--Body-S-FontSize)',
            color: 'var(--Text-Medium)',
            margin: 'var(--Spacing-2-5) 0 0',
          }}
        >
          Four font families drive the entire typography system: Body (UI workhorse),
          Display (editorial), Script (accent), and Code (monospace).
        </p>
      </header>
      {[
        { label: 'Body', token: '--Typography-Font-Text' },
        { label: 'Display', token: '--Typography-Font-Heading' },
        { label: 'Script', token: '--Typography-Font-Script' },
        { label: 'Code', token: '--Typography-Font-Code' },
      ].map(({ label, token }) => (
        <div
          key={label}
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            gap: 'var(--Spacing-4-5)',
            alignItems: 'baseline',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--Spacing-1-5)',
              color: 'var(--Text-Low)',
              fontSize: 'var(--Label-XS-FontSize)',
              fontFamily: 'var(--Typography-Font-Code)',
            }}
          >
            <span>{label}</span>
            <span style={{ opacity: 0.7 }}>{`var(${token})`}</span>
          </div>
          <span
            style={{
              fontFamily: `var(${token})`,
              fontSize: 'var(--Display-S-FontSize)',
              lineHeight: 'var(--Display-S-LineHeight)',
              color: 'var(--Text-High)',
            }}
          >
            The quick brown fox jumps over the lazy dog
          </span>
        </div>
      ))}
    </div>
  ),
};
