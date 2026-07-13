/**
 * Foundations / Density
 *
 * Compact → Default → Open comparison at the current platform. Each
 * column scopes BOTH `data-Breakpoint` (live from `<html>`) AND
 * `data-6-Density` together so scale.css's selector matches — without
 * that, every column inherits the same values.
 *
 * Resolved pixel values are read from `getComputedStyle` per row.
 * Ordering is always compact → default → open so the growth is visible.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { F_STEPS } from '@oneui/shared';
import { useCurrentPlatform } from './_useCurrentPlatform';
import { useResolvedVar } from './_useResolvedVar';

const meta: Meta = {
  title: 'Foundations/Density',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Compact → default → open rendered side-by-side at the current ' +
          'platform. Density shifts the f-step scale ±1 step, so swatches ' +
          'compress or expand across the columns.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const DENSITY_ORDER = ['compact', 'default', 'open'] as const;
type Density = (typeof DENSITY_ORDER)[number];

const DENSITY_LABELS: Record<Density, string> = {
  compact: 'Compact',
  default: 'Default',
  open: 'Open',
};

const codeStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Code)',
  fontSize: 'var(--Label-XS-FontSize)',
  color: 'var(--Text-Low)',
};

const valueStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Code)',
  fontSize: 'var(--Label-S-FontSize)',
  color: 'var(--Text-High)',
  fontWeight: 600,
  textAlign: 'right',
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--Title-M-FontSize)',
  lineHeight: 'var(--Title-M-LineHeight)',
  color: 'var(--Text-High)',
};

const sectionDescription: React.CSSProperties = {
  margin: 'var(--Spacing-2-5) 0 0',
  fontSize: 'var(--Body-S-FontSize)',
  color: 'var(--Text-Medium)',
};

// ─── Column: scopes platform + density together ───────────────────────────

function DensityColumn({
  density,
  platform,
  children,
}: {
  density: Density;
  platform: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-Breakpoint={platform}
      data-6-Density={density}
      data-density={density}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4-5)',
        padding: 'var(--Spacing-5)',
        borderRadius: 'var(--Shape-4)',
        background: 'var(--Surface-Subtle)',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span
          style={{
            fontSize: 'var(--Title-S-FontSize)',
            lineHeight: 'var(--Title-S-LineHeight)',
            color: 'var(--Text-High)',
          }}
        >
          {DENSITY_LABELS[density]}
        </span>
        <code style={codeStyle}>{`data-6-Density="${density}"`}</code>
      </header>
      {children}
    </div>
  );
}

// ─── Spacing row inside a density column — label + value + bar ────────────

function SpacingRow({ step }: { step: string }) {
  const [ref, resolved] = useResolvedVar(`--Dimension-${step}`);
  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: '48px 64px 1fr',
        alignItems: 'center',
        gap: 'var(--Spacing-3-5)',
      }}
    >
      <code style={codeStyle}>{step}</code>
      <span style={valueStyle}>{resolved || '—'}</span>
      <div
        style={{
          width: `var(--Dimension-${step})`,
          height: `var(--Dimension-${step})`,
          minWidth: 2,
          minHeight: 2,
          background: 'var(--Primary-Bold, var(--Surface-Bold))',
          borderRadius: 'var(--Shape-2)',
          flexShrink: 0,
        }}
      />
    </div>
  );
}

// ─── Spacing story ────────────────────────────────────────────────────────

export const SpacingSideBySide: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Dimension f-steps rendered as squares in compact → default → ' +
          'open order. Resolved pixel values per row so you can see the ' +
          "exact numbers at each density. Platform is read live from " +
          'the toolbar.',
      },
    },
  },
  render: () => {
    const platform = useCurrentPlatform();
    const FOCUS_STEPS = ['f-2', 'f0', 'f2', 'f4', 'f6'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
        <header>
          <h2 style={sectionTitle}>Spacing — density comparison</h2>
          <p style={sectionDescription}>
            Each column scopes <code>data-Breakpoint</code> +{' '}
            <code>data-6-Density</code> together so the cascade actually
            applies. Values read live from <code>getComputedStyle</code>.
          </p>
        </header>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--Spacing-5)',
          }}
        >
          {DENSITY_ORDER.map((density) => (
            <DensityColumn key={density} density={density} platform={platform}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
                {FOCUS_STEPS.map((step) => (
                  <SpacingRow key={step} step={step} />
                ))}
              </div>
            </DensityColumn>
          ))}
        </div>
      </div>
    );
  },
};

// ─── Typography row inside a density column ───────────────────────────────

function TypeRow({ label, token }: { label: string; token: string }) {
  const [ref, resolved] = useResolvedVar(`${token}-FontSize`);
  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-1-5)',
        paddingBottom: 'var(--Spacing-3)',
        borderBottom: '1px solid var(--Border-Subtle, var(--Surface-Main))',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--Spacing-3-5)' }}>
        <code style={codeStyle}>{label}</code>
        <span style={valueStyle}>{resolved || '—'}</span>
      </div>
      <span
        style={{
          fontSize: `var(${token}-FontSize)`,
          lineHeight: `var(${token}-LineHeight)`,
          color: 'var(--Text-High)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Typography story ─────────────────────────────────────────────────────

export const TypographySideBySide: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Typography ladder at each density (compact → default → open). ' +
          'Type sizes follow the dimension scale so compact text is a ' +
          'full f-step smaller. Resolved font sizes shown per row.',
      },
    },
  },
  render: () => {
    const platform = useCurrentPlatform();
    const TYPE_SAMPLES: Array<{ label: string; token: string }> = [
      { label: 'Display M', token: '--Display-M' },
      { label: 'Headline M', token: '--Headline-M' },
      { label: 'Title M', token: '--Title-M' },
      { label: 'Body L', token: '--Body-L' },
      { label: 'Body M', token: '--Body-M' },
      { label: 'Body S', token: '--Body-S' },
      { label: 'Label S', token: '--Label-S' },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
        <header>
          <h2 style={sectionTitle}>Typography — density comparison</h2>
          <p style={sectionDescription}>
            Same type ladder, three densities. Values are live resolved
            font sizes from the cascade.
          </p>
        </header>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--Spacing-5)',
          }}
        >
          {DENSITY_ORDER.map((density) => (
            <DensityColumn key={density} density={density} platform={platform}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
                {TYPE_SAMPLES.map(({ label, token }) => (
                  <TypeRow key={label} label={label} token={token} />
                ))}
              </div>
            </DensityColumn>
          ))}
        </div>
      </div>
    );
  },
};

// ─── Full f-step × density matrix as stacked rows ─────────────────────────

function MatrixRow({
  step,
  density,
  platform,
}: {
  step: string;
  density: Density;
  platform: string;
}) {
  const [ref, resolved] = useResolvedVar(`--Dimension-${step}`);
  return (
    <div
      ref={ref}
      data-Breakpoint={platform}
      data-6-Density={density}
      data-density={density}
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 80px 80px 1fr',
        alignItems: 'center',
        gap: 'var(--Spacing-4-5)',
        padding: 'var(--Spacing-2-5) 0',
      }}
    >
      <code style={codeStyle}>{step}</code>
      <code style={codeStyle}>{density}</code>
      <span style={valueStyle}>{resolved || '—'}</span>
      <div
        style={{
          width: `var(--Dimension-${step})`,
          height: `var(--Dimension-${step})`,
          minWidth: 2,
          minHeight: 2,
          background: 'var(--Primary-Bold, var(--Surface-Bold))',
          borderRadius: 'var(--Shape-2)',
        }}
      />
    </div>
  );
}

export const FStepMatrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every f-step at every density, grouped compact → default → ' +
          'open. Each row scopes both data attributes and shows the ' +
          'resolved pixel value alongside the square swatch.',
      },
    },
  },
  render: () => {
    const platform = useCurrentPlatform();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
        <header>
          <h2 style={sectionTitle}>F-step × density</h2>
          <p style={sectionDescription}>
            Visual scale remapping: compact collapses one step, open
            expands one step. Values pulled live from the cascade.
          </p>
        </header>
        {DENSITY_ORDER.map((density) => (
          <section
            key={density}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 'var(--Title-S-FontSize)',
                color: 'var(--Text-High)',
              }}
            >
              {DENSITY_LABELS[density]}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
              {F_STEPS.map((step) => (
                <MatrixRow
                  key={`${density}-${step}`}
                  step={step}
                  density={density}
                  platform={platform}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  },
};
