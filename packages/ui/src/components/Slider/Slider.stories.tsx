/**
 * Slider.stories.tsx
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import React from 'react';
import { Slider } from './Slider';
import {
  SliderAppearances,
  SliderStates,
  SliderTypes,
  SliderKnobStyles,
  SliderKnobStates,
  SliderWithSteps,
  SliderWithSlots,
  SliderVertical,
  SliderSurfaceContext,
} from './Slider.showcase';

const meta = {
  title: 'Components/Inputs/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Precision range input built on Base UI Slider. Single size per Figma spec, multi-accent appearance (9 roles), inside/outside knob styles, range mode, step ticks, value tooltip, and horizontal/vertical orientation. Surface-context-aware via [data-surface] remapping.',
      },
    },
  },
  argTypes: {
    appearance: {
      control: 'select',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative',
      ],
      table: { defaultValue: { summary: 'secondary' } },
    },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    knobStyle: {
      control: 'radio',
      options: ['outside', 'inside'],
      table: { defaultValue: { summary: 'outside' } },
    },
    showTooltip: {
      control: 'radio',
      options: ['auto', 'always', false],
      table: { defaultValue: { summary: 'auto' } },
    },
    showSteps: { control: 'boolean' },
    snapToSteps: {
      control: 'boolean',
      description: 'When true, the thumb snaps to exact step positions. When false, dragging is continuous but ticks still appear.',
      table: { defaultValue: { summary: 'true' } },
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    subtleMotion: {
      control: 'boolean',
      description: 'Suppress scale + tooltip animations — keeps colour transitions (mirrors prefers-reduced-motion)',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  render: (args: React.ComponentProps<typeof Slider>) => (
    <div style={{ width: 328, paddingTop: 'var(--Spacing-7)' }}>
      <Slider {...args} />
    </div>
  ),
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 50,
    'aria-label': 'Volume',
    // step=10 so enabling showSteps in the Controls panel renders 11 visible
    // ticks (0–100 ÷ 10). step=1 would produce 101 ticks which exceeds the
    // 64-tick safety guard and silently renders nothing.
    step: 10,
  },
};

export const Appearances: Story = { render: () => <SliderAppearances /> };
export const States: Story = { render: () => <SliderStates /> };
export const Types: Story = { render: () => <SliderTypes /> };
export const KnobStyles: Story = { name: 'Knob Styles', render: () => <SliderKnobStyles /> };
export const KnobStates: Story = {
  name: 'Knob States',
  parameters: {
    docs: {
      description: {
        story:
          'Visual preview of idle / hover / focus / pressed for both knob styles. The focus and pressed rows use a `data-force-state` wrapper to simulate the interactive state without real pointer/keyboard input, matching Figma node `.Knob` (5723:7913).',
      },
    },
  },
  render: () => <SliderKnobStates />,
};
export const WithSteps: Story = { name: 'With Steps', render: () => <SliderWithSteps /> };
export const WithSlots: Story = {
  name: 'With Slots',
  parameters: {
    docs: {
      description: {
        story:
          'Start/end slots hold an IconButton (or any small control) on either side of the track. Matches Figma node 5862:6197 — 30×30 slots with a 10px gap (Spacing-2-5) to the track.',
      },
    },
  },
  render: () => <SliderWithSlots />,
};
export const Vertical: Story = { render: () => <SliderVertical /> };
export const SurfaceContext: Story = { name: 'Surface Context', render: () => <SliderSurfaceContext /> };

function SliderMotionDemo({ subtleMotion = false }: { subtleMotion?: boolean }) {
  return (
    <div
      style={
        subtleMotion
          ? ({
              '--Motion-Duration-L': '0ms',
              '--Motion-Duration-M': '0ms',
              '--Slider-knobScale-outside': '1',
              '--Slider-knobScale-inside': '1',
            } as React.CSSProperties)
          : undefined
      }
    >
      <SliderKnobStyles />
    </div>
  );
}

export const Motion: Story = {
  name: 'Motion',
  args: { subtleMotion: false } as any,
  parameters: {
    docs: {
      source: {
        language: 'css',
        code: `/* Knob scale — SliderKnob.module.css */
.dot {
  transform: scale(1);
  transition:
    transform var(--Motion-Duration-L) var(--Motion-Easing-Transition-Moderate),
    background-color var(--Motion-Duration-XS) var(--Motion-Easing-Transition-Moderate),
    box-shadow var(--Motion-Duration-XS) var(--Motion-Easing-Transition-Moderate);
}
/* outside: 12px → 18px (scale 1.5)  |  inside: 4px → 8px (scale 2) */
/* data-knob-active is set per-thumb via focus bubbling — only the interacted knob scales in range mode */
[data-knob-style="outside"] .knob:hover .dot,
[data-knob-style="outside"] .knob[data-knob-active] .dot,
[data-knob-style="outside"] .knob:has(:focus-visible) .dot { transform: scale(var(--Slider-knobScale-outside, 1.5)); }
[data-knob-style="inside"]  .knob:hover .dot,
[data-knob-style="inside"]  .knob[data-knob-active] .dot,
[data-knob-style="inside"]  .knob:has(:focus-visible) .dot { transform: scale(var(--Slider-knobScale-inside,  2));   }

/* Value tooltip — SliderValueTooltip.module.css
   Matches Tooltip component: opacity + translate, Entrance / Exit easing */
.bubble {
  opacity: 0;
  transform: translateY(5px);
  /* Exit spec (fires on shown → hidden) */
  transition:
    opacity   var(--Motion-Duration-M) var(--Motion-Easing-Exit-Moderate),
    transform var(--Motion-Duration-M) var(--Motion-Easing-Exit-Moderate);
}
/* Entrance spec (fires on hidden → shown) */
[data-dragging] > .bubble,
:has(:focus-visible) > .bubble {
  opacity: 1;
  transform: none;
  transition:
    opacity   var(--Motion-Duration-M) var(--Motion-Easing-Entrance-Moderate),
    transform var(--Motion-Duration-M) var(--Motion-Easing-Entrance-Moderate);
}

/* Arrow tip — Duration-L entrance, Duration-M exit (matches Tooltip) */
.arrow                    { translate: 0 -6px; transition: translate var(--Motion-Duration-M) var(--Motion-Easing-Exit-Moderate); }
[data-dragging] > .bubble .arrow,
:has(:focus-visible) > .bubble .arrow { translate: 0 0;   transition: translate var(--Motion-Duration-L) var(--Motion-Easing-Entrance-Moderate); }

/* Reduced motion — suppresses scale + tooltip, keeps colour transitions */
@media (prefers-reduced-motion: reduce) {
  .dot    { transition-property: background-color, box-shadow; }
  .bubble { transition: none; }
  .arrow  { transition: none; }
}`,
      },
    },
  },
  render: (args) => <SliderMotionDemo subtleMotion={(args as any).subtleMotion} />,
};

export const Interactive: Story = {
  args: {
    defaultValue: 30,
    'aria-label': 'Interactive slider',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider');
    await expect(slider).toBeInTheDocument();
    await expect(slider).toHaveAttribute('aria-valuenow', '30');
  },
};
