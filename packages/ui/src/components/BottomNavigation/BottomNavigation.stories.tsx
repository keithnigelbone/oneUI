/**
 * BottomNavigation.stories.tsx
 * Storybook documentation for BottomNavigation + BottomNavItem.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import React, { useState } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { BottomNavItem } from './BottomNavItem';
import {
  BottomNavigationDefault,
  BottomNavigationLabelTypes,
  BottomNavigationItemCounts,
  BottomNavigationStates,
  BottomNavigationFocusState,
  BottomNavigationWithIcons,
  BottomNavigationAppearances,
  BottomNavigationSurfaceModes,
  MobileFrame,
} from './BottomNavigation.showcase';

const meta = {
  title: 'Components/Navigation/BottomNavigation',
  component: BottomNavigation,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Bottom navigation bar for mobile and tablet surfaces. Holds 2–5 evenly distributed items, each with an icon and optional label. Uses a shared context to coordinate the active item and label layout across children. Backed by a `<nav>` landmark with `aria-current="page"` on the active item.',
      },
    },
  },
  argTypes: {
    labelType: {
      control: 'radio',
      options: ['none', '1line', '2line'],
      description: 'Label layout applied to all items',
      table: { defaultValue: { summary: '1line' } },
    },
    showDivider: {
      control: 'boolean',
      description: 'Show top edge-to-edge divider',
      table: { defaultValue: { summary: 'true' } },
    },
    appearance: {
      control: 'radio',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative',
      ],
      description: 'Multi-accent appearance role applied to all items',
      table: { defaultValue: { summary: 'primary' } },
    },
  },
} satisfies Meta<typeof BottomNavigation>;

export default meta;
type Story = StoryObj<typeof BottomNavigation>;

// 1. Default — interactive controls
export const Default: Story = {
  args: {
    labelType: '1line',
    showDivider: true,
    appearance: 'primary',
    'aria-label': 'Primary',
  },
  render: (args: React.ComponentProps<typeof BottomNavigation>) => (
    <MobileFrame>
      <BottomNavigation {...args} defaultValue="search">
        <BottomNavItem value="home" icon="home" label="Home" />
        <BottomNavItem value="search" icon="search" label="Search" />
        <BottomNavItem value="profile" icon="user" label="Profile" />
      </BottomNavigation>
    </MobileFrame>
  ),
};

// 2. Label types — 1line / 2line / none
export const LabelTypes: Story = {
  name: 'Label Types',
  render: () => <BottomNavigationLabelTypes />,
};

// 3. Item counts — 2 / 3 / 4 / 5
export const ItemCounts: Story = {
  name: 'Item Counts (2–5)',
  render: () => <BottomNavigationItemCounts />,
};

// 4. States — default, active, disabled
export const States: Story = {
  render: () => <BottomNavigationStates />,
};

// 4b. Focus State — force-renders the Informative focus halo via data-force-state
export const FocusState: Story = {
  name: 'Focus State',
  render: () => <BottomNavigationFocusState />,
};

// 5. With icons — activeIcon swap
export const WithIcons: Story = {
  name: 'With Icons',
  render: () => <BottomNavigationWithIcons />,
};

// 6. Interactive — controlled value, play function verifies aria-current flips
export const Interactive: Story = {
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState('home');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
          <span
            style={{
              fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
              fontSize: 'var(--Label-S-FontSize)',
              color: 'var(--Text-Low)',
            }}
          >
            Active: <strong data-testid="active-value">{val}</strong>
          </span>
          <MobileFrame>
            <BottomNavigation aria-label="Controlled" value={val} onValueChange={setVal}>
              <BottomNavItem value="home" icon="home" label="Home" />
              <BottomNavItem value="search" icon="search" label="Search" />
              <BottomNavItem value="profile" icon="user" label="Profile" />
            </BottomNavigation>
          </MobileFrame>
        </div>
      );
    };
    return <Demo />;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const searchButton = await canvas.findByRole('button', { name: /search/i });
    await userEvent.click(searchButton);
    await expect(canvas.getByTestId('active-value')).toHaveTextContent('search');
    await expect(searchButton).toHaveAttribute('aria-current', 'page');
  },
};

// 7. Responsive — phone vs tablet
export const Responsive: Story = {
  name: 'Responsive (phone vs tablet)',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <span style={{ fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))', fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Low)' }}>
          Phone (360)
        </span>
        <MobileFrame width={360}>
          <BottomNavigation aria-label="Phone" defaultValue="home">
            <BottomNavItem value="home" icon="home" label="Home" />
            <BottomNavItem value="search" icon="search" label="Search" />
            <BottomNavItem value="profile" icon="user" label="Profile" />
          </BottomNavigation>
        </MobileFrame>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <span style={{ fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))', fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Low)' }}>
          Tablet (720)
        </span>
        <MobileFrame width={720}>
          <BottomNavigation aria-label="Tablet" defaultValue="home">
            <BottomNavItem value="home" icon="home" label="Home" />
            <BottomNavItem value="search" icon="search" label="Search" />
            <BottomNavItem value="profile" icon="user" label="Profile" />
            <BottomNavItem value="saved" icon="bookmark" label="Saved" />
            <BottomNavItem value="more" icon="menu" label="More" />
          </BottomNavigation>
        </MobileFrame>
      </div>
    </div>
  ),
};

// 8. Surface modes — nav adapts on default / minimal / subtle / moderate / bold / elevated
export const SurfaceModes: Story = {
  name: 'Surface Modes',
  render: () => <BottomNavigationSurfaceModes />,
};

// 9. Appearances
export const Appearances: Story = {
  render: () => <BottomNavigationAppearances />,
};

// 10. Default-everything smoke check (used by visual regression)
export const DefaultShowcase: Story = {
  name: 'Default (Showcase)',
  render: () => <BottomNavigationDefault />,
};
