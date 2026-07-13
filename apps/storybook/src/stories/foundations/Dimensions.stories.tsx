/**
 * Foundations / Dimensions
 *
 * Read-only visualization of the dimension, spacing, negative spacing, and
 * grid tokens for the currently selected Storybook platform × density. Every
 * row reads the live CSS custom property and resolves the value through
 * `getComputedStyle`.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { DIMENSION_SPACING_TOKENS, F_STEPS, NEGATIVE_SPACING_TOKENS } from '@oneui/shared';
import { useResolvedVar } from './_useResolvedVar';

const meta: Meta = {
  title: 'Foundations/Dimensions',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Dimension, spacing, negative spacing, and grid tokens read from ' +
          'the live Storybook cascade. Use the Storybook platform and density ' +
          'toolbar controls to switch contexts; these stories do not apply ' +
          'local density overrides, so the displayed values stay accurate.',
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

const sectionNote: React.CSSProperties = {
  margin: 'var(--Spacing-3) 0 0',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  color: 'var(--Text-Low)',
};

const DIMENSION_STEPS = [
  ...F_STEPS.slice(0, F_STEPS.indexOf('f3')),
  'f2-5',
  ...F_STEPS.slice(F_STEPS.indexOf('f3')),
] as const;

function cssTokenName(value: string): string {
  return value.replace('.', '-');
}

// ─── Row primitive: label | var | resolved | bar ──────────────────────────

function TokenRow({
  label,
  varName,
  barMinHeight = 'var(--Dimension-f0)',
}: {
  label: string;
  varName: string;
  barMinHeight?: string;
}) {
  const [ref, resolved] = useResolvedVar(varName);
  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 200px 80px 1fr',
        alignItems: 'center',
        gap: 'var(--Spacing-4-5)',
        padding: 'var(--Spacing-2-5) 0',
      }}
    >
      <code style={codeStyle}>{label}</code>
      <code style={codeStyle}>{`var(${varName})`}</code>
      <span style={valueStyle}>{resolved || '—'}</span>
      <div
        style={{
          width: `var(${varName})`,
          height: barMinHeight,
          minHeight: 4,
          background: 'var(--Primary-Bold, var(--Surface-Bold))',
          borderRadius: 'var(--Shape-2)',
        }}
      />
    </div>
  );
}

// ─── Dimension scale ──────────────────────────────────────────────────────

export const FStepScale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      <header>
        <h2 style={sectionTitle}>Dimension scale</h2>
        <p style={sectionDescription}>
          f-8 through f16 plus the f2-5 midpoint used by spacing 5.5.
          Values resolve from the current Storybook platform × density. Change
          density globally in the toolbar to compare compact, default, and open
          without mixing local overrides into the row values.
        </p>
        <p style={sectionNote}>
          Spacing aliases point to this scale; density changes the resolved
          dimension values, not the alias mapping.
        </p>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        {DIMENSION_STEPS.map((step) => (
          <TokenRow
            key={step}
            label={step}
            varName={`--Dimension-${step}`}
          />
        ))}
      </div>
    </div>
  ),
};

// ─── Spacing tokens ───────────────────────────────────────────────────────

export const SpacingTokens: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      <header>
        <h2 style={sectionTitle}>Spacing tokens</h2>
        <p style={sectionDescription}>
          Numeric spacing tokens mirror the foundation scale: 0, 0.5, 1,
          1.5, and up to 40. Each token is a direct alias over the dimension
          scale and resolves through the active Storybook platform × density.
        </p>
        <p style={sectionNote}>
          Use the global density control in the Storybook toolbar to view
          compact, default, or open values. The story intentionally avoids
          local density selectors so each row reads the same cascade as
          components.
        </p>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        {DIMENSION_SPACING_TOKENS.map((name) => (
          <TokenRow
            key={name}
            label={`Spacing-${name}`}
            varName={`--Spacing-${cssTokenName(name)}`}
          />
        ))}
      </div>
    </div>
  ),
};

// ─── Negative spacing tokens ──────────────────────────────────────────────

function NegativeTokenRow({ name }: { name: string }) {
  const positiveVar = `--Spacing-${cssTokenName(name)}`;
  const negativeVar = `--Spacing-Negative-${cssTokenName(name)}`;
  const [ref, resolved] = useResolvedVar(negativeVar);

  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 220px 96px 1fr',
        alignItems: 'center',
        gap: 'var(--Spacing-4-5)',
        padding: 'var(--Spacing-2-5) 0',
      }}
    >
      <code style={codeStyle}>{`Spacing-${name}`}</code>
      <code style={codeStyle}>{`var(${negativeVar})`}</code>
      <span style={valueStyle}>{resolved || '—'}</span>
      <code style={codeStyle}>{`calc(var(${positiveVar}) * -1)`}</code>
    </div>
  );
}

export const NegativeSpacingTokens: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      <header>
        <h2 style={sectionTitle}>Negative spacing tokens</h2>
        <p style={sectionDescription}>
          Negative spacing tokens are first-class CSS variables for intentional
          offsets and overlap. They mirror the positive numeric spacing subset
          from 0.5 through 8 with a negative sign.
        </p>
        <p style={sectionNote}>
          The formula column shows the alias relationship. The resolved value
          still comes from the live CSS variable, so global density changes
          update the positive and negative values together.
        </p>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        {NEGATIVE_SPACING_TOKENS.map((name) => (
          <NegativeTokenRow key={name} name={name} />
        ))}
      </div>
    </div>
  ),
};

// ─── Grid tokens ──────────────────────────────────────────────────────────

export const GridTokens: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      <header>
        <h2 style={sectionTitle}>Grid tokens</h2>
        <p style={sectionDescription}>
          <code>--Grid-Margin</code> and <code>--Grid-Gutter</code> are
          derived from the same platform × density foundation scale. Values
          below are read from the current Storybook toolbar context.
        </p>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <TokenRow label="Grid-Margin" varName="--Grid-Margin" />
        <TokenRow label="Grid-Gutter" varName="--Grid-Gutter" />
      </div>
    </div>
  ),
};

// ─── Current context summary ──────────────────────────────────────────────

export const CurrentContextScale: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A compact view of the current Storybook platform × density. ' +
          'This story intentionally does not render local density columns, ' +
          'because local density scopes can be confused with the global ' +
          'toolbar density. Change density in the toolbar to keep every ' +
          'displayed value on the same cascade.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      <header>
        <h2 style={sectionTitle}>Current platform × density scale</h2>
        <p style={sectionDescription}>
          These are the most commonly audited dimension, spacing, and grid
          values for the current Storybook context. Use the toolbar to change
          platform or density, then all rows update together.
        </p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <TokenRow label="Dimension-f0" varName="--Dimension-f0" />
        <TokenRow label="Dimension-f2-5" varName="--Dimension-f2-5" />
        <TokenRow label="Spacing-4" varName="--Spacing-4" />
        <TokenRow label="Spacing-5-5" varName="--Spacing-5-5" />
        <TokenRow label="Spacing-8" varName="--Spacing-8" />
        <TokenRow label="Grid-Margin" varName="--Grid-Margin" />
        <TokenRow label="Grid-Gutter" varName="--Grid-Gutter" />
      </section>
    </div>
  ),
};
