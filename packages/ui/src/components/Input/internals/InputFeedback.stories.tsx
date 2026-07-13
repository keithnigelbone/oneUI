/**
 * InputFeedback.stories.tsx
 *
 * Storybook documentation for validation and contextual feedback under inputs.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import React from 'react';
import { InputFeedback } from './InputFeedback';
import { InputFeedbackShowcase } from '../Input.showcase';

const meta = {
  title: 'Components/Inputs/Input/Internals/InputFeedback',
  component: InputFeedback,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Semantic feedback region for errors and contextual messages. Supports four variants (negative, positive, warning, informative), three attention levels (low / medium / high), and S/M/L sizing. Use `feedback_message` for string copy (Figma API) or `children` for rich content. `customIcon` overrides the default semantic icon while keeping `variant` colours. Negative messages default to an assertive `alert` live region; other variants use a polite `status` role.',
      },
    },
  },
} satisfies Meta<typeof InputFeedback>;

export default meta;
type Story = StoryObj<typeof InputFeedback>;

export const Default: Story = {
  render: (args) => <InputFeedback {...args} />,
  args: {
    variant: 'negative',
    attention: 'low',
    size: 'm',
    feedback_message: 'Password must be at least 8 characters.',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['negative', 'positive', 'warning', 'informative'],
    },
    attention: { control: 'inline-radio', options: ['low', 'medium', 'high'] },
    size: { control: 'inline-radio', options: ['s', 'm', 'l'] },
    feedback_message: { control: 'text' },
    customIcon: {
      control: 'select',
      options: [undefined, 'help', 'lock', 'check', 'error', 'info', 'warning', 'checkCircle'],
    },
  },
};

export const VariantsAndAttention: Story = {
  name: 'Variants × attention × size',
  render: () => <InputFeedbackShowcase />,
  parameters: { layout: 'padded' },
};

export const CustomIcon: Story = {
  name: 'Custom icon',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
      <InputFeedback
        variant="informative"
        attention="medium"
        feedback_message="Replaced default info icon with help."
        customIcon="help"
      />
      <InputFeedback variant="negative" attention="low" feedback_message="Using lock instead of error." customIcon="lock" />
    </div>
  ),
};

export const Roles: Story = {
  name: 'Roles (alert vs status)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
      <InputFeedback variant="negative" attention="low">
        Negative uses alert semantics.
      </InputFeedback>
      <InputFeedback variant="positive" attention="low">
        Positive uses status semantics.
      </InputFeedback>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('alert')).toBeInTheDocument();
    expect(canvas.getByRole('status')).toBeInTheDocument();
  },
};
