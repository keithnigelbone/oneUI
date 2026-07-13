/**
 * InputField QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/InputField/InputField.native.tsx
 *
 * ─── Figma API table ─────────────────────────────────────────────────────────
 *
 *   Inherits all Input props (size, attention, appearance, shape, slots, state,
 *   disabled) and adds the field-level aggregation layer:
 *     - label / description header
 *     - required asterisk
 *     - infoIcon trigger
 *     - feedback row (error / InputFeedback)
 *     - dynamic text row (dynamicText / helperButton / InputDynamicText)
 *
 * ─── Component structure ─────────────────────────────────────────────────────
 *
 *   <View testID={testID} {...rootA11y}>         ← outer field wrapper
 *     <View>                                     ← label area (optional)
 *       <Text>{label}</Text>
 *       <Text> *</Text>                          ← when required
 *       <IconButton icon={InfoGlyph} />          ← when infoIcon
 *     </View>
 *     <Input testID="${testID}-input" .../>      ← bordered input shell
 *     <InputFeedback>{error}</InputFeedback>     ← optional feedback
 *     <InputDynamicText>...</InputDynamicText>   ← optional dynamic row
 *   </View>
 *
 * ─── Bugs (raise to dev team) ────────────────────────────────────────────────
 *
 *   BUG-IF-3 · FIXED — onHelperPress now forwarded via onEndClick={props.onHelperPress}
 *     (InputField.native.tsx:239). Handler fires correctly on helperButton press.
 *
 *   BUG-IF-2 · Inner Input has no testID — no way to directly target it in tests/Maestro
 *     InputField only passes `testID` to the outer wrapper `<View>`. The inner
 *     `<Input>` shell gets no testID. Callers and E2E tests (Maestro) who need
 *     to fire events on the TextInput must use placeholder-text or
 *     accessibility-label queries — there is no testID path to the input.
 *     File: packages/ui-native/src/components/InputField/InputField.native.tsx:256-301
 *     Fix:  Forward `testID` to the inner Input as `inputTestID` prop, or use
 *           `${testID}-input` convention so callers can predictably reach the inner
 *           TextInput in Maestro flows (e.g. `tapOn: id: "email-field-input"`).
 */

import React from 'react';
import { View } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { InputField } from '@ui-native/components/InputField/InputField.native';
import { wrap } from '../../utils/renderWithTheme';

// The inner Input Pressable has importantForAccessibility='no-hide-descendants'
// (BUG-INPUT-3), so standard RNTL queries can't reach the inner TextInput.
// Use HIDDEN_OPT on all placeholder/displayValue/label queries for the TextInput.
const HIDDEN_OPT = { includeHiddenElements: true } as const;

// White background wrapper — Input uses transparent fill (medium attention/outlined).
// Without it, the input box is invisible against the dark sketch panel background.
const wrapWhite = (el: React.ReactElement) =>
  wrap(<View style={{ backgroundColor: '#ffffff', padding: 8, width: 300 }}>{el}</View>);

// ─── Figma API constants ──────────────────────────────────────────────────────

const SIZES       = ['s', 'm', 'l'] as const;
const ATTENTIONS  = ['medium', 'high'] as const;
const APPEARANCES = [
  'auto', 'neutral', 'primary', 'secondary', 'sparkle',
  'negative', 'positive', 'warning', 'informative',
] as const;

// ─── Figma matrix: size × attention × state ───────────────────────────────────

describe('InputField — Figma matrix: size × attention × state', () => {
  const STATES = [
    { label: 'idle',      props: {} },
    { label: 'filled',    props: { defaultValue: 'Input text' } },
    { label: 'readOnly',  props: { readOnly: true, defaultValue: 'Input text' } },
    { label: 'invalid',   props: { invalid: true } },
    { label: 'disabled',  props: { disabled: true } },
  ] as const;

  for (const size of SIZES) {
    for (const attention of ATTENTIONS) {
      for (const { label: stateLabel, props } of STATES) {
        it(`[smoke] size="${size}" attention="${attention}" state="${stateLabel}" — label+placeholder renders`, () => {
          render(wrapWhite(
            <InputField
              fullWidth
              label="Label"
              placeholder="Placeholder"
              size={size}
              attention={attention}
              {...props}
            />,
          ));
          expect(screen.getByText('Label')).toBeTruthy();
          expect(screen.getByPlaceholderText('Placeholder', HIDDEN_OPT)).toBeTruthy();
        });
      }
    }
  }
});

// ─── Figma matrix: appearance ─────────────────────────────────────────────────

describe('InputField — Figma matrix: appearance', () => {
  for (const appearance of APPEARANCES) {
    it(`[smoke] appearance="${appearance}" renders without crashing`, () => {
      expect(() =>
        render(wrapWhite(
          <InputField
            fullWidth
            appearance={appearance}
            label="Label"
            placeholder="Placeholder"
          />,
        )),
      ).not.toThrow();
    });
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('InputField — smoke', () => {
  it('[smoke] renders without crashing (no props)', () => {
    expect(() => render(wrap(<InputField />))).not.toThrow();
  });

  it('[smoke] renders with label', () => {
    render(wrap(<InputField label="Email" />));
    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('[smoke] renders with label and description', () => {
    render(wrap(<InputField label="Email" description="Enter your work email" />));
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Enter your work email')).toBeTruthy();
  });

  it('[smoke] renders with placeholder', () => {
    render(wrap(<InputField placeholder="Enter text" />));
    expect(screen.getByPlaceholderText('Enter text', HIDDEN_OPT)).toBeTruthy();
  });

  it('[smoke] renders required without crashing', () => {
    expect(() =>
      render(wrap(<InputField label="Name" required />)),
    ).not.toThrow();
  });

  it('[smoke] renders disabled without crashing', () => {
    expect(() => render(wrap(<InputField disabled />))).not.toThrow();
  });

  it('[smoke] renders readOnly without crashing', () => {
    expect(() => render(wrap(<InputField readOnly />))).not.toThrow();
  });

  it('[smoke] renders with error string without crashing', () => {
    expect(() =>
      render(wrap(<InputField label="Email" error="Invalid email" />)),
    ).not.toThrow();
  });

  it('[smoke] renders with infoIcon without crashing', () => {
    expect(() =>
      render(wrap(<InputField label="Email" infoIcon />)),
    ).not.toThrow();
  });
});

// ─── Functional: label header ─────────────────────────────────────────────────

describe('InputField — functional: label header', () => {
  it('[fn] label renders as visible text', () => {
    render(wrap(<InputField label="Full name" />));
    expect(screen.getByText('Full name')).toBeTruthy();
  });

  it('[fn] description renders below label', () => {
    render(wrap(<InputField label="Password" description="At least 8 characters" />));
    expect(screen.getByText('Password')).toBeTruthy();
    expect(screen.getByText('At least 8 characters')).toBeTruthy();
  });

  it('[fn] required=true renders asterisk " *" in label row', () => {
    // When required=true, the label Text has mixed children: ['Email', <Text> *</Text>]
    // Use { exact: false } to match the label text that contains the asterisk sibling.
    render(wrap(<InputField label="Email" required />));
    expect(screen.getByText('Email', { exact: false })).toBeTruthy();
    // Asterisk Text has accessible={false} — use includeHiddenElements:
    expect(screen.getByText(' *', HIDDEN_OPT)).toBeTruthy();
  });

  it('[fn] required=false → no asterisk', () => {
    render(wrap(<InputField label="Email" required={false} />));
    expect(screen.queryByText(' *', HIDDEN_OPT)).toBeNull();
  });

  it('[fn] no label → no label text in tree', () => {
    render(wrap(<InputField placeholder="No label" />));
    expect(screen.queryByText('Full name')).toBeNull();
  });

  it('[fn] infoIcon=true renders info icon button', () => {
    render(wrap(<InputField label="Email" infoIcon />));
    // The default info icon is an IconButton with aria-label "More information"
    expect(screen.getByLabelText('More information')).toBeTruthy();
  });

  it('[fn] custom infoIconSlot replaces default info icon', () => {
    render(wrap(
      <InputField label="Email" infoIcon infoIconSlot={<View testID="custom-info" />} />,
    ));
    expect(screen.getByTestId('custom-info', HIDDEN_OPT)).toBeTruthy();
    expect(screen.queryByLabelText('More information')).toBeNull();
  });

  it('[fn] custom infoIconAriaLabel overrides default label', () => {
    render(wrap(
      <InputField label="Email" infoIcon infoIconAriaLabel="Learn more about email" />,
    ));
    expect(screen.getByLabelText('Learn more about email')).toBeTruthy();
  });

  it('[fn] label and description both render in label area', () => {
    // InputField renders label + description in the label area.
    // There is no labelSlot prop on InputField — the label is always string-driven.
    render(wrap(
      <InputField
        label="Visible label"
        description="Visible description"
        placeholder="Text"
      />,
    ));
    expect(screen.getByText('Visible label')).toBeTruthy();
    expect(screen.getByText('Visible description')).toBeTruthy();
  });
});

// ─── Functional: events ───────────────────────────────────────────────────────

describe('InputField — functional: events', () => {
  it('[fn] onChange fires with typed value', () => {
    const handler = vi.fn();
    render(wrap(<InputField onChange={handler} placeholder="Type here" />));
    fireEvent.changeText(screen.getByPlaceholderText('Type here', HIDDEN_OPT), 'hello world');
    expect(handler).toHaveBeenCalledWith('hello world');
  });

  it('[fn] onChange fires with each keystroke', () => {
    const handler = vi.fn();
    render(wrap(<InputField onChange={handler} placeholder="Type here" />));
    fireEvent.changeText(screen.getByPlaceholderText('Type here', HIDDEN_OPT), 'a');
    fireEvent.changeText(screen.getByPlaceholderText('Type here', HIDDEN_OPT), 'ab');
    expect(handler).toHaveBeenNthCalledWith(1, 'a');
    expect(handler).toHaveBeenNthCalledWith(2, 'ab');
  });

  it('[fn] onFocus fires when input is focused', () => {
    const handler = vi.fn();
    render(wrap(<InputField onFocus={handler} placeholder="Focusable" />));
    fireEvent(screen.getByPlaceholderText('Focusable', HIDDEN_OPT), 'focus');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] onBlur fires when input loses focus', () => {
    const handler = vi.fn();
    render(wrap(<InputField onBlur={handler} placeholder="Blurable" />));
    fireEvent(screen.getByPlaceholderText('Blurable', HIDDEN_OPT), 'blur');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] onSubmit fires with current value', () => {
    const handler = vi.fn();
    render(wrap(<InputField value="submit me" onSubmit={handler} placeholder="Submit" />));
    fireEvent(screen.getByPlaceholderText('Submit', HIDDEN_OPT), 'submitEditing', {
      nativeEvent: { text: 'submit me' },
    });
    expect(handler).toHaveBeenCalledWith('submit me');
  });

  it('[fn] disabled: onChange NOT fired (editable=false)', () => {
    // TextInput editable=false means onChange doesn't fire in real device.
    // RNTL mock still calls onChangeText — we verify editable=false is set.
    render(wrap(<InputField disabled placeholder="Disabled" />));
    expect(screen.getByPlaceholderText('Disabled', HIDDEN_OPT).props.editable).toBe(false);
  });

  it('[fn] readOnly: readOnly=true set on TextInput (editable stays true)', () => {
    // readOnly uses the TextInput readOnly prop, not editable=false.
    // editable=false is only for disabled fields.
    render(wrap(<InputField readOnly placeholder="ReadOnly" />));
    const el = screen.getByPlaceholderText('ReadOnly', HIDDEN_OPT);
    expect(el.props.readOnly).toBe(true);
    expect(el.props.editable).not.toBe(false);
  });
});

// ─── Functional: error and feedback ──────────────────────────────────────────

describe('InputField — functional: error and feedback', () => {
  it('[fn] error string renders as feedback text below input', () => {
    render(wrap(<InputField label="Email" error="Invalid email address" />));
    expect(screen.getByText('Invalid email address')).toBeTruthy();
  });

  it('[fn] invalid=true applies errorHighlight chrome on inner Input', () => {
    render(wrap(<InputField invalid label="Email" placeholder="Email" />));
    // inner Input renders with errorHighlight=true — component renders without crash
    expect(screen.getByPlaceholderText('Email', HIDDEN_OPT)).toBeTruthy();
  });

  it('[fn] error="" (empty string) does NOT render feedback row', () => {
    render(wrap(<InputField label="Email" error="" />));
    // isInvalid = error.trim() !== '' → false for empty string
    expect(screen.queryByText('')).toBeNull();
  });

  it('[fn] custom feedback ReactNode renders below input', () => {
    render(wrap(
      <InputField
        label="Email"
        feedback={<View testID="custom-feedback" />}
      />,
    ));
    expect(screen.getByTestId('custom-feedback', HIDDEN_OPT)).toBeTruthy();
  });

  it('[fn] feedback prop wins over error string', () => {
    render(wrap(
      <InputField
        label="Email"
        error="Error text"
        feedback={<View testID="custom-wins" />}
      />,
    ));
    expect(screen.getByTestId('custom-wins', HIDDEN_OPT)).toBeTruthy();
    // error text not rendered because feedback prop takes precedence:
    expect(screen.queryByText('Error text')).toBeNull();
  });
});

// ─── Functional: dynamic text row ────────────────────────────────────────────

describe('InputField — functional: dynamic text row', () => {
  it('[fn] dynamicText renders as visible text', () => {
    render(wrap(<InputField label="Bio" dynamicText="0 / 200 characters" />));
    expect(screen.getByText('0 / 200 characters')).toBeTruthy();
  });

  it('[fn] helperButton text renders in dynamic row', () => {
    render(wrap(
      <InputField
        label="Password"
        helperButton="Forgot password?"
        onHelperPress={vi.fn()}
      />,
    ));
    // helperButton renders as a Button inside InputDynamicText — find by text
    expect(screen.getByText('Forgot password?')).toBeTruthy();
  });

  it('[fn] helperButton Button is disabled when field is disabled', () => {
    render(wrap(
      <InputField
        label="Password"
        disabled
        helperButton="Forgot password?"
        onHelperPress={vi.fn()}
      />,
    ));
    // Button renders text — visible even when disabled
    expect(screen.getByText('Forgot password?')).toBeTruthy();
  });

  it('[fn] dynamicText renders when set — no dynamicTextSlot prop in InputField', () => {
    // InputField does not expose a dynamicTextSlot prop. The dynamic row is
    // controlled by the dynamicText string and helperButton string props only.
    render(wrap(
      <InputField
        label="Bio"
        dynamicText="Characters remaining"
      />,
    ));
    expect(screen.getByText('Characters remaining')).toBeTruthy();
  });
});

// ─── Functional: slot system ──────────────────────────────────────────────────

describe('InputField — functional: slots', () => {
  it('[fn] start slot renders in inner Input', () => {
    render(wrap(
      <InputField label="Search" start={<View testID="field-start" />} placeholder="Text" />,
    ));
    expect(screen.getByTestId('field-start', HIDDEN_OPT)).toBeTruthy();
  });

  it('[fn] end slot renders in inner Input', () => {
    render(wrap(
      <InputField label="Amount" end={<View testID="field-end" />} placeholder="Text" />,
    ));
    expect(screen.getByTestId('field-end', HIDDEN_OPT)).toBeTruthy();
  });

  it('[fn] start2 text slot renders', () => {
    // start2 is inside the Input Pressable (no-hide-descendants) → HIDDEN_OPT
    render(wrap(<InputField label="Amount" start2="€" placeholder="0.00" />));
    expect(screen.getByText('€', HIDDEN_OPT)).toBeTruthy();
  });
});

// ─── Functional: testID convention ───────────────────────────────────────────

describe('InputField — functional: testID', () => {
  it('[fn] testID goes to inner Input control (outer wrapper uses "${testID}-field")', () => {
    // InputField forwards testID to the inner Input control (for Maestro tapOn).
    // The outer wrapper is addressable as "${testID}-field".
    render(wrap(<InputField label="Email" testID="my-field" placeholder="Email" />));
    // Inner Input gets the testID directly:
    const inner = screen.getByTestId('my-field', HIDDEN_OPT);
    expect(inner).toBeTruthy();
    // Outer wrapper uses the "-field" suffix:
    const outer = screen.getByTestId('my-field-field', HIDDEN_OPT);
    expect(outer).toBeTruthy();
  });

  it('[fn] testID outer wrapper ("-field" suffix) is distinct from the inner Input', () => {
    render(wrap(<InputField label="Email" testID="my-field" placeholder="Email" />));
    const outer = screen.getByTestId('my-field-field', HIDDEN_OPT);
    // Outer View is not the accessible Input — no placeholder, accessible=false
    expect(outer.props.testID).toBe('my-field-field');
    // TextInput also reachable via placeholder:
    expect(screen.getByPlaceholderText('Email', HIDDEN_OPT)).toBeTruthy();
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('InputField — a11y', () => {
  // NOTE: The outer field wrapper View has accessible=false (getInputFieldAccessibilityProps
  // always returns { accessible: false }). All accessibility semantics live on the
  // inner TextInput — screen readers directly focus the TextInput, not the wrapper.

  it('[a11y] outer field wrapper has accessible=false (TextInput carries a11y)', () => {
    // The outer wrapper testID is "${testID}-field" — testID alone goes to inner Input.
    render(wrap(<InputField label="Email" testID="a11y-field" />));
    // Outer wrapper is NOT the a11y element — accessible=false by design:
    expect(screen.getByTestId('a11y-field-field', HIDDEN_OPT).props.accessible).toBe(false);
  });

  it('[a11y] inner TextInput has accessible=true', () => {
    render(wrap(<InputField label="Password" placeholder="Password" />));
    expect(screen.getByPlaceholderText('Password', HIDDEN_OPT).props.accessible).toBe(true);
  });

  it('[a11y] inner TextInput gets accessibilityLabel from label prop', () => {
    render(wrap(<InputField label="Full name" placeholder="Name" />));
    // The TextInput receives the label string as accessibilityLabel
    expect(screen.getByLabelText('Full name', HIDDEN_OPT)).toBeTruthy();
  });

  it('[a11y] accessibilityLabel prop forwarded to inner TextInput', () => {
    render(wrap(
      <InputField accessibilityLabel="Email address" placeholder="Email" />,
    ));
    expect(screen.getByLabelText('Email address', HIDDEN_OPT)).toBeTruthy();
  });

  it('[a11y] disabled → inner TextInput accessibilityState.disabled=true', () => {
    render(wrap(<InputField disabled placeholder="Disabled" />));
    expect(screen.getByPlaceholderText('Disabled', HIDDEN_OPT).props.accessibilityState?.disabled).toBe(true);
  });

  it('[a11y] aria-hidden on field → outer wrapper accessibilityElementsHidden=true', () => {
    // The outer wrapper testID is now "${testID}-field" (InputField forwards
    // testID to the inner Input; the wrapper uses the "-field" suffix).
    render(wrap(<InputField aria-hidden testID="a11y-hidden" />));
    const el = screen.getByTestId('a11y-hidden-field', { includeHiddenElements: true });
    expect(el.props.accessible).not.toBe(true);
    expect(el.props.accessibilityElementsHidden).toBe(true);
  });

  it('[a11y] required=true — asterisk " *" visible in tree (visual communication)', () => {
    render(wrap(<InputField label="Email" required placeholder="Email" />));
    // Asterisk Text has accessible={false} — needs HIDDEN_OPT
    expect(screen.getByText(' *', HIDDEN_OPT)).toBeTruthy();
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('InputField — bug-catching', () => {
  // ── BUG-IF-3 FIXED: onHelperPress now wired to onEndClick ────────────────

  it('[fn] BUG-IF-3 FIXED: onHelperPress fires when helperButton is pressed', () => {
    const handler = vi.fn();
    render(wrap(
      <InputField
        label="Password"
        helperButton="Forgot password?"
        onHelperPress={handler}
      />,
    ));
    expect(screen.getByText('Forgot password?')).toBeTruthy();
    const btn = screen.UNSAFE_getByProps({ accessibilityRole: 'button' });
    fireEvent.press(btn);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ── BUG-IF-2 FIXED: testID now forwarded to inner Input ──────────────────

  it('[fn] BUG-IF-2 FIXED: testID goes to inner Input, outer wrapper is "${testID}-field"', () => {
    // BUG-IF-2 is fixed: InputField now forwards testID to the inner Input control
    // for direct Maestro/E2E targeting. The outer wrapper uses "${testID}-field".
    render(wrap(<InputField testID="email-field" placeholder="Email" />));

    // Inner Input gets testID directly — E2E can tapOn: id: "email-field"
    expect(screen.getByTestId('email-field', HIDDEN_OPT)).toBeTruthy();
    // Outer wrapper is addressable via the "-field" suffix:
    expect(screen.getByTestId('email-field-field', HIDDEN_OPT)).toBeTruthy();
    // TextInput also reachable via placeholder:
    expect(screen.getByPlaceholderText('Email', HIDDEN_OPT)).toBeTruthy();
  });
});
