import { describe, expect, it } from 'vitest';
import {
  getTabItemAccessibilityProps,
  getTabPanelAccessibilityProps,
  getTabsAccessibilityProps,
  resolveTabItemAccessibilityLabel,
  resolveTabItemState,
} from './interface';

describe('Tabs accessibility', () => {
  it('exposes tablist when aria-label is provided', () => {
    const props = getTabsAccessibilityProps({ 'aria-label': 'Section navigation' });
    expect(props.accessibilityRole).toBe('tablist');
    expect(props.accessibilityLabel).toBe('Section navigation');
    expect(props.accessible).toBe(true);
  });

  it('hides tablist from accessibility tree without aria-label', () => {
    const props = getTabsAccessibilityProps({});
    expect(props.accessible).toBe(false);
  });

  it('forwards accessibilityHint on tablist', () => {
    const props = getTabsAccessibilityProps({
      'aria-label': 'Sections',
      accessibilityHint: 'Swipe between panels',
    });
    expect(props.accessibilityHint).toBe('Swipe between panels');
  });

  it('resolves tab label from children', () => {
    expect(resolveTabItemAccessibilityLabel({ children: 'Overview' })).toBe('Overview');
    expect(resolveTabItemAccessibilityLabel({ 'aria-label': 'Custom', children: 'Overview' })).toBe(
      'Custom',
    );
  });

  it('exposes tab role with selected and disabled state', () => {
    const props = getTabItemAccessibilityProps(
      { children: 'Projects', disabled: true },
      { isSelected: true, isDisabled: true },
    );
    expect(props.accessibilityRole).toBe('tab');
    expect(props.accessibilityLabel).toBe('Projects');
    expect(props.accessibilityState).toEqual({ disabled: true, selected: true });
  });

  it('hides inactive panels from accessibility tree', () => {
    const hidden = getTabPanelAccessibilityProps({ children: 'Hidden' }, { isVisible: false });
    expect(hidden.importantForAccessibility).toBe('no-hide-descendants');
    const visible = getTabPanelAccessibilityProps({ children: 'Shown' }, { isVisible: true });
    expect(visible.importantForAccessibility).toBe('auto');
  });
});

describe('resolveTabItemState', () => {
  it('inherits context size and resolves selection', () => {
    const state = resolveTabItemState({
      size: undefined,
      appearance: undefined,
      orientation: undefined,
      ctxSize: 'l',
      ctxAppearance: 'secondary',
      ctxOrientation: 'vertical',
      disabled: false,
      selectedValue: 'a',
      tabValue: 'a',
    });
    expect(state.resolvedSize).toBe('l');
    expect(state.resolvedAppearance).toBe('secondary');
    expect(state.resolvedOrientation).toBe('vertical');
    expect(state.isSelected).toBe(true);
  });
});
