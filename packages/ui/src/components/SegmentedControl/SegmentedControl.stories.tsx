/**
 * SegmentedControl.stories.tsx
 * Storybook documentation aligned with Figma 10455:5802.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import React, { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';
import { CounterBadge } from '../CounterBadge/CounterBadge';
import {
  SegmentedControlAttentionLevels,
  SegmentedControlAppearances,
  SegmentedControlCounterBadgeDiagnostic,
  SegmentedControlIconTypeShowcase,
  SegmentedControlNestedSurfacesShowcase,
  SegmentedControlShapesShowcase,
  SegmentedControlSurfaceContext,
  SegmentedControlTrackEmphasisLevels,
} from './SegmentedControl.showcase';

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"
    />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" fill="currentColor" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" fill="currentColor" />
  </svg>
);

const meta = {
  title: 'Components/Actions/SegmentedControl [WIP]',
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Mutually exclusive segmented control for switching views or filters. Built on Base UI ToggleGroup. Track role follows parent Surface appearance (auto → neutral on page). Item role follows `appearance` prop → parent Surface → primary. Track emphasis: high = minimal fill, medium = ghost + strokeMedium border, low = ghost. Attention: high = bold selected segment; medium = subtle (item role); low = subtle (auto/neutral: parent Surface ?? neutral, same as track).',
      },
    },
  },
  argTypes: {
    size: {
      control: 'radio',
      options: ['s', 'm', 'l'],
      table: { defaultValue: { summary: 'm' } },
    },
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      description: 'Selected segment fill: high = bold; medium = subtle (item role); low = subtle (auto/neutral: parent ?? neutral)',
      table: { defaultValue: { summary: 'high' } },
    },
    appearance: {
      control: 'radio',
      options: [
        'auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ],
      description: 'Active segment colour role. auto = parent Surface → primary',
      table: { defaultValue: { summary: 'auto' } },
    },
    shape: {
      control: 'radio',
      options: ['pill', 'rectangular'],
      table: { defaultValue: { summary: 'pill' } },
    },
    equalWidth: {
      control: 'boolean',
      description: 'Equal-width segments. Default: true for text, false for icon (fixed square cells).',
      table: { defaultValue: { summary: 'true (text) · false (icon)' } },
    },
    trackEmphasis: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      description: 'Track: high = minimal; medium = ghost + border; low = ghost',
      table: { defaultValue: { summary: 'high' } },
    },
    type: {
      control: 'radio',
      options: ['text', 'icon'],
      description:
        'Layout mode. `text` = visible labels (+ optional start/end slots). `icon` = icon-only segments: hides labels, uses each Item’s `start` icon (pass `aria-label` per item).',
      table: { defaultValue: { summary: 'text' } },
    },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

function ControlledSegments({
  children,
  defaultValue,
  type = 'text',
  ...rest
}: React.ComponentProps<typeof SegmentedControl>) {
  const defaultTextChildren = (
    <>
      <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
      <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
      <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
    </>
  );
  const defaultIconChildren = (
    <>
      <SegmentedControl.Item value="day" start={<ListIcon />} aria-label="Day" />
      <SegmentedControl.Item value="week" start={<GridIcon />} aria-label="Week" />
      <SegmentedControl.Item value="month" start={<HeartIcon />} aria-label="Month" />
    </>
  );
  const items = children ?? (type === 'icon' ? defaultIconChildren : defaultTextChildren);
  const [value, setValue] = useState(defaultValue ?? 'day');

  return (
    <SegmentedControl
      {...rest}
      type={type}
      value={value}
      onValueChange={setValue}
      defaultValue={defaultValue}
      aria-label="Segmented control demo"
    >
      {items}
    </SegmentedControl>
  );
}

export const Default: Story = {
  render: ({ type, equalWidth, ...args }) => (
    <ControlledSegments
      {...args}
      type={type}
      equalWidth={type === 'icon' ? false : equalWidth}
      defaultValue="week"
    />
  ),
};

export const AttentionLevels: Story = {
  render: () => <SegmentedControlAttentionLevels />,
  parameters: {
    docs: {
      description: {
        story:
          'One-axis slice with track emphasis fixed at high. See Surface Context for the full track × attention matrix.',
      },
    },
  },
};

export const TrackEmphasis: Story = {
  render: () => <SegmentedControlTrackEmphasisLevels />,
  parameters: {
    docs: {
      description: {
        story:
          'One-axis slice with attention fixed at high. See Surface Context for the full track × attention matrix — medium column shows ghost + strokeMedium border.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)', alignItems: 'flex-start' }}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <ControlledSegments key={size} size={size} defaultValue="day" equalWidth={false} />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Hug-content width (`equalWidth={false}`) per Figma size spec. Use `equalWidth` when the control should fill its parent.',
      },
    },
  },
};

export const Shapes: Story = {
  render: () => <SegmentedControlShapesShowcase />,
  parameters: {
    docs: {
      description: {
        story:
          'Pill and rectangular (`Shape-2`) with plain text and with start icon + end CounterBadge slots.',
      },
    },
  },
};

export const EqualWidth: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)', width: '400px' }}>
      <ControlledSegments equalWidth defaultValue="short">
        <SegmentedControl.Item value="short">Short</SegmentedControl.Item>
        <SegmentedControl.Item value="much-longer">Much longer label</SegmentedControl.Item>
      </ControlledSegments>
      <ControlledSegments equalWidth={false} defaultValue="short">
        <SegmentedControl.Item value="short">Short</SegmentedControl.Item>
        <SegmentedControl.Item value="much-longer">Much longer label</SegmentedControl.Item>
      </ControlledSegments>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'SegmentedControl always has exactly one segment selected (Figma). `defaultValue` must match an item `value`.',
      },
    },
  },
};

export const WithSlots: Story = {
  render: () => (
    <ControlledSegments defaultValue="liked" equalWidth style={{ width: '420px' }}>
      <SegmentedControl.Item value="liked" start={<HeartIcon />}>
        Liked
      </SegmentedControl.Item>
      <SegmentedControl.Item value="saved" end={<CounterBadge value={12} aria-label="12 saved" />}>
        Saved
      </SegmentedControl.Item>
      <SegmentedControl.Item value="all">All</SegmentedControl.Item>
    </ControlledSegments>
  ),
};

export const CounterBadgeOnBoldSurface: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)', width: '100%' }}>
      <SegmentedControlCounterBadgeDiagnostic surfaceMode="bold" surfaceAppearance="brand-bg" />
      <SegmentedControlCounterBadgeDiagnostic surfaceMode="bold" surfaceAppearance="primary" />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Isolated CounterBadge rows vs SegmentedControl end slots on the same bold Surface. Confirms bold-on-bold badge contrast is composition/slot wiring — not a CounterBadge defect. Includes auto and contrasting explicit appearance rows.',
      },
    },
  },
};

export const NestedSurfaces: Story = {
  render: () => <SegmentedControlNestedSurfacesShowcase />,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'SegmentedControl inside nested Surface stacks (including one transparent-material hero). Validates track-role text/icon colours and selected-segment CounterBadge step lookup at depth. Select a brand in the toolbar so brand CSS injects surface + transparent material lookup blocks.',
      },
    },
  },
};

export const IconOnly: Story = {
  render: () => <SegmentedControlIconTypeShowcase />,
  parameters: {
    docs: {
      description: {
        story:
          'Icon-only segments (`type="icon"`) across pill/rectangular shapes and track emphasis levels.',
      },
    },
  },
};

export const Appearances: Story = {
  render: () => <SegmentedControlAppearances />,
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)', width: '360px' }}>
      <ControlledSegments defaultValue="a" equalWidth>
        <SegmentedControl.Item value="a">Enabled</SegmentedControl.Item>
        <SegmentedControl.Item value="b">Enabled</SegmentedControl.Item>
      </ControlledSegments>
      <ControlledSegments defaultValue="a" equalWidth>
        <SegmentedControl.Item value="a">Available</SegmentedControl.Item>
        <SegmentedControl.Item value="b" disabled>
          Disabled
        </SegmentedControl.Item>
      </ControlledSegments>
      <SegmentedControl value="a" onValueChange={() => {}} disabled equalWidth aria-label="Disabled control">
        <SegmentedControl.Item value="a">Disabled</SegmentedControl.Item>
        <SegmentedControl.Item value="b">Control</SegmentedControl.Item>
      </SegmentedControl>
    </div>
  ),
};

export const SurfaceContext: Story = {
  render: () => <SegmentedControlSurfaceContext />,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Systematic grids: columns = track emphasis (high · medium · low), rows = item attention (high · medium · low). Includes page root, every surface mode, bold × all 9 appearance roles, and subtle × all 9 roles.',
      },
    },
  },
};

export const InteractionTest: Story = {
  render: () => (
    <ControlledSegments defaultValue="day" data-testid="segmented-control">
      <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
      <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
    </ControlledSegments>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    await userEvent.click(buttons[1]);
    await expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
  },
};
