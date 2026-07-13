/**
 * CheckboxField.stories.tsx
 *
 * Storybook documentation for the CheckboxField composite (InputField-aligned API).
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import React from 'react';
import { CheckboxField } from './CheckboxField';
import { Checkbox } from '../Checkbox/Checkbox';
import { InputFeedback } from '../Input';
import { IconButton } from '../IconButton/IconButton';
import { Tooltip } from '../Tooltip/Tooltip';
import { Surface } from '../Surface';
import {
  CheckboxFieldDefault,
  CheckboxFieldSizes,
  CheckboxFieldStates,
  CheckboxFieldSurfaceContext,
} from './CheckboxField.showcase';

const storyCanvas: React.CSSProperties = {
  width: '100%',
  maxWidth: 'none',
  boxSizing: 'border-box',
};

function StoryCanvas({ children }: { children: React.ReactNode }) {
  return <div style={storyCanvas}>{children}</div>;
}

const meta = {
  title: 'Components/Inputs/CheckboxField',
  component: CheckboxField,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Field shell aligned with **InputField**: `label` / `description` / `infoIconSlot`, `error` / `feedback`, `invalid`, and Base UI `Field` validation. Inner control is **Checkbox** (`size` S/M/L, `appearance`, `checked`, etc.).',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    size: { control: 'radio', options: ['s', 'm', 'l'] },
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
    },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
    error: { control: 'text' },
    groupDefaultValue: { control: 'object' },
    onCheckedChange: { action: 'checkedChange' },
    onGroupValueChange: { action: 'groupValueChange' },
  },
} satisfies Meta<typeof CheckboxField>;

export default meta;
type Story = StoryObj<typeof CheckboxField>;

/** Single integrated checkbox — label only (baseline). */
export const Default: Story = {
  args: {
    label: 'Email me about product updates',
    size: 'm',
    onCheckedChange: fn(),
  },
  render: (args) => (
    <StoryCanvas>
      <CheckboxField {...args} />
    </StoryCanvas>
  ),
};

/** Several standalone `Checkbox` children; field `label` / `description` act as the group header. */
export const MultiOptions: Story = {
  args: {
    label: 'Notifications',
    description: 'Select all that apply.',
    name: 'notifications',
    groupDefaultValue: ['news'],
    onGroupValueChange: fn(),
    children: (
      <>
        <Checkbox value="news">Product news</Checkbox>
        <Checkbox value="tips">Tips and tutorials</Checkbox>
        <Checkbox value="research">Research invites</Checkbox>
      </>
    ),
  },
  render: (args) => (
    <StoryCanvas>
      <CheckboxField {...args} />
    </StoryCanvas>
  ),
};

/** Same as multi-option mode, but options are wrapped in a fragment (supported flattening). */
export const MultiOptionsFragment: Story = {
  args: {
    label: 'Topics',
    description: 'Wrapped in `<>…</>`.',
    name: 'topics-fragment',
    groupDefaultValue: ['a'],
    onGroupValueChange: fn(),
    children: (
      <>
        <Checkbox value="a">Alpha</Checkbox>
        <Checkbox value="b">Beta</Checkbox>
        <Checkbox value="c">Gamma</Checkbox>
      </>
    ),
  },
  render: (args) => (
    <StoryCanvas>
      <CheckboxField {...args} />
    </StoryCanvas>
  ),
};

/** Single field with a string `description` under the label row. */
export const WithDescription: Story = {
  args: {
    label: 'Subscribe to digest',
    description: 'We never sell your address. Unsubscribe anytime.',
    size: 'm',
    onCheckedChange: fn(),
  },
  render: (args) => (
    <StoryCanvas>
      <CheckboxField {...args} />
    </StoryCanvas>
  ),
};

export const FeedbackOnly: Story = {
  args: {
    label: 'Accept terms',
    feedback: <InputFeedback variant="negative" attention="low">You must accept to continue.</InputFeedback>,
    onCheckedChange: fn(),
  },
  render: (args) => (
    <StoryCanvas>
      <CheckboxField {...args} />
    </StoryCanvas>
  ),
};

export const Required: Story = {
  args: {
    label: 'I agree to the terms',
    required: true,
    onCheckedChange: fn(),
  },
  render: (args) => (
    <StoryCanvas>
      <CheckboxField {...args} />
    </StoryCanvas>
  ),
};

export const WithInfoIcon: Story = {
  args: {
    label: 'Share crash reports',
    description: 'Helps us fix bugs faster.',
    infoIconSlot: (
      <Tooltip
        content="Reports are anonymised and never include message content."
        trigger="hover"
      >
        <IconButton
          style={{ '--_ib-size': 'var(--_ib-icon-size)' } as React.CSSProperties}
          icon="info"
          aria-label="More about crash reports"
          size="m"
          appearance="neutral"
          attention="low"
          condensed
        />
      </Tooltip>
    ),
    onCheckedChange: fn(),
  },
  render: (args) => (
    <StoryCanvas>
      <CheckboxField {...args} />
    </StoryCanvas>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Unavailable option',
    disabled: true,
    defaultChecked: true,
    onCheckedChange: fn(),
  },
  render: (args) => (
    <StoryCanvas>
      <CheckboxField {...args} />
    </StoryCanvas>
  ),
};

export const Invalid: Story = {
  args: {
    label: 'Confirm you are human',
    invalid: true,
    error: 'Please complete verification.',
    onCheckedChange: fn(),
  },
  render: (args) => (
    <StoryCanvas>
      <CheckboxField {...args} />
    </StoryCanvas>
  ),
};

export const MultiOptionsWithFeedback: Story = {
  args: {
    label: 'Delivery options',
    name: 'delivery',
    groupDefaultValue: ['standard'],
    onGroupValueChange: fn(),
    feedback: (
      <InputFeedback variant="informative" attention="low">
        Changing options may reset your delivery window.
      </InputFeedback>
    ),
    children: (
      <>
        <Checkbox value="standard">Standard</Checkbox>
        <Checkbox value="express">Express</Checkbox>
      </>
    ),
  },
  render: (args) => (
    <StoryCanvas>
      <CheckboxField {...args} />
    </StoryCanvas>
  ),
};

export const FullExample: Story = {
  render: () => (
    <StoryCanvas>
      <CheckboxFieldDefault />
    </StoryCanvas>
  ),
};

export const Sizes: Story = {
  render: () => <CheckboxFieldSizes />,
  parameters: { layout: 'padded' },
};

export const States: Story = {
  render: () => <CheckboxFieldStates />,
  parameters: { layout: 'padded' },
};

export const SurfaceContext: Story = {
  render: () => <CheckboxFieldSurfaceContext />,
  parameters: { layout: 'padded' },
};

export const OnGhostSurface: Story = {
  render: () => (
    <Surface
      mode="subtle"
      style={{
        padding: 'var(--Spacing-5)',
        borderRadius: 'var(--Shape-4)',
        width: '100%',
        maxWidth: 'none',
        boxSizing: 'border-box',
      }}
    >
      <CheckboxField
        label="Share usage diagnostics"
        appearance="neutral"
        feedback={<InputFeedback attention="low">Helps us improve reliability.</InputFeedback>}
      />
    </Surface>
  ),
};
