/**
 * PaginationDots.stories.tsx
 * Storybook documentation for PaginationDots component.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent } from 'storybook/test';
import React, { useState } from 'react';
import { PaginationDots } from './PaginationDots';
import {
  PaginationDotsDefault,
  PaginationDotsAppearances,
  PaginationDotsLoopVsNonLoop,
  PaginationDotsLongSequence,
  PaginationDotsInteractive,
  PaginationDotsReadOnly,
  PaginationDotsDegenerate,
  PaginationDotsSurfaceContext,
  PaginationDotsFocusState,
} from './PaginationDots.showcase';

type PaginationDotsStoryArgs = {
  pageCount?: number;
  defaultActiveIndex?: number;
  loop?: boolean;
  appearance?: string;
  readOnly?: boolean;
};

const meta = {
  title: 'Components/Navigation/PaginationDots',
  component: PaginationDots,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Windowed pagination indicator inspired by Instagram and Amazon Prime Video. Shows a fixed window of dots that scrolls with the active index; edge dots shrink to signal more content on either side. Two distinct modes: **loop** (infinite, window always centered) and **non-loop** (finite, window clamps and the last dot grows to signal end of sequence). Supports roving tabindex keyboard navigation, controlled + uncontrolled state, and an opt-in read-only mode for carousels that own their own state.',
      },
    },
  },
  argTypes: {
    pageCount: {
      control: { type: 'number', min: 0, max: 50 },
      description: 'Total number of pages.',
    },
    defaultActiveIndex: {
      control: { type: 'number', min: 0 },
      description: 'Initial active index (uncontrolled).',
    },
    loop: {
      control: 'boolean',
      description: 'Loop mode. `false` = finite; `true` = infinite wrap.',
      table: { defaultValue: { summary: 'false' } },
    },
    appearance: {
      control: 'select',
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
      description: 'Multi-accent appearance role.',
      table: { defaultValue: { summary: 'primary' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Non-interactive mode — renders as `role="status"` aria-live region.',
      table: { defaultValue: { summary: 'false' } },
    },
    activeIndex: { table: { disable: true } },
    onActiveIndexChange: { table: { disable: true } },
  },
} satisfies Meta<typeof PaginationDots>;

export default meta;
type Story = StoryObj<typeof PaginationDots>;

// 1. Default
export const Default: Story = {
  render: (args: PaginationDotsStoryArgs) => (
    <PaginationDots
      pageCount={args.pageCount ?? 8}
      defaultActiveIndex={args.defaultActiveIndex ?? 0}
      loop={args.loop}
      appearance={args.appearance as any}
      readOnly={args.readOnly}
      aria-label="Pagination"
    />
  ),
  args: {
    pageCount: 8,
    defaultActiveIndex: 0,
    loop: false,
    appearance: 'primary',
    readOnly: false,
  },
};

// 2. Appearances
export const Appearances: Story = {
  render: () => <PaginationDotsAppearances />,
};

// 2b. Focus State — force-renders the focus ring on a dot ::before via data-force-state
export const FocusState: Story = {
  name: 'Focus State',
  render: () => <PaginationDotsFocusState />,
};

// 4. Loop vs Non-loop
export const LoopVsNonLoop: Story = {
  name: 'Loop vs Non-loop',
  render: () => <PaginationDotsLoopVsNonLoop />,
};

// 4. Long sequence
export const LongSequence: Story = {
  name: 'Long Sequence',
  render: () => <PaginationDotsLongSequence />,
};

// 5. Interactive — wired to a fake carousel
export const Interactive: Story = {
  render: () => <PaginationDotsInteractive />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);

    // Click the second visible tab and confirm aria-selected moves.
    if (tabs.length >= 2) {
      await userEvent.click(tabs[1]);
      // After state flips, the new window may have different tabs, so
      // we re-query and just check that exactly one has aria-selected=true.
      const selected = canvas
        .getAllByRole('tab')
        .filter((t: HTMLElement) => t.getAttribute('aria-selected') === 'true');
      expect(selected).toHaveLength(1);
    }
  },
};

// 6. Read-only
export const ReadOnly: Story = {
  name: 'Read-only',
  render: () => <PaginationDotsReadOnly />,
};

// 7. Degenerate cases
export const Degenerate: Story = {
  name: 'Degenerate Cases',
  render: () => <PaginationDotsDegenerate />,
};

// 8. Surface context
export const SurfaceContext: Story = {
  name: 'Surface Context',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'PaginationDots adapts automatically when placed on different surface backgrounds — no prop changes needed, just wrap in `<Surface mode="...">`. **Active pill**: reads `--_pg-bold`, which is remapped by `[data-surface]` brand CSS blocks — on the bold surface it inverts to the on-colour (typically white). **Inactive dots on `default` surface**: always neutral-grey (`--Neutral-Stroke-Low`) regardless of appearance — passive and unobtrusive. **Inactive dots on any other surface** (minimal → elevated): switch to a tinted version of the active appearance role (`--{Role}-Stroke-Low`) so they stay visually connected to the surface while remaining clearly distinct from the active pill. The brand CSS engine remaps these role tokens inside each `[data-surface]` block, so on the bold row the inactive tint also inverts to its on-colour equivalent.',
      },
    },
  },
  render: () => <PaginationDotsSurfaceContext />,
};

// 9. Keyboard — play function exercising arrow keys
export const Keyboard: Story = {
  render: () => {
    const [idx, setIdx] = useState(3);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
        <PaginationDots
          pageCount={10}
          activeIndex={idx}
          onActiveIndexChange={setIdx}
          aria-label="Keyboard demo"
        />
        <span style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)' }}>
          Use ← → to navigate, Home / End to jump. Active: {idx + 1}
        </span>
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    const active = tabs.find((t: HTMLElement) => t.getAttribute('aria-selected') === 'true');
    if (!active) return;
    active.focus();
    await userEvent.keyboard('{ArrowRight}');
    // After ArrowRight there should still be exactly one selected tab
    const selected = canvas
      .getAllByRole('tab')
      .filter((t: HTMLElement) => t.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveLength(1);
  },
};
