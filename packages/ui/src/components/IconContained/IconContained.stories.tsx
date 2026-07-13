/**
 * IconContained.stories.tsx
 *
 * Storybook stories for the IconContained component.
 * Uses semantic icon names resolved from the Jio icon set
 * (configured via IconProvider + Jio loader in preview.ts).
 * Surface context mirrors Avatar.stories.tsx pattern.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { IconContained } from './IconContained';
import { Surface } from '../Surface';
import type { IconContainedSize, IconContainedAttention, IconContainedAppearance } from './IconContained.shared';
import {
  IconContainedAttentionLevels,
  IconContainedSizes,
  IconContainedStates,
  IconContainedWithIcons,
} from './IconContained.showcase';

/** Shared label style matching Avatar stories */
const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-XS)',
  fontWeight: 'var(--Typography-Weight-Medium)',
  color: 'var(--Text-Low)',
};

const rowLabelStyle: React.CSSProperties = {
  ...labelStyle,
  minWidth: 'var(--Spacing-9)',
  margin: 0,
};

const meta = {
  title: 'Components/Media/IconContained',
  component: IconContained,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 's', 'm', 'l', 'xl'],
    },
    attention: {
      control: 'select',
      options: ['high', 'medium'],
    },
    appearance: {
      control: 'select',
      options: [
        'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof IconContained>;

export default meta;
type Story = StoryObj<typeof IconContained>;

// 1. Default
export const Default: Story = {
  args: {
    icon: 'heart',
    'aria-label': 'Heart',
    appearance: 'secondary',
    attention: 'medium',
  },
};

// 2. AttentionLevels
export const AttentionLevels: Story = {
  name: 'Attention Levels',
  render: () => <IconContainedAttentionLevels />,
};

// 3. Sizes
export const Sizes: Story = {
  render: () => <IconContainedSizes />,
};

// 4. States
export const States: Story = {
  render: () => <IconContainedStates />,
};

// 5. WithIcons — various semantic icons from Jio set
export const WithIcons: Story = {
  name: 'With Icons',
  render: () => <IconContainedWithIcons />,
};

// 6. Interactive
export const Interactive: Story = {
  args: {
    icon: 'heart',
    size: 'm',
    attention: 'high',
    appearance: 'primary',
    'aria-label': 'Interactive heart',
  },
};

// 7. SurfaceContext — all 5 surface modes in a flat list
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

    const surfaceStyle: React.CSSProperties = {
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--Spacing-3-5)',
      padding: 'var(--Spacing-4-5)', borderRadius: 'var(--Shape-4)',
    };

    const containedContent = (
      <>
        <IconContained icon="heart" attention="high" aria-label="High" />
        <IconContained icon="heart" attention="medium" aria-label="Medium" />
      </>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {surfaceModes.map(({ mode, label, desc }) => (
          <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            <span style={labelStyle}>{label} — {desc}</span>
            <Surface mode={mode} style={surfaceStyle}>
              {containedContent}
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 8. Appearances — all 9 roles × both attention levels
export const Appearances: Story = {
  render: () => {
    const appearances: IconContainedAppearance[] = [
      'primary', 'secondary', 
      'neutral', 'sparkle', 'brand-bg',
      'positive', 'negative', 'warning', 'informative',
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        {(['high', 'medium'] as IconContainedAttention[]).map((attention) => (
          <div key={attention} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
            <span style={{ ...rowLabelStyle, minWidth: 'var(--Spacing-10)' }}>
              {attention}
            </span>
            <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', alignItems: 'center' }}>
              {appearances.map((app) => (
                <div key={app} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-2)' }}>
                  <IconContained icon="heart" attention={attention} appearance={app} aria-label={`${attention} ${app}`} />
                  <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-3XS)' }}>{app}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
