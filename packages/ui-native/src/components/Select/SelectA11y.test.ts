/**
 * Select a11y + state helper tests.
 */
import { describe, it, expect } from 'vitest';
import {
  getSelectAccessibilityProps,
  selectTriggerText,
  useSelectState,
  type SelectProps,
} from './interface';

const options = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry' },
];

function state(props: SelectProps) {
  return useSelectState(props);
}

describe('useSelectState', () => {
  it('defaults: input trigger, single menu, below, primary, m', () => {
    const s = state({ options });
    expect(s.trigger).toBe('input');
    expect(s.menu).toBe('single');
    expect(s.menuDirection).toBe('below');
    expect(s.appearance).toBe('primary');
    expect(s.size).toBe('m');
    expect(s.isMulti).toBe(false);
  });

  it('resolves multi + auto→primary', () => {
    const s = state({ options, menu: 'multi', appearance: 'auto', values: ['a'] });
    expect(s.isMulti).toBe(true);
    expect(s.appearance).toBe('primary');
    expect(s.selectedValues).toEqual(['a']);
  });
});

describe('getSelectAccessibilityProps', () => {
  it('reports expanded + listbox for single/multi', () => {
    const props: SelectProps = { options, 'aria-label': 'Fruit' };
    const a = getSelectAccessibilityProps(props, state(props), true);
    expect(a['aria-expanded']).toBe(true);
    expect(a['aria-haspopup']).toBe('listbox');
    expect(a['aria-label']).toBe('Fruit');
    expect(a.accessibilityState.expanded).toBe(true);
  });

  it('uses menu haspopup for actions', () => {
    const props: SelectProps = { options, menu: 'actions' };
    const a = getSelectAccessibilityProps(props, state(props), false);
    expect(a['aria-haspopup']).toBe('menu');
    expect(a['aria-expanded']).toBe(false);
  });
});

describe('selectTriggerText', () => {
  it('shows placeholder when nothing selected', () => {
    const props: SelectProps = { options, placeholder: 'Pick one' };
    const r = selectTriggerText(options, state(props), 'Pick one');
    expect(r.isPlaceholder).toBe(true);
    expect(r.text).toBe('Pick one');
  });

  it('shows the selected label (single)', () => {
    const props: SelectProps = { options, value: 'b' };
    const r = selectTriggerText(options, state(props), 'Pick');
    expect(r.text).toBe('Banana');
    expect(r.isPlaceholder).toBe(false);
  });

  it('summarises multi-select counts', () => {
    const props: SelectProps = { options, menu: 'multi', values: ['a', 'c'] };
    const r = selectTriggerText(options, state(props), 'Pick');
    expect(r.text).toBe('2 selected');
  });
});
