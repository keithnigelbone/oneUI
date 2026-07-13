/**
 * Skeleton.stories.tsx
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { SkeletonGroup } from './SkeletonGroup';
import { SkeletonItem } from './SkeletonItem';

const labelStyle: React.CSSProperties = {
  color: 'var(--Text-Medium)',
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  marginBlockEnd: 'var(--Spacing-1)',
};

const meta: Meta<typeof SkeletonItem> = {
  title: 'Components/Feedback/Skeleton [WIP]',
  component: SkeletonItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'PRD skeleton primitives. `SkeletonItem` resolves size from explicit width/height, child measurement, or token fallback. `SkeletonGroup` staggers shimmer automatically (`index × Motion-Offset-L`).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '100%',
          maxWidth: 'var(--Spacing-40)',
          minHeight: 'var(--Spacing-5)',
          display: 'flex',
          alignItems: 'flex-start',
          overflow: 'visible',
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    width: {
      type: { name: 'number' },
      control: { type: 'number', min: 1, step: 1 },
      description: 'Explicit width in pixels — when set, sizing ignores children.',
      table: {
        type: { summary: 'number | string' },
        defaultValue: { summary: 'undefined' },
      },
    },
    height: {
      type: { name: 'number' },
      control: { type: 'number', min: 1, step: 1 },
      description: 'Explicit height in pixels — when set, sizing ignores children.',
      table: {
        type: { summary: 'number | string' },
        defaultValue: { summary: 'undefined' },
      },
    },
    children: {
      control: false,
      description: 'Content used for natural size inference when width/height are omitted.',
      table: {
        type: { summary: 'ReactNode' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
  args: {
    width: 200,
    height: 16,
  },
};

export default meta;
type Story = StoryObj<typeof SkeletonItem>;

export const Default: Story = {
  name: 'Default',
  args: {
    width: 200,
    height: 16,
  },
  render: (args) => <SkeletonItem {...args} />,
};

export const ExplicitSize: Story = {
  name: 'Explicit width / height',
  args: {
    width: 200,
    height: 16,
  },
  render: (args) => (
    <div>
      <p style={labelStyle}>200×16 px explicit — children ignored for sizing</p>
      <SkeletonItem {...args}>
        <span style={{ fontSize: 'var(--Headline-L-FontSize)' }}>Hidden headline</span>
      </SkeletonItem>
    </div>
  ),
};

export const InferredFromChildren: Story = {
  name: 'Inferred from children',
  render: () => (
    <div>
      <p style={labelStyle}>Mirrors child natural size — content is not visibly painted</p>
      <SkeletonItem>
        <span
          style={{
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Body-M-FontSize)',
            lineHeight: 'var(--Body-M-LineHeight)',
            fontWeight: 'var(--Body-FontWeight-Medium)',
          }}
        >
          Body line placeholder
        </span>
      </SkeletonItem>
    </div>
  ),
};

export const FallbackDefault: Story = {
  name: 'Fallback default',
  render: () => (
    <div>
      <p style={labelStyle}>No size, no children — token fallback box</p>
      <SkeletonItem />
    </div>
  ),
};

export const GroupStagger: Story = {
  name: 'SkeletonGroup stagger',
  render: () => (
    <div>
      <p style={labelStyle}>Automatic stagger — delay = index × Motion-Offset-L</p>
      <SkeletonGroup>
        <SkeletonItem width="100%" height={12} />
        <SkeletonItem width="80%" height={12} />
        <SkeletonItem width="60%" height={12} />
      </SkeletonGroup>
    </div>
  ),
};

export const ChildrenHiddenSizePreserved: Story = {
  name: 'Children hidden, size preserved',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      <p style={labelStyle}>Real content beside skeleton — same footprint</p>
      <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'flex-start' }}>
        <SkeletonItem>
          <div
            style={{
              width: 'var(--Spacing-32)',
              height: 'var(--Spacing-32)',
              borderRadius: 'var(--Shape-Pill)',
            }}
          />
        </SkeletonItem>
        <SkeletonGroup>
          <SkeletonItem>
            <span style={{ fontSize: 'var(--Title-M-FontSize)', fontWeight: 'var(--Title-M-FontWeight)' }}>
              Card title
            </span>
          </SkeletonItem>
          <SkeletonItem>
            <span style={{ fontSize: 'var(--Body-S-FontSize)', lineHeight: 'var(--Body-S-LineHeight)' }}>
              Supporting description line for the card body.
            </span>
          </SkeletonItem>
        </SkeletonGroup>
      </div>
    </div>
  ),
};
