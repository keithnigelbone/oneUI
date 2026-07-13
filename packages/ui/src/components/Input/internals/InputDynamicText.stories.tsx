/**
 * InputDynamicText.stories.tsx
 *
 * Storybook documentation for the Figma DynamicText helper row (4343:14293–4343:14295).
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { InputDynamicText } from './InputDynamicText';
import { InputDynamicTextShowcase } from '../Input.showcase';

const meta = {
  title: 'Components/Inputs/Input/Internals/InputDynamicText',
  component: InputDynamicText,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Figma `.DNA/DynamicText`: optional `content` (Body / Text-Medium) and optional `end` (same row, rendered with `Button` `attention="low"` + `condensed`, size S/M/L). Use `aria-live` on the leading copy when it updates (e.g. character counts).',
      },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['s', 'm', 'l'] },
    content: { control: 'text' },
    end: { control: 'text' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof InputDynamicText>;

export default meta;
type Story = StoryObj<typeof InputDynamicText>;

export const Default: Story = {
  render: (args) => <InputDynamicText {...args} />,
  args: {
    size: 'm',
    content: '0 / 280 characters',
    end: 'Helper Button',
    disabled: false,
  },
};

export const LiveRegion: Story = {
  name: 'Leading copy with polite live region',
  render: () => (
    <InputDynamicText
      size="m"
      content="Updating: 12 / 100 characters"
      end="Clear"
      aria-live="polite"
    />
  ),
};

export const FigmaSizes: Story = {
  name: 'Figma sizes (S / M / L)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      <InputDynamicText size="s" content="Dynamic text" end="Helper Button" />
      <InputDynamicText size="m" content="Dynamic text" end="Helper Button" />
      <InputDynamicText size="l" content="Dynamic text" end="Helper Button" />
    </div>
  ),
  parameters: { layout: 'padded' },
};

export const Showcase: Story = {
  name: 'Showcase',
  render: () => <InputDynamicTextShowcase />,
  parameters: { layout: 'padded' },
};
