/**
 * ListItem.stories.tsx
 * Storybook documentation for the ListItem component.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect, fn } from 'storybook/test';
import React from 'react';
import { ListItem } from './ListItem';
import { Icon } from '../../icons/Icon';
import { Surface } from '../Surface';
import { Avatar } from '../Avatar';
import { Image } from '../Image';
import type { ListItemAppearance } from './ListItem.shared';

const appearanceOptions: ReadonlyArray<ListItemAppearance> = [
  'auto', 'primary', 'secondary', 
  'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative',
];

const meta = {
  title: 'Components/Display/ListItem [WIP]',
  component: ListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Single row with optional leading/trailing slots, a title, and optional support text. Polymorphic: renders as `<a>` with `href`, `<button>` with `onClick`, or `<div>` otherwise. Selected states use the V4 surface-context cascade (`medium` → tinted, `high` → bold with on-colour inversion).',
      },
    },
  },
  argTypes: {
    container: {
      control: 'radio',
      options: ['fullWidth', 'inset'],
      table: { defaultValue: { summary: 'fullWidth' } },
    },
    selected: {
      control: 'radio',
      options: [false, 'medium', 'high'],
      table: { defaultValue: { summary: 'false' } },
    },
    slotAlignment: {
      control: 'radio',
      options: ['centre', 'top'],
      table: { defaultValue: { summary: 'centre' } },
    },
    startSize: {
      control: 'radio',
      options: ['S', 'M', 'L', 'XL'],
      table: { defaultValue: { summary: 'M' } },
    },
    endSize: {
      control: 'radio',
      options: ['S', 'M'],
      table: { defaultValue: { summary: 'M' } },
    },
    appearance: {
      control: 'select',
      options: appearanceOptions,
      table: { defaultValue: { summary: 'primary' } },
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof ListItem>;

/** Thin vertical list frame — no background, so surface context cascades from parent. */
function ListFrame({ children, width = 320 }: { children: React.ReactNode; width?: number }) {
  return (
    <div style={{ width, display: 'flex', flexDirection: 'column' }}>{children}</div>
  );
}

// 1. Default ---------------------------------------------------------------

export const Default: Story = {
  args: {
    title: 'Favourites',
    supportText: 'Your saved items',
    supportStart: <Icon name="heart" />,
    start: <Icon name="heart" />,
    end: <Icon name="chevronRight" />,
    container: 'fullWidth',
    selected: false,
    appearance: 'primary',
    onClick: fn(),
  },
  render: (args: React.ComponentProps<typeof ListItem>) => (
    <ListFrame>
      <ListItem {...args} />
    </ListFrame>
  ),
};

// 2. Containers ------------------------------------------------------------

export const Containers: Story = {
  name: 'Containers (fullWidth vs inset)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      <ListFrame>
        <ListItem
          container="fullWidth"
          title="Full width"
          supportText="Edge-to-edge row"
          start={<Icon name="grid" />}
          end={<Icon name="chevronRight" />}
          onClick={() => undefined}
        />
      </ListFrame>
      <ListFrame>
        <ListItem
          container="inset"
          title="Inset"
          supportText="Rounded card with horizontal margin"
          start={<Icon name="grid" />}
          end={<Icon name="chevronRight" />}
          onClick={() => undefined}
        />
      </ListFrame>
    </div>
  ),
};

// 3. Selected --------------------------------------------------------------
// Mirrors the Figma variants grid: 3 selected states × 2 slot configurations
// (with + without start/end slots) to match the "common scenario" page.

export const Selected: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', flexWrap: 'wrap' }}>
      {/* Column A: no start/end slot */}
      <ListFrame>
        <ListItem
          selected={false}
          title="Title"
          supportText="Support text"
          supportStart={<Icon name="heart" />}
          end={<Icon name="chevronRight" />}
          onClick={() => undefined}
        />
        <ListItem
          selected="medium"
          title="Title"
          supportText="Support text"
          supportStart={<Icon name="heart" />}
          end={<Icon name="chevronRight" />}
          onClick={() => undefined}
        />
        <ListItem
          selected="high"
          title="Title"
          supportText="Support text"
          supportStart={<Icon name="heart" />}
          end={<Icon name="chevronRight" />}
          onClick={() => undefined}
        />
      </ListFrame>

      {/* Column B: with start slot */}
      <ListFrame>
        <ListItem
          selected={false}
          title="Title"
          supportText="Support text"
          supportStart={<Icon name="heart" />}
          start={<Icon name="heart" />}
          end={<Icon name="chevronRight" />}
          onClick={() => undefined}
        />
        <ListItem
          selected="medium"
          title="Title"
          supportText="Support text"
          supportStart={<Icon name="heart" />}
          start={<Icon name="heart" />}
          end={<Icon name="chevronRight" />}
          onClick={() => undefined}
        />
        <ListItem
          selected="high"
          title="Title"
          supportText="Support text"
          supportStart={<Icon name="heart" />}
          start={<Icon name="heart" />}
          end={<Icon name="chevronRight" />}
          onClick={() => undefined}
        />
      </ListFrame>
    </div>
  ),
};

// 3b. Support Text Slot ----------------------------------------------------

export const SupportTextSlot: Story = {
  name: 'Support Text Slot',
  render: () => (
    <ListFrame>
      <ListItem
        title="With inline heart before support text"
        supportText="Matches Figma `.ListItem.Slot.Default.Content`"
        supportStart={<Icon name="heart" />}
        start={<Icon name="star" />}
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      <ListItem
        title="Without support slot"
        supportText="Plain support text"
        start={<Icon name="star" />}
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      <ListItem
        title="Support slot only (no start)"
        supportText="Just an inline decoration"
        supportStart={<Icon name="info" />}
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
    </ListFrame>
  ),
};

// 4. Slot alignments -------------------------------------------------------

export const SlotAlignments: Story = {
  name: 'Slot Alignments',
  render: () => (
    <ListFrame width={360}>
      <ListItem
        slotAlignment="centre"
        title="Centred"
        supportText="Short support text."
        start={<Icon name="info" />}
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      <ListItem
        slotAlignment="top"
        title="Top aligned"
        supportText={'Long support text that wraps across multiple lines, forcing the slots to align with the top of the content block.'}
        start={<Icon name="info" />}
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      <ListItem
        title="Single-line auto"
        start={<Icon name="info" />}
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
    </ListFrame>
  ),
};

// 5. Start sizes -----------------------------------------------------------

export const StartSizes: Story = {
  name: 'Start Sizes (S / M / L / XL)',
  render: () => (
    <ListFrame>
      <ListItem startSize="S" title="Size S · 20px" start={<Icon name="star" />} onClick={() => undefined} />
      <ListItem startSize="M" title="Size M · 24px" start={<Icon name="star" />} onClick={() => undefined} />
      <ListItem startSize="L" title="Size L · 32px" start={<Icon name="star" />} onClick={() => undefined} />
      <ListItem startSize="XL" title="Size XL · 40px" start={<Icon name="star" />} onClick={() => undefined} />
    </ListFrame>
  ),
};

// 6. End sizes -------------------------------------------------------------

export const EndSizes: Story = {
  name: 'End Sizes',
  render: () => (
    <ListFrame>
      <ListItem
        endSize="S"
        title="End · S (20px)"
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      <ListItem
        endSize="M"
        title="End · M (24px)"
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      <ListItem title="End · none" onClick={() => undefined} />
    </ListFrame>
  ),
};

// 7. Appearances -----------------------------------------------------------

export const Appearances: Story = {
  render: () => {
    const roles: ListItemAppearance[] = [
      'primary', 'secondary', 'sparkle',
      'neutral', 'brand-bg', 'positive', 'negative', 'warning', 'informative',
    ];
    return (
      <ListFrame width={360}>
        {roles.map((role) => (
          <ListItem
            key={role}
            appearance={role}
            selected="medium"
            title={role}
            supportText="Tinted surface — selected medium"
            start={<Icon name="star" />}
            end={<Icon name="chevronRight" />}
            onClick={() => undefined}
          />
        ))}
      </ListFrame>
    );
  },
};

// 8. Surface context -------------------------------------------------------
// Covers every relevant surface mode with THREE slot configurations:
//   a) title + supportText + supportSlot only (no start / no end)
//   b) title + supportText + start icon + end chevron  (standard row)
//   c) title + supportText + large start (avatar-style) + end
// Proves the [data-surface] cascade remaps title / support / icon / chevron
// colours together, with no component-side branching.

const SURFACE_MODES = ['default', 'minimal', 'subtle', 'bold', 'moderate', 'bold'] as const;

export const SurfaceContext: Story = {
  name: 'Surface Context',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {SURFACE_MODES.map((mode) => (
        <Surface
          key={mode}
          mode={mode}
          style={{
            padding: 'var(--Spacing-3-5)',
            borderRadius: 'var(--Shape-4)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
              fontSize: 'var(--Label-XS-FontSize)',
              lineHeight: 'var(--Label-XS-LineHeight)',
              fontWeight: 'var(--Label-FontWeight-Medium)',
              color: 'var(--Text-Low)',
              padding: 'var(--Spacing-2) var(--Spacing-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {`mode = "${mode}"`}
          </div>

          {/* a) No start / no end — just title + supportText (+ inline support slot) */}
          <ListItem
            title="Title"
            supportText="Support text"
            supportStart={<Icon name="heart" />}
            onClick={() => undefined}
          />
          {/* b) Standard row with start icon + chevron */}
          <ListItem
            title="Title"
            supportText="Support text"
            supportStart={<Icon name="heart" />}
            start={<Icon name="heart" />}
            end={<Icon name="chevronRight" />}
            onClick={() => undefined}
          />
          {/* c) Large avatar-style start slot */}
          <ListItem
            title="Title"
            supportText="Support text"
            supportStart={<Icon name="heart" />}
            start={<Icon name="user" />}
            startSize="L"
            end={<Icon name="chevronRight" />}
            onClick={() => undefined}
          />
        </Surface>
      ))}
    </div>
  ),
};

// 8b. Avatar start slot ----------------------------------------------------

export const WithAvatar: Story = {
  name: 'With Avatar',
  render: () => (
    <ListFrame width={360}>
      {/* Image avatar — typical "contact row" */}
      <ListItem
        start={<Avatar content="image" size="xl" src="https://i.pravatar.cc/80?img=12" alt="Ada Lovelace" />}
        startSize="L"
        title="Ada Lovelace"
        supportText="Active 2 min ago"
        supportStart={<Icon name="check" />}
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      {/* Text avatar — initials fallback */}
      <ListItem
        start={<Avatar content="text" size="xl" alt="Grace Hopper" appearance="secondary" />}
        startSize="L"
        title="Grace Hopper"
        supportText="Last message: See you at 3pm"
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      {/* Icon avatar — low attention, neutral role */}
      <ListItem
        start={<Avatar content="icon" size="xl" icon={<Icon name="user" />} attention="low" appearance="neutral" />}
        startSize="L"
        title="Guest"
        supportText="Anonymous profile"
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      {/* Larger 2XL avatar — account row */}
      <ListItem
        start={<Avatar content="image" size="2xl" src="https://i.pravatar.cc/80?img=5" alt="Linus Torvalds" />}
        startSize="XL"
        slotAlignment="top"
        title="Linus Torvalds"
        supportText={'Kernel maintainer · Portland, OR · GitHub since 2005'}
        supportStart={<Icon name="info" />}
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
    </ListFrame>
  ),
};

// 8c. Image start slot -----------------------------------------------------

export const WithImage: Story = {
  name: 'With Image',
  render: () => (
    <ListFrame width={360}>
      {/* Square product thumbnail */}
      <ListItem
        start={
          <Image
            src="https://picsum.photos/seed/listitem1/80"
            alt="Wireless headphones"
            aspectRatio="1:1"
            width="var(--Spacing-8)"
            height="var(--Spacing-8)"
          />
        }
        startSize="L"
        title="Wireless Headphones"
        supportText="$199 · Free delivery"
        supportStart={<Icon name="star" />}
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      {/* Bigger thumbnail + multi-line description (top alignment) */}
      <ListItem
        start={
          <Image
            src="https://picsum.photos/seed/listitem2/120"
            alt="Smart watch"
            aspectRatio="1:1"
            width="var(--Spacing-10)"
            height="var(--Spacing-10)"
          />
        }
        startSize="XL"
        slotAlignment="top"
        title="Smart Watch Pro"
        supportText={'42 mm aluminium · GPS + Cellular · Sport band · Water resistant to 50 m.'}
        supportStart={<Icon name="info" />}
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      {/* 16:9 banner inside a media library row */}
      <ListItem
        start={
          <Image
            src="https://picsum.photos/seed/listitem3/120/68"
            alt="Nature documentary"
            aspectRatio="16:9"
            width="var(--Spacing-14)"
            height="calc(var(--Spacing-14) * 9 / 16)"
          />
        }
        startSize="XL"
        title="Planet Earth III"
        supportText="Documentary · 58 min · 2023"
        supportStart={<Icon name="play" />}
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
    </ListFrame>
  ),
};

// 8d. Mixed media library --------------------------------------------------

export const MixedMedia: Story = {
  name: 'Mixed — Avatar + Image + Icon in one list',
  render: () => (
    <ListFrame width={360}>
      <ListItem
        start={<Avatar content="image" size="xl" src="https://i.pravatar.cc/80?img=15" alt="Marta Silva" />}
        startSize="L"
        title="Marta Silva"
        supportText="Shared an album"
        supportStart={<Icon name="heart" />}
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      <ListItem
        start={<Icon name="folder" />}
        startSize="M"
        title="Project files"
        supportText="42 items · Modified yesterday"
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      <ListItem
        start={
          <Image
            src="https://picsum.photos/seed/mixed/80"
            alt="Campaign hero"
            aspectRatio="1:1"
            width="var(--Spacing-8)"
            height="var(--Spacing-8)"
          />
        }
        startSize="L"
        title="Summer campaign"
        supportText="Live · 12k impressions"
        supportStart={<Icon name="star" />}
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
      <ListItem
        start={<Avatar content="text" size="xl" alt="Dev Team" appearance="sparkle" />}
        startSize="L"
        title="Dev Team"
        supportText="3 new messages"
        end={<Icon name="chevronRight" />}
        onClick={() => undefined}
      />
    </ListFrame>
  ),
};

// 9. States ---------------------------------------------------------------

export const States: Story = {
  render: () => (
    <ListFrame>
      <ListItem title="Default" supportText="Interactive" start={<Icon name="star" />} end={<Icon name="chevronRight" />} onClick={() => undefined} />
      <ListItem title="Disabled" supportText="aria-disabled = true" start={<Icon name="star" />} end={<Icon name="chevronRight" />} disabled onClick={() => undefined} />
      <ListItem title="Non-interactive" supportText="Rendered as <div>" start={<Icon name="star" />} end={<Icon name="chevronRight" />} />
    </ListFrame>
  ),
};

// 10. Interactive ---------------------------------------------------------

export const Interactive: Story = {
  args: {
    title: 'Click me',
    supportText: 'Play function verifies onClick',
    start: <Icon name="arrowRight" />,
    end: <Icon name="chevronRight" />,
    onClick: fn(),
  },
  render: (args: React.ComponentProps<typeof ListItem>) => (
    <ListFrame>
      <ListItem {...args} />
    </ListFrame>
  ),
  play: async ({ canvasElement, args }: { canvasElement: HTMLElement; args: React.ComponentProps<typeof ListItem> }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('button', { name: /click me/i });
    await userEvent.click(row);
    await expect(args.onClick).toHaveBeenCalled();
  },
};
