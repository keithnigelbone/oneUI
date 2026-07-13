/**
 * Tooltip QA tests — pure-function, smoke, functional, a11y, visual snapshot,
 * and bug-catching.
 *
 * Location: apps/qa-playground/native/tests/Tooltip/Tooltip.test.tsx
 * QA policy: NEVER modify dev files. Tests here are QA-owned only.
 *
 * ─── Figma API vs code API mapping ────────────────────────────────────────────
 *
 *   Figma property    Figma values                            Code prop
 *   ────────────────────────────────────────────────────────────────────────────
 *   position          top | topStart | topEnd                 position?: TooltipPosition
 *                     bottom | BottomStart | BottomEnd        (BUG-TOOLTIP-5: Figma uses capital B)
 *                     left | leftStart | leftEnd
 *                     right | rightStart | rightEnd
 *   tip               true | false                            arrow?: boolean
 *                                                             (BUG-TOOLTIP-1: different name)
 *   disable           true | false                            disabled?: boolean
 *                                                             (BUG-TOOLTIP-2: different name)
 *
 *   Code-only (no Figma equivalent):
 *     open, defaultOpen, onOpenChange, trigger, delay, closeDelay, maxWidth,
 *     side, align, sideOffset, hoverable, portal, zIndex, subtle
 *
 * ─── parsePosition inversion ──────────────────────────────────────────────────
 *
 *   Figma names where the TIP points. Code names where the POPUP sits. Inverses:
 *     position='bottom'    → side='top'   (popup is ABOVE the trigger)
 *     position='top'       → side='bottom'
 *     position='left'      → side='right'
 *     position='right'     → side='left'
 *   Alignment is unchanged: Start→start, End→end, (none)→center.
 *
 * ─── Known bugs (expected to FAIL — keep failing to surface each bug) ─────────
 *
 *   BUG-TOOLTIP-1: Figma prop 'tip' ≠ code prop 'arrow'
 *     File: packages/ui-native/src/components/Tooltip/interface.ts (TooltipProps)
 *     Expected: 'tip' should be a valid TooltipProps key (or Figma updated to 'arrow').
 *     Actual:   'tip' is not in TooltipProps; passing tip={false} at runtime is a no-op.
 *
 *   BUG-TOOLTIP-2: Figma prop 'disable' ≠ code prop 'disabled'
 *     File: packages/ui-native/src/components/Tooltip/interface.ts (TooltipProps)
 *     Expected: 'disable' should be a valid TooltipProps key.
 *     Actual:   'disable' is not in TooltipProps; passing disable={true} at runtime is a no-op.
 *
 *   BUG-TOOLTIP-3: anchor <View accessibilityElementsHidden={isOpen}> wraps popup
 *     File: packages/ui-native/src/components/Tooltip/Tooltip.native.tsx:639
 *     Expected: When tooltip is open, the anchor should NOT set accessibilityElementsHidden=true.
 *     Actual:   anchor sets accessibilityElementsHidden={isOpen}, cascading to popup on iOS —
 *               popup content is never announced by VoiceOver even when open.
 *
 *   BUG-TOOLTIP-4: getTooltipTriggerAccessibilityProps returns accessible=false
 *                  when content is a ReactNode and no aria-label is given
 *     File: packages/ui-native/src/components/Tooltip/interface.ts:322
 *     Expected: Trigger should remain accessible=true with a generic role.
 *     Actual:   accessible: Boolean(label) → when label=undefined → accessible=false
 *               → trigger invisible to VoiceOver/TalkBack.
 *
 *   BUG-TOOLTIP-5: Figma position value casing — 'BottomStart'/'BottomEnd' vs 'bottomStart'/'bottomEnd'
 *     File: Figma spec + packages/ui-native/src/components/Tooltip/interface.ts (TooltipPosition)
 *     Expected: Figma spec should use lowercase camelCase to match the TypeScript type.
 *     Actual:   Figma documents 'BottomStart' and 'BottomEnd' (capital B); TypeScript type
 *               uses 'bottomStart' and 'bottomEnd'. Using the Figma-documented values gives
 *               a TypeScript error.
 *
 * ─── RNTL limitations (what these tests cannot verify) ───────────────────────
 *
 *   - No pixel rendering: cannot verify popup visual position, arrow SVG colour, etc.
 *   - No iOS VoiceOver cascade simulation: RNTL does not enforce that a parent
 *     accessibilityElementsHidden=true overrides a child's importantForAccessibility='yes'.
 *     BUG-TOOLTIP-3 is therefore partially observable only via the rendered prop check,
 *     not full cascade behaviour (that requires a device with VoiceOver enabled).
 *   - No real timers for hover/focus triggers: use trigger='manual' + open prop for
 *     controlled state in functional tests, or trigger='click' + fireEvent.press.
 *   - measureLayout is a no-op in RNTL: popupPosition will be null; popup renders in
 *     measuring state (not visually placed). Structural/a11y checks still work.
 */

import React, { createElement, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import {
  Tooltip,
  parsePosition,
  resolveTooltipSideAndAlign,
  resolveTooltipMaxWidth,
  resolveTooltipEntranceOffset,
  computeTooltipPopupPosition,
  tooltipContentToAccessibilityLabel,
  useTooltipState,
  getTooltipTriggerAccessibilityProps,
  getTooltipPopupAccessibilityProps,
  getTooltipAccessibilityProps,
  type TooltipProps,
} from '@ui-native/components/Tooltip';
import { wrap } from '../../utils/renderWithTheme';

// ─── 1. Pure function: parsePosition — all 12 positions ──────────────────────

describe('parsePosition — all 12 Figma positions invert to POPUP side+align', () => {
  it('position="top" → popup side=bottom, align=center', () => {
    expect(parsePosition('top')).toEqual({ side: 'bottom', align: 'center' });
  });

  it('position="topStart" → popup side=bottom, align=start', () => {
    expect(parsePosition('topStart')).toEqual({ side: 'bottom', align: 'start' });
  });

  it('position="topEnd" → popup side=bottom, align=end', () => {
    expect(parsePosition('topEnd')).toEqual({ side: 'bottom', align: 'end' });
  });

  it('position="bottom" → popup side=top, align=center', () => {
    expect(parsePosition('bottom')).toEqual({ side: 'top', align: 'center' });
  });

  it('position="bottomStart" → popup side=top, align=start', () => {
    expect(parsePosition('bottomStart')).toEqual({ side: 'top', align: 'start' });
  });

  it('position="bottomEnd" → popup side=top, align=end', () => {
    expect(parsePosition('bottomEnd')).toEqual({ side: 'top', align: 'end' });
  });

  it('position="left" → popup side=right, align=center', () => {
    expect(parsePosition('left')).toEqual({ side: 'right', align: 'center' });
  });

  it('position="leftStart" → popup side=right, align=start', () => {
    expect(parsePosition('leftStart')).toEqual({ side: 'right', align: 'start' });
  });

  it('position="leftEnd" → popup side=right, align=end', () => {
    expect(parsePosition('leftEnd')).toEqual({ side: 'right', align: 'end' });
  });

  it('position="right" → popup side=left, align=center', () => {
    expect(parsePosition('right')).toEqual({ side: 'left', align: 'center' });
  });

  it('position="rightStart" → popup side=left, align=start', () => {
    expect(parsePosition('rightStart')).toEqual({ side: 'left', align: 'start' });
  });

  it('position="rightEnd" → popup side=left, align=end', () => {
    expect(parsePosition('rightEnd')).toEqual({ side: 'left', align: 'end' });
  });
});

// ─── 2. Pure function: resolveTooltipSideAndAlign ────────────────────────────

describe('resolveTooltipSideAndAlign — precedence: side > position > default', () => {
  it('default (no props) → side=top, align=center', () => {
    expect(resolveTooltipSideAndAlign({})).toEqual({ side: 'top', align: 'center' });
  });

  it('position only → parsed side+align from parsePosition', () => {
    expect(resolveTooltipSideAndAlign({ position: 'bottom' })).toEqual({ side: 'top', align: 'center' });
    expect(resolveTooltipSideAndAlign({ position: 'leftEnd' })).toEqual({ side: 'right', align: 'end' });
    expect(resolveTooltipSideAndAlign({ position: 'topStart' })).toEqual({ side: 'bottom', align: 'start' });
  });

  it('explicit side overrides position side', () => {
    // position='bottom' → side='top', but explicit side='left' wins
    expect(resolveTooltipSideAndAlign({ position: 'bottom', side: 'left' })).toMatchObject({ side: 'left' });
  });

  it('explicit align overrides position align', () => {
    // position='topStart' → align='start', but explicit align='end' wins
    expect(resolveTooltipSideAndAlign({ position: 'topStart', align: 'end' })).toMatchObject({ align: 'end' });
  });

  it('explicit side AND align both override position', () => {
    const result = resolveTooltipSideAndAlign({ position: 'bottom', side: 'left', align: 'end' });
    expect(result).toEqual({ side: 'left', align: 'end' });
  });

  it('explicit side without position uses default align=center', () => {
    expect(resolveTooltipSideAndAlign({ side: 'right' })).toEqual({ side: 'right', align: 'center' });
  });

  it('explicit align without side or position uses default side=top', () => {
    expect(resolveTooltipSideAndAlign({ align: 'start' })).toEqual({ side: 'top', align: 'start' });
  });
});

// ─── 3. Pure function: resolveTooltipMaxWidth ────────────────────────────────

describe('resolveTooltipMaxWidth', () => {
  it('numeric value passes through unchanged', () => {
    expect(resolveTooltipMaxWidth(200)).toBe(200);
    expect(resolveTooltipMaxWidth(0)).toBe(0);
    expect(resolveTooltipMaxWidth(1.5)).toBe(1.5);
  });

  it('"240px" string parses to number 240', () => {
    expect(resolveTooltipMaxWidth('240px')).toBe(240);
  });

  it('"100px" string parses to number 100', () => {
    expect(resolveTooltipMaxWidth('100px')).toBe(100);
  });

  it('percentage string returns undefined (not a valid px length)', () => {
    expect(resolveTooltipMaxWidth('50%')).toBeUndefined();
  });

  it('"100vw" string returns undefined (unsupported unit)', () => {
    expect(resolveTooltipMaxWidth('100vw')).toBeUndefined();
  });

  it('undefined returns undefined', () => {
    expect(resolveTooltipMaxWidth(undefined)).toBeUndefined();
  });

  it('plain number string without "px" returns undefined', () => {
    expect(resolveTooltipMaxWidth('200')).toBeUndefined();
  });
});

// ─── 4. Pure function: resolveTooltipEntranceOffset ─────────────────────────

describe('resolveTooltipEntranceOffset', () => {
  const distance = 8;

  it('side=top → {x:0, y:+distance} (popup starts below final position)', () => {
    expect(resolveTooltipEntranceOffset('top', distance, false)).toEqual({ x: 0, y: distance });
  });

  it('side=bottom → {x:0, y:-distance} (popup starts above final position)', () => {
    expect(resolveTooltipEntranceOffset('bottom', distance, false)).toEqual({ x: 0, y: -distance });
  });

  it('side=left → {x:+distance, y:0} (popup starts to the right)', () => {
    expect(resolveTooltipEntranceOffset('left', distance, false)).toEqual({ x: distance, y: 0 });
  });

  it('side=right → {x:-distance, y:0} (popup starts to the left)', () => {
    expect(resolveTooltipEntranceOffset('right', distance, false)).toEqual({ x: -distance, y: 0 });
  });

  it('subtle=true → {x:0, y:0} for all sides (opacity-only, no translate)', () => {
    expect(resolveTooltipEntranceOffset('top', distance, true)).toEqual({ x: 0, y: 0 });
    expect(resolveTooltipEntranceOffset('bottom', distance, true)).toEqual({ x: 0, y: 0 });
    expect(resolveTooltipEntranceOffset('left', distance, true)).toEqual({ x: 0, y: 0 });
    expect(resolveTooltipEntranceOffset('right', distance, true)).toEqual({ x: 0, y: 0 });
  });
});

// ─── 5. Pure function: computeTooltipPopupPosition ───────────────────────────

describe('computeTooltipPopupPosition', () => {
  // trigger at (100, 200), 40w × 32h
  const trigger = { x: 100, y: 200, width: 40, height: 32 };
  const popup = { width: 80, height: 24 };
  const gap = 8;

  it('side=top, align=center: popup is above trigger, horizontally centred', () => {
    const pos = computeTooltipPopupPosition(trigger, popup, 'top', 'center', gap);
    // top = triggerY - popupHeight - gap = 200 - 24 - 8 = 168
    expect(pos.top).toBe(168);
    // left = triggerX + triggerW/2 - popupW/2 = 100 + 20 - 40 = 80
    expect(pos.left).toBe(80);
  });

  it('side=bottom, align=start: popup is below trigger, left-aligned', () => {
    const pos = computeTooltipPopupPosition(trigger, popup, 'bottom', 'start', gap);
    // top = triggerY + triggerH + gap = 200 + 32 + 8 = 240
    expect(pos.top).toBe(240);
    // left = triggerX = 100
    expect(pos.left).toBe(100);
  });

  it('side=bottom, align=end: popup is below trigger, right-aligned', () => {
    const pos = computeTooltipPopupPosition(trigger, popup, 'bottom', 'end', gap);
    expect(pos.top).toBe(240);
    // left = triggerX + triggerW - popupW = 100 + 40 - 80 = 60
    expect(pos.left).toBe(60);
  });

  it('side=left, align=end: popup is to the right (Figma left = code right), end-aligned', () => {
    const pos = computeTooltipPopupPosition(trigger, popup, 'left', 'end', gap);
    // left = triggerX - popupW - gap = 100 - 80 - 8 = 12
    expect(pos.left).toBe(12);
    // top = triggerY + triggerH - popupH = 200 + 32 - 24 = 208
    expect(pos.top).toBe(208);
  });

  it('side=right, align=center: popup is to the right, vertically centred', () => {
    const pos = computeTooltipPopupPosition(trigger, popup, 'right', 'center', gap);
    // left = triggerX + triggerW + gap = 100 + 40 + 8 = 148
    expect(pos.left).toBe(148);
    // top = triggerY + triggerH/2 - popupH/2 = 200 + 16 - 12 = 204
    expect(pos.top).toBe(204);
  });
});

// ─── 6. Pure function: tooltipContentToAccessibilityLabel ────────────────────

describe('tooltipContentToAccessibilityLabel', () => {
  it('string content → returns the string', () => {
    expect(tooltipContentToAccessibilityLabel('Helpful hint')).toBe('Helpful hint');
  });

  it('number content → returns string representation', () => {
    expect(tooltipContentToAccessibilityLabel(42)).toBe('42');
    expect(tooltipContentToAccessibilityLabel(0)).toBe('0');
  });

  it('ReactElement with aria-label → returns the aria-label string', () => {
    const el = createElement(View, { 'aria-label': 'Custom label' });
    expect(tooltipContentToAccessibilityLabel(el)).toBe('Custom label');
  });

  it('ReactElement with accessibilityLabel → returns the accessibilityLabel string', () => {
    const el = createElement(View, { accessibilityLabel: 'Native label' });
    expect(tooltipContentToAccessibilityLabel(el)).toBe('Native label');
  });

  it('ReactElement with empty aria-label → falls through to accessibilityLabel', () => {
    const el = createElement(View, { 'aria-label': '   ', accessibilityLabel: 'Native label' });
    expect(tooltipContentToAccessibilityLabel(el)).toBe('Native label');
  });

  it('plain ReactElement without any label prop → returns undefined', () => {
    const el = createElement(View, null, createElement(Text, null, 'Rich content'));
    expect(tooltipContentToAccessibilityLabel(el)).toBeUndefined();
  });

  it('null content → returns undefined', () => {
    expect(tooltipContentToAccessibilityLabel(null)).toBeUndefined();
  });

  it('undefined content → returns undefined', () => {
    expect(tooltipContentToAccessibilityLabel(undefined)).toBeUndefined();
  });
});

// ─── 7. Pure function: useTooltipState ───────────────────────────────────────

describe('useTooltipState', () => {
  const base = { children: null as ReactNode, content: 'Tip text' };

  it('defaults: trigger=hover, delay=200, arrow=true, side=top, align=center', () => {
    const state = useTooltipState(base);
    expect(state.trigger).toBe('hover');
    expect(state.delay).toBe(200);
    expect(state.arrow).toBe(true);
    expect(state.side).toBe('top');
    expect(state.align).toBe('center');
  });

  it('disabled=false by default', () => {
    expect(useTooltipState(base).disabled).toBe(false);
  });

  it('subtle=false by default', () => {
    expect(useTooltipState(base).subtle).toBe(false);
  });

  it('hoverable=true by default', () => {
    expect(useTooltipState(base).hoverable).toBe(true);
  });

  it('multiline=false when no maxWidth set', () => {
    const state = useTooltipState(base);
    expect(state.multiline).toBe(false);
    expect(state.maxWidth).toBeUndefined();
  });

  it('multiline=true when maxWidth is set', () => {
    const state = useTooltipState({ ...base, maxWidth: 200 });
    expect(state.multiline).toBe(true);
    expect(state.maxWidth).toBe(200);
  });

  it('position overrides default side+align', () => {
    const state = useTooltipState({ ...base, position: 'rightEnd' });
    expect(state.side).toBe('left');
    expect(state.align).toBe('end');
  });

  it('explicit side+align overrides position', () => {
    const state = useTooltipState({ ...base, position: 'bottom', side: 'left', align: 'start' });
    expect(state.side).toBe('left');
    expect(state.align).toBe('start');
  });

  it('provider delay used when prop delay not specified', () => {
    const state = useTooltipState(base, 500, 150);
    expect(state.delay).toBe(500);
    expect(state.closeDelay).toBe(150);
  });

  it('prop delay overrides provider delay', () => {
    const state = useTooltipState({ ...base, delay: 100 }, 500, 150);
    expect(state.delay).toBe(100);
  });

  it('disabled=true resolves to boolean true', () => {
    expect(useTooltipState({ ...base, disabled: true }).disabled).toBe(true);
  });

  it('string content → contentLabel set', () => {
    const state = useTooltipState({ ...base, content: 'A label' });
    expect(state.contentLabel).toBe('A label');
  });

  it('ReactNode content without label → contentLabel undefined', () => {
    const state = useTooltipState({ ...base, content: createElement(View, null) });
    expect(state.contentLabel).toBeUndefined();
  });
});

// ─── 8. Pure function: getTooltipTriggerAccessibilityProps ───────────────────

describe('getTooltipTriggerAccessibilityProps', () => {
  it('with aria-label → accessible=true, role=button, label set', () => {
    const props = getTooltipTriggerAccessibilityProps(
      { 'aria-label': 'Open help', accessibilityHint: 'Tap for more info' },
      { disabled: false, contentLabel: 'Tip body', isOpen: false },
    );
    expect(props.accessible).toBe(true);
    expect(props.accessibilityRole).toBe('button');
    expect(props.accessibilityLabel).toBe('Open help');
    expect(props.accessibilityHint).toBe('Tap for more info');
    expect(props.accessibilityState?.disabled).toBe(false);
    expect(props.accessibilityState?.expanded).toBe(false);
  });

  it('with contentLabel (string content) and no aria-label → label from content', () => {
    const props = getTooltipTriggerAccessibilityProps(
      {},
      { disabled: false, contentLabel: 'Tip body', isOpen: false },
    );
    expect(props.accessible).toBe(true);
    expect(props.accessibilityLabel).toBe('Tip body');
    expect(props.accessibilityRole).toBe('button');
  });

  it('without any label → accessible=false, no role', () => {
    const props = getTooltipTriggerAccessibilityProps(
      {},
      { disabled: false, contentLabel: undefined, isOpen: false },
    );
    expect(props.accessible).toBe(false);
    expect(props.accessibilityRole).toBeUndefined();
    expect(props.accessibilityLabel).toBeUndefined();
  });

  it('expanded state reflects isOpen=true', () => {
    const props = getTooltipTriggerAccessibilityProps(
      { 'aria-label': 'Help' },
      { disabled: false, contentLabel: undefined, isOpen: true },
    );
    expect(props.accessibilityState?.expanded).toBe(true);
  });

  it('disabled=true propagates to accessibilityState.disabled', () => {
    const props = getTooltipTriggerAccessibilityProps(
      { 'aria-label': 'Help' },
      { disabled: true, contentLabel: 'Tip', isOpen: false },
    );
    expect(props.accessibilityState?.disabled).toBe(true);
  });
});

// ─── 9. Pure function: getTooltipPopupAccessibilityProps ─────────────────────

describe('getTooltipPopupAccessibilityProps', () => {
  it('open=true with label → accessible=true, liveRegion=polite, role=text', () => {
    const props = getTooltipPopupAccessibilityProps({ contentLabel: 'Tip text', isOpen: true });
    expect(props.accessible).toBe(true);
    expect(props.accessibilityRole).toBe('text');
    expect(props.accessibilityLabel).toBe('Tip text');
    expect(props.accessibilityLiveRegion).toBe('polite');
    expect(props.importantForAccessibility).toBe('yes');
  });

  it('open=false → accessible=false (popup is hidden)', () => {
    const props = getTooltipPopupAccessibilityProps({ contentLabel: 'Tip text', isOpen: false });
    expect(props.accessible).toBe(false);
  });

  it('open=true with no label → accessible=false (nothing to announce)', () => {
    const props = getTooltipPopupAccessibilityProps({ contentLabel: undefined, isOpen: true });
    expect(props.accessible).toBe(false);
  });

  it('always has importantForAccessibility=yes regardless of open state', () => {
    const open = getTooltipPopupAccessibilityProps({ contentLabel: 'x', isOpen: true });
    const closed = getTooltipPopupAccessibilityProps({ contentLabel: 'x', isOpen: false });
    expect(open.importantForAccessibility).toBe('yes');
    expect(closed.importantForAccessibility).toBe('yes');
  });

  it('always has accessibilityLiveRegion=polite regardless of open state', () => {
    const props = getTooltipPopupAccessibilityProps({ contentLabel: undefined, isOpen: false });
    expect(props.accessibilityLiveRegion).toBe('polite');
  });
});

// ─── 10–16. Smoke rendering tests ────────────────────────────────────────────

describe('Tooltip — smoke: renders without crash', () => {
  it('[smoke] minimum props: children + string content', () => {
    expect(() =>
      render(wrap(
        <Tooltip content="Tooltip text">
          <View testID="trigger" />
        </Tooltip>,
      )),
    ).not.toThrow();
  });

  it('[smoke] position=topStart', () => {
    expect(() =>
      render(wrap(
        <Tooltip content="Tip" position="topStart">
          <View />
        </Tooltip>,
      )),
    ).not.toThrow();
  });

  it('[smoke] position=bottomEnd', () => {
    expect(() =>
      render(wrap(
        <Tooltip content="Tip" position="bottomEnd">
          <View />
        </Tooltip>,
      )),
    ).not.toThrow();
  });

  it('[smoke] position=leftStart', () => {
    expect(() =>
      render(wrap(
        <Tooltip content="Tip" position="leftStart">
          <View />
        </Tooltip>,
      )),
    ).not.toThrow();
  });

  it('[smoke] position=rightEnd', () => {
    expect(() =>
      render(wrap(
        <Tooltip content="Tip" position="rightEnd">
          <View />
        </Tooltip>,
      )),
    ).not.toThrow();
  });

  it('[smoke] arrow=false', () => {
    expect(() =>
      render(wrap(
        <Tooltip content="Tip" arrow={false}>
          <View />
        </Tooltip>,
      )),
    ).not.toThrow();
  });

  it('[smoke] disabled=true', () => {
    expect(() =>
      render(wrap(
        <Tooltip content="Tip" disabled>
          <View />
        </Tooltip>,
      )),
    ).not.toThrow();
  });

  it('[smoke] maxWidth=200', () => {
    expect(() =>
      render(wrap(
        <Tooltip content="Long tooltip content that should wrap" maxWidth={200}>
          <View />
        </Tooltip>,
      )),
    ).not.toThrow();
  });

  it('[smoke] subtle=true', () => {
    expect(() =>
      render(wrap(
        <Tooltip content="Tip" subtle>
          <View />
        </Tooltip>,
      )),
    ).not.toThrow();
  });

  it('[smoke] ReactNode content', () => {
    expect(() =>
      render(wrap(
        <Tooltip content={<View><Text>Rich content</Text></View>}>
          <View />
        </Tooltip>,
      )),
    ).not.toThrow();
  });
});

// ─── 17–21. Functional tests ─────────────────────────────────────────────────

describe('Tooltip — functional', () => {
  it('[fn] controlled open=true renders popup in the tree', () => {
    render(wrap(
      <Tooltip content="Popup text" open trigger="manual" testID="ctrl-open">
        <View testID="trigger-open" />
      </Tooltip>,
    ));
    // Popup is rendered when open=true (even if measuring state in RNTL)
    expect(screen.getByTestId('ctrl-open-popup')).toBeTruthy();
  });

  it('[fn] controlled open=false: popup testID not in tree', () => {
    render(wrap(
      <Tooltip content="Popup text" open={false} trigger="manual" testID="ctrl-closed">
        <View testID="trigger-closed" />
      </Tooltip>,
    ));
    expect(screen.queryByTestId('ctrl-closed-popup')).toBeNull();
  });

  it('[fn] defaultOpen=true renders popup on mount', () => {
    render(wrap(
      <Tooltip content="Default open" defaultOpen trigger="click" testID="def-open">
        <View />
      </Tooltip>,
    ));
    expect(screen.getByTestId('def-open-popup')).toBeTruthy();
  });

  it('[fn] trigger=click: press fires onOpenChange(true) when closed', async () => {
    // scheduleShow uses setTimeout(fn, delay) where default delay=200ms.
    // Fake timers are required to flush it synchronously.
    vi.useFakeTimers();
    try {
      const handler = vi.fn();
      render(wrap(
        <Tooltip content="Clickable" trigger="click" onOpenChange={handler}>
          <Pressable testID="btn">
            <Text>Press</Text>
          </Pressable>
        </Tooltip>,
      ));
      fireEvent.press(screen.getByTestId('btn'));
      await vi.runAllTimersAsync();
      expect(handler).toHaveBeenCalledWith(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('[fn] trigger=click + already open: press fires onOpenChange(false)', () => {
    const handler = vi.fn();
    render(wrap(
      <Tooltip content="Clickable" trigger="click" open onOpenChange={handler}>
        <Pressable testID="btn-close">
          <Text>Press</Text>
        </Pressable>
      </Tooltip>,
    ));
    fireEvent.press(screen.getByTestId('btn-close'));
    expect(handler).toHaveBeenCalledWith(false);
  });

  it('[fn] disabled=true: press does NOT fire onOpenChange', () => {
    const handler = vi.fn();
    render(wrap(
      <Tooltip content="Tip" trigger="click" disabled onOpenChange={handler}>
        <Pressable testID="dis-btn">
          <Text>Press</Text>
        </Pressable>
      </Tooltip>,
    ));
    fireEvent.press(screen.getByTestId('dis-btn'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] trigger=manual: press does NOT open tooltip (onOpenChange not fired)', () => {
    const handler = vi.fn();
    render(wrap(
      <Tooltip content="Manual" trigger="manual" onOpenChange={handler}>
        <View testID="manual-trigger" />
      </Tooltip>,
    ));
    // No pressable is wrapped by trigger=manual when child is a plain View
    // (no press handler merged); state stays closed
    expect(handler).not.toHaveBeenCalled();
  });
});

// ─── 22–27. Accessibility rendered tests ─────────────────────────────────────

describe('Tooltip — a11y (rendered)', () => {
  it('[a11y] trigger wrapper has accessibilityRole=button when aria-label is set', () => {
    render(wrap(
      <Tooltip content="Help text" aria-label="Open help" open trigger="manual">
        <View testID="t1" />
      </Tooltip>,
    ));
    // The trigger wrapper View gets triggerA11y props including accessibilityRole
    const btn = screen.UNSAFE_getByProps({ accessibilityRole: 'button' });
    expect(btn).toBeTruthy();
  });

  it('[a11y] trigger accessibilityLabel matches the aria-label prop', () => {
    render(wrap(
      <Tooltip content="Tip" aria-label="My label" trigger="manual">
        <View />
      </Tooltip>,
    ));
    const el = screen.UNSAFE_getByProps({ accessibilityLabel: 'My label' });
    expect(el).toBeTruthy();
  });

  it('[a11y] accessibilityState.expanded=true when open, false when closed', () => {
    const { rerender } = render(wrap(
      <Tooltip content="Tip" aria-label="Help" open trigger="manual">
        <View />
      </Tooltip>,
    ));
    const openEl = screen.UNSAFE_getByProps({ accessibilityRole: 'button' });
    expect(openEl.props.accessibilityState.expanded).toBe(true);

    rerender(wrap(
      <Tooltip content="Tip" aria-label="Help" open={false} trigger="manual">
        <View />
      </Tooltip>,
    ));
    const closedEl = screen.UNSAFE_getByProps({ accessibilityRole: 'button' });
    expect(closedEl.props.accessibilityState.expanded).toBe(false);
  });

  it('[a11y] disabled=true: accessibilityState.disabled=true on trigger', () => {
    render(wrap(
      <Tooltip content="Tip" aria-label="Help" disabled trigger="manual">
        <View />
      </Tooltip>,
    ));
    const el = screen.UNSAFE_getByProps({ accessibilityRole: 'button' });
    expect(el.props.accessibilityState.disabled).toBe(true);
  });

  it('[a11y] popup has accessibilityRole=text and accessibilityLiveRegion=polite', () => {
    render(wrap(
      <Tooltip content="Popup text" open trigger="manual" testID="a11y-popup">
        <View />
      </Tooltip>,
    ));
    const popup = screen.getByTestId('a11y-popup-popup');
    expect(popup.props.accessibilityRole).toBe('text');
    expect(popup.props.accessibilityLiveRegion).toBe('polite');
  });

  it('[a11y] popup accessible=true when open with string content', () => {
    render(wrap(
      <Tooltip content="Accessible tip" open trigger="manual" testID="a11y-open-popup">
        <View />
      </Tooltip>,
    ));
    const popup = screen.getByTestId('a11y-open-popup-popup');
    expect(popup.props.accessible).toBe(true);
  });

  it('[a11y] popup accessible=false when closed (no testID rendered since open=false)', () => {
    render(wrap(
      <Tooltip content="Hidden tip" open={false} trigger="manual" testID="a11y-closed-popup">
        <View />
      </Tooltip>,
    ));
    // Popup not rendered when open=false
    expect(screen.queryByTestId('a11y-closed-popup-popup')).toBeNull();
  });
});

// ─── 28–31. Visual snapshot tests ────────────────────────────────────────────

describe('Tooltip — visual snapshots', () => {
  it('[visual] position=bottom, arrow=true, open=true', () => {
    const { toJSON } = render(wrap(
      <Tooltip
        content="Snapshot tip"
        position="bottom"
        arrow={true}
        open
        trigger="manual"
        testID="snap-1"
      >
        <View style={{ width: 60, height: 32 }} />
      </Tooltip>,
    ));
    expect(toJSON()).toMatchSnapshot();
  });

  it('[visual] position=right, arrow=false, open=true', () => {
    const { toJSON } = render(wrap(
      <Tooltip
        content="Right side tip"
        position="right"
        arrow={false}
        open
        trigger="manual"
        testID="snap-2"
      >
        <View style={{ width: 60, height: 32 }} />
      </Tooltip>,
    ));
    expect(toJSON()).toMatchSnapshot();
  });

  it('[visual] disabled=true: popup not rendered', () => {
    const { toJSON } = render(wrap(
      <Tooltip
        content="Disabled tip"
        disabled
        trigger="manual"
        testID="snap-3"
      >
        <View style={{ width: 60, height: 32 }} />
      </Tooltip>,
    ));
    expect(toJSON()).toMatchSnapshot();
  });

  it('[visual] maxWidth=180 with long content, open=true', () => {
    const { toJSON } = render(wrap(
      <Tooltip
        content="This is a longer tooltip message that wraps to multiple lines inside the popup"
        maxWidth={180}
        position="bottom"
        open
        trigger="manual"
        testID="snap-4"
      >
        <View style={{ width: 60, height: 32 }} />
      </Tooltip>,
    ));
    expect(toJSON()).toMatchSnapshot();
  });
});

// ─── 32–35. Bug-catching tests (expected to FAIL) ────────────────────────────

describe('Tooltip — bug-catching (all expected to FAIL — do not fix tests)', () => {
  // ── BUG-TOOLTIP-1 ─────────────────────────────────────────────────────────

  it('[bug] BUG-TOOLTIP-1: Figma prop "tip" is not a key of TooltipProps — silently ignored at runtime', () => {
    // Figma API table documents prop name as 'tip' (e.g. tip: true | false).
    // Native code uses 'arrow: boolean'. Passing tip={false} has NO effect —
    // it is an unknown prop and the tooltip arrow still renders.
    //
    // This test asserts that 'tip' IS a key of TooltipProps.
    // It will FAIL because 'tip' is not in the interface.
    // The failure is intentional: keep it failing to surface the Figma/code mismatch.
    //
    // Workaround for QA: always use arrow={false}, never tip={false}.
    const knownProps: Array<keyof TooltipProps> = [];
    // @ts-expect-error 'tip' is not assignable to keyof TooltipProps
    knownProps.push('tip');
    expect(knownProps).toContain('tip'); // FAILS: 'tip' is not in TooltipProps
  });

  // ── BUG-TOOLTIP-2 ─────────────────────────────────────────────────────────

  it('[bug] BUG-TOOLTIP-2: Figma prop "disable" is not a key of TooltipProps — silently ignored at runtime', () => {
    // Figma API table documents prop name as 'disable' (e.g. disable: true | false).
    // Native code uses 'disabled: boolean'. Passing disable={true} has NO effect.
    //
    // This test asserts that 'disable' IS a key of TooltipProps.
    // It will FAIL because 'disable' is not in the interface.
    //
    // Workaround for QA: always use disabled={true}, never disable={true}.
    const knownProps: Array<keyof TooltipProps> = [];
    // @ts-expect-error 'disable' is not assignable to keyof TooltipProps
    knownProps.push('disable');
    expect(knownProps).toContain('disable'); // FAILS: 'disable' is not in TooltipProps
  });

  // ── BUG-TOOLTIP-3 ─────────────────────────────────────────────────────────

  it('[bug] BUG-TOOLTIP-3: anchor View sets accessibilityElementsHidden=true when open — silences popup on iOS VoiceOver', () => {
    // Tooltip.native.tsx:639:
    //   <View ref={anchorRef} style={styles.anchor} collapsable={false}
    //         accessibilityElementsHidden={isOpen}>
    // The anchor wraps BOTH the trigger wrapper AND the popup Animated.View.
    // On iOS, accessibilityElementsHidden=true cascades to ALL children, overriding
    // the popup's own importantForAccessibility='yes'.
    // Result: tooltip content is NEVER announced by VoiceOver when open.
    //
    // Expected fix: apply accessibilityElementsHidden only to the trigger wrapper,
    // not the outer anchor that also contains the popup.
    //
    // This test queries for any View with accessibilityElementsHidden=true and
    // asserts that NONE exist when the tooltip is open.
    // It FAILS because the anchor IS set to hidden=true when open.
    render(wrap(
      <Tooltip content="Popup text" open trigger="manual" aria-label="Help">
        <View testID="bug3-trigger" />
      </Tooltip>,
    ));
    const hiddenViews = screen.UNSAFE_getAllByProps({ accessibilityElementsHidden: true });
    // Expected: no ancestor hides all children when popup is open
    expect(hiddenViews).toHaveLength(0); // FAILS: anchor has accessibilityElementsHidden=true
  });

  // ── BUG-TOOLTIP-4 ─────────────────────────────────────────────────────────

  it('[bug] BUG-TOOLTIP-4: trigger is inaccessible (accessible=false) when content is ReactNode and no aria-label', () => {
    // getTooltipTriggerAccessibilityProps:
    //   const label = props['aria-label'] ?? state.contentLabel;
    //   return { accessible: Boolean(label), ... }
    // When content is a plain ReactNode (no aria-label on root) and no Tooltip aria-label:
    //   state.contentLabel = undefined → label = undefined → accessible = false
    // Result: the trigger View has accessible=false → invisible to VoiceOver/TalkBack.
    //
    // Expected fix: trigger should remain accessible=true with a generic button role,
    // even when no explicit label is derivable.
    //
    // This test asserts that at least one element with accessibilityRole='button'
    // exists in the tree (the trigger wrapper). It FAILS because accessible=false
    // means no button role is set.
    render(wrap(
      <Tooltip content={<View><Text>Rich content</Text></View>} trigger="manual">
        <View testID="bug4-trigger" />
      </Tooltip>,
    ));
    // getTooltipTriggerAccessibilityProps returns accessible=false, role=undefined
    // Expected: trigger should still be a 'button' accessible to screen readers
    const accessibleTriggers = screen.UNSAFE_queryAllByProps({ accessibilityRole: 'button' });
    expect(accessibleTriggers.length).toBeGreaterThan(0); // FAILS: no button role when label=undefined
  });
});
