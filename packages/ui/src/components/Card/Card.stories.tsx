/**
 * Card.stories.tsx
 * Storybook documentation for the Card component.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import React from 'react';
import { Card } from './Card';
import { Text } from '../Text';
import { Button } from '../Button';
import { Surface } from '../Surface';

const meta = {
  title: 'Components/Layout/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Content card / panel container. Corner radius, stroke, shadow, padding, and gap follow the brand\'s "Cards" theme family (`--Card-*` tokens). Default cards paint the brand-configured fill; pass `surface` to render a tinted/bold/elevated Surface so children adapt automatically.',
      },
    },
  },
  argTypes: {
    surface: {
      control: 'select',
      options: [undefined, 'default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'],
      description: 'Surface mode — when set, children adapt via [data-surface] remapping.',
    },
    appearance: {
      control: 'select',
      options: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'positive', 'negative', 'warning', 'informative'],
    },
    interactive: { control: 'boolean' },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const SampleContent = ({ title = 'Card title' }: { title?: string }) => (
  <>
    <Text variant="title" size="S">
      {title}
    </Text>
    <Text variant="body" size="S" attention="medium">
      Supporting copy that explains what this card groups. Geometry follows the brand&apos;s
      Cards theme family.
    </Text>
  </>
);

export const Default: Story = {
  args: { children: <SampleContent /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Card title')).toBeVisible();
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    children: <SampleContent title="Clickable card" />,
  },
};

export const SubtleSurface: Story = {
  name: 'Surface: subtle',
  args: {
    surface: 'subtle',
    children: <SampleContent title="Subtle tinted card" />,
  },
};

export const ElevatedSurface: Story = {
  name: 'Surface: elevated',
  args: {
    surface: 'elevated',
    children: <SampleContent title="Elevated card" />,
  },
};

export const BoldSurface: Story = {
  name: 'Surface: bold',
  args: {
    surface: 'bold',
    children: (
      <>
        <SampleContent title="Bold brand card" />
        <div style={{ display: 'flex', gap: 'var(--Spacing-3)' }}>
          <Button attention="high">Primary</Button>
          <Button attention="low">Secondary</Button>
        </div>
      </>
    ),
  },
};

export const SecondaryRole: Story = {
  name: 'Surface: subtle, secondary role',
  args: {
    surface: 'subtle',
    appearance: 'secondary',
    children: <SampleContent title="Secondary-tinted card" />,
  },
};

export const SemanticElement: Story = {
  name: 'As article',
  args: {
    as: 'article',
    children: <SampleContent title="Article card" />,
  },
};

export const NestedOnBold: Story = {
  name: 'Nested inside bold Surface',
  render: (args) => (
    <Surface mode="bold" style={{ padding: 'var(--Spacing-5)' }}>
      <Card {...args}>
        <SampleContent title="Card on bold surface" />
      </Card>
    </Surface>
  ),
  args: { surface: 'elevated' },
};
