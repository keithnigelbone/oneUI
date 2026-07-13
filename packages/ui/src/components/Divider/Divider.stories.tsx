/**
 * Divider.stories.tsx
 * Storybook documentation for Divider component
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import { Divider } from './Divider';
import { Surface } from '../Surface';
import React from 'react';
import { Icon } from '../Icon/Icon';
import {
  DividerSizes,
  DividerAttentionLevels,
  DividerAttentionWithIcon,
  DividerAttentionWithText,
  DividerWithIcon,
  DividerWithLabel,
  DividerVertical,
  DividerRoundCaps,
} from './Divider.showcase';

const meta = {
  title: 'Components/Layout/Divider',
  component: Divider,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { exclude: ['content'] },
    docs: {
      description: {
        component:
          'Visual separator for content sections. Supports orientation, size, attention levels, appearance roles, optional centre content via `children` (plain text, `<Icon />`, or `<Text />`), alignment, and round caps. Plain strings are auto-styled as Label XS Medium; Divider merges `appearance`, `attention`, and Figma sizing into child components when those props are unset.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 'var(--Spacing-18)', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: 'horizontal' } },
    },
    size: {
      control: 'radio',
      options: ['s', 'm', 'l'],
      description: 'Stroke width — S (hairline), M (thin), L (medium)',
      table: { defaultValue: { summary: 'm' } },
    },
    roundCaps: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    children: {
      control: 'text',
      description:
        'Optional centre content — plain string (auto-wrapped in Label XS Medium `<Text />`), `<Icon />`, or `<Text />`. Omit for a bare separator.',
      table: {
        type: { summary: 'ReactNode' },
        defaultValue: { summary: 'undefined' },
      },
    },
    contentAlign: {
      control: 'radio',
      options: ['center', 'start', 'end'],
      table: { defaultValue: { summary: 'center' } },
    },
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      table: { defaultValue: { summary: 'low' } },
    },
    appearance: {
      control: 'select',
      options: [
        'auto',
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'positive',
        'negative',
        'warning',
        'informative',
      ],
      description: "Multi-accent appearance role. 'auto' resolves to 'neutral'.",
      table: { defaultValue: { summary: 'auto' } },
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof Divider>;

/* ========================================
   1. Default — bare separator
   ======================================== */
export const Default: Story = {
  render: (args) => <Divider {...args} />,
};

/* ========================================
   2. Orientations
   ======================================== */
export const Orientations: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)', alignItems: 'stretch', height: 'var(--Spacing-18)', width: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ marginBottom: 'var(--Spacing-3-5)', color: 'var(--Text-Medium)' }}>Horizontal</p>
        <Divider orientation="horizontal" />
      </div>
      <Divider orientation="vertical" />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p style={{ color: 'var(--Text-Medium)' }}>Vertical</p>
      </div>
    </div>
  ),
};

/* ========================================
   3. Sizes
   ======================================== */
export const Sizes: Story = {
  decorators: [(Story) => <Story />],
  render: () => <DividerSizes />,
};

/* ========================================
   4. Attention Levels — bare
   ======================================== */
export const AttentionLevels: Story = {
  decorators: [(Story) => <Story />],
  render: () => <DividerAttentionLevels />,
};

/* ========================================
   4b. Attention Levels × Icon content
   ======================================== */
export const AttentionLevelsWithIcon: Story = {
  decorators: [(Story) => <Story />],
  parameters: {
    docs: {
      description: {
        story:
          'Each attention level rendered with an `<Icon />` child. The centre Icon\'s emphasis tracks the divider\'s `attention` prop.',
      },
    },
  },
  render: () => <DividerAttentionWithIcon />,
};

/* ========================================
   4c. Attention Levels × Text content
   ======================================== */
export const AttentionLevelsWithText: Story = {
  decorators: [(Story) => <Story />],
  parameters: {
    docs: {
      description: {
        story:
          'Each attention level rendered with plain-string children. Auto-styled as Label XS Medium; text attention tracks the divider\'s `attention` prop.',
      },
    },
  },
  render: () => <DividerAttentionWithText />,
};

/* ========================================
   5. With Icon
   ======================================== */
export const WithIcon: Story = {
  decorators: [(Story) => <Story />],
  render: () => <DividerWithIcon />,
};

/* ========================================
   6. With Label
   ======================================== */
export const WithLabel: Story = {
  decorators: [(Story) => <Story />],
  render: () => <DividerWithLabel />,
};

/* ========================================
   7. Round Caps
   ======================================== */

export const RoundCaps: Story = {
  decorators: [(Story) => <Story />],
  render: () => <DividerRoundCaps />,
};

/* ========================================
   9. Surface Context
   ======================================== */
export const SurfaceContext: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)', width: '100%' }}>
      <div>
        <p style={{ marginBottom: 'var(--Spacing-3-5)', color: 'var(--Text-Medium)' }}>Default surface</p>
        <Divider attention="medium">Default</Divider>
      </div>
      <Surface mode="minimal">
        <div style={{ padding: 'var(--Spacing-5)' }}>
          <p style={{ marginBottom: 'var(--Spacing-3-5)' }}>Minimal surface</p>
          <Divider attention="medium">On Minimal</Divider>
        </div>
      </Surface>
      <Surface mode="subtle">
        <div style={{ padding: 'var(--Spacing-5)' }}>
          <p style={{ marginBottom: 'var(--Spacing-3-5)' }}>Subtle surface</p>
          <Divider attention="medium">On Subtle</Divider>
        </div>
      </Surface>
      <Surface mode="bold">
        <div style={{ padding: 'var(--Spacing-5)' }}>
          <p style={{ marginBottom: 'var(--Spacing-3-5)' }}>Bold surface</p>
          <Divider attention="medium">On Bold</Divider>
        </div>
      </Surface>
    </div>
  ),
};

/* ========================================
   10. Interactive — accessibility tests
   ======================================== */
export const Interactive: Story = {
  render: (args) => <Divider {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole('separator');
    await expect(separator).toBeInTheDocument();
  },
};

/* ========================================
   11. Vertical Sizes
   ======================================== */
export const VerticalSizes: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-7)', width: '100%', height: 200 }}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
          <span style={{ color: 'var(--Text-Medium)' }}>
            {size.toUpperCase()}
          </span>
          <Divider orientation="vertical" size={size} />
        </div>
      ))}
    </div>
  ),
};

/* ========================================
   12. Vertical Attention Levels
   ======================================== */
export const VerticalAttentionLevels: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-7)', width: '100%', height: 200 }}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <div key={attention} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
          <span style={{ color: 'var(--Text-Medium)' }}>
            {attention}
          </span>
          <Divider orientation="vertical" attention={attention} />
        </div>
      ))}
    </div>
  ),
};

/* ========================================
   13. Vertical With Icon
   ======================================== */
export const VerticalWithIcon: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-7)', width: '100%', height: 200 }}>
      {(['start', 'center', 'end'] as const).map((align) => (
        <div key={align} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
          <span style={{ color: 'var(--Text-Medium)' }}>{align}</span>
          <Divider
            orientation="vertical"
                        contentAlign={align}
            attention="medium"
          >
            <Icon icon="star" aria-hidden />
          </Divider>
        </div>
      ))}
    </div>
  ),
};

/* ========================================
   14. Vertical With Label
   ======================================== */
export const VerticalWithLabel: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-7)', width: '100%', height: 200 }}>
      {(['start', 'center', 'end'] as const).map((align) => (
        <div key={align} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
          <span style={{ color: 'var(--Text-Medium)' }}>{align}</span>
          <Divider
            orientation="vertical"
                        contentAlign={align}
            attention="medium"
          >
            OR
          </Divider>
        </div>
      ))}
    </div>
  ),
};

/* ========================================
   15. Vertical Inline Usage
   ======================================== */
export const VerticalInlineUsage: Story = {
  decorators: [(Story) => <Story />],
  render: () => <DividerVertical />,
};
