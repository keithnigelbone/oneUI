/**
 * RadioField.stories.tsx
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import React from 'react';
import { RadioField } from './RadioField';
import { Radio } from '../Radio/Radio';
import { InputFeedback } from '../Input';
import { InputFieldDefaultInfo } from '../InputField/InputFieldDefaultInfo';

const storyCanvas: React.CSSProperties = {
  width: '100%',
  maxWidth: 'none',
  boxSizing: 'border-box',
};

function StoryCanvas({ children }: { children: React.ReactNode }) {
  return <div style={storyCanvas}>{children}</div>;
}

const meta = {
  title: 'Components/Inputs/RadioField',
  component: RadioField,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Field shell aligned with **InputField** and **CheckboxField**. **Integrated single** (no `children`): implicit lone control beside field `label` / `description`; use `checked` / `defaultChecked` / `onCheckedChange` or `value` / `defaultValue` with `singleOptionValue` (default `on`). **Two or more `Radio` children:** field header above the group; each option keeps its own label. Colour follows **`appearance`** on inner radios.',
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
    orientation: { control: 'radio', options: ['vertical', 'horizontal'] },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    checked: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
    invalid: { control: 'boolean' },
    onValueChange: { action: 'valueChange' },
    onCheckedChange: { action: 'checkedChange' },
  },
} satisfies Meta<typeof RadioField>;

export default meta;
type Story = StoryObj<typeof RadioField>;

/** Integrated single option — no `Radio` child; field `label` names the control. */
export const Default: Story = {
  args: {
    label: 'Enable push notifications',
    name: 'push',
    defaultValue: 'on',
    onValueChange: fn(),
  },
  render: (args) => (
    <StoryCanvas>
      <RadioField {...args} />
    </StoryCanvas>
  ),
};

/** Two or more options — field label above the `RadioGroup`. */
export const MultiOptions: Story = {
  args: {
    label: 'Contact method',
    name: 'contact',
    defaultValue: 'email',
    onValueChange: fn(),
    children: (
      <>
        <Radio value="email">Email</Radio>
        <Radio value="sms">SMS</Radio>
        <Radio value="post">Post</Radio>
      </>
    ),
  },
  render: (args) => (
    <StoryCanvas>
      <RadioField {...args} />
    </StoryCanvas>
  ),
};

export const MultiOptionsWithDescription: Story = {
  args: {
    label: 'Contact method',
    description: 'Choose how we should reach you.',
    name: 'contact-desc',
    defaultValue: 'email',
    onValueChange: fn(),
    children: (
      <>
        <Radio value="email">Email</Radio>
        <Radio value="sms">SMS</Radio>
        <Radio value="post">Post</Radio>
      </>
    ),
  },
  render: (args) => (
    <StoryCanvas>
      <RadioField {...args} />
    </StoryCanvas>
  ),
};

/** Options wrapped in a fragment (flattened like CheckboxField). */
export const MultiOptionsFragment: Story = {
  args: {
    label: 'Theme',
    name: 'theme-frag',
    defaultValue: 'system',
    onValueChange: fn(),
    children: (
      <>
        <Radio value="light">Light</Radio>
        <Radio value="dark">Dark</Radio>
        <Radio value="system">System</Radio>
      </>
    ),
  },
  render: (args) => (
    <StoryCanvas>
      <RadioField {...args} />
    </StoryCanvas>
  ),
};

export const MultiOptionsHorizontal: Story = {
  args: {
    label: 'Density',
    name: 'density',
    defaultValue: 'default',
    orientation: 'horizontal',
    onValueChange: fn(),
    children: (
      <>
        <Radio value="compact">Compact</Radio>
        <Radio value="default">Default</Radio>
        <Radio value="comfortable">Comfortable</Radio>
      </>
    ),
  },
  render: (args) => (
    <StoryCanvas>
      <RadioField {...args} />
    </StoryCanvas>
  ),
};

export const WithFeedback: Story = {
  args: {
    label: 'Contact method',
    description: 'Choose how we should reach you.',
    name: 'contact-fb',
    defaultValue: 'email',
    onValueChange: fn(),
    feedback: <InputFeedback attention="low">You can change this later in settings.</InputFeedback>,
    children: (
      <>
        <Radio value="email">Email</Radio>
        <Radio value="sms">SMS</Radio>
        <Radio value="post">Post</Radio>
      </>
    ),
  },
  render: (args) => (
    <StoryCanvas>
      <RadioField {...args} />
    </StoryCanvas>
  ),
};

export const Required: Story = {
  args: {
    label: 'Billing cycle',
    name: 'billing',
    defaultValue: 'monthly',
    required: true,
    onValueChange: fn(),
    children: (
      <>
        <Radio value="monthly">Monthly</Radio>
        <Radio value="annual">Annual</Radio>
      </>
    ),
  },
  render: (args) => (
    <StoryCanvas>
      <RadioField {...args} />
    </StoryCanvas>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Plan tier',
    name: 'plan',
    defaultValue: 'pro',
    disabled: true,
    onValueChange: fn(),
    children: (
      <>
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
        <Radio value="enterprise">Enterprise</Radio>
      </>
    ),
  },
  render: (args) => (
    <StoryCanvas>
      <RadioField {...args} />
    </StoryCanvas>
  ),
};

export const SingleOptionWithDescription: Story = {
  args: {
    label: 'Marketing emails',
    description: 'Occasional product updates only.',
    name: 'marketing',
    defaultValue: 'yes',
    singleOptionValue: 'yes',
    onValueChange: fn(),
  },
  render: (args) => (
    <StoryCanvas>
      <RadioField {...args} />
    </StoryCanvas>
  ),
};

export const WithInfoIcon: Story = {
  args: {
    label: 'Desktop alerts',
    description: 'Browser notifications when the app is open.',
    name: 'desktop-alerts',
    defaultChecked: true,
    onValueChange: fn(),
    infoIconSlot: (
      <InputFieldDefaultInfo
        ariaLabel="More about desktop alerts"
        tooltipContent="You can mute alerts per workspace in settings."
        labelSize="m"
      />
    ),
  },
  render: (args) => (
    <StoryCanvas>
      <RadioField {...args} />
    </StoryCanvas>
  ),
};
