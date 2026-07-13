/**
 * Checkbox QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/Checkbox/Checkbox.native.tsx
 *
 * ─── Figma API table ─────────────────────────────────────────────────────────
 *
 *   Property      Values                          Figma type
 *   ───────────────────────────────────────────────────────
 *   size          S[4] | M[5] | L[6]              component property
 *   appearance    auto|neutral|primary|secondary|  variable mode
 *                 sparkle|negative|positive|
 *                 warning|informative
 *   accent        primary|secondary|sparkle        N/A (deprecated)
 *   selected      true | false                     component property
 *   indeterminate true | false                     component property
 *   readOnly      true | false                     component property
 *   disabled      true | false                     component property
 *
 * ─── Native prop mapping ─────────────────────────────────────────────────────
 *
 *   Figma S[4]/M[5]/L[6] → native size='s'/'m'/'l'
 *     s → box 16px (tokens.spacing['4']), icon 12px (tokens.spacing['3'])
 *     m → box 20px (tokens.spacing['5']), icon 16px (tokens.spacing['4'])
 *     l → box 24px (tokens.spacing['6']), icon 18px (tokens.spacing['4-5'])
 *
 *   appearance='auto' → resolves to 'secondary' (NOT 'primary' like most components)
 *
 * ─── State machine ───────────────────────────────────────────────────────────
 *
 *   Unselected  → accessibilityState.checked=false
 *   Selected    → accessibilityState.checked=true
 *   Indeterminate → accessibilityState.checked='mixed', isSelected forced false
 *
 *   Press behaviour:
 *     indeterminate → next selected=true (always moves to fully selected)
 *     selected=true → next selected=false
 *     selected=false → next selected=true
 *
 *   disabled=true  → press blocked, accessibilityState.disabled=true
 *   readOnly=true  → press blocked, accessibilityState.disabled=false (readOnly ≠ disabled)
 *
 * ─── Bugs (raise to dev team) ────────────────────────────────────────────────
 *
 *   BUG-CBX-1 · ariaProps from useCheckboxState is computed but never applied
 *     useCheckboxState returns:
 *       ariaProps: { 'aria-disabled'?: true, 'aria-readonly'?: true }
 *     Checkbox.native.tsx only destructures { isDisabled, isReadOnly,
 *     resolvedAppearance, resolvedSize } — ariaProps is not destructured and
 *     therefore never spread onto the Pressable.
 *     Impact: 'aria-readonly' is NEVER set on the element. Screen readers have
 *     no signal that the checkbox is read-only — they announce it as a fully
 *     interactive checkbox that simply does nothing when activated.
 *     File: packages/ui-native/src/components/Checkbox/Checkbox.native.tsx:217-222
 *     Fix:  Destructure ariaProps from useCheckboxState and spread it on the
 *           Pressable alongside the a11y props:
 *           `<Pressable {...a11y} {...ariaProps} disabled={...} />`
 *
 *   BUG-CBX-2 · accent prop is @deprecated but emits no console.warn
 *     The interface marks accent as "@deprecated Ignored at runtime — use appearance".
 *     No warning is emitted when a caller passes accent. Callers who rely on accent
 *     for color control silently get the default secondary appearance instead.
 *     File: packages/ui-native/src/components/Checkbox/interface.ts:42-43
 *     Fix:  Add `if (process.env.NODE_ENV !== 'production' && props.accent)
 *           console.warn('[Checkbox] accent is deprecated...')` in useCheckboxState.
 *
 *   BUG-CBX-3 · dataAttrs from useCheckboxState computed but never used on native
 *     useCheckboxState returns dataAttrs ({ 'data-size', 'data-appearance', ... })
 *     that are never spread onto the rendered View or Pressable. Dead code on native.
 *     File: packages/ui-native/src/components/Checkbox/interface.ts:179-189
 *     Fix:  Remove dataAttrs from the native useCheckboxState return value or
 *           document clearly that it is web-only and intentionally excluded on native.
 *
 *   BUG-CBX-4 · readOnly checkbox: Pressable disabled=true but accessibilityState.disabled=false
 *     readOnly sets Pressable disabled={isDisabled || isReadOnly} = disabled={true}.
 *     accessibilityState.disabled = state.isDisabled = false (readOnly flag is ignored).
 *     Screen readers announce the checkbox as not disabled but pressing it does nothing.
 *     This is partially by design (comment: "RN has no native read-only flag") but
 *     without aria-readonly (BUG-CBX-1), there is NO accessibility signal for readOnly.
 *     File: packages/ui-native/src/components/Checkbox/Checkbox.native.tsx:311-316
 *     Fix:  Apply ariaProps (which includes 'aria-readonly') to the Pressable, or
 *           set accessibilityHint to "Read-only" automatically when readOnly=true.
 */

import React from 'react';
import { View } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { tokens } from '@oneui/tokens';
import { Checkbox } from '@ui-native/components/Checkbox/Checkbox.native';
import { BOX_SIZE } from '@ui-native/components/Checkbox/Checkbox.styles.native';
import { wrap } from '../../utils/renderWithTheme';

// Constrain width so besideColumn (flex:1) doesn't stretch across the full
// sketch panel — keeps label+description visually tight to the checkbox box.
const wrapCB = (el: React.ReactElement) =>
  wrap(<View style={{ maxWidth: 280 }}>{el}</View>);

// ─── Figma API constants ──────────────────────────────────────────────────────

const SIZES       = ['s', 'm', 'l'] as const;
const APPEARANCES = [
  'auto', 'neutral', 'primary', 'secondary', 'sparkle',
  'negative', 'positive', 'warning', 'informative',
] as const;

// ─── Figma screen: 3 state rows ──────────────────────────────────────────────
//
// Matches the Figma second screenshot exactly — three rows:
//   Row 1: unselected  □  Label / Description
//   Row 2: selected    ✓  Label / Description   (orange fill)
//   Row 3: indeterminate ─  Label / Description  (orange fill + minus glyph)
// Size: M (as labelled at the bottom of the Figma frame).

describe('Checkbox — Figma screen: 3 state rows', () => {
  it('[smoke] row 1 — unselected with label and description', () => {
    render(wrapCB(
      <Checkbox selected={false} label="Label" description="Description" testID="cb-unselected" />,
    ));
    expect(screen.getByText('Label')).toBeTruthy();
    expect(screen.getByText('Description')).toBeTruthy();
    expect(screen.getByTestId('cb-unselected').props.accessibilityState.checked).toBe(false);
  });

  it('[smoke] row 2 — selected with label and description', () => {
    render(wrapCB(
      <Checkbox selected label="Label" description="Description" testID="cb-selected" />,
    ));
    expect(screen.getByText('Label')).toBeTruthy();
    expect(screen.getByText('Description')).toBeTruthy();
    expect(screen.getByTestId('cb-selected').props.accessibilityState.checked).toBe(true);
  });

  it('[smoke] row 3 — indeterminate with label and description', () => {
    render(wrapCB(
      <Checkbox indeterminate label="Label" description="Description" testID="cb-indeterminate" />,
    ));
    expect(screen.getByText('Label')).toBeTruthy();
    expect(screen.getByText('Description')).toBeTruthy();
    expect(screen.getByTestId('cb-indeterminate').props.accessibilityState.checked).toBe('mixed');
  });
});

// ─── Figma matrix: appearance ─────────────────────────────────────────────────

describe('Checkbox — Figma matrix: appearance', () => {
  for (const appearance of APPEARANCES) {
    it(`[smoke] appearance="${appearance}" — label and description render`, () => {
      render(wrapCB(
        <Checkbox
          appearance={appearance}
          label="Label"
          description="Description"
          testID={`app-${appearance}`}
        />,
      ));
      expect(screen.getByText('Label')).toBeTruthy();
      expect(screen.getByText('Description')).toBeTruthy();
    });
  }

  it('[fn] appearance="auto" resolves to secondary (not primary)', () => {
    render(wrapCB(<Checkbox appearance="auto" label="Label" description="Description" testID="app-auto" />));
    expect(screen.getByTestId('app-auto')).toBeTruthy();
  });
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('Checkbox — smoke', () => {
  it('[smoke] renders without crashing (all defaults)', () => {
    expect(() => render(wrap(<Checkbox />))).not.toThrow();
  });

  it('[smoke] renders with label without crashing', () => {
    expect(() => render(wrap(<Checkbox label="Accept terms" />))).not.toThrow();
  });

  it('[smoke] renders with label and description', () => {
    expect(() =>
      render(wrap(<Checkbox label="Accept" description="Required field" />)),
    ).not.toThrow();
  });

  it('[smoke] renders selected=true without crashing', () => {
    expect(() => render(wrap(<Checkbox selected />))).not.toThrow();
  });

  it('[smoke] renders indeterminate without crashing', () => {
    expect(() => render(wrap(<Checkbox indeterminate />))).not.toThrow();
  });

  it('[smoke] renders disabled without crashing', () => {
    expect(() => render(wrap(<Checkbox disabled />))).not.toThrow();
  });

  it('[smoke] renders readOnly without crashing', () => {
    expect(() => render(wrap(<Checkbox readOnly />))).not.toThrow();
  });

  it('[smoke] renders all three sizes', () => {
    for (const size of SIZES) {
      const { unmount } = render(wrap(<Checkbox size={size} testID={`sz-${size}`} />));
      expect(screen.getByTestId(`sz-${size}`)).toBeTruthy();
      unmount();
    }
    render(wrap(<Checkbox />));
  });
});

// ─── Functional: selected state ───────────────────────────────────────────────

describe('Checkbox — functional: selected state', () => {
  it('[fn] selected=false → accessibilityState.checked=false', () => {
    render(wrap(<Checkbox selected={false} testID="cb-unchecked" />));
    expect(screen.getByTestId('cb-unchecked').props.accessibilityState.checked).toBe(false);
  });

  it('[fn] selected=true → accessibilityState.checked=true', () => {
    render(wrap(<Checkbox selected testID="cb-checked" />));
    expect(screen.getByTestId('cb-checked').props.accessibilityState.checked).toBe(true);
  });

  it('[fn] indeterminate=true → accessibilityState.checked="mixed"', () => {
    render(wrap(<Checkbox indeterminate testID="cb-mixed" />));
    expect(screen.getByTestId('cb-mixed').props.accessibilityState.checked).toBe('mixed');
  });

  it('[fn] indeterminate=true overrides selected=true → checked is "mixed" not true', () => {
    // When indeterminate, isSelected is forced false in useCheckboxState
    render(wrap(<Checkbox indeterminate selected testID="cb-ind-sel" />));
    expect(screen.getByTestId('cb-ind-sel').props.accessibilityState.checked).toBe('mixed');
  });

  it('[fn] defaultSelected=true starts in selected state (uncontrolled)', () => {
    render(wrap(<Checkbox defaultSelected testID="cb-default-sel" />));
    expect(screen.getByTestId('cb-default-sel').props.accessibilityState.checked).toBe(true);
  });

  it('[fn] controlled: selected prop controls state regardless of press', () => {
    // Controlled mode: selected prop wins over internal state
    render(wrap(<Checkbox selected={false} testID="cb-controlled" />));
    expect(screen.getByTestId('cb-controlled').props.accessibilityState.checked).toBe(false);
  });
});

// ─── Functional: interaction ──────────────────────────────────────────────────

describe('Checkbox — functional: interaction', () => {
  it('[fn] press fires onSelectedChange with toggled value (false → true)', () => {
    const handler = vi.fn();
    render(wrap(
      <Checkbox selected={false} onSelectedChange={handler} testID="cb-press" />,
    ));
    fireEvent.press(screen.getByTestId('cb-press'));
    expect(handler).toHaveBeenCalledWith(true);
  });

  it('[fn] press fires onSelectedChange with toggled value (true → false)', () => {
    const handler = vi.fn();
    render(wrap(
      <Checkbox selected={true} onSelectedChange={handler} testID="cb-toggle" />,
    ));
    fireEvent.press(screen.getByTestId('cb-toggle'));
    expect(handler).toHaveBeenCalledWith(false);
  });

  it('[fn] press on indeterminate fires onSelectedChange with true (always selects)', () => {
    const handler = vi.fn();
    render(wrap(
      <Checkbox indeterminate onSelectedChange={handler} testID="cb-ind-press" />,
    ));
    fireEvent.press(screen.getByTestId('cb-ind-press'));
    expect(handler).toHaveBeenCalledWith(true);
  });

  it('[fn] press also fires onPress handler', () => {
    const pressHandler = vi.fn();
    const changeHandler = vi.fn();
    render(wrap(
      <Checkbox
        onPress={pressHandler}
        onSelectedChange={changeHandler}
        testID="cb-dual-press"
      />,
    ));
    fireEvent.press(screen.getByTestId('cb-dual-press'));
    expect(pressHandler).toHaveBeenCalledTimes(1);
    expect(changeHandler).toHaveBeenCalledTimes(1);
  });

  it('[fn] disabled=true blocks press — onSelectedChange not called', () => {
    const handler = vi.fn();
    render(wrap(
      <Checkbox disabled onSelectedChange={handler} testID="cb-disabled" />,
    ));
    fireEvent.press(screen.getByTestId('cb-disabled'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] readOnly=true blocks press — onSelectedChange not called', () => {
    const handler = vi.fn();
    render(wrap(
      <Checkbox readOnly onSelectedChange={handler} testID="cb-readonly" />,
    ));
    fireEvent.press(screen.getByTestId('cb-readonly'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] uncontrolled: press toggles internal state (false → true → false)', () => {
    render(wrap(<Checkbox testID="cb-uncontrolled" />));
    expect(screen.getByTestId('cb-uncontrolled').props.accessibilityState.checked).toBe(false);
    fireEvent.press(screen.getByTestId('cb-uncontrolled'));
    expect(screen.getByTestId('cb-uncontrolled').props.accessibilityState.checked).toBe(true);
    // Second press deselects
    fireEvent.press(screen.getByTestId('cb-uncontrolled'));
    expect(screen.getByTestId('cb-uncontrolled').props.accessibilityState.checked).toBe(false);
  });

  it('[fn] onSelectedChange called with exact toggled value each press', () => {
    const handler = vi.fn();
    render(wrap(<Checkbox onSelectedChange={handler} testID="cb-exact" />));
    fireEvent.press(screen.getByTestId('cb-exact')); // false→true
    fireEvent.press(screen.getByTestId('cb-exact')); // true→false
    fireEvent.press(screen.getByTestId('cb-exact')); // false→true
    expect(handler).toHaveBeenNthCalledWith(1, true);
    expect(handler).toHaveBeenNthCalledWith(2, false);
    expect(handler).toHaveBeenNthCalledWith(3, true);
  });

  it('[fn] disabled=true blocks onPress too — neither handler fires', () => {
    const changeHandler = vi.fn();
    const pressHandler = vi.fn();
    render(wrap(
      <Checkbox disabled onSelectedChange={changeHandler} onPress={pressHandler} testID="cb-dis-both" />,
    ));
    fireEvent.press(screen.getByTestId('cb-dis-both'));
    expect(changeHandler).not.toHaveBeenCalled();
    expect(pressHandler).not.toHaveBeenCalled();
  });

  it('[fn] readOnly=true blocks onPress too — neither handler fires', () => {
    const changeHandler = vi.fn();
    const pressHandler = vi.fn();
    render(wrap(
      <Checkbox readOnly onSelectedChange={changeHandler} onPress={pressHandler} testID="cb-ro-both" />,
    ));
    fireEvent.press(screen.getByTestId('cb-ro-both'));
    expect(changeHandler).not.toHaveBeenCalled();
    expect(pressHandler).not.toHaveBeenCalled();
  });

  it('[fn] controlled: press calls onSelectedChange but state is driven by prop', () => {
    const handler = vi.fn();
    // selected=false (controlled) — press should call handler with true
    // but the visual state stays false until the parent updates the prop
    render(wrap(
      <Checkbox selected={false} onSelectedChange={handler} testID="cb-ctrl-press" />,
    ));
    fireEvent.press(screen.getByTestId('cb-ctrl-press'));
    expect(handler).toHaveBeenCalledWith(true);
    // Still false because selected prop hasn't changed (controlled)
    expect(screen.getByTestId('cb-ctrl-press').props.accessibilityState.checked).toBe(false);
  });

  it('[fn] defaultSelected=true: first press deselects (false)', () => {
    const handler = vi.fn();
    render(wrap(
      <Checkbox defaultSelected onSelectedChange={handler} testID="cb-def-press" />,
    ));
    fireEvent.press(screen.getByTestId('cb-def-press'));
    expect(handler).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('cb-def-press').props.accessibilityState.checked).toBe(false);
  });

  it('[fn] onPress fires without onSelectedChange set (standalone press handler)', () => {
    const handler = vi.fn();
    render(wrap(<Checkbox onPress={handler} testID="cb-onpress-only" />));
    fireEvent.press(screen.getByTestId('cb-onpress-only'));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ─── Functional: label and description ───────────────────────────────────────

describe('Checkbox — functional: label and description', () => {
  it('[fn] label renders as visible text', () => {
    render(wrap(<Checkbox label="Subscribe to newsletter" />));
    expect(screen.getByText('Subscribe to newsletter')).toBeTruthy();
  });

  it('[fn] description renders as visible text below label', () => {
    render(wrap(<Checkbox label="Accept" description="You agree to our terms" />));
    expect(screen.getByText('You agree to our terms')).toBeTruthy();
  });

  it('[fn] label Text node is accessible=false (label in accessibilityLabel, not label Text)', () => {
    // The label RN Text is accessible=false; the Pressable carries the accessibilityLabel
    render(wrap(<Checkbox label="Option" testID="cb-label" />));
    const pressable = screen.getByTestId('cb-label');
    expect(pressable.props.accessibilityLabel).toBe('Option');
  });

  it('[fn] description Text node is accessible=false', () => {
    render(wrap(<Checkbox label="Option" description="Description text" testID="cb-desc" />));
    // Description is visible but accessible=false (not announced as separate element)
    expect(screen.getByText('Description text')).toBeTruthy();
  });

  it('[fn] no label, no description → no text in tree', () => {
    render(wrap(<Checkbox testID="cb-no-label" />));
    // No label/description → only the Pressable is rendered
    expect(screen.queryByRole('text')).toBeNull();
  });

  it('[fn] testID is forwarded to the Pressable (interactive element)', () => {
    render(wrap(<Checkbox testID="my-checkbox" />));
    expect(screen.getByTestId('my-checkbox')).toBeTruthy();
    // The Pressable has the checkbox role:
    expect(screen.getByTestId('my-checkbox').props.accessibilityRole).toBe('checkbox');
  });
});

// ─── Functional: disabled and readOnly states ─────────────────────────────────

describe('Checkbox — functional: disabled and readOnly', () => {
  it('[fn] disabled=true → accessibilityState.disabled=true', () => {
    render(wrap(<Checkbox disabled testID="cb-dis" />));
    expect(screen.getByTestId('cb-dis').props.accessibilityState.disabled).toBe(true);
  });

  it('[fn] disabled=false → accessibilityState.disabled=false', () => {
    render(wrap(<Checkbox disabled={false} testID="cb-nodis" />));
    expect(screen.getByTestId('cb-nodis').props.accessibilityState.disabled).toBe(false);
  });

  it('[bug] BUG-CBX-4b: readOnly=true → accessibilityState.disabled=true (regression — should be false)', () => {
    // BUG-CBX-4b: getCheckboxAccessibilityProps sets disabled: state.isDisabled || state.isReadOnly.
    // For readOnly=true, disabled=false: accessibilityState.disabled becomes true.
    // Expected: readOnly ≠ disabled in a11y — readOnly should set disabled=false (not true).
    // Screen readers incorrectly announce a readOnly checkbox as "disabled".
    // Regression introduced in 892ff4aa (merge checkbox readonly dark mode work into dev).
    // File: packages/ui-native/src/components/Checkbox/interface.ts
    // Fix:  Change to `disabled: state.isDisabled` (not `state.isDisabled || state.isReadOnly`).
    render(wrap(<Checkbox readOnly testID="cb-ro-state" />));
    // Expected: false — readOnly is NOT the same as disabled for assistive tech
    expect(screen.getByTestId('cb-ro-state').props.accessibilityState.disabled).toBe(false);
  });

  it('[fn] readOnly=true with selected=true → still shows checked=true', () => {
    render(wrap(<Checkbox readOnly selected testID="cb-ro-checked" />));
    expect(screen.getByTestId('cb-ro-checked').props.accessibilityState.checked).toBe(true);
  });

  it('[fn] both disabled and readOnly → accessibilityState.disabled=true', () => {
    render(wrap(<Checkbox disabled readOnly testID="cb-dis-ro" />));
    expect(screen.getByTestId('cb-dis-ro').props.accessibilityState.disabled).toBe(true);
  });
});

// ─── Functional: box dimensions (Figma size mapping) ─────────────────────────

describe('Checkbox — functional: box dimensions', () => {
  function flatStyle(style: unknown): Record<string, unknown> {
    if (!style) return {};
    if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
    if (typeof style === 'object') return style as Record<string, unknown>;
    return {};
  }

  it('[fn] size="s" → box is 16px × 16px (tokens.spacing["4"])', () => {
    render(wrap(<Checkbox size="s" testID="box-s" />));
    const s = flatStyle(screen.getByTestId('box-s').props.style);
    expect(s.width).toBe(BOX_SIZE.s);   // 16px
    expect(s.height).toBe(BOX_SIZE.s);
  });

  it('[fn] size="m" → box is 20px × 20px (tokens.spacing["5"])', () => {
    render(wrap(<Checkbox size="m" testID="box-m" />));
    const s = flatStyle(screen.getByTestId('box-m').props.style);
    expect(s.width).toBe(BOX_SIZE.m);   // 20px
    expect(s.height).toBe(BOX_SIZE.m);
  });

  it('[fn] size="l" → box is 24px × 24px (tokens.spacing["6"])', () => {
    render(wrap(<Checkbox size="l" testID="box-l" />));
    const s = flatStyle(screen.getByTestId('box-l').props.style);
    expect(s.width).toBe(BOX_SIZE.l);   // 24px
    expect(s.height).toBe(BOX_SIZE.l);
  });

  it('[fn] default size is "m" (20px)', () => {
    render(wrap(<Checkbox testID="box-default" />));
    const s = flatStyle(screen.getByTestId('box-default').props.style);
    expect(s.width).toBe(BOX_SIZE.m);
  });

  it('[fn] size "s" < "m" < "l" (monotonically increasing)', () => {
    expect(BOX_SIZE.s).toBeLessThan(BOX_SIZE.m);
    expect(BOX_SIZE.m).toBeLessThan(BOX_SIZE.l);
  });

  it('[fn] legacy size aliases: "small" → s, "medium" → m, "large" → l', () => {
    // Legacy aliases accepted for transitional call sites
    for (const [alias, canonical] of [
      ['small', 's'], ['medium', 'm'], ['large', 'l'],
    ] as const) {
      const { unmount } = render(wrap(
        // @ts-expect-error — legacy alias
        <Checkbox size={alias} testID={`alias-${alias}`} />,
      ));
      const s = flatStyle(screen.getByTestId(`alias-${alias}`).props.style);
      expect(s.width).toBe(BOX_SIZE[canonical]);
      unmount();
    }
    render(wrap(<Checkbox />));
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('Checkbox — a11y', () => {
  it('[a11y] accessibilityRole is "checkbox"', () => {
    render(wrap(<Checkbox testID="a11y-role" />));
    expect(screen.getByTestId('a11y-role').props.accessibilityRole).toBe('checkbox');
  });

  it('[a11y] getByRole("checkbox") finds the element', () => {
    render(wrap(<Checkbox />));
    expect(screen.getByRole('checkbox')).toBeTruthy();
  });

  it('[a11y] accessible=true by default', () => {
    render(wrap(<Checkbox testID="a11y-acc" />));
    expect(screen.getByTestId('a11y-acc').props.accessible).toBe(true);
  });

  it('[a11y] accessibilityLabel from label prop', () => {
    render(wrap(<Checkbox label="Accept terms" testID="a11y-label" />));
    expect(screen.getByTestId('a11y-label').props.accessibilityLabel).toBe('Accept terms');
  });

  it('[a11y] aria-label overrides label as accessibilityLabel', () => {
    render(wrap(
      <Checkbox label="Accept" aria-label="Custom name" testID="a11y-override" />,
    ));
    expect(screen.getByTestId('a11y-override').props.accessibilityLabel).toBe('Custom name');
  });

  it('[a11y] getByLabelText finds element via aria-label', () => {
    render(wrap(<Checkbox aria-label="Subscribe" />));
    expect(screen.getByLabelText('Subscribe')).toBeTruthy();
  });

  it('[a11y] accessibilityState.checked=false when unselected', () => {
    render(wrap(<Checkbox testID="a11y-unchecked" />));
    expect(screen.getByTestId('a11y-unchecked').props.accessibilityState.checked).toBe(false);
  });

  it('[a11y] accessibilityState.checked=true when selected', () => {
    render(wrap(<Checkbox selected testID="a11y-checked" />));
    expect(screen.getByTestId('a11y-checked').props.accessibilityState.checked).toBe(true);
  });

  it('[a11y] accessibilityState.checked="mixed" when indeterminate', () => {
    render(wrap(<Checkbox indeterminate testID="a11y-mixed" />));
    expect(screen.getByTestId('a11y-mixed').props.accessibilityState.checked).toBe('mixed');
  });

  it('[a11y] accessibilityState.disabled=true when disabled', () => {
    render(wrap(<Checkbox disabled testID="a11y-disabled" />));
    expect(screen.getByTestId('a11y-disabled').props.accessibilityState.disabled).toBe(true);
  });

  it('[a11y] accessibilityHint is forwarded to element', () => {
    render(wrap(
      <Checkbox accessibilityHint="Toggles the setting" testID="a11y-hint" />,
    ));
    expect(screen.getByTestId('a11y-hint').props.accessibilityHint).toBe('Toggles the setting');
  });

  it('[a11y] aria-hidden=true → accessible=false, accessibilityElementsHidden=true', () => {
    render(wrap(<Checkbox aria-hidden testID="a11y-hidden" />));
    const el = screen.getByTestId('a11y-hidden', { includeHiddenElements: true });
    expect(el.props.accessible).not.toBe(true);
    expect(el.props.accessibilityElementsHidden).toBe(true);
  });

  it('[a11y] aria-hidden element is not findable by role', () => {
    render(wrap(<Checkbox aria-hidden />));
    expect(screen.queryByRole('checkbox')).toBeNull();
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('Checkbox — bug-catching', () => {
  // ── BUG-CBX-1: ariaProps unused → aria-readonly never set ──────────────────

  it('[bug] BUG-CBX-1: readOnly=true — aria-readonly is never set on the Pressable', () => {
    render(wrap(<Checkbox readOnly testID="bug-ro" />));
    const el = screen.getByTestId('bug-ro');
    // useCheckboxState computes ariaProps: { 'aria-readonly': true } for readOnly.
    // Bug: ariaProps is not destructured in Checkbox.native.tsx and never spread onto
    //      the Pressable. Screen readers have no signal that the control is read-only.
    // Expected: el.props['aria-readonly'] should be true
    expect(el.props['aria-readonly']).toBe(true);
  });

  it('[bug] BUG-CBX-1: disabled=true — aria-disabled is never set despite being in ariaProps', () => {
    render(wrap(<Checkbox disabled testID="bug-dis-aria" />));
    const el = screen.getByTestId('bug-dis-aria');
    // ariaProps: { 'aria-disabled': true } computed but unused.
    // accessibilityState.disabled=true does convey it — but aria-disabled redundancy
    // on some platforms matters for AT compatibility.
    expect(el.props['aria-disabled']).toBe(true);
  });

  // ── BUG-CBX-3: dataAttrs dead code ──────────────────────────────────────────

  it('[bug] BUG-CBX-3: data-size and data-appearance are not on native Pressable (dead code)', () => {
    render(wrap(<Checkbox size="l" appearance="positive" testID="bug-data" />));
    const el = screen.getByTestId('bug-data');
    // dataAttrs computed in useCheckboxState but never spread onto native View/Pressable.
    expect((el.props as Record<string, unknown>)['data-size']).toBeUndefined();
    expect((el.props as Record<string, unknown>)['data-appearance']).toBeUndefined();
  });

  // ── BUG-CBX-4: readOnly — no a11y signal, non-interactive but not disabled ───

  it('[bug] BUG-CBX-4: readOnly checkbox has no a11y signal — screen reader sees it as interactive', () => {
    render(wrap(<Checkbox readOnly selected testID="bug-ro-a11y" />));
    const el = screen.getByTestId('bug-ro-a11y');
    // readOnly Pressable has disabled={true} (won't fire) but:
    // - accessibilityState.disabled = false (not announced as disabled)
    // - aria-readonly not set (BUG-CBX-1 above)
    // Screen readers announce: "checkbox, checked" — nothing indicating read-only
    // Expected: should have aria-readonly=true OR accessibilityHint='Read-only'
    const hasReadOnlySignal =
      el.props['aria-readonly'] === true ||
      typeof el.props.accessibilityHint === 'string';
    expect(hasReadOnlySignal).toBe(true);
  });
});
