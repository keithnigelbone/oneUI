/**
 * SelectableIconButton.stories.tsx
 * Storybook documentation for SelectableIconButton component
 *
 * Uses Figma terminology: Attention (High/Medium/Low) for selected visual prominence.
 * Demonstrates the core behaviour: unselected = always muted; selected = attention-driven.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import { SelectableIconButton } from './SelectableIconButton';
import { Surface } from '../Surface';
import { FocusStateGrid } from '../_storyHelpers/FocusStateGrid';
import React from 'react';

// Inline SVG icons — no external import needed. CSS governs sizing.
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
  </svg>
);

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="currentColor"/>
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/>
  </svg>
);

type SelectableIconButtonStoryArgs = {
  attention?: 'high' | 'medium' | 'low';
  size?: 4 | 6 | 8 | 10 | 12 | 14;
  appearance?: string;
  condensed?: boolean;
  disabled?: boolean;
  loading?: boolean;
  shape?: '1:1' | '2:3';
};

const meta = {
  title: 'Components/Actions/SelectableIconButton',
  component: SelectableIconButton as any,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Icon-only toggle button that stays selected after click. Unselected state is always muted ghost. Selected appearance is driven by the `attention` prop: high=bold fill, medium=subtle fill, low=ghost with accent border. 6 sizes (2XS-XL), condensed mode, 1:1/2:3 shape proportions.',
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
      options: [4, 6, 8, 10, 12, 14],
      description: 'Icon button size (f-step)',
      table: { defaultValue: { summary: '10' } },
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
    shape: {
      control: 'radio',
      options: ['1:1', '2:3'],
      description: 'Shape proportion — square (1:1) or wide rectangle (2:3)',
      table: { defaultValue: { summary: '1:1' } },
    },
    condensed: {
      control: 'boolean',
      description: 'Reduces container size while keeping icon size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state — shows spinner, disables interaction',
    },
  },
} satisfies Meta<SelectableIconButtonStoryArgs>;

export default meta;
type Story = StoryObj<SelectableIconButtonStoryArgs>;

// 1. Default — interactive controls
export const Default: Story = {
  args: {
    attention: 'high',
    size: 10,
    shape: '1:1',
    condensed: false,
  },
  render: ({ appearance, ...args }: SelectableIconButtonStoryArgs) => (
    <SelectableIconButton
      {...args}
      appearance={appearance as import('./SelectableIconButton.shared').SelectableIconButtonAppearance}
      defaultSelected
      icon={<HeartIcon />}
      aria-label="Like"
    />
  ),
};

// 1b. Focus State — force-renders the focus ring via data-force-state
export const FocusState: Story = {
  name: 'Focus State',
  render: () => (
    <FocusStateGrid
      renderItem={(attention, selected) => (
        <SelectableIconButton
          icon={<HeartIcon />}
          attention={attention}
          defaultSelected={selected}
          aria-label={selected ? 'Selected' : 'Unselected'}
        />
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
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableIconButton attention="high" defaultSelected icon={<HeartIcon />} aria-label="High attention selected" />
          <SelectableIconButton attention="medium" defaultSelected icon={<HeartIcon />} aria-label="Medium attention selected" />
          <SelectableIconButton attention="low" defaultSelected icon={<HeartIcon />} aria-label="Low attention selected" />
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Unselected (always muted ghost)</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableIconButton attention="high" icon={<HeartIcon />} aria-label="High attention unselected" />
          <SelectableIconButton attention="medium" icon={<HeartIcon />} aria-label="Medium attention unselected" />
          <SelectableIconButton attention="low" icon={<HeartIcon />} aria-label="Low attention unselected" />
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
            <SelectableIconButton attention={attention} defaultSelected icon={<HeartIcon />} aria-label={`${attention} selected`} />
            <SelectableIconButton attention={attention} icon={<HeartIcon />} aria-label={`${attention} unselected`} />
          </div>
        </div>
      ))}
    </div>
  ),
};

// 4. Sizes — all 6 sizes (2XS through XL)
export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {(['2XS', 'XS', 'S', 'M', 'L', 'XL'] as const).map((label, i) => {
        const sizes = [4, 6, 8, 10, 12, 14] as const;
        const size = sizes[i];
        return (
          <div key={size} style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)', minWidth: 'var(--Spacing-8)' }}>
              {label}
            </span>
            <SelectableIconButton size={size} defaultSelected icon={<HeartIcon />} aria-label={`${label} selected`} />
            <SelectableIconButton size={size} icon={<HeartIcon />} aria-label={`${label} unselected`} />
          </div>
        );
      })}
    </div>
  ),
};

// 5. Shapes — 1:1 vs 2:3
export const Shapes: Story = {
  name: 'Shapes (1:1 vs 2:3)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>1:1 (square, default)</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableIconButton shape="1:1" defaultSelected icon={<HeartIcon />} aria-label="1:1 selected" />
          <SelectableIconButton shape="1:1" attention="medium" defaultSelected icon={<StarIcon />} aria-label="1:1 medium selected" />
          <SelectableIconButton shape="1:1" attention="low" defaultSelected icon={<BookmarkIcon />} aria-label="1:1 low selected" />
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>2:3 (wide rectangle)</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableIconButton shape="2:3" defaultSelected icon={<HeartIcon />} aria-label="2:3 selected" />
          <SelectableIconButton shape="2:3" attention="medium" defaultSelected icon={<StarIcon />} aria-label="2:3 medium selected" />
          <SelectableIconButton shape="2:3" attention="low" defaultSelected icon={<BookmarkIcon />} aria-label="2:3 low selected" />
        </div>
      </div>
    </div>
  ),
};

// 6. Contained vs Uncontained
export const ContainedUncontained: Story = {
  name: 'Contained vs Uncontained',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Contained (default)</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableIconButton contained defaultSelected icon={<HeartIcon />} aria-label="Contained selected" />
          <SelectableIconButton contained icon={<HeartIcon />} aria-label="Contained unselected" />
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Uncontained (icon only)</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableIconButton contained={false} defaultSelected icon={<HeartIcon />} aria-label="Uncontained selected" />
          <SelectableIconButton contained={false} icon={<HeartIcon />} aria-label="Uncontained unselected" />
          <SelectableIconButton contained={false} attention="medium" defaultSelected icon={<StarIcon />} aria-label="Uncontained medium" />
          <SelectableIconButton contained={false} attention="low" defaultSelected icon={<BookmarkIcon />} aria-label="Uncontained low" />
        </div>
      </div>
    </div>
  ),
};

// 7. Full Width
export const FullWidth: Story = {
  name: 'Full Width',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)', width: 'var(--Spacing-40)' }}>
      <SelectableIconButton fullWidth defaultSelected icon={<HeartIcon />} aria-label="Full width selected" />
      <SelectableIconButton fullWidth icon={<HeartIcon />} aria-label="Full width unselected" />
      <SelectableIconButton fullWidth attention="medium" defaultSelected icon={<StarIcon />} aria-label="Full width medium" />
    </div>
  ),
};

// 8. Condensed mode
export const Condensed: Story = {
  name: 'Condensed',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Normal</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableIconButton size={8} defaultSelected icon={<HeartIcon />} aria-label="S normal" />
          <SelectableIconButton size={10} defaultSelected icon={<HeartIcon />} aria-label="M normal" />
          <SelectableIconButton size={12} defaultSelected icon={<HeartIcon />} aria-label="L normal" />
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Condensed (same icon, reduced container)</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableIconButton size={8} condensed defaultSelected icon={<HeartIcon />} aria-label="S condensed" />
          <SelectableIconButton size={10} condensed defaultSelected icon={<HeartIcon />} aria-label="M condensed" />
          <SelectableIconButton size={12} condensed defaultSelected icon={<HeartIcon />} aria-label="L condensed" />
        </div>
      </div>
    </div>
  ),
};

// 7. Appearances — all 9 V4 roles
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
            <SelectableIconButton appearance={role} attention="high" defaultSelected icon={<HeartIcon />} aria-label={`${role} high selected`} />
            <SelectableIconButton appearance={role} attention="medium" defaultSelected icon={<HeartIcon />} aria-label={`${role} medium selected`} />
            <SelectableIconButton appearance={role} attention="low" defaultSelected icon={<HeartIcon />} aria-label={`${role} low selected`} />
            <SelectableIconButton appearance={role} icon={<HeartIcon />} aria-label={`${role} unselected`} />
          </div>
        </div>
      ))}
    </div>
  ),
};

// 8. Interactive — play function verifies toggle behavior
export const Interactive: Story = {
  args: {
    attention: 'high',
    size: 10,
  },
  render: ({ appearance, ...args }: SelectableIconButtonStoryArgs) => (
    <SelectableIconButton
      {...args}
      appearance={appearance as import('./SelectableIconButton.shared').SelectableIconButtonAppearance}
      icon={<HeartIcon />}
      aria-label="Toggle like"
    />
  ),
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

// 9. States — disabled + loading
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Disabled unselected</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableIconButton attention="high" disabled icon={<HeartIcon />} aria-label="High disabled" />
          <SelectableIconButton attention="medium" disabled icon={<HeartIcon />} aria-label="Medium disabled" />
          <SelectableIconButton attention="low" disabled icon={<HeartIcon />} aria-label="Low disabled" />
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Disabled selected</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableIconButton attention="high" disabled defaultSelected icon={<HeartIcon />} aria-label="High disabled selected" />
          <SelectableIconButton attention="medium" disabled defaultSelected icon={<HeartIcon />} aria-label="Medium disabled selected" />
          <SelectableIconButton attention="low" disabled defaultSelected icon={<HeartIcon />} aria-label="Low disabled selected" />
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Loading</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableIconButton attention="high" loading icon={<HeartIcon />} aria-label="Loading" />
          <SelectableIconButton attention="medium" loading defaultSelected icon={<HeartIcon />} aria-label="Loading selected" />
        </div>
      </div>
    </div>
  ),
};

// 10. Surface Context — all 5 surface modes in a flat list
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
              <SelectableIconButton attention="high" defaultSelected icon={<HeartIcon />} aria-label="High selected" />
              <SelectableIconButton attention="medium" defaultSelected icon={<HeartIcon />} aria-label="Medium selected" />
              <SelectableIconButton attention="low" defaultSelected icon={<HeartIcon />} aria-label="Low selected" />
              <SelectableIconButton icon={<HeartIcon />} aria-label="Unselected" />
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 11. Real-world: Favourite (controlled bookmark toggle)
export const RealWorldFavourite: Story = {
  name: 'Real-world: Favourite Button',
  render: () => {
    const FavouriteButton = () => {
      const [saved, setSaved] = React.useState(false);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
          <SelectableIconButton
            attention="high"
            selected={saved}
            onSelectedChange={setSaved}
            icon={<BookmarkIcon />}
            aria-label={saved ? 'Remove bookmark' : 'Bookmark'}
          />
          <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>
            {saved ? 'Saved' : 'Save'}
          </span>
        </div>
      );
    };
    return <FavouriteButton />;
  },
};
