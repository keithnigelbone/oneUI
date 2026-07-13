/**
 * Select.stories.tsx — aligned to Figma micropattern frames + API table controls.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { Select } from './Select';
import { Icon } from '../Icon/Icon';
import { Surface } from '../Surface/Surface';
import type {
  SelectAppearance,
  SelectAttention,
  SelectInputStart,
  SelectMenuAlignment,
  SelectMenuDirection,
  SelectMenuSize,
  SelectMenuTypeFigma,
  SelectSize,
  SelectTriggerFigma,
} from './Select.shared';
import {
  FIGMA_SELECT_ACTION_OPTIONS,
  FIGMA_SELECT_INPUT_WIDTH,
  FIGMA_SELECT_LABEL,
  FIGMA_SELECT_MULTI_OPTIONS,
  FIGMA_SELECT_MULTI_SECTIONS,
  FIGMA_SELECT_PLACEHOLDER,
  FIGMA_SELECT_SINGLE_OPTIONS,
  FIGMA_PRESET_BUTTON_ACTIVE,
  FIGMA_PRESET_BUTTON_IDLE,
  FIGMA_PRESET_ICON_ACTIVE,
  FIGMA_PRESET_ICON_IDLE,
  FIGMA_PRESET_INPUT_ACTIVE,
  FIGMA_PRESET_INPUT_IDLE,
  FIGMA_PRESET_INPUT_MULTI,
} from './Select.figma';

/** Heart icon for stories (Figma ic_favorite). */
const heartIcon = (
  <Icon icon="heart" size="4" appearance="primary" emphasis="high" aria-hidden />
);

/** Storybook args — mirrors Figma API table (node 3957:73686). */
type SelectStoryArgs = {
  appearance: SelectAppearance;
  trigger: SelectTriggerFigma;
  size: SelectSize;
  menuType: SelectMenuTypeFigma;
  menuDirection: SelectMenuDirection;
  menuAlignment: SelectMenuAlignment;
  menuSize: SelectMenuSize;
  groups: boolean;
  secondaryText: boolean;
  showSearch: boolean;
  open: boolean;
  disabled: boolean;
  placeholder: string;
  label: string;
  inputAttention: 'high' | 'medium';
  filled: boolean;
  shape: 'default' | 'pill';
  inputStart: SelectInputStart;
  required: boolean;
  description: string;
  infoIcon: boolean;
  helperText: string;
  feedback: string;
  invalid: boolean;
  attention: SelectAttention;
  chevron: boolean;
  condensed: boolean;
  contained: boolean;
  triggerLabel: string;
};

function optionsForMenuType(menuType: SelectMenuTypeFigma) {
  if (menuType === 'actions') return FIGMA_SELECT_ACTION_OPTIONS;
  if (menuType === 'multiSelect') return FIGMA_SELECT_MULTI_OPTIONS;
  return FIGMA_SELECT_SINGLE_OPTIONS;
}

function SelectPlayground(args: SelectStoryArgs) {
  const isMulti = args.menuType === 'multiSelect';
  const isActions = args.menuType === 'actions';
  const [single, setSingle] = useState<string | undefined>(undefined);
  const [multi, setMulti] = useState<string[]>([]);
  const [forcedOpen, setForcedOpen] = useState(false);

  React.useEffect(() => {
    setForcedOpen(Boolean(args.open));
  }, [args.open]);

  const sections = args.groups && !isActions ? FIGMA_SELECT_MULTI_SECTIONS : undefined;
  const options = optionsForMenuType(args.menuType);

  const selectProps = {
    appearance: args.appearance,
    trigger: args.trigger,
    size: args.size,
    menuType: args.menuType,
    menuDirection: args.menuDirection,
    menuAlignment: args.menuAlignment,
    menuSize: args.menuSize,
    secondaryText: args.secondaryText,
    showSearch: args.showSearch,
    groups: args.groups,
    disabled: args.disabled,
    ...(args.open ? { open: forcedOpen, onOpenChange: setForcedOpen } : {}),
    options,
    sections,
    placeholder: args.placeholder,
    label: args.trigger === 'selectableInput' ? args.label : undefined,
    inputAttention: args.inputAttention,
    filled: args.filled,
    shape: args.shape,
    inputStart: args.inputStart,
    required: args.required,
    description: args.description || undefined,
    infoIcon: args.infoIcon,
    helperText: args.helperText || undefined,
    feedback: args.feedback || undefined,
    invalid: args.invalid,
    attention: args.attention,
    chevron: args.chevron,
    condensed: args.condensed,
    contained: args.contained,
    triggerLabel: args.triggerLabel,
    triggerIcon: args.trigger === 'selectableIconButton' ? heartIcon : undefined,
    onAction: isActions ? () => {} : undefined,
    'aria-label':
      args.trigger === 'selectableInput'
        ? undefined
        : args.trigger === 'selectableIconButton'
          ? 'Favourites'
          : args.triggerLabel,
  };

  const selectEl = isMulti ? (
    <Select
      {...selectProps}
      values={multi}
      onValuesChange={setMulti}
    />
  ) : isActions ? (
    <Select {...selectProps} />
  ) : (
    <Select
      {...selectProps}
      value={single}
      onValueChange={setSingle}
      onChange={setSingle}
    />
  );

  if (args.trigger === 'selectableInput') {
    return <div style={{ width: FIGMA_SELECT_INPUT_WIDTH, maxWidth: '100%' }}>{selectEl}</div>;
  }

  if (args.trigger === 'selectableIconButton' && args.menuDirection === 'above') {
    return <div style={{ paddingTop: 'var(--Spacing-48)' }}>{selectEl}</div>;
  }

  return selectEl;
}

const meta = {
  title: 'Components/Forms/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'appearance',
        'trigger',
        'size',
        'menuType',
        'menuDirection',
        'menuAlignment',
        'menuSize',
        'groups',
        'secondaryText',
        'showSearch',
        'open',
        'disabled',
        'placeholder',
        'label',
        'inputAttention',
        'filled',
        'shape',
        'inputStart',
        'required',
        'description',
        'infoIcon',
        'helperText',
        'feedback',
        'invalid',
        'attention',
        'chevron',
        'condensed',
        'contained',
        'triggerLabel',
      ],
    },
    docs: {
      description: {
        component:
          'Select micropattern — SelectableInput, SelectableButton, or SelectableIconButton trigger with singleSelect, multiSelect, or actions menu. Controls mirror the Figma API table.',
      },
    },
  },
  argTypes: {
    appearance: {
      control: 'select',
      options: [
        'auto',
        'neutral',
        'primary',
        'secondary',
        'sparkle',
        'negative',
        'positive',
        'informative',
        'warning',
      ],
      description: 'Specify the color usage of the component.',
      table: { category: 'Select', defaultValue: { summary: 'auto' } },
    },
    trigger: {
      control: 'select',
      options: ['selectableInput', 'selectableButton', 'selectableIconButton'],
      description: 'Specify which sub-component should be the trigger.',
      table: { category: 'Select', defaultValue: { summary: 'selectableInput' } },
    },
    size: {
      control: 'select',
      options: ['s', 'm', 'l'],
      description: 'Specify the size of the trigger.',
      table: { category: 'Select', defaultValue: { summary: 'm' } },
    },
    menuType: {
      control: 'select',
      options: ['singleSelect', 'multiSelect', 'actions'],
      description: 'Specify the type of Menu.',
      table: { category: 'Menu', defaultValue: { summary: 'singleSelect' } },
    },
    menuDirection: {
      control: 'select',
      options: ['below', 'above', 'alignWithTrigger'],
      description: 'Specify the position of the menu relative to the trigger.',
      table: { category: 'Menu', defaultValue: { summary: 'below' } },
    },
    menuAlignment: {
      control: 'select',
      options: ['fill', 'start', 'middle', 'end'],
      description: 'Specify the alignment of Menu with respect to the trigger.',
      table: { category: 'Menu', defaultValue: { summary: 'fill' } },
    },
    menuSize: {
      control: 'select',
      options: ['fill', 's', 'm', 'l'],
      description: 'Specify the size of the Menu.',
      table: { category: 'Menu', defaultValue: { summary: 'fill' } },
    },
    groups: {
      control: 'boolean',
      description: 'Specify if Menu should have groups.',
      table: { category: 'Menu', defaultValue: { summary: 'false' } },
    },
    secondaryText: {
      control: 'boolean',
      description: 'Specify if every ListItem should have secondary text.',
      table: { category: 'Menu', defaultValue: { summary: 'false' } },
    },
    showSearch: {
      control: 'boolean',
      description: 'Specify if SearchInput should be visible.',
      table: { category: 'Menu', defaultValue: { summary: 'false' } },
    },
    open: {
      control: 'boolean',
      description: 'Open the menu (maps to Figma `state: active` on triggers).',
      table: { category: 'Menu', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'Select', defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      table: { category: 'SelectableInput', defaultValue: { summary: 'Choose an option' } },
      if: { arg: 'trigger', eq: 'selectableInput' },
    },
    label: {
      control: 'text',
      description: 'Show the component label (input trigger).',
      table: { category: 'SelectableInput', defaultValue: { summary: 'Label' } },
      if: { arg: 'trigger', eq: 'selectableInput' },
    },
    inputAttention: {
      control: 'radio',
      options: ['high', 'medium'],
      description: 'Specify the prominence of the input trigger.',
      table: { category: 'SelectableInput', defaultValue: { summary: 'medium' } },
      if: { arg: 'trigger', eq: 'selectableInput' },
    },
    filled: {
      control: 'boolean',
      description: 'Specify whether the input trigger is filled or not.',
      table: { category: 'SelectableInput', defaultValue: { summary: 'false' } },
      if: { arg: 'trigger', eq: 'selectableInput' },
    },
    shape: {
      control: 'radio',
      options: ['default', 'pill'],
      description: 'Specify the shape of the input trigger.',
      table: { category: 'SelectableInput', defaultValue: { summary: 'default' } },
      if: { arg: 'trigger', eq: 'selectableInput' },
    },
    inputStart: {
      control: 'select',
      options: ['none', 'icon', 'avatar', 'image', 'text'],
      description: 'Specify the element present at the start slot.',
      table: { category: 'SelectableInput', defaultValue: { summary: 'none' } },
      if: { arg: 'trigger', eq: 'selectableInput' },
    },
    required: {
      control: 'boolean',
      description: 'Show the required indicator (requires label).',
      table: { category: 'SelectableInput', defaultValue: { summary: 'false' } },
      if: { arg: 'trigger', eq: 'selectableInput' },
    },
    description: {
      control: 'text',
      description: 'Description below the label (requires label).',
      table: { category: 'SelectableInput' },
      if: { arg: 'trigger', eq: 'selectableInput' },
    },
    infoIcon: {
      control: 'boolean',
      description: 'Show the info icon (requires label).',
      table: { category: 'SelectableInput', defaultValue: { summary: 'false' } },
      if: { arg: 'trigger', eq: 'selectableInput' },
    },
    helperText: {
      control: 'text',
      description: 'Helper / dynamic text below the field.',
      table: { category: 'SelectableInput' },
      if: { arg: 'trigger', eq: 'selectableInput' },
    },
    feedback: {
      control: 'text',
      description: 'Feedback message (negative variant).',
      table: { category: 'SelectableInput' },
      if: { arg: 'trigger', eq: 'selectableInput' },
    },
    invalid: {
      control: 'boolean',
      table: { category: 'SelectableInput', defaultValue: { summary: 'false' } },
      if: { arg: 'trigger', eq: 'selectableInput' },
    },
    attention: {
      control: 'select',
      options: ['high', 'medium', 'low'],
      description: 'Button / icon-button trigger prominence.',
      table: { category: 'SelectableButton', defaultValue: { summary: 'medium' } },
      if: { arg: 'trigger', neq: 'selectableInput' },
    },
    chevron: {
      control: 'boolean',
      description: 'Show chevron in the end slot (button trigger).',
      table: { category: 'SelectableButton', defaultValue: { summary: 'true' } },
      if: { arg: 'trigger', eq: 'selectableButton' },
    },
    condensed: {
      control: 'boolean',
      description: 'Specify if the trigger should be condensed.',
      table: { category: 'SelectableButton', defaultValue: { summary: 'false' } },
      if: { arg: 'trigger', neq: 'selectableInput' },
    },
    contained: {
      control: 'boolean',
      description: 'Specify if the trigger should be contained.',
      table: { category: 'SelectableButton', defaultValue: { summary: 'true' } },
      if: { arg: 'trigger', neq: 'selectableInput' },
    },
    triggerLabel: {
      control: 'text',
      description: 'Button trigger label text.',
      table: { category: 'SelectableButton', defaultValue: { summary: 'Button' } },
      if: { arg: 'trigger', eq: 'selectableButton' },
    },
    options: { table: { disable: true } },
    sections: { table: { disable: true } },
    value: { table: { disable: true } },
    values: { table: { disable: true } },
    onChange: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
    onValuesChange: { table: { disable: true } },
    onAction: { table: { disable: true } },
    menu: { table: { disable: true } },
    searchable: { table: { disable: true } },
    start: { table: { disable: true } },
    triggerIcon: { table: { disable: true } },
    className: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    'aria-label': { table: { disable: true } },
    'aria-labelledby': { table: { disable: true } },
    'aria-describedby': { table: { disable: true } },
  },
  render: (args: SelectStoryArgs) => <SelectPlayground {...args} />,
} satisfies Meta<SelectStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

const fieldShell = { width: FIGMA_SELECT_INPUT_WIDTH, maxWidth: '100%' };

export const Default: Story = {
  args: {
    appearance: 'auto',
    trigger: 'selectableInput',
    size: 'm',
    menuType: 'singleSelect',
    menuDirection: 'below',
    menuAlignment: 'fill',
    menuSize: 'fill',
    groups: false,
    secondaryText: false,
    showSearch: false,
    open: false,
    disabled: false,
    placeholder: FIGMA_SELECT_PLACEHOLDER,
    label: FIGMA_SELECT_LABEL,
    inputAttention: 'medium',
    filled: false,
    shape: 'default',
    inputStart: 'none',
    required: false,
    description: '',
    infoIcon: false,
    helperText: '',
    feedback: '',
    invalid: false,
    attention: 'medium',
    chevron: true,
    condensed: false,
    contained: true,
    triggerLabel: 'Button',
  },
};

const showcaseParams = { controls: { disable: true } };

function ControlledSelect(
  props: React.ComponentProps<typeof Select> & { defaultOpen?: boolean },
) {
  const { defaultOpen, value: valueProp, values: valuesProp, ...rest } = props;
  const isMulti = rest.menuType === 'multiSelect' || rest.menu === 'multi';
  const [single, setSingle] = useState<string | undefined>(
    valueProp as string | undefined,
  );
  const [multi, setMulti] = useState<string[]>(valuesProp ?? []);
  const [open, setOpen] = useState(defaultOpen ?? false);

  if (isMulti) {
    return (
      <Select
        {...rest}
        values={multi}
        onValuesChange={setMulti}
        open={open}
        onOpenChange={setOpen}
      />
    );
  }

  return (
    <Select
      {...rest}
      value={single}
      onValueChange={setSingle}
      onChange={setSingle}
      open={open}
      onOpenChange={setOpen}
    />
  );
}

/** node 3877:38142 — SelectableInput idle */
export const SelectableInputIdle: Story = {
  name: 'Figma / SelectableInput (idle)',
  parameters: showcaseParams,
  render: () => (
    <div style={fieldShell}>
      <Select {...FIGMA_PRESET_INPUT_IDLE} options={FIGMA_SELECT_SINGLE_OPTIONS} />
    </div>
  ),
};

/** node 3877:38141 — SelectableInput with value held (menu closed by default) */
export const SelectableInputActive: Story = {
  name: 'Figma / SelectableInput (active)',
  parameters: showcaseParams,
  render: () => (
    <div style={fieldShell}>
      <ControlledSelect {...FIGMA_PRESET_INPUT_ACTIVE} options={FIGMA_SELECT_SINGLE_OPTIONS} />
    </div>
  ),
};

/** node 3877:38143 — SelectableInput + multiSelect + search (closed by default) */
export const SelectableInputMultiSelect: Story = {
  name: 'Figma / SelectableInput + multiSelect',
  parameters: showcaseParams,
  render: () => (
    <div style={fieldShell}>
      <ControlledSelect {...FIGMA_PRESET_INPUT_MULTI} />
    </div>
  ),
};

/** node 3877:38145 — SelectableButton idle */
export const SelectableButtonIdle: Story = {
  name: 'Figma / SelectableButton (idle)',
  parameters: showcaseParams,
  render: () => (
    <Select
      {...FIGMA_PRESET_BUTTON_IDLE}
      options={FIGMA_SELECT_ACTION_OPTIONS}
      onAction={() => {}}
      aria-label="Actions"
    />
  ),
};

/** node 3877:38144 — SelectableButton + actions menu (closed by default) */
export const SelectableButtonActions: Story = {
  name: 'Figma / SelectableButton + actions',
  parameters: showcaseParams,
  render: () => (
    <ControlledSelect
      {...FIGMA_PRESET_BUTTON_ACTIVE}
      options={FIGMA_SELECT_ACTION_OPTIONS}
      onAction={() => {}}
      aria-label="Actions"
    />
  ),
};

/** node 3877:38148 — SelectableIconButton idle */
export const SelectableIconButtonIdle: Story = {
  name: 'Figma / SelectableIconButton (idle)',
  parameters: showcaseParams,
  render: () => (
    <Select
      {...FIGMA_PRESET_ICON_IDLE}
      triggerIcon={heartIcon}
      options={FIGMA_SELECT_SINGLE_OPTIONS}
    />
  ),
};

/** node 3877:38149 — SelectableIconButton with value held (closed by default) */
export const SelectableIconButtonActive: Story = {
  name: 'Figma / SelectableIconButton (active)',
  parameters: showcaseParams,
  render: () => (
    <div style={{ paddingTop: 'var(--Spacing-48)' }}>
      <ControlledSelect
        {...FIGMA_PRESET_ICON_ACTIVE}
        triggerIcon={heartIcon}
        options={FIGMA_SELECT_SINGLE_OPTIONS}
      />
    </div>
  ),
};

/** Composite overview — all Figma trigger × menu combinations */
export const FigmaOverview: Story = {
  name: 'Figma / Overview',
  parameters: showcaseParams,
  render: function FigmaOverviewRender() {
    const [inputValue, setInputValue] = useState<string | undefined>(undefined);
    const [iconValue, setIconValue] = useState<string | undefined>(undefined);

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(var(--Spacing-40), 1fr))',
          gap: 'var(--Spacing-8)',
          alignItems: 'start',
        }}
      >
        <div style={fieldShell}>
          <p style={{ marginBottom: 'var(--Spacing-2)', fontSize: 'var(--Label-S-FontSize)' }}>
            SelectableInput
          </p>
          <Select
            trigger="selectableInput"
            label={FIGMA_SELECT_LABEL}
            placeholder={FIGMA_SELECT_PLACEHOLDER}
            options={FIGMA_SELECT_SINGLE_OPTIONS}
            menuAlignment="fill"
            menuSize="fill"
            value={inputValue}
            onValueChange={setInputValue}
            onChange={setInputValue}
          />
        </div>
        <div>
          <p style={{ marginBottom: 'var(--Spacing-2)', fontSize: 'var(--Label-S-FontSize)' }}>
            SelectableButton
          </p>
          <Select
            menuType="actions"
            trigger="selectableButton"
            triggerLabel="Button"
            contained
            chevron
            options={FIGMA_SELECT_ACTION_OPTIONS}
            onAction={() => {}}
            aria-label="Actions"
          />
        </div>
        <div>
          <p style={{ marginBottom: 'var(--Spacing-2)', fontSize: 'var(--Label-S-FontSize)' }}>
            SelectableIconButton
          </p>
          <Select
            trigger="selectableIconButton"
            attention="high"
            contained
            triggerIcon={heartIcon}
            options={FIGMA_SELECT_SINGLE_OPTIONS}
            value={iconValue}
            onValueChange={setIconValue}
            onChange={setIconValue}
            aria-label="Favourites"
          />
        </div>
      </div>
    );
  },
};

export const SelectableInputSizes: Story = {
  name: 'SelectableInput / Sizes',
  parameters: showcaseParams,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)', ...fieldShell }}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <Select.SelectableInput key={size} size={size} label attention="medium" />
      ))}
    </div>
  ),
};

export const SelectableInputFieldStack: Story = {
  name: 'SelectableInput / Label & Helper',
  parameters: showcaseParams,
  render: () => (
    <div style={fieldShell}>
      <Select.SelectableInput label required description infoIcon helperText />
      <div style={{ height: 'var(--Spacing-4)' }} />
      <Select.SelectableInput label feedback state="feedback" />
    </div>
  ),
};

export const MenuVariants: Story = {
  name: 'Menu panels (static)',
  parameters: showcaseParams,
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
      <Select.Menu menuType="singleSelect" />
      <Select.Menu menuType="multiSelect" secondaryText groups showSearch />
      <Select.Menu menuType="actions" />
    </div>
  ),
};

export const SurfaceContext: Story = {
  parameters: showcaseParams,
  render: () => {
    const [value, setValue] = useState('1');
    return (
      <Surface
        mode="subtle"
        appearance="secondary"
        style={{ padding: 'var(--Spacing-4)', width: '100%', maxWidth: 'var(--Spacing-48)' }}
      >
        <Select
          trigger="selectableInput"
          label={FIGMA_SELECT_LABEL}
          appearance="secondary"
          options={FIGMA_SELECT_SINGLE_OPTIONS}
          value={value}
          onValueChange={setValue}
          placeholder={FIGMA_SELECT_PLACEHOLDER}
        />
      </Surface>
    );
  },
};
