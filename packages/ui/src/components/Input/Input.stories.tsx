/**
 * Input.stories.tsx
 *
 * Storybook documentation for **Input** (label stack + bordered 4-slot + Base UI `Input`).
 * Feedback, dynamic rows, and `Field` validation live on **InputField**
 * — see `Components/Inputs/InputField`.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Input } from './Input';
import type { InputAppearance, InputProps, InputSize } from './Input.shared';

const SlotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
  </svg>
);

/** Story controls: `InputProps` + demo slot toggles. */
type InputStoryArgs = Pick<
  InputProps,
  | 'placeholder'
  | 'size'
  | 'appearance'
  | 'shape'
  | 'attention'
  | 'disabled'
  | 'readOnly'
  | 'type'
  | 'id'
  | 'aria-label'
  | 'errorHighlight'
  | 'maxLength'
> & {
  start?: boolean;
  end?: boolean;
};

/** Arg keys only used to hide autodocs rows — not passed as story args */
type InputStoryArgTypesOnly = {
  required?: unknown;
  labelAssociation?: unknown;
};

const meta = {
  title: 'Components/Inputs/Input',
  component: Input as any,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {},
    docs: {
      description: {
        component:
          'Text input **control**: bordered 4-slot shell and Base UI `Input` (`@base-ui/react/input`). Use `aria-label` for standalone accessibility when no visible label is present. Use `errorHighlight` for error border only when you control messaging elsewhere. For labels, descriptions, validation, feedback, and dynamic copy, use **InputField** — see `Components/Inputs/InputField`.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 's', 'm', 'l'],
      description: 'Component size — XS, S, M, L',
      table: { defaultValue: { summary: 'm' } },
    },
    appearance: {
      control: 'select',
      options: [
        'auto', 'primary', 'secondary', 'neutral', 'sparkle',
        'positive', 'negative', 'warning', 'informative',
      ],
      description: 'Multi-accent appearance role',
      table: { defaultValue: { summary: 'auto' } },
    },
    shape: {
      control: 'radio',
      options: ['default', 'pill'],
      table: { defaultValue: { summary: 'default' } },
    },
    attention: {
      control: 'radio',
      options: ['medium', 'high'],
      description: 'Visual attention — medium (outlined) or high (filled neutral background)',
      table: { defaultValue: { summary: 'medium' } },
    },
    start: { control: 'boolean', description: 'Toggle start slot icon' },
    end: { control: 'boolean', description: 'Toggle end slot icon' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: false, table: { disable: true } },
    labelAssociation: { control: false, table: { disable: true } },
    maxLength: { control: 'number' },
    errorHighlight: { control: 'boolean', description: 'Error border on the bordered control (pair with visible error text or use InputField)' },
    placeholder: { control: 'text' },
    'aria-label': { control: 'text', description: 'Accessible label for standalone usage (no visible label)' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      table: { defaultValue: { summary: 'text' } },
    },
  },
} satisfies Meta<InputStoryArgs & InputStoryArgTypesOnly>;

export default meta;
type Story = StoryObj<InputStoryArgs>;

export const Default: Story = {
  args: {
    placeholder: 'Placeholder',
    size: 'm',
    appearance: 'auto',
    shape: 'default',
    attention: 'medium',
    start: false,
    end: false,
    disabled: false,
    readOnly: false,
    errorHighlight: false,
    type: 'text',
  },
  render: ({ start: showStart, end: showEnd, size, appearance, attention, ...rest }) => (
    <div style={{ width: 348 }}>
      <Input
        {...rest}
        size={size as InputSize}
        appearance={appearance as InputAppearance}
        attention={attention}
        start={showStart ? <SlotIcon /> : undefined}
        end={showEnd ? <SlotIcon /> : undefined}
      />
    </div>
  ),
};

/** Standalone input with `aria-label` — no visible label, accessible to screen readers. */
export const WithAriaLabel: Story = {
  name: 'With aria-label (a11y)',
  args: {
    ...Default.args,
    'aria-label': 'Search products',
    placeholder: 'Search products…',
  },
  render: Default.render,
};

/** Associates the control with a visible label outside `Input` via wrapping `<label>`. */
export const WithExternalLabel: Story = {
  name: 'With external label (a11y)',
  args: {
    ...Default.args,
    id: 'input-with-label-demo',
  },
  render: (args) => {
    const { start: showStart, end: showEnd, size, appearance, attention, id, ...rest } = args;
    return (
      <div style={{ width: 348 }}>
        <label
          htmlFor={id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--Spacing-1)',
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Label-S-FontSize)',
            lineHeight: 'var(--Label-S-LineHeight)',
            fontWeight: 'var(--Label-FontWeight-Medium)',
            color: 'var(--Text-High)',
          }}
        >
          Search
          <Input
            {...rest}
            id={id}
            size={size as InputSize}
            appearance={appearance as InputAppearance}
            attention={attention}
            start={showStart ? <SlotIcon /> : undefined}
            end={showEnd ? <SlotIcon /> : undefined}
          />
        </label>
      </div>
    );
  },
};
