/**
 * TouchSlider QA tests — smoke, functional, a11y, Figma matrix, state resolution.
 *
 * ─── Known dev-file bugs (raise separately) ──────────────────────────────────
 *
 * BUG-SLIDER-1 [readOnly incorrectly sets accessibilityState.disabled=true]
 *   useTouchSliderState: isDisabled = Boolean(disabled || readOnly).
 *   getTouchSliderAccessibilityProps forwards isDisabled → accessibilityState.disabled.
 *   A read-only slider should be focusable and readable by screen readers — marking
 *   it as disabled causes VoiceOver/TalkBack to skip it or announce it as "dimmed".
 *   Expected: readOnly=true → accessibilityState.disabled = false
 *   Actual:   readOnly=true → accessibilityState.disabled = true
 *   [bug] tests below are expected to FAIL until the dev file is corrected.
 *
 * BUG-SLIDER-2 [aria-labelledby routes to accessibilityHint, not accessibilityLabelledBy]
 *   getTouchSliderAccessibilityProps: accessibilityHint = props['aria-labelledby'].
 *   React Native 0.69+ exposes accessibilityLabelledBy for element association.
 *   Routing to accessibilityHint is semantically wrong — the hint field is for
 *   interaction guidance, not for referencing a labelling element by ID.
 *   Expected: a11y.accessibilityLabelledBy === 'volume-label'
 *   Actual:   a11y.accessibilityHint === 'volume-label'
 *   [bug] tests below are expected to FAIL until the dev file is corrected.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { describe, it, expect } from 'vitest';
import { TouchSlider } from '@ui-native/components/TouchSlider/TouchSlider.native';
import {
  useTouchSliderState,
  getTouchSliderAccessibilityProps,
} from '@ui-native/components/TouchSlider/interface';
import { Icon } from '@ui-native/components/Icon';
import { IcFavoriteGlyph } from '@ui-native/components/Button/buttonShowcaseJdsGlyphs';
import { wrap } from '../../utils/renderWithTheme';

// ─── Slot content helper ──────────────────────────────────────────────────────
//
// Uses the real OneUI Icon component — no raw RN host components in OneUI tests.
// Icon without aria-label sets accessible={false}+importantForAccessibility="no-hide-descendants",
// so queries need { includeHiddenElements: true } or UNSAFE_getByProps to locate it.
const SlotIcon = () => (
  <Icon icon={IcFavoriteGlyph} appearance="neutral" testID="slider-start-icon" />
);

/** Finds the control View that carries all a11y props. */
function getControl() {
  return screen.UNSAFE_getByProps({ accessibilityRole: 'adjustable' });
}

// ─── State resolution — pure function tests ────────────────────────────────────
//
// useTouchSliderState() and getTouchSliderAccessibilityProps() contain no React
// hooks; call them directly without a render context.

describe('TouchSlider — state: appearance resolution', () => {
  it('[fn] appearance="auto" resolves to "secondary"', () => {
    expect(useTouchSliderState({ appearance: 'auto' }).resolvedAppearance).toBe('secondary');
  });

  it('[fn] appearance omitted resolves to "secondary"', () => {
    expect(useTouchSliderState({}).resolvedAppearance).toBe('secondary');
  });

  it.each([
    'neutral', 'primary', 'secondary', 'negative',
    'positive', 'informative', 'warning',
  ] as const)('[fn] appearance="%s" passes through unchanged', (appearance) => {
    expect(useTouchSliderState({ appearance }).resolvedAppearance).toBe(appearance);
  });
});

describe('TouchSlider — state: orientation', () => {
  it('[fn] orientation="vertical" → isVertical=true', () => {
    expect(useTouchSliderState({ orientation: 'vertical' }).isVertical).toBe(true);
  });

  it('[fn] orientation="horizontal" → isVertical=false', () => {
    expect(useTouchSliderState({ orientation: 'horizontal' }).isVertical).toBe(false);
  });

  it('[fn] orientation omitted → isVertical=false (default: horizontal)', () => {
    expect(useTouchSliderState({}).isVertical).toBe(false);
  });
});

describe('TouchSlider — state: progressStyle', () => {
  it('[fn] progressStyle="rounded" passes through', () => {
    expect(useTouchSliderState({ progressStyle: 'rounded' }).progressStyle).toBe('rounded');
  });

  it('[fn] progressStyle="sharp" passes through', () => {
    expect(useTouchSliderState({ progressStyle: 'sharp' }).progressStyle).toBe('sharp');
  });

  it('[fn] progressStyle omitted → defaults to "rounded"', () => {
    expect(useTouchSliderState({}).progressStyle).toBe('rounded');
  });
});

describe('TouchSlider — state: disabled / readOnly', () => {
  it('[fn] disabled=true → isDisabled=true', () => {
    expect(useTouchSliderState({ disabled: true }).isDisabled).toBe(true);
  });

  it('[fn] disabled=false → isDisabled=false', () => {
    expect(useTouchSliderState({ disabled: false }).isDisabled).toBe(false);
  });

  it('[fn] readOnly=true → isReadOnly=true', () => {
    expect(useTouchSliderState({ readOnly: true }).isReadOnly).toBe(true);
  });

  it('[fn] readOnly=false → isReadOnly=false', () => {
    expect(useTouchSliderState({ readOnly: false }).isReadOnly).toBe(false);
  });

  it('[fn] both omitted → isDisabled=false, isReadOnly=false', () => {
    const s = useTouchSliderState({});
    expect(s.isDisabled).toBe(false);
    expect(s.isReadOnly).toBe(false);
  });

  it('[fn] disabled=true, readOnly=true → isDisabled=true, isReadOnly=true', () => {
    const s = useTouchSliderState({ disabled: true, readOnly: true });
    expect(s.isDisabled).toBe(true);
    expect(s.isReadOnly).toBe(true);
  });
});

describe('TouchSlider — state: value normalisation', () => {
  it('[fn] numeric value=50 → values=[50]', () => {
    expect(useTouchSliderState({ value: 50 }).values).toEqual([50]);
  });

  it('[fn] value=0 → values=[0] (falsy 0 is still a valid value)', () => {
    expect(useTouchSliderState({ value: 0 }).values).toEqual([0]);
  });

  it('[fn] value=100 → values=[100]', () => {
    expect(useTouchSliderState({ value: 100 }).values).toEqual([100]);
  });

  it('[fn] array value=[30, 70] preserved as-is', () => {
    expect(useTouchSliderState({ value: [30, 70] }).values).toEqual([30, 70]);
  });

  it('[fn] value omitted, defaultValue=25 → values=[25]', () => {
    expect(useTouchSliderState({ defaultValue: 25 }).values).toEqual([25]);
  });

  it('[fn] defaultValue as array → preserved', () => {
    expect(useTouchSliderState({ defaultValue: [10, 90] }).values).toEqual([10, 90]);
  });

  it('[fn] both value and defaultValue omitted → values=[0]', () => {
    expect(useTouchSliderState({}).values).toEqual([0]);
  });

  it('[fn] explicit value takes precedence over defaultValue', () => {
    // value prop wins — same as React controlled/uncontrolled pattern
    expect(useTouchSliderState({ value: 75, defaultValue: 25 }).values).toEqual([75]);
  });
});

// ─── A11y props — pure function tests ────────────────────────────────────────

describe('TouchSlider — a11y props: core', () => {
  it('[a11y] accessibilityRole is always "adjustable"', () => {
    const a11y = getTouchSliderAccessibilityProps({}, useTouchSliderState({}));
    expect(a11y.accessibilityRole).toBe('adjustable');
  });

  it('[a11y] accessible is always true', () => {
    const a11y = getTouchSliderAccessibilityProps({}, useTouchSliderState({}));
    expect(a11y.accessible).toBe(true);
  });

  it('[a11y] importantForAccessibility is always "yes"', () => {
    const a11y = getTouchSliderAccessibilityProps({}, useTouchSliderState({}));
    expect(a11y.importantForAccessibility).toBe('yes');
  });

  it('[a11y] aria-label maps to accessibilityLabel', () => {
    const a11y = getTouchSliderAccessibilityProps({ 'aria-label': 'Volume' }, useTouchSliderState({ 'aria-label': 'Volume' }));
    expect(a11y.accessibilityLabel).toBe('Volume');
  });

  it('[a11y] aria-label omitted → accessibilityLabel is undefined', () => {
    const a11y = getTouchSliderAccessibilityProps({}, useTouchSliderState({}));
    expect(a11y.accessibilityLabel).toBeUndefined();
  });
});

describe('TouchSlider — a11y props: value range', () => {
  it('[a11y] accessibilityValue.now reflects value prop', () => {
    const a11y = getTouchSliderAccessibilityProps({ min: 0, max: 100 }, useTouchSliderState({ value: 50 }));
    expect(a11y.accessibilityValue.now).toBe(50);
  });

  it('[a11y] accessibilityValue.now=0 for value=0 (falsy guard)', () => {
    const a11y = getTouchSliderAccessibilityProps({}, useTouchSliderState({ value: 0 }));
    expect(a11y.accessibilityValue.now).toBe(0);
  });

  it('[a11y] accessibilityValue.now=100 for value=100', () => {
    const a11y = getTouchSliderAccessibilityProps({}, useTouchSliderState({ value: 100 }));
    expect(a11y.accessibilityValue.now).toBe(100);
  });

  it('[a11y] array value uses first element for accessibilityValue.now', () => {
    const a11y = getTouchSliderAccessibilityProps({}, useTouchSliderState({ value: [30, 70] }));
    expect(a11y.accessibilityValue.now).toBe(30);
  });

  it('[a11y] accessibilityValue.min reflects min prop', () => {
    const a11y = getTouchSliderAccessibilityProps({ min: 10, max: 200 }, useTouchSliderState({ min: 10, max: 200 }));
    expect(a11y.accessibilityValue.min).toBe(10);
  });

  it('[a11y] accessibilityValue.max reflects max prop', () => {
    const a11y = getTouchSliderAccessibilityProps({ min: 0, max: 200 }, useTouchSliderState({ max: 200 }));
    expect(a11y.accessibilityValue.max).toBe(200);
  });

  it('[a11y] min/max default to 0/100 when omitted', () => {
    const a11y = getTouchSliderAccessibilityProps({}, useTouchSliderState({}));
    expect(a11y.accessibilityValue).toEqual({ min: 0, max: 100, now: 0 });
  });

  it('[a11y] custom range: min=10, max=200, value=50', () => {
    const a11y = getTouchSliderAccessibilityProps(
      { min: 10, max: 200 },
      useTouchSliderState({ value: 50, min: 10, max: 200 }),
    );
    expect(a11y.accessibilityValue).toEqual({ min: 10, max: 200, now: 50 });
  });
});

describe('TouchSlider — a11y props: disabled state', () => {
  it('[a11y] disabled=true → accessibilityState.disabled=true', () => {
    const a11y = getTouchSliderAccessibilityProps({ disabled: true }, useTouchSliderState({ disabled: true }));
    expect(a11y.accessibilityState.disabled).toBe(true);
  });

  it('[a11y] disabled=false → accessibilityState.disabled=false', () => {
    const a11y = getTouchSliderAccessibilityProps({ disabled: false }, useTouchSliderState({ disabled: false }));
    expect(a11y.accessibilityState.disabled).toBe(false);
  });

  it('[a11y] defaults → accessibilityState.disabled=false', () => {
    const a11y = getTouchSliderAccessibilityProps({}, useTouchSliderState({}));
    expect(a11y.accessibilityState.disabled).toBe(false);
  });
});

// ─── Figma matrix: orientation × progressStyle ────────────────────────────────
//
// API table axes: orientation (vertical / horizontal) ×
//                 trackStyle/trackEdge → progressStyle (rounded / sharp).
// "trackStyle" and "trackEdge" are distinct Figma properties but both map to the
// single `progressStyle` prop in native code — see API table in Figma spec.

describe('TouchSlider — Figma matrix: orientation × progressStyle', () => {
  const ORIENTATIONS = ['horizontal', 'vertical'] as const;
  const PROGRESS_STYLES = ['rounded', 'sharp'] as const;

  for (const orientation of ORIENTATIONS) {
    for (const progressStyle of PROGRESS_STYLES) {
      it(`[smoke] orientation="${orientation}" progressStyle="${progressStyle}" renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <TouchSlider
              orientation={orientation}
              progressStyle={progressStyle}
              testID="slider"
            />,
          )),
        ).not.toThrow();
      });
    }
  }
});

// ─── Figma matrix: value × orientation ───────────────────────────────────────
//
// API table: value (0 / 50 / 100) × orientation.

describe('TouchSlider — Figma matrix: value × orientation', () => {
  const VALUES = [0, 50, 100] as const;
  const ORIENTATIONS = ['horizontal', 'vertical'] as const;

  for (const value of VALUES) {
    for (const orientation of ORIENTATIONS) {
      it(`[smoke] value=${value} orientation="${orientation}" renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <TouchSlider value={value} orientation={orientation} testID="slider" />,
          )),
        ).not.toThrow();
      });
    }
  }
});

// ─── Figma matrix: start slot (none / icon) × orientation ─────────────────────
//
// API table: start (none / icon).

describe('TouchSlider — Figma matrix: start slot × orientation', () => {
  const ORIENTATIONS = ['horizontal', 'vertical'] as const;

  for (const orientation of ORIENTATIONS) {
    it(`[smoke] orientation="${orientation}" start=none renders without crashing`, () => {
      expect(() =>
        render(wrap(<TouchSlider orientation={orientation} testID="slider" />)),
      ).not.toThrow();
    });

    it(`[smoke] orientation="${orientation}" start=icon renders without crashing`, () => {
      expect(() =>
        render(wrap(
          <TouchSlider orientation={orientation} start={<SlotIcon />} testID="slider" />,
        )),
      ).not.toThrow();
    });
  }
});

// ─── Figma matrix: appearance × orientation ───────────────────────────────────
//
// API table: appearance (auto / neutral / primary / secondary /
//            negative / positive / informative / warning).

describe('TouchSlider — Figma matrix: appearance × orientation', () => {
  const APPEARANCES = [
    'auto', 'neutral', 'primary', 'secondary',
    'negative', 'positive', 'informative', 'warning',
  ] as const;
  const ORIENTATIONS = ['horizontal', 'vertical'] as const;

  for (const appearance of APPEARANCES) {
    for (const orientation of ORIENTATIONS) {
      it(`[smoke] appearance="${appearance}" orientation="${orientation}" renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <TouchSlider appearance={appearance} orientation={orientation} testID="slider" />,
          )),
        ).not.toThrow();
      });
    }
  }
});

// ─── Figma matrix: disabled / readOnly states ─────────────────────────────────

describe('TouchSlider — Figma matrix: disabled × readOnly × orientation', () => {
  for (const orientation of ['horizontal', 'vertical'] as const) {
    it(`[smoke] orientation="${orientation}" disabled renders without crashing`, () => {
      expect(() =>
        render(wrap(<TouchSlider orientation={orientation} disabled testID="slider" />)),
      ).not.toThrow();
    });

    it(`[smoke] orientation="${orientation}" readOnly renders without crashing`, () => {
      expect(() =>
        render(wrap(<TouchSlider orientation={orientation} readOnly testID="slider" />)),
      ).not.toThrow();
    });

    it(`[smoke] orientation="${orientation}" disabled + start=icon renders without crashing`, () => {
      expect(() =>
        render(wrap(
          <TouchSlider
            orientation={orientation}
            disabled
            start={<SlotIcon />}
            testID="slider"
          />,
        )),
      ).not.toThrow();
    });
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('TouchSlider — smoke', () => {
  it('[smoke] renders with all defaults (no props)', () => {
    expect(() => render(wrap(<TouchSlider testID="slider" />))).not.toThrow();
  });

  it('[smoke] accepts min, max, step', () => {
    expect(() =>
      render(wrap(<TouchSlider min={10} max={200} step={5} testID="slider" />)),
    ).not.toThrow();
  });

  it('[smoke] uncontrolled: defaultValue=50', () => {
    expect(() =>
      render(wrap(<TouchSlider defaultValue={50} testID="slider" />)),
    ).not.toThrow();
  });

  it('[smoke] uncontrolled: defaultValue as array [20, 80]', () => {
    expect(() =>
      render(wrap(<TouchSlider defaultValue={[20, 80]} testID="slider" />)),
    ).not.toThrow();
  });

  it('[smoke] controlled: value=0', () => {
    expect(() =>
      render(wrap(<TouchSlider value={0} testID="slider" />)),
    ).not.toThrow();
  });

  it('[smoke] controlled: value=50', () => {
    expect(() =>
      render(wrap(<TouchSlider value={50} testID="slider" />)),
    ).not.toThrow();
  });

  it('[smoke] controlled: value=100', () => {
    expect(() =>
      render(wrap(<TouchSlider value={100} testID="slider" />)),
    ).not.toThrow();
  });

  it('[smoke] aria-label accepted', () => {
    expect(() =>
      render(wrap(<TouchSlider aria-label="Volume" testID="slider" />)),
    ).not.toThrow();
  });

  it('[smoke] aria-labelledby accepted', () => {
    expect(() =>
      render(wrap(<TouchSlider aria-labelledby="vol-label" testID="slider" />)),
    ).not.toThrow();
  });

  it('[smoke] onValueChange callback accepted', () => {
    expect(() =>
      render(wrap(<TouchSlider onValueChange={() => {}} testID="slider" />)),
    ).not.toThrow();
  });

  it('[smoke] onValueCommitted callback accepted', () => {
    expect(() =>
      render(wrap(<TouchSlider onValueCommitted={() => {}} testID="slider" />)),
    ).not.toThrow();
  });
});

// ─── Functional ───────────────────────────────────────────────────────────────

describe('TouchSlider — functional', () => {
  it('[fn] testID is forwarded to the root View', () => {
    render(wrap(<TouchSlider testID="my-slider" />));
    expect(screen.getByTestId('my-slider')).toBeTruthy();
  });

  it('[fn] control has accessibilityRole="adjustable"', () => {
    render(wrap(<TouchSlider testID="slider" />));
    expect(getControl()).toBeTruthy();
  });

  it('[fn] control has accessible=true', () => {
    render(wrap(<TouchSlider testID="slider" />));
    expect(getControl().props.accessible).toBe(true);
  });

  it('[fn] control has importantForAccessibility="yes"', () => {
    render(wrap(<TouchSlider testID="slider" />));
    expect(getControl().props.importantForAccessibility).toBe('yes');
  });

  it('[fn] aria-label reflected on control as accessibilityLabel', () => {
    render(wrap(<TouchSlider aria-label="Brightness" testID="slider" />));
    expect(getControl().props.accessibilityLabel).toBe('Brightness');
  });

  it('[fn] accessibilityValue min/max/now set from props', () => {
    render(wrap(<TouchSlider value={30} min={0} max={100} testID="slider" />));
    expect(getControl().props.accessibilityValue).toEqual({ min: 0, max: 100, now: 30 });
  });

  it('[fn] accessibilityValue.now=0 when value=0 (not treated as missing)', () => {
    render(wrap(<TouchSlider value={0} testID="slider" />));
    expect(getControl().props.accessibilityValue?.now).toBe(0);
  });

  it('[fn] custom range accessibilityValue: min=10, max=200, value=50', () => {
    render(wrap(<TouchSlider value={50} min={10} max={200} testID="slider" />));
    expect(getControl().props.accessibilityValue).toEqual({ min: 10, max: 200, now: 50 });
  });

  it('[fn] accessibilityState.disabled=true when disabled', () => {
    render(wrap(<TouchSlider disabled testID="slider" />));
    expect(getControl().props.accessibilityState?.disabled).toBe(true);
  });

  it('[fn] accessibilityState.disabled=false when not disabled', () => {
    render(wrap(<TouchSlider testID="slider" />));
    expect(getControl().props.accessibilityState?.disabled).toBe(false);
  });

  it('[fn] disabled=true adds opacity 0.5 to root View', () => {
    render(wrap(<TouchSlider disabled testID="slider" />));
    const root = screen.getByTestId('slider');
    expect(root.props.style).toContainEqual({ opacity: 0.5 });
  });

  it('[fn] enabled slider has no opacity reduction on root', () => {
    render(wrap(<TouchSlider testID="slider" />));
    const root = screen.getByTestId('slider');
    const nonFalsy = (root.props.style as unknown[]).filter(Boolean);
    expect(nonFalsy).not.toContainEqual({ opacity: 0.5 });
  });

  it('[fn] readOnly=true adds opacity 0.5 to root (treated as disabled visually)', () => {
    render(wrap(<TouchSlider readOnly testID="slider" />));
    const root = screen.getByTestId('slider');
    expect(root.props.style).toContainEqual({ opacity: 0.5 });
  });

  it('[fn] start slot icon is present in tree when start prop provided', () => {
    render(wrap(<TouchSlider start={<SlotIcon />} testID="slider" />));
    // Icon sets accessible={false} + importantForAccessibility="no-hide-descendants"
    // when no aria-label is given — UNSAFE_getByProps bypasses that filtering.
    expect(screen.UNSAFE_getByProps({ testID: 'slider-start-icon' })).toBeTruthy();
  });

  it('[fn] no start slot in tree when start prop omitted', () => {
    render(wrap(<TouchSlider testID="slider" />));
    expect(screen.UNSAFE_queryAllByProps({ testID: 'slider-start-icon' })).toHaveLength(0);
  });

  it('[fn] start slot renders with vertical orientation', () => {
    render(wrap(
      <TouchSlider orientation="vertical" start={<SlotIcon />} testID="slider" />,
    ));
    expect(screen.UNSAFE_getByProps({ testID: 'slider-start-icon' })).toBeTruthy();
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('TouchSlider — a11y', () => {
  it('[a11y] getByLabelText works with aria-label', () => {
    render(wrap(<TouchSlider aria-label="Volume" testID="slider" />));
    expect(screen.getByLabelText('Volume')).toBeTruthy();
  });

  it('[a11y] control has adjustable role', () => {
    render(wrap(<TouchSlider testID="slider" />));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'adjustable' })).toBeTruthy();
  });

  it('[a11y] value=0: accessibilityValue.now=0 (VoiceOver reads "0 percent")', () => {
    render(wrap(<TouchSlider value={0} min={0} max={100} testID="slider" />));
    expect(getControl().props.accessibilityValue?.now).toBe(0);
  });

  it('[a11y] value=50: accessibilityValue.now=50 (VoiceOver reads "50 percent")', () => {
    render(wrap(<TouchSlider value={50} min={0} max={100} testID="slider" />));
    expect(getControl().props.accessibilityValue?.now).toBe(50);
  });

  it('[a11y] value=100: accessibilityValue.now=100 (VoiceOver reads "100 percent")', () => {
    render(wrap(<TouchSlider value={100} min={0} max={100} testID="slider" />));
    expect(getControl().props.accessibilityValue?.now).toBe(100);
  });

  it('[a11y] disabled slider correctly announced as disabled to screen readers', () => {
    render(wrap(<TouchSlider disabled testID="slider" />));
    expect(getControl().props.accessibilityState?.disabled).toBe(true);
  });

  it('[a11y] control is focusable by default (accessible=true)', () => {
    render(wrap(<TouchSlider testID="slider" />));
    expect(getControl().props.accessible).toBe(true);
  });
});

// ─── Bug-catching tests ───────────────────────────────────────────────────────
//
// These tests assert the CORRECT intended behaviour. They are expected to FAIL
// until the underlying dev-file bug is fixed. Each references the bug ID above.

describe('TouchSlider — bug-catching', () => {
  it('[bug] BUG-SLIDER-1: readOnly should NOT set accessibilityState.disabled=true', () => {
    // A read-only slider is still focusable and usable for reading — it should
    // not be announced as "dimmed" by screen readers.
    // EXPECTED: disabled=false   ACTUAL: disabled=true → test FAILS until fixed.
    const state = useTouchSliderState({ readOnly: true });
    const a11y = getTouchSliderAccessibilityProps({ readOnly: true }, state);
    expect(a11y.accessibilityState.disabled).toBe(false);
  });

  it('[bug] BUG-SLIDER-1 (rendered): readOnly slider control accessible to screen readers', () => {
    // Same bug exercised through the rendered component.
    render(wrap(<TouchSlider readOnly testID="slider" />));
    expect(getControl().props.accessibilityState?.disabled).toBe(false);
  });

  it('[bug] BUG-SLIDER-2: aria-labelledby should set accessibilityLabelledBy, not accessibilityHint', () => {
    // aria-labelledby references the ID of a labelling element (e.g. a Text node).
    // Routing it to accessibilityHint — a field for interaction guidance — is wrong.
    // EXPECTED: a11y.accessibilityLabelledBy === 'vol-label'
    // ACTUAL:   a11y.accessibilityHint === 'vol-label' → test FAILS until fixed.
    const state = useTouchSliderState({ 'aria-labelledby': 'vol-label' });
    const a11y = getTouchSliderAccessibilityProps(
      { 'aria-labelledby': 'vol-label' },
      state,
    ) as Record<string, unknown>;
    expect(a11y['accessibilityLabelledBy']).toBe('vol-label');
  });
});
