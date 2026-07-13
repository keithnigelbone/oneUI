/**
 * Tooltip.stories.tsx
 * Storybook documentation for Tooltip component
 *
 * Covers all 12 positions, arrow toggle, trigger modes, delays,
 * disabled state, controlled mode, max-width, long-content behaviour, and Portal.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import { Button } from '../Button';
import { Surface } from '../Surface';

/** Long copy for stories that demonstrate default nowrap vs bounded wrapping. */
const LONG_TOOLTIP_TEXT =
  'Default tooltip copy uses a single line (CSS white-space: nowrap). Long sentences extend horizontally and may run past the canvas edge until you pass maxWidth, which enables wrapping inside that width.';

const meta = {
  title: 'Components/Overlays/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Tooltips provide additional context or helpful information when users hover over, focus on, or interact with an element. Built on Base UI Tooltip with token-only styling.',
      },
    },
  },
  argTypes: {
    position: {
      control: 'select',
      options: [
        'top',
        'topStart',
        'topEnd',
        'bottom',
        'bottomStart',
        'bottomEnd',
        'left',
        'leftStart',
        'leftEnd',
        'right',
        'rightStart',
        'rightEnd',
      ],
      description: 'Convenience position prop (maps to side + align)',
      table: { defaultValue: { summary: 'undefined' } },
    },
    side: {
      control: 'radio',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Which side of the trigger to position against',
      table: { defaultValue: { summary: 'top' } },
    },
    align: {
      control: 'radio',
      options: ['start', 'center', 'end'],
      description: 'Alignment along the side axis',
      table: { defaultValue: { summary: 'center' } },
    },
    trigger: {
      control: 'radio',
      options: ['hover', 'click', 'focus', 'manual'],
      description: 'How the tooltip is triggered',
      table: { defaultValue: { summary: 'hover' } },
    },
    arrow: {
      control: 'boolean',
      description: 'Whether to show the arrow/tip pointing to the trigger',
      table: { defaultValue: { summary: 'true' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the tooltip is disabled',
      table: { defaultValue: { summary: 'false' } },
    },
    delay: {
      control: 'number',
      description: 'Delay before showing (ms)',
    },
    closeDelay: {
      control: 'number',
      description: 'Delay before hiding (ms)',
    },
    sideOffset: {
      control: 'number',
      description: 'Distance from the trigger in pixels',
      table: { defaultValue: { summary: '8' } },
    },
    content: {
      control: 'text',
      description: 'Text or content displayed inside the tooltip',
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof Tooltip>;

/* ─── 1. Default ─── */
export const Default: Story = {
  args: {
    content: 'Tooltip',
    children: <Button>Hover me</Button>,
  },
};

/* ─── 2. Positions ─── */
export const Positions: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--Spacing-7)',
        padding: 'var(--Spacing-10)',
      }}
    >
      {/* Row 1 — Bottom */}
      <Tooltip content="Tooltip" position="bottom" defaultOpen>
        <Button attention="high">bottom</Button>
      </Tooltip>
      <Tooltip content="Tooltip" position="bottomStart" defaultOpen>
        <Button attention="high">bottomStart</Button>
      </Tooltip>
      <Tooltip content="Tooltip" position="bottomEnd" defaultOpen>
        <Button attention="high">bottomEnd</Button>
      </Tooltip>

      {/* Row 2 — Top */}
      <Tooltip content="Tooltip" position="top" defaultOpen>
        <Button attention="high">top</Button>
      </Tooltip>
      <Tooltip content="Tooltip" position="topStart" defaultOpen>
        <Button attention="high">topStart</Button>
      </Tooltip>
      <Tooltip content="Tooltip" position="topEnd" defaultOpen>
        <Button attention="high">topEnd</Button>
      </Tooltip>

      {/* Row 3 — Left */}
      <Tooltip content="Tooltip" position="left" defaultOpen>
        <Button attention="high">left</Button>
      </Tooltip>
      <Tooltip content="Tooltip" position="leftStart" defaultOpen>
        <Button attention="high">leftStart</Button>
      </Tooltip>
      <Tooltip content="Tooltip" position="leftEnd" defaultOpen>
        <Button attention="high">leftEnd</Button>
      </Tooltip>

      {/* Row 4 — Right */}
      <Tooltip content="Tooltip" position="right" defaultOpen>
        <Button attention="high">right</Button>
      </Tooltip>
      <Tooltip content="Tooltip" position="rightStart" defaultOpen>
        <Button attention="high">rightStart</Button>
      </Tooltip>
      <Tooltip content="Tooltip" position="rightEnd" defaultOpen>
        <Button attention="high">rightEnd</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'All 12 position variants — 4 sides (top, bottom, left, right) × 3 alignments (center, start, end). Matches the Figma component property grid.',
      },
    },
  },
};

/* ─── 3. Arrow ─── */
export const Arrow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)' }}>
      <Tooltip content="With arrow" arrow defaultOpen side="bottom">
        <Button>Arrow: true</Button>
      </Tooltip>
      <Tooltip content="Without arrow" arrow={false} defaultOpen side="bottom">
        <Button>Arrow: false</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Toggle the arrow (tip) pointing to the trigger element. Maps to the Figma "tip" component property.',
      },
    },
  },
};

/* ─── 4. Trigger Modes ─── */
export const TriggerModes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)' }}>
      <Tooltip content="Hover tooltip" trigger="hover">
        <Button>Hover</Button>
      </Tooltip>
      <Tooltip content="Click tooltip" trigger="click">
        <Button>Click</Button>
      </Tooltip>
      <Tooltip content="Focus tooltip" trigger="focus">
        <Button>Focus (Tab)</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Trigger modes control how the tooltip opens: hover (default), click (toggle), focus (open on focus, close on blur), or manual (controlled only).',
      },
    },
  },
};

/* ─── 5. Delay ─── */
export const Delay: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)' }}>
      <Tooltip content="No delay" delay={0}>
        <Button>Instant</Button>
      </Tooltip>
      <Tooltip content="300ms delay" delay={300}>
        <Button>300ms</Button>
      </Tooltip>
      <Tooltip content="1000ms delay" delay={1000}>
        <Button>1000ms</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom delay before the tooltip appears. Default is 600ms (Base UI default).',
      },
    },
  },
};

/* ─── 6. Disabled ─── */
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)' }}>
      <Tooltip content="This tooltip works" disabled={false}>
        <Button>Enabled</Button>
      </Tooltip>
      <Tooltip content="This won't show" disabled>
        <Button>Disabled</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled tooltips do not open on any interaction.',
      },
    },
  },
};

/* ─── 7. Controlled ─── */
function ControlledDemo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)', alignItems: 'center' }}>
      <Button attention="medium" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Hide' : 'Show'} Tooltip
      </Button>
      <Tooltip
        content="Controlled tooltip"
        open={isOpen}
        onOpenChange={setIsOpen}
        trigger="manual"
      >
        <Button>Target</Button>
      </Tooltip>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Controlled mode with trigger="manual". The tooltip only responds to the `open` prop.',
      },
    },
  },
};

/* ─── 8. MaxWidth ─── */
export const MaxWidth: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)' }}>
      <Tooltip
        content="Short tooltip text"
        defaultOpen
        side="bottom"
      >
        <Button>Default width</Button>
      </Tooltip>
      <Tooltip
        content="This is a tooltip with a much longer text that demonstrates the max-width constraint. The content will wrap to multiple lines when it exceeds the maximum width."
        maxWidth={200}
        defaultOpen
        side="bottom"
      >
        <Button>maxWidth: 200px</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Custom max-width constrains long tooltip content to wrap. Accepts pixels (number) or any CSS value (string).',
      },
    },
  },
};

/* ─── 9. Motion ─── */
const ALL_POSITIONS = [
  'bottom',
  'bottomStart',
  'bottomEnd',
  'top',
  'topStart',
  'topEnd',
  'left',
  'leftStart',
  'leftEnd',
  'right',
  'rightStart',
  'rightEnd',
] as const;

export const Motion: Story = {
  args: {
    subtle: false,
  },
  argTypes: {
    subtle: {
      control: 'boolean',
      description:
        'Subtle motion (Motion Foundations a11y level): faster Subtle-L duration, Subtle easings, and opacity-only animation (no transform/translate slide). Mirrors `prefers-reduced-motion: reduce` behavior.',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  render: (args) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--Spacing-7)',
        padding: 'var(--Spacing-10)',
      }}
    >
      {ALL_POSITIONS.map((position) => (
        <Tooltip
          key={position}
          content="Tooltip"
          position={position}
          subtle={args.subtle}
        >
          <Button attention="high">{position}</Button>
        </Tooltip>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Hover any trigger to study its entrance and exit motion in isolation. Popups closed by default — unlike the Positions story which uses defaultOpen. Toggle `subtle` in the Controls panel to compare Moderate (default, 300ms with transform slide) against Subtle (200ms, opacity-only). Each story navigation is a fresh remount, so the first hover here exercises the same code path as a first hover after page load.',
      },
      source: {
        language: 'css',
        code: `/* Tooltip motion — Tooltip.module.css (excerpt)
   Entrance: popup fades + slides 5px toward trigger; tip slides from
   retracted to seated. Exit reverses with Exit-Moderate easing. */

.popup {
  opacity: 1;
  transform: translate(0, 0);
  transition:
    opacity   var(--Motion-Duration-L) var(--Motion-Easing-Entrance-Moderate),
    transform var(--Motion-Duration-L) var(--Motion-Easing-Entrance-Moderate);
}

/* Starting / ending values per side (entry transitions FROM these). */
.popup[data-side='top'][data-starting-style],
.popup[data-side='top'][data-ending-style]    { opacity: 0; transform: translateY(5px); }
.popup[data-side='bottom'][data-starting-style],
.popup[data-side='bottom'][data-ending-style] { opacity: 0; transform: translateY(-5px); }
.popup[data-side='left'][data-starting-style],
.popup[data-side='left'][data-ending-style]   { opacity: 0; transform: translateX(5px); }
.popup[data-side='right'][data-starting-style],
.popup[data-side='right'][data-ending-style]  { opacity: 0; transform: translateX(-5px); }

.popup[data-ending-style] { transition-timing-function: var(--Motion-Easing-Exit-Moderate); }

/* Arrow: retracted translate is set inline from React (no [data-side] race);
   transitions to 0 0 when the popup is fully open. */
.arrow {
  translate: var(--tip-translate, 0 0);
  transition: translate var(--Motion-Duration-XL) var(--Motion-Easing-Entrance-Moderate);
}
.popup[data-open]:not([data-starting-style]):not([data-ending-style]) .arrow {
  translate: 0 0;
}
.popup[data-ending-style] .arrow {
  transition: translate var(--Motion-Duration-L) var(--Motion-Easing-Exit-Moderate);
}

/* Subtle (a11y): faster, opacity-only, no slide. Triggered by the prop
   or automatically under prefers-reduced-motion: reduce. */
.popup[data-motion='subtle'] {
  --Motion-Duration-L: var(--Motion-Duration-Subtle-L);
  --Motion-Easing-Entrance-Moderate: var(--Motion-Easing-Entrance-Subtle);
  --Motion-Easing-Exit-Moderate: var(--Motion-Easing-Exit-Subtle);
}
.popup[data-motion='subtle'][data-starting-style],
.popup[data-motion='subtle'][data-ending-style] { transform: none; }`,
      },
    },
  },
};

/* ─── Long content (default nowrap vs maxWidth) ─── */
export const LongContent: Story = {
  name: 'Long content / nowrap vs maxWidth',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--Spacing-8)',
        alignItems: 'flex-start',
        maxWidth: 'var(--Dimension-f16)',
      }}
    >
      <div style={{ flex: '1 1 0', minWidth: 'var(--Spacing-40)' }}>
        <p
          style={{
            margin: '0 0 var(--Spacing-3)',
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Body-S-FontSize)',
            lineHeight: 'var(--Body-S-LineHeight)',
            fontWeight: 'var(--Body-FontWeight-Low)',
            color: 'var(--Text-Medium)',
          }}
        >
          Default — no maxWidth (single line, may extend past the preview).
        </p>
        <Tooltip content={LONG_TOOLTIP_TEXT} trigger="click" side="bottom">
          <Button>Click — default</Button>
        </Tooltip>
      </div>
      <div style={{ flex: '1 1 0', minWidth: 'var(--Spacing-40)' }}>
        <p
          style={{
            margin: '0 0 var(--Spacing-3)',
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Body-S-FontSize)',
            lineHeight: 'var(--Body-S-LineHeight)',
            fontWeight: 'var(--Body-FontWeight-Low)',
            color: 'var(--Text-Medium)',
          }}
        >
          With maxWidth (wraps inside the token width).
        </p>
        <Tooltip
          content={LONG_TOOLTIP_TEXT}
          maxWidth="var(--Spacing-40)"
          trigger="click"
          side="bottom"
        >
          <Button>Click — maxWidth</Button>
        </Tooltip>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'The popup uses `white-space: nowrap` by default (Figma-style short hints). Long strings are one line. Passing `maxWidth` adds a max width and allows wrapping so copy stays readable.',
      },
    },
  },
};

/* ─── Portal ─── */
export const Portal: Story = {
  name: 'Portal',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-6)',
        alignItems: 'flex-start',
      }}
    >
      <Tooltip content="Portaled to document.body — inspect in DevTools." trigger="click" side="bottom">
        <Button>Click to open (inspect DOM)</Button>
      </Tooltip>
      <Tooltip
        content="portal={false} is accepted; same mount as default."
        trigger="click"
        side="bottom"
        portal={false}
      >
        <Button>portal=false (click)</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Base UI always renders `Tooltip.Portal`. One UI keeps the default portal target so `position: fixed` popups are not clipped by overflow or transform on ancestors. Click a button to pin the tooltip open for DevTools; click again or press Escape to close.',
      },
    },
  },
};

/* ─── Interactive test ─── */
export const Interactive: Story = {
  args: {
    content: 'Interactive tooltip',
    children: <Button>Hover to test</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button');

    // Hover to open
    await userEvent.hover(trigger);

    // Wait for tooltip to appear
    const tooltip = await canvas.findByRole('tooltip', {}, { timeout: 2000 });
    await expect(tooltip).toBeInTheDocument();
    await expect(tooltip).toHaveTextContent('Interactive tooltip');

    // Unhover to close
    await userEvent.unhover(trigger);
  },
};

/**
 * Surface context — triggers placed inside `<Surface mode="…">` containers
 * so the tooltip's trigger Button re-contrasts against the container via the
 * `[data-surface]` cascade. The tooltip popup itself renders in a portal at
 * the page root and resolves against `:root` tokens.
 */
export const InsideBoldSurface: Story = {
  name: 'Surface Context / Bold',
  render: () => (
    <Surface mode="bold" style={{ padding: 'var(--Spacing-4-5)', borderRadius: 'var(--Shape-4)' }}>
      <Tooltip content="Tooltip on a bold surface">
        <Button attention="high">Hover me</Button>
      </Tooltip>
    </Surface>
  ),
};

export const InsideSubtleSurface: Story = {
  name: 'Surface Context / Subtle',
  render: () => (
    <Surface mode="subtle" style={{ padding: 'var(--Spacing-4-5)', borderRadius: 'var(--Shape-4)' }}>
      <Tooltip content="Tooltip on a subtle surface">
        <Button attention="medium">Hover me</Button>
      </Tooltip>
    </Surface>
  ),
};

export const SurfaceContext: Story = {
  name: 'Surface Context / All Modes',
  render: () => {
    const modes = ['default', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'] as const;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--Spacing-4)' }}>
        {modes.map((mode) => (
          <Surface
            key={mode}
            mode={mode}
            style={{
              padding: 'var(--Spacing-4-5)',
              borderRadius: 'var(--Shape-4)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Tooltip content={`Tooltip on ${mode}`}>
              <Button attention={mode === 'bold' ? 'high' : 'medium'}>{mode}</Button>
            </Tooltip>
          </Surface>
        ))}
      </div>
    );
  },
};
