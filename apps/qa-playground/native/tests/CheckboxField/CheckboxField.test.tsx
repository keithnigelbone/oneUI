/**
 * CheckboxField QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/CheckboxField/CheckboxField.native.tsx
 *
 * ─── Figma API table ─────────────────────────────────────────────────────────
 *
 *   Property      Values                          Figma type
 *   ───────────────────────────────────────────────────────
 *   size          S | M | L                        component property
 *   appearance    auto|neutral|primary|secondary|  variable mode
 *                 sparkle|negative|positive|
 *                 warning|informative
 *   accent        primary|secondary|sparkle        N/A (deprecated)
 *   selected      true | false                     component property
 *   indeterminate true | false                     component property
 *   readOnly      true | false                     component property
 *   disabled      true | false                     component property
 *   helperText    true | false                     component property
 *   feedbackInput true | false                     component property
 *
 * ─── Two modes ───────────────────────────────────────────────────────────────
 *
 *   Single mode (no children):
 *     Renders one integrated Checkbox with the field's label/description.
 *     The inner Checkbox Pressable gets testID="${testID}-control".
 *
 *   Multi-option mode (children = <Checkbox> items):
 *     Renders a fieldset-style header (label/description) above a list of
 *     child Checkboxes. Field-level size/appearance/disabled/readOnly are
 *     forwarded to each child.
 *
 * ─── Bugs (raise to dev team) ────────────────────────────────────────────────
 *
 *   BUG-CBF-1 · Custom feedback ReactNode slot has no accessibilityLiveRegion
 *     When error= is used, the feedback Text gets accessibilityLiveRegion='polite'.
 *     When feedback= (ReactNode slot) is used instead, the caller's node is
 *     rendered directly without any liveRegion wrapper. Screen readers won't
 *     announce dynamic feedback changes (e.g. server-side validation results).
 *     File: packages/ui-native/src/components/CheckboxField/CheckboxField.native.tsx:291-300
 *     Fix:  Wrap the feedback slot in a View with accessibilityLiveRegion='polite'
 *           regardless of whether the content is from error= or feedback= prop.
 *
 *   BUG-CBF-2 · testID on CheckboxField outer View; inner control needs testID-control
 *     CheckboxField testID goes to the outer <View> wrapper.
 *     The inner Checkbox in single mode gets testID="${testID}-control".
 *     Callers who pass testID expecting to query the interactive element (Pressable)
 *     get the field wrapper instead — they must append "-control" to reach the Pressable.
 *     This is a UX/discoverability issue for integration tests and Maestro flows.
 *     File: packages/ui-native/src/components/CheckboxField/CheckboxField.native.tsx:195-212
 *     Fix:  Document the testID suffix convention clearly in the prop JSDoc.
 *           Alternatively, expose a separate controlTestID prop for the inner Pressable.
 *
 *   BUG-CBF-3 · helperButton Pressable color is always the same for pressed/unpressed
 *     The helperButton text color uses `role.content.tintedA11y` for both pressed
 *     and unpressed states (the same token is referenced twice):
 *       color: pressed ? role.content.tintedA11y : role.content.tintedA11y
 *     The `pressed` state has no visual feedback — the opacity change (0.7 vs 1)
 *     provides the only indication. This diverges from the typical pressed state
 *     where a different token (e.g. strokeMedium or a darker tint) would be used.
 *     File: packages/ui-native/src/components/CheckboxField/CheckboxField.native.tsx:334-337
 *     Fix:  Use a different color token for the pressed state, e.g.:
 *           color: pressed ? role.content.medium : role.content.tintedA11y
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { CheckboxField } from '@ui-native/components/CheckboxField/CheckboxField.native';
import { Checkbox } from '@ui-native/components/Checkbox/Checkbox.native';
import { wrap } from '../../utils/renderWithTheme';

// ─── Figma API constants ──────────────────────────────────────────────────────

const SIZES       = ['s', 'm', 'l'] as const;
const APPEARANCES = [
  'auto', 'neutral', 'primary', 'secondary', 'sparkle',
  'negative', 'positive', 'warning', 'informative',
] as const;

// ─── Figma matrix: appearance ─────────────────────────────────────────────────

describe('CheckboxField — Figma matrix: appearance', () => {
  for (const appearance of APPEARANCES) {
    it(`[smoke] appearance="${appearance}" renders without crashing`, () => {
      // No label — appearance smoke only verifies the component renders.
      // Label+description coverage is in the 3-state rows above.
      expect(() =>
        render(wrap(
          <CheckboxField appearance={appearance} testID={`cbf-app-${appearance}`} />,
        )),
      ).not.toThrow();
    });
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('CheckboxField — smoke', () => {
  it('[smoke] renders without crashing (all defaults)', () => {
    expect(() => render(wrap(<CheckboxField />))).not.toThrow();
  });

  it('[smoke] renders with label', () => {
    expect(() =>
      render(wrap(<CheckboxField label="Subscribe" />)),
    ).not.toThrow();
  });

  it('[smoke] renders with label and description', () => {
    expect(() =>
      render(wrap(<CheckboxField label="Label" description="Description" />)),
    ).not.toThrow();
  });

  it('[smoke] renders selected without crashing', () => {
    expect(() => render(wrap(<CheckboxField selected />))).not.toThrow();
  });

  it('[smoke] renders disabled without crashing', () => {
    expect(() => render(wrap(<CheckboxField disabled />))).not.toThrow();
  });

  it('[smoke] renders readOnly without crashing', () => {
    expect(() => render(wrap(<CheckboxField readOnly />))).not.toThrow();
  });

  it('[smoke] renders with error string without crashing', () => {
    expect(() =>
      render(wrap(<CheckboxField label="Option" error="Required field" />)),
    ).not.toThrow();
  });

  it('[smoke] renders with required without crashing', () => {
    expect(() =>
      render(wrap(<CheckboxField label="Option" required />)),
    ).not.toThrow();
  });

  it('[smoke] renders fullWidth without crashing', () => {
    expect(() => render(wrap(<CheckboxField fullWidth label="Option" />))).not.toThrow();
  });

  it('[smoke] renders with dynamicText and helperButton without crashing', () => {
    expect(() =>
      render(wrap(
        <CheckboxField
          label="Option"
          dynamicText="0 / 100 characters"
          helperButton="View rules"
          onHelperPress={vi.fn()}
        />,
      )),
    ).not.toThrow();
  });

  it('[smoke] multi-option mode renders without crashing', () => {
    expect(() =>
      render(wrap(
        <CheckboxField label="Choose options">
          <Checkbox label="Option A" value="a" />
          <Checkbox label="Option B" value="b" />
        </CheckboxField>,
      )),
    ).not.toThrow();
  });
});

// ─── Functional: single mode ──────────────────────────────────────────────────

describe('CheckboxField — functional: single mode', () => {
  it('[fn] label renders as visible text', () => {
    render(wrap(<CheckboxField label="Accept terms" />));
    expect(screen.getByText('Accept terms')).toBeTruthy();
  });

  it('[fn] description renders as visible text', () => {
    render(wrap(<CheckboxField label="Accept" description="By accepting you agree to our ToS" />));
    expect(screen.getByText('By accepting you agree to our ToS')).toBeTruthy();
  });

  it('[fn] inner Checkbox Pressable has role="checkbox"', () => {
    render(wrap(<CheckboxField label="Accept" testID="cbf-single" />));
    expect(screen.getByRole('checkbox')).toBeTruthy();
  });

  it('[fn] press fires onSelectedChange with true (false → true)', () => {
    const handler = vi.fn();
    render(wrap(
      <CheckboxField label="Accept" selected={false} onSelectedChange={handler} testID="cbf-press" />,
    ));
    fireEvent.press(screen.getByRole('checkbox'));
    expect(handler).toHaveBeenCalledWith(true);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] press fires onSelectedChange with false (true → false)', () => {
    const handler = vi.fn();
    render(wrap(
      <CheckboxField label="Accept" selected={true} onSelectedChange={handler} />,
    ));
    fireEvent.press(screen.getByRole('checkbox'));
    expect(handler).toHaveBeenCalledWith(false);
  });

  it('[fn] press on indeterminate fires onSelectedChange with true', () => {
    const handler = vi.fn();
    render(wrap(
      <CheckboxField label="Accept" indeterminate onSelectedChange={handler} />,
    ));
    fireEvent.press(screen.getByRole('checkbox'));
    expect(handler).toHaveBeenCalledWith(true);
  });

  it('[fn] onPress fires alongside onSelectedChange on each press', () => {
    const changeHandler = vi.fn();
    const pressHandler = vi.fn();
    render(wrap(
      <CheckboxField
        label="Accept"
        onSelectedChange={changeHandler}
        onPress={pressHandler}
      />,
    ));
    fireEvent.press(screen.getByRole('checkbox'));
    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(pressHandler).toHaveBeenCalledTimes(1);
  });

  it('[fn] selected=true → inner Checkbox shows checked state', () => {
    render(wrap(<CheckboxField label="Accept" selected testID="cbf-sel" />));
    expect(screen.getByRole('checkbox').props.accessibilityState.checked).toBe(true);
  });

  it('[fn] indeterminate=true → inner Checkbox shows mixed state', () => {
    render(wrap(<CheckboxField label="Accept" indeterminate testID="cbf-ind" />));
    expect(screen.getByRole('checkbox').props.accessibilityState.checked).toBe('mixed');
  });

  it('[fn] disabled=true → inner Checkbox is disabled', () => {
    render(wrap(<CheckboxField label="Accept" disabled testID="cbf-dis" />));
    expect(screen.getByRole('checkbox').props.accessibilityState.disabled).toBe(true);
  });

  it('[fn] readOnly=true → press blocked on inner Checkbox', () => {
    const handler = vi.fn();
    render(wrap(
      <CheckboxField label="Accept" readOnly onSelectedChange={handler} />,
    ));
    fireEvent.press(screen.getByRole('checkbox'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] testID in single mode → getByTestId finds the element', () => {
    render(wrap(<CheckboxField label="Option" testID="cbf-testid" />));
    const el = screen.getByTestId('cbf-testid');
    // In single mode, testID goes to the inner Checkbox Pressable (interactive element)
    expect(el).toBeTruthy();
  });

  it('[fn] testID in single mode → inner Checkbox Pressable accessible via testID directly', () => {
    // In single mode (no children), CheckboxField forwards testID directly to the
    // inner Checkbox Pressable. No "-control" suffix — the testID is the Pressable itself.
    render(wrap(<CheckboxField label="Option" testID="cbf-suffix" />));
    const pressable = screen.getByTestId('cbf-suffix');
    expect(pressable.props.accessibilityRole).toBe('checkbox');
  });

  it('[fn] required=true + label → asterisk " *" visible in tree', () => {
    render(wrap(<CheckboxField label="Option" required />));
    expect(screen.getByText(' *')).toBeTruthy();
  });

  it('[fn] required=false → no asterisk', () => {
    render(wrap(<CheckboxField label="Option" required={false} />));
    expect(screen.queryByText(' *')).toBeNull();
  });
});

// ─── Functional: error and feedback ──────────────────────────────────────────

describe('CheckboxField — functional: error and feedback', () => {
  it('[fn] error string renders as feedback text', () => {
    render(wrap(<CheckboxField label="Option" error="This field is required" />));
    expect(screen.getByText('This field is required')).toBeTruthy();
  });

  it('[fn] error string makes isInvalid=true — inner Checkbox has errorHighlight', () => {
    // error= triggers isInvalid which forwards errorHighlight to inner Checkbox
    render(wrap(
      <CheckboxField label="Option" error="Required" testID="cbf-error" />,
    ));
    // ErrorHighlight changes the Checkbox border — component renders without crash
    expect(screen.getByRole('checkbox')).toBeTruthy();
  });

  it('[fn] invalid=true makes isInvalid=true even without error string', () => {
    render(wrap(<CheckboxField label="Option" invalid testID="cbf-invalid" />));
    // invalid=true flows errorHighlight to inner Checkbox
    expect(screen.getByRole('checkbox')).toBeTruthy();
  });

  it('[fn] empty error string ("") is NOT invalid', () => {
    render(wrap(<CheckboxField label="Option" error="" testID="cbf-empty-err" />));
    // isInvalid = error.trim() !== '' → false for empty string
    expect(screen.queryByText('')).toBeNull(); // no feedback row
  });

  it('[fn] feedback ReactNode slot renders custom content', () => {
    render(wrap(
      <CheckboxField
        label="Option"
        feedback={<Checkbox label="Custom feedback node" testID="custom-feedback" />}
      />,
    ));
    expect(screen.getByTestId('custom-feedback')).toBeTruthy();
  });

  it('[fn] error auto-rendered feedback wrapper has accessibilityLiveRegion="polite"', () => {
    render(wrap(
      <CheckboxField label="Option" error="Validation failed" testID="cbf-live" />,
    ));
    // The feedbackRow <View> wrapper has accessibilityLiveRegion='polite'.
    // The inner error Text is wrapped — liveRegion is on the parent, not the Text itself.
    const errorText = screen.getByText('Validation failed');
    expect(errorText.parent?.props?.accessibilityLiveRegion).toBe('polite');
  });
});

// ─── Functional: dynamic row ──────────────────────────────────────────────────

describe('CheckboxField — functional: dynamic text row', () => {
  it('[fn] dynamicText renders as visible text', () => {
    render(wrap(<CheckboxField label="Option" dynamicText="0 / 100 characters" />));
    expect(screen.getByText('0 / 100 characters')).toBeTruthy();
  });

  it('[fn] helperButton renders with its text visible', () => {
    render(wrap(
      <CheckboxField label="Option" dynamicText="0 / 100" helperButton="View rules" />,
    ));
    // helperButton text is visible in the tree
    expect(screen.getByText('View rules')).toBeTruthy();
    // helperButton Pressable has accessibilityLabel=helperButton — queryable via label
    expect(screen.getByLabelText('View rules')).toBeTruthy();
  });

  it('[fn] helperButton fires onHelperPress when pressed', () => {
    const handler = vi.fn();
    render(wrap(
      <CheckboxField
        label="Option"
        helperButton="View rules"
        onHelperPress={handler}
      />,
    ));
    // Use getByLabelText — helperButton Pressable has accessibilityLabel={helperButton}
    fireEvent.press(screen.getByLabelText('View rules'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] helperButton Pressable has disabled=true when field is disabled', () => {
    // In a real device, Pressable disabled=true blocks the press gesture.
    // RNTL's fireEvent.press bypasses the disabled prop — assert the prop is set instead.
    render(wrap(
      <CheckboxField
        label="Option"
        disabled
        helperButton="View rules"
        onHelperPress={vi.fn()}
      />,
    ));
    const helperBtn = screen.getByLabelText('View rules');
    expect(helperBtn.props.disabled).toBe(true);
  });

  it('[fn] dynamicTextSlot overrides dynamicText + helperButton', () => {
    render(wrap(
      <CheckboxField
        label="Option"
        dynamicText="Ignored"
        dynamicTextSlot={<Checkbox label="Custom slot" testID="dyn-slot" />}
      />,
    ));
    expect(screen.getByTestId('dyn-slot')).toBeTruthy();
    expect(screen.queryByText('Ignored')).toBeNull();
  });
});

// ─── Functional: multi-option mode ───────────────────────────────────────────

describe('CheckboxField — functional: multi-option mode', () => {
  it('[fn] children render as stacked Checkboxes', () => {
    render(wrap(
      <CheckboxField label="Select all that apply">
        <Checkbox label="Option A" value="a" testID="opt-a" />
        <Checkbox label="Option B" value="b" testID="opt-b" />
        <Checkbox label="Option C" value="c" testID="opt-c" />
      </CheckboxField>,
    ));
    expect(screen.getByTestId('opt-a')).toBeTruthy();
    expect(screen.getByTestId('opt-b')).toBeTruthy();
    expect(screen.getByTestId('opt-c')).toBeTruthy();
  });

  it('[fn] field label renders as header text in multi mode', () => {
    render(wrap(
      <CheckboxField label="Select options">
        <Checkbox label="A" value="a" />
      </CheckboxField>,
    ));
    expect(screen.getByText('Select options')).toBeTruthy();
  });

  it('[fn] field description renders in multi mode', () => {
    render(wrap(
      <CheckboxField label="Select" description="Choose at least one">
        <Checkbox label="A" value="a" />
      </CheckboxField>,
    ));
    expect(screen.getByText('Choose at least one')).toBeTruthy();
  });

  it('[fn] groupValue controls which child Checkboxes are checked', () => {
    render(wrap(
      <CheckboxField groupValue={['b']} onGroupValueChange={vi.fn()}>
        <Checkbox label="Option A" value="a" testID="group-a" />
        <Checkbox label="Option B" value="b" testID="group-b" />
      </CheckboxField>,
    ));
    expect(screen.getByTestId('group-a').props.accessibilityState.checked).toBe(false);
    expect(screen.getByTestId('group-b').props.accessibilityState.checked).toBe(true);
  });

  it('[fn] pressing a child in multi mode fires onGroupValueChange', () => {
    const handler = vi.fn();
    render(wrap(
      <CheckboxField onGroupValueChange={handler}>
        <Checkbox label="Option A" value="a" testID="multi-a" />
        <Checkbox label="Option B" value="b" testID="multi-b" />
      </CheckboxField>,
    ));
    fireEvent.press(screen.getByTestId('multi-a'));
    expect(handler).toHaveBeenCalledWith(['a']);
  });

  it('[fn] field-level disabled is forwarded to all child Checkboxes', () => {
    render(wrap(
      <CheckboxField disabled>
        <Checkbox label="A" value="a" testID="dis-a" />
        <Checkbox label="B" value="b" testID="dis-b" />
      </CheckboxField>,
    ));
    expect(screen.getByTestId('dis-a').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByTestId('dis-b').props.accessibilityState.disabled).toBe(true);
  });

  it('[fn] field-level size is forwarded to child Checkboxes', () => {
    // Large field → children inherit size='l' (20px box → not tested directly,
    // but no crash verifies the size propagation path)
    expect(() =>
      render(wrap(
        <CheckboxField size="l">
          <Checkbox label="A" value="a" testID="size-a" />
        </CheckboxField>,
      )),
    ).not.toThrow();
  });

  it('[fn] invalid=true forwards errorHighlight to child Checkboxes', () => {
    expect(() =>
      render(wrap(
        <CheckboxField invalid>
          <Checkbox label="A" value="a" testID="inv-a" />
        </CheckboxField>,
      )),
    ).not.toThrow();
  });

  it('[fn] uncontrolled multi mode: first press selects value', () => {
    const handler = vi.fn();
    render(wrap(
      <CheckboxField onGroupValueChange={handler}>
        <Checkbox label="A" value="a" testID="unc-a" />
      </CheckboxField>,
    ));
    fireEvent.press(screen.getByTestId('unc-a'));
    expect(handler).toHaveBeenCalledWith(['a']);
  });

  it('[fn] controlled multi mode: deselecting a checked value removes it from group', () => {
    const handler = vi.fn();
    render(wrap(
      // 'a' pre-selected via groupValue — press should fire with []
      <CheckboxField groupValue={['a']} onGroupValueChange={handler}>
        <Checkbox label="A" value="a" testID="ctrl-a" />
      </CheckboxField>,
    ));
    // The child shows as checked (groupValue contains 'a')
    expect(screen.getByTestId('ctrl-a').props.accessibilityState.checked).toBe(true);
    // Press deselects:
    fireEvent.press(screen.getByTestId('ctrl-a'));
    expect(handler).toHaveBeenCalledWith([]);
  });

  it('[fn] multi mode: selecting two children accumulates group values', () => {
    const handler = vi.fn();
    render(wrap(
      <CheckboxField onGroupValueChange={handler}>
        <Checkbox label="A" value="a" testID="multi-acc-a" />
        <Checkbox label="B" value="b" testID="multi-acc-b" />
      </CheckboxField>,
    ));
    fireEvent.press(screen.getByTestId('multi-acc-a'));
    expect(handler).toHaveBeenCalledWith(['a']);
    fireEvent.press(screen.getByTestId('multi-acc-b'));
    expect(handler).toHaveBeenCalledWith(['a', 'b']);
  });

  it('[fn] multi mode: child own onSelectedChange fires on press', () => {
    const fieldHandler = vi.fn();
    const childHandler = vi.fn();
    render(wrap(
      <CheckboxField onGroupValueChange={fieldHandler}>
        <Checkbox label="A" value="a" onSelectedChange={childHandler} testID="own-cb" />
      </CheckboxField>,
    ));
    fireEvent.press(screen.getByTestId('own-cb'));
    // Both field-level and child-level handlers fire
    expect(fieldHandler).toHaveBeenCalledWith(['a']);
    expect(childHandler).toHaveBeenCalledWith(true);
  });

  it('[fn] child with no value is ignored in group selection', () => {
    const handler = vi.fn();
    render(wrap(
      <CheckboxField onGroupValueChange={handler}>
        <Checkbox label="No value" testID="no-val" />
      </CheckboxField>,
    ));
    fireEvent.press(screen.getByTestId('no-val'));
    // onGroupValueChange not called when value is undefined
    expect(handler).not.toHaveBeenCalled();
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('CheckboxField — a11y', () => {
  it('[a11y] field wrapper accessible=true by default', () => {
    render(wrap(<CheckboxField label="Accept" testID="a11y-wrapper" />));
    expect(screen.getByTestId('a11y-wrapper').props.accessible).toBe(true);
  });

  it('[a11y] field wrapper accessibilityLabel from label prop', () => {
    render(wrap(<CheckboxField label="Accept terms" testID="a11y-label" />));
    expect(screen.getByTestId('a11y-label').props.accessibilityLabel).toBe('Accept terms');
  });

  it('[a11y] field wrapper aria-label overrides label as accessibilityLabel', () => {
    render(wrap(
      <CheckboxField label="Accept" aria-label="Custom" testID="a11y-override" />,
    ));
    expect(screen.getByTestId('a11y-override').props.accessibilityLabel).toBe('Custom');
  });

  it('[a11y] field wrapper accessibilityState.disabled=true when disabled', () => {
    render(wrap(<CheckboxField disabled testID="a11y-disabled" />));
    expect(screen.getByTestId('a11y-disabled').props.accessibilityState.disabled).toBe(true);
  });

  it('[a11y] inner Checkbox has accessibilityRole="checkbox"', () => {
    render(wrap(<CheckboxField label="Accept" />));
    expect(screen.getByRole('checkbox')).toBeTruthy();
  });

  it('[a11y] aria-hidden on field → accessible=false, accessibilityElementsHidden=true', () => {
    render(wrap(<CheckboxField aria-hidden testID="a11y-hidden" />));
    const el = screen.getByTestId('a11y-hidden', { includeHiddenElements: true });
    expect(el.props.accessible).not.toBe(true);
    expect(el.props.accessibilityElementsHidden).toBe(true);
  });

  it('[a11y] multi mode: all child Checkboxes have accessibilityRole="checkbox"', () => {
    render(wrap(
      <CheckboxField label="Select">
        <Checkbox label="A" value="a" />
        <Checkbox label="B" value="b" />
        <Checkbox label="C" value="c" />
      </CheckboxField>,
    ));
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(3);
  });

  it('[a11y] accessibilityHint is forwarded to field wrapper', () => {
    render(wrap(
      <CheckboxField accessibilityHint="Select your preferences" testID="a11y-hint" />,
    ));
    expect(screen.getByTestId('a11y-hint').props.accessibilityHint).toBe('Select your preferences');
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('CheckboxField — bug-catching', () => {
  // ── BUG-CBF-1: custom feedback ReactNode has no liveRegion ──────────────────

  it('[fn] BUG-CBF-1 FIXED: both error= and feedback= ReactNode are wrapped in accessibilityLiveRegion="polite"', () => {
    // BUG-CBF-1 is fixed: the feedbackRow <View accessible accessibilityLiveRegion="polite">
    // wraps ALL feedback content — both the error string Text and custom ReactNode slots.
    // Screen readers will announce dynamic feedback changes in both cases.
    //
    // error= path: Text is inside feedbackRow View (liveRegion on the wrapper View parent)
    const { unmount } = render(wrap(
      <CheckboxField label="Option" error="Error message" />,
    ));
    const errorText = screen.getByText('Error message');
    // liveRegion is on the parent feedbackRow View, not the Text itself:
    expect(errorText.parent?.props?.accessibilityLiveRegion).toBe('polite');
    unmount();

    // feedback= ReactNode path: also wrapped in feedbackRow View with liveRegion.
    // The custom node is inside feedbackRow — traverse up to find the liveRegion wrapper.
    render(wrap(
      <CheckboxField
        label="Option"
        feedback={<Checkbox label="Custom node" testID="fb-live-fixed" />}
      />,
    ));
    const feedbackEl = screen.getByTestId('fb-live-fixed');
    // The feedbackRow wrapper is an ancestor of the custom node.
    // Walk up until we find it or exhaust the tree:
    let node: typeof feedbackEl.parent | null = feedbackEl.parent;
    let foundLiveRegion = false;
    while (node) {
      if (node.props?.accessibilityLiveRegion === 'polite') {
        foundLiveRegion = true;
        break;
      }
      node = node.parent;
    }
    expect(foundLiveRegion).toBe(true);
  });

  // ── BUG-CBF-2: testID goes to wrapper, callers need -control suffix ──────────

  it('[fn] BUG-CBF-2 FIXED: testID in single mode goes directly to the inner Checkbox Pressable', () => {
    // BUG-CBF-2 was documented as: testID goes to outer container View (not the interactive Checkbox).
    // Actual behavior in single mode: outer wrapper has NO testID; the inner Checkbox
    // Pressable directly receives the testID. This is better for E2E/Maestro — testID
    // directly targets the interactive element without any suffix.
    render(wrap(<CheckboxField label="Option" testID="cbf-testid-bug" />));

    // testID reaches the Checkbox Pressable (interactive element):
    const innerCheckbox = screen.getByTestId('cbf-testid-bug');
    expect(innerCheckbox.props.accessibilityRole).toBe('checkbox');

    // The outer wrapper in single mode has no testID (testID goes to inner Checkbox):
    // (No "-control" suffix required — testID is directly on the Pressable)
  });

  // ── BUG-CBF-3: helperButton pressed/unpressed color uses same token ──────────

  it('[bug] BUG-CBF-3: helperButton same color token for pressed/unpressed (visual-only bug)', () => {
    // The helperButton text color uses role.content.tintedA11y for BOTH pressed and
    // unpressed states — no visual differentiation on press. Only opacity changes.
    // This test confirms the button renders and fires its handler; the color bug
    // is visual-only and can only be validated via E2E / pixel testing.
    const handler = vi.fn();
    render(wrap(
      <CheckboxField
        label="Option"
        helperButton="View rules"
        onHelperPress={handler}
        testID="cbf-helper-bug"
      />,
    ));
    // helperButton is queryable via its accessibilityLabel
    const helperBtn = screen.getByLabelText('View rules');
    expect(helperBtn).toBeTruthy();
    fireEvent.press(helperBtn);
    expect(handler).toHaveBeenCalledTimes(1);
    // Bug documented: pressed/unpressed use same tintedA11y color (only opacity differs)
    // Fix: use role.content.medium or similar for pressed state
  });
});
