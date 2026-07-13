/**
 * Icon.stories.tsx
 *
 * Storybook stories for the design-system Icon component.
 * Uses semantic icon names resolved from the Jio icon set
 * (configured via IconProvider + Jio loader in preview.ts).
 * Surface context mirrors Avatar.stories.tsx pattern.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Icon } from './Icon';
import { Surface } from '../Surface';
import { ICON_SIZES, type IconSize, type IconAppearance, type IconEmphasis } from './Icon.shared';
import { IconSizes, IconEmphasisLevels, IconWithIcons, IconInContext } from './Icon.showcase';

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
  title: 'Components/Media/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ICON_SIZES,
    },
    appearance: {
      control: 'select',
      options: [
        'neutral',
        'primary',
        'secondary',
        'sparkle',
        'negative',
        'positive',
        'warning',
        'informative',
      ],
    },
    emphasis: {
      control: 'select',
      options: ['high', 'medium', 'low', 'tinted', 'tintedA11y'],
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof Icon>;

// 1. Default
export const Default: Story = {
  args: {
    icon: 'heart',
    size: '5',
    'aria-label': 'Heart',
  },
};

// 2. Sizes — all 20 sizes
export const Sizes: Story = {
  render: () => <IconSizes />,
};

// 3. EmphasisLevels — all 5 emphasis at size 8
export const EmphasisLevels: Story = {
  name: 'Emphasis Levels',
  render: () => <IconEmphasisLevels />,
};

// 4. Appearances — all 8 roles × key emphasis levels
export const Appearances: Story = {
  render: () => {
    const appearances: IconAppearance[] = [
      'neutral',
      'primary',
      'secondary',
      'sparkle',
      'negative',
      'positive',
      'warning',
      'informative',
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        {(['high', 'tinted', 'tintedA11y'] as IconEmphasis[]).map((emphasis) => (
          <div
            key={emphasis}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)' }}
          >
            <span style={{ ...rowLabelStyle, minWidth: 'var(--Spacing-10)' }}>{emphasis}</span>
            <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
              {appearances.map((app) => (
                <div
                  key={app}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--Spacing-2)',
                  }}
                >
                  <Icon
                    icon="heart"
                    appearance={app}
                    emphasis={emphasis}
                    size="8"
                    aria-label={`${emphasis} ${app}`}
                  />
                  <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-3XS)' }}>
                    {app}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// 5. WithIcons — various semantic icons from Jio icon set
export const WithIcons: Story = {
  name: 'With Icons',
  render: () => <IconWithIcons />,
};

// 6. Interactive
export const Interactive: Story = {
  args: {
    icon: 'heart',
    size: '5',
    appearance: 'neutral',
    emphasis: 'high',
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
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 'var(--Spacing-3-5)',
      padding: 'var(--Spacing-4-5)',
      borderRadius: 'var(--Shape-4)',
    };

    const iconContent = (
      <>
        <Icon icon="heart" emphasis="high" size="8" aria-label="High" />
        <Icon icon="heart" emphasis="medium" size="8" aria-label="Medium" />
        <Icon icon="heart" emphasis="low" size="8" aria-label="Low" />
        <Icon icon="heart" emphasis="tinted" size="8" aria-label="Tinted" />
        <Icon icon="heart" emphasis="tintedA11y" size="8" aria-label="TintedA11y" />
      </>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {surfaceModes.map(({ mode, label, desc }) => (
          <div
            key={mode}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}
          >
            <span style={labelStyle}>
              {label} — {desc}
            </span>
            <Surface mode={mode} appearance="secondary" style={surfaceStyle}>
              {iconContent}
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 8. InContext — icon inline with text
export const InContext: Story = {
  name: 'In Context',
  render: () => <IconInContext />,
};
