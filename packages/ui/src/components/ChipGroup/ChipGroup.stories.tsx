/**
 * ChipGroup.stories.tsx
 * Storybook documentation for ChipGroup component
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent } from 'storybook/test';
import React, { useState } from 'react';
import { ChipGroup } from './ChipGroup';
import { Chip } from '../Chip/Chip';
import { Icon } from '../Icon/Icon';
import { Surface } from '../Surface';

const meta = {
  title: 'Components/Actions/ChipGroup',
  component: ChipGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Groups multiple Chip components with shared selection state and keyboard navigation. Wraps Base UI ToggleGroup for full accessibility.',
      },
    },
  },
  argTypes: {
    multiple: {
      control: 'boolean',
      description: 'Allow multiple chips to be selected',
      table: { defaultValue: { summary: 'false' } },
    },
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: 'horizontal' } },
    },
    wrap: {
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    size: {
      control: 'radio',
      options: ['s', 'm', 'l'],
      table: { defaultValue: { summary: 'm' } },
    },
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      table: { defaultValue: { summary: 'high' } },
    },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof ChipGroup>;

export default meta;
type Story = StoryObj<typeof ChipGroup>;

// ── 1. Default ─────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    size: 'm',
  },
  render: (args: React.ComponentProps<typeof ChipGroup>) => (
    <ChipGroup {...args}>
      <Chip value="all">All</Chip>
      <Chip value="news">News</Chip>
      <Chip value="sport">Sport</Chip>
      <Chip value="tech">Tech</Chip>
      <Chip value="culture">Culture</Chip>
    </ChipGroup>
  ),
};

// ── 2. Variants ────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ChipGroup defaultValue={['react']} attention="low">
        <Chip value="react">React</Chip>
        <Chip value="vue">Vue</Chip>
        <Chip value="angular">Angular</Chip>
      </ChipGroup>
      <ChipGroup defaultValue={['react']} attention="medium">
        <Chip value="react">React</Chip>
        <Chip value="vue">Vue</Chip>
        <Chip value="angular">Angular</Chip>
      </ChipGroup>
      <ChipGroup defaultValue={['react']} attention="high">
        <Chip value="react">React</Chip>
        <Chip value="vue">Vue</Chip>
        <Chip value="angular">Angular</Chip>
      </ChipGroup>
    </div>
  ),
};

// ── 3. Sizes ───────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <ChipGroup key={size} size={size} defaultValue={['news']}>
          <Chip value="news">News</Chip>
          <Chip value="sport">Sport</Chip>
          <Chip value="tech">Tech</Chip>
        </ChipGroup>
      ))}
    </div>
  ),
};

// ── 4. States ──────────────────────────────────────────────────────────

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Disabled group */}
      <ChipGroup disabled defaultValue={['sport']}>
        <Chip value="news">News</Chip>
        <Chip value="sport">Sport</Chip>
        <Chip value="tech">Tech</Chip>
      </ChipGroup>
      {/* Required — last chip can't be deselected */}
      <ChipGroup required defaultValue={['news']}>
        <Chip value="news">News (required)</Chip>
        <Chip value="sport">Sport</Chip>
        <Chip value="tech">Tech</Chip>
      </ChipGroup>
      {/* Individual chip disabled */}
      <ChipGroup>
        <Chip value="news">News</Chip>
        <Chip value="sport" disabled>Sport (disabled)</Chip>
        <Chip value="tech">Tech</Chip>
      </ChipGroup>
    </div>
  ),
};

// ── 5. Multi-select ────────────────────────────────────────────────────

export const MultiSelect: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['react', 'vue']);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <ChipGroup multiple value={selected} onValueChange={setSelected}>
          <Chip value="react">React</Chip>
          <Chip value="vue">Vue</Chip>
          <Chip value="angular">Angular</Chip>
          <Chip value="svelte">Svelte</Chip>
          <Chip value="solid">Solid</Chip>
        </ChipGroup>
        <span style={{ fontSize: '12px', color: 'var(--Text-Low)' }}>
          Selected: {selected.join(', ') || 'none'}
        </span>
      </div>
    );
  },
};

// ── 6. Interactive ─────────────────────────────────────────────────────

export const Interactive: Story = {
  render: () => (
    <ChipGroup multiple maxSelections={2} defaultValue={['news']}>
      <Chip value="news">News</Chip>
      <Chip value="sport">Sport</Chip>
      <Chip value="tech">Tech</Chip>
      <Chip value="culture">Culture</Chip>
    </ChipGroup>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const chips = canvas.getAllByRole('button');

    // Initially 'news' is selected
    expect(chips[0]).toHaveAttribute('aria-pressed', 'true');

    // Select 'sport' (second chip)
    await userEvent.click(chips[1]);
    expect(chips[1]).toHaveAttribute('aria-pressed', 'true');

    // Try to select a third — maxSelections=2 should block it
    await userEvent.click(chips[2]);
    expect(chips[2]).toHaveAttribute('aria-pressed', 'false');
  },
};

// ── 7. Responsive / Wrap ───────────────────────────────────────────────

export const Responsive: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Wrapping group */}
      <ChipGroup wrap>
        {['Breaking News', 'Technology', 'Sports', 'Culture', 'Science', 'Health', 'Travel', 'Food'].map(
          (label) => (
            <Chip key={label} value={label.toLowerCase().replace(' ', '-')}>
              {label}
            </Chip>
          ),
        )}
      </ChipGroup>
      {/* No-wrap (scrolling row) */}
      <div style={{ maxWidth: '320px', overflow: 'hidden' }}>
        <ChipGroup wrap={false}>
          {['Breaking News', 'Technology', 'Sports', 'Culture', 'Science', 'Health', 'Travel'].map(
            (label) => (
              <Chip key={label} value={label.toLowerCase().replace(' ', '-')}>
                {label}
              </Chip>
            ),
          )}
        </ChipGroup>
      </div>
    </div>
  ),
};

// ── 8. Surface Context — all 5 surface modes in a flat list ─────────
// Chip defaults to `appearance="secondary"`, so the surface backgrounds
// are scoped to the secondary role. Uses the root-only `--Secondary-Fill-*`
// tokens (same pattern Surface.module.css uses with `--Surface-Fill-*`).
// These are NEVER remapped inside `[data-surface]` blocks, so the
// container always shows the true fill — and the children (chips) can
// safely cascade to their inverted / tinted values without collapsing
// onto the same color as their parent. See Chip.showcase.tsx for the
// longer explanation.

const SECONDARY_SURFACE_BG: Record<string, string> = {
  default: 'var(--Surface-Default, var(--Surface-Main))',
  minimal: 'var(--Secondary-Fill-Minimal, var(--Surface-Minimal))',
  subtle: 'var(--Secondary-Fill-Subtle, var(--Surface-Subtle))',
  moderate: 'var(--Secondary-Fill-Moderate, var(--Surface-Subtle))',
  bold: 'var(--Secondary-Fill-Bold, var(--Surface-Bold))',
  elevated: 'var(--Secondary-Fill-Elevated, var(--Surface-Elevated))',
};

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
      padding: 'var(--Spacing-5)',
      borderRadius: 'var(--Shape-4)',
    };

    const sectionLabelStyle: React.CSSProperties = {
      fontSize: 'var(--Typography-Size-S)',
      color: 'var(--Text-Low)',
    };

    const group = (
      <ChipGroup multiple defaultValue={['all', 'tech']}>
        <Chip value="all" attention="high">All</Chip>
        <Chip value="news" attention="medium">News</Chip>
        <Chip value="tech" attention="high" start={<Icon icon="check" size="4" />}>Tech</Chip>
        <Chip value="sport" attention="low" end={<Icon icon="close" size="4" />}>Sport</Chip>
      </ChipGroup>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {surfaceModes.map(({ mode, label, desc }) => (
          <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            <span style={sectionLabelStyle}>{label} — {desc}</span>
            <Surface
              mode={mode}
              appearance="secondary"
              style={{ ...contentStyle, backgroundColor: SECONDARY_SURFACE_BG[mode] }}
            >
              {group}
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};
