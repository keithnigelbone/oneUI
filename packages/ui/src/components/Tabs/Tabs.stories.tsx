/**
 * Tabs.stories.tsx
 * Storybook documentation for Tabs / TabGroup / TabItem.
 *
 * Covers the 8 required story types: Default, Variants (orientations),
 * Sizes, States, WithIcons, Interactive (play function), Responsive, Themes.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent } from 'storybook/test';
import React, { useState } from 'react';
import { TabGroup } from './TabGroup';
import { TabItem } from './TabItem';
import { TabPanel } from './TabPanel';
import { Tabs } from './Tabs';
import { Icon } from '../../icons/Icon';
import { Surface } from '../Surface/Surface';
import { CounterBadge } from '../CounterBadge/CounterBadge';
import { TabsAdoptionMatrix } from './Tabs.showcase';

const meta = {
  title: 'Components/Navigation/Tabs',
  component: TabGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Accessible tabbed navigation built on Base UI Tabs. Three sizes (S/M/L), two orientations (horizontal/vertical), 12-role appearance, surface-aware focus halo. Public slots use `start` (leading) and `end` (trailing); `icon` and `badge` remain legacy aliases. Matches Figma spec F7KEYdO8R8Nbe2N4gI8dIU.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['s', 'm', 'l'],
      description: 'TabItem size propagated via TabsContext',
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
    appearance: {
      control: 'select',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ],
    },
    activateOnFocus: { control: 'boolean' },
    loopFocus: { control: 'boolean' },
    showIndicator: { control: 'boolean' },
  },
} satisfies Meta<typeof TabGroup>;

export default meta;
type Story = StoryObj<typeof TabGroup>;

const SampleTabs = (
  <>
    <TabItem value="overview">Overview</TabItem>
    <TabItem value="projects">Projects</TabItem>
    <TabItem value="account">Account</TabItem>
  </>
);

/* ============================================================
   1. Default
   ============================================================ */
export const Default: Story = {
  args: {
    defaultValue: 'overview',
    size: 'm',
    orientation: 'horizontal',
    appearance: 'primary',
    children: SampleTabs,
  },
};

/* ============================================================
   2. Variants — orientation (horizontal + vertical)
   ============================================================ */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div>
        <h4 style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)' }}>Horizontal</h4>
        <TabGroup defaultValue="a">
          <TabItem value="a">One</TabItem>
          <TabItem value="b">Two</TabItem>
          <TabItem value="c">Three</TabItem>
        </TabGroup>
      </div>
      <div style={{ minWidth: 180 }}>
        <h4 style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)' }}>Vertical</h4>
        <TabGroup defaultValue="a" orientation="vertical">
          <TabItem value="a">One</TabItem>
          <TabItem value="b">Two</TabItem>
          <TabItem value="c">Three</TabItem>
        </TabGroup>
      </div>
    </div>
  ),
};

/* ============================================================
   3. Sizes — S / M / L
   ============================================================ */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <div key={size}>
          <h4 style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)' }}>Size {size.toUpperCase()}</h4>
          <TabGroup size={size} defaultValue="a">
            <TabItem value="a">Overview</TabItem>
            <TabItem value="b">Projects</TabItem>
            <TabItem value="c">Account</TabItem>
          </TabGroup>
        </div>
      ))}
    </div>
  ),
};

/* ============================================================
   4. States — disabled + selected
   ============================================================ */
export const States: Story = {
  render: () => (
    <TabGroup defaultValue="b">
      <TabItem value="a">Enabled</TabItem>
      <TabItem value="b">Selected</TabItem>
      <TabItem value="c" disabled>Disabled</TabItem>
    </TabGroup>
  ),
};

/* ============================================================
   5. WithIcons — start + end slots
   ============================================================ */
export const WithIcons: Story = {
  render: () => (
    <TabGroup defaultValue="home">
      <TabItem value="home" start={<Icon name="home" />}>Home</TabItem>
      <TabItem
        value="inbox"
        start={<Icon name="mail" />}
        end={<CounterBadge value={3} appearance="negative" size="s" aria-label="3 unread" />}
      >
        Inbox
      </TabItem>
      <TabItem value="settings" start={<Icon name="settings" />}>Settings</TabItem>
    </TabGroup>
  ),
};

/* ============================================================
   6. Interactive — controlled state + assertion
   ============================================================ */
export const Interactive: Story = {
  render: function Render() {
    const [value, setValue] = useState<string | number | null>('a');
    return (
      <TabGroup value={value} onValueChange={setValue}>
        <TabItem value="a">First</TabItem>
        <TabItem value="b">Second</TabItem>
        <TabItem value="c">Third</TabItem>
        <TabPanel value="a">First panel content</TabPanel>
        <TabPanel value="b">Second panel content</TabPanel>
        <TabPanel value="c">Third panel content</TabPanel>
      </TabGroup>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const second = canvas.getByRole('tab', { name: 'Second' });
    await userEvent.click(second);
    await expect(second).toHaveAttribute('aria-selected', 'true');
  },
};

/* ============================================================
   7. Responsive — tabs in a resizable container.
   Drag the bottom-right handle to shrink the viewport; tabs keep their
   content-sized width and the indicator stays snug under the active
   label. No fullWidth / stretching — Figma has no "distribute-evenly"
   spec, so the component sticks to content-width tabs.
   ============================================================ */
export const Responsive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Tabs keep their natural content width at any container size. Drag the bottom-right corner of the frame to see that the indicator stays anchored to the active label regardless of the parent width. The container just constrains available space — it does not stretch the individual tabs.',
      },
    },
  },
  render: () => (
    <div
      style={{
        resize: 'horizontal',
        overflow: 'auto',
        minWidth: 240,
        maxWidth: 720,
        border: 'var(--Stroke-M) solid var(--Border-Subtle)',
        padding: 'var(--Spacing-4)',
        borderRadius: 'var(--Shape-4)',
      }}
    >
      <TabGroup defaultValue="a">
        <TabItem value="a">Summary</TabItem>
        <TabItem value="b">Details</TabItem>
        <TabItem value="c">History</TabItem>
        <TabItem value="d">Settings</TabItem>
      </TabGroup>
    </div>
  ),
};

/* ============================================================
   8. Themes — surface context (light + dark via Surface modes)
   ============================================================ */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <Surface mode="default">
        <div style={{ padding: 'var(--Spacing-4-5)' }}>
          <p style={{ color: 'var(--Text-Low)', fontSize: 'var(--Label-XS-FontSize)', marginBottom: 'var(--Spacing-3-5)' }}>Default surface</p>
          <TabGroup defaultValue="a">
            <TabItem value="a">One</TabItem>
            <TabItem value="b">Two</TabItem>
            <TabItem value="c">Three</TabItem>
          </TabGroup>
        </div>
      </Surface>
      <Surface mode="subtle">
        <div style={{ padding: 'var(--Spacing-4-5)' }}>
          <p style={{ color: 'var(--Text-Low)', fontSize: 'var(--Label-XS-FontSize)', marginBottom: 'var(--Spacing-3-5)' }}>Subtle surface</p>
          <TabGroup defaultValue="a">
            <TabItem value="a">One</TabItem>
            <TabItem value="b">Two</TabItem>
            <TabItem value="c">Three</TabItem>
          </TabGroup>
        </div>
      </Surface>
      <Surface mode="bold">
        <div style={{ padding: 'var(--Spacing-4-5)' }}>
          <p style={{ fontSize: 'var(--Label-XS-FontSize)', marginBottom: 'var(--Spacing-3-5)' }}>Bold surface — labels + indicator flip to on-colour</p>
          <TabGroup defaultValue="a">
            <TabItem value="a">One</TabItem>
            <TabItem value="b">Two</TabItem>
            <TabItem value="c">Three</TabItem>
          </TabGroup>
        </div>
      </Surface>
    </div>
  ),
};

export const AdoptionMatrix: Story = {
  name: 'Adoption Matrix',
  parameters: {
    docs: {
      description: {
        story:
          'Canonical adopter fixture: `Surface` context × `appearance` × real start/end slotted children. Use this instead of the Storybook Backgrounds addon when validating context-aware behaviour.',
      },
    },
  },
  render: () => <TabsAdoptionMatrix />,
};

/* ============================================================
   Focus state — QA story for accessibility review.
   Auto-focuses the middle tab so the double-ring halo is visible.
   ============================================================ */
export const FocusState: Story = {
  name: 'Focus state (accessibility QA)',
  parameters: {
    docs: {
      description: {
        story:
          'The "Two" tab in each group has `data-force-state="focus"` to render the double-ring halo persistently. The halo is on the state-layer and uses `--Surface-Halo-Gap` so it adapts to whatever surface the Tabs sit on.',
      },
    },
  },
  render: function Render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
        <div>
          <h4 style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)' }}>
            Default surface — focused tab shows double-ring halo
          </h4>
          <TabGroup defaultValue="b">
            <TabItem value="a">One</TabItem>
            <TabItem value="b" data-force-state="focus">Two (focused)</TabItem>
            <TabItem value="c">Three</TabItem>
          </TabGroup>
        </div>
        <Surface mode="subtle">
          <div style={{ padding: 'var(--Spacing-4-5)' }}>
            <p style={{ color: 'var(--Text-Low)', fontSize: 'var(--Label-XS-FontSize)', marginBottom: 'var(--Spacing-3-5)' }}>
              On subtle surface — halo gap picks up the subtle fill
            </p>
            <TabGroup defaultValue="b">
              <TabItem value="a">One</TabItem>
              <TabItem value="b" data-force-state="focus">Two (focused)</TabItem>
              <TabItem value="c">Three</TabItem>
            </TabGroup>
          </div>
        </Surface>
        <Surface mode="bold">
          <div style={{ padding: 'var(--Spacing-4-5)' }}>
            <p style={{ fontSize: 'var(--Label-XS-FontSize)', marginBottom: 'var(--Spacing-3-5)' }}>
              On bold surface — halo gap matches the bold fill, labels flip to on-colour
            </p>
            <TabGroup defaultValue="b">
              <TabItem value="a">One</TabItem>
              <TabItem value="b" data-force-state="focus">Two (focused)</TabItem>
              <TabItem value="c">Three</TabItem>
            </TabGroup>
          </div>
        </Surface>
      </div>
    );
  },
};

/* ============================================================
   Hover state — unselected tabs dim to --Text-Low on hover.
   No hover indicator bar; the selected state uses the tinted-accent
   indicator, so hover feedback stays distinct via label colour only.
   ============================================================ */
export const HoverState: Story = {
  name: 'Hover state (label colour shift)',
  parameters: {
    docs: {
      description: {
        story:
          'Unselected tabs shift to `--Text-Low` on hover so the interaction is visible without a bar. Hover "One" or "Three" to see the label dim. The selected tab keeps its tinted-a11y label and the animated indicator.',
      },
    },
  },
  render: () => (
    <TabGroup defaultValue="b">
      <TabItem value="a">One</TabItem>
      <TabItem value="b">Two (selected)</TabItem>
      <TabItem value="c">Three</TabItem>
    </TabGroup>
  ),
};

/* ============================================================
   Compound API still supported
   ============================================================ */
export const CompoundAPI: Story = {
  name: 'Compound API (Tabs.Root)',
  render: () => (
    <Tabs defaultValue="overview">
      <Tabs.List>
        <Tabs.Item value="overview">Overview</Tabs.Item>
        <Tabs.Item value="projects">Projects</Tabs.Item>
        <Tabs.Item value="account">Account</Tabs.Item>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="overview">Overview body</Tabs.Panel>
      <Tabs.Panel value="projects">Projects body</Tabs.Panel>
      <Tabs.Panel value="account">Account body</Tabs.Panel>
    </Tabs>
  ),
};
