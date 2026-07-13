/**
 * Pagination.stories.tsx
 * Storybook documentation for the Pagination + PaginationItem components.
 *
 * Practices follow the OneUI rules in CLAUDE.md / AGENTS.md:
 *   - Stories import only from showcase + the components — no app imports.
 *   - 8+ distinct stories per component (Default, Sizes×Attention,
 *     Appearances, Controlled, FirstLast, EdgeCases, SurfaceContext,
 *     Keyboard, Item primitive).
 *   - `play` functions exercise click + keyboard interactions.
 *   - All event-handler args use `fn()` spies, never the implicit-actions
 *     fallback (avoids the SB_PREVIEW_API_0002 warning).
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent, fn } from 'storybook/test';
import React, { useState } from 'react';
import { Pagination } from './Pagination';
import {
  PaginationDefault,
  PaginationSizesAttention,
  PaginationAppearances,
  PaginationControlled,
  PaginationWithFirstLast,
  PaginationEdgeCases,
  PaginationSurfaceContext,
  PaginationItemShowcase,
  PaginationFocusState,
} from './Pagination.showcase';

type PaginationStoryArgs = {
  totalPages?: number;
  defaultPage?: number;
  siblingCount?: number;
  boundaryCount?: number;
  showPrevNext?: boolean;
  showFirstLast?: boolean;
  attention?: 'high' | 'medium' | 'low';
  size?: 'S' | 'M' | 'L' | 's' | 'm' | 'l';
  appearance?: string;
  disabled?: boolean;
};

const meta = {
  title: 'Components/Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Composite numbered page navigator. Renders prev / next / first / last buttons, a windowed list of page numbers, and ellipses where gaps exist — the standard MUI / shadcn / Ant Design pattern, adapted to OneUI tokens, the high/medium/low attention vocabulary, and surface-context-awareness. WAI-ARIA `<nav>` landmark + roving tabindex + a polite live region announcing each page change.',
      },
    },
  },
  args: {
    onPageChange: fn(),
  },
  argTypes: {
    totalPages: { control: { type: 'number', min: 0, max: 200 } },
    defaultPage: { control: { type: 'number', min: 1 } },
    siblingCount: { control: { type: 'number', min: 0, max: 5 } },
    boundaryCount: { control: { type: 'number', min: 0, max: 5 } },
    showPrevNext: { control: 'boolean' },
    showFirstLast: { control: 'boolean' },
    attention: {
      control: 'inline-radio',
      options: ['high', 'medium', 'low'],
      table: { defaultValue: { summary: 'medium' } },
    },
    size: { control: 'inline-radio', options: ['S', 'M', 'L'] },
    appearance: {
      control: 'select',
      options: [
        'auto', 'primary', 'secondary', 'tertiary', 'quaternary',
        'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ],
    },
    disabled: { control: 'boolean' },
    page: { table: { disable: true } },
    onPageChange: { table: { disable: true } },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof Pagination>;

// 1. Default / playground
export const Default: Story = {
  render: (args: PaginationStoryArgs) => (
    <Pagination
      totalPages={args.totalPages ?? 10}
      defaultPage={args.defaultPage ?? 5}
      siblingCount={args.siblingCount}
      boundaryCount={args.boundaryCount}
      showPrevNext={args.showPrevNext}
      showFirstLast={args.showFirstLast}
      attention={args.attention}
      size={args.size}
      appearance={args.appearance as any}
      disabled={args.disabled}
      aria-label="Default pagination"
    />
  ),
  args: {
    totalPages: 10,
    defaultPage: 5,
    siblingCount: 1,
    boundaryCount: 1,
    showPrevNext: true,
    showFirstLast: false,
    size: 'M',
    appearance: 'primary',
    disabled: false,
  },
};

// 2. Sizes × Attention
export const SizesAndAttention: Story = {
  name: 'Sizes × Attention',
  render: () => <PaginationSizesAttention />,
  parameters: { layout: 'padded' },
};

// 3. Appearances
export const Appearances: Story = {
  render: () => <PaginationAppearances />,
  parameters: { layout: 'padded' },
};

// 4. Controlled
export const Controlled: Story = {
  render: () => <PaginationControlled />,
};

// 5. With first/last
export const WithFirstLast: Story = {
  name: 'With first / last buttons',
  render: () => <PaginationWithFirstLast />,
};

// 6. Edge cases
export const EdgeCases: Story = {
  name: 'Edge cases',
  render: () => <PaginationEdgeCases />,
  parameters: { layout: 'padded' },
};

// 7. Surface context
export const SurfaceContext: Story = {
  name: 'Surface Context',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Pagination adapts automatically when placed on different surface backgrounds — no prop changes needed, just wrap in `<Surface mode="...">`. The selected page background reads `--{Role}-Bold` from the row `appearance`. Inactive numerals and hover use the **neutral** role so they stay readable on tinted surfaces; nav arrows still follow the row accent.',
      },
    },
  },
  render: () => <PaginationSurfaceContext />,
};

// 8. Focus state (visual)
export const FocusState: Story = {
  name: 'Focus state',
  render: () => <PaginationFocusState />,
  parameters: { layout: 'padded' },
};

// 9. Click interaction — exercise the play function
export const ClickInteraction: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
        <Pagination
          totalPages={10}
          page={page}
          onPageChange={setPage}
          aria-label="Click demo"
        />
        <span style={{ fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)' }}>
          Active: {page}
        </span>
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    // The numbered page buttons are reachable via aria-current=page (selected) or aria-label "Go to page N".
    const next = canvas.getByRole('button', { name: /Go to next page/i });
    await userEvent.click(next);
    await userEvent.click(next);
    const selected = canvas.getAllByRole('button').filter(
      (b: HTMLElement) => b.getAttribute('aria-current') === 'page',
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveAccessibleName('Go to page 3');
  },
};

// 10. Keyboard interaction
export const KeyboardInteraction: Story = {
  name: 'Keyboard interaction',
  render: () => {
    const [page, setPage] = useState(3);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
        <Pagination
          totalPages={10}
          page={page}
          onPageChange={setPage}
          aria-label="Keyboard demo"
        />
        <span style={{ fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)' }}>
          Use ← → to step, Home / End to jump. Active: {page}
        </span>
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const active = canvas.getAllByRole('button').find(
      (b: HTMLElement) => b.getAttribute('aria-current') === 'page',
    );
    if (!active) return;
    active.focus();
    await userEvent.keyboard('{ArrowRight}');
    const newSelected = canvas.getAllByRole('button').filter(
      (b: HTMLElement) => b.getAttribute('aria-current') === 'page',
    );
    expect(newSelected).toHaveLength(1);
    expect(newSelected[0]).toHaveAccessibleName('Go to page 4');
  },
};

// 11. PaginationItem primitive
export const ItemPrimitive: Story = {
  name: 'PaginationItem (primitive)',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'The `<PaginationItem>` primitive is **numbered page chips only**. Nav and ellipsis live on `<Pagination>`. Unselected: ghost + high-emphasis numeral; selected: driven by the `attention` level.',
      },
    },
  },
  render: () => <PaginationItemShowcase />,
};

// 12. Motion sandbox
export const MotionInteraction: Story = {
  name: 'Motion — Interaction',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story:
          'Motion sandbox. Start at page 5 of 20 — navigate in either direction to trigger window shifts and observe hover, tap, and position-change transitions.',
      },
      source: {
        code: `/* PaginationItemPage.module.css — interaction motion */

/* Base: box-shadow (focus ring) + transform (tap scale) always animate.
   background-color is excluded so selected ↔ deselected changes are instant. */
.paginationPageChip {
  transition-property: box-shadow, transform;
  transition-duration: var(--Motion-Duration-M);
  transition-timing-function: var(--Motion-Easing-Transition-Moderate);
}

/* Idle → hover: background-color opts in so the hover token animates */
.paginationPageChip[data-selected='false']:hover:not([data-disabled]) {
  background-color: var(--Primary-Hover);
  transition-property: background-color, color, border-color, box-shadow, transform;
}

/* Hover → pressed: pressed token also animates */
.paginationPageChip[data-selected='false']:active:not([data-disabled]) {
  background-color: var(--Primary-Pressed);
  transition-property: background-color, color, border-color, box-shadow, transform;
}

/* Tap scale — matches IconButton default (scale up 7%) */
.paginationPageChip:active:not([data-disabled]) {
  transform: scale(calc(1 + var(--Motion-Tap-Scale-Up, 7) / 100));
}`,
      },
    },
  },
  argTypes: {
    subtleMotion: {
      name: 'Subtle motion',
      control: 'boolean',
      description: 'Turn off scale and make all transitions instant',
    },
  } as any,
  args: { subtleMotion: false } as any,
  render: (args: any) => {
    const [page, setPage] = useState(5);
    const motionOverride = args.subtleMotion
      ? ({ '--Motion-Duration-M': '0s', '--Motion-Tap-Scale-Up': '0' } as React.CSSProperties)
      : {};
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--Spacing-6)',
          padding: 'var(--Spacing-10)',
          ...motionOverride,
        }}
      >
        <Pagination
          totalPages={20}
          page={page}
          onPageChange={setPage}
          siblingCount={1}
          boundaryCount={1}
          showPrevNext
          showFirstLast
          attention="high"
          size="L"
          appearance="primary"
          aria-label="Motion demo"
        />
        <span
          style={{
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Label-S-FontSize)',
            color: 'var(--Text-Low)',
          }}
        >
          Page {page} of 20
        </span>
      </div>
    );
  },
};
