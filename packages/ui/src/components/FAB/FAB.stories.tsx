/**
 * FAB.stories.tsx
 * Storybook documentation - 10 required story types
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import { FAB } from './FAB';
import React from 'react';

const meta: Meta<typeof FAB> = {
  title: 'Components/Actions/FAB [WIP]',
  component: FAB,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Floating Action Button for primary or promoted actions. Features elevation, positioning, and optional extended mode with label.',
      },
    },
  },
  argTypes: {
    icon: {
      control: 'text',
      description: 'Semantic icon name or React element',
    },
    label: {
      control: 'text',
      description: 'Optional label for extended FAB',
    },
    variant: {
      control: 'radio',
      options: ['primary', 'secondary', 'surface'],
      description: 'Visual variant affecting colors',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large'],
      description: 'Size affecting dimensions',
      table: {
        defaultValue: { summary: 'medium' },
      },
    },
    position: {
      control: 'radio',
      options: ['bottom-right', 'bottom-left', 'bottom-center'],
      description: 'Position on screen',
      table: {
        defaultValue: { summary: 'bottom-right' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '400px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FAB>;

// 1. Default
export const Default: Story = {
  args: {
    icon: 'add',
    'aria-label': 'Add item',
  },
};

// 2. Variants
export const Variants: Story = {
  render: () => (
    <div style={{ height: '200px', position: 'relative' }}>
      <FAB icon="add" variant="primary" aria-label="Add" position="bottom-left" />
      <FAB
        icon="add"
        variant="secondary"
        aria-label="Add"
        position="bottom-center"
      />
      <FAB icon="add" variant="surface" aria-label="Add" position="bottom-right" />
    </div>
  ),
};

// 3. Sizes
export const Sizes: Story = {
  render: () => (
    <div className="story-row" style={{ padding: 'var(--Spacing-4-5)' }}>
      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
        <FAB
          icon="add"
          size="small"
          aria-label="Add (small)"
          position="bottom-right"
          style={{ position: 'absolute' }}
        />
      </div>
      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
        <FAB
          icon="add"
          size="medium"
          aria-label="Add (medium)"
          position="bottom-right"
          style={{ position: 'absolute' }}
        />
      </div>
      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
        <FAB
          icon="add"
          size="large"
          aria-label="Add (large)"
          position="bottom-right"
          style={{ position: 'absolute' }}
        />
      </div>
    </div>
  ),
};

// 4. States
export const States: Story = {
  render: () => (
    <div style={{ height: '200px', position: 'relative' }}>
      <FAB icon="add" aria-label="Default" position="bottom-left" />
      <FAB icon="add" disabled aria-label="Disabled" position="bottom-center" />
      <FAB icon="add" loading aria-label="Loading" position="bottom-right" />
    </div>
  ),
};

// 4b. Focus State — force-renders the outline focus ring via data-force-state
export const FocusState: Story = {
  name: 'Focus State',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'center', padding: 'var(--Spacing-5)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
        <FAB icon="add" aria-label="Add" style={{ position: 'static' }} />
        <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>Idle</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
        <div data-force-state="focus" style={{ display: 'inline-flex' }}>
          <FAB icon="add" aria-label="Add (focused)" style={{ position: 'static' }} />
        </div>
        <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>Focus</span>
      </div>
    </div>
  ),
};

// 5. Extended (with label)
export const Extended: Story = {
  name: 'Extended FAB',
  render: () => (
    <div style={{ height: '300px', position: 'relative' }}>
      <FAB icon="add" label="Create" position="bottom-left" size="small" />
      <FAB icon="add" label="New item" position="bottom-center" />
      <FAB icon="edit" label="Edit document" position="bottom-right" size="large" />
    </div>
  ),
};

// 6. Interactive
export const Interactive: Story = {
  args: {
    icon: 'add',
    'aria-label': 'Add new item',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Verify button exists and is accessible
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAccessibleName('Add new item');

    // Test click
    await userEvent.click(button);

    // Test keyboard navigation
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // Test keyboard activation
    await userEvent.keyboard('{Enter}');
  },
};

// 7. Responsive
export const Responsive: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <div style={{ padding: 'var(--Spacing-4)' }}>
        <h3>Mobile view with FAB</h3>
        <p>The FAB is positioned at the bottom-right corner.</p>
      </div>
      <FAB icon="add" aria-label="Add" />
    </div>
  ),
};

// 8. Themes
export const Themes: Story = {
  render: () => (
    <div className="story-row">
      <div
        data-mode="light"
        className="theme-card"
        style={{ height: '150px', position: 'relative' }}
      >
        <span>Light</span>
        <FAB
          icon="add"
          aria-label="Add"
          position="bottom-right"
          style={{ position: 'absolute' }}
        />
      </div>
      <div
        data-mode="dark"
        className="theme-card"
        style={{ height: '150px', position: 'relative' }}
      >
        <span>Dark</span>
        <FAB
          icon="add"
          aria-label="Add"
          position="bottom-right"
          style={{ position: 'absolute' }}
        />
      </div>
      <div
        data-mode="dim"
        className="theme-card"
        style={{ height: '150px', position: 'relative' }}
      >
        <span>Dim</span>
        <FAB
          icon="add"
          aria-label="Add"
          position="bottom-right"
          style={{ position: 'absolute' }}
        />
      </div>
    </div>
  ),
};

// 9. Brands
export const Brands: Story = {
  render: () => (
    <div className="story-row">
      <div
        data-brand="jiocinema"
        className="brand-card"
        style={{ height: '150px', position: 'relative' }}
      >
        <span>JioCinema</span>
        <FAB
          icon="add"
          label="Add to list"
          position="bottom-right"
          style={{ position: 'absolute' }}
        />
      </div>
      <div
        data-brand="jiomart"
        className="brand-card"
        style={{ height: '150px', position: 'relative' }}
      >
        <span>JioMart</span>
        <FAB
          icon="bookmark"
          label="Add to cart"
          position="bottom-right"
          style={{ position: 'absolute' }}
        />
      </div>
      <div
        data-brand="jiohotstar"
        className="brand-card"
        style={{ height: '150px', position: 'relative' }}
      >
        <span>JioHotstar</span>
        <FAB
          icon="play"
          label="Watch now"
          position="bottom-right"
          style={{ position: 'absolute' }}
        />
      </div>
    </div>
  ),
};

// 10. Density
export const Density: Story = {
  render: () => (
    <div className="story-row">
      <div
        data-density="compact"
        className="density-card"
        style={{ height: '150px', position: 'relative' }}
      >
        <span>Compact</span>
        <FAB
          icon="add"
          label="Create"
          position="bottom-right"
          style={{ position: 'absolute' }}
        />
      </div>
      <div
        data-density="default"
        className="density-card"
        style={{ height: '150px', position: 'relative' }}
      >
        <span>Default</span>
        <FAB
          icon="add"
          label="Create"
          position="bottom-right"
          style={{ position: 'absolute' }}
        />
      </div>
      <div
        data-density="open"
        className="density-card"
        style={{ height: '150px', position: 'relative' }}
      >
        <span>Open</span>
        <FAB
          icon="add"
          label="Create"
          position="bottom-right"
          style={{ position: 'absolute' }}
        />
      </div>
    </div>
  ),
};
