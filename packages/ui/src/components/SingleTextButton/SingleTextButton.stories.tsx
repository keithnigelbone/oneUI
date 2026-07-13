/**
 * SingleTextButton.stories.tsx
 * Storybook documentation for SingleTextButton component.
 *
 * Single text action button — max 2 characters (e.g. "Ag", "En", "A").
 * Renders circular; shape customisable per brand.
 * Attention drives the visual: high=bold fill, medium=subtle fill, low=ghost.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect, fn } from 'storybook/test';
import { SingleTextButton } from './SingleTextButton';
import { Surface } from '../Surface';
import React from 'react';

type SingleTextButtonStoryArgs = {
  children?: string;
  attention?: 'high' | 'medium' | 'low';
  size?: 's' | 'm' | 'l';
  appearance?: string;
  condensed?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
};

const meta = {
  title: 'Components/Actions/SingleTextButton',
  component: SingleTextButton as any,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Circular single-text action button (max 2 characters). Attention drives the visual: high=bold fill, medium=subtle fill, low=ghost. 3 sizes (S/M/L). Shape customisable per brand.',
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
      description: 'Attention level — drives the visual variant',
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
        'tertiary',
        'quaternary',
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
} satisfies Meta<SingleTextButtonStoryArgs>;

export default meta;
type Story = StoryObj<SingleTextButtonStoryArgs>;

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
  render: ({ children, appearance, ...args }: SingleTextButtonStoryArgs) => (
    <SingleTextButton
      {...args}
      appearance={
        appearance as import('./SingleTextButton.shared').SingleTextButtonAppearance
      }
    >
      {children}
    </SingleTextButton>
  ),
};

// 2. Attention Levels — visual comparison of the three variants
export const AttentionLevels: Story = {
  name: 'Attention Levels',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>
          Attention drives the visual
        </span>
        <div
          style={{
            display: 'flex',
            gap: 'var(--Spacing-4)',
            marginTop: 'var(--Spacing-3)',
            alignItems: 'center',
          }}
        >
          <SingleTextButton attention="high">Ag</SingleTextButton>
          <SingleTextButton attention="medium">Ag</SingleTextButton>
          <SingleTextButton attention="low">Ag</SingleTextButton>
        </div>
      </div>
    </div>
  ),
};

// 3. Sizes — S/M/L
export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
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
          <div
            style={{
              display: 'flex',
              gap: 'var(--Spacing-4)',
              alignItems: 'center',
            }}
          >
            <SingleTextButton attention={attention} size="s">Ag</SingleTextButton>
            <SingleTextButton attention={attention} size="m">Ag</SingleTextButton>
            <SingleTextButton attention={attention} size="l">Ag</SingleTextButton>
          </div>
        </div>
      ))}
    </div>
  ),
};

// 4. Condensed mode
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
          <SingleTextButton size="s">Ag</SingleTextButton>
          <SingleTextButton size="m">Ag</SingleTextButton>
          <SingleTextButton size="l">Ag</SingleTextButton>
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
          <SingleTextButton size="s" condensed>Ag</SingleTextButton>
          <SingleTextButton size="m" condensed>Ag</SingleTextButton>
          <SingleTextButton size="l" condensed>Ag</SingleTextButton>
        </div>
      </div>
    </div>
  ),
};

// 5. Appearances — all 11 V4 roles
export const Appearances: Story = {
  name: 'Appearances',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {(
        [
          'primary',
          'secondary',
          'tertiary',
          'quaternary',
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
            <SingleTextButton appearance={role} attention="high">Ag</SingleTextButton>
            <SingleTextButton appearance={role} attention="medium">Ag</SingleTextButton>
            <SingleTextButton appearance={role} attention="low">Ag</SingleTextButton>
          </div>
        </div>
      ))}
    </div>
  ),
};

// 6. States — disabled and loading
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>
          Disabled
        </span>
        <div
          style={{
            display: 'flex',
            gap: 'var(--Spacing-4)',
            marginTop: 'var(--Spacing-3)',
          }}
        >
          <SingleTextButton attention="high" disabled>Ag</SingleTextButton>
          <SingleTextButton attention="medium" disabled>Ag</SingleTextButton>
          <SingleTextButton attention="low" disabled>Ag</SingleTextButton>
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
          <SingleTextButton attention="high" loading>Ag</SingleTextButton>
          <SingleTextButton attention="medium" loading>Ag</SingleTextButton>
          <SingleTextButton attention="low" loading>Ag</SingleTextButton>
        </div>
      </div>
    </div>
  ),
};

// 7. Surface Context — verifies token remapping across surfaces
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
              <SingleTextButton attention="high">Ag</SingleTextButton>
              <SingleTextButton attention="medium">Ag</SingleTextButton>
              <SingleTextButton attention="low">Ag</SingleTextButton>
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 8. Interactive — play function verifies click behavior
export const Interactive: Story = {
  args: {
    children: 'Ag',
    attention: 'high',
    size: 'm',
    onClick: fn(),
  },
  render: ({ children, appearance, ...args }: SingleTextButtonStoryArgs) => (
    <SingleTextButton
      {...args}
      appearance={
        appearance as import('./SingleTextButton.shared').SingleTextButtonAppearance
      }
    >
      {children}
    </SingleTextButton>
  ),
  play: async ({ canvasElement, args }: { canvasElement: HTMLElement; args: SingleTextButtonStoryArgs }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toBeInTheDocument();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    button.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

// 9. Real-world: Avatar-style initials row
export const RealWorldInitialsRow: Story = {
  name: 'Real-world: Initials Row',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-3)', flexWrap: 'wrap' }}>
      <SingleTextButton attention="high" appearance="primary">Ak</SingleTextButton>
      <SingleTextButton attention="medium" appearance="secondary">Mw</SingleTextButton>
      <SingleTextButton attention="medium" appearance="tertiary">Jp</SingleTextButton>
      <SingleTextButton attention="medium" appearance="positive">Ra</SingleTextButton>
      <SingleTextButton attention="low" appearance="neutral">+3</SingleTextButton>
    </div>
  ),
};
