/**
 * Foundations / Surfaces
 *
 * Read-only visualization of surface modes and how they stack on top of
 * each other. Every cell is wrapped in `<Surface>` so `[data-surface]`
 * token remapping runs exactly as in production.
 *
 * Focus is on BACKGROUND container surfaces (BG-*) and the bold-inversion
 * cascade triggered by `bg-bold`. Foreground component-fill modes are
 * covered in the component stories, not here.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Surface } from '@oneui/ui/components/Surface';
import { Button } from '@oneui/ui/components/Button';

const meta: Meta = {
  title: 'Foundations/Surfaces',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Surface-context-aware visualization. Every cell is wrapped in ' +
          '`<Surface mode="...">` so the `[data-surface]` cascade runs and ' +
          'nested components adapt exactly as they would in production.',
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

// Container-tier modes used in the stacking demos. `elevated` is excluded
// because it represents a floating drop-shadow surface, not a containment
// level (showcased separately). `ghost` and `moderate` are omitted for
// brevity — they add noise to the nested demo without new information.
const BG_MODES = ['default', 'minimal', 'subtle', 'bold'] as const;

const MODE_DESCRIPTIONS: Record<string, string> = {
  default: 'Page background. No surface override.',
  'minimal': 'Container — lightest tint.',
  'subtle': 'Container — subtle tint.',
  'bold': 'Container — bold accent. Triggers on-bold inversion.',
  elevated: 'Floating surface (cards, sheets). Uses drop shadow — not a containment level.',
};

// ─── AllModes — each BG mode as a standalone cell ─────────────────────────

export const AllModes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <header>
        <h2 style={sectionTitle}>Background surface modes</h2>
        <p style={sectionDescription}>
          All BG-family container modes. Each cell is a{' '}
          <code>&lt;Surface&gt;</code> with a sample Button group so you
          can see the <code>[data-surface]</code> cascade adapt the
          nested components. <code>elevated</code> is shown inside the
          Nested Stacking story because it is a drop-shadow surface, not
          a containment level.
        </p>
      </header>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 'var(--Spacing-4-5)',
        }}
      >
        {BG_MODES.map((mode) => (
          <Surface
            key={mode}
            mode={mode}
            style={{
              padding: 'var(--Spacing-4-5)',
              borderRadius: 'var(--Shape-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--Spacing-3-5)',
              minHeight: 160,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
              <span
                style={{
                  fontSize: 'var(--Label-S-FontSize)',
                  fontFamily: 'var(--Typography-Font-Code)',
                  color: 'var(--Text-High)',
                }}
              >
                {`mode="${mode}"`}
              </span>
              <span
                style={{
                  fontSize: 'var(--Body-XS-FontSize)',
                  lineHeight: 'var(--Body-XS-LineHeight)',
                  color: 'var(--Text-Medium)',
                }}
              >
                {MODE_DESCRIPTIONS[mode]}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 'var(--Spacing-3)',
                flexWrap: 'wrap',
                marginTop: 'auto',
              }}
            >
              <Button variant="bold" size="small">Bold</Button>
              <Button variant="subtle" size="small">Subtle</Button>
              <Button variant="ghost" size="small">Ghost</Button>
            </div>
          </Surface>
        ))}
      </div>
    </div>
  ),
};

// ─── NestedStacking — real containment stacking (elevated excluded) ───────

const NEST_ORDER: ReadonlyArray<(typeof BG_MODES)[number]> = [
  'default',
  'minimal',
  'subtle',
  'bold',
];

function NestedStack({
  order,
}: {
  order: ReadonlyArray<(typeof BG_MODES)[number]>;
}) {
  if (order.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          gap: 'var(--Spacing-3)',
          flexWrap: 'wrap',
          padding: 'var(--Spacing-3-5) 0 0',
        }}
      >
        <Button variant="bold" size="small">Bold</Button>
        <Button variant="subtle" size="small">Subtle</Button>
        <Button variant="ghost" size="small">Ghost</Button>
      </div>
    );
  }
  const [head, ...rest] = order;
  return (
    <Surface
      mode={head}
      style={{
        padding: 'var(--Spacing-4-5)',
        borderRadius: 'var(--Shape-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-3-5)',
      }}
    >
      <code style={codeStyle}>{`mode="${head}"`}</code>
      <NestedStack order={rest} />
    </Surface>
  );
}

export const NestedStacking: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Real surface stacking — each mode is rendered INSIDE the ' +
          'previous one, not side by side. default → minimal → ' +
          'subtle → bold. `elevated` is intentionally excluded; ' +
          'it represents a floating drop-shadow surface, not a ' +
          'containment level, and is showcased separately below.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      <header>
        <h2 style={sectionTitle}>Nested stacking</h2>
        <p style={sectionDescription}>
          Surfaces nested four levels deep. Each layer is a{' '}
          <code>&lt;Surface&gt;</code> wrapping the next, so children
          always inherit the correct remapped tokens.
        </p>
      </header>
      <NestedStack order={NEST_ORDER} />

      {/* Elevated as a standalone floating surface, not part of the stack */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        <header>
          <h3
            style={{
              margin: 0,
              fontSize: 'var(--Title-S-FontSize)',
              color: 'var(--Text-High)',
            }}
          >
            Elevated (floating)
          </h3>
          <p style={sectionDescription}>
            <code>elevated</code> is a drop-shadow surface — a floating
            card or sheet that sits above its parent, not inside it.
            Shown separately so nobody confuses it with a containment
            level.
          </p>
        </header>
        <Surface
          mode="elevated"
          style={{
            padding: 'var(--Spacing-4-5)',
            borderRadius: 'var(--Shape-4)',
            boxShadow:
              'var(--Elevation-Level-2, 0 8px 24px rgba(0, 0, 0, 0.12))',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--Spacing-3-5)',
            maxWidth: 360,
          }}
        >
          <code style={codeStyle}>{`mode="elevated"`}</code>
          <span
            style={{
              fontSize: 'var(--Body-S-FontSize)',
              color: 'var(--Text-Medium)',
            }}
          >
            Floating card with drop shadow.
          </span>
          <div
            style={{
              display: 'flex',
              gap: 'var(--Spacing-3)',
              flexWrap: 'wrap',
            }}
          >
            <Button variant="bold" size="small">Bold</Button>
            <Button variant="subtle" size="small">Subtle</Button>
            <Button variant="ghost" size="small">Ghost</Button>
          </div>
        </Surface>
      </section>
    </div>
  ),
};

// ─── OnBoldInversion — only default ↔ bg-bold, Bold removed per req ────

export const OnBoldInversion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the bold-inversion rule: on a `bg-bold` surface, ' +
          'bold buttons remap to the tinted accent and ghost buttons flip ' +
          'to the on-colour text token — all via CSS-only cascade. Default ' +
          'is shown alongside for comparison.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {(['default', 'bold'] as const).map((mode) => (
        <Surface
          key={mode}
          mode={mode}
          style={{
            padding: 'var(--Spacing-5)',
            borderRadius: 'var(--Shape-4-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--Spacing-4)',
          }}
        >
          <code style={codeStyle}>{`<Surface mode="${mode}">`}</code>
          <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap' }}>
            <Button variant="bold">Bold</Button>
            <Button variant="subtle">Subtle</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </Surface>
      ))}
    </div>
  ),
};
