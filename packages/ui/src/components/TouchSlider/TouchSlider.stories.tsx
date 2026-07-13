/**
 * TouchSlider.stories.tsx
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import React from 'react';
import { TouchSlider } from './TouchSlider';
import {
  TouchSliderProgressStyles,
  TouchSliderWithSlots,
  TouchSliderAppearances,
  TouchSliderStates,
  TouchSliderVertical,
  TouchSliderSurfaceContext,
  TouchSliderFocusState,
  TouchSliderSlotMatrix,
} from './TouchSlider.showcase';

const meta = {
  title: 'Components/Inputs/TouchSlider',
  component: TouchSlider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Chunky, fingertip-friendly slider. The track itself is the tap target; the filled portion IS the value indicator. Single size per Figma spec.',
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
    },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    progressStyle: {
      control: 'radio',
      options: ['rounded', 'sharp'],
      table: { defaultValue: { summary: 'rounded' } },
    },
    start: { control: false, description: 'Optional node rendered before the track (e.g. an icon).' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    subtleMotion: {
      control: 'boolean',
      description: 'Suppress fill settle animation — keeps colour transitions (mirrors prefers-reduced-motion)',
      table: { defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof TouchSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 60,
    appearance: 'auto',
    'aria-label': 'Volume',
  },
};

export const ProgressStyles: Story = { name: 'Progress Styles', render: () => <TouchSliderProgressStyles /> };
export const SlotMatrix: Story = { name: 'Slot Position Matrix', render: () => <TouchSliderSlotMatrix /> };
export const WithSlots: Story = { name: 'With Icon Slots', render: () => <TouchSliderWithSlots /> };
export const Appearances: Story = { render: () => <TouchSliderAppearances /> };
export const States: Story = { render: () => <TouchSliderStates /> };
export const FocusState: Story = { name: 'Focus State', render: () => <TouchSliderFocusState /> };
export const Vertical: Story = {
  render: () => <TouchSliderVertical />,
  parameters: { layout: 'padded' },
};
export const SurfaceContext: Story = {
  name: 'Surface Context',
  render: () => <TouchSliderSurfaceContext />,
  parameters: { layout: 'padded' },
};

const MotionVolumeIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 7.5v5h3.333L10 16V4L6.333 7.5H3Z" fill="currentColor" />
    <path d="M13 7a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const motionRowLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary, inherit)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-Low)',
  minWidth: 'var(--Spacing-16)',
  margin: 0,
};

const motionRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--Spacing-5)',
};

const motionStackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4-5)',
};

function TouchSliderMotionDemo({ subtleMotion = false }: { subtleMotion?: boolean }) {
  return (
    <div
      style={
        subtleMotion
          ? ({ '--Motion-Duration-M': '0ms' } as React.CSSProperties)
          : undefined
      }
    >
      <div style={motionStackStyle}>
        <div style={motionRowStyle}>
          <span style={motionRowLabelStyle}>rounded</span>
          <TouchSlider defaultValue={60} progressStyle="rounded" aria-label="Rounded motion" />
        </div>
        <div style={motionRowStyle}>
          <span style={motionRowLabelStyle}>sharp</span>
          <TouchSlider defaultValue={60} progressStyle="sharp" aria-label="Sharp motion" />
        </div>
        <div style={motionRowStyle}>
          <span style={motionRowLabelStyle}>rounded + icon</span>
          <TouchSlider
            defaultValue={60}
            progressStyle="rounded"
            start={<MotionVolumeIcon />}
            aria-label="Rounded with icon motion"
          />
        </div>
      </div>
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
        code: `/* TouchSlider.module.css — single mechanism, one variable varies.
   Slider.Root is in thumbAlignment="edge" mode, so Base UI exposes the
   current value as --start-position: X% on the indicator. The fill is a
   FIXED-SIZE pill the width of the track; translateX moves it so its
   trailing edge sits at value%.
     - border-radius lives on the fill → pill cap size never changes
     - transform is GPU-composited → smooth entrance settle, no layout thrash
     - max() clamps how far left the fill can slide:
         no start slot → floor -100% → slides fully off the leading edge
         start slot    → floor (thickness − 100%) → stops at one circle */
.root {
  --_ts-slide-floor-x: -100%;
}
.root[data-start-slot] {
  --_ts-slide-floor-x: calc(var(--TouchSlider-thickness, var(--Spacing-9)) - 100%);
}

.indicator {
  width: 100% !important;  /* override Base UI's inline width */
  height: 100%;
  background-color: var(--_ts-fill);

  border-top-left-radius:     var(--_ts-lead-radius);
  border-bottom-left-radius:  var(--_ts-lead-radius);
  border-top-right-radius:    var(--_ts-trail-radius);
  border-bottom-right-radius: var(--_ts-trail-radius);

  transform: translateX(
    max(var(--_ts-slide-floor-x), calc(var(--start-position, 0%) - 100%))
  );

  transition:
    transform        var(--Motion-Duration-M)  var(--Motion-Easing-Entrance-Moderate),
    background-color var(--Motion-Duration-XS) var(--Motion-Easing-Transition-Moderate);
}

/* Rail colour transition — appearance / surface remap fades in. */
.track {
  transition: background-color var(--Motion-Duration-XS) var(--Motion-Easing-Transition-Moderate);
}`,
      },
    },
  },
  render: (args) => <TouchSliderMotionDemo subtleMotion={(args as any).subtleMotion} />,
};

export const Interactive: Story = {
  args: {
    defaultValue: 40,
    'aria-label': 'Interactive touch slider',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider');
    await expect(slider).toBeInTheDocument();
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
  },
};
