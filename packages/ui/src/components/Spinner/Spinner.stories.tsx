/**
 * Spinner.stories.tsx
 * Storybook documentation for the Spinner component.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { Spinner } from './Spinner';
import { SpinnerSizes, SpinnerSurfaceContext } from './Spinner.showcase';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Feedback/Spinner [WIP]',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Indeterminate three-arc loading indicator. Each spinner renders three arcs in three distinct accent roles (primary + secondary + sparkle), matching the Figma spec. Adapts automatically on colored surfaces via the [data-surface] system.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
      description: 'Size preset — matches Figma 10-size scale.',
      table: { defaultValue: { summary: 'M' } },
    },
    label: {
      control: 'text',
      description: 'Accessible label announced by screen readers.',
      table: { defaultValue: { summary: 'Loading' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  name: 'Default',
  args: {
    size: 'M',
    label: 'Loading',
  },
};

export const Sizes: Story = {
  name: 'All sizes',
  render: () => <SpinnerSizes />,
};

export const OnSurfaceContext: Story = {
  name: 'On surface context',
  render: () => <SpinnerSurfaceContext />,
};

// ============================================================
// Motion — pause/resume demo
// ============================================================

const spinnerMotionCSS = `
  .spinner-motion-wrap {
    display: flex;
    align-items: center;
    gap: var(--Spacing-5);
  }
  .spinner-paused circle {
    animation-play-state: paused;
  }
`;

function SpinnerMotionDemo() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <style>{spinnerMotionCSS}</style>
      <div className="spinner-motion-wrap">
        <div className={paused ? 'spinner-paused' : undefined}>
          <Spinner size="2XL" />
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          style={{
            background: 'var(--Primary-Bold)',
            color: 'var(--Primary-Bold-High)',
            border: 'none',
            borderRadius: 'var(--Shape-Pill)',
            padding: 'var(--Spacing-1-5) var(--Spacing-4-5)',
            fontSize: 'var(--Label-S-FontSize)',
            cursor: 'pointer',
          }}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </>
  );
}

export const Motion: Story = {
  name: 'Motion',
  render: () => <SpinnerMotionDemo />,
};
