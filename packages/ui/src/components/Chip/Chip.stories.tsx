/**
 * Chip.stories.tsx
 * Storybook documentation for Chip component
 *
 * Uses Figma terminology: Attention (High/Medium/Low). The `attention` prop is the
 * only public emphasis API; the internal variant (bold/subtle/ghost) is derived from
 * it solely for CSS class / data-variant resolution.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent } from 'storybook/test';
import { Chip } from './Chip';
import { Icon } from '../Icon/Icon';
import React from 'react';
import {
  ChipAttentionLevels,
  ChipSizes,
  ChipStates,
  ChipFocusState,
  ChipWithSlots,
  ChipAppearances,
  ChipSurfaceContext,
} from './Chip.showcase';

// Use explicit args type to avoid Storybook inference issues with controlled props
type ChipStoryArgs = {
  children?: React.ReactNode;
  attention?: 'high' | 'medium' | 'low';
  size?: 's' | 'm' | 'l';
  appearance?: import('@oneui/shared').ComponentAppearance;
  defaultSelected?: boolean;
  disabled?: boolean;
};

const meta = {
  title: 'Components/Actions/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Interactive toggleable pill element for filtering, selection, and categorization. Uses Base UI Toggle for full accessibility (aria-pressed, keyboard nav). Supports start/end slots for icons, avatars, counter badges, and indicator badges.',
      },
    },
  },
  argTypes: {
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      description: 'Attention level — High (filled when selected), Medium (tinted when selected), Low (outlined)',
      table: { defaultValue: { summary: 'high' } },
    },
    size: {
      control: 'select',
      options: ['s', 'm', 'l'],
      description: 'Chip size',
      table: { defaultValue: { summary: 'm' } },
    },
    appearance: {
      control: 'radio',
      options: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
      description: 'Multi-accent appearance role',
      table: { defaultValue: { summary: 'secondary' } },
    },
    defaultSelected: {
      control: 'boolean',
      description: 'Initial selected state (uncontrolled — chip can still be toggled by clicking)',
      table: { defaultValue: { summary: 'true' } },
    },
    selected: {
      table: { disable: true },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the chip is disabled',
      table: { defaultValue: { summary: 'false' } },
    },
    children: {
      control: 'text',
      description: 'Chip text content',
    },
    start: {
      control: false,
      description: 'Content before the label. Accepts Icon, Avatar, CounterBadge, or IndicatorBadge.',
    },
    end: {
      control: false,
      description: 'Content after the label. Accepts Icon, Avatar, CounterBadge, or IndicatorBadge.',
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof Chip>;

/** Label style for section headers */
const sectionLabelStyle: React.CSSProperties = { fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' };

// 1. Default — starts selected from the component's uncontrolled default.
export const Default: Story = {
  render: (args: ChipStoryArgs) => (
    <Chip
      attention={args.attention}
      size={args.size}
      appearance={args.appearance as any}
      defaultSelected={args.defaultSelected}
      disabled={args.disabled}
      aria-label="Filter chip"
    >
      {args.children}
    </Chip>
  ),
  args: {
    children: 'Chip',
    attention: 'high',
    size: 'm',
    appearance: 'secondary',
  },
};

// 2. Attention Levels — High/Medium/Low × Selected/Unselected
export const AttentionLevels: Story = {
  name: 'Attention Levels',
  render: () => <ChipAttentionLevels />,
};

// 3. Sizes — S/M/L
export const Sizes: Story = {
  name: 'Sizes',
  render: () => <ChipSizes />,
};

// 4. States — Disabled, Selected
export const States: Story = {
  name: 'States',
  render: () => <ChipStates />,
};

// 4b. Focus State — force-renders the focus ring via data-force-state
export const FocusState: Story = {
  name: 'Focus State',
  render: () => <ChipFocusState />,
};

// 5. WithSlots — all Figma slot types: Icon, Avatar, CounterBadge, IndicatorBadge
export const WithSlots: Story = {
  name: 'With Slots',
  render: () => <ChipWithSlots />,
};

// 6. Interactive — Play functions for testing toggle behavior
export const Interactive: Story = {
  name: 'Interactive',
  args: {
    children: 'Click to toggle',
    attention: 'high',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button');

    // Initially pressed by default.
    await expect(chip).toHaveAttribute('aria-pressed', 'true');

    // Click to deselect.
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-pressed', 'false');

    // Click again to select.
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  },
};

// 7. Appearances — All roles, selected vs unselected
export const Appearances: Story = {
  name: 'Appearances',
  render: () => <ChipAppearances />,
};

// 8. Surface Context — all surface modes via shared showcase
export const SurfaceContext: Story = {
  name: 'Surface Context',
  render: () => <ChipSurfaceContext />,
};

// Motion — Tap interaction: surface colour change + scale down
//
// From Convex motion foundations (JIO_INTERACTION_PATTERNS → tap):
//   Surface Colour: background-color, Duration-M, Transition easing
//   Scale Down: 3% (default), Duration-M, Transition easing, interruptible
//   Disable: opacity 30%, Duration-M, Transition easing
//
// Subtle: surface colour only, no scale/transform.

const chipMotionCSS = `
  .chip-motion-wrap {
    display: flex;
    transition: opacity var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate);
  }
  .chip-motion-wrap.chip-motion-disabled {
    opacity: 0.3;
    pointer-events: none;
  }
  .chip-motion-subtle button:active {
    transform: none !important;
  }
`;

function ChipMotionDemo({
  appearance,
  size,
  disabled,
  reducedMotion = false,
}: {
  appearance?: React.ComponentProps<typeof Chip>['appearance'];
  size?: React.ComponentProps<typeof Chip>['size'];
  disabled?: boolean;
  reducedMotion?: boolean;
}) {
  const columnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--Spacing-3)',
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 'var(--Typography-Size-S)',
    color: 'var(--Text-Low)',
  };

  return (
    <>
      <style>{chipMotionCSS}</style>
      <div
        className={`story-column${reducedMotion ? ' chip-motion-subtle' : ''}`}
        style={{ gap: 'var(--Spacing-5)', alignItems: 'center' }}
      >
        <div className="story-column" style={{ gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
          {(['high', 'medium', 'low'] as const).map((attention) => (
            <div key={attention} style={columnStyle}>
              <span style={sectionLabel}>{attention[0].toUpperCase() + attention.slice(1)}</span>
              <div className="story-row" style={{ gap: 'var(--Spacing-3-5)' }}>
                <div className={`chip-motion-wrap${disabled ? ' chip-motion-disabled' : ''}`}>
                  <Chip attention={attention} appearance={appearance} size={size} defaultSelected>
                    Selected
                  </Chip>
                </div>
                <div className={`chip-motion-wrap${disabled ? ' chip-motion-disabled' : ''}`}>
                  <Chip attention={attention} appearance={appearance} size={size}>
                    Unselected
                  </Chip>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export const Motion: Story = {
  name: 'Motion',
  parameters: {
    docs: {
      source: {
        language: 'css',
        code: `/* Tap interaction — in Chip.module.css (component-level)
   Surface colour transition: Duration-M, Transition-Moderate */

.chip {
  transition:
    background-color var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate),
    color var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate),
    border-color var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate),
    box-shadow var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate),
    opacity var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate);
}`,
      },
    },
  },
  args: {
    appearance: 'auto' as any,
    size: 'm',
  },
  argTypes: {
    subtleMotion: {
      name: 'Subtle motion',
      control: 'boolean',
      description: 'Subtle motion (reduced motion accessibility mode)',
      table: {
        category: 'Accessibility',
        defaultValue: { summary: 'false' },
      },
    },
  } as any,
  render: (args: ChipStoryArgs & { subtleMotion?: boolean }) => (
    <ChipMotionDemo
      appearance={args.appearance}
      size={args.size}
      disabled={args.disabled}
      reducedMotion={args.subtleMotion}
    />
  ),
  play: async ({ canvasElement, args }: { canvasElement: HTMLElement; args: ChipStoryArgs & { subtleMotion?: boolean } }) => {
    if (!args.subtleMotion) return;

    const assertNoTransformMotion = (label: string) => {
      canvasElement.querySelectorAll('*').forEach((el) => {
        const styles = getComputedStyle(el);

        const animName = styles.animationName;
        if (animName && animName !== 'none') {
          expect(animName, `[${label}] Active CSS animation "${animName}" — must be disabled in subtle motion`).toBe('none');
        }

        const transitionProp = styles.transitionProperty;
        if (transitionProp && transitionProp !== 'none') {
          const hasTransform = transitionProp.split(',').some(
            (p) => p.trim() === 'transform' || p.trim() === 'all',
          );
          expect(hasTransform, `[${label}] Transitions "${transitionProp}" — transform must be disabled in subtle motion`).toBe(false);
        }
      });
    };

    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    for (const btn of buttons) {
      await userEvent.click(btn);
      assertNoTransformMotion('Tap');
    }
  },
};
