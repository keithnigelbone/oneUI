import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import {
  computeTooltipPopupPosition,
  getTooltipAccessibilityProps,
  getTooltipPopupAccessibilityProps,
  getTooltipTriggerChildAccessibilityProps,
  getTooltipTriggerWrapperAccessibilityProps,
  getTooltipAnchorAccessibilityProps,
  parsePosition,
  resolveTooltipEntranceOffset,
  resolveTooltipMaxWidth,
  resolveTooltipSideAndAlign,
  tooltipContentToAccessibilityLabel,
  useTooltipState,
} from './interface';

describe('TooltipA11y', () => {
  it('keeps the trigger wrapper out of the accessibility tree', () => {
    expect(getTooltipTriggerWrapperAccessibilityProps()).toEqual({
      accessible: false,
      importantForAccessibility: 'no',
    });
  });

  it('does not hide anchor descendants when tooltip is open', () => {
    expect(getTooltipAnchorAccessibilityProps().accessibilityElementsHidden).toBeUndefined();
  });

  it('maps aria-label to accessibilityLabel on the trigger child', () => {
    const props = getTooltipAccessibilityProps(
      { 'aria-label': 'Help', content: 'Tooltip body', accessibilityHint: 'Shows help' },
      { disabled: false, isOpen: false },
    );
    expect(props.accessible).toBe(true);
    expect(props.accessibilityLabel).toBe('Help');
    expect(props.accessibilityHint).toBe('Shows help');
    expect(props.accessibilityState?.disabled).toBe(false);
    expect(props.accessibilityState?.expanded).toBe(false);
  });

  it('keeps the trigger reachable when tooltip content is a ReactNode without a label', () => {
    const props = getTooltipTriggerChildAccessibilityProps(
      {},
      { disabled: false, isOpen: false },
      { accessibilityLabel: 'Info' },
    );
    expect(props.accessible).toBe(true);
    expect(props.accessibilityLabel).toBe('Info');
  });

  it('falls back to string content when the trigger child has no label', () => {
    const props = getTooltipTriggerChildAccessibilityProps(
      {},
      { disabled: false, contentLabel: 'Tooltip body', isOpen: true },
    );
    expect(props.accessibilityLabel).toBe('Tooltip body');
    expect(props.accessibilityState?.expanded).toBe(true);
  });

  it('preserves the trigger child label when tooltip content is a ReactNode', () => {
    const props = getTooltipAccessibilityProps(
      { content: createElement('View') },
      { disabled: false, isOpen: false },
      { accessibilityLabel: 'Info' },
    );
    expect(props.accessible).toBe(true);
    expect(props.accessibilityLabel).toBe('Info');
    expect(props.accessibilityState?.expanded).toBe(false);
  });

  it('prefers tooltip aria-label over the trigger child label', () => {
    const props = getTooltipTriggerChildAccessibilityProps(
      { 'aria-label': 'Help' },
      { disabled: false, isOpen: false },
      { accessibilityLabel: 'Info' },
    );
    expect(props.accessibilityLabel).toBe('Help');
  });

  it('exposes popup live region when open with a label', () => {
    expect(
      getTooltipPopupAccessibilityProps({ contentLabel: 'Tooltip body', isOpen: true }),
    ).toEqual({
      accessible: true,
      accessibilityRole: 'text',
      accessibilityLabel: 'Tooltip body',
      accessibilityLiveRegion: 'polite',
      importantForAccessibility: 'yes',
    });
  });

  it('hides popup accessibility when closed', () => {
    expect(
      getTooltipPopupAccessibilityProps({ contentLabel: 'Tooltip body', isOpen: false }).accessible,
    ).toBe(false);
  });

  it('derives label from plain string content', () => {
    expect(tooltipContentToAccessibilityLabel('Hint')).toBe('Hint');
    expect(
      tooltipContentToAccessibilityLabel(
        createElement('View', { 'aria-label': 'Nested label' }),
      ),
    ).toBe('Nested label');
  });
});

describe('parsePosition', () => {
  it('maps position to popup side relative to trigger', () => {
    expect(parsePosition('bottom')).toEqual({ side: 'bottom', align: 'center' });
    expect(parsePosition('topStart')).toEqual({ side: 'top', align: 'start' });
    expect(parsePosition('rightEnd')).toEqual({ side: 'right', align: 'end' });
  });
});

describe('useTooltipState', () => {
  it('prefers explicit side/align over position alias', () => {
    const state = useTooltipState({
      children: null,
      content: 'x',
      position: 'bottom',
      side: 'left',
      align: 'end',
    });
    expect(state.side).toBe('left');
    expect(state.align).toBe('end');
  });

  it('defaults trigger to hover and delay to 200ms', () => {
    const state = useTooltipState({ children: null, content: 'x' });
    expect(state.trigger).toBe('hover');
    expect(state.delay).toBe(200);
    expect(state.arrow).toBe(true);
  });

  it('inherits provider delay values', () => {
    const state = useTooltipState({ children: null, content: 'x' }, 400, 100);
    expect(state.delay).toBe(400);
    expect(state.closeDelay).toBe(100);
  });

  it('accepts Figma tip alias for arrow', () => {
    expect(useTooltipState({ children: null, content: 'x', tip: false }).arrow).toBe(false);
    expect(useTooltipState({ children: null, content: 'x', tip: false, arrow: true }).arrow).toBe(
      true,
    );
  });

  it('accepts Figma disable alias for disabled', () => {
    expect(useTooltipState({ children: null, content: 'x', disable: true }).disabled).toBe(true);
    expect(
      useTooltipState({ children: null, content: 'x', disable: true, disabled: false }).disabled,
    ).toBe(false);
  });
});

describe('resolveTooltipMaxWidth', () => {
  it('parses numeric and px strings', () => {
    expect(resolveTooltipMaxWidth(200)).toBe(200);
    expect(resolveTooltipMaxWidth('240px')).toBe(240);
    expect(resolveTooltipMaxWidth(undefined)).toBeUndefined();
  });
});

describe('computeTooltipPopupPosition', () => {
  const trigger = { x: 100, y: 200, width: 40, height: 32 };

  it('places popup above the trigger for side=top', () => {
    const pos = computeTooltipPopupPosition(
      trigger,
      { width: 80, height: 24 },
      'top',
      'center',
      8,
      6,
    );
    expect(pos.top).toBe(200 - 24 - 8);
    expect(pos.left).toBe(100 + 20 - 40);
  });

  it('places popup to the left of the trigger for side=left', () => {
    const trigger = { x: 100, y: 200, width: 40, height: 32 };
    const pos = computeTooltipPopupPosition(
      trigger,
      { width: 80, height: 24 },
      'left',
      'center',
      8,
      6,
    );
    expect(pos.left).toBe(100 - 80 - 8);
    expect(pos.top).toBe(200 + 16 - 12);
  });

  it('places popup to the right of the trigger for side=right', () => {
    const trigger = { x: 100, y: 200, width: 40, height: 32 };
    const pos = computeTooltipPopupPosition(
      trigger,
      { width: 80, height: 24 },
      'right',
      'center',
      8,
      6,
    );
    expect(pos.left).toBe(100 + 40 + 8);
    expect(pos.top).toBe(200 + 16 - 12);
  });
});

describe('resolveTooltipSideAndAlign', () => {
  it('matches web precedence rules', () => {
    expect(resolveTooltipSideAndAlign({ position: 'left' })).toEqual({
      side: 'left',
      align: 'center',
    });
    expect(resolveTooltipSideAndAlign({})).toEqual({ side: 'bottom', align: 'center' });
  });
});

describe('resolveTooltipEntranceOffset', () => {
  const distance = 5;

  it('matches web Tooltip.module.css per-side starting transforms', () => {
    // Web: translateY(5px) on side=top
    expect(resolveTooltipEntranceOffset('top', distance, false)).toEqual({ x: 0, y: 5 });
    // Web: translateY(-5px) on side=bottom
    expect(resolveTooltipEntranceOffset('bottom', distance, false)).toEqual({ x: 0, y: -5 });
    // Web: translateX(5px) on side=left
    expect(resolveTooltipEntranceOffset('left', distance, false)).toEqual({ x: 5, y: 0 });
    // Web: translateX(-5px) on side=right
    expect(resolveTooltipEntranceOffset('right', distance, false)).toEqual({ x: -5, y: 0 });
  });

  it('returns zero offset in subtle / reduced-motion path (opacity-only)', () => {
    expect(resolveTooltipEntranceOffset('top', distance, true)).toEqual({ x: 0, y: 0 });
    expect(resolveTooltipEntranceOffset('bottom', distance, true)).toEqual({ x: 0, y: 0 });
    expect(resolveTooltipEntranceOffset('left', distance, true)).toEqual({ x: 0, y: 0 });
    expect(resolveTooltipEntranceOffset('right', distance, true)).toEqual({ x: 0, y: 0 });
  });
});
