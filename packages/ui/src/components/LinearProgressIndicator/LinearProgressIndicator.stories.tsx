/**
 * LinearProgressIndicator.stories.tsx
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { LinearProgressIndicator } from './LinearProgressIndicator';
import type { LinearProgressIndicatorAppearance } from './LinearProgressIndicator.shared';
import { Surface } from '../Surface/Surface';
const barWidth: React.CSSProperties = { width: 'var(--Spacing-40)' };

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontFamily: 'var(--Typography-Font-Primary)',
  color: 'var(--Text-Medium)',
};

const meta: Meta<typeof LinearProgressIndicator> = {
  title: 'Components/Feedback/LinearProgressIndicator',
  component: LinearProgressIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A horizontal bar that communicates progress either as a known percentage (determinate) or as ongoing activity with no defined end (indeterminate). Supports S/M/L sizes, pill or flat caps, and multi-accent appearance roles.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={barWidth}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: {
      control: 'radio',
      options: ['determinate', 'indeterminate'],
      table: { defaultValue: { summary: 'determinate' } },
    },
    size: {
      control: 'radio',
      options: ['S', 'M', 'L'],
      table: { defaultValue: { summary: 'M' } },
    },
    appearance: {
      control: 'select',
      options: [
        'auto',
        'neutral',
        'primary',
        'secondary',
        'sparkle',
        'negative',
        'positive',
        'warning',
        'informative',
      ],
      table: { defaultValue: { summary: 'primary' } },
    },
    roundCaps: {
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: { defaultValue: { summary: '0' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LinearProgressIndicator>;

export const Default: Story = {
  args: {
    type: 'determinate',
    size: 'M',
    appearance: 'primary',
    roundCaps: true,
    value: 60,
    'aria-label': 'Task progress',
  },
};

export const Determinate: Story = {
  name: 'Determinate',
  args: {
    type: 'determinate',
    value: 75,
    'aria-label': 'Determinate progress',
  },
};

export const Indeterminate: Story = {
  name: 'Indeterminate',
  args: {
    type: 'indeterminate',
    value: 80,
    'aria-label': 'Loading',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Continuous loading animation. The `value` control is ignored — the bar is a sliding segment, not a percentage fill.',
      },
    },
  },
};

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)', ...barWidth }}>
      {(['S', 'M', 'L'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
          <LinearProgressIndicator size={size} value={55} aria-label={`Size ${size}`} />
          <span style={labelStyle}>{size}</span>
        </div>
      ))}
    </div>
  ),
};

const APPEARANCES: LinearProgressIndicatorAppearance[] = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

export const Appearances: Story = {
  name: 'Appearances',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)', ...barWidth }}>
      {APPEARANCES.map((appearance) => (
        <div key={appearance} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
          <LinearProgressIndicator appearance={appearance} value={65} aria-label={appearance} />
          <span style={labelStyle}>{appearance}</span>
        </div>
      ))}
    </div>
  ),
};

export const RoundCaps: Story = {
  name: 'Round Caps',
  args: {
    roundCaps: true,
    value: 45,
    'aria-label': 'Round caps',
  },
};

export const FlatCaps: Story = {
  name: 'Flat Caps',
  args: {
    roundCaps: false,
    value: 45,
    'aria-label': 'Flat caps',
  },
};

export const ProgressValues: Story = {
  name: 'Progress Values',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)', ...barWidth }}>
      {[0, 25, 50, 75, 100].map((value) => (
        <div key={value} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
          <LinearProgressIndicator value={value} aria-label={`${value} percent`} />
          <span style={labelStyle}>{value}%</span>
        </div>
      ))}
    </div>
  ),
};

export const SurfaceContext: Story = {
  name: 'Surface Context',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-5)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {(['default', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'] as const).map((mode) => (
        <div
          key={mode}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--Spacing-2)',
            width: '100%',
            minWidth: 0,
          }}
        >
          <span style={labelStyle}>{mode}</span>
          <Surface
            mode={mode}
            appearance="secondary"
            style={{
              padding: 'var(--Spacing-4)',
              borderRadius: 'var(--Shape-L)',
              width: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--Spacing-3)',
                width: '100%',
                minWidth: 0,
              }}
            >
              <LinearProgressIndicator
                type="determinate"
                appearance="secondary"
                value={60}
                aria-label={`Determinate on ${mode}`}
              />
              <LinearProgressIndicator
                type="indeterminate"
                appearance="secondary"
                aria-label={`Indeterminate on ${mode}`}
              />
            </div>
          </Surface>
        </div>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)', width: 'var(--Spacing-48)' }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <span style={labelStyle}>Determinate · round caps · sizes</span>
        {(['S', 'M', 'L'] as const).map((size) => (
          <LinearProgressIndicator key={size} size={size} value={60} aria-label={`Det ${size}`} />
        ))}
      </section>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <span style={labelStyle}>Determinate · flat caps · sizes</span>
        {(['S', 'M', 'L'] as const).map((size) => (
          <LinearProgressIndicator
            key={`det-flat-${size}`}
            size={size}
            roundCaps={false}
            value={60}
            aria-label={`Det flat ${size}`}
          />
        ))}
      </section>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <span style={labelStyle}>Indeterminate · round caps · sizes</span>
        {(['S', 'M', 'L'] as const).map((size) => (
          <LinearProgressIndicator
            key={`ind-round-${size}`}
            type="indeterminate"
            size={size}
            aria-label={`Ind round ${size}`}
          />
        ))}
      </section>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <span style={labelStyle}>Indeterminate · flat caps · sizes</span>
        {(['S', 'M', 'L'] as const).map((size) => (
          <LinearProgressIndicator
            key={`ind-flat-${size}`}
            type="indeterminate"
            size={size}
            roundCaps={false}
            aria-label={`Ind flat ${size}`}
          />
        ))}
      </section>
    </div>
  ),
};
