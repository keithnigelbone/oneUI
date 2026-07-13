import { describe, expect, it } from 'vitest';
import {
  getSegmentItemAccessibilityProps,
  getSegmentedControlAccessibilityProps,
  resolveItemAppearance,
  resolveSegmentItemAccessibilityLabel,
  resolveSegmentItemState,
  resolveSegmentSlotSurface,
  resolveSegmentedGroupConfig,
  resolveTrackAppearance,
  type SegmentedControlContextValue,
} from './interface';

describe('SegmentedControl accessibility', () => {
  it('exposes tablist when aria-label is provided', () => {
    const props = getSegmentedControlAccessibilityProps({ 'aria-label': 'View mode' });
    expect(props.accessibilityRole).toBe('tablist');
    expect(props.accessibilityLabel).toBe('View mode');
    expect(props.accessible).toBe(true);
  });

  it('hides the group from the a11y tree without aria-label', () => {
    const props = getSegmentedControlAccessibilityProps({});
    expect(props.accessible).toBe(false);
    expect(props.accessibilityLabel).toBeUndefined();
  });

  it('forwards accessibilityHint on the group', () => {
    const props = getSegmentedControlAccessibilityProps({
      'aria-label': 'View mode',
      accessibilityHint: 'Switches between views',
    });
    expect(props.accessibilityHint).toBe('Switches between views');
  });

  it('resolves item label from children, aria-label wins', () => {
    expect(resolveSegmentItemAccessibilityLabel({ children: 'Day' })).toBe('Day');
    expect(resolveSegmentItemAccessibilityLabel({ 'aria-label': 'Custom', children: 'Day' })).toBe(
      'Custom',
    );
    expect(resolveSegmentItemAccessibilityLabel({ children: undefined })).toBeUndefined();
  });

  it('exposes tab role with selected + disabled state', () => {
    const props = getSegmentItemAccessibilityProps(
      { children: 'Week' },
      { isSelected: true, isDisabled: false },
    );
    expect(props.accessibilityRole).toBe('tab');
    expect(props.accessibilityLabel).toBe('Week');
    expect(props.accessibilityState).toEqual({ disabled: false, selected: true });
  });

  it('marks icon-only items accessible only when aria-label is present', () => {
    const withLabel = getSegmentItemAccessibilityProps(
      { 'aria-label': 'Home' },
      { isSelected: false, isDisabled: false },
    );
    expect(withLabel.accessible).toBe(true);
    const withoutLabel = getSegmentItemAccessibilityProps(
      {},
      { isSelected: false, isDisabled: false },
    );
    expect(withoutLabel.accessible).toBe(false);
  });
});

describe('resolveItemAppearance / resolveTrackAppearance', () => {
  it('prefers an explicit non-auto appearance', () => {
    expect(resolveItemAppearance('secondary', 'primary')).toBe('secondary');
  });

  it('falls back auto → parent → primary for items', () => {
    expect(resolveItemAppearance('auto', 'sparkle')).toBe('sparkle');
    expect(resolveItemAppearance(undefined, null)).toBe('primary');
  });

  it('falls back parent → neutral for the track', () => {
    expect(resolveTrackAppearance('primary')).toBe('primary');
    expect(resolveTrackAppearance(null)).toBe('neutral');
  });
});

describe('resolveSegmentedGroupConfig', () => {
  it('defaults size m, attention high, track high, appearance primary at page root', () => {
    const config = resolveSegmentedGroupConfig({}, null);
    expect(config.size).toBe('m');
    expect(config.attention).toBe('high');
    expect(config.trackEmphasis).toBe('high');
    expect(config.appearance).toBe('primary');
    expect(config.trackAppearance).toBe('neutral');
  });

  it('defaults equalWidth true for text, false for icon', () => {
    expect(resolveSegmentedGroupConfig({ type: 'text' }, null).equalWidth).toBe(true);
    expect(resolveSegmentedGroupConfig({ type: 'icon' }, null).equalWidth).toBe(false);
    expect(resolveSegmentedGroupConfig({ type: 'icon', equalWidth: true }, null).equalWidth).toBe(true);
  });

  it('selectedAppearance follows the item role for high/medium', () => {
    const high = resolveSegmentedGroupConfig({ attention: 'high', appearance: 'secondary' }, null);
    expect(high.selectedAppearance).toBe('secondary');
    const medium = resolveSegmentedGroupConfig({ attention: 'medium', appearance: 'positive' }, null);
    expect(medium.selectedAppearance).toBe('positive');
  });

  it('selectedAppearance follows the track role (parent ?? neutral) when attention is low', () => {
    expect(resolveSegmentedGroupConfig({ attention: 'low' }, null).selectedAppearance).toBe('neutral');
    expect(resolveSegmentedGroupConfig({ attention: 'low' }, 'primary').selectedAppearance).toBe(
      'primary',
    );
  });

  it('inherits parent Surface appearance for track + item when appearance is auto', () => {
    const config = resolveSegmentedGroupConfig({ appearance: 'auto' }, 'brand-bg');
    expect(config.appearance).toBe('brand-bg');
    expect(config.trackAppearance).toBe('brand-bg');
  });

  it('flags groupDisabled from the disabled prop', () => {
    expect(resolveSegmentedGroupConfig({ disabled: true }, null).groupDisabled).toBe(true);
    expect(resolveSegmentedGroupConfig({}, null).groupDisabled).toBe(false);
  });
});

describe('resolveSegmentSlotSurface', () => {
  it('returns bold for a selected high-attention segment', () => {
    expect(resolveSegmentSlotSurface(true, 'high')).toBe('bold');
  });

  it('returns subtle for selected medium/low segments', () => {
    expect(resolveSegmentSlotSurface(true, 'medium')).toBe('subtle');
    expect(resolveSegmentSlotSurface(true, 'low')).toBe('subtle');
  });

  it('returns undefined for unselected segments', () => {
    expect(resolveSegmentSlotSurface(false, 'high')).toBeUndefined();
  });
});

describe('resolveSegmentItemState', () => {
  const baseCtx: SegmentedControlContextValue = {
    size: 'm',
    attention: 'high',
    appearance: 'primary',
    selectedAppearance: 'primary',
    trackAppearance: 'neutral',
    trackEmphasis: 'high',
    shape: 'pill',
    type: 'text',
    equalWidth: true,
    groupDisabled: false,
    selectedValue: 'a',
    selectValue: () => {},
  };

  it('detects selection and shows the label for text segments', () => {
    const state = resolveSegmentItemState({ value: 'a', children: 'Day' }, baseCtx);
    expect(state.isSelected).toBe(true);
    expect(state.showLabel).toBe(true);
    expect(state.isIconOnly).toBe(false);
  });

  it('hides the label and marks icon-only for type="icon"', () => {
    const state = resolveSegmentItemState(
      { value: 'b', children: 'Day', start: 'icon' },
      { ...baseCtx, type: 'icon' },
    );
    expect(state.isSelected).toBe(false);
    expect(state.showLabel).toBe(false);
    expect(state.isIconOnly).toBe(true);
  });

  it('treats a falsy-but-present child (0 / "") as a real label', () => {
    const zero = resolveSegmentItemState({ value: 'a', children: 0, start: 'icon' }, baseCtx);
    expect(zero.showLabel).toBe(true);
    // With a real label + start icon, it must NOT be misclassified icon-only.
    expect(zero.isIconOnly).toBe(false);

    const empty = resolveSegmentItemState({ value: 'a', children: '' }, baseCtx);
    expect(empty.showLabel).toBe(false);
  });

  it('inherits group disabled state', () => {
    const state = resolveSegmentItemState({ value: 'a' }, { ...baseCtx, groupDisabled: true });
    expect(state.isDisabled).toBe(true);
  });

  it('slotAppearance follows the item role for high/medium attention', () => {
    const high = resolveSegmentItemState(
      { value: 'a' },
      { ...baseCtx, attention: 'high', appearance: 'sparkle', selectedAppearance: 'sparkle' },
    );
    expect(high.slotAppearance).toBe('sparkle');
    const medium = resolveSegmentItemState(
      { value: 'a' },
      { ...baseCtx, attention: 'medium', appearance: 'positive', selectedAppearance: 'positive' },
    );
    expect(medium.slotAppearance).toBe('positive');
  });

  it('slotAppearance follows the track role when attention is low', () => {
    const state = resolveSegmentItemState(
      { value: 'a' },
      { ...baseCtx, attention: 'low', selectedAppearance: 'neutral' },
    );
    expect(state.slotAppearance).toBe('neutral');
  });
});
