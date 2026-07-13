/**
 * Scrim.stories.tsx
 * Storybook documentation — axes from Figma node 4078:17919
 *
 * Variant display logic lives in Scrim.showcase.tsx — imported here and in the
 * platform documentation page so both stay in sync with zero duplication.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import React from 'react';
import { Scrim } from './Scrim';
import {
  ScrimPreviewFrame,
  ScrimSizes,
  ScrimAttentionLevels,
  ScrimPositions,
  ScrimOverlay,
  ScrimVariants,
  ScrimSizeAttentionMatrix,
  ScrimPositionSizeMatrix,
} from './Scrim.showcase';

const meta = {
  title: 'Components/Layout/Scrim',
  component: Scrim,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Non-interactive overlay for media legibility (directional gradient) or modal backdrops (uniform fill). Props align with Figma: position, size, attention, variant. Token-driven CSS (Carousel/Button pattern).',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['gradient', 'overlay'],
      description: '`gradient` = directional edge fade. `overlay` = uniform full-container fill — position and size are not applicable.',
      table: { defaultValue: { summary: 'gradient' } },
    },
    position: {
      control: 'radio',
      options: ['bottom', 'left', 'top', 'right'],
      description: 'Edge to anchor the gradient. Only used when variant=gradient.',
      table: { defaultValue: { summary: 'bottom' } },
      if: { arg: 'variant', eq: 'gradient' },
    },
    size: {
      control: 'select',
      options: ['xs', 's', 'm', 'l', 'xl', 'full'],
      description: 'How far the fade extends from the edge. Only used when variant=gradient.',
      table: { defaultValue: { summary: 's' } },
      if: { arg: 'variant', eq: 'gradient' },
    },
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      description: 'Fill strength. Gradient: element opacity (0.95/0.5/0.25). Overlay: tint density (50%/33%/17%).',
      table: { defaultValue: { summary: 'medium' } },
    },
  },
} satisfies Meta<typeof Scrim>;

export default meta;
type Story = StoryObj<typeof Scrim>;

/* ========================================
   1. Default — Figma symbol 4301:4757
   ======================================== */
export const Default: Story = {
  render: (args) => (
    <ScrimPreviewFrame>
      <Scrim {...args} />
    </ScrimPreviewFrame>
  ),
  args: {
    position: 'bottom',
    size: 's',
    attention: 'medium',
    variant: 'gradient',
  },
  play: async ({ canvasElement }) => {
    const anchor = canvasElement.querySelector('[data-oneui-component="Scrim"]');
    expect(anchor).toBeTruthy();
    expect(anchor?.getAttribute('data-position')).toBe('bottom');
    expect(anchor?.getAttribute('data-size')).toBe('s');
    expect(anchor?.getAttribute('data-attention')).toBe('medium');
    expect(anchor?.getAttribute('data-variant')).toBe('gradient');
  },
};

/* ========================================
   2. Sizes
   ======================================== */
export const Sizes: Story = {
  render: () => <ScrimSizes />,
  parameters: {
    docs: {
      description: {
        story: 'Figma size axis (XS–XL) on a bottom-anchored gradient scrim at medium attention.',
      },
    },
  },
};

/* ========================================
   3. Attention Levels
   ======================================== */
export const AttentionLevels: Story = {
  render: () => <ScrimAttentionLevels />,
  parameters: {
    docs: {
      description: {
        story: 'Figma attention axis — high, medium, low — on a bottom gradient (size M).',
      },
    },
  },
};

/* ========================================
   4. Positions
   ======================================== */
export const Positions: Story = {
  render: () => <ScrimPositions />,
  parameters: {
    docs: {
      description: {
        story: 'Figma position axis — bottom, top, left, right — gradient variant at size M.',
      },
    },
  },
};

/* ========================================
   5. Overlay — center + full + uniform fill
   ======================================== */
export const Overlay: Story = {
  render: () => <ScrimOverlay />,
  parameters: {
    docs: {
      description: {
        story:
          'Figma overlay variant — uniform full-container fill. position and size are not applicable. ' +
          'Uses Material-Translucent-Dark tokens: high=50%, medium=33%, low=17%.',
      },
    },
  },
};

/* ========================================
   6. Variants — gradient vs overlay
   ======================================== */
export const Variants: Story = {
  render: () => <ScrimVariants />,
  parameters: {
    docs: {
      description: {
        story: 'Figma variant axis — directional gradient vs uniform overlay.',
      },
    },
  },
};

/* ========================================
   7. Size × Attention matrix
   ======================================== */
export const SizeAttentionMatrix: Story = {
  render: () => <ScrimSizeAttentionMatrix />,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Size × Attention cross-product — shows how band spread (mask-size) and element opacity interact. ' +
          'Columns = XS→XL (20%→100% band). Rows = high (0.95) / medium (0.5) / low (0.25) opacity. ' +
          'Matches Figma: each variant stores size in the mask SVG endpoint and attention as rect opacity.',
      },
    },
  },
};

/* ========================================
   8. Position × Size matrix
   ======================================== */
export const PositionSizeMatrix: Story = {
  render: () => <ScrimPositionSizeMatrix />,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Full Figma doc matrix — every position × size combination at medium attention, gradient variant.',
      },
    },
  },
};
