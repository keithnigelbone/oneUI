/**
 * Select.test.tsx
 *
 * Functional + a11y coverage for the Select micropattern.
 */

import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';
import { expectNoA11yViolations } from '../../test-utils/a11y';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta', secondaryText: 'Second option' },
  { value: 'c', label: 'Gamma', disabled: true },
];

const SECTIONS = [{ id: 'g1', label: 'Group one' }];

function renderSelect(
  props: Partial<React.ComponentProps<typeof Select>> & { open?: boolean } = {},
) {
  const { open, ...rest } = props;
  const onChange = vi.fn();
  const onValuesChange = vi.fn();
  const onAction = vi.fn();
  const result = render(
    <Select
      options={OPTIONS}
      value="a"
      onChange={onChange}
      onValueChange={onChange}
      aria-label="Test select"
      {...rest}
      {...(rest.menu === 'multi' || rest.menu === 'multiSelect'
        ? { values: ['a'], onValuesChange }
        : {})}
      {...(rest.menu === 'actions' ? { onAction } : {})}
      {...(open !== undefined ? {} : {})}
    />,
  );
  return { ...result, onChange, onValuesChange, onAction };
}

describe('Select', () => {
  it('renders combobox trigger with aria-expanded false when closed', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox', { name: 'Test select' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('opens listbox on click and shows options', async () => {
    const user = userEvent.setup();
    renderSelect();
    await user.click(screen.getByRole('combobox', { name: 'Test select' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('selects an option in single-select mode', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect();
    await user.click(screen.getByRole('combobox', { name: 'Test select' }));
    await user.click(screen.getByRole('option', { name: 'Beta' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    renderSelect();
    await user.click(screen.getByRole('combobox', { name: 'Test select' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('updates input trigger text after selecting an option', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, setValue] = useState<string | undefined>(undefined);
      return (
        <>
          <div data-testid="selected-value">{value ?? 'none'}</div>
          <Select
            trigger="selectableInput"
            label="Country"
            placeholder="Choose an option"
            options={OPTIONS}
            value={value}
            onValueChange={setValue}
            onChange={setValue}
          />
        </>
      );
    }
    render(<Harness />);
    expect(screen.getByTestId('selected-value')).toHaveTextContent('none');
    expect(screen.getByPlaceholderText('Choose an option')).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Country' }));
    await user.click(screen.getByRole('option', { name: 'Beta' }));
    expect(screen.getByTestId('selected-value')).toHaveTextContent('b');
    expect(screen.getByDisplayValue('Beta', { hidden: true })).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes menu after selecting an option', async () => {
    const user = userEvent.setup();
    renderSelect({ trigger: 'selectableInput', label: 'Country', 'aria-label': undefined });
    await user.click(screen.getByRole('combobox', { name: 'Country' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Beta' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders label and required indicator for input trigger', () => {
    renderSelect({
      trigger: 'selectableInput',
      label: 'Country',
      required: true,
      'aria-label': undefined,
    });
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders helper text for input trigger', () => {
    renderSelect({
      trigger: 'selectableInput',
      label: 'Country',
      helperText: 'Pick one',
      'aria-label': undefined,
    });
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('filters options when searchable', async () => {
    const user = userEvent.setup();
    renderSelect({ searchable: true });
    await user.click(screen.getByRole('combobox', { name: 'Test select' }));
    const search = screen.getByRole('searchbox', { name: 'Filter options' });
    await user.type(search, 'bet');
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByRole('option', { name: /Beta/ })).toBeInTheDocument();
    expect(within(listbox).queryByRole('option', { name: /Alpha/ })).not.toBeInTheDocument();
  });

  it('renders section labels when groups provided', async () => {
    const user = userEvent.setup();
    const grouped = OPTIONS.map((o) => ({ ...o, group: 'g1' }));
    renderSelect({ options: grouped, sections: SECTIONS, groups: true });
    await user.click(screen.getByRole('combobox', { name: 'Test select' }));
    expect(screen.getByText('Group one')).toBeInTheDocument();
  });

  it('renders secondary text when enabled', async () => {
    const user = userEvent.setup();
    renderSelect({ secondaryText: true });
    await user.click(screen.getByRole('combobox', { name: 'Test select' }));
    expect(screen.getByText('Second option')).toBeInTheDocument();
  });

  it('multi-select toggles values', async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();
    render(
      <Select
        menu="multiSelect"
        options={OPTIONS}
        values={['a']}
        onValuesChange={onValuesChange}
        aria-label="Multi"
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Multi' }));
    await user.click(screen.getByRole('option', { name: 'Beta' }));
    expect(onValuesChange).toHaveBeenCalled();
  });

  it('actions menu uses menu role and fires onAction', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    function ActionsFixture() {
      const [open, setOpen] = useState(true);
      return (
        <Select
          menu="actions"
          trigger="selectableButton"
          triggerLabel="Actions"
          options={[{ value: 'edit', label: 'Edit' }]}
          onAction={onAction}
          aria-label="Actions"
          open={open}
          onOpenChange={setOpen}
        />
      );
    }
    render(<ActionsFixture />);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onAction).toHaveBeenCalledWith('edit');
  });

  it('button trigger renders a button', () => {
    renderSelect({ trigger: 'selectableButton', triggerLabel: 'Choose', 'aria-label': 'Choose' });
    expect(screen.getByRole('button', { name: 'Choose' })).toBeInTheDocument();
  });

  it('icon button trigger renders combobox', () => {
    renderSelect({
      trigger: 'selectableIconButton',
      triggerIcon: <span aria-hidden="true">♥</span>,
      'aria-label': 'Favourites',
    });
    expect(screen.getByRole('combobox', { name: 'Favourites' })).toBeInTheDocument();
  });

  it('passes axe when closed (combobox)', async () => {
    const { container } = renderSelect();
    await expectNoA11yViolations(container);
  });
});

describe('Select compound parts', () => {
  it('SelectableInput renders idle field', () => {
    render(<Select.SelectableInput label required />);
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('Menu panel renders static options', () => {
    render(<Select.Menu menuType="singleSelect" groups secondaryText showSearch />);
    expect(screen.getByText('Section label')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });
});
