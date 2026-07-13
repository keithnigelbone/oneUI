/**
 * Badge.stories.tsx
 * Storybook documentation for Badge component
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import { Badge } from './Badge';
import type { BadgeProps } from './Badge.shared';
import { CounterBadge } from '../CounterBadge/CounterBadge';
import { IndicatorBadge } from '../IndicatorBadge/IndicatorBadge';
import { Icon } from '../Icon/Icon';
import { Avatar } from '../Avatar/Avatar';
import { Surface } from '../Surface/Surface';
import React from 'react';

const meta: Meta<typeof Badge> = {
  title: 'Components/Display/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Non-interactive display component used to highlight status, provide notifications, or categorize content. Supports start/end slots for icons, avatars, counter badges, and indicator badges.',
      },
    },
  },
  argTypes: {
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      description: 'Attention level — High (filled), Medium (tinted), Low (transparent)',
      table: { defaultValue: { summary: 'high' } },
    },
    size: {
      control: 'select',
      options: ['xs', 's', 'm', 'l', 'xl'],
      description: 'Badge size',
      table: { defaultValue: { summary: 'm' } },
    },
    appearance: {
      control: 'radio',
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
      description: 'Multi-accent appearance role',
      table: { defaultValue: { summary: 'auto' } },
    },
    children: {
      control: 'text',
      description: 'Badge text content',
    },
    start: {
      options: ['none', 'icon', 'avatar', 'counter-badge', 'indicator-badge'],
      mapping: {
        none: undefined,
        icon: <Icon icon="user" aria-label="" />,
        avatar: <Avatar aria-label="" />,
        'counter-badge': <CounterBadge value={3} appearance="negative" aria-label="3 items" />,
        'indicator-badge': <IndicatorBadge appearance="negative" aria-label="" />,
      },
      control: { type: 'select' },
      description:
        'Content before the label. Accepts Icon, Avatar, CounterBadge, or IndicatorBadge.',
      table: { defaultValue: { summary: 'none' } },
    },
    end: {
      options: ['none', 'icon', 'avatar', 'counter-badge', 'indicator-badge'],
      mapping: {
        none: undefined,
        icon: <Icon icon="user" aria-label="" />,
        avatar: <Avatar aria-label="" />,
        'counter-badge': <CounterBadge value={3} appearance="negative" aria-label="3 items" />,
        'indicator-badge': <IndicatorBadge appearance="negative" aria-label="" />,
      },
      control: { type: 'select' },
      description:
        'Content after the label. Accepts Icon, Avatar, CounterBadge, or IndicatorBadge.',
      table: { defaultValue: { summary: 'none' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

/** Label style for section headers */
const sectionLabelStyle: React.CSSProperties = {
  fontSize: 'var(--Label-S-FontSize)',
  color: 'var(--Text-Low)',
};

// 1. Default
export const Default: Story = {
  args: {
    children: 'Badge',
    attention: 'high',
    size: 'm',
    'aria-label': 'Status badge',
  },
};

// 2. Variants — Bold/Subtle/Ghost
export const Variants: Story = {
  name: 'Variants',
  render: () => (
    <div className="story-row">
      <Badge attention="high" aria-label="High attention">
        Badge
      </Badge>
      <Badge attention="medium" aria-label="Medium attention">
        Badge
      </Badge>
      <Badge attention="low" aria-label="Low attention">
        Badge
      </Badge>
    </div>
  ),
};

// 3. Sizes — XS/S/M/L/XL
export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div className="story-row" style={{ alignItems: 'center' }}>
      <Badge size="xs" aria-label="XS badge">
        Badge
      </Badge>
      <Badge size="s" aria-label="S badge">
        Badge
      </Badge>
      <Badge size="m" aria-label="M badge">
        Badge
      </Badge>
      <Badge size="l" aria-label="L badge">
        Badge
      </Badge>
      <Badge size="xl" aria-label="XL badge">
        Badge
      </Badge>
    </div>
  ),
};

// 5. WithSlots — All slot types matching Figma spec columns
export const WithSlots: Story = {
  name: 'With Slots',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={sectionLabelStyle}>Text only</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge attention="high" aria-label="Badge">
            Badge
          </Badge>
          <Badge attention="medium" aria-label="Badge">
            Badge
          </Badge>
          <Badge attention="low" aria-label="Badge">
            Badge
          </Badge>
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>Start: Icon</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge attention="high" start={<Icon icon="heart" aria-label="" />} aria-label="Badge">
            Badge
          </Badge>
          <Badge attention="medium" start={<Icon icon="heart" aria-label="" />} aria-label="Badge">
            Badge
          </Badge>
          <Badge attention="low" start={<Icon icon="heart" aria-label="" />} aria-label="Badge">
            Badge
          </Badge>
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>Start + End: Icon</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge
            attention="high"
            start={<Icon icon="heart" aria-label="" />}
            end={<Icon icon="heart" aria-label="" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="medium"
            start={<Icon icon="heart" aria-label="" />}
            end={<Icon icon="heart" aria-label="" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="low"
            start={<Icon icon="heart" aria-label="" />}
            end={<Icon icon="heart" aria-label="" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>Start: IndicatorBadge (negative)</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge
            attention="high"
            start={<IndicatorBadge appearance="negative" aria-label="alert" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="medium"
            start={<IndicatorBadge appearance="negative" aria-label="alert" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="low"
            start={<IndicatorBadge appearance="negative" aria-label="alert" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>End: IndicatorBadge (negative)</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge
            attention="high"
            end={<IndicatorBadge appearance="negative" aria-label="alert" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="medium"
            end={<IndicatorBadge appearance="negative" aria-label="alert" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="low"
            end={<IndicatorBadge appearance="negative" aria-label="alert" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>Start: IndicatorBadge + End: Icon</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge
            attention="high"
            start={<IndicatorBadge appearance="negative" aria-label="alert" />}
            end={<Icon icon="heart" aria-label="" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="medium"
            start={<IndicatorBadge appearance="negative" aria-label="alert" />}
            end={<Icon icon="heart" aria-label="" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>Start: Icon + End: IndicatorBadge</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge
            attention="high"
            start={<Icon icon="heart" aria-label="" />}
            end={<IndicatorBadge appearance="negative" aria-label="alert" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="medium"
            start={<Icon icon="heart" aria-label="" />}
            end={<IndicatorBadge appearance="negative" aria-label="alert" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>Start: CounterBadge</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge
            attention="high"
            start={<CounterBadge value={3} appearance="negative" aria-label="3" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="medium"
            start={<CounterBadge value={3} appearance="negative" aria-label="3" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="low"
            start={<CounterBadge value={3} appearance="negative" aria-label="3" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>Start: Avatar</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge
            attention="high"
            start={<Avatar content="icon" aria-label="AB" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="medium"
            start={<Avatar content="icon" aria-label="AB" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="low"
            start={<Avatar content="icon" aria-label="AB" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>End: CounterBadge</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge
            attention="high"
            end={<CounterBadge value={3} appearance="negative" aria-label="3" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="medium"
            end={<CounterBadge value={3} appearance="negative" aria-label="3" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="low"
            end={<CounterBadge value={3} appearance="negative" aria-label="3" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>End: Avatar</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge
            attention="high"
            end={<Avatar content="icon" aria-label="AB" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge
            attention="medium"
            end={<Avatar content="icon" aria-label="AB" />}
            aria-label="Badge"
          >
            Badge
          </Badge>
          <Badge attention="low" end={<Avatar content="icon" aria-label="AB" />} aria-label="Badge">
            Badge
          </Badge>
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>Sizes with Icon start slot</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge size="xs" start={<Icon icon="heart" aria-label="" />} aria-label="XS">
            Badge
          </Badge>
          <Badge size="s" start={<Icon icon="heart" aria-label="" />} aria-label="S">
            Badge
          </Badge>
          <Badge size="m" start={<Icon icon="heart" aria-label="" />} aria-label="M">
            Badge
          </Badge>
          <Badge size="l" start={<Icon icon="heart" aria-label="" />} aria-label="L">
            Badge
          </Badge>
          <Badge size="xl" start={<Icon icon="heart" aria-label="" />} aria-label="XL">
            Badge
          </Badge>
        </div>
      </div>
    </div>
  ),
};

// 6. SizesWithSlots — all sizes × all slot element types × start + end
export const SizesWithSlots: Story = {
  name: 'Sizes with Slots',
  render: () => {
    const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;

    // Badge auto-sizes its slot children via --_slot-*-size CSS variables
    // per data-size block (Badge.module.css). Slot-inline children (Icon,
    // Avatar, CounterBadge, IndicatorBadge) render at their default size
    // prop and pick up the Badge-prescribed size from the cascade. See
    // `docs/badge-figma-parity.md` for the full matrix.

    const posLabelStyle: React.CSSProperties = {
      ...sectionLabelStyle,
      minWidth: 'var(--Spacing-9)',
      fontSize: 'var(--Label-XS-FontSize)',
    };

    const sizeLabelStyle: React.CSSProperties = {
      ...sectionLabelStyle,
      fontSize: 'var(--Label-XS-FontSize)',
    };

    const row = (pos: 'start' | 'end', nodes: React.ReactNode[]) => (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--Spacing-4)' }}>
        <span style={posLabelStyle}>{pos}</span>
        <div className="story-row" style={{ alignItems: 'flex-end', gap: 'var(--Spacing-4-5)' }}>
          {sizes.map((size, i) => (
            <div
              key={size}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--Spacing-2)',
              }}
            >
              {nodes[i]}
              <span style={sizeLabelStyle}>{size.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    );

    const sections: Array<{
      label: string;
      startNodes: React.ReactNode[];
      endNodes: React.ReactNode[];
    }> = [
      {
        label: 'Icon',
        startNodes: sizes.map((size) => (
          <Badge
            key={size}
            size={size}
            start={<Icon icon="heart" aria-label="" />}
            aria-label={`${size} with icon`}
          >
            Badge
          </Badge>
        )),
        endNodes: sizes.map((size) => (
          <Badge
            key={size}
            size={size}
            end={<Icon icon="heart" aria-label="" />}
            aria-label={`${size} with icon`}
          >
            Badge
          </Badge>
        )),
      },
      {
        label: 'Avatar',
        startNodes: sizes.map((size) => (
          <Badge
            key={size}
            size={size}
            start={<Avatar content="icon" alt="AB" />}
            aria-label={`${size} with avatar`}
          >
            Badge
          </Badge>
        )),
        endNodes: sizes.map((size) => (
          <Badge
            key={size}
            size={size}
            end={<Avatar content="icon" alt="AB" />}
            aria-label={`${size} with avatar`}
          >
            Badge
          </Badge>
        )),
      },
      {
        // CounterBadge minimum is 12px (xs). M-slot at XS badge=8px, S badge=12px flush — use M+ only.
        label: 'CounterBadge',
        startNodes: sizes.map((size) => {
          if (size === 'xs' || size === 's') {
            return (
              <span key={size} style={{ ...sizeLabelStyle, opacity: 0.25 }}>
                —
              </span>
            );
          }
          return (
            <Badge
              key={size}
              size={size}
              start={<CounterBadge value={3} appearance="negative" aria-label="3" />}
              aria-label={`${size} with counter`}
            >
              Badge
            </Badge>
          );
        }),
        endNodes: sizes.map((size) => {
          if (size === 'xs' || size === 's') {
            return (
              <span key={size} style={{ ...sizeLabelStyle, opacity: 0.25 }}>
                —
              </span>
            );
          }
          return (
            <Badge
              key={size}
              size={size}
              end={<CounterBadge value={3} appearance="negative" aria-label="3" />}
              aria-label={`${size} with counter`}
            >
              Badge
            </Badge>
          );
        }),
      },
      {
        label: 'IndicatorBadge',
        startNodes: sizes.map((size) => (
          <Badge
            key={size}
            size={size}
            start={<IndicatorBadge appearance="negative" aria-label="alert" />}
            aria-label={`${size} with indicator`}
          >
            Badge
          </Badge>
        )),
        endNodes: sizes.map((size) => (
          <Badge
            key={size}
            size={size}
            end={<IndicatorBadge appearance="negative" aria-label="alert" />}
            aria-label={`${size} with indicator`}
          >
            Badge
          </Badge>
        )),
      },
    ];

    return (
      <div className="story-column" style={{ gap: 'var(--Spacing-6)' }}>
        {sections.map(({ label, startNodes, endNodes }) => (
          <div
            key={label}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}
          >
            <span style={sectionLabelStyle}>{label}</span>
            {row('start', startNodes)}
            {row('end', endNodes)}
          </div>
        ))}
      </div>
    );
  },
};

// 7. Appearances — All 9 roles
export const Appearances: Story = {
  name: 'Appearances',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      {(
        [
          'primary',
          'secondary',
          'neutral',
          'sparkle',
          'brand-bg',
          'positive',
          'negative',
          'warning',
          'informative',
        ] as const
      ).map((role) => (
        <div
          key={role}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}
        >
          <span style={{ ...sectionLabelStyle, textTransform: 'capitalize' }}>{role}</span>
          <div className="story-row">
            <Badge appearance={role} attention="high" aria-label={`${role} high`}>
              Badge
            </Badge>
            <Badge appearance={role} attention="medium" aria-label={`${role} medium`}>
              Badge
            </Badge>
            <Badge appearance={role} attention="low" aria-label={`${role} low`}>
              Badge
            </Badge>
          </div>
        </div>
      ))}
    </div>
  ),
};

// 7. Interactive — Play function
export const Interactive: Story = {
  args: {
    children: 'Active',
    attention: 'high',
    size: 'm',
    'aria-label': 'Active status',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole('status');

    // Verify badge exists and shows text
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveTextContent('Active');
  },
};

// 8. Responsive — Viewport testing
export const Responsive: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <div className="story-column" style={{ width: '100%', alignItems: 'center' }}>
      <div className="story-row" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Badge size="xs" aria-label="XS">
          Badge
        </Badge>
        <Badge size="s" aria-label="S">
          Badge
        </Badge>
        <Badge size="m" aria-label="M">
          Badge
        </Badge>
        <Badge size="l" aria-label="L">
          Badge
        </Badge>
        <Badge size="xl" aria-label="XL">
          Badge
        </Badge>
      </div>
    </div>
  ),
};

// 9. Themes — Surface context stacking (Badge on different surfaces)
export const Themes: Story = {
  name: 'Themes',
  render: () => {
    const surfaceModes = [
      { mode: 'default' as const, label: 'default' },
      { mode: 'minimal' as const, label: 'minimal' },
      { mode: 'subtle' as const, label: 'subtle' },
      { mode: 'bold' as const, label: 'bold' },
      { mode: 'elevated' as const, label: 'elevated' },
    ];

    const cellStyle: React.CSSProperties = {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 'var(--Spacing-4)',
      padding: 'var(--Spacing-4-5)',
      borderRadius: 'var(--Shape-4)',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        {surfaceModes.map(({ mode, label }) => (
          <div
            key={mode}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4-5)' }}
          >
            <span style={{ ...sectionLabelStyle, width: 90 }}>{label}</span>
            <Surface mode={mode} style={cellStyle}>
              <Badge attention="high" aria-label="High">
                Badge
              </Badge>
              <Badge attention="medium" aria-label="Medium">
                Badge
              </Badge>
              <Badge attention="low" aria-label="Low">
                Badge
              </Badge>
              <Badge
                attention="high"
                start={<IndicatorBadge appearance="negative" aria-label="alert" />}
                aria-label="With indicator"
              >
                Badge
              </Badge>
              <Badge
                attention="high"
                start={<CounterBadge value={3} appearance="negative" aria-label="3" />}
                aria-label="With counter"
              >
                Badge
              </Badge>
              <Badge
                attention="high"
                start={<Icon icon="heart" aria-label="" />}
                aria-label="With icon"
              >
                Badge
              </Badge>
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 10. Slot Adaptation — How slots adapt across attention levels
export const SlotAdaptation: Story = {
  name: 'Slot Adaptation',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={sectionLabelStyle}>Bold — slots adapt via surface context</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge
            attention="high"
            start={<Icon icon="heart" aria-label="" />}
            aria-label="Bold with icon"
          >
            Badge
          </Badge>
          <Badge
            attention="high"
            start={<IndicatorBadge appearance="negative" aria-label="alert" />}
            aria-label="Bold with indicator"
          >
            Badge
          </Badge>
          <Badge
            attention="high"
            start={<CounterBadge value={3} appearance="negative" aria-label="3" />}
            aria-label="Bold with counter"
          >
            Badge
          </Badge>
          <Badge
            attention="high"
            start={<Avatar content="icon" aria-label="AB" />}
            aria-label="Bold with avatar"
          >
            Badge
          </Badge>
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>Subtle — slots use default tokens</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge
            attention="medium"
            start={<Icon icon="heart" aria-label="" />}
            aria-label="Subtle with icon"
          >
            Badge
          </Badge>
          <Badge
            attention="medium"
            start={<IndicatorBadge appearance="negative" aria-label="alert" />}
            aria-label="Subtle with indicator"
          >
            Badge
          </Badge>
          <Badge
            attention="medium"
            start={<CounterBadge value={3} appearance="negative" aria-label="3" />}
            aria-label="Subtle with counter"
          >
            Badge
          </Badge>
          <Badge
            attention="medium"
            start={<Avatar content="icon" aria-label="AB" />}
            aria-label="Subtle with avatar"
          >
            Badge
          </Badge>
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>Ghost — slots use default tokens</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Badge
            attention="low"
            start={<Icon icon="heart" aria-label="" />}
            aria-label="Ghost with icon"
          >
            Badge
          </Badge>
          <Badge
            attention="low"
            start={<IndicatorBadge appearance="negative" aria-label="alert" />}
            aria-label="Ghost with indicator"
          >
            Badge
          </Badge>
          <Badge
            attention="low"
            start={<CounterBadge value={3} appearance="negative" aria-label="3" />}
            aria-label="Ghost with counter"
          >
            Badge
          </Badge>
          <Badge
            attention="low"
            start={<Avatar content="icon" aria-label="AB" />}
            aria-label="Ghost with avatar"
          >
            Badge
          </Badge>
        </div>
      </div>
    </div>
  ),
};

/**
 * Surface context — Badges placed inside `<Surface mode="…">` containers
 * re-contrast against the container via the `[data-surface]` cascade.
 * All role tokens (`--Primary-Bold`, `--Primary-Bold-High`, …) are remapped
 * at the container's step so bold/subtle/ghost badges stay visible on any
 * surface mode without per-component logic.
 */
export const InsideBoldSurface: Story = {
  name: 'Surface Context / Bold',
  render: () => (
    <Surface
      mode="bold"
      style={{
        padding: 'var(--Spacing-4-5)',
        borderRadius: 'var(--Shape-4)',
        display: 'flex',
        gap: 'var(--Spacing-3-5)',
        alignItems: 'center',
      }}
    >
      <Badge attention="high" aria-label="High">
        Badge
      </Badge>
      <Badge attention="medium" aria-label="Medium">
        Badge
      </Badge>
      <Badge attention="low" aria-label="Low">
        Badge
      </Badge>
      <Badge attention="high" start={<Icon icon="heart" aria-label="" />} aria-label="With icon">
        Badge
      </Badge>
      <Badge
        attention="high"
        start={<Avatar content="icon" aria-label="AB" />}
        aria-label="With avatar"
      >
        Badge
      </Badge>
    </Surface>
  ),
};

export const InsideSubtleSurface: Story = {
  name: 'Surface Context / Subtle',
  render: () => (
    <Surface
      mode="subtle"
      style={{
        padding: 'var(--Spacing-4-5)',
        borderRadius: 'var(--Shape-4)',
        display: 'flex',
        gap: 'var(--Spacing-3-5)',
        alignItems: 'center',
      }}
    >
      <Badge attention="high" aria-label="High">
        Badge
      </Badge>
      <Badge attention="medium" aria-label="Medium">
        Badge
      </Badge>
      <Badge attention="low" aria-label="Low">
        Badge
      </Badge>
      <Badge attention="high" start={<Icon icon="heart" aria-label="" />} aria-label="With icon">
        Badge
      </Badge>
      <Badge
        attention="high"
        start={<Avatar content="icon" aria-label="AB" />}
        aria-label="With avatar"
      >
        Badge
      </Badge>
    </Surface>
  ),
};

// Metallic Material — simulates a brand material assignment. The brand engine
// emits --{Role}-Material-Fill / --{Role}-Material-Text only when the role has
// an active metal assigned (Materials foundation → Metals tab + Appearance →
// material assignments). Bold badges then pick the metallic fill via the
// --_bg-material-* fallback chain; subtle/ghost are unaffected.
export const MetallicMaterial: Story = {
  name: 'Metallic Material',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4)' }}>
      {([
        ['Gold', 'Gold'],
        ['Silver', 'Silver'],
        ['Bronze', 'Bronze'],
      ] as const).map(([label, metal]) => (
        <div
          key={metal}
          className="story-row"
          style={{
            alignItems: 'center',
            '--Primary-Material-Fill': `var(--Material-Metallic-${metal}-Fill)`,
            '--Primary-Material-Text': `var(--Material-Metallic-${metal}-Text)`,
          } as React.CSSProperties}
        >
          <Badge attention="high">{label} tier</Badge>
          <Badge attention="high" start={<Icon icon="heart" aria-label="" />}>With icon</Badge>
          <Badge attention="medium">Subtle unchanged</Badge>
          <Badge attention="low">Ghost unchanged</Badge>
        </div>
      ))}
    </div>
  ),
};

export const SurfaceContext: Story = {
  name: 'Surface Context / All Modes',
  render: () => {
    const modes = ['default', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'] as const;
    return (
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--Spacing-4)' }}
      >
        {modes.map((mode) => (
          <Surface
            key={mode}
            mode={mode}
            style={{
              padding: 'var(--Spacing-4-5)',
              borderRadius: 'var(--Shape-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--Spacing-3-5)',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ ...sectionLabelStyle }}>{mode}</span>
            <div style={{ display: 'flex', gap: 'var(--Spacing-3)', flexWrap: 'wrap' }}>
              <Badge attention="high" aria-label="High">
                Badge
              </Badge>
              <Badge attention="medium" aria-label="Medium">
                Badge
              </Badge>
              <Badge attention="low" aria-label="Low">
                Badge
              </Badge>
            </div>
            <div style={{ display: 'flex', gap: 'var(--Spacing-3)', flexWrap: 'wrap' }}>
              <Badge attention="high" start={<Icon icon="heart" aria-label="" />} aria-label="Icon">
                Badge
              </Badge>
              <Badge
                attention="high"
                start={<Avatar content="icon" aria-label="AB" />}
                aria-label="Avatar"
              >
                Badge
              </Badge>
              <Badge
                attention="high"
                start={<IndicatorBadge appearance="negative" aria-label="alert" />}
                aria-label="Indicator"
              >
                Badge
              </Badge>
            </div>
          </Surface>
        ))}
      </div>
    );
  },
};

/**
 * Figma Parity — per-size live-vs-expected inspector.
 *
 * Renders each Badge size alongside the Figma-expected geometry (from
 * docs/badge-figma-parity.md). Uses getComputedStyle on mount to report the
 * live values; any drift from the spec is flagged in the delta column.
 *
 * Diagnostic-only view — inline styles on the readout table are intentional
 * (same pattern as the SurfaceValidationTable in foundations/surfaces).
 */
const FIGMA_SPEC: Record<
  'xs' | 's' | 'm' | 'l' | 'xl',
  {
    height: number;
    padNoSlot: number;
    padSlot: number;
    gap: number;
    radius: number;
    fontSize: number;
  }
> = {
  xs: { height: 12, padNoSlot: 4, padSlot: 2, gap: 2, radius: 4, fontSize: 8 },
  s: { height: 16, padNoSlot: 4, padSlot: 2, gap: 2, radius: 4, fontSize: 10 },
  m: { height: 20, padNoSlot: 6, padSlot: 4, gap: 4, radius: 6, fontSize: 12 },
  l: { height: 24, padNoSlot: 8, padSlot: 4, gap: 4, radius: 8, fontSize: 14 },
  xl: { height: 32, padNoSlot: 6, padSlot: 6, gap: 6, radius: 10, fontSize: 16 },
};

interface ParityRow {
  size: 'xs' | 's' | 'm' | 'l' | 'xl';
  label: string;
}

function ParityInspector() {
  const [measurements, setMeasurements] = React.useState<Record<string, Record<string, number>>>(
    {}
  );
  const [rootRef, setRootRef] = React.useState<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    if (!rootRef) return;
    const rows: Record<string, Record<string, number>> = {};
    for (const el of rootRef.querySelectorAll<HTMLElement>('[data-parity-row]')) {
      const key = el.getAttribute('data-parity-row')!;
      const badge = el.querySelector<HTMLElement>('[role="status"]');
      if (!badge) continue;
      const cs = getComputedStyle(badge);
      rows[key] = {
        height: badge.offsetHeight,
        padL: parseFloat(cs.paddingLeft),
        padR: parseFloat(cs.paddingRight),
        gap: parseFloat(cs.gap),
        radius: parseFloat(cs.borderTopLeftRadius),
        fontSize: parseFloat(cs.fontSize),
      };
    }
    setMeasurements(rows);
  }, [rootRef]);

  const sizes: ParityRow[] = [
    { size: 'xs', label: 'XS' },
    { size: 's', label: 'S' },
    { size: 'm', label: 'M' },
    { size: 'l', label: 'L' },
    { size: 'xl', label: 'XL' },
  ];

  const cellStyle: React.CSSProperties = {
    fontFamily: 'var(--Typography-Font-Code)',
    fontSize: 'var(--Label-XS-FontSize)',
    padding: 'var(--Spacing-2-5) var(--Spacing-3)',
    textAlign: 'left',
    verticalAlign: 'middle',
    borderBottom: '1px solid var(--Border-Subtle)',
    color: 'var(--Text-High)',
  };
  const headStyle: React.CSSProperties = {
    ...cellStyle,
    color: 'var(--Text-Low)',
    textTransform: 'uppercase',
    fontSize: 'var(--Label-2XS-FontSize)',
    fontWeight: 'var(--Label-FontWeight-Medium)',
    letterSpacing: '0.05em',
  };

  const cellWithDelta = (live: number | undefined, spec: number) => {
    if (live === undefined) return <span style={{ color: 'var(--Text-Low)' }}>—</span>;
    const delta = live - spec;
    const ok = Math.abs(delta) < 0.5;
    return (
      <span
        style={{
          color: ok
            ? 'var(--Positive-TintedA11y, var(--Text-High))'
            : 'var(--Negative-TintedA11y, var(--Text-High))',
        }}
      >
        {live.toFixed(0)}
        {!ok && (
          <span style={{ opacity: 0.6 }}>
            {' '}
            ({delta > 0 ? '+' : ''}
            {delta.toFixed(0)})
          </span>
        )}
      </span>
    );
  };

  return (
    <div
      ref={setRootRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--Title-FontFamily, var(--Typography-Font-Text))',
            fontSize: 'var(--Title-S-FontSize)',
            fontWeight: 'var(--Title-S-FontWeight)',
            color: 'var(--Text-High)',
          }}
        >
          Figma parity — Badge geometry
        </h3>
        <p
          style={{
            margin: 'var(--Spacing-2-5) 0 0',
            color: 'var(--Text-Medium)',
            fontSize: 'var(--Body-S-FontSize)',
            lineHeight: 'var(--Body-S-LineHeight)',
            fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))',
          }}
        >
          Each row renders the live Badge next to the Figma spec (from{' '}
          <code>docs/badge-figma-parity.md</code>). Pad-slot renders a Badge with an Icon in{' '}
          <code>start</code>; pad-no-slot renders Badge text only.
        </p>
      </div>

      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={headStyle}>Size</th>
            <th style={headStyle}>no slot</th>
            <th style={headStyle}>with slot</th>
            <th style={headStyle}>Height</th>
            <th style={headStyle}>Pad L/R (no slot)</th>
            <th style={headStyle}>Pad L (slot)</th>
            <th style={headStyle}>Gap</th>
            <th style={headStyle}>Radius</th>
            <th style={headStyle}>Font</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map(({ size, label }) => {
            const spec = FIGMA_SPEC[size];
            const live = measurements[`${size}-plain`];
            const liveSlot = measurements[`${size}-slot`];
            return (
              <tr key={size}>
                <td style={cellStyle}>
                  <strong>{label}</strong>
                  <div style={{ fontSize: 'var(--Label-2XS-FontSize)', color: 'var(--Text-Low)' }}>
                    h={spec.height} r={spec.radius}
                  </div>
                </td>
                <td style={cellStyle} data-parity-row={`${size}-plain`}>
                  <Badge size={size} aria-label={`${label} plain`}>
                    Badge
                  </Badge>
                </td>
                <td style={cellStyle} data-parity-row={`${size}-slot`}>
                  <Badge
                    size={size}
                    start={<Icon icon="heart" aria-label="" />}
                    aria-label={`${label} with icon`}
                  >
                    Badge
                  </Badge>
                </td>
                <td style={cellStyle}>{cellWithDelta(live?.height, spec.height)}</td>
                <td style={cellStyle}>{cellWithDelta(live?.padL, spec.padNoSlot)}</td>
                <td style={cellStyle}>{cellWithDelta(liveSlot?.padL, spec.padSlot)}</td>
                <td style={cellStyle}>{cellWithDelta(liveSlot?.gap, spec.gap)}</td>
                <td style={cellStyle}>{cellWithDelta(live?.radius, spec.radius)}</td>
                <td style={cellStyle}>{cellWithDelta(live?.fontSize, spec.fontSize)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const FigmaParity: Story = {
  name: 'Figma Parity',
  parameters: {
    layout: 'padded',
  },
  render: () => <ParityInspector />,
};

/* ========================================
   FigmaSlotMatrix — mirrors Figma frame 409:10060 slot rows so visual
   regressions (Avatar-in-slot "destroyed" look, etc.) surface in Chromatic.
   ======================================== */

const slotMatrixRow: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3)',
};

const slotMatrixBadges: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--Spacing-4)',
  alignItems: 'center',
};

const slotMatrixLabel: React.CSSProperties = {
  fontSize: 'var(--Label-S-FontSize)',
  color: 'var(--Text-Low)',
};

const slotMatrixAttentions = ['high', 'medium', 'low'] as const;

function SlotMatrixRow({
  label,
  children,
}: {
  label: string;
  children: (attention: 'high' | 'medium' | 'low') => React.ReactNode;
}) {
  return (
    <div style={slotMatrixRow}>
      <span style={slotMatrixLabel}>{label}</span>
      <div style={slotMatrixBadges}>
        {slotMatrixAttentions.map((attention) => (
          <React.Fragment key={attention}>{children(attention)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}

export const FigmaSlotMatrix: Story = {
  name: 'Figma Slot Matrix',
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <SlotMatrixRow label="Text only">
        {(attention) => (
          <Badge attention={attention} size="m" aria-label="Text only badge">
            Badge
          </Badge>
        )}
      </SlotMatrixRow>

      <SlotMatrixRow label="Start: Icon">
        {(attention) => (
          <Badge
            attention={attention}
            size="m"
            start={<Icon icon="user" aria-label="" />}
            aria-label="Badge with start icon"
          >
            Badge
          </Badge>
        )}
      </SlotMatrixRow>

      <SlotMatrixRow label="Start + End: Icon">
        {(attention) => (
          <Badge
            attention={attention}
            size="m"
            start={<Icon icon="user" aria-label="" />}
            end={<Icon icon="user" aria-label="" />}
            aria-label="Badge with both icons"
          >
            Badge
          </Badge>
        )}
      </SlotMatrixRow>

      <SlotMatrixRow label="Start: IndicatorBadge (negative)">
        {(attention) => (
          <Badge
            attention={attention}
            size="m"
            start={<IndicatorBadge appearance="negative" aria-label="" />}
            aria-label="Badge with start indicator"
          >
            Badge
          </Badge>
        )}
      </SlotMatrixRow>

      <SlotMatrixRow label="End: IndicatorBadge (negative)">
        {(attention) => (
          <Badge
            attention={attention}
            size="m"
            end={<IndicatorBadge appearance="negative" aria-label="" />}
            aria-label="Badge with end indicator"
          >
            Badge
          </Badge>
        )}
      </SlotMatrixRow>

      <SlotMatrixRow label="Start: IndicatorBadge + End: Icon">
        {(attention) => (
          <Badge
            attention={attention}
            size="m"
            start={<IndicatorBadge appearance="negative" aria-label="" />}
            end={<Icon icon="user" aria-label="" />}
            aria-label="Badge with indicator and icon"
          >
            Badge
          </Badge>
        )}
      </SlotMatrixRow>

      <SlotMatrixRow label="Start: Icon + End: IndicatorBadge">
        {(attention) => (
          <Badge
            attention={attention}
            size="m"
            start={<Icon icon="user" aria-label="" />}
            end={<IndicatorBadge appearance="negative" aria-label="" />}
            aria-label="Badge with icon and indicator"
          >
            Badge
          </Badge>
        )}
      </SlotMatrixRow>

      <SlotMatrixRow label="Start: CounterBadge">
        {(attention) => (
          <Badge
            attention={attention}
            size="m"
            start={<CounterBadge value={3} appearance="negative" aria-label="3 items" />}
            aria-label="Badge with start counter"
          >
            Badge
          </Badge>
        )}
      </SlotMatrixRow>

      <SlotMatrixRow label="Start: Avatar">
        {(attention) => (
          <Badge
            attention={attention}
            size="m"
            start={<Avatar aria-label="" />}
            aria-label="Badge with start avatar"
          >
            Badge
          </Badge>
        )}
      </SlotMatrixRow>

      <SlotMatrixRow label="End: CounterBadge">
        {(attention) => (
          <Badge
            attention={attention}
            size="m"
            end={<CounterBadge value={3} appearance="negative" aria-label="3 items" />}
            aria-label="Badge with end counter"
          >
            Badge
          </Badge>
        )}
      </SlotMatrixRow>

      <SlotMatrixRow label="End: Avatar">
        {(attention) => (
          <Badge
            attention={attention}
            size="m"
            end={<Avatar aria-label="" />}
            aria-label="Badge with end avatar"
          >
            Badge
          </Badge>
        )}
      </SlotMatrixRow>

      <div style={slotMatrixRow}>
        <span style={slotMatrixLabel}>Sizes with Icon start slot</span>
        <div style={slotMatrixBadges}>
          {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
            <Badge
              key={size}
              attention="high"
              size={size}
              start={<Icon icon="user" aria-label="" />}
              aria-label={`${size} badge with icon`}
            >
              Badge
            </Badge>
          ))}
        </div>
      </div>

      <div style={slotMatrixRow}>
        <span style={slotMatrixLabel}>Sizes with Avatar start slot (regression target)</span>
        <div style={slotMatrixBadges}>
          {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
            <Badge
              key={size}
              attention="high"
              size={size}
              start={<Avatar aria-label="" />}
              aria-label={`${size} badge with avatar`}
            >
              Badge
            </Badge>
          ))}
        </div>
      </div>
    </div>
  ),
};

/**
 * Visual matrix for issues in `badge-bugs.md` (missing props, slot inheritance,
 * high-attention icon vs label, default appearance).
 */
export const BadgeBugReproduce: Story = {
  name: 'Badge bug reproduce',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Reproduces the four Badge reports from badge-bugs.md in one canvas. Use it to confirm whether each issue still appears before fixing.',
      },
    },
  },
  render: () => {
    const descStyle: React.CSSProperties = {
      fontFamily: 'var(--Typography-Font-Primary)',
      fontSize: 'var(--Body-S-FontSize)',
      lineHeight: 'var(--Body-S-LineHeight)',
      fontWeight: 'var(--Body-FontWeight-Low)',
      color: 'var(--Text-Medium)',
      margin: 0,
      maxWidth: 'min(100%, var(--Spacing-40))',
    };
    const headingStyle: React.CSSProperties = {
      fontFamily: 'var(--Typography-Font-Primary)',
      fontSize: 'var(--Title-M-FontSize)',
      lineHeight: 'var(--Title-M-LineHeight)',
      fontWeight: 'var(--Title-M-FontWeight)',
      color: 'var(--Text-High)',
      margin: 0,
    };
    /** API-table props not implemented on Badge — widened type so we can pass them and show they are ignored. */
    const BadgeWithDocsOnlyProps = Badge as React.FC<
      BadgeProps & { accent?: 'primary' | 'secondary' | 'sparkle'; content?: 'text' }
    >;

    return (
      <div className="story-column" style={{ gap: 'var(--Spacing-6)', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
          <h2 style={headingStyle}>Badge bug reproduce</h2>
          <p style={descStyle}>
            Each block matches a row in badge-bugs.md. If behaviour matches the “Actual” column, the
            report is confirmed here.
          </p>
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={sectionLabelStyle}>
            1 — Missing props: accent + content (API table only)
          </span>
          <p style={descStyle}>
            Left: Badge with accent=&quot;secondary&quot; and content=&quot;text&quot; (should
            affect colour if implemented). Right: real{' '}
            <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>
              appearance=&quot;secondary&quot;
            </code>{' '}
            for comparison.
          </p>
          <div className="story-row" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <BadgeWithDocsOnlyProps
              accent="secondary"
              content="text"
              attention="high"
              aria-label="Docs-only accent content"
            >
              accent/content
            </BadgeWithDocsOnlyProps>
            <Badge appearance="secondary" attention="high" aria-label="True secondary appearance">
              appearance secondary
            </Badge>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={sectionLabelStyle}>
            2 — Start slot: child should inherit Badge appearance (negative)
          </span>
          <p style={descStyle}>
            Parent is always{' '}
            <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>
              appearance=&quot;negative&quot;
            </code>{' '}
            and{' '}
            <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>
              attention=&quot;high&quot;
            </code>
            . Each row compares the same start component without any{' '}
            <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>appearance</code> on the
            child (inherit expected) versus with{' '}
            <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>
              appearance=&quot;negative&quot;
            </code>{' '}
            on the child (manual match).
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(var(--Spacing-24), auto) minmax(0, 1fr) minmax(0, 1fr)',
              gap: 'var(--Spacing-3) var(--Spacing-4)',
              alignItems: 'center',
            }}
          >
            <span style={{ ...sectionLabelStyle, fontSize: 'var(--Label-XS-FontSize)' }} />
            <span style={{ ...sectionLabelStyle, fontSize: 'var(--Label-XS-FontSize)' }}>
              Start child: no appearance
            </span>
            <span style={{ ...sectionLabelStyle, fontSize: 'var(--Label-XS-FontSize)' }}>
              Start child: appearance=&quot;negative&quot;
            </span>

            <span style={sectionLabelStyle}>Icon</span>
            <Badge
              appearance="negative"
              attention="medium"
              size="m"
              start={<Icon icon="heart" aria-label="" />}
              aria-label="Negative Icon implicit"
            >
              Label
            </Badge>
            <Badge
              appearance="negative"
              attention="high"
              size="m"
              start={<Icon icon="heart" appearance="negative" aria-label="" />}
              aria-label="Negative Icon explicit"
            >
              Label
            </Badge>

            <span style={sectionLabelStyle}>Avatar (icon)</span>
            <Badge
              appearance="negative"
              attention="high"
              size="m"
              start={<Avatar content="icon" appearance="auto" aria-label="User" />}
              aria-label="Negative Avatar icon implicit"
            >
              Label
            </Badge>
            <Badge
              appearance="negative"
              attention="high"
              size="m"
              start={<Avatar content="icon" appearance="negative" aria-label="User" />}
              aria-label="Negative Avatar icon explicit"
            >
              Label
            </Badge>

            <span style={sectionLabelStyle}>Avatar (text)</span>
            <Badge
              appearance="negative"
              attention="high"
              size="m"
              start={<Avatar content="text" alt="Alex Brown" aria-label="Alex Brown" />}
              aria-label="Negative Avatar text implicit"
            >
              Label
            </Badge>
            <Badge
              appearance="negative"
              attention="high"
              size="m"
              start={
                <Avatar
                  content="text"
                  alt="Alex Brown"
                  appearance="negative"
                  aria-label="Alex Brown"
                />
              }
              aria-label="Negative Avatar text explicit"
            >
              Label
            </Badge>

            <span style={sectionLabelStyle}>CounterBadge</span>
            <Badge
              appearance="negative"
              attention="high"
              size="m"
              start={<CounterBadge value={3} aria-label="3" />}
              aria-label="Negative Counter implicit"
            >
              Label
            </Badge>
            <Badge
              appearance="negative"
              attention="high"
              size="m"
              start={<CounterBadge value={3} appearance="negative" aria-label="3" />}
              aria-label="Negative Counter explicit"
            >
              Label
            </Badge>

            <span style={sectionLabelStyle}>IndicatorBadge</span>
            <Badge
              appearance="negative"
              attention="high"
              size="m"
              start={<IndicatorBadge aria-label="Alert" />}
              aria-label="Negative Indicator implicit"
            >
              Label
            </Badge>
            <Badge
              appearance="negative"
              attention="high"
              size="m"
              start={<IndicatorBadge appearance="negative" aria-label="Alert" />}
              aria-label="Negative Indicator explicit"
            >
              Label
            </Badge>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={sectionLabelStyle}>
            3 — High attention + start Icon (icon vs label colour)
          </span>
          <p style={descStyle}>
            attention=&quot;high&quot;, size=&quot;m&quot;, start Icon — check whether the icon
            reads darker than the label (Figma parity report).
          </p>
          <div className="story-row" style={{ alignItems: 'center' }}>
            <Badge
              attention="high"
              size="m"
              start={<Icon icon="heart" aria-label="" />}
              aria-label="High with icon"
            >
              Badge
            </Badge>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={sectionLabelStyle}>
            4 — Default appearance: Figma expects sparkle vs code primary
          </span>
          <p style={descStyle}>
            Left: no <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>appearance</code>{' '}
            (current default). Middle: explicit sparkle. Right: explicit primary. If default matches
            primary, bug 4 is visible.
          </p>
          <div className="story-row" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge attention="high" size="m" aria-label="Default implicit appearance">
              no appearance
            </Badge>
            <Badge appearance="sparkle" attention="high" size="m" aria-label="Sparkle">
              sparkle
            </Badge>
            <Badge appearance="primary" attention="high" size="m" aria-label="Primary">
              primary
            </Badge>
          </div>
        </section>
      </div>
    );
  },
};
