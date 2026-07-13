/**
 * Radio QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/Radio/Radio.native.tsx
 *
 * ─── Props ────────────────────────────────────────────────────────────────────
 *
 *   size         's' | 'm' (default) | 'l'
 *   appearance   'auto'(→secondary) | 9 semantic roles
 *   checked      boolean — controlled state
 *   defaultChecked boolean — uncontrolled initial state
 *   onChange     (checked: boolean) => void — fires after onPress
 *   onPress      () => void — raw press, fires BEFORE onChange
 *   disabled     boolean — blocks press, accessibilityState.disabled=true
 *   readOnly     boolean — blocks press, accessibilityState.disabled=false (BUG)
 *   label        string — visible label text beside the box
 *   description  string — supplementary text below the label
 *   children     ReactNode — alternative label when `label` is not set
 *   value        string — identifier used by RadioField to map options
 *   accent       deprecated — silently ignored
 *   aria-label / aria-labelledby / aria-describedby / aria-hidden / accessibilityHint
 *   testID
 *
 * ─── A11y model ──────────────────────────────────────────────────────────────
 *
 *   accessibilityRole='radio'                (RN radio button)
 *   accessibilityState.selected=true|false   (checked state → SELECTED, not checked)
 *   accessibilityState.disabled=true         only for disabled=true (not readOnly)
 *   accessible=true by default               Pressable IS in the a11y tree
 *
 *   Key difference from Checkbox: Radio uses `selected` (not `checked`) in
 *   accessibilityState, and getByRole('radio') works directly.
 *
 * ─── Box dimensions ──────────────────────────────────────────────────────────
 *
 *   s → box 16px  dot  8px
 *   m → box 20px  dot 10px   (default)
 *   l → box 24px  dot 12px
 *
 * ─── Bugs (raise to dev team) ────────────────────────────────────────────────
 *
 *   BUG-RADIO-1 · ariaProps from useRadioState computed but never applied
 *     useRadioState returns ariaProps: { 'aria-disabled'?: true, 'aria-readonly'?: true }.
 *     Radio.native.tsx only destructures { isDisabled, isReadOnly, isChecked,
 *     resolvedAppearance, resolvedSize } — ariaProps is never spread on the Pressable.
 *     'aria-readonly' is never set on any element. Screen readers have no readOnly signal.
 *     File: packages/ui-native/src/components/Radio/Radio.native.tsx:161-162
 *     Fix:  Destructure ariaProps from useRadioState and spread it on the Pressable:
 *           `<Pressable {...a11y} {...ariaProps} disabled={...} />`
 *
 *   BUG-RADIO-2 · FIXED — getRadioAccessibilityProps now sets
 *     accessibilityState.readonly: isReadOnly ? true : undefined
 *     (Radio/interface.ts:240). readOnly is no longer invisible to screen readers.
 *
 *   BUG-RADIO-3 · accent prop is @deprecated but emits no console.warn
 *     accent is "Ignored at runtime" per JSDoc but no warning is emitted in dev mode.
 *     File: packages/ui-native/src/components/Radio/interface.ts:37
 *     Fix:  Add `if (process.env.NODE_ENV !== 'production' && props.accent)
 *           console.warn('[Radio] accent is deprecated...')` in useRadioState.
 *
 *   BUG-RADIO-4 · dataAttrs from useRadioState computed but never applied on native
 *     useRadioState returns dataAttrs ({ 'data-size', 'data-appearance', ... })
 *     that are never spread onto the native View or Pressable. Dead code.
 *     File: packages/ui-native/src/components/Radio/interface.ts:186-194
 *     Fix:  Remove dataAttrs from the native useRadioState return value.
 *
 *   BUG-RADIO-5 · Figma `appearance` list excludes `sparkle` — native exposes it
 *     Figma API table shows: auto|neutral|primary|secondary|negative|positive|
 *     informative|warning (8 values, no sparkle).
 *     Native RadioAppearance inherits from ComponentAppearance which includes `sparkle`.
 *     Callers following the Figma API would not know `sparkle` is available on native.
 *     File: packages/ui-native/src/components/Radio/interface.ts:34
 *     Fix:  Either remove sparkle from native RadioAppearance (breaking) or
 *           document it as a native-only extension in the interface JSDoc.
 *
 *   BUG-RADIO-6 · Figma `label`/`description` are boolean+text vs native string props
 *     Figma API: `label: true|false` (toggle) + `labelText: <input value />` (content).
 *                `description: true|false` + `descriptionText: <input value />`.
 *     Native API: `label?: string` (content directly), `description?: string`.
 *     A caller following Figma passes `label={true}` (TypeScript error) + `labelText="Radio"`
 *     (ignored prop). The content never appears — silent data loss.
 *     File: packages/ui-native/src/components/Radio/interface.ts:64-66
 *     Fix:  Document the Figma→native prop mapping clearly:
 *           Figma `labelText` → native `label`, Figma `descriptionText` → native `description`.
 *           Figma `label: false` → omit the `label` prop on native.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { Radio } from '@ui-native/components/Radio/Radio.native';
import {
  RADIO_BOX_SIZE,
  RADIO_DOT_SIZE,
} from '@ui-native/components/Radio/Radio.styles.native';
import { wrap } from '../../utils/renderWithTheme';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZES       = ['s', 'm', 'l'] as const;

// Figma appearance list (does NOT include 'sparkle' — see BUG-RADIO-5).
// sparkle is in native RadioAppearance but absent from the Figma API table.
const FIGMA_APPEARANCES = [
  'auto', 'neutral', 'primary', 'secondary',
  'negative', 'positive', 'warning', 'informative',
] as const;

// All native appearances (includes sparkle — native extension beyond Figma).
const ALL_APPEARANCES = [...FIGMA_APPEARANCES, 'sparkle'] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flatStyle(style: unknown): Record<string, unknown> {
  if (!style) return {};
  if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
  if (typeof style === 'object') return style as Record<string, unknown>;
  return {};
}

// ─── Figma matrix: size × checked × readOnly ─────────────────────────────────
//
// Matches the Figma screenshot exactly:
//   Rows:    checked=false / checked=true
//   Columns: M · S · L (readOnly: false) | M · S · L (readOnly: true)
//
// Each cell renders with label="Radio" matching Figma's label content.

describe('Radio — Figma matrix: size × checked × readOnly', () => {
  for (const checked of [false, true] as const) {
    for (const readOnly of [false, true] as const) {
      for (const size of SIZES) {
        const cellLabel = `size="${size}" checked=${checked} readOnly=${readOnly}`;

        it(`[smoke] ${cellLabel} — renders without crashing`, () => {
          render(wrap(
            <Radio
              size={size}
              checked={checked}
              readOnly={readOnly}
              label="Radio"
              testID="matrix-radio"
            />,
          ));
          expect(screen.getByText('Radio')).toBeTruthy();
        });

        it(`[fn] ${cellLabel} — correct role and selected state`, () => {
          render(wrap(
            <Radio
              size={size}
              checked={checked}
              readOnly={readOnly}
              label="Radio"
              testID="matrix-fn"
            />,
          ));
          const el = screen.getByTestId('matrix-fn');
          expect(el.props.accessibilityRole).toBe('radio');
          expect(el.props.accessibilityState.selected).toBe(checked);
        });
      }
    }
  }
});

// ─── Figma matrix: appearance ─────────────────────────────────────────────────

describe('Radio — Figma matrix: appearance', () => {
  for (const appearance of FIGMA_APPEARANCES) {
    it(`[smoke] appearance="${appearance}" (Figma) renders without crashing`, () => {
      expect(() =>
        render(wrap(
          <Radio
            appearance={appearance}
            label="Radio"
          />,
        )),
      ).not.toThrow();
    });
  }

  it('[smoke] appearance="sparkle" renders (native extension — not in Figma API)', () => {
    // sparkle is available in native RadioAppearance but absent from Figma API table.
    // See BUG-RADIO-5.
    expect(() => render(wrap(<Radio appearance="sparkle" label="Radio" />))).not.toThrow();
  });

  it('[fn] appearance="auto" resolves to secondary (not primary)', () => {
    render(wrap(<Radio appearance="auto" testID="app-auto" />));
    expect(screen.getByTestId('app-auto')).toBeTruthy();
  });
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('Radio — smoke', () => {
  it('[smoke] renders without crashing (all defaults)', () => {
    expect(() => render(wrap(<Radio />))).not.toThrow();
  });

  it('[smoke] renders with label and description', () => {
    render(wrap(<Radio label="Accept" description="Optional detail" />));
    expect(screen.getByText('Accept')).toBeTruthy();
    expect(screen.getByText('Optional detail')).toBeTruthy();
  });

  it('[smoke] renders checked without crashing', () => {
    expect(() => render(wrap(<Radio checked />))).not.toThrow();
  });

  it('[smoke] renders disabled without crashing', () => {
    expect(() => render(wrap(<Radio disabled />))).not.toThrow();
  });

  it('[smoke] renders readOnly without crashing', () => {
    expect(() => render(wrap(<Radio readOnly />))).not.toThrow();
  });

  it('[smoke] renders all sizes', () => {
    for (const size of SIZES) {
      const { unmount } = render(wrap(<Radio size={size} label={`size ${size}`} />));
      expect(screen.getByText(`size ${size}`)).toBeTruthy();
      unmount();
    }
    render(wrap(<Radio />));
  });

  it('[smoke] renders with children label', () => {
    render(wrap(<Radio>Children label</Radio>));
    expect(screen.getByText('Children label')).toBeTruthy();
  });
});

// ─── Functional: checked state ────────────────────────────────────────────────

describe('Radio — functional: checked state', () => {
  it('[fn] checked=false → accessibilityState.selected=false', () => {
    render(wrap(<Radio checked={false} testID="r-unchecked" />));
    expect(screen.getByTestId('r-unchecked').props.accessibilityState.selected).toBe(false);
  });

  it('[fn] checked=true → accessibilityState.selected=true', () => {
    render(wrap(<Radio checked testID="r-checked" />));
    expect(screen.getByTestId('r-checked').props.accessibilityState.selected).toBe(true);
  });

  it('[fn] defaultChecked=true starts as selected (uncontrolled)', () => {
    render(wrap(<Radio defaultChecked testID="r-default" />));
    expect(screen.getByTestId('r-default').props.accessibilityState.selected).toBe(true);
  });

  it('[fn] defaultChecked=false starts as unselected', () => {
    render(wrap(<Radio defaultChecked={false} testID="r-def-false" />));
    expect(screen.getByTestId('r-def-false').props.accessibilityState.selected).toBe(false);
  });

  it('[fn] controlled: selected prop drives state, press does not flip it', () => {
    const handler = vi.fn();
    render(wrap(<Radio checked={false} onChange={handler} testID="r-ctrl" />));
    fireEvent.press(screen.getByTestId('r-ctrl'));
    expect(handler).toHaveBeenCalledWith(true);
    // Still false because controlled externally:
    expect(screen.getByTestId('r-ctrl').props.accessibilityState.selected).toBe(false);
  });

  it('[fn] uncontrolled: press toggles internal state (false → true)', () => {
    render(wrap(<Radio testID="r-unc" />));
    expect(screen.getByTestId('r-unc').props.accessibilityState.selected).toBe(false);
    fireEvent.press(screen.getByTestId('r-unc'));
    expect(screen.getByTestId('r-unc').props.accessibilityState.selected).toBe(true);
  });
});

// ─── Functional: events ───────────────────────────────────────────────────────

describe('Radio — functional: events', () => {
  it('[fn] onChange fires with true on first press (unchecked → checked)', () => {
    const handler = vi.fn();
    render(wrap(<Radio onChange={handler} testID="r-change" />));
    fireEvent.press(screen.getByTestId('r-change'));
    expect(handler).toHaveBeenCalledWith(true);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] onChange fires with false when unchecking (checked → unchecked)', () => {
    const handler = vi.fn();
    render(wrap(<Radio defaultChecked onChange={handler} testID="r-uncheck" />));
    fireEvent.press(screen.getByTestId('r-uncheck'));
    expect(handler).toHaveBeenCalledWith(false);
  });

  it('[fn] onPress fires on tap', () => {
    const handler = vi.fn();
    render(wrap(<Radio onPress={handler} testID="r-press" />));
    fireEvent.press(screen.getByTestId('r-press'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] onPress fires before onChange (onPress is raw tap handler)', () => {
    const callOrder: string[] = [];
    const onPress = vi.fn(() => callOrder.push('onPress'));
    const onChange = vi.fn(() => callOrder.push('onChange'));
    render(wrap(<Radio onPress={onPress} onChange={onChange} testID="r-order" />));
    fireEvent.press(screen.getByTestId('r-order'));
    expect(callOrder).toEqual(['onPress', 'onChange']);
  });

  it('[fn] both onPress and onChange fire on each press', () => {
    const pressH = vi.fn();
    const changeH = vi.fn();
    render(wrap(<Radio onPress={pressH} onChange={changeH} testID="r-both" />));
    fireEvent.press(screen.getByTestId('r-both'));
    expect(pressH).toHaveBeenCalledTimes(1);
    expect(changeH).toHaveBeenCalledTimes(1);
  });

  it('[fn] disabled=true blocks onChange and onPress', () => {
    const pressH = vi.fn();
    const changeH = vi.fn();
    render(wrap(<Radio disabled onPress={pressH} onChange={changeH} testID="r-dis" />));
    fireEvent.press(screen.getByTestId('r-dis'));
    expect(pressH).not.toHaveBeenCalled();
    expect(changeH).not.toHaveBeenCalled();
  });

  it('[fn] readOnly=true blocks onChange and onPress', () => {
    const pressH = vi.fn();
    const changeH = vi.fn();
    render(wrap(<Radio readOnly onPress={pressH} onChange={changeH} testID="r-ro" />));
    fireEvent.press(screen.getByTestId('r-ro'));
    expect(pressH).not.toHaveBeenCalled();
    expect(changeH).not.toHaveBeenCalled();
  });

  it('[fn] multiple presses fire onChange each time', () => {
    const handler = vi.fn();
    render(wrap(<Radio onChange={handler} testID="r-multi" />));
    fireEvent.press(screen.getByTestId('r-multi'));
    fireEvent.press(screen.getByTestId('r-multi'));
    fireEvent.press(screen.getByTestId('r-multi'));
    expect(handler).toHaveBeenNthCalledWith(1, true);
    expect(handler).toHaveBeenNthCalledWith(2, false);
    expect(handler).toHaveBeenNthCalledWith(3, true);
  });
});

// ─── Functional: label and description ───────────────────────────────────────

describe('Radio — functional: label and description', () => {
  it('[fn] label prop renders as visible text', () => {
    render(wrap(<Radio label="Option A" />));
    expect(screen.getByText('Option A')).toBeTruthy();
  });

  it('[fn] children renders as label when label prop is not set', () => {
    render(wrap(<Radio>Children as label</Radio>));
    expect(screen.getByText('Children as label')).toBeTruthy();
  });

  it('[fn] label prop takes precedence over children', () => {
    render(wrap(<Radio label="Label prop">Children text</Radio>));
    expect(screen.getByText('Label prop')).toBeTruthy();
    expect(screen.queryByText('Children text')).toBeNull();
  });

  it('[fn] description renders below label', () => {
    render(wrap(<Radio label="Option" description="Some detail" />));
    expect(screen.getByText('Some detail')).toBeTruthy();
  });

  it('[fn] label Text is accessible=false (Pressable carries accessibilityLabel)', () => {
    render(wrap(<Radio label="Subscribe" testID="r-label" />));
    expect(screen.getByTestId('r-label').props.accessibilityLabel).toBe('Subscribe');
  });

  it('[fn] testID is forwarded to the Pressable (the interactive element)', () => {
    render(wrap(<Radio testID="my-radio" />));
    const el = screen.getByTestId('my-radio');
    expect(el.props.accessibilityRole).toBe('radio');
  });
});

// ─── Functional: box dimensions ──────────────────────────────────────────────

describe('Radio — functional: box dimensions', () => {
  it('[fn] size="s" → box is 16px × 16px', () => {
    render(wrap(<Radio size="s" testID="box-s" />));
    const s = flatStyle(screen.getByTestId('box-s').props.style);
    expect(s.width).toBe(RADIO_BOX_SIZE.s);
    expect(s.height).toBe(RADIO_BOX_SIZE.s);
  });

  it('[fn] size="m" → box is 20px × 20px (default)', () => {
    render(wrap(<Radio size="m" testID="box-m" />));
    const s = flatStyle(screen.getByTestId('box-m').props.style);
    expect(s.width).toBe(RADIO_BOX_SIZE.m);
    expect(s.height).toBe(RADIO_BOX_SIZE.m);
  });

  it('[fn] size="l" → box is 24px × 24px', () => {
    render(wrap(<Radio size="l" testID="box-l" />));
    const s = flatStyle(screen.getByTestId('box-l').props.style);
    expect(s.width).toBe(RADIO_BOX_SIZE.l);
    expect(s.height).toBe(RADIO_BOX_SIZE.l);
  });

  it('[fn] default size is "m"', () => {
    render(wrap(<Radio testID="box-default" />));
    const s = flatStyle(screen.getByTestId('box-default').props.style);
    expect(s.width).toBe(RADIO_BOX_SIZE.m);
  });

  it('[fn] box sizes are monotonically increasing: s < m < l', () => {
    expect(RADIO_BOX_SIZE.s).toBeLessThan(RADIO_BOX_SIZE.m);
    expect(RADIO_BOX_SIZE.m).toBeLessThan(RADIO_BOX_SIZE.l);
  });

  it('[fn] dot size is 50% of box size per size', () => {
    expect(RADIO_DOT_SIZE.s).toBe(RADIO_BOX_SIZE.s / 2);
    expect(RADIO_DOT_SIZE.m).toBe(RADIO_BOX_SIZE.m / 2);
    expect(RADIO_DOT_SIZE.l).toBe(RADIO_BOX_SIZE.l / 2);
  });
});

// ─── Functional: disabled and readOnly ───────────────────────────────────────

describe('Radio — functional: disabled and readOnly', () => {
  it('[fn] disabled=true → accessibilityState.disabled=true', () => {
    render(wrap(<Radio disabled testID="r-dis-state" />));
    expect(screen.getByTestId('r-dis-state').props.accessibilityState.disabled).toBe(true);
  });

  it('[fn] disabled=false → accessibilityState.disabled=false', () => {
    render(wrap(<Radio disabled={false} testID="r-nodis" />));
    expect(screen.getByTestId('r-nodis').props.accessibilityState.disabled).toBe(false);
  });

  it('[fn] readOnly=true → accessibilityState.disabled=false (readOnly ≠ disabled in a11y)', () => {
    // See BUG-RADIO-2: readOnly blocks interaction but a11y shows not-disabled
    render(wrap(<Radio readOnly testID="r-ro-state" />));
    expect(screen.getByTestId('r-ro-state').props.accessibilityState.disabled).toBe(false);
  });

  it('[fn] readOnly=true with checked=true → still shows selected=true', () => {
    render(wrap(<Radio readOnly checked testID="r-ro-checked" />));
    expect(screen.getByTestId('r-ro-checked').props.accessibilityState.selected).toBe(true);
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('Radio — a11y', () => {
  it('[a11y] accessibilityRole is "radio"', () => {
    render(wrap(<Radio testID="a11y-role" />));
    expect(screen.getByTestId('a11y-role').props.accessibilityRole).toBe('radio');
  });

  it('[a11y] getByRole("radio") finds the element', () => {
    render(wrap(<Radio />));
    expect(screen.getByRole('radio')).toBeTruthy();
  });

  it('[a11y] accessible=true by default (Pressable is in a11y tree)', () => {
    render(wrap(<Radio testID="a11y-acc" />));
    expect(screen.getByTestId('a11y-acc').props.accessible).toBe(true);
  });

  it('[a11y] unchecked → accessibilityState.selected=false', () => {
    render(wrap(<Radio testID="a11y-unsel" />));
    expect(screen.getByTestId('a11y-unsel').props.accessibilityState.selected).toBe(false);
  });

  it('[a11y] checked → accessibilityState.selected=true', () => {
    render(wrap(<Radio checked testID="a11y-sel" />));
    expect(screen.getByTestId('a11y-sel').props.accessibilityState.selected).toBe(true);
  });

  it('[a11y] accessibilityLabel from label prop', () => {
    render(wrap(<Radio label="Option A" testID="a11y-lbl" />));
    expect(screen.getByTestId('a11y-lbl').props.accessibilityLabel).toBe('Option A');
  });

  it('[a11y] aria-label overrides label as accessibilityLabel', () => {
    render(wrap(<Radio label="Option A" aria-label="Custom label" testID="a11y-arl" />));
    expect(screen.getByTestId('a11y-arl').props.accessibilityLabel).toBe('Custom label');
  });

  it('[a11y] accessibilityLabel prop takes highest priority', () => {
    render(wrap(
      <Radio
        label="Label"
        aria-label="Aria"
        accessibilityLabel="A11y prop"
        testID="a11y-prio"
      />,
    ));
    expect(screen.getByTestId('a11y-prio').props.accessibilityLabel).toBe('A11y prop');
  });

  it('[a11y] getByLabelText finds radio by label', () => {
    render(wrap(<Radio label="Subscribe" />));
    expect(screen.getByLabelText('Subscribe')).toBeTruthy();
  });

  it('[a11y] disabled → accessibilityState.disabled=true', () => {
    render(wrap(<Radio disabled testID="a11y-dis" />));
    expect(screen.getByTestId('a11y-dis').props.accessibilityState.disabled).toBe(true);
  });

  it('[a11y] accessibilityHint forwarded to Pressable', () => {
    render(wrap(<Radio accessibilityHint="Selects this option" testID="a11y-hint" />));
    expect(screen.getByTestId('a11y-hint').props.accessibilityHint).toBe('Selects this option');
  });

  it('[a11y] aria-hidden=true → accessible=false, accessibilityElementsHidden=true', () => {
    render(wrap(<Radio aria-hidden testID="a11y-hidden" />));
    const el = screen.getByTestId('a11y-hidden', { includeHiddenElements: true });
    expect(el.props.accessible).not.toBe(true);
    expect(el.props.accessibilityElementsHidden).toBe(true);
  });

  it('[a11y] aria-hidden element not findable by getByRole', () => {
    render(wrap(<Radio aria-hidden />));
    expect(screen.queryByRole('radio')).toBeNull();
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('Radio — bug-catching', () => {
  // ── BUG-RADIO-1: ariaProps unused → aria-readonly never set ────────────────

  it('[bug] BUG-RADIO-1: readOnly=true — aria-readonly never set on Pressable', () => {
    render(wrap(<Radio readOnly testID="bug-ro" />));
    const el = screen.getByTestId('bug-ro');
    // useRadioState returns ariaProps: { 'aria-readonly': true } for readOnly.
    // Bug: ariaProps not spread on Pressable → screen reader has no readOnly signal.
    expect(el.props['aria-readonly']).toBe(true);
  });

  it('[bug] BUG-RADIO-1: disabled=true — aria-disabled never set despite being in ariaProps', () => {
    render(wrap(<Radio disabled testID="bug-dis-aria" />));
    const el = screen.getByTestId('bug-dis-aria');
    // ariaProps['aria-disabled']=true computed but never spread
    expect(el.props['aria-disabled']).toBe(true);
  });

  // ── BUG-RADIO-2 FIXED: readOnly sets accessibilityState.readonly=true ───────

  it('[fn] BUG-RADIO-2 FIXED: readOnly=true → accessibilityState.readonly=true', () => {
    render(wrap(<Radio readOnly checked testID="bug-ro-a11y" />));
    const el = screen.getByTestId('bug-ro-a11y');
    // Fix: getRadioAccessibilityProps sets accessibilityState.readonly: isReadOnly ? true : undefined
    expect(el.props.accessibilityState?.readonly).toBe(true);
    // disabled must remain false — readOnly ≠ disabled
    expect(el.props.accessibilityState?.disabled).toBe(false);
  });

  // ── BUG-RADIO-3: accent deprecated but no warning ──────────────────────────

  it('[bug] BUG-RADIO-3: accent prop accepted without console.warn (deprecated)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(wrap(<Radio accent="primary" testID="bug-accent" />));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('accent'));
    } finally {
      warnSpy.mockRestore();
    }
  });

  // ── BUG-RADIO-4: dataAttrs dead code ──────────────────────────────────────

  it('[bug] BUG-RADIO-4: data-size and data-appearance not on native Pressable (dead code)', () => {
    render(wrap(<Radio size="l" appearance="positive" testID="bug-data" />));
    const el = screen.getByTestId('bug-data');
    expect((el.props as Record<string, unknown>)['data-size']).toBeUndefined();
    expect((el.props as Record<string, unknown>)['data-appearance']).toBeUndefined();
  });

  // ── BUG-RADIO-5: sparkle in native but not in Figma API ────────────────────

  it('[bug] BUG-RADIO-5: appearance="sparkle" works in native but absent from Figma API', () => {
    // Figma API table: auto|neutral|primary|secondary|negative|positive|warning|informative
    // Native RadioAppearance: also includes 'sparkle' (via ComponentAppearance)
    // Callers who follow Figma strictly would not know sparkle is valid on native.
    // This test documents the native extension:
    expect(() => render(wrap(<Radio appearance="sparkle" label="Radio" />))).not.toThrow();
  });

  // ── BUG-RADIO-6: Figma label/description are boolean+text vs native string ──

  it('[bug] BUG-RADIO-6: Figma label=boolean+labelText vs native label=string — API mismatch', () => {
    // Figma: label=true (toggle) + labelText="Radio" (content — separate props)
    // Native: label="Radio" (content directly)
    // A caller following Figma would try `label={true}` (TypeScript error in native)
    // and `labelText="Radio"` (ignored unrecognized prop) → no label renders.
    //
    // Correct native mapping: Figma labelText → native label, Figma label=false → omit label prop.
    //
    // This test confirms native label="Radio" works correctly:
    render(wrap(<Radio label="Radio" testID="bug-lbl" />));
    expect(screen.getByText('Radio')).toBeTruthy();
    expect(screen.getByTestId('bug-lbl').props.accessibilityLabel).toBe('Radio');
    // And confirms that an unrecognized prop "labelText" is silently ignored:
    render(wrap(
      // @ts-expect-error — labelText is Figma's prop name, not a native prop
      <Radio labelText="Radio" testID="bug-lbltext" />,
    ));
    // labelText is not recognized → no label text rendered:
    expect(screen.queryByText('Radio')).toBeNull();
  });
});
