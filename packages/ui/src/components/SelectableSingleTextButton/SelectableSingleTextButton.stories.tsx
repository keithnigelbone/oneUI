/**
 * SelectableSingleTextButton.stories.tsx
 * Storybook documentation for SelectableSingleTextButton component
 *
 * Single text toggle button — max 2 characters (e.g. "Ag", "En", "A").
 * Renders circular; shape customisable per brand.
 * Unselected = always muted; selected = attention-driven.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import { SelectableSingleTextButton } from './SelectableSingleTextButton';
import { Surface } from '../Surface';
import { FocusStateGrid } from '../_storyHelpers/FocusStateGrid';
import React, { useState } from 'react';

type SelectableSingleTextButtonStoryArgs = {
  children?: string;
  attention?: 'high' | 'medium' | 'low';
  size?: 's' | 'm' | 'l';
  appearance?: string;
  condensed?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

const meta = {
  title: 'Components/Actions/SelectableSingleTextButton',
  component: SelectableSingleTextButton as any,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Circular single-text toggle button (max 2 characters). Stays selected after click. Unselected state is always muted ghost. Selected appearance is driven by `attention`: high=bold fill, medium=subtle fill, low=ghost with accent border. 3 sizes (S/M/L). Shape customisable per brand.',
      },
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Text label — max 2 characters (e.g. "Ag", "En", "A")',
      table: { defaultValue: { summary: 'Ag' } },
    },
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      description: 'Attention level — drives the SELECTED visual prominence',
      table: { defaultValue: { summary: 'high' } },
    },
    size: {
      control: 'select',
      options: ['s', 'm', 'l'],
      description: 'Button size (S/M/L only)',
      table: { defaultValue: { summary: 'm' } },
    },
    appearance: {
      control: 'radio',
      options: [
        'auto',
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'brand-bg',
        'positive',
        'negative',
        'warning',
        'informative',
      ],
      description: 'Multi-accent appearance role',
      table: { defaultValue: { summary: 'auto' } },
    },
    condensed: {
      control: 'boolean',
      description: 'Condensed mode — reduced height + padding',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to fill container width (overrides circular shape)',
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
} satisfies Meta<SelectableSingleTextButtonStoryArgs>;

export default meta;
type Story = StoryObj<SelectableSingleTextButtonStoryArgs>;

// 1. Default — interactive controls
export const Default: Story = {
  args: {
    children: 'Ag',
    attention: 'high',
    size: 'm',
    condensed: false,
    disabled: false,
    loading: false,
  },
  render: ({ children, appearance, ...args }: SelectableSingleTextButtonStoryArgs) => (
    <SelectableSingleTextButton
      {...args}
      appearance={
        appearance as import('./SelectableSingleTextButton.shared').SelectableSingleTextButtonAppearance
      }
      defaultSelected
    >
      {children}
    </SelectableSingleTextButton>
  ),
};

// 1b. Focus State — force-renders the focus ring via data-force-state
export const FocusState: Story = {
  name: 'Focus State',
  render: () => (
    <FocusStateGrid
      renderItem={(attention, selected) => (
        <SelectableSingleTextButton attention={attention} defaultSelected={selected}>
          Ag
        </SelectableSingleTextButton>
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
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>
          Selected
        </span>
        <div
          style={{
            display: 'flex',
            gap: 'var(--Spacing-4)',
            marginTop: 'var(--Spacing-3)',
          }}
        >
          <SelectableSingleTextButton attention="high" defaultSelected>
            Ag
          </SelectableSingleTextButton>
          <SelectableSingleTextButton attention="medium" defaultSelected>
            Ag
          </SelectableSingleTextButton>
          <SelectableSingleTextButton attention="low" defaultSelected>
            Ag
          </SelectableSingleTextButton>
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>
          Unselected (always muted ghost)
        </span>
        <div
          style={{
            display: 'flex',
            gap: 'var(--Spacing-4)',
            marginTop: 'var(--Spacing-3)',
          }}
        >
          <SelectableSingleTextButton attention="high">Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton attention="medium">Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton attention="low">Ag</SelectableSingleTextButton>
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
        <div
          key={attention}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}
        >
          <span
            style={{
              fontSize: 'var(--Typography-Size-S)',
              color: 'var(--Text-Low)',
              textTransform: 'capitalize',
            }}
          >
            {attention} attention
          </span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
            <SelectableSingleTextButton attention={attention} defaultSelected>
              Ag
            </SelectableSingleTextButton>
            <SelectableSingleTextButton attention={attention}>
              Ag
            </SelectableSingleTextButton>
          </div>
        </div>
      ))}
    </div>
  ),
};

// 4. Sizes — S/M/L
export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Selected</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableSingleTextButton size="s" defaultSelected>Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton size="m" defaultSelected>Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton size="l" defaultSelected>Ag</SelectableSingleTextButton>
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Unselected</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', marginTop: 'var(--Spacing-3)', alignItems: 'center' }}>
          <SelectableSingleTextButton size="s">Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton size="m">Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton size="l">Ag</SelectableSingleTextButton>
        </div>
      </div>
    </div>
  ),
};

// 5. Condensed mode
export const Condensed: Story = {
  name: 'Condensed',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>
          Normal
        </span>
        <div
          style={{
            display: 'flex',
            gap: 'var(--Spacing-4)',
            marginTop: 'var(--Spacing-3)',
            alignItems: 'center',
          }}
        >
          <SelectableSingleTextButton size="s" defaultSelected>Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton size="m" defaultSelected>Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton size="l" defaultSelected>Ag</SelectableSingleTextButton>
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>
          Condensed (same typography, reduced size)
        </span>
        <div
          style={{
            display: 'flex',
            gap: 'var(--Spacing-4)',
            marginTop: 'var(--Spacing-3)',
            alignItems: 'center',
          }}
        >
          <SelectableSingleTextButton size="s" condensed defaultSelected>Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton size="m" condensed defaultSelected>Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton size="l" condensed defaultSelected>Ag</SelectableSingleTextButton>
        </div>
      </div>
    </div>
  ),
};

// 6. Appearances — all 9 V4 roles
export const Appearances: Story = {
  name: 'Appearances',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {(
        [
          'primary',
          'secondary',
          'neutral',
          'sparkle',
          'brand-bg',
          'positive',
          'negative',
          'warning',
          'informative',
        ] as const
      ).map((role) => (
        <div
          key={role}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}
        >
          <span
            style={{
              fontSize: 'var(--Typography-Size-S)',
              color: 'var(--Text-Low)',
              textTransform: 'capitalize',
            }}
          >
            {role}
          </span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
            <SelectableSingleTextButton appearance={role} attention="high" defaultSelected>
              Ag
            </SelectableSingleTextButton>
            <SelectableSingleTextButton appearance={role} attention="medium" defaultSelected>
              Ag
            </SelectableSingleTextButton>
            <SelectableSingleTextButton appearance={role} attention="low" defaultSelected>
              Ag
            </SelectableSingleTextButton>
            <SelectableSingleTextButton appearance={role} attention="high">
              Ag
            </SelectableSingleTextButton>
          </div>
        </div>
      ))}
    </div>
  ),
};

// 7. Interactive — play function verifies toggle behavior
export const Interactive: Story = {
  args: {
    children: 'Ag',
    attention: 'high',
    size: 'm',
  },
  render: ({ children, appearance, ...args }: SelectableSingleTextButtonStoryArgs) => (
    <SelectableSingleTextButton
      {...args}
      appearance={
        appearance as import('./SelectableSingleTextButton.shared').SelectableSingleTextButtonAppearance
      }
    >
      {children}
    </SelectableSingleTextButton>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'false');

    button.focus();
    await userEvent.keyboard(' ');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  },
};

// 8. States — disabled and loading
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>
          Disabled unselected
        </span>
        <div
          style={{
            display: 'flex',
            gap: 'var(--Spacing-4)',
            marginTop: 'var(--Spacing-3)',
          }}
        >
          <SelectableSingleTextButton attention="high" disabled>Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton attention="medium" disabled>Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton attention="low" disabled>Ag</SelectableSingleTextButton>
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>
          Disabled selected
        </span>
        <div
          style={{
            display: 'flex',
            gap: 'var(--Spacing-4)',
            marginTop: 'var(--Spacing-3)',
          }}
        >
          <SelectableSingleTextButton attention="high" disabled defaultSelected>Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton attention="medium" disabled defaultSelected>Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton attention="low" disabled defaultSelected>Ag</SelectableSingleTextButton>
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>
          Loading
        </span>
        <div
          style={{
            display: 'flex',
            gap: 'var(--Spacing-4)',
            marginTop: 'var(--Spacing-3)',
          }}
        >
          <SelectableSingleTextButton attention="high" loading>Ag</SelectableSingleTextButton>
          <SelectableSingleTextButton attention="medium" loading defaultSelected>Ag</SelectableSingleTextButton>
        </div>
      </div>
    </div>
  ),
};

// 9. Surface Context — all 5 surface modes in a flat list
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
              <SelectableSingleTextButton attention="high" defaultSelected>Ag</SelectableSingleTextButton>
              <SelectableSingleTextButton attention="medium" defaultSelected>Ag</SelectableSingleTextButton>
              <SelectableSingleTextButton attention="low" defaultSelected>Ag</SelectableSingleTextButton>
              <SelectableSingleTextButton attention="high">Ag</SelectableSingleTextButton>
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 10. Real-world: Language Selector
export const RealWorldLanguageSelector: Story = {
  name: 'Real-world: Language Selector',
  render: () => {
    const LanguageSelector = () => {
      const [activeLang, setActiveLang] = useState<string>('En');

      const languages = [
        { id: 'En', label: 'En' },
        { id: 'Hi', label: 'Hi' },
        { id: 'Ta', label: 'Ta' },
        { id: 'Mr', label: 'Mr' },
      ];

      return (
        <div style={{ display: 'flex', gap: 'var(--Spacing-3)', flexWrap: 'wrap' }}>
          {languages.map(({ id, label }) => (
            <SelectableSingleTextButton
              key={id}
              attention="high"
              selected={activeLang === id}
              onSelectedChange={(sel) => {
                if (sel) setActiveLang(id);
              }}
            >
              {label}
            </SelectableSingleTextButton>
          ))}
        </div>
      );
    };

    return <LanguageSelector />;
  },
};
