/**
 * HeaderItem.stories.tsx
 * Storybook documentation for the HeaderItem atom component
 *
 * HeaderItem (.Header.Item in Figma) is the navigation item used inside
 * both WebHeader.PrimaryNav and WebHeader.SecondaryNav.
 *
 * Height: 56px (stretches to parent row)
 * Typography: Label S Medium (14px, weight 500, line-height 14px)
 * State layer: Shape-3XS (8px radius)
 *
 * Attention levels control ACTIVE visual treatment:
 *   high:   pill background + accent text (no underline)
 *   medium: underline indicator + accent text (no pill)
 *   low:    accent text only (default)
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeaderItem } from './HeaderItem';
import { IndicatorBadge } from '../IndicatorBadge/IndicatorBadge';
import { Icon } from '../Icon/Icon';
import React from 'react';

/** Shared row style matching the 56px header row */
const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  height: 'var(--Spacing-14)',
  gap: 'var(--Spacing-1)',
};

const labelStyle: React.CSSProperties = {
  color: 'var(--Text-Medium)',
  fontSize: 'var(--Label-S-FontSize)',
  marginBlockEnd: 'var(--Spacing-1)',
};

const meta: Meta<typeof HeaderItem> = {
  title: 'Components/Navigation/WebHeader/HeaderItem',
  component: HeaderItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Navigation item atom (`.Header.Item` in Figma). Used in both PrimaryNav and SecondaryNav. 56px tall, Label S Medium typography, 8px state layer radius. Attention levels control the active visual: high=pill, medium=underline, low=text only.',
      },
    },
  },
  argTypes: {
    active: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    attention: {
      control: 'radio',
      options: ['low', 'medium', 'high'],
      description: 'Active visual: high=pill, medium=underline, low=text only',
      table: { defaultValue: { summary: 'low' } },
    },
    startSize: { control: 'radio', options: ['none', 'S', 'M'] },
    endSize: { control: 'radio', options: ['none', 'S', 'M'] },
    visuallyAlignToStart: { control: 'boolean' },
    href: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof HeaderItem>;

/* ========================================
   1. DEFAULT
   ======================================== */

export const Default: Story = {
  args: {
    value: 'home',
    children: 'Home',
    attention: 'medium',
    active: true,
  },
  decorators: [
    (Story) => (
      <div style={rowStyle}>
        <Story />
      </div>
    ),
  ],
};

/* ========================================
   2. ATTENTION LEVELS — the core variation
   ======================================== */

export const AttentionLevels: Story = {
  name: 'Attention Levels',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      {/* LOW — accent text only when active */}
      <div>
        <p style={labelStyle}>attention=&quot;low&quot; — accent text only when active</p>
        <div style={rowStyle}>
          <HeaderItem value="low-1" attention="low">Inactive</HeaderItem>
          <HeaderItem value="low-2" attention="low" active>Active</HeaderItem>
        </div>
      </div>

      {/* MEDIUM — underline indicator when active */}
      <div>
        <p style={labelStyle}>attention=&quot;medium&quot; — underline indicator when active</p>
        <div style={rowStyle}>
          <HeaderItem value="med-1" attention="medium">Inactive</HeaderItem>
          <HeaderItem value="med-2" attention="medium" active>Active</HeaderItem>
        </div>
      </div>

      {/* HIGH — pill background when active */}
      <div>
        <p style={labelStyle}>attention=&quot;high&quot; — pill background when active</p>
        <div style={rowStyle}>
          <HeaderItem value="high-1" attention="high">Inactive</HeaderItem>
          <HeaderItem value="high-2" attention="high" active>Active</HeaderItem>
        </div>
      </div>
    </div>
  ),
};

/* ========================================
   3. START SLOTS
   ======================================== */

export const StartSlots: Story = {
  name: 'Start Slots',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      <div>
        <p style={labelStyle}>Start M (16px icon)</p>
        <div style={rowStyle}>
          <HeaderItem value="s1" attention="medium" startSize="M" start={<Icon icon="home" size="4" />}>
            Home
          </HeaderItem>
          <HeaderItem value="s2" attention="medium" startSize="M" start={<Icon icon="home" size="4" />} active>
            Home
          </HeaderItem>
        </div>
      </div>
      <div>
        <p style={labelStyle}>Start S (8px indicator badge)</p>
        <div style={rowStyle}>
          <HeaderItem value="s3" attention="medium" startSize="S" start={<IndicatorBadge aria-label="New" appearance="negative" />}>
            Updates
          </HeaderItem>
          <HeaderItem value="s4" attention="medium" startSize="S" start={<IndicatorBadge aria-label="New" appearance="negative" />} active>
            Updates
          </HeaderItem>
        </div>
      </div>
    </div>
  ),
};

/* ========================================
   4. END SLOTS
   ======================================== */

export const EndSlots: Story = {
  name: 'End Slots',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      <div>
        <p style={labelStyle}>End M (16px icon)</p>
        <div style={rowStyle}>
          <HeaderItem value="e1" attention="medium" endSize="M" end={<Icon icon="chevronDown" size="4" />}>
            Menu
          </HeaderItem>
          <HeaderItem value="e2" attention="medium" endSize="M" end={<Icon icon="chevronDown" size="4" />} active>
            Menu
          </HeaderItem>
        </div>
      </div>
      <div>
        <p style={labelStyle}>End S (8px badge)</p>
        <div style={rowStyle}>
          <HeaderItem value="e3" attention="medium" endSize="S" end={<IndicatorBadge aria-label="3" appearance="negative" />}>
            Inbox
          </HeaderItem>
          <HeaderItem value="e4" attention="medium" endSize="S" end={<IndicatorBadge aria-label="3" appearance="negative" />} active>
            Inbox
          </HeaderItem>
        </div>
      </div>
    </div>
  ),
};

/* ========================================
   5. COMBINED SLOTS
   ======================================== */

export const CombinedSlots: Story = {
  name: 'Start + End Slots',
  render: () => (
    <div style={rowStyle}>
      <HeaderItem value="c1" attention="medium" startSize="M" start={<Icon icon="home" size="4" />} endSize="S" end={<IndicatorBadge aria-label="New" appearance="negative" />}>
        Home
      </HeaderItem>
      <HeaderItem value="c2" attention="medium" startSize="M" start={<Icon icon="home" size="4" />} endSize="S" end={<IndicatorBadge aria-label="New" appearance="negative" />} active>
        Home
      </HeaderItem>
      <HeaderItem value="c3" attention="high" startSize="S" start={<IndicatorBadge aria-label="Dot" appearance="negative" />} endSize="M" end={<Icon icon="chevronRight" size="4" />}>
        Category
      </HeaderItem>
      <HeaderItem value="c4" attention="high" startSize="S" start={<IndicatorBadge aria-label="Dot" appearance="negative" />} endSize="M" end={<Icon icon="chevronRight" size="4" />} active>
        Category
      </HeaderItem>
    </div>
  ),
};

/* ========================================
   6. VISUAL ALIGN TO START
   ======================================== */

export const AlignToStart: Story = {
  name: 'Visually Align To Start',
  render: () => (
    <div style={{ paddingInlineStart: 'var(--Spacing-Margin)' }}>
      <p style={{ ...labelStyle, marginBlockEnd: 'var(--Spacing-0-5)' }}>
        Left-aligned heading above
      </p>
      <div style={rowStyle}>
        <HeaderItem value="a1" attention="medium" visuallyAlignToStart active>First Item</HeaderItem>
        <HeaderItem value="a2" attention="medium">Second</HeaderItem>
        <HeaderItem value="a3" attention="medium">Third</HeaderItem>
      </div>
    </div>
  ),
};

/* ========================================
   7. LINK vs BUTTON
   ======================================== */

export const LinkVsButton: Story = {
  name: 'Link vs Button',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <p style={labelStyle}>With href → &lt;a&gt;</p>
        <div style={rowStyle}>
          <HeaderItem value="l1" attention="medium" href="/home">Home</HeaderItem>
          <HeaderItem value="l2" attention="medium" href="/products" active>Products</HeaderItem>
        </div>
      </div>
      <div>
        <p style={labelStyle}>Without href → &lt;button&gt;</p>
        <div style={rowStyle}>
          <HeaderItem value="b1" attention="medium">Action</HeaderItem>
          <HeaderItem value="b2" attention="medium" active>Active</HeaderItem>
        </div>
      </div>
    </div>
  ),
};

/* ========================================
   8. COMPOSITION — how it looks in PrimaryNav + SecondaryNav
   ======================================== */

export const Composition: Story = {
  name: 'Composition: Nav Rows',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div>
        <p style={{ ...labelStyle, color: 'var(--Text-Low)' }}>PrimaryNav row (medium attention, underline active)</p>
        <div style={{ ...rowStyle, justifyContent: 'center', borderBottom: 'var(--Stroke-M) solid var(--Border-Subtle)' }}>
          <HeaderItem value="home" attention="medium" active>Home</HeaderItem>
          <HeaderItem value="products" attention="medium">Products</HeaderItem>
          <HeaderItem value="solutions" attention="medium">Solutions</HeaderItem>
          <HeaderItem value="resources" attention="medium">Resources</HeaderItem>
        </div>
      </div>
      <div>
        <p style={{ ...labelStyle, color: 'var(--Text-Low)' }}>SecondaryNav row (high attention, pill active)</p>
        <div style={rowStyle}>
          <HeaderItem value="overview" attention="high" active>Overview</HeaderItem>
          <HeaderItem value="features" attention="high">Features</HeaderItem>
          <HeaderItem value="pricing" attention="high">Pricing</HeaderItem>
        </div>
      </div>
    </div>
  ),
};
