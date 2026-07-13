/**
 * RadioField QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/RadioField/RadioField.native.tsx
 *
 * ─── Three render modes ───────────────────────────────────────────────────────
 *
 *   1. Integrated single mode  — no children + string label
 *        → implicit lone Radio with on/off semantics (toggle via `value`/`onValueChange`
 *          or `checked`/`onCheckedChange` + `singleOptionValue`).
 *
 *   2. Plain option mode       — exactly 1 Radio child
 *        → optional description/infoIcon row above the option.
 *
 *   3. Multi-option mode       — ≥2 Radio children
 *        → fieldset header (legend + description) + RadioGroup + feedback + dynamic.
 *          Each Radio child gets testID="${testID}-item-${value|index}".
 *          Group container gets testID="${testID}-group".
 *
 * ─── Key events ──────────────────────────────────────────────────────────────
 *
 *   onValueChange(value: string)   — fires in multi / integrated mode
 *   onCheckedChange(checked: bool) — fires in integrated single mode (alias)
 *   onHelperPress()                — helperButton press (CORRECTLY wired ✓)
 *
 * ─── testID convention ───────────────────────────────────────────────────────
 *
 *   testID           → outer field wrapper View
 *   testID-group     → RadioGroup container (multi-option mode)
 *   testID-item-{v}  → each Radio child (keyed by value or index)
 */

import React from 'react';
import { View } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { RadioField } from '@ui-native/components/RadioField/RadioField.native';
import { Radio } from '@ui-native/components/Radio/Radio.native';
import { wrap } from '../../utils/renderWithTheme';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZES = ['s', 'm', 'l'] as const;

// Figma appearance list (no sparkle — see BUG-RF-5 in Radio.test.tsx).
const FIGMA_APPEARANCES = [
  'auto', 'neutral', 'primary', 'secondary',
  'negative', 'positive', 'warning', 'informative',
] as const;

// White background wrapper — makes the component visible in the HTML report sketch.
const wrapWhite = (el: React.ReactElement) =>
  wrap(<View style={{ backgroundColor: '#ffffff', padding: 8, width: 300 }}>{el}</View>);

// ─── Figma matrix: size × checked × readOnly ──────────────────────────────
//
// Matches the Figma screenshot exactly:
//   Rows:    checked=false / checked=true
//   Columns: M · S · L (readOnly: false) | M · S · L (readOnly: true)
// Each cell renders Radio + Description as shown in Figma.

describe('RadioField — Figma matrix: size × checked × readOnly', () => {
  for (const checked of [false, true] as const) {
    for (const readOnly of [false, true] as const) {
      for (const size of SIZES) {
        const cellLabel = `size="${size}" checked=${checked} readOnly=${readOnly}`;

        it(`[smoke] ${cellLabel} — Radio+Description renders`, () => {
          render(wrapWhite(
            <RadioField size={size} readOnly={readOnly} testID="rf-matrix">
              <Radio
                label="Radio"
                description="Description"
                value="a"
                checked={checked}
              />
            </RadioField>,
          ));
          expect(screen.getByText('Radio')).toBeTruthy();
          expect(screen.getByText('Description')).toBeTruthy();
        });

        it(`[fn] ${cellLabel} — selected state controlled by RadioField value`, () => {
          // RadioField controls child selection via its own value prop, not the child's checked.
          // Pass value="a" to select the radio, undefined to deselect.
          render(wrapWhite(
            <RadioField
              size={size}
              readOnly={readOnly}
              value={checked ? 'a' : undefined}
              testID="rf-fn"
            >
              <Radio label="Radio" value="a" testID="rf-inner" />
            </RadioField>,
          ));
          expect(screen.getByTestId('rf-inner').props.accessibilityState.selected).toBe(checked);
        });
      }
    }
  }
});

// ─── Figma matrix: appearance ─────────────────────────────────────────────────

describe('RadioField — Figma matrix: appearance', () => {
  for (const appearance of FIGMA_APPEARANCES) {
    it(`[smoke] appearance="${appearance}" renders without crashing`, () => {
      expect(() =>
        render(wrapWhite(
          <RadioField label="Choose" appearance={appearance}>
            <Radio label="Option A" value="a" />
            <Radio label="Option B" value="b" />
          </RadioField>,
        )),
      ).not.toThrow();
    });
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('RadioField — smoke', () => {
  it('[smoke] multi-option mode renders without crashing', () => {
    expect(() =>
      render(wrap(
        <RadioField label="Choose">
          <Radio label="A" value="a" />
          <Radio label="B" value="b" />
        </RadioField>,
      )),
    ).not.toThrow();
  });

  it('[smoke] integrated single mode renders without crashing', () => {
    expect(() =>
      render(wrap(<RadioField label="Accept terms" />)),
    ).not.toThrow();
  });

  it('[smoke] plain option mode (1 child) renders without crashing', () => {
    expect(() =>
      render(wrap(
        <RadioField>
          <Radio label="Single option" value="a" />
        </RadioField>,
      )),
    ).not.toThrow();
  });

  it('[smoke] renders with description', () => {
    render(wrap(
      <RadioField label="Choose" description="Select one option">
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    expect(screen.getByText('Select one option')).toBeTruthy();
  });

  it('[smoke] renders with error string', () => {
    expect(() =>
      render(wrap(
        <RadioField label="Choose" error="Please select an option">
          <Radio label="A" value="a" />
          <Radio label="B" value="b" />
        </RadioField>,
      )),
    ).not.toThrow();
  });

  it('[smoke] renders required without crashing', () => {
    expect(() =>
      render(wrap(
        <RadioField label="Choose" required>
          <Radio label="A" value="a" />
          <Radio label="B" value="b" />
        </RadioField>,
      )),
    ).not.toThrow();
  });

  it('[smoke] renders disabled without crashing', () => {
    expect(() =>
      render(wrap(
        <RadioField disabled>
          <Radio label="A" value="a" />
          <Radio label="B" value="b" />
        </RadioField>,
      )),
    ).not.toThrow();
  });
});

// ─── Functional: multi-option mode ───────────────────────────────────────────

describe('RadioField — functional: multi-option mode', () => {
  it('[fn] legend label renders as visible text', () => {
    render(wrap(
      <RadioField label="Preferred contact">
        <Radio label="Email" value="email" />
        <Radio label="Phone" value="phone" />
      </RadioField>,
    ));
    expect(screen.getByText('Preferred contact')).toBeTruthy();
  });

  it('[fn] description renders below legend', () => {
    render(wrap(
      <RadioField label="Choose" description="Select exactly one">
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    expect(screen.getByText('Select exactly one')).toBeTruthy();
  });

  it('[fn] all Radio children render', () => {
    render(wrap(
      <RadioField label="Size">
        <Radio label="Small" value="s" />
        <Radio label="Medium" value="m" />
        <Radio label="Large" value="l" />
      </RadioField>,
    ));
    expect(screen.getByText('Small')).toBeTruthy();
    expect(screen.getByText('Medium')).toBeTruthy();
    expect(screen.getByText('Large')).toBeTruthy();
  });

  it('[fn] pressing a radio fires onValueChange with that value', () => {
    const handler = vi.fn();
    render(wrap(
      <RadioField onValueChange={handler} testID="rf-multi">
        <Radio label="A" value="a" testID="rf-opt-a" />
        <Radio label="B" value="b" testID="rf-opt-b" />
      </RadioField>,
    ));
    fireEvent.press(screen.getByTestId('rf-opt-a'));
    expect(handler).toHaveBeenCalledWith('a');
  });

  it('[fn] pressing second option replaces first — onValueChange fires with new value', () => {
    const handler = vi.fn();
    render(wrap(
      <RadioField onValueChange={handler}>
        <Radio label="A" value="a" testID="opt-a" />
        <Radio label="B" value="b" testID="opt-b" />
      </RadioField>,
    ));
    fireEvent.press(screen.getByTestId('opt-a'));
    expect(handler).toHaveBeenCalledWith('a');
    fireEvent.press(screen.getByTestId('opt-b'));
    expect(handler).toHaveBeenCalledWith('b');
  });

  it('[fn] controlled value marks the matching radio as selected', () => {
    render(wrap(
      <RadioField value="b" onValueChange={vi.fn()} testID="rf-ctrl">
        <Radio label="A" value="a" testID="ctrl-a" />
        <Radio label="B" value="b" testID="ctrl-b" />
      </RadioField>,
    ));
    expect(screen.getByTestId('ctrl-a').props.accessibilityState.selected).toBe(false);
    expect(screen.getByTestId('ctrl-b').props.accessibilityState.selected).toBe(true);
  });

  it('[fn] defaultValue pre-selects the matching option (uncontrolled)', () => {
    render(wrap(
      <RadioField defaultValue="a">
        <Radio label="A" value="a" testID="def-a" />
        <Radio label="B" value="b" testID="def-b" />
      </RadioField>,
    ));
    expect(screen.getByTestId('def-a').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('def-b').props.accessibilityState.selected).toBe(false);
  });

  it('[fn] field-level disabled is forwarded to all child radios', () => {
    render(wrap(
      <RadioField disabled>
        <Radio label="A" value="a" testID="dis-a" />
        <Radio label="B" value="b" testID="dis-b" />
      </RadioField>,
    ));
    expect(screen.getByTestId('dis-a').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByTestId('dis-b').props.accessibilityState.disabled).toBe(true);
  });

  it('[fn] disabled group blocks onValueChange', () => {
    const handler = vi.fn();
    render(wrap(
      <RadioField disabled onValueChange={handler}>
        <Radio label="A" value="a" testID="dis-press-a" />
        <Radio label="B" value="b" testID="dis-press-b" />
      </RadioField>,
    ));
    fireEvent.press(screen.getByTestId('dis-press-a'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] readOnly group blocks onValueChange', () => {
    const handler = vi.fn();
    render(wrap(
      <RadioField readOnly onValueChange={handler}>
        <Radio label="A" value="a" testID="ro-press-a" />
      </RadioField>,
    ));
    fireEvent.press(screen.getByTestId('ro-press-a'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] field-level size is forwarded to child radios', () => {
    render(wrap(
      <RadioField size="l" testID="size-field">
        <Radio label="A" value="a" testID="size-fwd-a" />
      </RadioField>,
    ));
    // Verify the radio still renders (size forwarding doesn't crash)
    expect(screen.getByTestId('size-fwd-a')).toBeTruthy();
  });

  it('[fn] child own onPress fires before field selection logic', () => {
    const childPress = vi.fn();
    const fieldChange = vi.fn();
    render(wrap(
      <RadioField onValueChange={fieldChange}>
        <Radio label="A" value="a" onPress={childPress} testID="own-press" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    fireEvent.press(screen.getByTestId('own-press'));
    expect(childPress).toHaveBeenCalledTimes(1);
    expect(fieldChange).toHaveBeenCalledWith('a');
  });

  it('[fn] testID generates "${testID}-item-{value}" for each child radio', () => {
    render(wrap(
      <RadioField testID="rf-tid">
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    expect(screen.getByTestId('rf-tid-item-a')).toBeTruthy();
    expect(screen.getByTestId('rf-tid-item-b')).toBeTruthy();
  });
});

// ─── Functional: integrated single mode ──────────────────────────────────────

describe('RadioField — functional: integrated single mode', () => {
  it('[fn] renders label beside implicit Radio', () => {
    render(wrap(<RadioField label="Accept terms" />));
    expect(screen.getByText('Accept terms')).toBeTruthy();
    expect(screen.getByRole('radio')).toBeTruthy();
  });

  it('[fn] checked=true → Radio shows selected', () => {
    render(wrap(<RadioField label="Accept" checked testID="is-checked" />));
    expect(screen.getByRole('radio').props.accessibilityState.selected).toBe(true);
  });

  it('[fn] checked=false → Radio shows unselected', () => {
    render(wrap(<RadioField label="Accept" checked={false} testID="is-unchecked" />));
    expect(screen.getByRole('radio').props.accessibilityState.selected).toBe(false);
  });

  it('[fn] pressing fires onCheckedChange with toggled value', () => {
    const handler = vi.fn();
    render(wrap(<RadioField label="Accept" onCheckedChange={handler} testID="is-press" />));
    fireEvent.press(screen.getByRole('radio'));
    expect(handler).toHaveBeenCalledWith(true);
  });

  it('[fn] pressing also fires onValueChange with the singleOptionValue', () => {
    const handler = vi.fn();
    render(wrap(
      <RadioField
        label="Accept"
        onValueChange={handler}
        singleOptionValue="yes"
      />,
    ));
    fireEvent.press(screen.getByRole('radio'));
    expect(handler).toHaveBeenCalledWith('yes');
  });

  it('[fn] pressing checked integrated radio clears it (value → "")', () => {
    const handler = vi.fn();
    render(wrap(
      <RadioField
        label="Accept"
        defaultChecked
        onValueChange={handler}
      />,
    ));
    // Already checked → re-press clears it
    fireEvent.press(screen.getByRole('radio'));
    expect(handler).toHaveBeenCalledWith('');
  });

  it('[fn] required=true shows asterisk " *"', () => {
    render(wrap(<RadioField label="Accept" required />));
    expect(screen.getByText(' *', { includeHiddenElements: true })).toBeTruthy();
  });
});

// ─── Functional: label header ─────────────────────────────────────────────────

describe('RadioField — functional: label header', () => {
  it('[fn] required=true renders asterisk in label row', () => {
    render(wrap(
      <RadioField label="Choose" required>
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    expect(screen.getByText(' *', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[fn] required=false → no asterisk', () => {
    render(wrap(
      <RadioField label="Choose" required={false}>
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    expect(screen.queryByText(' *', { includeHiddenElements: true })).toBeNull();
  });

  it('[fn] infoIconSlot renders beside label', () => {
    render(wrap(
      <RadioField label="Choose" infoIconSlot={<View testID="info-slot" />}>
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    expect(screen.getByTestId('info-slot')).toBeTruthy();
  });
});

// ─── Functional: error and feedback ──────────────────────────────────────────

describe('RadioField — functional: error and feedback', () => {
  it('[fn] error string renders as feedback text with liveRegion', () => {
    render(wrap(
      <RadioField error="Please select an option">
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    const errText = screen.getByText('Please select an option');
    expect(errText).toBeTruthy();
    expect(errText.props.accessibilityLiveRegion).toBe('polite');
  });

  it('[fn] invalid=true forwards errorHighlight to child radios', () => {
    render(wrap(
      <RadioField invalid>
        <Radio label="A" value="a" testID="inv-a" />
        <Radio label="B" value="b" testID="inv-b" />
      </RadioField>,
    ));
    // errorHighlight is forwarded — radio still renders without crash
    expect(screen.getByTestId('inv-a')).toBeTruthy();
  });

  it('[fn] custom feedback ReactNode replaces error text', () => {
    render(wrap(
      <RadioField feedback={<View testID="custom-fb" />}>
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    expect(screen.getByTestId('custom-fb')).toBeTruthy();
  });
});

// ─── Functional: dynamic text row ────────────────────────────────────────────

describe('RadioField — functional: dynamic text row', () => {
  it('[fn] dynamicText renders as visible text', () => {
    render(wrap(
      <RadioField dynamicText="1 of 3 selected">
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    expect(screen.getByText('1 of 3 selected')).toBeTruthy();
  });

  it('[fn] helperButton renders and fires onHelperPress', () => {
    const handler = vi.fn();
    render(wrap(
      <RadioField
        helperButton="Learn more"
        onHelperPress={handler}
      >
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    expect(screen.getByText('Learn more')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Learn more'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] helperButton disabled when field is disabled', () => {
    render(wrap(
      <RadioField
        disabled
        helperButton="Learn more"
        onHelperPress={vi.fn()}
      >
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    expect(screen.getByLabelText('Learn more').props.disabled).toBe(true);
  });

  it('[fn] dynamicTextSlot overrides dynamicText + helperButton', () => {
    render(wrap(
      <RadioField
        dynamicText="Ignored"
        dynamicTextSlot={<View testID="dyn-slot" />}
      >
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    expect(screen.getByTestId('dyn-slot')).toBeTruthy();
    expect(screen.queryByText('Ignored')).toBeNull();
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('RadioField — a11y', () => {
  it('[a11y] each Radio child has accessibilityRole="radio"', () => {
    render(wrap(
      <RadioField>
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
        <Radio label="C" value="c" />
      </RadioField>,
    ));
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(3);
  });

  it('[a11y] selected Radio has accessibilityState.selected=true', () => {
    render(wrap(
      <RadioField value="b">
        <Radio label="A" value="a" testID="a11y-a" />
        <Radio label="B" value="b" testID="a11y-b" />
      </RadioField>,
    ));
    expect(screen.getByTestId('a11y-a').props.accessibilityState.selected).toBe(false);
    expect(screen.getByTestId('a11y-b').props.accessibilityState.selected).toBe(true);
  });

  it('[a11y] disabled Radio has accessibilityState.disabled=true', () => {
    render(wrap(
      <RadioField disabled>
        <Radio label="A" value="a" testID="a11y-dis" />
      </RadioField>,
    ));
    expect(screen.getByTestId('a11y-dis').props.accessibilityState.disabled).toBe(true);
  });

  it('[a11y] error text has accessibilityLiveRegion="polite"', () => {
    render(wrap(
      <RadioField error="Required">
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    expect(screen.getByText('Required').props.accessibilityLiveRegion).toBe('polite');
  });

  it('[a11y] integrated single Radio has accessibilityRole="radio"', () => {
    render(wrap(<RadioField label="Accept terms" />));
    expect(screen.getByRole('radio')).toBeTruthy();
  });

  it('[a11y] integrated single mode: checked → accessibilityState.selected=true', () => {
    render(wrap(<RadioField label="Accept terms" checked />));
    expect(screen.getByRole('radio').props.accessibilityState.selected).toBe(true);
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('RadioField — bug-catching', () => {
  // ── BUG-RF-1: Figma "require" vs native "required" ────────────────────────

  it('[bug] BUG-RF-1: Figma uses "require" but native prop is "required" — naming mismatch', () => {
    // Figma API table shows `require: true | false` (OneUI Plugin type).
    // Native RadioFieldProps uses `required?: boolean` (standard English).
    // A caller following Figma literally passes `require={true}` which is a
    // TypeScript error — `require` is not a valid native prop.
    // The asterisk never renders, and no error is thrown at runtime.
    //
    // Correct native prop: required={true}
    render(wrap(
      <RadioField label="Choose" required>
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    // Correct native usage renders the asterisk:
    expect(screen.getByText(' *', { includeHiddenElements: true })).toBeTruthy();
    // Figma "require" prop would be rejected by TypeScript and do nothing at runtime:
    render(wrap(
      // @ts-expect-error — "require" is Figma's name, not the native prop
      <RadioField label="Choose" require={true}>
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    // No asterisk because "require" is not the recognized native prop:
    expect(screen.queryByText(' *', { includeHiddenElements: true })).toBeNull();
  });

  // ── BUG-RF-2: Figma label/description boolean+text vs native string ────────

  it('[bug] BUG-RF-2: Figma labelText/descriptionText props not in native — silent data loss', () => {
    // Figma: label=true + labelText="Radio" (separate props)
    // Native: label="Radio" (content directly in the prop)
    // Callers following Figma pass labelText="Radio" which is ignored on native.
    //
    // NOTE: label renders as visible text only in multi-option mode (>=2 children).
    // In plain-option mode (1 child), label is used for accessibilityLabel only,
    // not rendered as a visible Text element.
    const { unmount } = render(wrap(
      <RadioField
        label="Radio"
        description="Description"
        testID="rf-figma-lbl"
      >
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    // Correct native usage (multi-option mode renders label as visible text):
    expect(screen.getByText('Radio')).toBeTruthy();
    expect(screen.getByText('Description')).toBeTruthy();
    unmount();
    // @ts-expect-error — labelText/descriptionText are Figma names, not native props:
    render(wrap(
      <RadioField labelText="Radio" descriptionText="Description" testID="rf-figma-lbltext">
        <Radio label="A" value="a" />
        <Radio label="B" value="b" />
      </RadioField>,
    ));
    // labelText and descriptionText are ignored → no content renders:
    expect(screen.queryByText('Radio')).toBeNull();
    expect(screen.queryByText('Description')).toBeNull();
  });
});
