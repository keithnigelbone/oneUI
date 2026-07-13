import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { Text } from 'react-native';
import { headerItemLabelColor, resolveHeaderChromePaint } from './Header.chrome.native';
import {
  SLOT_BADGE_INSET,
  SLOT_ICON_INSET,
  SLOT_OUTER_PADDING,
  resolveStateLayerInsets,
} from './HeaderItem.layout.native';
import {
  getHeaderAccessibilityProps,
  getHeaderItemAccessibilityProps,
  getPrimaryNavAccessibilityProps,
  getSecondaryNavAccessibilityProps,
  resolveHeaderItemAccessibilityLabel,
  useHeaderItemState,
  useHeaderState,
  usePrimaryNavState,
  resolvePrimaryNavLayout,
  warnHeaderItemSlotSizeMismatch,
  HEADER_NESTED_TITLE_A11Y,
} from './interface';
import {
  hasNonEmptyReactChildren,
  warnIfHeaderItemChildrenDropped,
} from './Header.utils.native';

const mockPaint = resolveHeaderChromePaint(
  {
    surfaces: { default: '#fff', subtle: '#eee' },
    content: { high: '#111', medium: '#666', low: '#999', tinted: '#f60', tintedA11y: '#e50' },
    states: { hover: '#ddd', pressed: '#ccc' },
  } as Parameters<typeof resolveHeaderChromePaint>[0],
  {
    surfaces: { subtle: '#fed' },
    content: { tintedA11y: '#e50', tinted: '#f60' },
    states: { hover: '#fdc', pressed: '#fb9' },
  } as Parameters<typeof resolveHeaderChromePaint>[1],
);

describe('HeaderItem state-layer insets (Figma 1:35425)', () => {
  it('matches high active start=M end=S — pl 1.5, pr 2', () => {
    expect(
      resolveStateLayerInsets({
        hasStartSlot: true,
        hasEndSlot: true,
        startSize: 'M',
        endSize: 'S',
      }),
    ).toEqual({
      paddingTop: 0,
      paddingBottom: 0,
      paddingStart: SLOT_ICON_INSET,
      paddingEnd: SLOT_BADGE_INSET,
    });
  });

  it('matches label-only — px 2.5', () => {
    expect(
      resolveStateLayerInsets({ hasStartSlot: false, hasEndSlot: false }),
    ).toEqual({
      paddingTop: 0,
      paddingBottom: 0,
      paddingStart: SLOT_OUTER_PADDING,
      paddingEnd: SLOT_OUTER_PADDING,
    });
  });

  it('matches start=M only — pl 1.5, pr 2.5', () => {
    expect(
      resolveStateLayerInsets({ hasStartSlot: true, hasEndSlot: false, startSize: 'M' }),
    ).toMatchObject({ paddingStart: SLOT_ICON_INSET, paddingEnd: SLOT_OUTER_PADDING });
  });

  it('matches end=S only — pl 2.5, pr 2', () => {
    expect(
      resolveStateLayerInsets({ hasStartSlot: false, hasEndSlot: true, endSize: 'S' }),
    ).toMatchObject({ paddingStart: SLOT_OUTER_PADDING, paddingEnd: SLOT_BADGE_INSET });
  });

  it('matches start=S — pl 2', () => {
    expect(
      resolveStateLayerInsets({ hasStartSlot: true, hasEndSlot: false, startSize: 'S' }),
    ).toMatchObject({ paddingStart: SLOT_BADGE_INSET });
  });

  it('matches both icons — px 1.5', () => {
    expect(
      resolveStateLayerInsets({
        hasStartSlot: true,
        hasEndSlot: true,
        startSize: 'M',
        endSize: 'M',
      }),
    ).toMatchObject({ paddingStart: SLOT_ICON_INSET, paddingEnd: SLOT_ICON_INSET });
  });

  it('zeros paddingStart when visuallyAlignToStart', () => {
    expect(
      resolveStateLayerInsets({
        hasStartSlot: true,
        hasEndSlot: false,
        startSize: 'M',
        visuallyAlignToStart: true,
      }).paddingStart,
    ).toBe(0);
  });
});

describe('HeaderItem label color (Figma Header.Item)', () => {
  it('uses content/low for every inactive attention level', () => {
    for (const attention of ['low', 'medium', 'high'] as const) {
      expect(headerItemLabelColor(attention, false, mockPaint)).toBe(mockPaint.textLow);
    }
  });

  it('uses accent for medium/high active', () => {
    expect(headerItemLabelColor('medium', true, mockPaint)).toBe(mockPaint.accent);
    expect(headerItemLabelColor('high', true, mockPaint)).toBe(mockPaint.accent);
  });

  it('uses content/high when low attention is active', () => {
    expect(headerItemLabelColor('low', true, mockPaint)).toBe(mockPaint.textHigh);
  });
});

describe('Header accessibility', () => {
  it('maps banner aria-label to accessibilityLabel', () => {
    const props = getHeaderAccessibilityProps({ 'aria-label': 'Main site header' });
    expect(props.accessibilityRole).toBe('header');
    expect(props.accessibilityLabel).toBe('Main site header');
    expect(props.accessible).toBe(true);
  });

  it('defaults primary nav label', () => {
    const props = getPrimaryNavAccessibilityProps({});
    expect(props.accessibilityLabel).toBe('Primary navigation');
    expect(props.accessible).toBe(true);
  });

  it('defaults secondary nav label', () => {
    const props = getSecondaryNavAccessibilityProps({});
    expect(props.accessibilityLabel).toBe('Secondary navigation');
  });

  it('resolves header item label from children', () => {
    expect(resolveHeaderItemAccessibilityLabel({ value: 'products', children: 'Products' })).toBe(
      'Products',
    );
    expect(
      getHeaderItemAccessibilityProps(
        { value: 'products', children: 'Products' },
        useHeaderItemState({ value: 'products', children: 'Products', active: true }),
      ).accessibilityState.selected,
    ).toBe(true);
    expect(
      getHeaderItemAccessibilityProps(
        { value: 'products', children: 'Products' },
        useHeaderItemState({ value: 'products', children: 'Products', active: true }),
      ).accessible,
    ).toBe(true);
  });

  it('humanizes value when children is non-text', () => {
    expect(
      resolveHeaderItemAccessibilityLabel({
        value: 'my-account',
        children: null,
      }),
    ).toBe('My Account');
    expect(
      getHeaderItemAccessibilityProps(
        { value: 'my-account', children: null },
        useHeaderItemState({ value: 'my-account', children: null }),
      ).accessibilityLabel,
    ).toBe('My Account');
  });

  it('prefers aria-label over children and value', () => {
    expect(
      resolveHeaderItemAccessibilityLabel({
        value: 'home',
        children: 'Visible',
        'aria-label': 'Go home',
      }),
    ).toBe('Go home');
  });

  it('resolves header item slot flags', () => {
    const state = useHeaderItemState({
      value: 'home',
      children: 'Home',
      startSize: 'M',
      endSize: 'none',
    });
    expect(state.hasStartSlot).toBe(true);
    expect(state.hasEndSlot).toBe(false);
  });

  it('resolves primary nav layout for expanded contextBar', () => {
    const navState = usePrimaryNavState({ type: 'contextBar', expanded: true });
    const layout = resolvePrimaryNavLayout(navState, false, 'Page title');
    expect(layout.showExpandedLayout).toBe(true);
    expect(layout.showContextBarStartOnly).toBe(true);
  });

  it('resolves header expanded state', () => {
    expect(useHeaderState({ expanded: true, secondaryNav: true }).expanded).toBe(true);
    expect(useHeaderState({}).secondaryNav).toBe(false);
  });

  it('exposes nested title header role for contextBar / expanded rows', () => {
    expect(HEADER_NESTED_TITLE_A11Y.accessibilityRole).toBe('header');
    expect(HEADER_NESTED_TITLE_A11Y.accessible).toBe(true);
  });
});

describe('Header dev warnings', () => {
  it('warns when start content is passed without startSize', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    warnHeaderItemSlotSizeMismatch({ value: 'home', start: 'icon' });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('startSize'),
    );
    warn.mockRestore();
  });

  it('warns when end content is passed without endSize', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    warnHeaderItemSlotSizeMismatch({ value: 'home', end: 'badge' });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('endSize'),
    );
    warn.mockRestore();
  });

  it('detects non-empty react children', () => {
    expect(hasNonEmptyReactChildren(null)).toBe(false);
    expect(hasNonEmptyReactChildren(React.createElement(Text, null, 'Tab'))).toBe(true);
  });

  it('warns when SecondaryNav children are dropped', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    warnIfHeaderItemChildrenDropped(React.createElement(Text, null, 'Not a HeaderItem'), [], 'SecondaryNav');
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('no valid HeaderItem elements'),
    );
    warn.mockRestore();
  });
});
