/**
 * SelectableButton.stories.tsx
 * Storybook documentation for SelectableButton component
 *
 * Uses Figma terminology: Attention (High/Medium/Low) for selected visual prominence.
 * Demonstrates the core behaviour: unselected = always muted; selected = attention-driven.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import { SelectableButton } from './SelectableButton';
import { Surface } from '../Surface';
import { FocusStateGrid } from '../_storyHelpers/FocusStateGrid';
import React, { useState } from 'react';

// Placeholder icon for slot controls
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"
    />
  </svg>
);

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
      fill="currentColor"
    />
  </svg>
);

type SelectableButtonStoryArgs = {
  children?: React.ReactNode;
  attention?: 'high' | 'medium' | 'low';
  size?: 'xs' | 's' | 'm' | 'l';
  appearance?: string;
  contained?: boolean;
  condensed?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  start?: boolean;
  end?: boolean;
};

const meta = {
  title: 'Components/Actions/SelectableButton',
  component: SelectableButton as any,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toggle button that stays selected after click. Unselected state is always muted ghost. Selected appearance is driven by the `attention` prop: high=bold fill, medium=subtle fill, low=ghost with accent border. Supports `contained` (pill) and uncontained (inline text) modes.',
      },
    },
  },
  argTypes: {
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      description: 'Attention level — drives the SELECTED visual prominence',
      table: { defaultValue: { summary: 'high' } },
    },
    size: {
      control: 'select',
      options: ['xs', 's', 'm', 'l'],
      description: 'Button size',
      table: { defaultValue: { summary: 'm' } },
    },
    appearance: {
      control: 'radio',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative',
      ],
      description: 'Multi-accent appearance role',
      table: { defaultValue: { summary: 'auto' } },
    },
    contained: {
      control: 'boolean',
      description: 'Pill container mode (true) vs inline text (false)',
      table: { defaultValue: { summary: 'true' } },
    },
    condensed: {
      control: 'boolean',
      description: 'Condensed mode — reduced height + padding (only when contained=true)',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to fill container width (only when contained=true)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state — disables interaction',
    },
    start: {
      control: 'boolean',
      description: 'Show start (left) icon slot',
      table: { defaultValue: { summary: 'false' } },
    },
    end: {
      control: 'boolean',
      description: 'Show end (right) icon slot',
      table: { defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<SelectableButtonStoryArgs>;

export default meta;
type Story = StoryObj<SelectableButtonStoryArgs>;

// 1. Default — interactive controls
export const Default: Story = {
  args: {
    children: 'Like',
    attention: 'high',
    size: 'm',
    contained: true,
    start: false,
    end: false,
    condensed: false,
  },
  render: ({ start: showStart, end: showEnd, children, appearance, ...args }: SelectableButtonStoryArgs) => (
    <SelectableButton
      {...args}
      appearance={appearance as import('./SelectableButton.shared').SelectableButtonAppearance}
      defaultSelected
      start={showStart ? <HeartIcon /> : undefined}
      end={showEnd ? <HeartIcon /> : undefined}
    >
      {children}
    </SelectableButton>
  ),
};

// 1b. Focus State — force-renders the focus ring via data-force-state
export const FocusState: Story = {
  name: 'Focus State',
  render: () => (
    <FocusStateGrid
      renderItem={(attention, selected) => (
        <SelectableButton attention={attention} defaultSelected={selected}>
          {selected ? 'Selected' : 'Select'}
        </SelectableButton>
      )}
    />
  ),
};

// 2. Attention Levels — selected state visual comparison
export const AttentionLevels: Story = {
  name: 'Attention Levels',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Selected</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)' }}>
          <SelectableButton attention="high" defaultSelected>High</SelectableButton>
          <SelectableButton attention="medium" defaultSelected>Medium</SelectableButton>
          <SelectableButton attention="low" defaultSelected>Low</SelectableButton>
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Unselected (always muted ghost)</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)' }}>
          <SelectableButton attention="high">High</SelectableButton>
          <SelectableButton attention="medium">Medium</SelectableButton>
          <SelectableButton attention="low">Low</SelectableButton>
        </div>
      </div>
    </div>
  ),
};

// 3. Selected vs Unselected — all attention levels
export const SelectedUnselected: Story = {
  name: 'Selected / Unselected',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <div key={attention} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)', textTransform: 'capitalize' }}>
            {attention} attention
          </span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
            <SelectableButton attention={attention} defaultSelected>Selected</SelectableButton>
            <SelectableButton attention={attention}>Unselected</SelectableButton>
          </div>
        </div>
      ))}
    </div>
  ),
};

// 4. Sizes — XS/S/M/L (selected=true)
export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
      <SelectableButton size="xs" defaultSelected>XS</SelectableButton>
      <SelectableButton size="s" defaultSelected>S</SelectableButton>
      <SelectableButton size="m" defaultSelected>M</SelectableButton>
      <SelectableButton size="l" defaultSelected>L</SelectableButton>
    </div>
  ),
};

// 5. Contained vs Uncontained
export const ContainedMode: Story = {
  name: 'Contained vs Uncontained',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>
          contained=true (default) — pill container with background, border, padding
        </span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableButton contained attention="high" defaultSelected start={<HeartIcon />}>Liked</SelectableButton>
          <SelectableButton contained attention="medium" defaultSelected>Following</SelectableButton>
          <SelectableButton contained attention="low" defaultSelected>Saved</SelectableButton>
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>
          contained=false — inline text only (no container). Useful for text toggles.
        </span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableButton contained={false} attention="high" defaultSelected start={<HeartIcon />}>Liked</SelectableButton>
          <SelectableButton contained={false} attention="medium" defaultSelected>Following</SelectableButton>
          <SelectableButton contained={false} attention="low" defaultSelected>Saved</SelectableButton>
        </div>
      </div>
    </div>
  ),
};

// 6. Condensed mode (only contained=true)
export const Condensed: Story = {
  name: 'Condensed',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Normal</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableButton size="s" defaultSelected>S</SelectableButton>
          <SelectableButton size="m" defaultSelected>M</SelectableButton>
          <SelectableButton size="l" defaultSelected>L</SelectableButton>
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Condensed (same typography, reduced height + padding)</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableButton size="s" condensed defaultSelected>S</SelectableButton>
          <SelectableButton size="m" condensed defaultSelected>M</SelectableButton>
          <SelectableButton size="l" condensed defaultSelected>L</SelectableButton>
        </div>
      </div>
    </div>
  ),
};

// 7. With slots
export const WithSlots: Story = {
  name: 'With Start/End Slots',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
        <SelectableButton start={<HeartIcon />} defaultSelected>Like</SelectableButton>
        <SelectableButton end={<BookmarkIcon />} defaultSelected>Save</SelectableButton>
        <SelectableButton start={<HeartIcon />} end={<BookmarkIcon />} defaultSelected>Like & Save</SelectableButton>
      </div>
      <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
        <SelectableButton attention="medium" start={<HeartIcon />} defaultSelected>Like</SelectableButton>
        <SelectableButton attention="low" start={<BookmarkIcon />} defaultSelected>Bookmark</SelectableButton>
      </div>
    </div>
  ),
};

// 8. Appearances — all 9 V4 roles
export const Appearances: Story = {
  name: 'Appearances',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {([
        'primary', 'secondary', 'neutral',
        'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative',
      ] as const).map((role) => (
        <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)', textTransform: 'capitalize' }}>
            {role}
          </span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
            <SelectableButton appearance={role} attention="high" defaultSelected>High</SelectableButton>
            <SelectableButton appearance={role} attention="medium" defaultSelected>Medium</SelectableButton>
            <SelectableButton appearance={role} attention="low" defaultSelected>Low</SelectableButton>
            <SelectableButton appearance={role} attention="high">Unselected</SelectableButton>
          </div>
        </div>
      ))}
    </div>
  ),
};

// 9. Interactive — play function verifies toggle behavior
export const Interactive: Story = {
  args: {
    children: 'Toggle me',
    attention: 'high',
    size: 'm',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Initially unselected
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('aria-pressed', 'false');

    // Click to select
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');

    // Click to deselect
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'false');

    // Keyboard toggle
    button.focus();
    await userEvent.keyboard(' ');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  },
};

// 10. States — disabled and loading
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Disabled unselected</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)' }}>
          <SelectableButton attention="high" disabled>High</SelectableButton>
          <SelectableButton attention="medium" disabled>Medium</SelectableButton>
          <SelectableButton attention="low" disabled>Low</SelectableButton>
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Disabled selected</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)' }}>
          <SelectableButton attention="high" disabled defaultSelected>High</SelectableButton>
          <SelectableButton attention="medium" disabled defaultSelected>Medium</SelectableButton>
          <SelectableButton attention="low" disabled defaultSelected>Low</SelectableButton>
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Loading</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)' }}>
          <SelectableButton attention="high" loading>Loading</SelectableButton>
          <SelectableButton attention="medium" loading defaultSelected>Loading</SelectableButton>
        </div>
      </div>
    </div>
  ),
};

// 11. Surface Context — all 5 surface modes in a flat list
export const SurfaceContext: Story = {
  name: 'Surface Context',
  render: () => {
    const surfaceModes = [
      { mode: 'default' as const, label: 'default', desc: 'page background' },
      { mode: 'minimal' as const, label: 'minimal', desc: 'light tint' },
      { mode: 'subtle' as const, label: 'subtle', desc: 'medium tint' },
      { mode: 'moderate' as const, label: 'moderate', desc: 'heavier tint' },
      { mode: 'bold' as const, label: 'bold', desc: 'full accent colour' },
      { mode: 'elevated' as const, label: 'elevated', desc: 'floating card / popover' },
    ];

    const contentStyle: React.CSSProperties = {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 'var(--Spacing-4)',
      padding: 'var(--Spacing-5)',
      borderRadius: 'var(--Shape-4)',
    };

    const sectionLabel: React.CSSProperties = {
      fontSize: 'var(--Typography-Size-S)',
      color: 'var(--Text-Low)',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {surfaceModes.map(({ mode, label, desc }) => (
          <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            <span style={sectionLabel}>{label} — {desc}</span>
            <Surface mode={mode} style={contentStyle}>
              <SelectableButton attention="high" defaultSelected>High</SelectableButton>
              <SelectableButton attention="medium" defaultSelected>Medium</SelectableButton>
              <SelectableButton attention="low" defaultSelected>Low</SelectableButton>
              <SelectableButton attention="high">Unselected</SelectableButton>
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// Bonus: Controlled real-world example
export const RealWorldLike: Story = {
  name: 'Real-world: Like Button',
  render: () => {
    const LikeButton = () => {
      const [liked, setLiked] = React.useState(false);
      return (
        <SelectableButton
          attention="high"
          selected={liked}
          onSelectedChange={setLiked}
          start={<HeartIcon />}
        >
          {liked ? 'Liked' : 'Like'}
        </SelectableButton>
      );
    };
    return <LikeButton />;
  },
};

// 14. Full Width — buttons stretched to fill a fixed-width container.
export const FullWidth: Story = {
  name: 'Full Width',
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ width: 'var(--Spacing-40)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <div key={attention} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
          <SelectableButton fullWidth attention={attention} defaultSelected start={<HeartIcon />}>
            Liked
          </SelectableButton>
          <SelectableButton fullWidth attention={attention} start={<HeartIcon />}>
            Like
          </SelectableButton>
        </div>
      ))}
    </div>
  ),
};
